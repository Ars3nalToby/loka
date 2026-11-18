// Loka · app.js: render() for every screen, all click/input handlers, start-up. Loads last.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
function render(){
 document.documentElement.lang=S.lang==='zh'?'zh':'en';
 const a=document.getElementById('app');const back=`<button class="back" data-a="tab" data-v="home">← ${t('Home','首页')}</button>`;
 const zh=S.lang==='zh';
 let h=`<header id="top" class="${tab==='home'?'onposter':''}${scrollY>8?' stuck':''}"><button class="brand" data-a="tab" data-v="home" aria-label="${t('Loka home','Loka 首页')}"><span class="mark" aria-hidden="true"><i>L</i><b></b></span><span class="wm"><span class="nm">${esc(BRAND.en)}<b>.</b></span><span class="tg"><em>${esc(BRAND.zh)}</em><s></s>Brisbane</span></span></button>
 <div class="seg" role="group" aria-label="${t('Language','语言')}"><button ${zh?'data-a="lang"':'class="on" aria-pressed="true"'}>EN</button><button ${zh?'class="on" aria-pressed="true"':'data-a="lang"'}>中文</button></div></header>`;
 if(tab==='home'){
  const need=S.squads.filter(q=>left(q)>0&&left(q)<=2);const bad=S.homes.filter(x=>homeFlags(x).length).length+S.jobs.filter(x=>jobFlags(x).length).length;
  h+=`<section class="hposter"><div class="pbig">${esc(BRAND.en)}<b>.</b></div><div class="ptg"><em>${esc(BRAND.zh)}</em><s></s>BRISBANE</div>
  <h1>${t('Find a room.<br><em>Find a job.</em>','招租，找工。<br><em>用你的语言。</em>')}</h1>
  <div class="p2">${t('招租，找工。<em>用你的语言。</em>','Find a room. <em>Find a job.</em>')}</div>
  <div class="psub">${t('Brisbane rooms and jobs checked against Queensland rules, with verified listings clearly marked. For students, working-holiday makers, new arrivals and locals.','布里斯班的房和工，按昆州规定逐条检查，核实过的房源清楚标注。给留学生、打工度假、新移民和本地人。')}</div></section>
  <div class="demo">${t('Demo build with sample listings. Data stays on this phone until the shared database is connected.','演示版，房源和工作均为示例；数据只存在这台手机上。')}</div>
  <div class="duo">
   <button class="hero r" data-a="tab" data-v="homes"><span class="e">${HERO_ART.rooms}</span><div class="n">${t('Rooms','招租')}</div><div class="d">${S.homes.length} ${t('listed','条')} · ${t('from','最低')} $${Math.min(...S.homes.map(x=>x.rent))}/${t('wk','周')}</div></button>
   <button class="hero j" data-a="tab" data-v="jobs"><span class="e">${HERO_ART.jobs}</span><div class="n">${t('Jobs','找工')}</div><div class="d">${S.jobs.length} ${t('listed','条')} · ${t('up to','最高')} $${Math.max(...S.jobs.map(x=>x.pay))}/${t('hr','时')}</div></button>
  </div>
  <button class="match" data-a="match"><span><b>${t('Match me in 3 taps','三步帮我配')}</b><i>${t('Budget, side of town, language. Get a room and a job that fit together.','预算、区域、语言，配出能一起成立的房和工。')}</i></span><em>→</em></button>
  <div class="sec row2"><span>${t('New rooms','新上房源')}</span><button class="link sm" data-a="tab" data-v="homes">${t('See all','查看全部')} →</button></div>
  <div class="strip">${[...S.homes].sort((a,b)=>(a.ago||0)-(b.ago||0)).slice(0,4).map(x=>`<button class="mini-room" data-a="home" data-v="${x.id}"><div class="pic">${art(x)}</div><div class="mr-b"><span class="price">$${x.rent}<small>/${t('wk','周')}</small></span><span class="mr-a">${ico('pin')} ${esc(x.area)}</span></div></button>`).join('')}</div>
  <div class="sec">${t('Where things are','都在哪儿')}</div><div class="map">${mapSvg()}</div>${mapLegend()}<div class="note">${t('Tap a pin or a zone to open the room map there. Squares are campuses.','点地图上的数字或区域，直接打开那一区的房源地图。黑色方块是大学校区。')}</div>
  <div class="sec">${t('More on Loka','Loka 还能做什么')}</div>
  <div class="tiles">
   <button class="tile" data-a="tab" data-v="earn"><div class="e">${ico('scout')}</div><div class="n">${t('Be a scout','做探房员')}</div><div class="d">${t('Visit, photograph, verify','实地看房、拍照、核实')}</div></button>
   <button class="tile" data-a="tab" data-v="play"><div class="e">${ico('squad')}</div><div class="n">${t('Squads','拼局')}</div><div class="d">${need.length} ${t('need players now','个局正在缺人')}</div></button>
   <button class="tile" data-a="tab" data-v="help"><div class="e">${ico('favour')}</div><div class="n">${t('Favours','帮忙')}</div><div class="d">${t('Pickups, moving, translation','接机、搬家、翻译')}</div></button>
   <button class="tile" data-a="tab" data-v="tools"><div class="e">${ico('tools')}</div><div class="n">${t('Money tools','算账工具')}</div><div class="d">${t('Move-in cost, pay check','入住成本、工资核对')}</div></button>
   <button class="tile" data-a="tab" data-v="guide" style="grid-column:1/3"><div class="e">${ico('guide')}</div><div class="n">${t('First 30 days','落地 30 天')} · ${S.done.length}/${GUIDE.length}</div><div class="d">${t('The checklist and the rules that stop you getting ripped off','落地清单和防坑规则')}</div></button>
  </div>
  <div class="sec">${t('Guides on 小红书','小红书攻略')}</div><div class="xhs">${[['doc','Sunnybank job-hunt guide','Sunnybank 找工全攻略'],['house','Brisbane rental traps to avoid','布里斯班租房避坑指南'],['coin','Legal pay and tax back basics','合法时薪与退税']].map(g=>`<a href="https://www.xiaohongshu.com/"><span>${ico(g[0])}</span>${t(g[1],g[2])}<i>小红书 · ${t('coming soon','即将上线')}</i></a>`).join('')}</div>
  <div class="res">${t('Loka is flagging','Loka 目前标记出')} <b>${bad}</b> ${t('sample listings that break a rule: bond over 4 weeks or pay under the minimum.','条违规示例：押金超过 4 周或时薪低于最低工资。')}</div><button class="link" data-a="tab" data-v="about">${t('How Loka works and the listing rules','Loka 怎么运作 · 发布规则')}</button>`;
  if(need.length)h+=`<div class="sec">${t('One spot short','就差一个')}</div>`+need.map(q=>`<button class="card" data-a="open" data-v="${q.id}"><div class="row"><div><div class="tt">${sp(q.sport)[0]} ${esc(q.title)}</div><div class="meta">${when(q.start)} · ${esc(q.area)}</div></div>${badge(q)}</div></button>`).join('');
 }
 if(tab==='homes'){
  h+=`<h1>${t('Rooms, <em>without the traps.</em>','招租，<em>不踩坑。</em>')}</h1><div class="sub${rview==='map'?' hide':''}">${t('Sorted cheapest first. Red flags are worked out from Queensland rental rules.','按价格从低到高。红色警示根据昆州租房规定自动计算。')}</div>
  <input class="search" id="hq" placeholder="${t('Suburb or uni, e.g. Sunnybank, UQ','区或学校，如 Sunnybank、UQ')}" value="${esc(hf.q)}">
  <div class="chips zc">${[['',t('All areas','全部区域')],...Object.keys(ZN).map(z=>[z,t(ZN[z][0],ZN[z][1])])].map(c=>`<button class="chip ${(hf.z||'')===c[0]?'on':''}" data-a="hz" data-v="${c[0]}">${c[0]?`<i style="background:${ZCOL[c[0]].ink}"></i>`:''}${c[1]}</button>`).join('')}</div>
  <details class="moref" ${hfOpen?'open':''}><summary>${ico('sliders')} ${t('Filters','筛选')}${hfCount()?` <b>${hfCount()}</b>`:''}</summary>
  <div class="chips">${[['all',t('All','全部')],...Object.keys(HT).map(k=>[k,t(HT[k][1],HT[k][2])])].map(c=>`<button class="chip ${hf.type===c[0]?'on':''}" data-a="hf" data-k="type" data-v="${c[0]}">${c[1]}</button>`).join('')}</div>
  <div class="chips">${[[0,t('Any price','不限价')],[250,'≤ $250'],[350,'≤ $350'],[500,'≤ $500']].map(c=>`<button class="chip ${hf.max===c[0]?'on':''}" data-a="hf" data-k="max" data-v="${c[0]}">${c[1]}</button>`).join('')}<button class="chip ${hf.zh?'on':''}" data-a="hf" data-k="zh">${t('中文 OK','中文沟通')}</button><button class="chip ${hf.nobond?'on':''}" data-a="hf" data-k="nobond">${t('No bond','免押金')}</button><button class="chip ${hf.bills?'on':''}" data-a="hf" data-k="bills">${t('Bills included','包水电')}</button><button class="chip ${hf.clean?'on':''}" data-a="hf" data-k="clean">${t('No red flags','无警示')}</button></div>
  </details>
  <div class="chips cc"><span class="cl">${ico('cap')} ${t('Near','靠近')}</span>${SUBURB_DATA.campuses.filter(c=>['uq','qut-gp','gu-nathan','gu-sb'].includes(c.id)).map(c=>`<button class="chip ${hf.c===c.id?'on':''}" data-a="hc" data-v="${c.id}">${CAMPUS_SHORT[c.id]}</button>`).join('')}</div>
  <div class="bar2"><div class="vt" role="group" aria-label="${t('View','视图')}"><button class="${rview==='list'?'on':''}" data-a="rv" data-v="list">${ico('list')} ${t('List','列表')}</button><button class="${rview==='map'?'on':''}" data-a="rv" data-v="map">${ico('map')} ${t('Map','地图')}</button></div><button class="post" data-a="newhome">+ ${t('List a place','发布房源')}</button></div>
  ${rview==='map'?`<div class="rmap">${mapSvg({rooms:true})}${hf.z?`<button class="mzout" data-a="hz" data-v="${hf.z}">${t('Whole city','看全城')}</button>`:''}</div><div id="mprev">${mapPreview()}</div><div class="maplegend"><span><i class="g"></i>${t('Verified','已核实')}</span><span><i class="k"></i>${t('Not yet verified','尚未全部核实')}</span><span><i class="sq"></i>${t('Campus','校区')}</span></div>`:`<div id="cnt" class="cntl"></div><div id="list">${listHomes()}</div>`}`;
 }
 if(tab==='jobs'){
  h+=`<h1>${t('Jobs that <em>pay legally.</em>','找工，<em>时薪合法。</em>')}</h1><div class="sub">${t(`National minimum from 1 July 2026: $${RULES.minWage}/h, or $${RULES.minCasual}/h casual. Your award may be higher.`,`2026年7月1日起全国最低工资：$${RULES.minWage}/时，临时工 $${RULES.minCasual}/时。行业 award 可能更高。`)}</div>
  <input class="search" id="jq" placeholder="${t('Suburb or role','区或职位')}" value="${esc(jf.q)}">
  <div class="chips"><button class="chip ${jf.zh?'on':''}" data-a="jf" data-k="zh">${t('Mandarin a plus','会中文优先')}</button><button class="chip ${jf.cash?'on':''}" data-a="jf" data-k="cash">${t('Cash','现金')}</button><button class="chip ${jf.fair?'on':''}" data-a="jf" data-k="fair">${t('Hide under-minimum pay','隐藏低于最低工资')}</button></div>
  <div class="bar2"><span id="cnt"></span><button class="post" data-a="newjob">+ ${t('Post a job','发布工作')}</button></div><div id="list">${listJobs()}</div>`;
 }
 if(tab==='play'){
  const list=S.squads.filter(q=>filter==='all'||q.sport===filter).sort((x,y)=>new Date(x.start)-new Date(y.start));
  h+=back+`<h1>${t('One spot short? <em>Fill it in a tap.</em>','差一个人？<em>一键凑齐。</em>')}</h1><div class="sub">${t('Games, runs, rides and tables that need people this week.','本周正在缺人的球局、跑团、骑行和饭局。')}</div>
  <div class="chips">${[['all','✨',t('All','全部')],...Object.keys(SPORT).map(k=>[k,SPORT[k][0],t(SPORT[k][1],SPORT[k][2])])].map(c=>`<button class="chip ${filter===c[0]?'on':''}" data-a="filter" data-v="${c[0]}">${c[1]} ${c[2]}</button>`).join('')}</div>`;
  h+=list.map(q=>{const pct=Math.min(100,q.players.length/q.cap*100);return `<button class="card" data-a="open" data-v="${q.id}">
   <div class="row"><div><div class="tt">${sp(q.sport)[0]} ${esc(q.title)}</div><div class="meta">${when(q.start)} · ${esc(q.area)}</div></div>${badge(q)}</div>
   <span class="tag">${t(lv(q.level)[0],lv(q.level)[1])}</span><span class="tag">${q.price?'$'+q.price+t(' each','/人'):t('Free','免费')}</span>${inSquad(q)?`<span class="tag b">${t("You're in",'已上车')}</span>`:''}
   <div class="bar"><i style="width:${pct}%"></i></div><div class="foot"><span>${q.players.length}/${q.cap} ${t('in','人')}</span><span>${t('Host','局主')}: ${esc(q.host)}</span></div></button>`}).join('');
  h+=`<button class="btn" data-a="new">+ ${t('Start a squad','发起一局')}</button>`;
 }
 if(tab==='help'){
  h+=back+`<h1>${t('Need a hand? <em>Name the price.</em>','找人帮忙？<em>明码标价。</em>')}</h1><div class="sub">${t('Airport pickups, moving, translation at inspections, coaching.','接机、搬家、看房翻译、陪练。')}</div>`;
  h+=S.tasks.map(k=>`<div class="card"><div class="row"><div><div class="tt">${esc(k.title)}</div><div class="meta">${esc(k.area)} · ${t('posted by','发布人')} ${esc(k.by)}</div></div><span class="badge b-open">$${k.reward}</span></div>
   <div class="foot"><span>${k.helpers.length} ${t('offered to help','人愿意帮')}</span><button data-a="offer" data-v="${k.id}" style="color:var(--lime);font-weight:700">${k.helpers.includes(S.me)&&S.me?t('Offered ✓','已报名 ✓'):t('I can help','我可以帮')}</button></div></div>`).join('');
  h+=`<div class="note">${t('Payment is settled directly between the two people. Loka does not hold money in this version.','由双方直接结算，本版本 Loka 不经手资金。')}</div><button class="btn" data-a="newtask">+ ${t('Post a task','发布任务')}</button>`;
 }
 if(tab==='earn'){const mx=Math.max(...S.scouts.map(x=>x.earned));
  h+=back+`<h1>${t('Seen a room or a job? <em>Share it.</em>','看到空房或招工？<em>发出来。</em>')}</h1><div class="sub">${t('Scouts post real rooms and jobs they have seen and help verify listings. Scouts earn points and a badge. Loka pays no cash per move-in or hire.','探房员发布亲眼见到的房源和工作，并协助核实。探房员获得积分和徽章；Loka 不按入住或入职发放现金。')}</div>
  <div class="card">${[['1','Spot a job or room','看到招工或空房','A shop hiring, a room free, anywhere in Brisbane.','店里招人、有房出租，布里斯班任何地方。'],['2','Post it here','发到 Loka','30 seconds, with a contact.','30 秒，留个联系方式。'],['3','Earn points','攒积分','Points for each lead that checks out.','线索核实通过即得积分。']].map(x=>`<div class="step"><b>${x[0]}</b><div><div class="tt">${t(x[1],x[2])}</div><div class="meta">${t(x[3],x[4])}</div></div></div>`).join('')}
  <div class="cta"><button class="btn" data-a="newjob">${t('Post a job lead','发工作线索')}</button><button class="btn ghost" data-a="newhome">${t('Post a room','发房源')}</button></div></div>
  <div class="sec">${t('Scout leaderboard','信息员排行榜')}</div><div class="card">${S.scouts.map((x,i)=>`<div class="lb"><span class="rk">${i+1}</span><span style="width:64px;font-weight:600">${esc(x.n)}</span><span class="tr"><i style="width:${x.earned/mx*100}%"></i></span><span class="price" style="font-size:17px">${x.earned}<small> ${t('pts','分')}</small></span></div>`).join('')}</div>
  <div class="note">${t('Sample leaderboard. Points only: in Queensland, being paid for letting someone else’s property can require a real estate licence.','示例排行榜。只计积分：在昆州，替他人出租房屋并收取报酬可能需要房产中介牌照。')}</div>`;
 }
 if(tab==='ask')h+=askHtml();
 if(tab==='about')h+=back+aboutHtml()+followHtml();
 if(tab==='privacy')h+=`<button class="back" data-a="tab" data-v="me">← ${t('Me','我的')}</button>`+privacyHtml();
 if(tab==='admin')h+=`<button class="back" data-a="tab" data-v="me">← ${t('Me','我的')}</button>`+adminHtml();
 if(tab==='guide'){
  h+=back+`<h1>${t('Your first 30 days.','落地 30 天。')}</h1><div class="sub">${S.done.length}/${GUIDE.length} ${t('done','已完成')}</div><div class="bar"><i style="width:${S.done.length/GUIDE.length*100}%"></i></div>`;
  h+=GUIDE.map(g=>`<button class="chk ${S.done.includes(g[0])?'on':''}" data-a="done" data-v="${g[0]}"><span class="bx">${S.done.includes(g[0])?'✓':''}</span><span class="tx">${t(g[1],g[2])}</span></button>`).join('');
  h+=`<div class="sec">${t('Rules worth knowing','必知规则')}</div>
  <div class="rule"><b>${t('Bond','押金')}</b> · ${t('Maximum 4 weeks of rent in Queensland, lodged with the RTA.','昆州最多 4 周房租，须存入 RTA。')}</div>
  <div class="rule"><b>${t('Rent in advance','预付房租')}</b> · ${t('At most 2 weeks for a room or periodic agreement, 1 month for a fixed-term lease.','合租房间或无固定期租约最多 2 周，固定期租约最多 1 个月。')}</div>
  <div class="rule"><b>${t('Rent increases','涨租')}</b> · ${t('No more than once every 12 months, and the limit follows the property.','每 12 个月最多一次，且跟着房子走。')}</div>
  <div class="rule"><b>${t('Rent bidding','竞价租房')}</b> · ${t('Banned. Nobody may ask you to offer above the advertised rent.','已禁止，不得要求你出价高于挂牌价。')}</div>
  <div class="rule"><b>${t('Minimum wage','最低工资')}</b> · $${RULES.minWage}/${t('h','时')}, ${t('casual','临时工')} $${RULES.minCasual}/${t('h','时')} (${t('from 1 July 2026','2026年7月1日起')}).</div>
  <div class="rule"><b>${t('Student visa work','学生签证打工')}</b> · ${t('48 hours per fortnight while your course is in session. Check VEVO for your own conditions.','上课期间每两周 48 小时，具体以 VEVO 为准。')}</div>
  <div class="note">${t('General information, not legal or migration advice. Check the RTA, Fair Work Ombudsman and Home Affairs for your situation.','以上为一般信息，不构成法律或移民建议，请以 RTA、Fair Work、Home Affairs 为准。')}</div>`;
 }
 if(tab==='tools'){
  h+=back+`<h1>${t('Do the maths first.','先把账算清。')}</h1>
  <div class="card"><div class="tt">🏠 ${t('Move-in cost','入住要准备多少钱')}</div><div class="g2"><div><label>${t('Rent per week $','周租 $')}</label><input id="m_rent" type="number" value="300"></div><div><label>${t('Agreement','租约类型')}</label><select id="m_type"><option value="room">${t('Shared room','合租房间')}</option><option value="fixed">${t('Fixed lease','固定期租约')}</option></select></div></div><div class="res" id="m_out"></div></div>
  <div class="card"><div class="tt">🧾 ${t('Rent split','分摊房租')}</div><div class="g2"><div><label>${t('Total rent per week $','总周租 $')}</label><input id="r_total" type="number" value="640"></div><div><label>${t('Room sizes m², comma separated','各房间面积 m²，逗号分隔')}</label><input id="r_sizes" value="14,11"></div></div><div class="res" id="r_out"></div></div>
  <div class="card"><div class="tt">💵 ${t('Is my pay legal?','我的时薪合法吗')}</div><div class="g2"><div><label>${t('Hourly rate $','时薪 $')}</label><input id="p_rate" type="number" value="22"></div><div><label>${t('Type','类型')}</label><select id="p_type"><option value="c">${t('Casual','临时工')}</option><option value="p">${t('Part / full time','兼职/全职')}</option></select></div></div><div><label>${t('Hours per week','每周工时')}</label><input id="p_hrs" type="number" value="20"></div><div class="res" id="p_out"></div></div>
  <div class="card"><div class="tt">⏱ ${t('Student visa hours','学生签证工时')}</div><div class="g2"><div><label>${t('Week 1 hours','第 1 周工时')}</label><input id="s_w1" type="number" value="26"></div><div><label>${t('Week 2 hours','第 2 周工时')}</label><input id="s_w2" type="number" value="24"></div></div><div class="res" id="s_out"></div></div>`;
 }
 if(tab==='me'){
  const mine=S.squads.filter(inSquad),sh=S.homes.filter(x=>isSaved('homes',x.id)),sj=S.jobs.filter(x=>isSaved('jobs',x.id));
  h+=accountCard()+`<h1>${S.me?esc(S.me):t('Who are you?','你是谁？')}</h1><label>${t('Display name','显示名字')}</label><input id="meName" value="${esc(S.me)}" placeholder="${t('e.g. Jing','例如 阿良')}"><button class="btn" data-a="saveme">${t('Save','保存')}</button>
  <div class="sec">${t('Saved homes','收藏的房源')}</div>${sh.map(x=>`<button class="card" data-a="home" data-v="${x.id}"><div class="tt">$${x.rent}/${t('wk','周')} · ${esc(x.title)}</div><div class="meta">${esc(x.area)}</div></button>`).join('')||`<div class="note">${t('Tap ♥ on a home to keep it here.','点 ♥ 收藏房源。')}</div>`}
  ${compareHtml(sh)}
  <div class="sec">${t('Saved jobs','收藏的工作')}</div>${sj.map(x=>`<button class="card" data-a="job" data-v="${x.id}"><div class="tt">$${x.pay}/${t('h','时')} · ${esc(x.title)}</div><div class="meta">${esc(x.area)}</div></button>`).join('')||`<div class="note">${t('Tap ♥ on a job to keep it here.','点 ♥ 收藏工作。')}</div>`}
  <div class="sec">${t('Your squads','我的局')}</div>${mine.map(q=>`<button class="card" data-a="open" data-v="${q.id}"><div class="tt">${sp(q.sport)[0]} ${esc(q.title)}</div><div class="meta">${when(q.start)} · ${esc(q.area)}</div></button>`).join('')||`<div class="note">${t('None yet.','还没有。')}</div>`}
  <div class="card" style="margin-top:16px"><div class="tt">🔎 ${t('Become a Loka scout','成为 Loka 探房员')}</div><div class="meta">${t('Visit a listing in your suburb, take real photos, confirm it exists. Verified listings get the green tick.','去你所在区实地看房、拍真实照片、确认房源存在。通过的房源获得绿色认证。')}</div></div>
  <button class="btn ghost" data-a="tab" data-v="about">${t('How Loka works · listing rules','Loka 怎么运作 · 发布规则')}</button>
  <button class="btn ghost" data-a="tab" data-v="privacy">${t('Privacy','隐私说明')}</button>
  <button class="btn ghost" data-a="tab" data-v="admin">${t('Open admin desk','打开管理后台')}</button>
  <button class="btn ghost" data-a="reset">${t('Reset demo data','重置演示数据')}</button>`;
 }
 a.innerHTML=h;
 const main=['help','guide','tools','earn','play','about'].includes(tab)?'home':['admin','privacy'].includes(tab)?'me':tab;
 document.getElementById('nav').innerHTML=[['home',t('Home','首页')],['homes',t('Rooms','招租')],['jobs',t('Jobs','找工')],['ask',t('Ask','问问')],['me',t('Me','我的')]].map(n=>`<button class="${main===n[0]?'on':''}" data-a="tab" data-v="${n[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[n[0]]}</svg>${n[1]}</button>`).join('');
 if(tab==='tools')calc();
 const c=document.getElementById('cnt');if(c)c.textContent=LC;
}


