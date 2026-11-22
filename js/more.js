// Loka · more.js: Everything under More: guide, money tools, admin desk, about, squads, tasks, posters.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
const GUIDE=[['tfn','Apply for a Tax File Number (free, from the ATO)','申请税号 TFN（ATO 免费办理）'],['bank','Open a bank account and set up PayID','开银行账户并设置 PayID'],['sim','Get an Australian SIM','办一张澳洲手机卡'],['go','Set up public transport payment (Translink)','设置公交支付（Translink）'],['vevo','Check your visa work conditions on VEVO','在 VEVO 查看签证工作条件'],['bond','Before paying any bond: confirm it will be lodged with the RTA','交押金前：确认押金会存入 RTA'],['entry','Fill in the entry condition report with dated photos','填写入住状况报告并拍照留底'],['oshc','Know how your health cover works and find a GP','了解医疗保险，找好家庭医生 GP'],['fw','Save the Fair Work pay calculator link','收藏 Fair Work 工资计算器'],['mates','Join one squad this week','这周参加一个局']];

const num=id=>{const e=document.getElementById(id);return e?Math.max(0,parseFloat(e.value)||0):0};
function calc(){const set=(id,html)=>{const e=document.getElementById(id);if(e)e.innerHTML=html};
 const rent=num('m_rent'),fixed=(document.getElementById('m_type')||{}).value==='fixed',bond=rent*RULES.bondWeeks,adv=rent*(fixed?RULES.advFixedWeeks:RULES.advRoom);
 set('m_out',`${t('The most you can be asked for up front','入住前最多可被要求支付')}: <b>$${Math.round(bond+adv)}</b><br>${t('Bond up to','押金最多')} $${Math.round(bond)} + ${t('rent in advance up to','预付房租最多')} $${Math.round(adv)}${fixed?' '+t('(about 1 month)','（约 1 个月）'):''}. ${t('Asked for more? That is a red flag.','被要求更多？这是危险信号。')}`);
 const total=num('r_total'),sz=((document.getElementById('r_sizes')||{}).value||'').split(/[,，\s]+/).map(Number).filter(x=>x>0),sum=sz.reduce((a,b)=>a+b,0);
 set('r_out',sz.length>1?sz.map((s,i)=>`${t('Room','房间')} ${i+1} (${s} m²): <b>$${Math.round((total*0.5/sz.length)+(total*0.5*s/sum))}</b>/${t('wk','周')}`).join('<br>')+`<br><span class="note">${t('Half split evenly for shared areas, half by room size.','一半按人头平分公共区域，一半按房间面积。')}</span>`:t('Enter at least two room sizes.','至少输入两个房间面积。'));
 const rate=num('p_rate'),cas=(document.getElementById('p_type')||{}).value!=='p',min=cas?RULES.minCasual:RULES.minWage,hrs=num('p_hrs'),gap=(min-rate)*hrs;
 set('p_out',rate>=min?`<b>✓</b> ${t('At or above the national minimum. Your award rate may still be higher, so check the Fair Work pay calculator.','不低于全国最低工资。行业 award 可能更高，请用 Fair Work 计算器核对。')}`:`<b style="color:var(--hot)">$${gap.toFixed(0)}</b> ${t('short every week, about','每周少拿，约')} <b style="color:var(--hot)">$${(gap*52).toFixed(0)}</b> ${t('a year, against the adult national minimum of','一年，对比成人全国最低工资')} $${min.toFixed(2)}/${t('h','时')}. ${t('Juniors and some awards differ. The Fair Work Ombudsman helps regardless of visa.','未成年和部分 award 另有标准。Fair Work 不论签证都会受理。')}`);
 const w=num('s_w1')+num('s_w2');
 set('s_out',w<=RULES.studentHrs?`<b>${w}</b> / ${RULES.studentHrs} ${t('hours this fortnight. Within the limit while your course is in session.','小时（本两周）。在上课期间的限额内。')}`:`<b style="color:var(--hot)">${w}</b> / ${RULES.studentHrs}: ${t('over by','超出')} ${w-RULES.studentHrs} ${t('hours. This can put a student visa at risk during term. Limits do not apply in official course breaks.','小时。学期内超时可能影响学生签证；官方假期不受此限。')}`)}

