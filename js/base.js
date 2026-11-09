/* Adviento · BienCatólicos — utilidades base (fechas, almacenamiento, datos, interfaz). */
(function () {
  'use strict';
  var ADV = window.ADV = {};

  /* ---------------- Texto seguro ---------------- */
  ADV.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  ADV.parrafos = function (lista) {
    return (lista || []).map(function (p) { return '<p>' + ADV.esc(p) + '</p>'; }).join('');
  };

  /* ---------------- Íconos ---------------- */
  var I = function (d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>';
  };
  ADV.ic = {
    atras: I('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    adelante: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chevron: I('<path d="M9 6l6 6-6 6"/>'),
    check: I('<path d="M4 12l5 5L20 6"/>', ' stroke-width="3.2"'),
    candado: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    libro: I('<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>'),
    pantalla: I('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    descargar: I('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
    copiar: I('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    borrar: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    compartir: I('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>'),
    externo: I('<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    play: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#1E1530"/></svg>',
    estrella: I('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    paquete: I('<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>')
  };

  /* ---------------- Almacenamiento seguro ---------------- */
  var PREF = 'adv26-';
  ADV.store = {
    get: function (k, def) {
      try { var v = localStorage.getItem(PREF + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREF + k, JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    del: function (k) { try { localStorage.removeItem(PREF + k); } catch (e) {} },
    borrarPrefijo: function (p) {
      try {
        var claves = [];
        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREF + p) === 0) claves.push(k); }
        claves.forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
    }
  };

  /* ---------------- Fechas (Guatemala, UTC-6 sin horario de verano) ---------------- */
  var OFFSET = -6 * 3600 * 1000;
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var simulada = (function () {
    try {
      var f = new URLSearchParams(location.search).get('fecha');
      return f && /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : null;
    } catch (e) { return null; }
  })();
  ADV.fechaSimulada = simulada;

  /** Momento actual en milisegundos (si hay ?fecha=, ese día con la hora actual de Guatemala). */
  ADV.ahora = function () {
    var real = Date.now();
    if (!simulada) return real;
    var hora = new Date(real + OFFSET).toISOString().slice(11, 19);
    return Date.parse(simulada + 'T' + hora + '-06:00');
  };
  ADV.hoy = function () { return new Date(ADV.ahora() + OFFSET).toISOString().slice(0, 10); };
  ADV.horaGT = function () { return new Date(ADV.ahora() + OFFSET).getUTCHours(); };

  function partes(iso) { var p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  ADV.diasEntre = function (a, b) { return Math.round((partes(b) - partes(a)) / 86400000); };
  ADV.sumarDias = function (iso, n) { return new Date(partes(iso).getTime() + n * 86400000).toISOString().slice(0, 10); };
  ADV.fechaLarga = function (iso, conDia) {
    var d = partes(iso);
    var t = d.getUTCDate() + ' de ' + MESES[d.getUTCMonth()];
    if (conDia !== false) t = DIAS[d.getUTCDay()] + ' ' + t;
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  ADV.fechaCorta = function (iso) { var d = partes(iso); return d.getUTCDate() + ' ' + MESES[d.getUTCMonth()].slice(0, 3); };

  ADV.INICIO = '2026-11-29';
  ADV.NOCHEBUENA = '2026-12-24';
  ADV.NAVIDAD_MS = Date.parse('2026-12-25T00:00:00-06:00');
  /** Número de día del Adviento (1–26), 0 si aún no empieza, 27 si ya pasó. */
  ADV.diaAdviento = function (iso) {
    var n = ADV.diasEntre(ADV.INICIO, iso || ADV.hoy()) + 1;
    return n < 1 ? 0 : (n > 26 ? 27 : n);
  };
  ADV.fechaDeDia = function (n) { return ADV.sumarDias(ADV.INICIO, n - 1); };
  /** Semana de Adviento: 1–4; 5 = Nochebuena; 0 = antes; 6 = Navidad en adelante. */
  ADV.semana = function (iso) {
    iso = iso || ADV.hoy();
    var n = ADV.diaAdviento(iso);
    if (n === 0) return 0;
    if (n === 27) return 6;
    if (n === 26) return 5;
    return Math.min(4, Math.floor((n - 1) / 7) + 1);
  };
  ADV.SEMANAS = ['Antes del Adviento', 'Esperanza', 'Paz', 'Alegría', 'Amor', 'Nochebuena', 'Navidad'];

  /* ---------------- Datos ---------------- */
  var cache = {};
  ADV.datos = function (nombre) {
    if (!cache[nombre]) {
      cache[nombre] = fetch('/data/' + nombre + '.json').then(function (r) {
        if (!r.ok) throw new Error('No se pudo cargar ' + nombre);
        return r.json();
      }).catch(function (e) { delete cache[nombre]; throw e; });
    }
    return cache[nombre];
  };

  /* ---------------- Interfaz ---------------- */
  ADV.reducirMovimiento = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  ADV.toast = function (texto) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = texto;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  };
  ADV.confeti = function () {
    if (ADV.reducirMovimiento()) return;
    var piezas = ['✦', '★', '✧', '•', '✦'];
    var colores = ['#F2B441', '#E07BA8', '#7B55B5', '#FFFFFF', '#F2B441'];
    for (var i = 0; i < 36; i++) {
      var s = document.createElement('span');
      s.className = 'confeti'; s.textContent = piezas[i % piezas.length];
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.color = colores[i % colores.length];
      s.style.animationDuration = (2 + Math.random() * 2.4) + 's';
      s.style.animationDelay = (Math.random() * .6) + 's';
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 5200); })(s);
    }
  };

  /** Diálogo tipo hoja inferior. Devuelve una función para cerrarlo. */
  ADV.hoja = function (contenido, etiqueta) {
    var fondo = document.createElement('div');
    fondo.className = 'hoja-fondo';
    fondo.innerHTML = '<div class="hoja" role="dialog" aria-modal="true" aria-label="' + ADV.esc(etiqueta || 'Detalle') + '">' + contenido +
      '<button class="btn claro" type="button" data-cerrar>Cerrar</button></div>';
    var anterior = document.activeElement;
    function cerrar() { fondo.remove(); document.removeEventListener('keydown', tecla); if (anterior && anterior.focus) anterior.focus(); }
    function tecla(e) { if (e.key === 'Escape') cerrar(); }
    fondo.addEventListener('click', function (e) { if (e.target === fondo || e.target.closest('[data-cerrar]')) cerrar(); });
    document.addEventListener('keydown', tecla);
    document.body.appendChild(fondo);
    var b = fondo.querySelector('[data-cerrar]'); if (b) b.focus();
    return cerrar;
  };

  ADV.copiar = function (texto) {
    function viejo() {
      var ta = document.createElement('textarea'); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ADV.toast('Copiado'); } catch (e) { ADV.toast('No se pudo copiar'); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { ADV.toast('Copiado'); }, viejo);
    } else { viejo(); }
  };
  ADV.descargarTexto = function (nombre, texto) {
    var blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  ADV.debounce = function (fn, ms) {
    var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); };
  };

  /** Botón tipo casilla (aria-pressed). */
  ADV.casilla = function (attrs, marcado, texto, numero) {
    return '<button type="button" class="check" aria-pressed="' + (marcado ? 'true' : 'false') + '" ' + attrs + '>' +
      '<span class="caja">' + (marcado ? ADV.ic.check : (numero != null ? numero : '')) + '</span><span>' + texto + '</span></button>';
  };
})();
