// Loka service worker: offline shell. Bump VERSION on every deploy.
const VERSION='loka-v7';
const SHELL=['./','index.html','css/app.css','js/config.js','js/rules.js','js/store.js','js/seed.js','js/state.js','js/ui.js','js/art.js','js/check.js','js/map.js','js/rooms.js','js/jobs.js','js/ask.js','js/more.js','js/app.js','js/suburbs.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Network first for pages (so listings stay fresh), cache fallback when offline.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
