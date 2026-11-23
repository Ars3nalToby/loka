// Loka service worker: makes Loka open with no signal (an airport with no SIM yet) and load fast on
// slow Wi-Fi. Bump VERSION on every deploy; the page then shows "Loka was updated".
//
// Rules:
//  • Only Loka's own GET requests are handled. Other sites (Supabase, Google Fonts, Threads) go
//    straight to the network, so a failed API call is never answered with a cached page.
//  • App files (the SHELL list): served from the cache at once, refreshed in the background.
//  • Pages and /api/live: network first, but give up after a few seconds and use the last copy.
//  • The offline page is the cached "./", never "index.html": Vercel's cleanUrls redirects
//    /index.html to /, and browsers refuse a redirected response for a page load.
const VERSION='loka-v32';
const SHELL=['./','css/app.css','js/theme.js','js/config.js','js/rules.js','js/store.js','js/seed.js','js/state.js','js/ui.js','js/validate.js','js/art.js','js/brisbane.js','js/check.js','js/vendor/qrcode.js','js/share.js','js/auth.js','js/db.js','js/vendor/supabase.js','js/map.js','js/courts.js','js/rooms.js','js/scout.js','js/jobs.js','js/ask.js','js/more.js','js/rights.js','js/live.js','js/landed.js','js/play.js','js/motion.js','js/app.js','js/suburbs.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/favicon-32.png','icons/icon-180.png'];
const isShell=u=>SHELL.some(p=>p!=='./'&&u.pathname.endsWith('/'+p));

self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});

const keep=(req,res)=>{if(res&&res.ok&&res.type==='basic'&&!res.redirected){const c=res.clone();caches.open(VERSION).then(x=>x.put(req,c))}return res};
// Network with a time limit; on timeout or failure use the cache. The network answer still updates the cache.
function netFirst(req,ms,fallback){const net=fetch(req).then(r=>keep(req,r));
 const timer=new Promise(res=>setTimeout(res,ms));
 return Promise.race([net.catch(()=>null),timer.then(()=>null)]).then(r=>r||caches.match(req,{ignoreSearch:false}).then(hit=>hit||net.catch(()=>null).then(r2=>r2||fallback())))}

self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(netFirst(r,3500,()=>caches.match('./')));return}
 if(u.pathname.startsWith('/api/')){e.respondWith(netFirst(r,6000,()=>new Response('{"error":"offline"}',{status:503,headers:{'Content-Type':'application/json'}})));return}
 if(isShell(u)){e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(x=>keep(r,x)).catch(()=>null);return hit||net.then(x=>x||Response.error())}));return}
 e.respondWith(fetch(r).then(x=>keep(r,x)).catch(()=>caches.match(r).then(hit=>hit||Response.error())))});

// The page asks which version is running (for the Loka check-up screen).
// The Loka check-up screen asks which version is running and whether every app file is cached.
self.addEventListener('message',e=>{const port=e.ports&&e.ports[0];if(!port)return;
 if(e.data==='check')caches.open(VERSION).then(c=>Promise.all(SHELL.map(p=>c.match(p).then(h=>h?null:p)))).then(m=>port.postMessage({v:VERSION,total:SHELL.length,missing:m.filter(Boolean)}))});
