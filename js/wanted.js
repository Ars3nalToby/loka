// Loka · wanted.js: 求租 Wanted posts (roadmap S5). Renters say what they need; listers browse and get in touch.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html (after scout.js).
//
// Why this exists: on days with few rooms, a renter still has a reason to come (post once, get shown every new room
// that fits), and a landlord has a reason to list ("8 people want a room on the south side under $300").
// Database rules live in supabase/migrations/007_wanted.sql: pending until an admin publishes, 30-day expiry,
// contact only through reveal_contact (20 a day), no phone / email / WeChat in the public note.

let wz=''; // Wanted page: side-of-town filter ('' = all)
let WSEL=new Set(['south']); // form: chosen sides of town
const STAY={any:['Any length','时长不限'],'3':['3+ months','3 个月以上'],'6':['6+ months','6 个月以上'],'12':['12+ months','12 个月以上']};
const WKIND={any:['Any type','类型不限'],room:['Room','单间'],unit:['Whole place','整套'],student:['Student housing','学生公寓']};
const W_MAX_NOTE=300;
// Same contact test as the database (constraint wanted_note_no_contact) and as scout links.
const wNoteHasContact=s=>scoutHasContact({note:s});
// Short zone name ("South" not "South · Sunnybank side") for titles; full names in the detail sheet.
const zShort=z=>ZN[z]?t(ZN[z][0],ZN[z][1]).split(' · ')[0]:z;
const wZones=w=>w.zones.map(zShort).join(' · ');
const wZonesFull=w=>w.zones.map(z=>ZN[z]?t(ZN[z][0],ZN[z][1]):z).join(' / ');
const wTitle=w=>`≤ $${w.budget}/${t('wk','周')} · ${wZones(w)}`;
const wMove=w=>{if(!w.move)return t('Flexible / now','随时 / 现在');const d=new Date(w.move+'T00:00:00');return isNaN(d)?w.move:t('From ','')+d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+t('','起')};
const wDaysLeft=w=>w.exp?Math.ceil((new Date(w.exp)-Date.now())/864e5):30;
const wLive=w=>!w.db||(w.status==='published'&&!w.hidden&&wDaysLeft(w)>0);
// A real room the public can see (samples count only in the offline demo).
const realRoom=h=>!DB.on||(h.db&&h.status==='published'&&!h.hidden);
function wFits(w,h){return h.rent<=w.budget&&w.zones.includes(zone(h.area))&&(w.kind==='any'||h.type===w.kind)&&(!w.zh||h.zh)&&!homeFlags(h).length}
const wFitRooms=w=>S.homes.filter(h=>realRoom(h)&&wFits(w,h)).sort((a,b)=>(b.verified-a.verified)||a.rent-b.rent);
const wForRoom=h=>(S.wanted||[]).filter(w=>wLive(w)&&!w.mine&&wFits(w,h));
const wPublic=()=>(S.wanted||[]).filter(w=>wLive(w));
// Numbers a landlord cares about: how many, typical budget, busiest side of town.
function wStats(){const l=wPublic();if(!l.length)return null;const b=l.map(w=>w.budget).sort((a,c)=>a-c),mid=b[Math.floor((b.length-1)/2)];
 const zc={};l.forEach(w=>w.zones.forEach(z=>zc[z]=(zc[z]||0)+1));const top=Object.keys(zc).sort((a,c)=>zc[c]-zc[a])[0];return{n:l.length,mid,top}}

function wCard(w){const fit=w.mine?wFitRooms(w).length:0;
 return `<button class="card" data-a="want" data-v="${esc(w.id)}" style="text-align:left;width:100%"><div class="tt">${liveTag(w)}${w.db&&w.status==='published'&&wDaysLeft(w)<=0?`<span class="tag pend">${t('Expired','已过期')}</span>`:''}${esc(wTitle(w))}</div>
 <div class="meta">${ico('pin')} ${esc(wMove(w))} · ${t(STAY[w.stay][0],STAY[w.stay][1])}${w.campus&&CAMPUS_SHORT[w.campus]?' · '+t('near ','近 ')+CAMPUS_SHORT[w.campus]:''} · ${ago(w)}</div>
 <span class="tag">${t(WKIND[w.kind][0],WKIND[w.kind][1])}</span>${w.zh?`<span class="tag b">${t('中文 home','中文家庭')}</span>`:''}${w.mine?`<span class="tag g">${t('Your post','你的求租')}${fit?' · '+fit+' '+t(fit===1?'room fits':'rooms fit','间合适'):''}</span>`:''}
 ${w.note?`<div class="note">${esc(w.note)}</div>`:''}</button>`}

