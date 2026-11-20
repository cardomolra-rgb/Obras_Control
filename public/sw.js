// OBRA CONTROL: guarda a "casca" do aplicativo para abrir rápido e funcionar como app instalado.
// Os dados (Neon) nunca são guardados aqui: sempre vêm do servidor.
const CACHE = 'obra-control-v3';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('neon.tech')) return; // dados e login: sempre online
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('/', c)); return r; }).catch(() => caches.match('/')));
    return;
  }
  const isStatic = url.origin === location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'));
  const isLib = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  if (isStatic || isLib) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })));
  }
});
