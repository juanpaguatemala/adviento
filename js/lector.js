/* Adviento · BienCatólicos — enlaces a artículos de BienCatólicos.com.
   Se abren en la misma pestaña; con el botón "atrás" se regresa a la app, al mismo lugar. */
(function () {
  'use strict';
  var ADV = window.ADV;
  var CLAVE = 'adv26-regreso';

  ADV.abrirLector = function (url) {
    try { sessionStorage.setItem(CLAVE, JSON.stringify({ hash: location.hash, y: window.scrollY })); } catch (e) {}
    location.href = url;
  };

  // Cualquier elemento con data-leer abre su artículo.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-leer]');
    if (!el) return;
    e.preventDefault();
    ADV.abrirLector(el.getAttribute('data-leer'));
  });

  /** Al volver con "atrás": devuelve la posición guardada si es la misma pantalla. */
  ADV.tomarRegreso = function () {
    var dato = null;
    try { dato = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); sessionStorage.removeItem(CLAVE); } catch (e) {}
    return dato && dato.hash === location.hash ? dato.y : 0;
  };
})();