function wantedHtml(){const all=wPublic(),mine=(S.wanted||[]).filter(w=>w.mine),st=wStats();
 const l=all.filter(w=>!w.mine&&(!wz||w.zones.includes(wz))).sort((a,b)=>(a.ago||0)-(b.ago||0));
 return `<h1>${t('People <em>looking.</em>','求租<em>信息。</em>')}</h1>
 <div class="sub">${t('Renters post what they need. Landlords and housemates: if your room fits, get in touch. Renters: post once and Loka shows you every new room that fits.','租客写下需要什么样的房。房东和室友：房间合适就联系对方。租客：发一次，Loka 会把之后符合条件的新房源都推给你看。')}</div>
 ${st?`<div style="display:flex;gap:10px"><div class="stat"><b>${st.n}</b><span>${t('looking now','人正在找')}</span></div><div class="stat"><b>$${st.mid}</b><span>${t('typical budget /wk','典型预算 / 周')}</span></div><div class="stat"><b>${esc(zShort(st.top))}</b><span>${t('most wanted','最多人想住')}</span></div></div>`:''}
 <div class="cta"><button class="btn" data-a="newwant">+ ${t('Post what you need','发布求租')}</button><button class="btn ghost" data-a="newhome">${t('I have a room','我有房出租')}</button></div>
 ${mine.length?`<div class="sec">${t('Your posts','你的求租')}</div>`+mine.map(wCard).join(''):''}
 <div class="chips zc">${[['',t('All areas','全部区域')],...Object.keys(ZN).map(z=>[z,t(ZN[z][0],ZN[z][1])])].map(c=>`<button class="chip ${wz===c[0]?'on':''}" data-a="wz" data-v="${c[0]}">${c[0]&&ZCOL[c[0]]?`<i style="background:${ZCOL[c[0]].ink}"></i>`:''}${c[1]}</button>`).join('')}</div>
 <div class="sec">${l.length} ${t(l.length===1?'person looking':'people looking','人在求租')}</div>
 ${l.map(wCard).join('')||`<div class="note">${all.length?t('Nobody on this side of town yet. Try All areas.','这一区暂时没有人求租，看看全部区域。'):t('No one has posted yet. Be the first: it takes a minute, and you will see every new room that fits.','还没有人发布求租。做第一个吧：一分钟填完，之后符合条件的新房源都会显示给你。')}</div>`}
 <button class="btn ghost" data-a="wshare">${ico('share')} ${t('Copy a link to this page for WeChat or 小红书 (RedNote)','复制本页链接，发到微信或小红书（RedNote）')}</button>
 <div class="note">${t('Never pay a bond or rent before you have seen the room and have a written agreement. Bond goes to the RTA, not into someone’s bank account.','看过房、签了书面协议之前，绝不付押金或房租。押金应交给 RTA，而不是打到个人账户。')} <button class="link" data-a="tab" data-v="rights">${t('Renter rights','租客权益')} →</button></div>`}

