/* Adviento · BienCatólicos — corona digital y vela personal. */
(function () {
  'use strict';
  var ADV = window.ADV;

  // Posición de cada vela: [x, y, ancho, alto, relleno]. Índices: 0=1ª, 1=2ª, 2=3ª (rosa), 3=4ª, 4=blanca.
  var VELAS = [
    [48, 112, 34, 100, 'url(#c-mor)'],
    [110, 95, 32, 112, 'url(#c-mor)'],
    [208, 95, 32, 112, 'url(#c-ros)'],
    [268, 112, 34, 100, 'url(#c-mor)'],
    [160, 72, 30, 138, 'url(#c-bla)']
  ];
  var ORDEN_DIBUJO = [1, 2, 4, 0, 3]; // primero las de atrás

  function llama(cx, top, clase) {
    var t = top - 2, a = t - 38;
    return '<g class="llama ' + (clase || '') + '"><path d="M' + cx + ' ' + a + ' C' + (cx + 13) + ' ' + (a + 17) + ' ' + (cx + 12) + ' ' + (a + 32) + ' ' + cx + ' ' + (a + 36) +
      ' C' + (cx - 12) + ' ' + (a + 32) + ' ' + (cx - 13) + ' ' + (a + 17) + ' ' + cx + ' ' + a + ' Z" fill="#F2B441"/>' +
      '<path d="M' + cx + ' ' + (a + 15) + ' C' + (cx + 5) + ' ' + (a + 23) + ' ' + (cx + 5) + ' ' + (a + 31) + ' ' + cx + ' ' + (a + 33) +
      ' C' + (cx - 5) + ' ' + (a + 31) + ' ' + (cx - 5) + ' ' + (a + 23) + ' ' + cx + ' ' + (a + 15) + ' Z" fill="#FFF1C2"/></g>';
  }

  /** SVG de la corona. encendidas: arreglo de 5 booleanos. */
  ADV.coronaSVG = function (encendidas, nombres) {
    var s = '<svg class="corona-svg" viewBox="0 0 350 250" role="img" aria-label="Corona de Adviento: ' +
      ADV.esc(encendidas.filter(Boolean).length + ' de 5 velas encendidas') + '">' +
      '<defs>' +
      '<radialGradient id="c-halo"><stop offset="0" stop-color="#FFD27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="c-mor" x1="0" x2="1"><stop offset="0" stop-color="#4B2A7B"/><stop offset=".55" stop-color="#7B55B5"/><stop offset="1" stop-color="#3E2167"/></linearGradient>' +
      '<linearGradient id="c-ros" x1="0" x2="1"><stop offset="0" stop-color="#C45A8A"/><stop offset=".55" stop-color="#F29DC2"/><stop offset="1" stop-color="#B44C7C"/></linearGradient>' +
      '<linearGradient id="c-bla" x1="0" x2="1"><stop offset="0" stop-color="#E4DAC6"/><stop offset=".55" stop-color="#FFFDF6"/><stop offset="1" stop-color="#D6CBB4"/></linearGradient>' +
      '</defs>';
    VELAS.forEach(function (v, i) {
      if (encendidas[i]) s += '<circle class="halo" cx="' + (v[0] + v[2] / 2) + '" cy="' + (v[1] - 22) + '" r="40" fill="url(#c-halo)"/>';
    });
    ORDEN_DIBUJO.forEach(function (i) {
      var v = VELAS[i], cx = v[0] + v[2] / 2;
      s += '<g class="vela-toque" data-vela="' + i + '" role="button" tabindex="0" aria-label="' + ADV.esc((nombres && nombres[i]) || ('Vela ' + (i + 1))) + (encendidas[i] ? ', encendida' : ', apagada') + '">' +
        '<rect x="' + (v[0] - 6) + '" y="' + (v[1] - 46) + '" width="' + (v[2] + 12) + '" height="' + (v[3] + 46) + '" fill="transparent"/>' +
        '<rect x="' + v[0] + '" y="' + v[1] + '" width="' + v[2] + '" height="' + v[3] + '" rx="4" fill="' + v[4] + '"/>' +
        '<line x1="' + cx + '" y1="' + v[1] + '" x2="' + cx + '" y2="' + (v[1] - 9) + '" stroke="' + (encendidas[i] ? '#2A2233' : '#8C8172') + '" stroke-width="2"/>' +
        (encendidas[i] ? llama(cx, v[1] - 6) : '') + '</g>';
    });
    // Ramas
    s += '<ellipse cx="175" cy="214" rx="160" ry="30" fill="#1C4431"/><ellipse cx="175" cy="209" rx="150" ry="23" fill="#2F6B4F"/>';
    [[32, 206, -24, '#3E8562'], [62, 224, 12, '#245640'], [98, 232, -8, '#3E8562'], [142, 237, 6, '#245640'], [190, 238, -6, '#3E8562'],
      [238, 234, 8, '#245640'], [282, 225, -12, '#3E8562'], [318, 207, 22, '#245640'], [96, 196, -14, '#3E8562'], [256, 196, 14, '#3E8562']]
      .forEach(function (h) { s += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="17" ry="6" fill="' + h[3] + '" transform="rotate(' + h[2] + ' ' + h[0] + ' ' + h[1] + ')"/>'; });
    [[47, 218], [120, 236], [165, 240], [212, 239], [302, 218]].forEach(function (b) {
      s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4.5" fill="#C2413A"/>';
    });
    return s + '</svg>';
  };

  /** Vela personal grande ("Enciende tu luz"). */
  ADV.velaSVG = function (encendida, recien) {
    var s = '<svg class="vela-grande' + (recien ? ' recien' : '') + '" viewBox="0 0 120 170" role="img" aria-label="' + (encendida ? 'Tu vela encendida' : 'Tu vela apagada') + '">' +
      '<defs><radialGradient id="v-halo"><stop offset="0" stop-color="#FFC94D" stop-opacity=".85"/><stop offset="1" stop-color="#FFC94D" stop-opacity="0"/></radialGradient></defs>';
    if (encendida) s += '<circle class="halo" cx="60" cy="38" r="46" fill="url(#v-halo)"/>';
    s += '<rect x="42" y="62" width="36" height="88" rx="5" fill="#FFFDF6" stroke="#CDBC98" stroke-width="2"/>' +
      '<path d="M50 62 q0 10 4 12 q4 2 4 -12 z" fill="#F1E8D4"/>' +
      '<line x1="60" y1="62" x2="60" y2="53" stroke="' + (encendida ? '#2A2233' : '#5A4E3E') + '" stroke-width="2.5" stroke-linecap="round"/>';
    if (encendida) {
      s += '<g class="llama-entrada"><g class="llama"><path d="M60 14 C76 34 75 50 60 56 C45 50 44 34 60 14 Z" fill="#F2B441"/>' +
        '<path d="M60 32 C66 41 66 51 60 53 C54 51 54 41 60 32 Z" fill="#FFF1C2"/></g></g>';
    }
    s += '<ellipse cx="60" cy="152" rx="40" ry="9" fill="#B9893A"/></svg>';
    return s;
  };

  /** Estado de la corona según la fecha. */
  ADV.velasEncendidas = function (oraciones, iso) {
    iso = iso || ADV.hoy();
    return oraciones.velas.map(function (v) { return iso >= v.desde; }).concat([]).slice(0, 5);
  };

  /** Significado de cada vela, tomado de las respuestas del quiz. */
  ADV.significadoVela = function (quiz, i) {
    var n = [14, 15, 16, 17, 19][i];
    var q = quiz.filter(function (x) { return x.n === n; })[0];
    return q ? q.respuesta : '';
  };

  /** Hoja con la información de una vela. */
  ADV.mostrarVela = function (oraciones, quiz, i, encendida) {
    var v = oraciones.velas[i];
    ADV.hoja(
      '<span class="etiqueta">' + (i < 4 ? (i + 1) + 'ª vela · ' : '') + ADV.esc(v.color) + '</span>' +
      '<h2>' + ADV.esc(v.nombre) + '</h2>' +
      '<p class="sutil">' + (encendida ? 'Encendida desde el ' + ADV.fechaLarga(v.desde, false) : 'Se enciende el ' + ADV.fechaLarga(v.desde)) + '</p>' +
      '<p>' + ADV.esc(ADV.significadoVela(quiz, i)) + '</p>' +
      '<p class="lectura" style="font-style:italic">' + ADV.esc(v.oracion) + '</p>',
      'Vela ' + v.nombre);
  };

  ADV.mostrarBendicion = function (oraciones) {
    ADV.hoja('<span class="etiqueta">Bendición de la corona de Adviento</span>' +
      '<p class="lectura" style="font-style:italic;white-space:pre-line">' + ADV.esc(oraciones.bendicion.join('\n')) + '</p>', 'Bendición de la corona');
  };

  /* ----- Vela personal: estado guardado en el dispositivo ----- */
  ADV.luz = {
    estado: function () { return ADV.store.get('luz', { dias: [], intencion: '' }); },
    encendidaHoy: function () { return this.estado().dias.indexOf(ADV.hoy()) !== -1; },
    encender: function (intencion) {
      var e = this.estado();
      if (e.dias.indexOf(ADV.hoy()) === -1) e.dias.push(ADV.hoy());
      e.intencion = intencion || '';
      ADV.store.set('luz', e);
      contarGlobal();
    },
    apagar: function () {
      var e = this.estado();
      e.dias = e.dias.filter(function (d) { return d !== ADV.hoy(); });
      ADV.store.set('luz', e);
    },
    total: function () { return this.estado().dias.length; }
  };

  /** Contador global opcional: solo suma 1 por dispositivo y por día. Nunca envía la intención. */
  function contarGlobal() {
    if (!window.ADV_CONTADOR) return;
    try { fetch('/api/velas', { method: 'POST' }).catch(function () {}); } catch (e) {}
  }
})();
