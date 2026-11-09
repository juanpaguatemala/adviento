/* Adviento · BienCatólicos — enrutador, ajustes generales y arranque. */
(function () {
  'use strict';
  var ADV = window.ADV;
  var V = ADV.vistas;
  var raiz = document.getElementById('vista');
  var rutaActual = null;

  var RUTAS = {
    hoy: function () { return V.hoy(); },
    encuentro: function (p) { return V.encuentro(p); },
    calendario: function (p) { return V.calendario(p); },
    retiros: function () { return ADV.vistaRetiros(); },
    retiro: function (p) { return ADV.vistaRetiro(p[0], p[1]); },
    domingos: function () { return V.domingos(); },
    posadas: function (p) { return V.posadas(p); },
    sanlucas: function () { return V.sanlucas(); },
    oraciones: function () { return V.oraciones(); },
    aprende: function (p) { return V.aprende(p); },
    mas: function () { return Promise.resolve(V.mas()); }
  };
  var NAV = { hoy: 'hoy', encuentro: 'hoy', calendario: 'calendario', retiros: 'retiros', retiro: 'retiros', posadas: 'posadas' };
  var TITULOS = { hoy: 'Hoy', encuentro: 'Mi encuentro diario', calendario: 'Buenas acciones', retiros: 'Retiros', retiro: 'Retiro',
    domingos: 'Domingos de Adviento', posadas: 'Posadas', sanlucas: 'San Lucas Challenge', oraciones: 'Oraciones y tradiciones', aprende: 'Aprende', mas: 'Más' };

  function leerRuta() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var partes = h.split('/').filter(Boolean).map(decodeURIComponent);
    var nombre = partes.shift() || 'hoy';
    if (!RUTAS[nombre]) nombre = 'hoy';
    return { nombre: nombre, params: partes, clave: nombre + '/' + partes.join('/') };
  }

  function pintar(mantenerScroll) {
    var r = leerRuta();
    var y = window.scrollY;
    document.documentElement.setAttribute('data-semana', String(ADV.semana()));
    document.querySelectorAll('.nav-inferior a').forEach(function (a) {
      if (a.getAttribute('data-ruta') === (NAV[r.nombre] || 'mas')) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = (TITULOS[r.nombre] || 'Adviento') + ' · Adviento · BienCatólicos';
    var cambio = rutaActual !== r.clave;
    rutaActual = r.clave;
    Promise.resolve(RUTAS[r.nombre](r.params)).then(function (res) {
      if (res == null) { location.replace('#/hoy'); return; }
      var html = typeof res === 'string' ? res : res.html;
      // Reemplazamos el nodo para soltar los manejadores de la vista anterior.
      var nuevo = raiz.cloneNode(false);
      nuevo.innerHTML = html;
      raiz.parentNode.replaceChild(nuevo, raiz);
      raiz = nuevo;
      if (res && typeof res.bind === 'function') res.bind(raiz);
      if (mantenerScroll) window.scrollTo(0, y);
      else if (cambio) { window.scrollTo(0, 0); raiz.focus({ preventScroll: true }); }
    }).catch(function (e) {
      console.error(e);
      raiz.innerHTML = '<div class="tarjeta"><h2>No se pudo cargar esta sección</h2><p>Revisa tu conexión e inténtalo de nuevo.</p><button type="button" class="btn" onclick="location.reload()">Reintentar</button></div>';
    });
  }
  ADV.recargar = function () { pintar(true); };

  /* ---------------- Ajustes: tema y tamaño de letra ---------------- */
  // El tema se guarda como texto simple porque lo lee el script del <head> antes de pintar.
  ADV.temaActual = function () { try { return localStorage.getItem('adv26-tema') || 'auto'; } catch (e) { return 'auto'; } };
  ADV.ponerTema = function (t) {
    var efectivo = t === 'auto' ? (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
    document.documentElement.setAttribute('data-theme', efectivo);
    try { if (t === 'auto') localStorage.removeItem('adv26-tema'); else localStorage.setItem('adv26-tema', t); } catch (e) {}
  };
  ADV.cambiarLetra = function (d) {
    var e = Math.max(.9, Math.min(1.35, (parseFloat(ADV.store.get('escala', 1)) || 1) + d * .075));
    e = Math.round(e * 1000) / 1000;
    document.documentElement.style.setProperty('--escala', e);
    try { localStorage.setItem('adv26-escala', String(e)); } catch (er) {}
  };
  document.getElementById('btn-tema').addEventListener('click', function () {
    ADV.ponerTema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('btn-letra').addEventListener('click', function () {
    var e = parseFloat(ADV.store.get('escala', 1)) || 1;
    ADV.cambiarLetra(e >= 1.3 ? -6 : 1);
  });

  /* ---------------- Compartir e instalar ---------------- */
  ADV.compartirApp = function () {
    var datos = { title: 'Adviento · BienCatólicos', text: 'Vive el Adviento en familia: corona digital, reflexión diaria, retiros y posadas.', url: location.origin + '/' };
    if (navigator.share) navigator.share(datos).catch(function () {});
    else ADV.copiar(datos.url);
  };
  var eventoInstalar = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); eventoInstalar = e; ADV.instalable = true;
    if (!ADV.store.get('invitado-instalar', false)) {
      ADV.store.set('invitado-instalar', true);
      setTimeout(function () {
        var b = document.createElement('div');
        b.className = 'toast'; b.style.display = 'flex'; b.style.gap = '10px'; b.style.alignItems = 'center';
        b.innerHTML = '<span>Agrega Adviento a tu pantalla de inicio</span><button type="button" class="btn chico oro" style="box-shadow:none">Agregar</button>';
        b.querySelector('button').addEventListener('click', function () { ADV.instalar(); b.remove(); });
        document.body.appendChild(b); setTimeout(function () { b.remove(); }, 9000);
      }, 4000);
    }
  });
  ADV.instalar = function () {
    if (!eventoInstalar) { ADV.toast('Usa el menú del navegador: "Agregar a pantalla de inicio"'); return; }
    eventoInstalar.prompt(); eventoInstalar = null; ADV.instalable = false;
  };

  /* ---------------- Arranque ---------------- */
  window.addEventListener('hashchange', function () { pintar(false); });
  pintar(false);
  ADV.restaurarLector();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/service-worker.js').catch(function () {}); });
  }
})();
