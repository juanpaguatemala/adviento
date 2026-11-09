/* Adviento · BienCatólicos — vistas de la app. Cada vista devuelve { html, bind } o un HTML. */
(function () {
  'use strict';
  var ADV = window.ADV;
  var esc = ADV.esc;
  var V = ADV.vistas = {};

  var LEMAS = ['Prepárate: el Adviento ya viene', 'La luz de la esperanza ya brilla', 'Preparen el camino del Señor',
    '¡Alégrate, el Señor está cerca!', 'Dios está con nosotros', 'Hoy el amor encuentra un hogar', '¡Feliz Navidad! Cristo, luz del mundo, ha nacido'];
  var ORD = ['Primer', 'Segundo', 'Tercer', 'Cuarto'];
  var PAISAJE = '<svg class="paisaje" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
    '<path d="M0 120 L0 92 Q60 80 120 90 T240 86 T400 88 L400 120 Z" fill="#0A1230"/>' +
    '<g fill="#050A1E">' +
    '<rect x="18" y="70" width="34" height="50"/><rect x="48" y="58" width="26" height="62"/><path d="M48 58 Q61 40 74 58 Z"/>' +
    '<rect x="92" y="78" width="40" height="42"/><rect x="128" y="64" width="30" height="56"/><rect x="138" y="44" width="10" height="20"/><path d="M136 44 Q143 32 150 44 Z"/>' +
    '<rect x="176" y="72" width="44" height="48"/><path d="M176 72 Q198 46 220 72 Z"/><rect x="226" y="84" width="30" height="36"/>' +
    '<rect x="266" y="66" width="36" height="54"/><rect x="300" y="78" width="40" height="42"/><path d="M300 78 Q320 60 340 78 Z"/><rect x="350" y="70" width="34" height="50"/>' +
    '<path d="M86 120 L88 70 L90 120 Z"/><path d="M89 72 q-14 -6 -22 2 q10 -10 22 -4 q-6 -12 -18 -12 q14 -2 20 10 q4 -12 16 -12 q-12 4 -14 14 q12 -6 22 2 q-12 -4 -20 2 Z"/>' +
    '<path d="M244 120 L246 76 L248 120 Z"/><path d="M247 78 q-12 -6 -20 2 q9 -9 20 -4 q-5 -11 -16 -11 q13 -2 18 9 q4 -11 15 -11 q-11 4 -13 13 q11 -6 20 2 q-11 -4 -18 2 Z"/>' +
    '</g><g fill="#E8C26A">' +
    '<rect x="28" y="84" width="5" height="7" rx="1"/><rect x="58" y="74" width="5" height="7" rx="1"/><rect x="104" y="90" width="5" height="7" rx="1"/>' +
    '<rect x="190" y="88" width="6" height="8" rx="1"/><rect x="204" y="88" width="6" height="8" rx="1"/><rect x="278" y="80" width="5" height="7" rx="1"/>' +
    '<rect x="316" y="92" width="5" height="7" rx="1"/><rect x="362" y="84" width="5" height="7" rx="1" opacity=".7"/></g></svg>';

  function ic(nombre, tam) { return ADV.ic[nombre].replace('<svg', '<svg style="width:' + (tam || 18) + 'px;height:' + (tam || 18) + 'px"'); }
  function cuentaNavidad() {
    var ms = Math.max(0, ADV.NAVIDAD_MS - ADV.ahora());
    var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
    return { d: d, h: h, m: m, fin: ms === 0 };
  }
  function cuentaHTML() {
    var c = cuentaNavidad();
    if (c.fin) return '<p style="font-family:var(--fuente-titulo);font-weight:800;font-size:1.3rem;color:var(--acento)">¡Ya es Navidad!</p>';
    return '<div class="cuenta"><div><b>' + c.d + '</b><small>' + (c.d === 1 ? 'día' : 'días') + '</small></div><div><b>' + c.h + '</b><small>horas</small></div><div><b>' + c.m + '</b><small>minutos</small></div></div>';
  }
  function acciones() { return ADV.store.get('acciones', {}); }
  function etiquetaCorona(iso) {
    var n = ADV.diaAdviento(iso), dom = ADV.diasEntre(ADV.INICIO, iso);
    if (n === 0) return 'El Adviento comienza el 29 de noviembre';
    if (n === 27) return 'Navidad';
    if (n === 26) return 'Nochebuena';
    if (dom % 7 === 0) return ORD[dom / 7] + ' domingo de Adviento' + (dom === 14 ? ' · Gaudete' : '');
    return 'Semana de la ' + ADV.SEMANAS[ADV.semana(iso)];
  }

  /* ================================ HOY ================================ */
  V.hoy = function () {
    return Promise.all(['oraciones', 'quiz', 'reflexiones', 'buenas-acciones', 'articulos', 'posadas', 'san-lucas', 'retiro-personal', 'retiro-familiar', 'retiro-pareja']
      .map(ADV.datos)).then(function (D) {
      var ora = D[0], quiz = D[1], refl = D[2], acc = D[3], art = D[4], pos = D[5], sl = D[6];
      var hoy = ADV.hoy(), n = ADV.diaAdviento(hoy), sem = ADV.semana(hoy);
      var nVista = n === 0 ? 1 : Math.min(26, n);
      var encendidas = ADV.velasEncendidas(ora, hoy);
      if (n === 27) encendidas = [true, true, true, true, true];
      var hora = ADV.horaGT();
      var saludo = hora < 12 ? 'Buenos días' : (hora < 19 ? 'Buenas tardes' : 'Buenas noches');
      var h = '';

      if (n === 0) h += '<div class="banner">El Adviento comienza en ' + ADV.diasEntre(hoy, ADV.INICIO) + ' días, el domingo 29 de noviembre. Ya puedes ver todo y prepararte.</div>';
      if (ADV.fechaSimulada) h += '<div class="banner" style="background:var(--dorado);color:var(--noche)">Modo de prueba: simulando el ' + esc(ADV.fechaLarga(hoy)) + '.</div>';

      h += '<section class="belen"><svg class="estrella-guia" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="eg"><stop offset="0" stop-color="#FFF4D0"/><stop offset=".35" stop-color="#E8C26A" stop-opacity=".55"/><stop offset="1" stop-color="#E8C26A" stop-opacity="0"/></radialGradient></defs>' +
        '<circle cx="50" cy="50" r="48" fill="url(#eg)"/><path d="M50 4 L55 45 L96 50 L55 55 L50 96 L45 55 L4 50 L45 45 Z" fill="#FFF4D0"/><path d="M50 26 L53 47 L74 50 L53 53 L50 74 L47 53 L26 50 L47 47 Z" fill="#FFFFFF" transform="rotate(45 50 50)" opacity=".8"/></svg>' +
        '<div class="texto"><p class="sutil" style="font-size:1rem">' + saludo + '</p><h1>' + esc(ADV.fechaLarga(hoy)) + '</h1>' +
        '<div class="chips" style="margin-top:10px">' +
        (n >= 1 && n <= 26 ? '<span class="chip">Día ' + n + ' de 26</span>' : '') +
        (sem >= 1 && sem <= 4 ? '<span class="chip' + (sem === 3 ? ' rosa' : '') + '">' + sem + 'ª semana · ' + ADV.SEMANAS[sem] + '</span>' : '') +
        (sem === 5 ? '<span class="chip rosa">Nochebuena</span>' : '') + (sem === 6 ? '<span class="chip rosa">Tiempo de Navidad</span>' : '') +
        '</div></div>' + PAISAJE + '</section>';

      h += '<section class="corona"><span class="etiqueta">' + esc(etiquetaCorona(hoy)) + '</span>' +
        ADV.coronaSVG(encendidas, ora.velas.map(function (v) { return v.nombre; })) +
        '<p class="lema">' + esc(LEMAS[sem]) + '</p>' +
        '<div class="leyenda">' + ora.velas.map(function (v, i) {
          return '<span><i class="' + (encendidas[i] ? 'on' : '') + '"></i>' + esc(i === 4 ? 'Navidad' : v.nombre) + (!encendidas[i] && i < 4 ? ' · ' + ADV.fechaCorta(v.desde) : '') + '</span>';
        }).join('') + '</div>' +
        '<p class="sutil" style="color:#C9BEDF;font-size:.85rem">Toca una vela para ver su significado y su oración.</p>' +
        '<button type="button" class="btn claro" data-accion="bendecir">Bendecir mi corona</button></section>';

      h += '<section class="tarjeta"><span class="etiqueta">Faltan para Navidad</span><div data-cuenta>' + cuentaHTML() + '</div></section>';

      if (n >= 18 && n <= 26) {
        var p = pos.dias[n - 18];
        h += '<a class="tarjeta sombra" href="#/posadas/' + p.dia + '" style="text-decoration:none;color:inherit;background:#2B1F45;color:#FFF8EC">' +
          '<span class="etiqueta" style="color:var(--dorado)">Posada de hoy · Día ' + p.dia + ' de 9</span><h2>' + esc(p.titulo) + '</h2><p style="color:#D9CFEA">' + esc(p.cita) + '</p>' +
          '<span class="btn oro" style="align-self:flex-start">Ir a la posada' + ic('adelante') + '</span></a>';
      }

      var r = refl[nVista - 1];
      h += '<section class="tarjeta sombra"><span class="etiqueta">' + (n === 0 ? 'Vista previa · ' : '') + 'Mi encuentro de hoy</span>' +
        '<h2>' + esc(r.titulo) + '</h2><p class="sutil">' + esc(r.cita) + (r.celebracion ? ' · ' + esc(r.celebracion) : '') + '</p>' +
        '<p class="lectura">' + esc(r.texto[0]) + '</p>' +
        '<a class="btn" href="#/encuentro/' + nVista + '" style="align-self:flex-start">Leer reflexión' + ic('adelante') + '</a></section>';

      if (n !== 27) {
        var a = acc[nVista - 1], hecha = !!acciones()[nVista];
        h += '<section class="tarjeta"><span class="etiqueta" style="color:var(--verde)">Buena acción de hoy</span>' +
          '<p style="font-size:1.1rem;font-weight:600;line-height:1.45">' + esc(a.accion) + '</p>' +
          '<button type="button" class="btn ' + (hecha ? 'verde' : 'claro') + '" data-accion="accion" data-n="' + nVista + '" style="align-self:flex-start">' +
          (hecha ? ADV.ic.check + '¡Hecha!' : 'Marcar como hecha') + '</button></section>';
      }

      h += '<section class="tarjeta luz" data-luz>' + luzHTML(ora, sem, false) + '</section>';

      h += '<section style="display:flex;flex-direction:column;gap:10px"><h2>Tus retiros</h2>';
      [D[7], D[8], D[9]].forEach(function (ret) {
        var hechos = ADV.retiroProgreso(ret.clave), dia = ADV.diaRetiroHoy();
        h += '<a class="tarjeta retiro-mini ' + ret.clave + '" href="#/retiro/' + ret.clave + '" style="gap:6px;padding:14px 16px">' +
          '<span class="tipo">Retiro ' + { personal: 'personal', familiar: 'familiar', pareja: 'de pareja' }[ret.clave] + '</span>' +
          '<span class="fila entre" style="flex-wrap:nowrap;align-items:baseline"><b style="font-family:var(--fuente-titulo);font-size:1.15rem;line-height:1.15">' + esc(ret.nombre) + '</b><span class="sutil" style="white-space:nowrap">' + hechos + '/25</span></span>' +
          '<span style="font-size:.95rem">Día ' + dia + ' · ' + esc(ret.dias[dia - 1].dinamica) + '</span>' +
          '<span class="progreso" style="flex:none;height:10px"><span style="width:' + Math.round(hechos / 25 * 100) + '%"></span></span></a>';
      });
      h += '</section>';

      var domingos = art.domingos.filter(function (d) { return hoy >= d.desde && hoy <= d.hasta; });
      if (domingos.length) {
        h += '<section class="tarjeta morada"><span class="etiqueta">Artículo del domingo</span>' +
          domingos.map(function (d) {
            return '<button type="button" class="enlace" data-leer="' + esc(d.url) + '" data-titulo="' + esc(d.titulo) + '"><span class="t">' + esc(d.titulo) + '<small>Se abre aquí mismo, sin salir de la app</small></span>' + ADV.ic.chevron + '</button>';
          }).join('') + '</section>';
      }
      if (n >= 3 && n <= 26) {
        var s = sl.dias[n - 3];
        h += '<section class="tarjeta dorada"><span class="etiqueta">San Lucas Challenge · Día ' + s.dia + '</span><h3>' + esc(s.titulo) + '</h3>' +
          '<div class="fila"><button type="button" class="btn chico" data-leer="' + esc(s.url) + '" data-titulo="' + esc('Día ' + s.dia + ': ' + s.titulo) + '">Leer el capítulo de hoy</button><a class="btn chico claro" href="#/sanlucas">Ver el reto</a></div></section>';
      }

      h += '<section style="display:flex;flex-direction:column;gap:12px"><h2>Más para tu Adviento</h2><div class="rejilla-2">' +
        '<a class="mosaico m-morado" href="#/domingos"><b>Domingos de Adviento</b><small>Artículo y bendición</small></a>' +
        '<a class="mosaico m-noche" href="#/posadas"><b>Posadas</b><small>Del 16 al 24 de diciembre</small></a>' +
        '<a class="mosaico m-oro" href="#/sanlucas"><b>San Lucas Challenge</b><small>24 capítulos, del 1 al 24</small></a>' +
        '<a class="mosaico m-rosa" href="#/aprende"><b>Aprende</b><small>Quiz, artículos y videos</small></a>' +
        '<a class="mosaico m-papel" href="#/oraciones"><b>Oraciones y tradiciones</b><small>Velas, pesebre, Nochebuena</small></a>' +
        '<a class="mosaico m-verde" href="#/calendario"><b>Buenas acciones</b><small>' + Object.keys(acciones()).filter(function (k) { return acciones()[k]; }).length + ' de 26 hechas</small></a>' +
        '</div></section>';

      return {
        html: h,
        bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var vela = e.target.closest('[data-vela]');
            if (vela) { var i = +vela.getAttribute('data-vela'); ADV.mostrarVela(ora, quiz, i, encendidas[i]); return; }
            var t = e.target.closest('[data-accion]'); if (!t) return;
            var a = t.getAttribute('data-accion');
            if (a === 'bendecir') ADV.mostrarBendicion(ora);
            else if (a === 'accion') {
              var k = t.getAttribute('data-n'), m = acciones(); m[k] = !m[k]; ADV.store.set('acciones', m);
              if (m[k]) ADV.confeti(); ADV.recargar();
            } else if (a === 'encender') {
              var inp = raiz.querySelector('#intencion');
              ADV.luz.encender(inp ? inp.value.trim() : '');
              raiz.querySelector('[data-luz]').innerHTML = luzHTML(ora, sem, true);
            } else if (a === 'apagar') {
              ADV.luz.apagar(); raiz.querySelector('[data-luz]').innerHTML = luzHTML(ora, sem, false);
            }
          });
          raiz.addEventListener('keydown', function (e) {
            var vela = e.target.closest && e.target.closest('[data-vela]');
            if (vela && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var i = +vela.getAttribute('data-vela'); ADV.mostrarVela(ora, quiz, i, encendidas[i]); }
          });
          var caja = raiz.querySelector('[data-cuenta]');
          var t = setInterval(function () { if (!document.body.contains(caja)) { clearInterval(t); return; } caja.innerHTML = cuentaHTML(); }, 30000);
        }
      };
    });
  };

  function luzHTML(ora, sem, recien) {
    var on = ADV.luz.encendidaHoy(), total = ADV.luz.total();
    var vela = ora.velas[Math.max(0, Math.min(4, (sem >= 5 ? 5 : sem) - 1))];
    var h = '<h2>Enciende tu luz</h2><p>¿No tienes corona en casa? Enciende aquí tu luz por alguien que amas.</p>' + ADV.velaSVG(on, recien);
    if (on) {
      var intencion = ADV.luz.estado().intencion;
      h += '<p class="mensaje">Tu luz está encendida. Que ilumine tu hogar y a quienes amas.</p>' +
        (intencion ? '<p class="sutil">Por: ' + esc(intencion) + '</p>' : '') +
        '<p class="lectura" style="font-style:italic">' + esc(vela.oracion) + '</p>' +
        '<button type="button" class="btn chico claro" data-accion="apagar">Apagar mi vela</button>';
    } else {
      h += '<div style="width:100%;text-align:left"><label class="etq-campo" for="intencion">¿Por quién o por qué enciendes tu luz hoy?</label>' +
        '<input type="text" id="intencion" maxlength="120" placeholder="Opcional · se queda en tu celular"></div>' +
        '<button type="button" class="btn oro" data-accion="encender" style="font-size:1.1rem">Encender mi luz</button>';
    }
    h += '<p class="sutil">' + (total ? 'Has encendido tu luz ' + total + (total === 1 ? ' día' : ' días') + ' este Adviento' : 'Tu luz se queda encendida todo el día') + '</p>';
    return h;
  }

  /* ========================== MI ENCUENTRO DIARIO ========================== */
  V.encuentro = function (p) {
    return ADV.datos('reflexiones').then(function (refl) {
      var hoyN = ADV.diaAdviento();
      var n = parseInt(p[0], 10); if (!(n >= 1 && n <= 26)) n = hoyN === 0 ? 1 : Math.min(26, hoyN);
      var r = refl[n - 1], vividos = ADV.store.get('encuentros', {});
      var h = '<section><span class="etiqueta">Mi encuentro diario con Jesús</span><div class="tira" aria-label="Días">';
      refl.forEach(function (x) {
        var cls = vividos[x.dia] ? 'hecho' : (x.dia === hoyN ? 'hoy' : (x.dia > hoyN ? 'futuro' : ''));
        h += '<button type="button" data-ir="' + x.dia + '" class="' + cls + '"' + (x.dia === n ? ' aria-current="true"' : '') + ' aria-label="Día ' + x.dia + '"><small>' + ADV.fechaCorta(x.fecha) + '</small><b>' + x.dia + '</b><small>' + (vividos[x.dia] ? '✓' : (x.dia === hoyN ? 'hoy' : '')) + '</small></button>';
      });
      h += '</div></section>';
      h += '<article style="display:flex;flex-direction:column;gap:16px"><div><span class="sutil">Día ' + n + ' · ' + esc(ADV.fechaLarga(r.fecha)) + '</span>' +
        '<h1 style="margin-top:4px">' + esc(r.titulo) + '</h1>' + (r.celebracion ? '<div class="chips" style="margin-top:8px"><span class="chip rosa">' + esc(r.celebracion) + '</span></div>' : '') + '</div>' +
        '<span class="cita">' + ic('libro') + 'Palabra de Dios: ' + esc(r.cita) + '</span>' +
        '<div class="lectura">' + ADV.parrafos(r.texto) + '</div>' +
        '<section class="tarjeta dorada"><span class="etiqueta">Para reflexionar</span><p style="font-size:1.1rem;font-weight:600">' + esc(r.reflexionar) + '</p></section>' +
        '<section class="tarjeta oscura"><span class="etiqueta">Oración</span><div class="lectura" style="font-style:italic">' + ADV.parrafos(r.oracion) + '</div></section>' +
        '<section class="tarjeta"><span class="etiqueta" style="color:var(--verde)">Propósito</span><p style="font-weight:600">' + esc(r.proposito) + '</p></section>' +
        '<button type="button" class="btn bloque ' + (vividos[n] ? 'verde' : 'oro') + '" data-vivido style="min-height:54px">' + (vividos[n] ? ADV.ic.check + 'Lo viví hoy' : 'Lo viví hoy') + '</button>' +
        '<div class="fila entre">' + (n > 1 ? '<a class="btn chico claro" href="#/encuentro/' + (n - 1) + '">' + ADV.ic.atras + 'Día ' + (n - 1) + '</a>' : '<span></span>') +
        (n < 26 ? '<a class="btn chico claro" href="#/encuentro/' + (n + 1) + '">Día ' + (n + 1) + ADV.ic.adelante + '</a>' : '') + '</div></article>';
      return {
        html: h, bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var t = e.target.closest('[data-ir],[data-vivido]'); if (!t) return;
            if (t.hasAttribute('data-ir')) { location.hash = '#/encuentro/' + t.getAttribute('data-ir'); return; }
            var v = ADV.store.get('encuentros', {}); v[n] = !v[n]; ADV.store.set('encuentros', v); if (v[n]) ADV.confeti(); ADV.recargar();
          });
          var a = raiz.querySelector('.tira [aria-current="true"]'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      };
    });
  };

  /* ======================= CALENDARIO DE BUENAS ACCIONES ======================= */
  V.calendario = function (p) {
    return ADV.datos('buenas-acciones').then(function (acc) {
      var hoyN = ADV.diaAdviento(), m = acciones();
      var sel = parseInt(p[0], 10); if (!(sel >= 1 && sel <= 26)) sel = hoyN === 0 ? 1 : Math.min(26, hoyN);
      var total = acc.filter(function (a) { return m[a.dia]; }).length;
      var s = acc[sel - 1], hecha = !!m[sel];
      var h = '<section><span class="etiqueta">29 de noviembre – 24 de diciembre</span><h1>Calendario de buenas acciones</h1>' +
        '<p class="sutil" style="margin-top:6px">26 pequeñas obras de amor, una por día.</p>' +
        '<div class="fila" style="margin-top:12px;flex-wrap:nowrap"><span class="progreso"><span style="width:' + Math.round(total / 26 * 100) + '%"></span></span><b style="font-family:var(--fuente-titulo)">' + total + ' de 26</b></div>' +
        (total ? '<div class="estrellas" aria-label="' + total + ' estrellas" style="margin-top:6px">' + new Array(total + 1).join('★') + '</div>' : '') + '</section>';
      h += '<section class="tarjeta sombra" aria-live="polite"><span class="etiqueta">' + esc(ADV.fechaLarga(s.fecha)) + (sel === hoyN ? ' · Hoy' : '') + '</span>' +
        '<p style="font-size:1.15rem;font-weight:600;line-height:1.45">' + esc(s.accion) + '</p>' +
        '<button type="button" class="btn ' + (hecha ? 'verde' : 'claro') + '" data-marcar style="align-self:flex-start">' + (hecha ? ADV.ic.check + '¡Hecha!' : 'Marcar como hecha') + '</button></section>';
      [1, 2, 3, 4].forEach(function (w) {
        var dias = acc.filter(function (a) { return a.semana === w; });
        var hechas = dias.filter(function (a) { return m[a.dia]; }).length;
        h += '<section><div class="semana-cab' + (w === 3 ? ' rosa' : '') + '"><b>' + w + 'ª semana · ' + ADV.SEMANAS[w] + '</b><small>' + ADV.fechaCorta(dias[0].fecha) + ' – ' + ADV.fechaCorta(dias[dias.length - 1].fecha) + ' · ' + hechas + '/' + dias.length + '</small></div><div class="casillas">';
        dias.forEach(function (a) {
          var est = m[a.dia] ? 'hecha' : (a.dia === hoyN ? 'hoy' : (a.dia > hoyN ? 'futura' : 'pendiente'));
          var f = a.fecha.split('-');
          h += '<button type="button" class="casilla ' + est + (w === 3 && m[a.dia] ? ' rosa' : '') + '" data-dia="' + a.dia + '"' + (a.dia === sel ? ' aria-current="true"' : '') +
            ' aria-label="' + esc(ADV.fechaLarga(a.fecha)) + ', ' + { hecha: 'hecha', hoy: 'hoy', futura: 'próxima', pendiente: 'pendiente' }[est] + '">' +
            '<small>' + (f[1] === '11' ? 'nov' : 'dic') + '</small><b>' + (+f[2]) + '</b>' +
            (est === 'hecha' ? ADV.ic.check : (est === 'hoy' ? '<em>hoy</em>' : (est === 'pendiente' ? '<em>pendiente</em>' : ADV.ic.candado))) + '</button>';
        });
        h += '</div></section>';
      });
      h += '<p class="sutil">Los días pendientes se pueden completar cuando quieras. Los próximos se pueden leer desde ya.</p>';
      return {
        html: h, bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var c = e.target.closest('[data-dia]');
            if (c) { history.replaceState(history.state, '', '#/calendario/' + c.getAttribute('data-dia')); ADV.recargar(); return; }
            if (e.target.closest('[data-marcar]')) {
              var mm = acciones(); mm[sel] = !mm[sel]; ADV.store.set('acciones', mm);
              if (mm[sel]) {
                var w = s.semana, delaSemana = acc.filter(function (a) { return a.semana === w; });
                var todas = acc.every(function (a) { return mm[a.dia]; });
                if (todas) ADV.toast('¡Completaste las 26 buenas acciones!');
                else if (delaSemana.every(function (a) { return mm[a.dia]; })) ADV.toast('¡Semana de la ' + ADV.SEMANAS[w] + ' completa!');
                ADV.confeti();
              }
              ADV.recargar();
            }
          });
        }
      };
    });
  };

  /* ============================== DOMINGOS ============================== */
  V.domingos = function () {
    return Promise.all([ADV.datos('articulos'), ADV.datos('oraciones')]).then(function (D) {
      var art = D[0], ora = D[1], hoy = ADV.hoy(), despues = ADV.diaAdviento(hoy) === 27;
      var actuales = art.domingos.filter(function (d) { return hoy >= d.desde && hoy <= d.hasta; });
      var proximos = art.domingos.filter(function (d) { return hoy < d.desde; });
      var h = '<section><span class="etiqueta">Domingos de Adviento y Nochebuena</span><h1>Domingos de Adviento</h1>' +
        '<p class="sutil" style="margin-top:6px">Cada domingo aparece su artículo. Cuando pasa la fecha, deja su lugar al siguiente.</p></section>';
      if (actuales.length) {
        h += '<section class="tarjeta sombra rosa"><span class="etiqueta" style="color:var(--rosa-tinta)">Esta semana</span>' +
          actuales.map(function (d) {
            return '<button type="button" class="enlace" data-leer="' + esc(d.url) + '" data-titulo="' + esc(d.titulo) + '"><span class="t">' + esc(d.titulo) + '<small>Artículo · BienCatólicos.com</small></span>' + ADV.ic.chevron + '</button>';
          }).join('') + '</section>';
      } else if (despues) {
        h += '<section class="tarjeta"><span class="etiqueta">¡Feliz Navidad!</span><p>El Adviento terminó. Puedes volver a leer los artículos:</p>' +
          art.domingos.map(function (d) { return '<button type="button" class="enlace" data-leer="' + esc(d.url) + '" data-titulo="' + esc(d.titulo) + '"><span class="t">' + esc(d.titulo) + '</span>' + ADV.ic.chevron + '</button>'; }).join('') + '</section>';
      }
      if (proximos.length) {
        h += '<section class="lista-enlaces"><h2>Próximos</h2>' + proximos.map(function (d) {
          return '<div class="enlace bloqueado"><span class="t">' + esc(d.titulo) + '<small>Se abre el ' + esc(ADV.fechaLarga(d.desde)) + '</small></span>' + ADV.ic.candado + '</div>';
        }).join('') + '</section>';
      }
      h += '<section class="tarjeta oscura"><span class="etiqueta">Bendición de la corona de Adviento</span><p class="lectura" style="font-style:italic;white-space:pre-line">' + esc(ora.bendicion.join('\n')) + '</p></section>';
      h += '<button type="button" class="enlace" data-leer="' + esc(ora.rosario.url) + '" data-titulo="Rosario de Adviento"><span class="t">Rosario de Adviento<small>Para rezar en familia cualquier día</small></span>' + ADV.ic.chevron + '</button>';
      return h;
    });
  };

  /* ============================== POSADAS ============================== */
  V.posadas = function (p) {
    return ADV.datos('posadas').then(function (P) {
      var hoyN = ADV.diaAdviento() - 17; // 16 dic = día 1
      var n = parseInt(p[0], 10); if (!(n >= 1 && n <= 9)) n = hoyN >= 1 && hoyN <= 9 ? hoyN : 1;
      var d = P.dias[n - 1];
      var h = '<header class="posadas-cab"><div class="fila entre" style="flex-wrap:nowrap"><div><div style="font-family:var(--fuente-titulo);font-weight:800;font-size:1.6rem;line-height:1">Posadas</div>' +
        '<div style="color:#D9CFEA;font-size:.9rem">Del 16 al 24 de diciembre</div></div>' +
        '<button type="button" class="btn chico" data-proyectar style="background:transparent;border-color:var(--dorado);color:var(--dorado)">' + ADV.ic.pantalla + 'Proyectar</button></div>';
      if (hoyN < 1) h += '<p style="background:#3D2E5E;border-radius:12px;padding:8px 12px;color:#FFE7B0;font-size:.92rem">Faltan ' + (1 - hoyN) + (1 - hoyN === 1 ? ' día' : ' días') + ' para la primera posada. Ya puedes leerlas y prepararte.</p>';
      h += '<div class="tira" aria-label="Días de posada">' + P.dias.map(function (x) {
        return '<button type="button" data-posada="' + x.dia + '" class="' + (x.dia === hoyN ? 'hoy' : '') + '"' + (x.dia === n ? ' aria-current="true"' : '') + ' aria-label="Posada ' + x.dia + ', ' + ADV.fechaLarga(x.fecha, false) + '"><small>' + ADV.fechaCorta(x.fecha) + '</small><b>' + x.dia + '</b><small>' + (x.dia === hoyN ? 'hoy' : '') + '</small></button>';
      }).join('') + '</div></header>';
      h += '<details class="tarjeta"><summary style="font-family:var(--fuente-titulo);font-weight:800;cursor:pointer">¿Qué son las posadas?</summary><div class="lectura">' +
        P.intro.map(function (x) { return /\?$|^Posadas en Guatemala$/.test(x) ? '<h3 style="margin-top:12px">' + esc(x) + '</h3>' : '<p>' + esc(x) + '</p>'; }).join('') + '</div></details>';
      h += '<article data-posada-art style="display:flex;flex-direction:column;gap:16px">' +
        '<details class="tarjeta"><summary style="font-family:var(--fuente-titulo);font-weight:800;cursor:pointer">Rito inicial (todos los días)</summary><div class="lectura">' + ADV.parrafos(P.rito) + '<p class="sutil">' + esc(P.instruccion) + '</p></div></details>' +
        '<div><span class="etiqueta">Posada · Día ' + n + ' · ' + esc(ADV.fechaLarga(d.fecha)) + '</span><h1 style="margin-top:4px">' + esc(d.titulo) + '</h1><span class="cita" style="margin-top:6px">' + ic('libro') + esc(d.cita) + '</span></div>' +
        '<section class="tarjeta"><span class="etiqueta">Texto bíblico</span><div class="lectura">' + ADV.parrafos(d.lectura) + '</div></section>' +
        '<section><h2>Reflexión</h2><div class="lectura" style="margin-top:8px">' + ADV.parrafos(d.reflexion) + '</div></section>' +
        '<section class="tarjeta dorada"><span class="etiqueta">Pregunta para reflexionar</span><p style="font-size:1.1rem;font-weight:600">' + esc(d.pregunta) + '</p></section>' +
        '<section class="tarjeta oscura"><span class="etiqueta">Oración del día</span><p class="lectura" style="font-style:italic">' + esc(d.oracion) + '</p><p style="color:#FFE7B0;font-weight:600">Petición: ' + esc(d.peticion) + '</p></section>' +
        '<section style="display:flex;flex-direction:column;gap:10px"><h2>Petición de posada</h2>' +
        '<div class="voz afuera"><b>AFUERA · Peregrinos</b><p>' + esc(P.peticion.afuera.join('\n')) + '</p></div>' +
        '<div class="voz adentro"><b>ADENTRO · Casero</b><p>' + esc(P.peticion.adentro.join('\n')) + '</p></div>' +
        '<div class="voz todos"><b>TODOS · mientras se abren las puertas</b><p>' + esc(P.peticion.todos) + '</p></div></section>' +
        '<section class="tarjeta"><span class="etiqueta">Oración final</span><p class="lectura" style="font-style:italic">' + esc(P.oracionFinal) + '</p></section>' +
        '<div class="fila entre">' + (n > 1 ? '<a class="btn chico claro" href="#/posadas/' + (n - 1) + '">' + ADV.ic.atras + 'Día ' + (n - 1) + '</a>' : '<span></span>') +
        (n < 9 ? '<a class="btn chico claro" href="#/posadas/' + (n + 1) + '">Día ' + (n + 1) + ADV.ic.adelante + '</a>' : '') + '</div></article>';
      return {
        html: h, bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var b = e.target.closest('[data-posada]'); if (b) { location.hash = '#/posadas/' + b.getAttribute('data-posada'); return; }
            if (e.target.closest('[data-proyectar]')) {
              var art = raiz.querySelector('[data-posada-art]');
              if (document.fullscreenElement) { document.exitFullscreen(); return; }
              if (art.requestFullscreen) art.requestFullscreen().then(function () { art.classList.add('proyectando'); }, function () { ADV.toast('Tu navegador no permite pantalla completa'); });
              else if (art.webkitRequestFullscreen) { art.webkitRequestFullscreen(); art.classList.add('proyectando'); }
              else ADV.toast('Tu navegador no permite pantalla completa');
            }
          });
          document.addEventListener('fullscreenchange', function salir() {
            if (!document.fullscreenElement) { var a = raiz.querySelector('.proyectando'); if (a) a.classList.remove('proyectando'); document.removeEventListener('fullscreenchange', salir); }
          });
          var a = raiz.querySelector('.tira [aria-current="true"]'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      };
    });
  };

  /* ============================ SAN LUCAS ============================ */
  V.sanlucas = function () {
    return ADV.datos('san-lucas').then(function (S) {
      var hoy = ADV.hoy(), leidos = ADV.store.get('sanlucas', {});
      var total = S.dias.filter(function (d) { return leidos[d.dia]; }).length;
      var cierre = S.intro.slice(-2), resto = S.intro.slice(0, -2);
      var h = '<section><span class="etiqueta">Del 1 al 24 de diciembre</span><h1>San Lucas Challenge</h1>' +
        '<div class="lectura" style="margin-top:8px">' + ADV.parrafos(cierre) + '</div>' +
        (resto.length ? '<details style="margin-top:10px"><summary style="font-family:var(--fuente-titulo);font-weight:700;cursor:pointer;color:var(--acento)">Sobre el reto</summary><div class="lectura" style="margin-top:8px">' + ADV.parrafos(resto) + '</div></details>' : '') +
        '<div class="fila" style="margin-top:12px;flex-wrap:nowrap"><span class="progreso morado"><span style="width:' + Math.round(total / 24 * 100) + '%"></span></span><b style="font-family:var(--fuente-titulo)">' + total + '/24 leídos</b></div></section>';
      h += '<ol class="lista-enlaces" style="list-style:none;padding:0;margin:0">' + S.dias.map(function (d) {
        var esHoy = d.fecha === hoy, l = !!leidos[d.dia];
        return '<li class="enlace' + (esHoy ? ' hoy' : '') + '" style="padding:4px 6px;gap:4px">' +
          '<button type="button" class="check" data-leido="' + d.dia + '" aria-pressed="' + l + '" aria-label="' + (l ? 'Desmarcar' : 'Marcar como leído') + ' el día ' + d.dia + '" style="width:auto;border:none;background:transparent;padding:8px"><span class="caja">' + (l ? ADV.ic.check : '') + '</span></button>' +
          '<button type="button" data-leer="' + esc(d.url) + '" data-titulo="' + esc('Día ' + d.dia + ': ' + d.titulo) + '" style="flex:1;display:flex;align-items:center;gap:8px;text-align:left;background:none;border:none;padding:6px 4px;min-height:44px">' +
          '<span class="t"><small>Día ' + d.dia + ' · ' + ADV.fechaCorta(d.fecha) + (esHoy ? ' · HOY' : '') + '</small>' + esc(d.titulo) + '</span>' + ADV.ic.chevron + '</button></li>';
      }).join('') + '</ol>';
      return {
        html: h, bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var b = e.target.closest('[data-leido]'); if (!b) return;
            var m = ADV.store.get('sanlucas', {}), k = b.getAttribute('data-leido'); m[k] = !m[k]; ADV.store.set('sanlucas', m);
            if (m[k] && S.dias.every(function (d) { return m[d.dia]; })) { ADV.confeti(); ADV.toast('¡Completaste el San Lucas Challenge!'); }
            ADV.recargar();
          });
        }
      };
    });
  };

  /* ======================== ORACIONES Y TRADICIONES ======================== */
  V.oraciones = function () {
    return Promise.all([ADV.datos('oraciones'), ADV.datos('quiz')]).then(function (D) {
      var o = D[0], quiz = D[1];
      var h = '<section><span class="etiqueta">Para rezar en casa</span><h1>Oraciones y tradiciones</h1></section>' +
        '<section class="tarjeta oscura"><span class="etiqueta">Bendición de la corona de Adviento</span><p class="lectura" style="font-style:italic;white-space:pre-line">' + esc(o.bendicion.join('\n')) + '</p></section>' +
        '<section style="display:flex;flex-direction:column;gap:10px"><h2>Las velas de la corona</h2>';
      o.velas.forEach(function (v, i) {
        var color = { morada: '#7B55B5', rosa: '#E07BA8', blanca: '#FFFDF6' }[v.color];
        h += '<div class="tarjeta" style="flex-direction:row;gap:14px;align-items:flex-start">' +
          '<svg width="26" height="64" viewBox="0 0 26 64" aria-hidden="true" style="flex-shrink:0"><path d="M13 2 C21 12 20 20 13 23 C6 20 5 12 13 2 Z" fill="#F2B441"/><rect x="5" y="25" width="16" height="39" rx="3" fill="' + color + '" stroke="#CDBC98" stroke-width="' + (v.color === 'blanca' ? 1.5 : 0) + '"/></svg>' +
          '<div style="display:flex;flex-direction:column;gap:6px"><span class="etiqueta">' + (i < 4 ? (i + 1) + 'ª vela · ' : 'Vela central · ') + esc(v.color) + ' · ' + esc(ADV.fechaLarga(v.desde)) + '</span>' +
          '<h3>' + esc(v.nombre) + '</h3><p>' + esc(ADV.significadoVela(quiz, i)) + '</p><p class="lectura" style="font-style:italic">' + esc(v.oracion) + '</p></div></div>';
      });
      h += '</section>' +
        '<section class="tarjeta dorada"><span class="etiqueta">Oración ante el pesebre</span><p class="lectura" style="font-style:italic">' + esc(o.pesebre) + '</p></section>' +
        '<section class="tarjeta"><span class="etiqueta">Preparación para la Nochebuena</span><ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:6px">' +
        o.nochebuena.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
        '<p class="lectura" style="font-style:italic;border-left:4px solid var(--dorado);padding-left:12px">' + esc(o.bendicionMesa) + '</p></section>' +
        '<section class="tarjeta morada"><span class="etiqueta">Novena de Navidad</span><p>' + esc(o.novena) + '</p><a class="btn" href="#/posadas" style="align-self:flex-start">Ir a las Posadas</a></section>' +
        '<button type="button" class="enlace" data-leer="' + esc(o.rosario.url) + '" data-titulo="Rosario de Adviento"><span class="t">Rosario de Adviento<small>Artículo · BienCatólicos.com</small></span>' + ADV.ic.chevron + '</button>';
      return h;
    });
  };

  /* ============================== APRENDE ============================== */
  var quizEstado = { i: 0, volteada: false };
  V.aprende = function (p) {
    var tab = ['quiz', 'articulos', 'videos'].indexOf(p[0]); if (tab < 0) tab = 0;
    return Promise.all([ADV.datos('quiz'), ADV.datos('articulos')]).then(function (D) {
      var quiz = D[0], art = D[1];
      var h = '<section><span class="etiqueta">Profundiza en el Adviento</span><h1>Aprende</h1></section>' +
        '<div class="pestanas" role="tablist">' + ['Quiz', 'Artículos', 'Videos'].map(function (t, i) {
          return '<button type="button" role="tab" aria-selected="' + (i === tab) + '" data-tab="' + ['quiz', 'articulos', 'videos'][i] + '">' + t + '</button>';
        }).join('') + '</div>';
      if (tab === 0) {
        var sab = ADV.store.get('quiz', {});
        var q = quiz[quizEstado.i], v = quizEstado.volteada;
        var nsab = Object.keys(sab).filter(function (k) { return sab[k]; }).length;
        h += '<p class="sutil">30 preguntas sobre el Adviento. Piensa tu respuesta y toca la tarjeta para voltearla.</p>' +
          '<div class="fila entre"><b style="font-family:var(--fuente-titulo);color:var(--acento)">Pregunta ' + q.n + ' de 30</b><span class="sutil" style="color:var(--verde);font-weight:700">' + nsab + ' que ya sabía</span></div>' +
          '<button type="button" class="tarjeta-quiz' + (v ? ' volteada' : '') + '" data-voltear aria-live="polite">' +
          '<span class="etiqueta" style="color:inherit">' + (v ? 'Respuesta' : 'Pregunta') + '</span><span class="q">' + esc(v ? q.respuesta : q.pregunta) + '</span>' +
          '<span style="font-family:var(--fuente-titulo);font-weight:700;opacity:.85">' + (v ? '¿La sabías?' : 'Toca para ver la respuesta') + '</span></button>' +
          (v ? '<div class="rejilla-2"><button type="button" class="btn claro" data-q="repaso">La repaso</button><button type="button" class="btn verde" data-q="sabia">¡Ya lo sabía!</button></div>' : '') +
          '<div class="rejilla-2"><button type="button" class="btn claro" data-q="ant">' + ADV.ic.atras + 'Anterior</button><button type="button" class="btn" data-q="sig">Siguiente' + ADV.ic.adelante + '</button></div>';
      } else if (tab === 1) {
        h += '<p class="sutil">Se abren aquí mismo, con el botón Regresar.</p><div class="lista-enlaces">' + art.articulos.map(function (a, i) {
          return '<button type="button" class="enlace" data-leer="' + esc(a.url) + '" data-titulo="' + esc(a.titulo) + '"><span class="n">' + (i + 1) + '</span><span class="t">' + esc(a.titulo) + '</span>' + ADV.ic.chevron + '</button>';
        }).join('') + '</div>';
      } else {
        h += '<p class="sutil">El video se carga solo cuando tocas reproducir.</p>' + art.videos.map(function (v) {
          return '<section class="tarjeta sombra" style="padding:0;overflow:hidden;gap:0"><div class="video" data-video="' + esc(v.id) + '" style="border:none;border-radius:0">' +
            '<button type="button" aria-label="Reproducir: ' + esc(v.titulo) + '"><img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy"><span class="play">' + ADV.ic.play + '</span></button></div>' +
            '<div style="padding:14px 16px"><h3>' + esc(v.titulo) + '</h3><p class="sutil">Video · YouTube</p></div></section>';
        }).join('');
      }
      return {
        html: h, bind: function (raiz) {
          raiz.addEventListener('click', function (e) {
            var t = e.target.closest('[data-tab],[data-voltear],[data-q],[data-video] button'); if (!t) return;
            if (t.hasAttribute('data-tab')) { location.hash = '#/aprende/' + t.getAttribute('data-tab'); return; }
            if (t.hasAttribute('data-voltear')) { quizEstado.volteada = !quizEstado.volteada; ADV.recargar(); return; }
            if (t.hasAttribute('data-q')) {
              var a = t.getAttribute('data-q');
              if (a === 'sabia') { var s = ADV.store.get('quiz', {}); s[quiz[quizEstado.i].n] = true; ADV.store.set('quiz', s); }
              quizEstado.i = (quizEstado.i + (a === 'ant' ? -1 : 1) + 30) % 30; quizEstado.volteada = false; ADV.recargar(); return;
            }
            var caja = t.closest('[data-video]'), id = caja.getAttribute('data-video');
            caja.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
          });
        }
      };
    });
  };

  /* ============================ MÁS / AJUSTES ============================ */
  V.mas = function () {
    var tema = ADV.temaActual();
    var h = '<section><span class="etiqueta">Todo tu Adviento</span><h1>Más</h1></section><div class="rejilla-2">' +
      '<a class="mosaico m-papel" href="#/encuentro"><b>Mi encuentro diario</b><small>26 reflexiones</small></a>' +
      '<a class="mosaico m-morado" href="#/domingos"><b>Domingos de Adviento</b><small>Artículo y bendición</small></a>' +
      '<a class="mosaico m-oro" href="#/sanlucas"><b>San Lucas Challenge</b><small>Del 1 al 24</small></a>' +
      '<a class="mosaico m-rosa" href="#/aprende"><b>Aprende</b><small>Quiz, artículos y videos</small></a>' +
      '<a class="mosaico m-noche" href="#/oraciones"><b>Oraciones y tradiciones</b><small>Velas, pesebre, Nochebuena</small></a>' +
      '<a class="mosaico m-verde" href="#/calendario"><b>Buenas acciones</b><small>Calendario de 26 días</small></a></div>' +
      '<section class="tarjeta"><span class="etiqueta">Ajustes</span>' +
      '<div class="fila"><span style="font-weight:600;flex:1">Apariencia</span><div class="fila" role="group" aria-label="Apariencia">' +
      ['dark', 'light'].map(function (t) {
        var act = tema === t;
        return '<button type="button" class="btn chico ' + (act ? '' : 'claro') + '" data-tema="' + t + '" aria-pressed="' + act + '">' + { light: 'Día', dark: 'Noche de Belén' }[t] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="fila"><span style="font-weight:600;flex:1">Tamaño de letra</span><button type="button" class="btn chico claro" data-letra="-1" aria-label="Letra más pequeña">A−</button><button type="button" class="btn chico claro" data-letra="1" aria-label="Letra más grande">A+</button></div>' +
      '<div class="fila"><button type="button" class="btn chico" data-compartir>' + ADV.ic.compartir + 'Compartir la app</button>' +
      '<button type="button" class="btn chico claro' + (ADV.instalable ? '' : ' oculto') + '" data-instalar>Agregar a la pantalla de inicio</button></div></section>' +
      '<section class="tarjeta"><span class="etiqueta">Privacidad</span><p>Tus respuestas, intenciones y avances se guardan solo en este celular. No hay registro ni cuentas, y nada de lo que escribes se envía a internet.</p>' +
      '<button type="button" class="btn chico peligro" data-borrar-todo style="align-self:flex-start">' + ADV.ic.borrar + 'Borrar todos mis datos</button></section>' +
      '<section class="tarjeta morada"><span class="etiqueta">Acerca de</span><p>Adviento es un proyecto de evangelización de <b>BienCatólicos.com</b>, un portal de noticias católicas de Guatemala. También puedes llevar el Evangelio, los santos y las reflexiones en la app de BienCatólicos.</p>' +
      '<a class="btn" href="https://www.biencatolicos.com/" style="align-self:flex-start">Visitar BienCatólicos.com</a></section>';
    return {
      html: h, bind: function (raiz) {
        raiz.addEventListener('click', function (e) {
          var t = e.target.closest('[data-tema],[data-letra],[data-compartir],[data-instalar],[data-borrar-todo]'); if (!t) return;
          if (t.hasAttribute('data-tema')) { ADV.ponerTema(t.getAttribute('data-tema')); ADV.recargar(); }
          else if (t.hasAttribute('data-letra')) ADV.cambiarLetra(+t.getAttribute('data-letra'));
          else if (t.hasAttribute('data-compartir')) ADV.compartirApp();
          else if (t.hasAttribute('data-instalar')) ADV.instalar();
          else if (confirm('¿Borrar todos tus datos de esta app en este celular? Se perderán tus respuestas y avances.')) {
            ADV.store.borrarPrefijo(''); try { sessionStorage.clear(); } catch (er) {} ADV.toast('Datos borrados'); ADV.recargar();
          }
        });
      }
    };
  };
})();
