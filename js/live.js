// Loka · live.js: "Today in Brisbane". Today's and tomorrow's council events, Translink service
// notices and Bureau of Meteorology warnings, read through our own /api/live (see api/live.js).
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// Everything shown here is escaped with esc(); links were already limited to the official domains.
const LIVE={events:null,transit:null,weather:null},LIVE_ERR={},LIVE_AT={};let liveF='all',liveLoading=false;
const TZ='Australia/Brisbane';
// Defence in depth: the server already cleans links, but only https links on these domains are ever rendered.
const LIVE_HOSTS=['brisbane.qld.gov.au','translink.com.au','bom.gov.au'];
function safeUrl(u,fb){try{const x=new URL(u);return x.protocol==='https:'&&LIVE_HOSTS.some(h=>x.hostname===h||x.hostname.endsWith('.'+h))?x.href:fb}catch(e){return fb}}
const bneDay=d=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const bneTime=d=>new Intl.DateTimeFormat(S.lang==='zh'?'zh-CN':'en-AU',{timeZone:TZ,hour:'numeric',minute:'2-digit',hour12:S.lang!=='zh'}).format(d).replace(' ','');
function agoT(iso){const m=Math.max(0,Math.round((Date.now()-Date.parse(iso))/6e4));return m<1?t('just now','刚刚'):m<60?t(`${m} min ago`,`${m} 分钟前`):t(`${Math.round(m/60)} h ago`,`${Math.round(m/60)} 小时前`)}

// How old (ms) each feed may get on screen before Loka asks again. Safety feeds are refreshed sooner.
const LIVE_FRESH={events:10*6e4,transit:3*6e4,weather:3*6e4};
async function liveLoad(force){if(liveLoading)return;liveLoading=true;
 await Promise.all(['events','transit','weather'].map(async k=>{
  if(!force&&LIVE[k]&&Date.now()-LIVE_AT[k]<LIVE_FRESH[k])return;
  try{const r=await fetch('/api/live?k='+k,{signal:AbortSignal.timeout?AbortSignal.timeout(12000):undefined});const j=await r.json();
   if(!r.ok||!Array.isArray(j.items))throw new Error(j.error||'error');LIVE[k]={at:j.at,items:j.items};LIVE_AT[k]=Date.now();delete LIVE_ERR[k];liveSave()}
  catch(e){const c=liveSaved()[k];if(c&&!LIVE[k]){LIVE[k]={at:c.at,items:c.items,saved:true};LIVE_AT[k]=0}else LIVE_ERR[k]=true}}));
 liveLoading=false;if(tab==='today'||tab==='home')liveRepaint()}
// Last good copy of each feed, so Loka still shows something at an airport with no signal.
// Public data only (events, notices, warnings); nothing personal is stored here.
const LIVE_KEY='loka-live-v1';
function liveSaved(){try{return JSON.parse(localStorage.getItem(LIVE_KEY))||{}}catch(e){return {}}}
function liveSave(){try{const o={};for(const k of ['events','transit','weather'])if(LIVE[k]&&!LIVE[k].saved)o[k]={at:LIVE[k].at,items:LIVE[k].items};localStorage.setItem(LIVE_KEY,JSON.stringify(o))}catch(e){}}
// Repaint just the live parts so the page does not jump.
function liveRepaint(){const g=document.getElementById('glive'),gp=document.querySelector('[data-a="gcopy"]');if(g&&gp)g.innerHTML=playLive(play(gp.dataset.v));const a=document.getElementById('livebox');if(a)a.innerHTML=todayBody();const h=document.getElementById('livestrip');if(h)h.outerHTML=liveStrip()}

// Brisbane-relevant transport notices: train lines and busways people here use, or our suburbs.
const LINES=['Beenleigh','Cleveland','Shorncliffe','Ferny Grove','Caboolture','Redcliffe','Kippa-Ring','Ipswich','Rosewood','Springfield','Doomben','Airport','Gold Coast','Varsity Lakes','Roma Street','Central station','Fortitude Valley','Brisbane Metro','CityCat','ferry','busway','South Bank','Park Road','Boggo Road','Cultural Centre','King George Square','Queen Street','Garden City','Eight Mile Plains'];
function transitBne(items){const words=[...LINES,...SUBURB_DATA.suburbs.map(s=>s.name)].map(w=>w.toLowerCase());
 return items.filter(i=>{const s=(i.t+' '+i.d).toLowerCase();return words.some(w=>s.includes(w))}).sort((a,b)=>sev(b)-sev(a))}
const sev=i=>i.cat.includes('Major')?2:i.cat.includes('Minor')?1:0;
// BoM warnings that touch Brisbane: statewide ones, or ones naming the south-east.
const WX_RE=/brisbane|southeast|south east|moreton|logan|ipswich|gold coast|redlands|\(qld\)|queensland$/i;
const wxBne=items=>items.filter(i=>WX_RE.test(i.t)&&!/marine wind/i.test(i.t));

