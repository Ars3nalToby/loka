// Loka · validate.js: checks every record before the app uses it. Classic script, loaded after
// ui.js and suburbs.js (it needs HT, LEVEL, SPORT, ROLE).
//
// Why: data will come from other people's phones once the shared database exists. One record with
// a wrong type or an unknown value must never crash the page or slip markup into it. So:
//  • ids must match ID_RE (they go into data-v attributes and links), else the record is dropped
//  • enum fields (type, level, sport, role, agr) fall back to a safe default
//  • numbers must be finite and inside a sane range
//  • text is cut to a maximum length; markup is still escaped at render time by esc()
// Call cleanData(S) on load, and on anything received from a server before it reaches S.
const ID_RE=/^[A-Za-z0-9_-]{1,40}$/;
const LIMITS={title:140,area:60,contact:140,by:60,note:1200,desc:1200,q:300,t:1200,host:60,venue:120,name:60,why:300};
const clampNum=(v,lo,hi,d)=>{v=Number(v);return Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d};
const vstr=(v,max)=>v==null?'':String(v).slice(0,max||300);
const oneOf=(v,map,d)=>Object.prototype.hasOwnProperty.call(map,v)?v:d;
function cleanStrings(o){for(const k of Object.keys(o)){const v=o[k];
 if(typeof v==='string')o[k]=v.slice(0,LIMITS[k]||300);
 else if(typeof v==='number'&&!Number.isFinite(v))o[k]=0}}
function cleanList(list,fix){if(!Array.isArray(list))return[];const seen=new Set();
 return list.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&ID_RE.test(x.id)&&!seen.has(x.id)&&seen.add(x.id)).map(x=>{cleanStrings(x);fix(x);return x})}
function cleanData(D){if(!D||typeof D!=='object')return seed();
 D.lang=D.lang==='zh'?'zh':'en';D.me=vstr(D.me,60);
 D.homes=cleanList(D.homes,h=>{h.type=oneOf(h.type,HT,'room');h.agr=h.agr==='fixed'?'fixed':'room';h.role=oneOf(h.role,ROLE,'');
  h.rent=clampNum(h.rent,0,5000,0);h.bond=clampNum(h.bond,0,50000,0);h.adv=clampNum(h.adv,0,52,0);h.ago=clampNum(h.ago,0,1e6,0);
  if(h.checks&&typeof h.checks==='object'){for(const k of Object.keys(h.checks)){if(!['id','live','right'].includes(k))delete h.checks[k];else h.checks[k]=vstr(h.checks[k],20)}}else delete h.checks;
  h.insp={ok:clampNum(h.insp&&h.insp.ok,0,1e5,0),bad:clampNum(h.insp&&h.insp.bad,0,1e5,0)};h.verified=!!h.verified;if(h.vdate)h.vdate=vstr(h.vdate,20)});
 D.jobs=cleanList(D.jobs,j=>{j.pay=clampNum(j.pay,0,1000,0);j.hpw=clampNum(j.hpw,0,80,0);j.ago=clampNum(j.ago,0,1e6,0)});
 D.wanted=cleanList(D.wanted,w=>{w.budget=clampNum(w.budget,0,3000,0);w.zones=Array.isArray(w.zones)?w.zones.filter(z=>['inner','west','innersouth','south'].includes(z)).slice(0,4):[];
  w.kind=['any','room','unit','student'].includes(w.kind)?w.kind:'any';w.stay=['any','3','6','12'].includes(w.stay)?w.stay:'any';w.campus=['uq','qut-gp','qut-kg','gu-nathan','gu-sb'].includes(w.campus)?w.campus:'';
  w.move=/^\d{4}-\d{2}-\d{2}$/.test(w.move||'')?w.move:'';w.exp=vstr(w.exp,40);w.zh=!!w.zh;w.mine=!!w.mine;w.ago=clampNum(w.ago,0,1e6,0)});
 D.squads=cleanList(D.squads,q=>{q.sport=oneOf(q.sport,SPORT,'social');q.level=oneOf(q.level,LEVEL,'easy');q.cap=clampNum(q.cap,1,200,4);q.price=clampNum(q.price,0,1000,0);q.start=clampNum(q.start,0,9e15,Date.now());
  q.players=Array.isArray(q.players)?q.players.slice(0,200).map(p=>typeof p==='string'?{n:vstr(p,60),paid:false}:(p&&typeof p==='object'?{n:vstr(p.n,60),paid:!!p.paid}:null)).filter(p=>p&&p.n):[]});
 D.tasks=cleanList(D.tasks,k=>{k.helpers=Array.isArray(k.helpers)?k.helpers.slice(0,50).map(p=>vstr(p,60)):[];k.reward=clampNum(k.reward,0,10000,0)});
 D.qa=cleanList(D.qa,q=>{q.a=Array.isArray(q.a)?q.a.filter(a=>a&&typeof a==='object').slice(0,200).map(a=>{cleanStrings(a);return a}):[];q.ago=clampNum(q.ago,0,1e6,0)});
 D.reports=Array.isArray(D.reports)?D.reports.filter(r=>r&&typeof r==='object'&&['homes','jobs','squads','tasks','qa'].includes(r.k)&&ID_RE.test(String(r.id))).slice(0,500).map(r=>({k:vstr(r.k,10),id:String(r.id),why:vstr(r.why,300)})):[];
 const ids=a=>Array.isArray(a)?a.filter(v=>typeof v==='string'&&ID_RE.test(v)).slice(0,500):[];
 D.saved={homes:ids(D.saved&&D.saved.homes),jobs:ids(D.saved&&D.saved.jobs)};
 D.done=Array.isArray(D.done)?D.done.filter(v=>typeof v==='string'||typeof v==='number').slice(0,100):[];
 D.scouts=Array.isArray(D.scouts)?D.scouts.filter(x=>x&&typeof x==='object').slice(0,200).map(x=>({n:vstr(x.n,60),leads:clampNum(x.leads,0,1e5,0),won:clampNum(x.won,0,1e5,0),earned:clampNum(x.earned,0,1e7,0),owed:clampNum(x.owed,0,1e7,0)})):[];
 const idMap=(o,val)=>{const r={};if(o&&typeof o==='object')for(const k of Object.keys(o))if(ID_RE.test(k)){const v=val(o[k]);if(v!==undefined)r[k]=v}return r};
 D.mine=idMap(D.mine,v=>Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,10):undefined);
 D.inspd=idMap(D.inspd,v=>v==='ok'||v==='bad'?v:undefined);
 return D}
S=cleanData(S);