function wantDetail(id){const w=(S.wanted||[]).find(x=>x.id===id);if(!w)return;const fit=wFitRooms(w);
 const row=(k,v)=>`<div class="lb"><span class="meta" style="flex:1">${k}</span><b style="text-align:right;overflow-wrap:anywhere">${v}</b></div>`;
 openSheet(`<div class="tt" style="font-size:21px">${liveTag(w)}${esc(wTitle(w))}</div>
 ${w.mine&&w.status==='pending'?`<div class="note warn">${t('Only you can see this. It goes live after a Loka admin checks it, usually within a day.','只有你看得到。Loka 管理员审核后才会公开，通常一天内。')}</div>`:''}
 ${row(t('Budget','预算'),`≤ $${w.budget}/${t('wk','周')}`)}${row(t('Where','区域'),esc(wZonesFull(w)))}${row(t('Type','类型'),t(WKIND[w.kind][0],WKIND[w.kind][1]))}${row(t('Move in','入住'),esc(wMove(w)))}${row(t('Stay','租期'),t(STAY[w.stay][0],STAY[w.stay][1]))}
 ${w.campus&&CAMPUS_SHORT[w.campus]?row(t('Near','靠近'),CAMPUS_SHORT[w.campus]):''}${w.zh?row(t('Language at home','家里语言'),t('Chinese-speaking home preferred','希望室友讲中文')):''}
 ${w.note?`<div class="note">${esc(w.note)}</div>`:''}
 <div class="sec">${fit.length} ${t(fit.length===1?'room on Loka fits':'rooms on Loka fit','间 Loka 房源符合')}</div>${fit.slice(0,5).map(h=>`<button class="mini" data-a="home" data-v="${esc(h.id)}"><span><b>$${h.rent}/${t('wk','周')} · ${esc(h.area)}</b><i>${h.verified?'✓ '+t('verified','已核实')+' · ':''}${esc(ttl(h.title))}</i></span><em class="gd">${ico('pin')}</em></button>`).join('')||`<div class="meta">${t('None yet. New rooms that fit will show up here.','暂时没有。之后符合条件的新房源会出现在这里。')}</div>`}
 ${w.mine?`${w.db&&w.status==='published'?`<div class="meta">${wDaysLeft(w)>0?t(`Shown for ${wDaysLeft(w)} more days.`,`还会显示 ${wDaysLeft(w)} 天。`):t('Expired. Renew to show it again.','已过期。续期后重新显示。')}</div>`:''}
  ${w.db&&wDaysLeft(w)<=7?`<button class="btn" data-a="wrenew" data-v="${esc(w.id)}">${t('Renew for 30 days','续期 30 天')}</button>`:''}<button class="btn ghost" data-a="wdown" data-v="${esc(w.id)}">${t('I found a place: take it down','我已找到房：下架')}</button>`
 :`${contactHtml('wanted',w)}<button class="btn ghost" data-a="wmsg" data-v="${esc(w.id)}">${t('Copy a ready message to this renter','复制一段发给这位租客的信息')}</button><button class="btn ghost" data-a="newhome">${t('List my room on Loka (free)','把我的房免费发到 Loka')}</button>`}
 <div class="note">${t('Loka is a notice board, not an agent. It does not hold money or sign agreements.','Loka 是信息板，不是中介，不经手资金，也不代签协议。')}</div>
 ${w.mine?'':`<button class="report" data-a="report" data-k="wanted" data-v="${esc(w.id)}">${ico('flag')} ${t('Report this post','举报这条求租')}</button>`}`)}

// What a lister sends. Bilingual, no promises, reminds both sides of the legal limits.
function wMsg(w){return `您好！我在 Loka（lokabne.au）看到您的求租（${wTitle(w).replace(/\/wk/,'/周')}）。我这边有房，可能合适，方便的话我们约时间看房或视频看房。押金最多 4 周租金，交给 RTA。\n\nHi! I saw your Wanted post on Loka (lokabne.au): ${'≤ $'+w.budget+'/wk'}. I have a room that may fit. Happy to arrange an inspection or a video call. Bond is at most 4 weeks' rent and is lodged with the RTA.`}

