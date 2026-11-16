// Loka · ui.js: Shared helpers: t() for English/中文, escaping, dates, artwork, icons, sheets, toast, copy.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// ───────── helpers ─────────
const t=(en,zh)=>S.lang==='zh'?zh:en;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SPORT={bad:['🏸','Badminton','羽毛球'],run:['🏃','Run','跑步'],ride:['🚴','Ride','骑行'],social:['🍲','Social','饭局/社交']};
const LEVEL={easy:['Easy / social','养生'],mid:['Intermediate','中级'],hard:['Hard / fast','拉练']};
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
const GRAD=['hsl(158 38% 78%),hsl(165 34% 60%)','hsl(24 80% 84%),hsl(16 70% 70%)','hsl(42 70% 82%),hsl(36 62% 66%)','hsl(200 45% 84%),hsl(205 40% 68%)','hsl(340 50% 88%),hsl(350 45% 74%)','hsl(90 34% 82%),hsl(110 28% 66%)'];
const PAL=[['#DCEBE3','#C9B79C','#1F6F5C','#E2683C','#F6E7C8'],['#F7E3D4','#B99B7E','#E2683C','#1F6F5C','#FBF3E4'],['#F3E6BE','#B8A27A','#C99A2B','#2E5E7E','#FFF8E6'],['#DCE8F0','#A9B5B0','#2E5E7E','#E2683C','#F4F0E7'],['#F2DDE0','#BFA596','#B5546A','#1F6F5C','#FBF1EE'],['#E2EBD3','#B5AC8C','#5E7F3A','#C99A2B','#F8F6E6']];
function art(x){const n=x.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0),p=PAL[n%PAL.length],[wall,floor,ac,ac2,lite]=p,night=n%3===0;
 let g='';
 if(x.type==='room'){
  g=`<rect width="400" height="150" fill="${wall}"/><rect y="112" width="400" height="38" fill="${floor}"/><rect y="110" width="400" height="3" fill="rgba(25,21,18,.12)"/>
  <rect x="44" y="20" width="78" height="62" rx="4" fill="${night?'#27384d':'#cfe6f2'}" stroke="#fff" stroke-width="5"/><path d="M83 20v62M44 51h78" stroke="#fff" stroke-width="3"/>${night?`<circle cx="102" cy="36" r="7" fill="#f6e7a8"/>`:`<circle cx="64" cy="38" r="9" fill="#ffd98a"/>`}
  <rect x="150" y="30" width="34" height="42" rx="3" fill="#fff"/><rect x="155" y="35" width="24" height="32" rx="2" fill="${ac2}" opacity=".8"/><circle cx="167" cy="47" r="6" fill="${lite}"/>
  <path d="M262 0v26" stroke="#6b5a45" stroke-width="2"/><path d="M246 44h32l-7-18h-18z" fill="${ac2}"/><ellipse cx="262" cy="46" rx="9" ry="3" fill="#ffe9b0"/>
  <ellipse cx="216" cy="132" rx="100" ry="9" fill="rgba(25,21,18,.08)"/>
  <rect x="136" y="74" width="150" height="16" rx="6" fill="${ac}"/><rect x="136" y="86" width="150" height="26" rx="5" fill="${lite}"/><path d="M194 86h92v26h-92z" fill="${ac2}" opacity=".88"/><rect x="146" y="78" width="40" height="14" rx="7" fill="#fff"/><rect x="140" y="110" width="6" height="12" fill="#6b5a45"/><rect x="276" y="110" width="6" height="12" fill="#6b5a45"/>
  <g transform="translate(-288,-6)"><rect x="304" y="100" width="18" height="16" rx="3" fill="${ac2}"/><path d="M313 100c-10-14-10-26-2-34 2 12 6 20 2 34zm0 0c8-12 14-18 18-30-10 4-18 14-18 30z" fill="${ac}"/></g>`}
 else{const tall=x.type==='student',sky=night?'#2b3a52':'#d7ebf3';let w='';
  const bl=(bx,by,bw,bh,col,cols,rows)=>{let r=`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${col}"/>`;const gx=bw/(cols*2+1),gy=bh/(rows*2+1);for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)r+=`<rect x="${(bx+gx*(1+i*2)).toFixed(1)}" y="${(by+gy*(1+j*2)).toFixed(1)}" width="${gx.toFixed(1)}" height="${(gy*1.1).toFixed(1)}" rx="1.5" fill="${(i*7+j*3+n)%4===0?'#ffe3a1':night?'#42546e':'#fff'}" opacity=".9"/>`;return r};
  w+=bl(40,tall?46:70,70,tall?104:80,lite,3,tall?5:3)+bl(128,tall?18:44,104,tall?132:106,ac,4,tall?6:4)+bl(250,tall?58:78,86,tall?92:72,ac2,3,tall?4:3);
  g=`<rect width="400" height="150" fill="${sky}"/>${night?'<circle cx="296" cy="26" r="9" fill="#f6e7a8"/>':'<circle cx="292" cy="28" r="13" fill="#ffd98a"/><path d="M20 34c10-10 26-8 30 0 12-4 20 4 18 10H18c-6 0-6-8 2-10z" fill="#fff" opacity=".8"/>'}${w}
  <rect y="136" width="400" height="14" fill="${floor}"/><rect x="168" y="118" width="24" height="20" rx="2" fill="#6b5a45"/><circle cx="241" cy="116" r="10" fill="#5E7F3A"/><rect x="239" y="124" width="4" height="14" fill="#6b5a45"/><circle cx="119" cy="120" r="8" fill="#6f9a52"/><rect x="117" y="126" width="4" height="12" fill="#6b5a45"/>`}
 return `<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`}
const ZONE={'St Lucia':'west','Toowong':'west','Indooroopilly':'west','South Brisbane':'inner','Sunnybank':'south','Sunnybank Hills':'south','Calamvale':'south','Coopers Plains':'south','Rochedale':'south'};
const ZN={west:['West · UQ side','西区 · UQ 一带'],inner:['Inner city','市中心'],south:['South · Sunnybank side','南区 · Sunnybank 一带']};
const zone=a=>ZONE[a]||'other';const wk=j=>Math.round(j.pay*(j.hpw||15));
const ago=x=>x.ago==null?t('just now','刚刚'):x.ago<24?x.ago+t('h ago','小时前'):Math.round(x.ago/24)+t('d ago','天前');
const grad=id=>GRAD[(id.charCodeAt(id.length-1))%GRAD.length];
const isSaved=(k,id)=>S.saved[k].includes(id);
// ───────── trust, rules, community ─────────
const ROLE={owner:['Owner','业主'],head:['Tenant sub-letting','二房东（转租）'],agent:['Licensed agent','持牌中介']};
const IC={home:'<path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',homes:'<path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 16h18M6 10V6h12v4"/>',jobs:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',ask:'<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1-4.2A8 8 0 1 1 20 12z"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'};
function openSheet(html){document.getElementById('sheetIn').innerHTML=`<button class="x" data-a="close">✕</button>`+html;document.getElementById('sheet').classList.add('on')}
function closeSheet(){document.getElementById('sheet').classList.remove('on')}
function copy(s,msg){try{navigator.clipboard.writeText(s).then(()=>toast(msg),()=>toast(t('Copy blocked here','此处无法复制')))}catch(e){toast(t('Copy blocked here','此处无法复制'))}}
const val=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