let ADREP=null;
function adminLive(){if(!DB.admin)return `<h1>${t('Admin <em>desk.</em>','管理<em>后台。</em>')}</h1><div class="note">${AUTHU?t('This account is not an admin. The database only lets Loka admins review listings.','这个账户不是管理员。只有 Loka 管理员能审核信息，这由数据库把关。'):t('Sign in with an admin account to review listings.','请用管理员账户登录后审核。')}</div>${AUTHU?'':`<button class="btn" data-a="signin">${t('Sign in','登录')}</button>`}`;
 if(ADREP==null){ADREP=[];dbReports().then(r=>{ADREP=r;if(tab==='admin')render()})}
 const pend=[...S.homes.filter(x=>x.db&&(x.status==='pending'||x.hidden)).map(x=>({k:'homes',x})),...S.jobs.filter(x=>x.db&&(x.status==='pending'||x.hidden)).map(x=>({k:'jobs',x}))];
 const row=({k,x})=>{const fl=k==='homes'?homeFlags(x):jobFlags(x);return `<div class="card"><div class="tt">${liveTag(x)}${esc(x.title)}</div><div class="meta">${k==='homes'?`$${x.rent}/${t('wk','周')} · ${t('bond','押金')} $${x.bond}`:`$${x.pay}/${t('hr','时')}`} · ${esc(x.area)} · ${esc(x.by)} · ${ago(x)}</div>${fl.map(f=>`<span class="flag">⚠ ${f}</span>`).join('')}${x.note?`<div class="note">${esc(x.note)}</div>`:''}
  <div class="cta"><button class="btn ghost" data-a="${k==='homes'?'home':'job'}" data-v="${x.id}">${t('Open','查看')}</button><button class="btn hot" data-a="adrem" data-k="${k}" data-v="${x.id}">${t('Take down','下架')}</button><button class="btn" data-a="adpub" data-k="${k}" data-v="${x.id}">${t('Publish','发布')}</button></div></div>`};
 const find=r=>(S[r.kind]||[]).find(q=>q.id===r.item);
 return `<h1>${t('Admin <em>desk.</em>','管理<em>后台。</em>')}</h1><div class="sub">${t('Live database. Every button here is checked again by the database.','真实数据库。这里的每个操作，数据库都会再核对一次权限。')}</div>
 <div style="display:flex;gap:10px"><div class="stat"><b>${pend.length}</b><span>${t('to review','待审核')}</span></div><div class="stat"><b>${ADREP.length}</b><span>${t('open reports','未处理举报')}</span></div><div class="stat"><b>${S.homes.filter(x=>x.db&&x.verified).length}</b><span>${t('verified','已核实')}</span></div></div>
 <div class="sec">${t('Waiting for review','待审核')}</div>${pend.map(row).join('')||`<div class="note">${t('Nothing waiting.','没有待审核的信息。')}</div>`}
 <div class="sec">${t('Open reports','未处理的举报')}</div>${ADREP.map(r=>{const x=find(r);return `<div class="card"><div class="tt">${x?esc(x.title):t('(already removed)','（已下架）')}</div><div class="meta">${esc(r.kind)} · ${esc(r.why)}</div><div class="cta">${x?`<button class="btn ghost" data-a="${r.kind==='homes'?'home':'job'}" data-v="${x.id}">${t('Open','查看')}</button>`:''}<button class="btn ghost" data-a="adrep" data-v="${r.id}">${t('Close report','关闭举报')}</button></div></div>`}).join('')||`<div class="note">${t('No open reports.','没有未处理的举报。')}</div>`}
 <div class="sec">${t('Verify rooms','核实房源')}</div>${S.homes.filter(x=>x.db&&x.status==='published').map(x=>`<div class="lb"><span style="flex:1;min-width:0"><b style="display:block;overflow-wrap:anywhere">${esc(x.title)}</b><span class="meta">$${x.rent} · ${esc(x.area)}</span></span><button class="paid ${x.verified?'y':''}" data-a="adver" data-v="${x.id}">${x.verified?'✓ '+t('Verified','已核实'):t('Mark verified','标记核实')}</button></div>`).join('')||`<div class="note">${t('No published rooms yet.','还没有已发布的房源。')}</div>`}`}