function wantForm(){if(!DB.wantOk)return toast(t('Wanted posts open very soon.','求租功能即将开放。'));if(dbLive()&&needSignIn())return;WSEL=new Set(wz?[wz]:['south']);const today=new Date(),iso=d=>d.toISOString().slice(0,10),max=new Date(Date.now()+365*864e5);
 openSheet(`<div class="tt" style="font-size:21px">${t('Post what you need','发布求租')}</div>
 <div class="fine">${t('Takes a minute. A Loka admin checks it first, then it shows for 30 days.','一分钟填完。Loka 管理员审核后公开，显示 30 天。')}</div>
 <label>${t('Most you can pay per week $','每周最多能付 $')}</label><input id="w_budget" type="number" inputmode="decimal" min="50" max="3000" placeholder="280">
 <label>${t('Sides of town (pick one or more)','想住哪边（可多选）')}</label><div class="chips" id="w_zones" style="flex-wrap:wrap;overflow:visible">${Object.keys(ZN).map(z=>`<button class="chip ${WSEL.has(z)?'on':''}" data-a="wzsel" data-v="${z}">${t(ZN[z][0],ZN[z][1])}</button>`).join('')}</div>
 <div class="g2"><div><label>${t('Type','类型')}</label><select id="w_kind">${Object.keys(WKIND).map(k=>`<option value="${k}">${t(WKIND[k][0],WKIND[k][1])}</option>`).join('')}</select></div>
 <div><label>${t('Stay','租期')}</label><select id="w_stay">${Object.keys(STAY).map(k=>`<option value="${k}" ${k==='6'?'selected':''}>${t(STAY[k][0],STAY[k][1])}</option>`).join('')}</select></div></div>
 <div class="g2"><div><label>${t('Move in (empty = now)','入住日期（不填 = 随时）')}</label><input id="w_move" type="date" min="${iso(today)}" max="${iso(max)}"></div>
 <div><label>${t('Near campus','靠近学校')}</label><select id="w_campus"><option value="">${t('No preference','不限')}</option>${Object.keys(CAMPUS_SHORT).map(c=>`<option value="${c}">${CAMPUS_SHORT[c]}</option>`).join('')}</select></div></div>
 <label class="tick"><input type="checkbox" id="w_zh"><span>${t('I’d like a Chinese-speaking home','希望室友讲中文')}</span></label>
 <label>${t('About you (no phone or WeChat here)','关于你（这里不要写电话或微信）')}</label><textarea id="w_note" rows="3" maxlength="${W_MAX_NOTE}" placeholder="${t('e.g. Griffith master’s student, quiet, non-smoker, cooks simple meals','例：Griffith 研究生，安静，不抽烟，简单做饭')}"></textarea>
 ${S.me?'':`<label>${t('Your name (shown on the post)','你的名字（显示在求租上）')}</label><input id="w_by" maxlength="40">`}
 <label>${t('Contact: WeChat ID, mobile or email','联系方式：微信号、手机或邮箱')}</label><input id="w_contact" maxlength="140">
 <div class="fine">${t('Only signed-in Loka users can see it, one post at a time, at most 20 contacts a day each.','只有登录的 Loka 用户能看到，一次一条，每人每天最多 20 条。')}</div>
 <label class="tick"><input type="checkbox" id="w_c1"><span>${t('What I wrote is true and I am really looking for a place.','以上信息属实，我确实在找房。')}</span></label>
 <label class="tick"><input type="checkbox" id="w_c2"><span>${t('Signed-in Loka users with a room that fits may contact me.','同意有合适房源的 Loka 登录用户联系我。')}</span></label>
 <div class="note">${t('Never pay before you have seen the room and have a written agreement.','看房并签书面协议之前，绝不付钱。')}</div>
 <button class="btn" data-a="createwant">${t('Send for review','提交审核')}</button>`)}

// Checks the form; returns [row, contact] or an error message. Mirrors the database rules.
function wantRow(f){const budget=Math.round(+f.budget);
 if(!(budget>=50&&budget<=3000))return t('Weekly budget between $50 and $3,000, please.','每周预算请填 $50 到 $3000 之间。');
 if(!f.zones.length)return t('Pick at least one side of town.','请至少选一个区域。');
 if(!f.contact||f.contact.trim().length<3)return t('Add a contact so landlords can reach you.','请填联系方式，房东才能联系你。');
 if(f.note.length>W_MAX_NOTE)return t('About you: 300 characters at most.','“关于你”最多 300 字。');
 if(wNoteHasContact(f.note))return t('Put your phone, WeChat or email in the Contact box, not in About you. It keeps you safe from spam.','电话、微信、邮箱请填在“联系方式”里，不要写在“关于你”。这样可以防骚扰。');
 if(f.move){const d=new Date(f.move+'T00:00:00');if(isNaN(d)||d-Date.now()>366*864e5)return t('Move-in date: within the next year.','入住日期请在一年内。')}
 if(!f.c1||!f.c2)return t('Please tick both declarations.','请勾选两项声明。');
 return [{kind:WKIND[f.kind]?f.kind:'any',budget,zones:[...f.zones].filter(z=>ZN[z]).slice(0,4),move_in:f.move||null,stay:STAY[f.stay]?f.stay:'any',
  campus:CAMPUS_SHORT[f.campus]?f.campus:'',zh_home:!!f.zh,note:f.note.trim().slice(0,W_MAX_NOTE),by_name:(f.by||'').slice(0,40),decl_true:true,decl_contact_ok:true},f.contact.trim().slice(0,140)]}