const EV_F=[['all','All','全部'],['now','On now','进行中'],['free','Free','免费'],['eng','English practice','练英语'],['market','Markets','市集'],['move','Active','运动'],['art','Arts & tours','艺术导览'],['kids','Kids','亲子']];
function evMatch(e,f){const s=(e.t+' '+e.ty+' '+e.v).toLowerCase(),n=Date.now();
 return f==='all'||(f==='now'&&Date.parse(e.s)<=n&&Date.parse(e.e)>n)||(f==='free'&&/^free/i.test(e.c))||(f==='eng'&&/english|conversation/.test(s))||(f==='market'&&/market/.test(s))
  ||(f==='move'&&/fitness|yoga|pilates|zumba|tai chi|run|move well|aqua|dance|tennis|pickleball|gym|walk/.test(s))||(f==='art'&&/exhibition|art|music|tour|performing|creative|museum|theatre|gallery/.test(s))
  ||(f==='kids'&&/first 5|kids|children|toddler|bubs|family|babies/.test(s))}
function evCard(e){const s=new Date(e.s),en=new Date(e.e),n=Date.now(),on=s<=n&&en>n,long=en-s>2*864e5,fr=/^free/i.test(e.c);
 return `<a class="ev${on?' on':''}" href="${esc(safeUrl(e.u,'https://www.brisbane.qld.gov.au/whats-on-in-brisbane'))}" target="_blank" rel="noopener">
  <span class="ev-t">${long?t('Ongoing','长期'):on?`<i class="live-dot"></i>${t('Now','进行中')}`:esc(bneTime(s))}</span>
  <span class="ev-b"><b>${esc(e.t)}</b><i>${ico('pin')} ${esc(e.v)}${long?'':' · '+esc(bneTime(s))+'–'+esc(bneTime(en))}</i>${e.ty?`<em>${esc(e.ty)}</em>`:''}</span>
  <span class="ev-c${fr?' fr':''}">${fr?t('Free','免费'):esc(e.c||t('See page','见官网')).slice(0,24)}</span></a>`}

function liveStrip(){const ev=LIVE.events&&LIVE.events.items,wx=LIVE.weather&&wxBne(LIVE.weather.items),tr=LIVE.transit&&transitBne(LIVE.transit.items).filter(i=>i.cat.includes('Major'));
 const today=bneDay(new Date()),n=ev?ev.filter(e=>bneDay(new Date(e.s))===today||Date.parse(e.s)<Date.now()).length:null;
 return `<button id="livestrip" class="livestrip" data-a="tab" data-v="today"><span class="ls-h"><i class="live-dot"></i>${t('Today in Brisbane','今日布村')}</span>
  <span class="ls-row"><span><b>${n==null?'…':n}</b>${t('events','个活动')}</span><span><b>${tr?tr.length:'…'}</b>${t('transport alerts','条交通通知')}</span><span class="${wx&&wx.length?'warn':''}"><b>${wx?wx.length:'…'}</b>${t('weather warnings','个天气警报')}</span></span>
  <span class="ls-s">${t('From the council, Translink and the Bureau of Meteorology','资料直接来自市政府、Translink 和气象局')} →</span></button>`}