// ───────── actions ─────────
document.addEventListener('input',e=>{const id=e.target.id;const L=document.getElementById('list');
 if(id==='hq'){hf.q=e.target.value;if(rview==='map'){mapSel='';const m=document.querySelector('.rmap svg');if(m)m.outerHTML=mapSvg({rooms:true});const p=document.getElementById('mprev');if(p)p.innerHTML=mapPreview()}else{L.innerHTML=listHomes();document.getElementById('cnt').textContent=LC}}
 else if(id==='jq'){jf.q=e.target.value;L.innerHTML=listJobs();document.getElementById('cnt').textContent=LC}
 else if(tab==='tools')calc()});
document.addEventListener('change',()=>{if(tab==='tools')calc()});
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('moref'))hfOpen=e.target.open},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target.id==='sheet')closeSheet();return}
 const a=b.dataset.a,v=b.dataset.v,q=S.squads.find(x=>x.id===v);
 if(a==='lang'){S.lang=S.lang==='zh'?'en':'zh';save();render()}
 if(a==='tab'){tab=v;closeSheet();render();scrollTo(0,0)}
 if(a==='filter'){filter=v;render()}
 if(a==='hf'){hfOpen=true;const k=b.dataset.k;if(k==='type')hf.type=v;else if(k==='max')hf.max=+v;else hf[k]=!hf[k];render()}
 if(a==='jf'){const k=b.dataset.k;jf[k]=!jf[k];render()}
 if(a==='pin'){const hs=S.homes.filter(h=>h.area===v);if(hs.length){hf={...HF0,z:zone(v)};rview='map';mapSel=hs[0].id;tab='homes'}else{jf.q=v;tab=S.jobs.some(j=>j.area===v)?'jobs':'homes';if(tab==='homes'){hf={...HF0,z:zone(v)};rview='map'}}render();scrollTo(0,0)}
 if(a==='match')matchSheet();
 if(a==='vinfo')verifiedSheet();
 if(a==='enq'){const x=S.homes.find(h=>h.id===v);if(x)copy(enqText(x),t('Message copied','信息已复制'))}
 if(a==='adverok'){const x=S.homes.find(h=>h.id===v);const d=new Date(),ds=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();x.checks=Object.assign({},checkState(x).c);delete x.checks.terms;
  for(const k of ['id','live','right']){const e=document.getElementById('vc_'+k);if(e&&e.checked){if(!x.checks[k])x.checks[k]=ds}else delete x.checks[k]}
  const st=checkState(x);x.verified=st.all;if(st.all&&!x.vdate)x.vdate=ds;if(!st.all)delete x.vdate;save();closeSheet();render();toast(st.all?t('Verified: all four checks passed','已核实：四项全部通过'):t(`Saved: ${st.done}/4 checks`,`已保存：${st.done}/4 项`))}
 if(a==='rcheck'){S.mine=S.mine||{};const m=S.mine[v]=S.mine[v]||[],k=b.dataset.k,i=m.indexOf(k);i>-1?m.splice(i,1):m.push(k);save();homeDetail(v)}
 if(a==='codemsg'){const x=S.homes.find(h=>h.id===v);copy(codeMsg(x),t('Copied. Paste it to the lister.','已复制，发给对方即可。'))}
 if(a==='insp'){const x=S.homes.find(h=>h.id===v);x.insp=x.insp||{ok:0,bad:0};x.insp[b.dataset.k]++;S.inspd=S.inspd||{};S.inspd[v]=b.dataset.k;if(b.dataset.k==='bad'&&!S.reports.some(r=>r.id===v))S.reports.push({k:'homes',id:v,why:t('Renter said it did not match the listing','租客反馈与描述不一致')});save();homeDetail(v);toast(t('Thanks. This helps the next renter.','谢谢，这会帮到下一位租客。'))}
 if(a==='mz'){hf={...HF0,z:v};rview='map';mapSel='';tab='homes';render();scrollTo(0,0)}
 if(a==='hz'){hf.z=hf.z===v?'':v;render()}
 if(a==='rv'){rview=v;mapSel='';render()}
 if(a==='signin')authSheet()
 if(a==='au_start')authSheet()
 if(a==='acct')accountSheet()
 if(/^(au_|mfa_)/.test(a)&&a!=='au_start')authAct(a)
 if(a==='share')shareSheet(v)
 if(a==='shig')shareInstagram(v)
 if(a==='shtext'){const x=S.homes.find(h=>h.id===v);copy(shareText(x)+'\n'+roomUrl(v),t('Copied. Paste it into WeChat or 小红书.','已复制，粘贴到微信或小红书即可。'))}
 if(a==='shlink')copy(roomUrl(v),t('Link copied','链接已复制'))
 if(a==='hc'){hf.c=hf.c===v?'':v;render()}
 if(a==='mpick'){mapSel=mapSel===v?'':v;const m=document.querySelector('.rmap');if(m)m.innerHTML=mapSvg({rooms:true})+(hf.z?`<button class="mzout" data-a="hz" data-v="${hf.z}">${t('Whole city','看全城')}</button>`:'');const p=document.getElementById('mprev');if(p)p.innerHTML=mapPreview()}
 if(a==='msub'){const z=zone(v);if(z!=='other')hf.z=z;const h=filtHomes().find(x=>x.area===v);mapSel=h?h.id:'';render()}
 if(a==='asknew')askForm();
 if(a==='askopen')askDetail(v);
 if(a==='askcreate'){const by=S.me||val('q_by'),qq=val('q_text');if(!by||!qq)return toast(t('Name and question are required','名字和问题必填'));S.me=by;S.qa.unshift({id:'q'+Date.now(),q:qq,area:val('q_area'),by,ago:0,a:[]});save();closeSheet();render()}
 if(a==='askreply'){const by=S.me||val('r_by'),tx=val('r_text'),k=S.qa.find(x=>x.id===v);if(!by||!tx||!k)return toast(t('Name and answer are required','名字和回答必填'));S.me=by;k.a.push({by,text:tx});save();render();askDetail(v)}
 if(a==='mq'){const k=b.dataset.k;mq[k]=k==='b'?+v:k==='zh'?v==='true':v;matchSheet()}
 if(a==='report'){if(!S.reports.some(r=>r.id===v))S.reports.push({k:b.dataset.k,id:v,why:t('Reported by a user','用户举报')});save();toast(t('Reported. Thank you.','已举报，谢谢。'))}
 if(a==='adkeep'){S.reports=S.reports.filter(r=>r.id!==v);save();render()}
 if(a==='addel'){const k=b.dataset.k;S[k]=S[k].filter(x=>x.id!==v);S.reports=S.reports.filter(r=>r.id!==v);S.saved[k]=S.saved[k].filter(i=>i!==v);save();render();toast(t('Removed','已删除'))}
 if(a==='adver'){const x=S.homes.find(q=>q.id===v);if(x.verified){x.verified=false;x.vdate='';save();render()}else verifyForm(v)}
 if(a==='adpay'){S.scouts[+v].owed=0;save();render();toast(t('Recorded','已记录'))}
 if(a==='home')homeDetail(v);
 if(a==='job')jobDetail(v);
 if(a==='fav'){const k=b.dataset.k,i=S.saved[k].indexOf(v);i>-1?S.saved[k].splice(i,1):S.saved[k].push(v);save();render();if(b.dataset.re==='home')homeDetail(v);if(b.dataset.re==='job')jobDetail(v);toast(i>-1?t('Removed','已取消'):t('Saved','已收藏'))}
 if(a==='done'){const i=S.done.indexOf(v);i>-1?S.done.splice(i,1):S.done.push(v);save();render()}
 if(a==='newhome')homeForm();
 if(a==='newjob')jobForm();
 if(a==='createhome'){const by=S.me||val('h_by'),title=val('h_title'),rent=+val('h_rent');if(!by||!title||!rent||!val('h_contact'))return toast(t('Name, title, rent and contact are required','名字、标题、租金、联系方式必填'));if(!SUB(val('h_area')))return toast(t('Pick a suburb from the list. Loka covers the inner city and south side.','请从列表选择区名。Loka 目前覆盖市中心和南区。'));const hb=Math.max(0,+val('h_bond')||0),adv=Math.max(0,+val('h_adv')||0),agr=val('h_agr'),role=val('h_role'),ck=i=>{const e=document.getElementById(i);return !!(e&&e.checked)};
  const pb=publishBlock(rent,hb,adv,agr);
  if(pb==='bond')return toast(t('Bond cannot be more than 4 weeks of rent','押金不能超过 4 周房租'));
  if(pb==='advance')return toast(t('That is more rent in advance than Queensland allows','预付房租超过昆州上限'));
  if(!ck('h_c1')||!ck('h_c2')||!ck('h_c4')||(role==='head'&&!ck('h_c3')))return toast(t('Please tick the declarations','请勾选声明'));S.me=by;
  const n={id:'h'+Date.now(),type:val('h_type'),title,area:val('h_area')||'Brisbane',near:val('h_near'),rent,bond:Math.max(0,+val('h_bond')||0),bills:val('h_bills')==='1',furn:val('h_furn')==='1',verified:false,zh:S.lang==='zh',reward:0,ago:0,by,contact:val('h_contact'),note:val('h_note'),agr,adv,role,consent:role==='head'};S.homes.push(n);save();tab='homes';render();homeDetail(n.id)}
 if(a==='createjob'){const by=S.me||val('j_by'),title=val('j_title'),pay=+val('j_pay');if(!by||!title||!pay||!val('j_contact'))return toast(t('Name, role, pay and contact are required','名字、职位、时薪、联系方式必填'));S.me=by;
  const n={id:'j'+Date.now(),title,area:val('j_area')||'Brisbane',pay,casual:val('j_cas')==='1',hrs:val('j_hrs')||'–',student:true,zh:/中文|mandarin|chinese/i.test(val('j_lang')),cash:false,reward:0,ago:0,lang:val('j_lang')||'English',by,contact:val('j_contact'),note:val('j_note')};S.jobs.push(n);save();tab='jobs';render();jobDetail(n.id)}
 if(a==='open')detail(v);
 if(a==='close')closeSheet();
 if(a==='new')squadForm();
 if(a==='newtask')taskForm();
 if(a==='join'){if(!S.me){const n=val('joinName');if(!n)return toast(t('Add your name first','先填名字'));S.me=n}
  if(inSquad(q)||inWait(q))return;if(left(q)>0){q.players.push({n:S.me,paid:!q.price});toast(t("You're in!",'上车成功！'))}else{q.wait.push(S.me);toast(t('On the waitlist','已排候补'))}save();render();detail(v)}
 if(a==='leave'){const i=q.players.findIndex(p=>p.n===S.me);if(i>-1){q.players.splice(i,1);if(q.wait.length){const up=q.wait.shift();q.players.push({n:up,paid:!q.price});toast(up+t(' moved up from waitlist',' 已从候补顶上'))}}else q.wait=q.wait.filter(n=>n!==S.me);save();render();detail(v)}
 if(a==='paid'){const p=q.players.find(p=>p.n===S.me);p.paid=!p.paid;save();detail(v)}
 if(a==='hostpaid'){const p=q.players.find(p=>p.n===b.dataset.n);p.paid=!p.paid;save();detail(v)}
 if(a==='copy')copy(v,t('Copied','已复制'));
 if(a==='invite')copy(inviteText(q),t('Invite copied','文案已复制'));
 if(a==='poster')poster(v);
 if(a==='theme'){posterTheme=v;poster(b.dataset.id)}
 if(a==='create'){const host=S.me||val('f_host'),title=val('f_title'),st=val('f_start');if(!host||!title||!st)return toast(t('Name, title and time are required','名字、标题、时间必填'));S.me=host;
  const price=Math.max(0,+val('f_price')||0),nq={id:'s'+Date.now(),sport:val('f_sport'),title,area:val('f_area')||'Brisbane',venue:val('f_venue')||t('TBC','待定'),start:new Date(st).toISOString(),mins:+val('f_mins')||60,level:val('f_level'),price,cap:Math.max(2,+val('f_cap')||2),host,payid:val('f_payid'),note:val('f_note'),players:[{n:host,paid:true}],wait:[]};
  S.squads.push(nq);save();tab='play';render();poster(nq.id)}
 if(a==='createtask'){const by=S.me||val('k_by'),title=val('k_title');if(!by||!title)return toast(t('Name and task are required','名字和任务必填'));S.me=by;S.tasks.unshift({id:'t'+Date.now(),title,area:val('k_area')||'Brisbane',reward:Math.max(0,+val('k_reward')||0),by,helpers:[]});save();closeSheet();render()}
 if(a==='offer'){if(!S.me){tab='me';render();return toast(t('Set your name first','先设置名字'))}const k=S.tasks.find(x=>x.id===v);const i=k.helpers.indexOf(S.me);i>-1?k.helpers.splice(i,1):k.helpers.push(S.me);save();render()}
 if(a==='saveme'){const n=val('meName');if(!n)return;S.me=n;save();render();toast(t('Saved','已保存'))}
 if(a==='reset'){const l=S.lang;S=seed();S.qa=seedQA();S.lang=l;save();render();toast(t('Reset','已重置'))}
});
render();openFromHash();authInit();
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
// Header: transparent at the top, frosted once the page scrolls.
addEventListener('scroll',()=>{const e=document.getElementById('top');if(e)e.classList.toggle('stuck',scrollY>8)},{passive:true});