function wantCreate(b){const ck=i=>{const e=document.getElementById(i);return !!(e&&e.checked)};const by=S.me||val('w_by');
 if(!by)return toast(t('Add your name','请填名字'));
 const r=wantRow({budget:val('w_budget'),zones:[...WSEL],kind:val('w_kind'),stay:val('w_stay'),move:val('w_move'),campus:val('w_campus'),zh:ck('w_zh'),note:val('w_note')||'',by,contact:val('w_contact'),c1:ck('w_c1'),c2:ck('w_c2')});
 if(typeof r==='string')return toast(r);S.me=by;
 if(dbLive()){b.disabled=true;dbCreateWanted(r[0],r[1]).then(id=>{if(id){closeSheet();tab='wanted';render();wantDetail(id);toast(t('Sent for review. It goes live once an admin checks it.','已提交审核，管理员核对后公开。'))}}).catch(e=>toast(dbErr(e))).finally(()=>{b.disabled=false});return}
 const w=r[0];S.wanted=S.wanted||[];S.wanted.unshift({id:'w'+Date.now(),db:false,mine:true,kind:w.kind,budget:w.budget,zones:w.zones,move:w.move_in||'',stay:w.stay,campus:w.campus,zh:w.zh_home,note:w.note,by,ago:0,contact:r[1]});
 save();closeSheet();tab='wanted';render()}

// For a lister's own room: renters it would suit.
function wantedForRoomHtml(h){const l=wForRoom(h);if(!l.length)return '';
 return `<button class="match wb" data-a="tab" data-v="wanted"><span><b>${l.length} ${t(l.length===1?'renter is looking for a room like this':'renters are looking for a room like this','位租客在找这样的房')}</b><i>${t('See their posts and get in touch.','看看他们的求租，主动联系。')}</i></span><em>→</em></button>`}
// Home and Rooms pages.
function wantedBar(){if(!DB.wantOk)return '';const n=wPublic().filter(w=>!w.mine).length;
 return `<button class="match wb" data-a="tab" data-v="wanted"><span><b>${t('求租 · Post what you need','求租 · 写下你要什么房')}</b><i>${n?`${n} ${t(n===1?'person is looking. Landlords: see who needs a room.':'people are looking. Landlords: see who needs a room.','人正在求租。房东：看看谁需要房。')}`:t('Can’t find it? Post once, and see every new room that fits.','没找到？发一次求租，之后合适的新房源都会显示给你。')}</i></span><em>→</em></button>`}
// Admin desk: wanted posts waiting for review.
function wantedAdminHtml(){const p=(S.wanted||[]).filter(w=>w.db&&(w.status==='pending'||w.hidden));
 return `<div class="sec">${t('Wanted posts to review','待审核的求租')}</div>`+(p.map(w=>`<div class="card"><div class="tt">${liveTag(w)}${esc(wTitle(w))}</div><div class="meta">${esc(w.by)} · ${esc(wMove(w))} · ${ago(w)}</div>${w.note?`<div class="note">${esc(w.note)}</div>`:''}
  <div class="cta"><button class="btn ghost" data-a="want" data-v="${esc(w.id)}">${t('Open','查看')}</button><button class="btn hot" data-a="adrem" data-k="wanted" data-v="${esc(w.id)}">${t('Take down','下架')}</button><button class="btn" data-a="adpub" data-k="wanted" data-v="${esc(w.id)}">${t('Publish','发布')}</button></div></div>`).join('')||`<div class="note">${t('Nothing waiting.','没有待审核的信息。')}</div>`)}