function adminHtml(){if(DB.on)return adminLive();const all=[...S.homes.map(x=>({k:'homes',x})),...S.jobs.map(x=>({k:'jobs',x}))],find=r=>(S[r.k]||[]).find(q=>q.id===r.id);
 const q=S.reports.filter(find);
 return `<h1>${t('Admin <em>desk.</em>','管理<em>后台。</em>')}</h1><div class="sub">${t('Only you would see this. In this demo it is open; the real one sits behind your login.','正式版只有你登录后可见，演示版暂时开放。')}</div>
 <div style="display:flex;gap:10px"><div class="stat"><b>${all.length}</b><span>${t('listings','条信息')}</span></div><div class="stat"><b>${q.length}</b><span>${t('reported','被举报')}</span></div><div class="stat"><b>${S.homes.filter(x=>x.verified).length}</b><span>${t('verified','已核实')}</span></div></div>
 <div class="sec">${t('Review queue','待处理')}</div>${q.map(r=>{const x=find(r);return `<div class="card"><div class="tt">${esc(x.title)}</div><div class="meta">${esc(x.area)} · ${t('reported','举报原因')}: ${esc(r.why)}</div><div class="cta"><button class="btn ghost" data-a="adkeep" data-k="${r.k}" data-v="${r.id}">${t('Keep','保留')}</button><button class="btn hot" data-a="addel" data-k="${r.k}" data-v="${r.id}">${t('Remove','删除')}</button></div></div>`}).join('')||`<div class="note">${t('Queue is clear.','没有待处理的举报。')}</div>`}
 <div class="sec">${t('Rooms','房源')}</div>${S.homes.map(x=>`<div class="lb"><span style="flex:1;min-width:0"><b style="display:block;overflow-wrap:anywhere">${esc(x.title)}</b><span class="meta">$${x.rent} · ${esc(x.area)}</span></span><button class="paid ${x.verified?'y':''}" data-a="adver" data-v="${x.id}">${x.verified?'✓ '+t('Verified','已核实'):t('Mark verified','标记核实')}</button></div>`).join('')}
 <div class="sec">${t('Scouts','探房员')}</div>${S.scouts.map((x,i)=>`<div class="lb"><span style="flex:1"><b>${esc(x.n)}</b> <span class="meta">${x.leads} ${t('leads','条线索')} · ${x.won} ${t('matched','成交')}</span></span><span class="paid y">${x.earned} ${t('pts','分')}</span></div>`).join('')}
 <div class="note">${t('Points only. No cash is paid per move-in or hire.','只计积分，不按入住或入职发放现金。')}</div>`}
