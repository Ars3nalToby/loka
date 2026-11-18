// Loka service worker: offline shell. Bump VERSION on every deploy.
const VERSION='loka-v16';
const SHELL=['./','index.html','css/app.css','js/theme.js','js/config.js','js/rules.js','js/store.js','js/seed.js','js/state.js','js/ui.js','js/validate.js','js/art.js','js/brisbane.js','js/check.js','js/vendor/qrcode.js','js/share.js','js/auth.js','js/map.js','js/courts.js','js/rooms.js','js/jobs.js','js/ask.js','js/more.js','js/rights.js','js/live.js','js/landed.js','js/motion.js','js/app.js','js/suburbs.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Only Loka's own files are handled here. Requests to other sites (Supabase, Google Fonts, Threads)
// go straight to the network untouched, so a failed API call is never answered with a cached page.
// Network first, so listings stay fresh; cached copy when offline; the app shell only for page loads.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})
  .catch(()=>caches.match(r).then(hit=>hit||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
