// Loka · ui.js: Shared helpers: t() for English/中文, escaping, dates, artwork, icons, sheets, toast, copy.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// ───────── helpers ─────────
const t=(en,zh)=>S.lang==='zh'?zh:en;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SPORT={bad:['🏸','Badminton','羽毛球'],run:['🏃','Run','跑步'],ride:['🚴','Ride','骑行'],social:['🍲','Social','饭局/社交']};
const LEVEL={easy:['Easy / social','养生'],mid:['Intermediate','中级'],hard:['Hard / fast','拉练']};
const lv=k=>LEVEL[k]||LEVEL.easy;
const sp=k=>SPORT[k]||SPORT.social;
function when(iso){const d=new Date(iso);const days=S.lang==='zh'?['周日','周一','周二','周三','周四','周五','周六']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 let h=d.getHours(),m=d.getMinutes(),ap=h>=12?'pm':'am';h=h%12||12;return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth()+1} · ${h}${m?':'+String(m).padStart(2,'0'):''}${ap}`}
const left=q=>q.cap-q.players.length;
function badge(q){const l=left(q);if(l<=0)return `<span class="badge b-full">${t('Full','已满')}${q.wait.length?' +'+q.wait.length:''}</span>`;
 if(l<=2)return `<span class="badge b-need">${t('Need '+l,q.cap+'缺'+l)}</span>`;return `<span class="badge b-open">${l} ${t('spots','空位')}</span>`}
function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)}
const inSquad=q=>S.me&&q.players.some(p=>p.n===S.me);
const inWait=q=>S.me&&q.wait.includes(S.me);


let LC='';
const HT={room:['🛏','Room','单间'],unit:['🏢','Whole place','整租'],student:['🎓','Student housing','学生公寓']};
const ht=k=>HT[k]||HT.room;
// art() now lives in js/art.js
const zone=a=>ZONE[a]||'other';const wk=j=>Math.round(j.pay*(j.hpw||15));
const ago=x=>x.ago==null?t('just now','刚刚'):x.ago<24?x.ago+t('h ago','小时前'):Math.round(x.ago/24)+t('d ago','天前');

const isSaved=(k,id)=>S.saved[k].includes(id);
// ───────── trust, rules, community ─────────
const ROLE={owner:['Owner','业主'],head:['Tenant sub-letting','二房东（转租）'],agent:['Licensed agent','持牌中介']};
const IC={home:'<path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',homes:'<path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 16h18M6 10V6h12v4"/>',jobs:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',ask:'<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1-4.2A8 8 0 1 1 20 12z"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'};
function openSheet(html){document.getElementById('sheetIn').innerHTML=`<button class="x" data-a="close">✕</button>`+html;document.getElementById('sheet').classList.add('on')}
function closeSheet(){document.getElementById('sheet').classList.remove('on')}
function copy(s,msg){try{navigator.clipboard.writeText(s).then(()=>toast(msg),()=>toast(t('Copy blocked here','此处无法复制')))}catch(e){toast(t('Copy blocked here','此处无法复制'))}}
const val=id=>{const e=document.getElementById(id);return e?e.value.trim():''};

// Line icons for tiles and guides (24x24, stroke). Use ico(name) to get an <svg>.
const LI={
 scout:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 7.5l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3z"/>',
 squad:'<path d="M14.5 4.5l5 5-7.5 7.5-5-5zM7 12l-3.2 3.2a2.4 2.4 0 0 0 3.4 3.4L10.5 15.3"/><path d="M12 7l5 5"/>',
 favour:'<path d="M3 13h4l3 3h4a1.5 1.5 0 0 0 0-3h-2.5M7 13V9.5A2.5 2.5 0 0 1 9.5 7H13l4-3h1.5v9H17M3 13v6"/>',
 tools:'<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15v2.5"/>',
 guide:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 11h6M9.5 14.5h6M9.5 18h4"/>',
 house:'<path d="M4 11l8-6.5 8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>',
 coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.3c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.6.8-2.6 2s1.1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.2-.5-2.7-1.4M12 6.5v11"/>',
 sliders:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
 cap:'<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c3.3 2.2 7.7 2.2 11 0v-4M21.5 9.5v5"/>',
 list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
 map:'<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
 pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'
};
const ico=(k,c)=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" aria-hidden="true">${LI[k]||''}</svg>`;
// Hero tile illustrations: white line art with one warm accent, drawn for Loka.
const HERO_ART={
 rooms:`<svg viewBox="0 0 96 80" aria-hidden="true"><path d="M10 40 48 10l38 30" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 34v40h60V34" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><rect x="28" y="42" width="18" height="16" rx="1.5" fill="#F4C766"/><path d="M37 42v16M28 50h18" stroke="#1F6F5C" stroke-width="1.6"/><path d="M56 74V50a6 6 0 0 1 12 0v24" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="65" cy="62" r="1.4" fill="#fff"/><path d="M66 22v-9h7v15" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M6 74h84" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></svg>`,
 jobs:`<svg viewBox="0 0 96 80" aria-hidden="true"><path d="M22 34h44v18a20 20 0 0 1-20 20h-4a20 20 0 0 1-20-20z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M66 40h5a8 8 0 0 1 0 16h-6" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M24 44h40" stroke="#F4C766" stroke-width="5" stroke-linecap="round"/><path d="M34 26c-3-4 3-6 0-11M44 26c-3-4 3-6 0-11M54 26c-3-4 3-6 0-11" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M12 76h70" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></svg>`
};
