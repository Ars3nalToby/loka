// Loka · db.js: the shared database (Supabase). Loaded after auth.js, which creates the client `sb`.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
//
// How data flows
//  • Rooms and jobs are read from the database. Row-level security decides what each person sees:
//    everyone sees published listings, owners also see their own pending ones, admins see all.
//  • While no listing is published yet, visitors see the sample listings, each tagged "Sample".
//  • The last copy is kept in localStorage (store.js), so the app still opens offline.
//  • Contact details are fetched one listing at a time, and only for signed-in people (the database
//    refuses everyone else).
//  • Queensland rules are enforced by the database itself (supabase/migrations). This file only turns
//    its refusals into plain words.

let DB={on:false,admin:false,loading:false,err:''};
const dbLive=()=>!!(typeof sb!=='undefined'&&sb);
const isoD=s=>{const d=new Date(s);return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()};
const hoursAgo=s=>Math.max(0,Math.round((Date.now()-new Date(s))/36e5));
const HOME_COLS='id,owner,status,type,agr,role,owner_consent,title,area,near,rent,bond,adv_weeks,bills,furnished,chinese_ok,note,verified,verified_at,verified_checks,hidden_by_reports,reviewed_reason,created_at,by_name';
const JOB_COLS='id,owner,status,title,area,pay,casual,hours,languages,note,hidden_by_reports,reviewed_reason,created_at,by_name';

function fromHome(r){return{id:r.id,db:true,status:r.status,hidden:r.hidden_by_reports,reason:r.reviewed_reason,mine:!!(AUTHU&&r.owner===AUTHU.id),
 type:r.type,agr:r.agr,role:r.role,consent:r.owner_consent,title:r.title,area:r.area,near:r.near,rent:+r.rent,bond:+r.bond,adv:+r.adv_weeks,
 bills:r.bills,furn:r.furnished,zh:r.chinese_ok,note:r.note,verified:r.verified,vdate:r.verified_at?isoD(r.verified_at):'',checks:r.verified_checks||{},
 insp:{ok:0,bad:0},reward:0,ago:hoursAgo(r.created_at),by:r.by_name||t('Lister','发布人'),contact:null}}
function fromJob(r){return{id:r.id,db:true,status:r.status,hidden:r.hidden_by_reports,reason:r.reviewed_reason,mine:!!(AUTHU&&r.owner===AUTHU.id),
 title:r.title,area:r.area,pay:+r.pay,casual:r.casual,hrs:r.hours||'–',lang:r.languages||'English',zh:/中文|mandarin|chinese|普通话|粤语|cantonese/i.test(r.languages||''),
 cash:false,student:true,reward:0,ago:hoursAgo(r.created_at),by:r.by_name||t('Employer','发布人'),note:r.note,contact:null}}

// Load rooms and jobs. Keeps whatever is on screen if the network fails.
async function dbLoad(){if(!dbLive()||DB.loading)return;DB.loading=true;
 try{const [h,j]=await Promise.all([sb.from('homes').select(HOME_COLS).neq('status','removed').order('created_at',{ascending:false}).limit(300),
   sb.from('jobs').select(JOB_COLS).neq('status','removed').order('created_at',{ascending:false}).limit(300)]);
  if(h.error)throw h.error;if(j.error)throw j.error;
  const sample=seed(),keep=(old,id)=>{if(!AUTHU)return null;const o=old.find(x=>x.id===id);return o&&o.contact};
  const hs=h.data.map(fromHome),js=j.data.map(fromJob);
  hs.forEach(x=>{const c=keep(S.homes,x.id);if(c)x.contact=c});js.forEach(x=>{const c=keep(S.jobs,x.id);if(c)x.contact=c});
  // Samples stay until the first real listing of that kind is published.
  S.homes=hs.some(x=>x.status==='published')?hs:[...hs,...sample.homes];
  S.jobs=js.some(x=>x.status==='published')?js:[...js,...sample.jobs];
  DB.on=true;DB.err='';
  if(AUTHU){const p=await sb.from('profiles').select('is_admin').eq('id',AUTHU.id).maybeSingle();DB.admin=!!(p.data&&p.data.is_admin)}else DB.admin=false;
  save()}catch(e){DB.err=String(e&&e.message||e);console.warn('Loka database unavailable, showing the saved copy.',e)}
 finally{DB.loading=false;render()}}

// Plain words for what the database refuses.
function dbErr(e){const m=String(e&&(e.message||e.details)||e||'');
 if(/qld_bond_max_4_weeks/.test(m))return t('Bond cannot be more than 4 weeks of rent (Queensland law).','押金不能超过 4 周房租（昆州法律）。');
 if(/qld_rent_in_advance/.test(m))return t('That is more rent in advance than Queensland allows.','预付房租超过昆州上限。');
 if(/sublet_needs_owner_consent/.test(m))return t('Sub-letting needs the owner’s written consent.','转租需要业主书面同意。');
 if(/declarations_true/.test(m))return t('Please tick every declaration.','请勾选所有声明。');
 if(/limit: 3 new/.test(m))return t('You can post up to 3 a day. Please try again tomorrow.','每天最多发布 3 条，请明天再试。');
 if(/suburbs|foreign key/.test(m))return t('Pick a suburb from the list.','请从列表中选择区名。');
 if(/duplicate key|unique/.test(m))return t('You already did that.','你已经提交过了。');
 if(/JWT|not authenticated|permission denied|row-level security/i.test(m))return t('Please sign in first.','请先登录。');
 if(/Failed to fetch|NetworkError|network/i.test(m))return t('No internet connection. Nothing was sent.','没有网络，未提交。');
 return t('That did not work. Please try again.','未成功，请再试一次。')}