// Privacy notice (APP 1 policy + APP 5 collection notice). DRAFT: get it reviewed before real accounts open.
function privacyHtml(){const P=(h,en,zh)=>`<div class="pv-s"><b>${h}</b><p>${t(en,zh)}</p></div>`;
 return `<h1>${t('Privacy','隐私说明')}</h1><div class="note warn">${t('Draft, 18 Nov 2026. To be reviewed by a lawyer before Loka opens real accounts.','草稿，2026 年 11 月 18 日。Loka 开放真实账户前须经律师审阅。')}</div>
 ${P(t('Who we are','我们是谁'),'Loka (布村生活站) is a notice board for rooms and jobs in Brisbane. '+(BRAND.contact?'Contact: '+BRAND.contact:'A contact email will be listed here before accounts open.'),'Loka（布村生活站）是布里斯班的房源和工作信息板。'+(BRAND.contact?'联系邮箱：'+BRAND.contact:'开放账户前会在这里列出联系邮箱。'))}
 ${P(t('What we collect','我们收集什么'),'Browsing needs nothing. If you sign in: your email address, or your Australian mobile number, or the name and email Google shares when you choose Google. If you post: the listing details you type and photos of the room. If you report something: your report. We never ask for ID documents, ID numbers, your date of birth or bank details.','浏览不需要任何资料。登录时：你的邮箱，或澳洲手机号，或你选择 Google 登录时 Google 提供的名字和邮箱。发布时：你填写的房源资料和房间照片。举报时：你的举报内容。我们绝不会要求证件、证件号码、出生日期或银行资料。')}
 ${P(t('Why','为什么收集'),'To sign you in, keep listings honest, contact you about your own listings or reports, and stop scams. Your phone number is only used to send sign-in codes, never for marketing.','用于登录、维护房源真实性、就你自己的房源或举报联系你，以及防止诈骗。手机号只用来发送登录验证码，绝不用于营销。')}
 ${P(t('Who else handles it','谁会经手'),'Supabase (account database, Sydney region), Vercel (website hosting) and Resend (sends the sign-in code emails). A private backup copy of the database is emailed to Loka\'s owner once a week so nothing is lost if a service fails; it is deleted when no longer needed. If you use Google sign-in, Google handles that step. These services may process data outside Australia. Other people see only what you choose to put in a listing.','Supabase（账户数据库，悉尼区域）、Vercel（网站托管）和 Resend（发送登录验证码邮件）。数据库的私密备份每周一次以邮件发给 Loka 负责人，以免某项服务出故障时丢失资料；不再需要时会删除。若你用 Google 登录，该步骤由 Google 处理。这些服务可能在澳洲境外处理数据。其他人只会看到你自己放进房源的内容。')}
 ${P(t('Checks we do','我们的核实'),'When Loka checks a lister, we look at ID on a video call or in person and keep no copy, photo or number. We only record the date the check was done.','Loka 核实发布人时，只通过视频或当面查看证件，不留复印件、照片或号码，只记录核实日期。')}
 ${P(t('Age','年龄'),'Accounts are for people aged 18 and over, because renting and work agreements are for adults.','账户只供 18 岁及以上人士使用，因为租房和工作协议都由成年人签订。')}
 ${P(t('Keeping it safe and how long','安全与保存期限'),'Sign-in uses one-time codes, and you can add two-step verification with an authenticator app. We delete a listing’s details when it is taken down, except what we must keep to deal with a report.','登录使用一次性验证码，你也可以用验证器 app 开启两步验证。房源下架后会删除其资料，处理中的举报所需资料除外。')}
 ${P(t('Your rights','你的权利'),'You can ask to see, correct or delete your information'+(BRAND.contact?' by emailing '+BRAND.contact:'')+'. If you are unhappy with our answer, you can complain to the Office of the Australian Information Commissioner (oaic.gov.au).','你可以要求查看、更正或删除你的资料'+(BRAND.contact?'，邮件联系 '+BRAND.contact:'')+'。如对我们的处理不满意，可向澳大利亚信息专员办公室（oaic.gov.au）投诉。')}`}
function followHtml(){if(!BRAND.instagram&&!BRAND.threads)return'';
 return `<div class="follow">${BRAND.instagram?`<a class="sh ig" href="https://www.instagram.com/${encodeURIComponent(BRAND.instagram)}/" target="_blank" rel="noopener"><span class="shi">${ico('igl')}</span><span><b>Instagram</b><i>@${esc(BRAND.instagram)}</i></span></a>`:''}${BRAND.threads?`<a class="sh th" href="https://www.threads.com/intent/follow?username=${encodeURIComponent(BRAND.threads)}" target="_blank" rel="noopener"><span class="shi">${ico('thr')}</span><span><b>Threads</b><i>@${esc(BRAND.threads)}</i></span></a>`:''}</div>`}
