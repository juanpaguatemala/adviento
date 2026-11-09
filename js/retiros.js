/* Adviento · BienCatólicos — motor común de los tres retiros (personal, familiar y pareja). */
(function () {
  'use strict';
  var ADV = window.ADV;
  var esc = ADV.esc;
  var CLAVES = ['personal', 'familiar', 'pareja'];
  var COLORES = { personal: 'm-morado', familiar: 'm-verde', pareja: 'm-rosa' };

  /* ----------------------------- Estado guardado ----------------------------- */
  function estado(clave) {
    var e = ADV.store.get('retiro-' + clave, null) || {};
    e.completados = e.completados || {};
    e.pasos = e.pasos || {};
    e.campos = e.campos || {};
    e.modo = e.modo || 'juntos';
    return e;
  }
  function guardar(clave, e) { ADV.store.set('retiro-' + clave, e); }
  ADV.retiroProgreso = function (clave) {
    var e = estado(clave);
    return Object.keys(e.completados).filter(function (k) { return e.completados[k]; }).length;
  };
  ADV.diaRetiroHoy = function () {
    var n = ADV.diaAdviento();
    return n === 0 ? 1 : Math.min(25, n);
  };

  /* ------------------- Etiquetas de los campos de cada dinámica ------------------- */
  var ESPECIALES = {
    personal: {
      12: { tipo: 'carta', inicio: 'Hay algo que necesito expresar...' },
      15: ['De un lado: lo que me dificulta encontrar paz', 'Del otro lado: qué significaría vivir con mayor libertad interior', 'Un paso seguro hacia esa paz'],
      19: ['1ª estación: dónde me encuentro actualmente', '2ª estación: un cambio que me ayudaría', '3ª estación: otro cambio', '4ª estación: otro cambio', '5ª estación: cómo me gustaría vivir dentro de un año', 'El primer cambio y cuándo comenzaré'],
      20: ['Círculo interior: personas con quienes me siento seguro y escuchado', 'Segundo círculo: personas con quienes comparto experiencias positivas', 'Tercer círculo: comunidades o recursos de apoyo', 'Una relación que deseo fortalecer'],
      21: ['Habitación de los pensamientos', 'Habitación de las palabras', 'Habitación de las acciones', 'Habitación de las relaciones', 'El cambio concreto que haré'],
      25: { tipo: 'carta', inicio: 'Querido Niño Jesús...' }
    },
    familiar: {
      1: ['Las palabras que queremos encontrar en nuestro hogar'],
      2: ['Lo positivo que nos dijimos unos a otros'],
      8: ['Reconocer', 'Escuchar', 'Responsabilizarse', 'Reparar', 'Cambiar'],
      16: ['Raíces: personas importantes en nuestra historia', 'Tronco: valores y enseñanzas recibidas', 'Ramas: recuerdos felices', 'Hojas: tradiciones que queremos conservar o comenzar'],
      17: ['Tabla 1', 'Tabla 2', 'Tabla 3', 'Tabla 4', 'Tabla 5'],
      20: ['En nuestra familia queremos sentirnos…', 'Acciones que ayudan a construir ese ambiente', 'Nuestros tres acuerdos de convivencia'],
      25: { tipo: 'carta', inicio: 'Querido Niño Jesús...' }
    },
    pareja: {
      5: ['Confianza', 'Respeto', 'Comunicación', 'Ternura', 'Compromiso', 'La acción que elegimos practicar'],
      8: ['Una orilla: la preferencia de uno', 'La otra orilla: la preferencia del otro', 'Dos soluciones posibles', 'La alternativa que elegimos'],
      13: ['Mis necesidades personales', 'Las necesidades de mi pareja, según lo que expresa', 'Lo que compartimos: responsabilidades y espacios', 'Un límite propio que deseo comunicar'],
      15: ['Reconocer: una falta propia que deseo corregir', 'Responsabilizarse: sus consecuencias', 'Reparar: una reparación posible', 'Cambiar: un compromiso verificable'],
      19: ['Honestidad', 'Coherencia', 'Respeto', 'Responsabilidad', 'Privacidad', 'Cumplimiento de acuerdos'],
      20: ['Mis sueños', 'Tus sueños', 'Nuestros sueños', 'El primer paso'],
      25: { tipo: 'carta', inicio: 'Querido Niño Jesús...' }
    }
  };

  function campos(clave, d) {
    var esp = (ESPECIALES[clave] || {})[d.dia];
    var c = d.control || { tipo: 'lista', n: 3 };
    if (esp && !Array.isArray(esp)) return [{ k: 'carta', etq: 'Mi carta', tipo: 'carta', inicio: esp.inicio }];
    if (esp) return esp.map(function (e, i) { return { k: 'c' + i, etq: e, tipo: 'area' }; });
    switch (c.tipo) {
      case 'semaforo':
        return [{ k: 'c0', etq: 'Rojo: lo que debemos evitar', tipo: 'area', zona: 'z-rojo' },
          { k: 'c1', etq: 'Amarillo: lo que nos ayuda a detenernos', tipo: 'area', zona: 'z-amarillo' },
          { k: 'c2', etq: 'Verde: lo que queremos practicar', tipo: 'area', zona: 'z-verde' }];
      case 'arbol':
        return [{ k: 'c0', etq: 'Raíces', tipo: 'area', zona: 'z-raiz' }, { k: 'c1', etq: 'Tronco', tipo: 'area', zona: 'z-raiz' },
          { k: 'c2', etq: 'Ramas', tipo: 'area', zona: 'z-hoja' }, { k: 'c3', etq: 'Hojas', tipo: 'area', zona: 'z-hoja' }];
      case 'puente':
        return [{ k: 'c0', etq: 'Una orilla', tipo: 'texto' }, { k: 'c1', etq: 'La otra orilla', tipo: 'texto' }, { k: 'c2', etq: 'Las tablas del puente', tipo: 'area' }];
      case 'jardin':
        return [1, 2, 3, 4, 5].map(function (n) { return { k: 'c' + (n - 1), etq: 'Planta ' + n, tipo: 'texto' }; });
      case 'casa':
        return ['Pensamientos', 'Palabras', 'Acciones', 'Relaciones'].map(function (h, i) { return { k: 'c' + i, etq: h, tipo: 'area' }; });
      case 'puerta':
        return [{ k: 'c0', etq: 'De un lado de la puerta', tipo: 'area' }, { k: 'c1', etq: 'Del otro lado', tipo: 'area' }];
      case 'circulos':
        return [{ k: 'c0', etq: 'Círculo interior', tipo: 'area' }, { k: 'c1', etq: 'Segundo círculo', tipo: 'area' }, { k: 'c2', etq: 'Tercer círculo', tipo: 'area' }];
      case 'camino':
        return [1, 2, 3, 4, 5].map(function (n) { return { k: 'c' + (n - 1), etq: n + 'ª estación', tipo: 'texto' }; });
      case 'carta':
        return [{ k: 'carta', etq: 'Mi carta', tipo: 'carta', inicio: '' }];
      case 'escala':
        if (c.areas) return c.areas.map(function (a, i) { return { k: 'e' + i, etq: a.charAt(0).toUpperCase() + a.slice(1), tipo: 'rango' }; })
          .concat([{ k: 'nota', etq: 'Lo que descubro', tipo: 'area' }]);
        var r = [];
        for (var i = 0; i < (c.libre || 3); i++) {
          r.push({ k: 'n' + i, etq: 'Emoción ' + (i + 1), tipo: 'texto', ph: 'Nombre de la emoción' });
          r.push({ k: 'e' + i, etq: 'Intensidad', tipo: 'rango' });
        }
        return r.concat([{ k: 'nota', etq: 'Qué situación la provocó y qué necesito', tipo: 'area' }]);
      default:
        var n = c.n || 3, out = [];
        for (var j = 0; j < n; j++) out.push({ k: 'c' + j, etq: (c.etiqueta || 'Respuesta') + ' ' + (j + 1), tipo: 'texto' });
        return out;
    }
  }

  /* ------------------------------- Materiales ------------------------------- */
  var MATERIALES = [
    [/corona de adviento|vela de adviento|encender la (primera|segunda|cuarta|vela)/i, 'Corona o vela de Adviento'],
    [/ovillo|lana|hilo/i, 'Ovillo de lana o hilo'],
    [/frasco/i, 'Un frasco o caja'],
    [/papeles|tarjeta|hoja|tiras de papel/i, 'Hojas o tarjetas de papel'],
    [/dibuj|decorar/i, 'Lápices o crayones'],
    [/zapatos/i, 'Varios pares de zapatos'],
    [/mochila/i, 'Una mochila'],
    [/canasta|bolsa/i, 'Canasta, caja o bolsa'],
    [/alimentos|ropa limpia/i, 'Alimentos o ropa para donar'],
    [/buzón|caja/i, 'Una caja'],
    [/imagen de (la Virgen|Nuestra Señora)/i, 'Imagen de la Virgen'],
    [/imagen de Jesús|nacimiento|pesebre/i, 'Imagen de Jesús o el nacimiento'],
    [/objeto pequeño/i, 'Un objeto pequeño para el turno de hablar'],
    [/teléfonos en un lugar/i, 'Un lugar para dejar los teléfonos']
  ];
  function materiales(d) {
    var t = d.pasos.join(' '), r = [];
    MATERIALES.forEach(function (m) { if (m[0].test(t) && r.indexOf(m[1]) === -1) r.push(m[1]); });
    return r;
  }

  /* ---------------------------------- PIN ---------------------------------- */
  function hashPin(p) { var h = 0; for (var i = 0; i < p.length; i++) h = (h * 31 + p.charCodeAt(i)) % 1000003; return 'p' + h; }
  function desbloqueado() { try { return sessionStorage.getItem('adv26-pin-ok') === '1'; } catch (e) { return true; } }
  function marcarDesbloqueado() { try { sessionStorage.setItem('adv26-pin-ok', '1'); } catch (e) {} }

  /* ------------------------------ Vista: lista ------------------------------ */
  ADV.vistaRetiros = function () {
    return Promise.all(CLAVES.map(function (c) { return ADV.datos('retiro-' + c); })).then(function (rs) {
      var dia = ADV.diaRetiroHoy();
      var h = '<section><span class="etiqueta">29 de noviembre – 23 de diciembre</span><h1>Retiros de Adviento</h1>' +
        '<p class="sutil" style="margin-top:6px">Entre 10 y 20 minutos al día. Puedes retomar los días pendientes cuando quieras, sin penalización.</p></section>';
      rs.forEach(function (r) {
        var hechos = ADV.retiroProgreso(r.clave);
        var d = r.dias[dia - 1];
        h += '<a class="mosaico ' + COLORES[r.clave] + '" href="#/retiro/' + r.clave + '" style="min-height:140px;gap:10px">' +
          '<small style="text-transform:uppercase;letter-spacing:.08em;font-weight:700">Retiro ' + (r.clave === 'pareja' ? 'de pareja' : r.clave) + '</small>' +
          '<b style="font-size:1.45rem">' + esc(r.nombre) + '</b>' +
          '<small style="font-size:.95rem;font-family:var(--fuente-texto)">' + esc(r.subtitulo) + '</small>' +
          '<small style="font-size:.9rem">Día ' + dia + ' · ' + esc(d.dinamica) + '</small>' +
          '<span class="fila" style="flex-wrap:nowrap"><span class="progreso" style="border-color:currentColor;background:rgba(255,255,255,.25)"><span style="width:' + Math.round(hechos / 25 * 100) + '%"></span></span><small>' + hechos + '/25</small></span></a>';
      });
      h += '<p class="sutil">' + ADV.ic.candado.replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px"') + ' Tus respuestas se guardan solo en este celular. Nada se envía a internet.</p>';
      return h;
    });
  };

  /* ------------------------------ Vista: sesión ------------------------------ */
  ADV.vistaRetiro = function (clave, param) {
    if (CLAVES.indexOf(clave) === -1) return Promise.resolve(null);
    return ADV.datos('retiro-' + clave).then(function (r) {
      if (param === 'fin') return felicitacion(r);
      var n = parseInt(param, 10);
      if (!(n >= 1 && n <= 25)) n = ADV.diaRetiroHoy();
      return sesion(r, n);
    });
  };

  function tiraDias(r, n, e) {
    var hoy = ADV.diaAdviento();
    var h = '<div class="tira" role="list" aria-label="Días del retiro">';
    r.dias.forEach(function (d) {
      var cls = e.completados[d.dia] ? 'hecho' : (d.dia === hoy ? 'hoy' : (d.dia > hoy ? 'futuro' : ''));
      var estadoTxt = e.completados[d.dia] ? 'completado' : (d.dia === hoy ? 'hoy' : (d.dia < hoy ? 'pendiente' : ''));
      h += '<button type="button" role="listitem" class="' + cls + '" data-ir-dia="' + d.dia + '"' + (d.dia === n ? ' aria-current="true"' : '') +
        ' aria-label="Día ' + d.dia + (estadoTxt ? ', ' + estadoTxt : '') + '"><small>Día</small><b>' + d.dia + '</b><small>' +
        (e.completados[d.dia] ? '✓' : (d.dia === hoy ? 'hoy' : ADV.fechaCorta(d.fecha))) + '</small></button>';
    });
    return h + '</div>';
  }

  function campoHTML(clave, n, c, valor, extraClase) {
    var id = 'f-' + clave + '-' + n + '-' + c.k;
    if (c.tipo === 'rango') {
      var v = valor === undefined || valor === '' ? 5 : valor;
      return '<div class="escala"><label class="etq-campo" for="' + id + '">' + esc(c.etq) + '</label><div class="fila">' +
        '<input type="range" min="1" max="10" step="1" id="' + id + '" data-campo="' + c.k + '" value="' + esc(v) + '">' +
        '<output for="' + id + '">' + esc(v) + '</output></div></div>';
    }
    var interior;
    if (c.tipo === 'texto') interior = '<input type="text" id="' + id + '" data-campo="' + c.k + '" value="' + esc(valor || '') + '" placeholder="' + esc(c.ph || '') + '">';
    else if (c.tipo === 'carta') interior = '<textarea class="papel-rayado" id="' + id + '" data-campo="' + c.k + '" placeholder="' + esc(c.inicio || '') + '">' + esc(valor || '') + '</textarea>';
    else interior = '<textarea id="' + id + '" data-campo="' + c.k + '" rows="3">' + esc(valor || '') + '</textarea>';
    return '<div class="zona ' + (c.zona || '') + ' ' + (extraClase || '') + '"><label class="etq-campo" for="' + id + '">' + esc(c.etq) + '</label>' + interior + '</div>';
  }

  function sesion(r, n) {
    var clave = r.clave, d = r.dias[n - 1], e = estado(clave);
    var etapa = r.etapas[d.etapa - 1] || { nombre: '', lema: '' };
    var hechos = ADV.retiroProgreso(clave);
    var pasosHechos = e.pasos[n] || [];
    var vals = e.campos[n] || {};
    var esPareja = clave === 'pareja', individual = esPareja && e.modo === 'individual';
    var bloqueado = esPareja && e.pin && !desbloqueado();
    var cab = '<header class="retiro-cab ' + clave + '">' +
      '<div class="fila" style="flex-wrap:nowrap"><a class="icono-btn" href="#/retiros" aria-label="Volver a los retiros" style="background:transparent;border-color:#FFF;color:#FFF">' + ADV.ic.atras + '</a>' +
      '<div><div style="font-family:var(--fuente-titulo);font-weight:800;font-size:1.35rem;line-height:1.05">' + esc(r.nombre) + '</div>' +
      '<div class="sutil">' + esc(r.subtitulo) + '</div></div></div>' +
      '<div class="fila" style="flex-wrap:nowrap"><span class="progreso"><span style="width:' + Math.round(hechos / 25 * 100) + '%"></span></span>' +
      '<b style="font-family:var(--fuente-titulo)">' + hechos + '/25</b></div>' +
      tiraDias(r, n, e) +
      (esPareja ? '<div class="selector" role="group" aria-label="Modo del encuentro">' +
        '<button type="button" data-modo="juntos" aria-pressed="' + (!individual) + '">Lo hacemos juntos</button>' +
        '<button type="button" data-modo="individual" aria-pressed="' + individual + '">Lo hago individualmente</button></div>' : '') +
      '</header>';

    var h = cab + '<article style="display:flex;flex-direction:column;gap:18px">' +
      '<div><span class="etapa-titulo">' + ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta'][d.etapa - 1] + ' etapa · ' + esc(etapa.nombre) + '</span>' +
      '<p class="sutil">' + esc(etapa.lema) + '</p></div>' +
      '<div><span class="sutil">Día ' + n + ' · ' + esc(ADV.fechaLarga(d.fecha)) + '</span><h1 style="margin-top:4px">' + esc(d.dinamica) + '</h1>' +
      (d.celebracion ? '<div class="chips" style="margin-top:8px"><span class="chip rosa">' + esc(d.celebracion) + '</span></div>' : '') + '</div>' +
      '<div class="tarjeta"><span class="etiqueta">Objetivo</span><p>' + esc(d.objetivo) + '</p><span class="cita">' + ADV.ic.libro.replace('<svg', '<svg style="width:18px;height:18px"') + esc(d.cita) + '</span></div>' +
      '<section><h2>Meditación</h2><div class="lectura" style="margin-top:8px">' + ADV.parrafos(d.meditacion) + '</div></section>';

    if (clave === 'familiar') {
      var mats = materiales(d);
      if (mats.length) h += '<section class="tarjeta" style="background:var(--verde-suave)"><span class="etiqueta" style="color:var(--verde)">Materiales</span><div class="materiales">' +
        mats.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div></section>';
    }

    h += '<section style="display:flex;flex-direction:column;gap:10px"><h2>Desarrollo de la dinámica</h2>' +
      d.pasos.map(function (p, i) { return ADV.casilla('data-paso="' + i + '"', !!pasosHechos[i], esc(p), i + 1); }).join('') + '</section>';
    if (d.nota) h += '<div class="aviso">' + ADV.ic.candado + '<span>' + esc(d.nota) + '</span></div>';

    // Campos de la dinámica
    var lista = campos(clave, d);
    var titulo = clave === 'personal' ? 'Mi dinámica' : (clave === 'familiar' ? 'Nuestra dinámica' : (individual ? 'Mi dinámica' : 'Nuestra dinámica'));
    if (clave === 'familiar' && /dibuj/i.test(d.pasos.join(' '))) titulo += ' <span class="sutil" style="font-weight:600">· escriban o describan lo que dibujaron</span>';
    h += '<section class="control"><h2>' + titulo + '</h2>' + lista.map(function (c) { return campoHTML(clave, n, c, vals[c.k]); }).join('') + '</section>';

    // Preguntas y campos de respuesta
    h += '<section class="tarjeta dorada"><span class="etiqueta">' + esc(r.tipoPreguntas) + '</span><p style="font-size:1.1rem;font-weight:600">' + esc(d.preguntas) + '</p></section>';
    if (clave === 'personal') {
      h += '<section class="control">' + campoHTML(clave, n, { k: 'diario', etq: 'Mi diario espiritual', tipo: 'area' }, vals.diario) + '</section>';
    } else if (clave === 'familiar') {
      h += '<section class="control">' + campoHTML(clave, n, { k: 'respuestas', etq: 'Lo que conversamos', tipo: 'area' }, vals.respuestas) + '</section>';
    } else {
      h += '<section class="control">';
      if (bloqueado) h += '<div class="zona"><p class="etq-campo">Mi reflexión</p><p class="sutil">Protegida con PIN en este celular.</p><button type="button" class="btn chico claro" data-accion="desbloquear">' + ADV.ic.candado + 'Ver mis reflexiones</button></div>';
      else h += campoHTML(clave, n, { k: 'mi', etq: 'Mi reflexión (individual)', tipo: 'area' }, vals.mi);
      if (!individual) h += campoHTML(clave, n, { k: 'nos', etq: 'Nuestros acuerdos (compartidos)', tipo: 'area' }, vals.nos);
      h += '<p class="sutil">Esto se guarda solo en este celular. Si comparten el dispositivo, pueden usar el <button type="button" class="btn chico claro" style="min-height:36px;padding:0 10px" data-accion="pin">' + (e.pin ? 'cambiar o quitar el PIN' : 'bloqueo opcional con PIN') + '</button></p></section>';
    }

    h += '<section class="tarjeta oscura"><span class="etiqueta">' + (d.oracionEsFinal ? 'Oración final' : 'Oración') + '</span><div class="lectura" style="font-style:italic">' + ADV.parrafos(d.oracion) + '</div></section>';
    h += '<section class="tarjeta dorada"><span class="etiqueta">Compromiso' + (clave === 'familiar' ? ' familiar' : (clave === 'pareja' ? ' de pareja' : '')) + '</span><p style="font-weight:600">' + esc(d.compromiso) + '</p>' +
      (clave === 'familiar' ? campoHTML(clave, n, { k: 'compromiso', etq: 'Cómo lo vamos a vivir', tipo: 'texto' }, vals.compromiso) : '') + '</section>';

    h += '<p class="guardado" data-guardado aria-live="polite"></p>';
    var hecho = !!e.completados[n];
    h += '<button type="button" class="btn bloque ' + (hecho ? 'verde' : 'oro') + '" data-accion="completar" style="min-height:56px;font-size:1.1rem">' +
      (hecho ? ADV.ic.check + 'Día ' + n + ' completado' : esc(r.boton)) + '</button>';
    h += '<div class="fila entre">' +
      (n > 1 ? '<a class="btn chico claro" href="#/retiro/' + clave + '/' + (n - 1) + '">' + ADV.ic.atras + 'Día ' + (n - 1) + '</a>' : '<span></span>') +
      (n < 25 ? '<a class="btn chico claro" href="#/retiro/' + clave + '/' + (n + 1) + '">Día ' + (n + 1) + ADV.ic.adelante + '</a>' : '<a class="btn chico claro" href="#/retiro/' + clave + '/fin">Final del retiro</a>') +
      '</div>';
    h += '<section class="tarjeta"><span class="etiqueta">Mis respuestas</span><div class="fila">' +
      (clave === 'pareja'
        ? '<button type="button" class="btn chico claro" data-exportar="mi">' + ADV.ic.descargar + 'Exportar lo individual</button><button type="button" class="btn chico claro" data-exportar="nos">' + ADV.ic.descargar + 'Exportar lo compartido</button>'
        : '<button type="button" class="btn chico claro" data-exportar="todo">' + ADV.ic.descargar + (clave === 'familiar' ? 'Exportar compromisos y oraciones' : 'Exportar mi diario') + '</button>') +
      '<button type="button" class="btn chico claro" data-copiar>' + ADV.ic.copiar + 'Copiar</button>' +
      '<button type="button" class="btn chico peligro" data-accion="borrar-dia">' + ADV.ic.borrar + 'Borrar este día</button>' +
      '<button type="button" class="btn chico peligro" data-accion="borrar-todo">' + ADV.ic.borrar + 'Borrar todo el retiro</button></div>' +
      '<p class="sutil">' + ADV.ic.candado.replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px"') + ' Tus respuestas se guardan solo en este celular.</p></section>';
    h += '</article>';

    return {
      html: h,
      bind: function (raiz) {
        var guardadoTxt = raiz.querySelector('[data-guardado]');
        var guardarCampos = ADV.debounce(function () {
          var st = estado(clave);
          st.campos[n] = st.campos[n] || {};
          raiz.querySelectorAll('[data-campo]').forEach(function (el) { st.campos[n][el.getAttribute('data-campo')] = el.value; });
          guardar(clave, st);
          guardadoTxt.textContent = 'Guardado solo en este celular';
        }, 450);
        raiz.addEventListener('input', function (ev) {
          if (ev.target.matches('input[type="range"]')) { var o = ev.target.parentNode.querySelector('output'); if (o) o.textContent = ev.target.value; }
          if (ev.target.hasAttribute('data-campo')) { guardadoTxt.textContent = 'Guardando…'; guardarCampos(); }
        });
        raiz.addEventListener('click', function (ev) {
          var t = ev.target.closest('[data-paso],[data-ir-dia],[data-modo],[data-accion],[data-exportar],[data-copiar]');
          if (!t) return;
          var st = estado(clave);
          if (t.hasAttribute('data-paso')) {
            var i = +t.getAttribute('data-paso');
            st.pasos[n] = st.pasos[n] || [];
            st.pasos[n][i] = !st.pasos[n][i];
            guardar(clave, st);
            t.setAttribute('aria-pressed', st.pasos[n][i] ? 'true' : 'false');
            t.querySelector('.caja').innerHTML = st.pasos[n][i] ? ADV.ic.check : (i + 1);
          } else if (t.hasAttribute('data-ir-dia')) {
            location.hash = '#/retiro/' + clave + '/' + t.getAttribute('data-ir-dia');
          } else if (t.hasAttribute('data-modo')) {
            st.modo = t.getAttribute('data-modo'); guardar(clave, st); ADV.recargar();
          } else if (t.hasAttribute('data-exportar')) {
            var tx = exportar(r, t.getAttribute('data-exportar'));
            ADV.descargarTexto('retiro-' + clave + '-adviento.txt', tx);
          } else if (t.hasAttribute('data-copiar')) {
            ADV.copiar(exportar(r, clave === 'pareja' ? 'nos' : 'todo'));
          } else {
            var a = t.getAttribute('data-accion');
            if (a === 'completar') {
              st.completados[n] = !st.completados[n]; guardar(clave, st);
              if (st.completados[n]) {
                ADV.confeti();
                var total = Object.keys(st.completados).filter(function (k) { return st.completados[k]; }).length;
                if (total === 25) { location.hash = '#/retiro/' + clave + '/fin'; return; }
              }
              ADV.recargar();
            } else if (a === 'borrar-dia') {
              if (confirm('¿Borrar tus respuestas del día ' + n + '? No se puede deshacer.')) {
                delete st.campos[n]; delete st.pasos[n]; delete st.completados[n]; guardar(clave, st); ADV.recargar();
              }
            } else if (a === 'borrar-todo') {
              if (confirm('¿Borrar TODAS tus respuestas de este retiro? No se puede deshacer.')) { ADV.store.del('retiro-' + clave); ADV.recargar(); }
            } else if (a === 'pin') {
              gestionarPin(st);
            } else if (a === 'desbloquear') {
              var p = prompt('Escribe tu PIN de 4 dígitos');
              if (p != null && hashPin(p) === st.pin) { marcarDesbloqueado(); ADV.recargar(); } else if (p != null) ADV.toast('PIN incorrecto');
            }
          }
        });
        var actual = raiz.querySelector('.tira [aria-current="true"]');
        if (actual && actual.scrollIntoView) actual.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    };

    function gestionarPin(st) {
      if (st.pin) {
        var p = prompt('Escribe tu PIN actual para quitarlo');
        if (p != null && hashPin(p) === st.pin) { delete st.pin; guardar(clave, st); ADV.toast('PIN eliminado'); ADV.recargar(); }
        else if (p != null) ADV.toast('PIN incorrecto');
      } else {
        var nuevo = prompt('Elige un PIN de 4 dígitos para proteger tus reflexiones individuales en este celular');
        if (nuevo && /^\d{4}$/.test(nuevo)) { st.pin = hashPin(nuevo); guardar(clave, st); marcarDesbloqueado(); ADV.toast('PIN activado'); ADV.recargar(); }
        else if (nuevo != null) ADV.toast('El PIN debe tener 4 dígitos');
      }
    }
  }

  function exportar(r, que) {
    var e = estado(r.clave);
    var lineas = [r.nombre + ' — ' + r.subtitulo, 'Adviento · BienCatólicos.com', ''];
    r.dias.forEach(function (d) {
      var v = e.campos[d.dia] || {};
      var parte = [];
      var etiquetas = {};
      campos(r.clave, d).forEach(function (c) { etiquetas[c.k] = c.etq; });
      if (r.clave === 'familiar' && que === 'todo') {
        parte.push('Compromiso familiar: ' + d.compromiso);
        if (v.compromiso) parte.push('Cómo lo vamos a vivir: ' + v.compromiso);
        if (v.respuestas) parte.push('Lo que conversamos: ' + v.respuestas);
        parte.push('Oración: ' + d.oracion.join(' '));
      } else if (r.clave === 'pareja') {
        if (que === 'mi') { if (v.mi && (!e.pin || desbloqueado())) parte.push('Mi reflexión: ' + v.mi); }
        else {
          Object.keys(etiquetas).forEach(function (k) { if (v[k]) parte.push(etiquetas[k] + ': ' + v[k]); });
          if (v.nos) parte.push('Nuestros acuerdos: ' + v.nos);
        }
      } else {
        Object.keys(etiquetas).forEach(function (k) { if (v[k]) parte.push(etiquetas[k] + ': ' + v[k]); });
        if (v.diario) parte.push('Diario (' + d.preguntas + '): ' + v.diario);
      }
      var tieneDatos = parte.length && !(r.clave === 'familiar' && !v.compromiso && !v.respuestas && !e.completados[d.dia]);
      if (r.clave === 'familiar' && que === 'todo') tieneDatos = true;
      if (tieneDatos || e.completados[d.dia]) {
        lineas.push('Día ' + d.dia + ' · ' + ADV.fechaLarga(d.fecha) + ' — ' + d.dinamica + (e.completados[d.dia] ? ' (completado)' : ''));
        parte.forEach(function (p) { lineas.push('  ' + p); });
        lineas.push('');
      }
    });
    return lineas.join('\n');
  }

  function felicitacion(r) {
    var hechos = ADV.retiroProgreso(r.clave);
    var completo = hechos === 25;
    var h = '<section class="tarjeta sombra" style="align-items:center;text-align:center;gap:14px">' +
      '<div style="width:120px">' + ADV.velaSVG(true) + '</div>' +
      '<span class="etiqueta">' + esc(r.nombre) + '</span>' +
      '<h1>' + (completo ? '¡Llegaste a Belén!' : 'Casi llegas a Belén') + '</h1>' +
      '<p class="lectura">' + (completo ? 'Completaste los 25 días del retiro. Que todo lo vivido siga dando fruto en esta Navidad.' : 'Llevas ' + hechos + ' de 25 días. Puedes retomar los pendientes cuando quieras, sin penalización.') + '</p>' +
      '</section>' +
      '<section class="tarjeta oscura"><span class="etiqueta">Oración final</span><div class="lectura" style="font-style:italic">' + ADV.parrafos(r.oracionFinal || []) + '</div></section>' +
      '<div class="fila"><a class="btn" href="#/retiro/' + r.clave + '">Volver al retiro</a><a class="btn claro" href="#/retiros">Ver los otros retiros</a></div>';
    return { html: h, bind: function () { if (completo) ADV.confeti(); } };
  }
})();
