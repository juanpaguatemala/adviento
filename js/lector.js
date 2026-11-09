/* Adviento · BienCatólicos — lector de artículos dentro de la app (misma ventana, con regreso). */
(function () {
  'use strict';
  var ADV = window.ADV;
  var capa = null;
  var HOSTS = ['www.biencatolicos.com', 'biencatolicos.com'];

  ADV.esDeBienCatolicos = function (url) {
    try { var u = new URL(url, location.href); return HOSTS.indexOf(u.hostname) !== -1; } catch (e) { return false; }
  };

  function escalaLector() { return ADV.store.get('escala-lector', 1); }

  function crearCapa() {
    capa = document.createElement('div');
    capa.className = 'lector';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-label', 'Lector de artículos');
    capa.innerHTML =
      '<div class="lector-barra">' +
      '<button class="btn chico" type="button" data-l="regresar">' + ADV.ic.atras + 'Regresar</button>' +
      '<span class="titulo" data-l="titulo"></span>' +
      '<button class="icono-btn" type="button" data-l="menos" aria-label="Letra más pequeña"><b style="font-family:var(--fuente-titulo);font-size:.85rem">A−</b></button>' +
      '<button class="icono-btn" type="button" data-l="mas" aria-label="Letra más grande"><b style="font-family:var(--fuente-titulo);font-size:1.05rem">A+</b></button>' +
      '</div><div class="lector-cuerpo" data-l="cuerpo"></div>';
    document.body.appendChild(capa);
    document.body.style.overflow = 'hidden';
    capa.addEventListener('click', function (e) {
      var b = e.target.closest('[data-l]');
      if (b) {
        var a = b.getAttribute('data-l');
        if (a === 'regresar') { history.back(); return; }
        if (a === 'menos' || a === 'mas') {
          var v = Math.max(.85, Math.min(1.5, escalaLector() + (a === 'mas' ? .1 : -.1)));
          ADV.store.set('escala-lector', Math.round(v * 100) / 100);
          aplicarEscala();
          return;
        }
      }
      var enlace = e.target.closest('a[href]');
      if (enlace && enlace.closest('[data-l="cuerpo"]')) {
        var href = enlace.getAttribute('href');
        if (enlace.hasAttribute('data-externo')) return; // "Ver en BienCatólicos": navegación normal en la misma pestaña
        if (ADV.esDeBienCatolicos(href) && /\.html(\?|#|$)/.test(href)) {
          e.preventDefault();
          ADV.abrirLector(new URL(href, 'https://www.biencatolicos.com/').href);
        } else if (!/^#/.test(href)) {
          enlace.setAttribute('target', '_blank');
          enlace.setAttribute('rel', 'noopener');
        }
      }
    });
  }

  function aplicarEscala() {
    var art = capa && capa.querySelector('article');
    if (art) art.style.fontSize = (1.06 * escalaLector()) + 'rem';
  }

  function cerrarCapa() {
    if (!capa) return;
    capa.remove(); capa = null;
    document.body.style.overflow = '';
    var foco = document.getElementById('vista'); if (foco) foco.focus({ preventScroll: true });
  }

  function pintar(url, tituloSugerido) {
    if (!capa) crearCapa();
    var cuerpo = capa.querySelector('[data-l="cuerpo"]');
    capa.querySelector('[data-l="titulo"]').textContent = tituloSugerido || 'BienCatólicos.com';
    cuerpo.scrollTop = 0;
    cuerpo.innerHTML = '<article><span class="etiqueta">BienCatólicos.com</span><h1>' + ADV.esc(tituloSugerido || 'Cargando…') + '</h1>' +
      '<div class="esqueleto"><span></span><span style="width:92%"></span><span style="width:96%"></span><span style="width:70%"></span><span style="width:88%"></span></div></article>';
    aplicarEscala();
    var botonFuera = '<p style="margin-top:28px"><a class="btn claro" data-externo href="' + ADV.esc(url) + '">Ver este artículo en BienCatólicos.com</a></p>';
    if (navigator.onLine === false) {
      cuerpo.innerHTML = '<article><h1>' + ADV.esc(tituloSugerido || 'Sin conexión') + '</h1><p>Los artículos necesitan internet. Las reflexiones, retiros y posadas sí funcionan sin conexión.</p>' + botonFuera + '</article>';
      return;
    }
    fetch('/api/articulo?url=' + encodeURIComponent(url))
      .then(function (r) {
        if (r.ok) return r.json();
        return r.json().catch(function () { return {}; }).then(function (j) {
          var e = new Error('http ' + r.status); e.detalle = (j && j.detalle) ? [].concat(j.detalle).join(' · ') : ('HTTP ' + r.status); throw e;
        });
      })
      .then(function (d) {
        if (!capa) return;
        capa.querySelector('[data-l="titulo"]').textContent = d.titulo || tituloSugerido || '';
        cuerpo.innerHTML = '<article><span class="etiqueta">BienCatólicos.com' + (d.fecha ? ' · ' + ADV.esc(d.fecha) : '') + '</span>' +
          '<h1>' + ADV.esc(d.titulo || tituloSugerido || '') + '</h1>' + (d.html || '') + botonFuera + '</article>';
        aplicarEscala();
      })
      .catch(function (err) {
        if (!capa) return;
        var motivo = (err && err.detalle) ? err.detalle : (err && err.message ? err.message : '');
        cuerpo.innerHTML = '<article><span class="etiqueta">BienCatólicos.com</span><h1>' + ADV.esc(tituloSugerido || 'Artículo') + '</h1>' +
          '<p>No pudimos cargar el artículo dentro de la app en este momento.</p>' +
          '<p style="margin-top:16px"><a class="btn" data-externo href="' + ADV.esc(url) + '">' + ADV.ic.externo + 'Abrir en BienCatólicos</a></p>' +
          '<p class="sutil" style="margin-top:12px">Se abre en esta misma pestaña. Con el botón "atrás" regresas a la app, al mismo lugar.</p>' +
          (motivo ? '<p class="sutil" style="margin-top:18px;font-size:.75rem;opacity:.7">Detalle técnico: ' + ADV.esc(motivo) + '</p>' : '') + '</article>';
      });
  }

  /** Abre un artículo de BienCatólicos dentro de la app. */
  ADV.abrirLector = function (url, titulo) {
    if (!ADV.esDeBienCatolicos(url)) { location.href = url; return; }
    try { history.pushState({ lector: url, titulo: titulo || '' }, '', location.href); } catch (e) {}
    pintar(url, titulo);
  };

  window.addEventListener('popstate', function (e) {
    var st = e.state;
    if (st && st.lector) pintar(st.lector, st.titulo);
    else cerrarCapa();
  });

  // Delegación global: cualquier elemento con data-leer abre el lector.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-leer]');
    if (!el) return;
    e.preventDefault();
    ADV.abrirLector(el.getAttribute('data-leer'), el.getAttribute('data-titulo') || '');
  });

  // Si la página se recarga con el lector abierto en el historial, lo restauramos.
  ADV.restaurarLector = function () {
    var st = history.state;
    if (st && st.lector) pintar(st.lector, st.titulo);
  };
})();
