const VERSION = 'inglesapp-v1';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== VERSION && k !== 'inglesapp-estado').map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

// Funciona offline: tenta a rede e cai no cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Lembrete: o navegador acorda o app de tempos em tempos (Chrome no Android, app instalado).
self.addEventListener('periodicsync', e => {
  if (e.tag === 'lembrete-ingles') e.waitUntil(maybeRemind());
});

async function maybeRemind() {
  const c = await caches.open('inglesapp-estado');
  const res = await c.match('./estado.json');
  if (!res) return;
  const s = await res.json();
  if (!s.reminder) return;
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  if (s.today === today && s.doneToday) return;
  if (s.notified === today) return;
  const [h, m] = s.reminder.split(':').map(Number);
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  await self.registration.showNotification('inglêsAPP', {
    body: 'Ainda dá tempo: faça o inglês de hoje e mantenha sua sequência!',
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'lembrete'
  });
  s.notified = today;
  await c.put('./estado.json', new Response(JSON.stringify(s), { headers: { 'Content-Type': 'application/json' } }));
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => {
    for (const w of list) if ('focus' in w) return w.focus();
    return self.clients.openWindow('./');
  }));
});