function aboutHtml(){const r=(b,en,zh)=>`<div class="rule"><b>${b}</b> · ${t(en,zh)}</div>`;
 return `<h1>${t('How Loka <em>works.</em>','Loka <em>怎么运作。</em>')}</h1><div class="sub">${t('A free notice board for rooms and jobs, with checks built in.','一个免费的房源和工作信息板，自带规则检查。')}</div>
 <div class="sec">${t('What Loka is not','Loka 不是什么')}</div>
 ${r(t('Not an agent','不是中介'),'Loka is not a real estate agent. It does not negotiate, arrange inspections for a lister, or sign anything.','Loka 不是房产中介，不代谈价格、不代办看房、不代签任何文件。')}
 ${r(t('No money','不经手资金'),'Loka never collects rent or bond, and takes no fee or commission when someone moves in.','Loka 不代收租金或押金，成交也不收取任何费用或佣金。')}
 ${r(t('Your deal','你们的约定'),'Any agreement is between the renter and the lister.','任何租约都是租客和发布人之间的事。')}
 <div class="sec">${t('Listing rules','发布规则')}</div>
 ${r(t('Fixed price','固定价格'),'One weekly rent. No price ranges and no “make an offer”.','只写一个周租，不能写区间，也不能“欢迎出价”。')}
 ${r(t('Bond','押金'),'4 weeks of rent at most, lodged with the RTA within 10 days.','最多 4 周房租，并在 10 天内存入 RTA。')}
 ${r(t('Rent in advance','预付房租'),'2 weeks at most for a room or periodic agreement, 1 month for a fixed term.','合租房间或无固定期租约最多 2 周，固定期租约最多 1 个月。')}
 ${r(t('Sub-letting','转租'),'A tenant who sub-lets needs the owner’s written permission.','租客转租须有业主的书面同意。')}
 ${r(t('Honest','真实'),'Real photos and true details. Misleading listings are removed.','照片和信息必须真实，误导性房源会被删除。')}
 <button class="btn ghost" data-a="vinfo">${t('What “Verified” means','“已核实”代表什么')}</button>
 <div class="sec">${t('Your information','你的信息')}</div>
 ${r('ID','When Loka verifies a lister we look at ID and keep no copy. Renters can also show ID without handing over a copy.','Loka 核实发布人时只查看证件、不留存。租客也可以只出示证件，不交复印件。')}
 ${r(t('This demo','演示版'),'What you type stays on this phone.','你输入的内容只保存在这台手机上。')}
 <div class="note">${t('General information, not legal advice. For your own situation check the Residential Tenancies Authority.','以上为一般信息，不构成法律建议。具体情况请查阅昆州 RTA。')} <a href="https://www.rta.qld.gov.au/">rta.qld.gov.au</a></div>`}

function detail(id){const q=S.squads.find(x=>x.id===id);if(!q)return;const isHost=S.me&&q.host===S.me,me=inSquad(q),w=inWait(q),l=left(q);
 let h=`<div class="tt" style="font-size:21px">${sp(q.sport)[0]} ${esc(q.title)}</div><div class="meta">${when(q.start)} · ${q.mins} min<br>${esc(q.venue)}, ${esc(q.area)}</div>
 <span class="tag">${t(lv(q.level)[0],lv(q.level)[1])}</span><span class="tag">${q.price?'$'+q.price+t(' each','/人'):t('Free','免费')}</span> ${badge(q)}
 ${q.note?`<div class="note">${esc(q.note)}</div>`:''}`;
 if(!S.me)h+=`<label>${t('Your name to join','填名字上车')}</label><input id="joinName" placeholder="${t('e.g. Jing','例如 阿良')}">`;
 if(me)h+=`<button class="btn ghost" data-a="leave" data-v="${id}">${t('Drop out (next on waitlist takes your spot)','退出（候补自动顶上）')}</button>`;
 else if(w)h+=`<button class="btn ghost" data-a="leave" data-v="${id}">${t('Leave waitlist','退出候补')}</button>`;
 else h+=`<button class="btn ${l<=2&&l>0?'hot':''}" data-a="join" data-v="${id}">${l>0?t('Join this squad','上车'):t('Join waitlist','排候补')}</button>`;
 if(q.price&&q.payid&&me)h+=`<div class="card" style="margin-top:12px"><div class="meta">${t('Pay the host by PayID','用 PayID 付给局主')}</div><div class="tt">${esc(q.payid)} · $${q.price}</div><button class="btn ghost" data-a="copy" data-v="${esc(q.payid)}">${t('Copy PayID','复制 PayID')}</button><button class="btn" data-a="paid" data-v="${id}">${q.players.find(p=>p.n===S.me).paid?t('Marked as paid ✓','已标记付款 ✓'):t("I've paid",'我已付款')}</button></div>`;
 h+=`<button class="btn ghost" data-a="poster" data-v="${id}">🖼 ${t('Make a share poster','生成朋友圈海报')}</button><button class="btn ghost" data-a="invite" data-v="${id}">${t('Copy invite text','复制邀请文案')}</button>
 <div class="sec">${t('Roster','名单')} ${q.players.length}/${q.cap}${q.price?' · '+q.players.filter(p=>p.paid).length+' '+t('paid','已付'):''}</div>`;
 h+=q.players.map(p=>`<div class="pl"><span><span class="av">${esc(p.n.slice(0,1).toUpperCase())}</span>${esc(p.n)}${p.n===q.host?' ★':''}</span>${q.price?(isHost?`<button class="paid ${p.paid?'y':''}" data-a="hostpaid" data-v="${id}" data-n="${esc(p.n)}">${p.paid?t('Paid','已付'):t('Unpaid — tap','未付·点击')}</button>`:`<span class="paid ${p.paid?'y':''}">${p.paid?t('Paid','已付'):t('Unpaid','未付')}</span>`):''}</div>`).join('');
 if(q.wait.length)h+=`<div class="sec">${t('Waitlist','候补')}</div>`+q.wait.map((n,i)=>`<div class="pl"><span><span class="av">${i+1}</span>${esc(n)}</span></div>`).join('');
 if(isHost)h+=`<div class="note">${t('You are the host: tap a payment tag to confirm it.','你是局主：点付款标签即可确认。')}</div>`;
 openSheet(h)}