function todayBody(){const ev=LIVE.events&&LIVE.events.items,today=bneDay(new Date());let h='';
 // Weather
 if(LIVE.weather){const w=wxBne(LIVE.weather.items);h+=w.length?w.map(i=>`<a class="wx" href="${esc(safeUrl(i.u,'https://www.bom.gov.au/qld/warnings/'))}" target="_blank" rel="noopener"><span class="wx-i">⚠</span><span><b>${esc(i.t.replace(/^\d+\/\d+:\d+ EST /,''))}</b><i>${t('Bureau of Meteorology','澳洲气象局')} · ${i.at?agoT(i.at):''}</i></span></a>`).join(''):`<div class="wx ok"><span class="wx-i">☀</span><span><b>${t('No weather warnings for Brisbane right now','布里斯班目前没有天气警报')}</b><i>${t('Bureau of Meteorology','澳洲气象局')}</i></span></div>`}
 else if(LIVE_ERR.weather)h+=`<div class="note">${t('Weather warnings did not load.','天气警报暂时载入失败。')} <a href="https://www.bom.gov.au/qld/warnings/" target="_blank" rel="noopener">bom.gov.au ↗</a></div>`;
 // Events
 h+=`<div class="sec row2"><span>${t('What’s on','今日活动')}</span><span class="cnt">${ev?ev.length:'…'}</span></div><div class="chips">${EV_F.map(f=>`<button class="chip ${liveF===f[0]?'on':''}" data-a="evf" data-v="${f[0]}">${t(f[1],f[2])}</button>`).join('')}</div>`;
 if(!ev)h+=LIVE_ERR.events?`<div class="note">${t('Events did not load.','活动暂时载入失败。')} <button class="link sm" data-a="liver">${t('Try again','重试')}</button></div>`:`<div class="ev-skel"></div><div class="ev-skel"></div><div class="ev-skel"></div>`;
 else{const f=ev.filter(e=>evMatch(e,liveF)),td=f.filter(e=>bneDay(new Date(e.s))===today||Date.parse(e.s)<Date.now()),tm=f.filter(e=>!td.includes(e));
  const short=td.filter(e=>Date.parse(e.e)-Date.parse(e.s)<=2*864e5),long=td.filter(e=>!short.includes(e));
  h+=short.length?`<div class="evday">${t('Today','今天')}</div>`+short.map(evCard).join(''):`<div class="note">${t('Nothing more today with this filter.','这个筛选今天没有更多活动了。')}</div>`;
  if(tm.length)h+=`<details class="evmore"><summary>${t('Tomorrow','明天')} · ${tm.length}</summary>${tm.slice(0,80).map(evCard).join('')}</details>`;
  if(long.length)h+=`<details class="evmore"><summary>${t('Exhibitions and ongoing','展览与长期活动')} · ${long.length}</summary>${long.map(evCard).join('')}</details>`}
 // Transit
 if(LIVE.transit){const tr=transitBne(LIVE.transit.items);h+=`<div class="sec row2"><span>${t('Getting around','出行通知')}</span><span class="cnt">${tr.length}</span></div>`+(tr.length?tr.slice(0,8).map(i=>`<a class="tr ${sev(i)===2?'maj':sev(i)===1?'min':''}" href="${esc(safeUrl(i.u,'https://translink.com.au/service-updates'))}" target="_blank" rel="noopener"><b>${esc(i.t)}</b><i>${esc(i.d)}</i></a>`).join('')+`<a class="link sm" href="https://translink.com.au/service-updates" target="_blank" rel="noopener">${t('All notices on Translink','查看 Translink 全部通知')} ↗</a>`:`<div class="note">${t('No Brisbane notices right now.','布里斯班目前没有出行通知。')}</div>`)}
 else if(LIVE_ERR.transit)h+=`<div class="note">${t('Transport notices did not load.','交通通知暂时载入失败。')} <a href="https://translink.com.au/service-updates" target="_blank" rel="noopener">translink.com.au ↗</a></div>`;
 const at=['events','transit','weather'].map(k=>LIVE[k]&&LIVE[k].at).filter(Boolean).sort()[0];
 h+=`<div class="note src">${['events','transit','weather'].some(k=>LIVE[k]&&LIVE[k].saved)?`<b class="offl">${t('Offline: showing the last saved copy.','离线中：显示上次保存的资料。')}</b> `:''}${at?t('Updated ','更新于 ')+agoT(at)+' · ':''}${t('Events: Brisbane City Council open data (CC BY 4.0). Transport: Translink. Warnings: Bureau of Meteorology. Loka shows them as published and links to the original; check the source before you travel.','活动：布里斯班市政府开放数据（CC BY 4.0）。交通：Translink。警报：澳洲气象局。Loka 按原样显示并附原文链接，出门前请以原网站为准。')}</div>`;
 return h}

function todayHtml(){liveLoad();return `<section class="thero"><div><span class="kick"><i class="live-dot"></i>${t('Live from official sources','官方来源 · 实时')}</span><h1>${t('Today in<br><em>Brisbane.</em>','今日<br><em>布村。</em>')}</h1><div class="td">${esc(new Intl.DateTimeFormat(S.lang==='zh'?'zh-CN':'en-AU',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'}).format(new Date()))}</div></div><button class="refresh" data-a="liver" aria-label="${t('Refresh','刷新')}">↻</button></section><div id="livebox">${todayBody()}</div>`}
// Keep "Today in Brisbane" fresh in a tab or home-screen app that was left open or in the background:
// refresh when Loka comes back to the screen, and every 3 minutes while it is on screen.
// Listings refresh too (db.js), at most every 5 minutes.
let DB_AT=0;
// Never redraw under someone's fingers: skip while a form sheet is open or a field is being typed in.
const busyTyping=()=>{const f=document.activeElement;return !!(f&&f.matches&&f.matches('input,textarea,select'))||!!document.querySelector('#sheet.on input,#sheet.on textarea')};
function freshen(){if(document.visibilityState!=='visible'||!navigator.onLine||busyTyping())return;
 if(['home','today','guides'].includes(tab))liveLoad();
 if(typeof dbLoad==='function'&&Date.now()-DB_AT>5*6e4){DB_AT=Date.now();dbLoad()}}
document.addEventListener('visibilitychange',freshen);
addEventListener('pageshow',e=>{if(e.persisted)freshen()});
addEventListener('online',freshen);
setInterval(freshen,3*6e4);