function needSignIn(){if(AUTHU)return false;authSheet();toast(t('Sign in first. Browsing never needs an account.','请先登录。浏览不需要账户。'));return true}

async function dbCreateHome(row,contact){if(needSignIn())return null;
 const {data,error}=await sb.from('homes').insert({...row,owner:AUTHU.id}).select('id').single();if(error)throw error;
 const c=await sb.from('home_contacts').insert({home_id:data.id,contact});if(c.error)throw c.error;await dbLoad();return data.id}
async function dbCreateJob(row,contact){if(needSignIn())return null;
 const {data,error}=await sb.from('jobs').insert({...row,owner:AUTHU.id}).select('id').single();if(error)throw error;
 const c=await sb.from('job_contacts').insert({job_id:data.id,contact});if(c.error)throw c.error;await dbLoad();return data.id}

// Contact for one listing. Signed-in only, one listing at a time, through reveal_contact() (migration 005):
// at most 20 different contacts per account per day, so one account cannot harvest every lister.
async function dbContact(kind,x){if(!AUTHU||x.contact!=null)return;
 let {data,error}=await sb.rpc('reveal_contact',{p_kind:kind==='homes'?'homes':'jobs',p_id:x.id});
 // Until migration 005 is applied to the live project the function does not exist (PGRST202): use the old read.
 if(error&&(error.code==='PGRST202'||/reveal_contact/.test(error.message||'')&&/not find|does not exist/i.test(error.message||''))){
  const tb=kind==='homes'?'home_contacts':'job_contacts',k=kind==='homes'?'home_id':'job_id';
  const q=await sb.from(tb).select('contact').eq(k,x.id).maybeSingle();error=q.error;data=q.data?q.data.contact:''}
 x.climit=!!(error&&/contact_limit/.test(error.message||''));x.contact=error?'':(data||'')}
function contactHtml(kind,x){const by=`<div class="meta">${t(kind==='homes'?'Listed by':'Posted by','发布人')} ${esc(x.by)}${x.role&&ROLE[x.role]?' · '+t(ROLE[x.role][0],ROLE[x.role][1]):''}</div>`;
 const head=`<div class="sec">${t('Contact','联系方式')}</div>`;
 if(!x.db)return head+`<div class="tt">${esc(x.contact)}</div>${by}<button class="btn ghost" data-a="copy" data-v="${esc(x.contact)}">${t('Copy contact','复制联系方式')}</button>`;
 if(!AUTHU)return head+`<button class="btn" data-a="signin">${ico('key')} ${t('Sign in to see the contact','登录后查看联系方式')}</button>${by}<div class="fine">${t('Contacts are only shown to signed-in people, to keep listers safe from spam and scams.','联系方式只给登录用户看，保护发布人不被骚扰和诈骗。')}</div>`;
 if(x.contact==null){dbContact(kind,x).then(()=>{const s=document.getElementById('sheet');if(s&&s.classList.contains('on'))(kind==='homes'?homeDetail:jobDetail)(x.id)});return head+`<div class="meta">${t('Loading…','加载中…')}</div>${by}`}
 if(!x.contact&&x.climit)return head+`<div class="note warn">${t('You have opened 20 contacts today. To protect listers from spam, more open tomorrow.','你今天已查看 20 个联系方式。为保护发布人不被骚扰，明天可以继续查看。')}</div>${by}`;
 if(!x.contact)return head+`<div class="meta">${t('No contact on file.','没有联系方式。')}</div>${by}`;
 return head+`<div class="tt">${esc(x.contact)}</div>${by}<button class="btn ghost" data-a="copy" data-v="${esc(x.contact)}">${t('Copy contact','复制联系方式')}</button>`}

// Small tags: Sample, Waiting for review, Hidden after reports.
function liveTag(x){if(!DB.on)return '';
 if(!x.db)return `<span class="tag smp">${t('Sample','示例')}</span>`;
 if(x.hidden)return `<span class="tag pend">${t('Hidden after reports','因举报暂时隐藏')}</span>`;
 if(x.status==='pending')return `<span class="tag pend">${t('Waiting for review','等待审核')}</span>`;return ''}

async function dbReport(kind,x){if(needSignIn())return;
 const {error}=await sb.from('reports').insert({kind,item:x.id,why:t('Reported by a user','用户举报')});
 toast(error?dbErr(error):t('Reported. An admin will look at it.','已举报，管理员会处理。'))}

// Admin actions. The database checks is_admin again; these buttons only appear for admins.
async function dbAdmin(kind,id,patch,msg){const {error}=await sb.from(kind).update(patch).eq('id',id);
 if(error)return toast(dbErr(error));toast(msg);await dbLoad()}
async function dbReports(){if(!DB.admin)return [];const {data}=await sb.from('reports').select('id,kind,item,why,created_at').eq('open',true).order('created_at');return data||[]}