function squadForm(){openSheet(`<div class="tt" style="font-size:21px">${t('Start a squad','发起一局')}</div>
 <label>${t('Type','类型')}</label><select id="f_sport">${Object.keys(SPORT).map(k=>`<option value="${k}">${SPORT[k][0]} ${t(SPORT[k][1],SPORT[k][2])}</option>`).join('')}</select>
 <label>${t('Title','标题')}</label><input id="f_title" placeholder="${t('Thursday doubles','周四双打')}">
 <div class="g2"><div><label>${t('Suburb','区域')}</label><input id="f_area" placeholder="Sunnybank Hills"></div><div><label>${t('Venue / meeting point','场地/集合点')}</label><input id="f_venue" list="courtlist" autocomplete="off"><datalist id="courtlist">${COURTS.map(c=>`<option value="${esc(c.name)}">${esc(c.area)}</option>`).join('')}</datalist></div></div>
 <div class="g2"><div><label>${t('Date & time','日期时间')}</label><input id="f_start" type="datetime-local"></div><div><label>${t('Minutes','时长(分钟)')}</label><input id="f_mins" type="number" inputmode="decimal" value="120"></div></div>
 <div class="g2"><div><label>${t('Level','水平')}</label><select id="f_level">${Object.keys(LEVEL).map(k=>`<option value="${k}">${t(LEVEL[k][0],LEVEL[k][1])}</option>`).join('')}</select></div><div><label>${t('Spots','人数')}</label><input id="f_cap" type="number" inputmode="decimal" value="8"></div></div>
 <div class="g2"><div><label>${t('$ per person (0 = free)','人均 $（0=免费）')}</label><input id="f_price" type="number" inputmode="decimal" value="15"></div><div><label>${t('Your PayID (optional)','你的 PayID（可选）')}</label><input id="f_payid"></div></div>
 ${S.me?'':`<label>${t('Your name','你的名字')}</label><input id="f_host">`}
 <label>${t('Note','备注')}</label><textarea id="f_note" rows="2"></textarea>
 <button class="btn" data-a="create">${t('Publish squad','发布')}</button>`)}

function taskForm(){openSheet(`<div class="tt" style="font-size:21px">${t('Post a task','发布任务')}</div>
 <label>${t('What do you need?','需要什么帮忙？')}</label><input id="k_title"><div class="g2"><div><label>${t('Suburb','区域')}</label><input id="k_area"></div><div><label>${t('Reward $','酬劳 $')}</label><input id="k_reward" type="number" inputmode="decimal" value="30"></div></div>
 ${S.me?'':`<label>${t('Your name','你的名字')}</label><input id="k_by">`}<button class="btn" data-a="createtask">${t('Post','发布')}</button>`)}

