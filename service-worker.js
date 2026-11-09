/* Adviento · BienCatólicos — funciona sin internet para reflexiones, retiros y posadas. */
var VERSION = 'adv26-v3';
var BASE = [
  '/', '/index.html', '/manifest.json', '/css/app.css',
  '/js/base.js', '/js/corona.js', '/js/lector.js', '/js/retiros.js', '/js/vistas.js', '/js/app.js',
  '/data/reflexiones.json', '/data/buenas-acciones.json', '/data/retiro-personal.json', '/data/retiro-familiar.json',
  '/data/retiro-pareja.json', '/data/posadas.json', '/data/san-lucas.json', '/data/quiz.json', '/data/articulos.json', '/data/oraciones.json',
  '/img/icono-192.png', '/img/icono-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION && k.indexOf('adv26-') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Artículos y contador: siempre en línea.
  if (url.origin === location.origin && url.pathname.indexOf('/api/') === 0) return;

  // Tipografías de Google: primero la caché.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fuentes').then(function (c) {
      return c.match(req).then(function (r) {
        return r || fetch(req).then(function (resp) { c.put(req, resp.clone()); return resp; });
      });
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  // Navegación: red primero, y si no hay internet, la app guardada.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(function () { return caches.match('/index.html'); }));
    return;
  }

  // Archivos de la app: lo guardado de inmediato y se actualiza en segundo plano.
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (guardado) {
      var red = fetch(req).then(function (resp) { if (resp.ok) c.put(req, resp.clone()); return resp; }).catch(function () { return guardado; });
      return guardado || red;
    });
  }));
});