// ───────── poster (canvas → image; long-press to save) ─────────
const THEMES={neon:{bg:['#F4F0E7','#EBE4D6'],ac:'#1F6F5C',tx:'#191512',mu:'#6B645A',on:'#fff'},gold:{bg:['#0d0b08','#2a2010'],ac:'#f3c969',tx:'#fff7e6',mu:'#b9a988',on:'#1a1408'},day:{bg:['#E2683C','#b84c26'],ac:'#F4F0E7',tx:'#ffffff',mu:'#ffd9c9',on:'#191512'}};
function drawPoster(q){const T=THEMES[posterTheme],c=document.createElement('canvas');c.width=1080;c.height=1440;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,1080,1440);g.addColorStop(0,T.bg[0]);g.addColorStop(1,T.bg[1]);x.fillStyle=g;x.fillRect(0,0,1080,1440);
 x.globalAlpha=.10;x.fillStyle=T.ac;x.beginPath();x.arc(1010,250,330,0,7);x.fill();x.globalAlpha=.08;x.beginPath();x.arc(60,1400,260,0,7);x.fill();x.globalAlpha=1;x.fillStyle=T.ac;x.fillRect(80,160,120,8);
 const F=(w,s)=>x.font=`${w} ${s}px "Nunito","Noto Sans SC",sans-serif`;
 x.fillStyle=T.ac;F(900,54);x.fillText(BRAND.en+'. '+BRAND.zh,80,120);
 x.fillStyle=T.mu;F(500,34);x.textAlign='right';x.fillText('BRISBANE',1000,120);x.textAlign='left';
 const l=left(q);x.fillStyle=T.ac;F(900,l>0&&l<=9?300:190);
 const big=l>0?(S.lang==='zh'?`${q.cap}缺${l}`:`NEED ${l}`):(S.lang==='zh'?'已满员':'FULL');
 let fs=l>0?300:220;F(900,fs);while(x.measureText(big).width>900){fs-=10;F(900,fs)}x.fillText(big,74,560);
 x.fillStyle=T.tx;F(700,62);wrap(x,sp(q.sport)[0]+' '+q.title,80,700,920,80,2);
 x.fillStyle=T.mu;F(500,44);x.fillText(when(q.start)+' · '+q.mins+' min',80,900);
 x.fillStyle=T.tx;F(500,44);wrap(x,'📍 '+q.venue+', '+q.area,80,972,920,58,2);
 const pills=[t(lv(q.level)[0],lv(q.level)[1]),q.price?'$'+q.price+t(' each','/人'):t('Free','免费'),q.players.length+'/'+q.cap+t(' in',' 人')];let px=80;F(700,38);
 pills.forEach(p=>{const w=x.measureText(p).width+48;x.strokeStyle=T.ac;x.lineWidth=3;rr(x,px,1108,w,70,35);x.stroke();x.fillStyle=T.ac;x.fillText(p,px+24,1157);px+=w+18});
 x.fillStyle=T.ac;rr(x,80,1236,920,130,34);x.fill();x.fillStyle=T.on;F(900,50);x.textAlign='center';x.fillText(t('Tap in before it fills','名额有限，先到先得'),540,1298);F(500,34);x.fillText(BRAND.url+' · '+t('hosted by ','局主 ')+q.host,540,1344);x.textAlign='left';
 return c.toDataURL('image/png')}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wrap(x,s,a,b,w,lh,max){let line='',n=0;for(const ch of Array.from(s)){if(x.measureText(line+ch).width>w){x.fillText(line,a,b+n*lh);n++;line=ch.trim();if(n>=max)return}else line+=ch}if(n<max)x.fillText(line,a,b+n*lh)}
function poster(id){const q=S.squads.find(x=>x.id===id);const go=()=>openSheet(`<div class="tt" style="font-size:21px">${t('Share poster','分享海报')}</div><div class="meta">${t('Long-press the image to save it, then post to WeChat Moments, Instagram or your group.','长按图片保存，发朋友圈 / 微信群 / Instagram。')}</div>
 <div class="themes">${[['neon',t('Cream','奶白')],['gold',t('Black gold','黑金')],['day',t('Coral','珊瑚橙')]].map(m=>`<button class="${posterTheme===m[0]?'on':''}" data-a="theme" data-v="${m[0]}" data-id="${id}">${m[1]}</button>`).join('')}</div>
 <img class="poster" alt="${esc(q.title)} poster" src="${drawPoster(q)}"><button class="btn ghost" data-a="open" data-v="${id}">${t('Back','返回')}</button>`);
 (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(go,go)}
function inviteText(q){const l=left(q);return S.lang==='zh'?`${sp(q.sport)[0]} ${q.title}\n${when(q.start)}｜${q.venue}, ${q.area}\n${lv(q.level)[1]}｜${q.price?'$'+q.price+'/人':'免费'}\n${l>0?`还差 ${l} 人`:'已满，可排候补'} → ${BRAND.url}`:`${sp(q.sport)[0]} ${q.title}\n${when(q.start)} | ${q.venue}, ${q.area}\n${lv(q.level)[0]} | ${q.price?'$'+q.price+' each':'Free'}\n${l>0?`${l} spot${l>1?'s':''} left`:'Full, waitlist open'} → ${BRAND.url}`}
