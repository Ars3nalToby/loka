// Loka · rooms.js: Rooms: list, detail, match, compare, verify, listing form.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// The rooms that pass the current filters, cheapest first (nearest first when a campus is chosen).
function filtHomes(){const l=S.homes.filter(h=>(!hf.z||zone(h.area)===hf.z)&&(hf.type==='all'||h.type===hf.type)&&(!hf.max||h.rent<=hf.max)&&(!hf.bills||h.bills)&&(!hf.clean||!homeFlags(h).length)&&(!hf.zh||h.zh)&&(!hf.nobond||!h.bond)&&(!hf.q||(h.area+' '+h.title+' '+h.near).toLowerCase().includes(hf.q.toLowerCase())));
 return hf.c?l.sort((a,b)=>(homeKm(a,hf.c)??99)-(homeKm(b,hf.c)??99)):l.sort((a,b)=>a.rent-b.rent)}
function listHomes(){let l=filtHomes();
 LC=l.length+' '+t(l.length===1?'room':'rooms','个房源');
 return l.map(h=>{const fl=homeFlags(h);return `<div class="card photo"><div class="pic">${art(h)}
  ${checkBadge(h)}<button class="heart ${isSaved('homes',h.id)?'on':''}" data-a="fav" data-k="homes" data-v="${h.id}">♥</button>
  <div class="pp"><span class="price">$${h.rent}<small>/${t('wk','周')}</small></span></div></div>
  <div class="body"><button data-a="home" data-v="${h.id}" style="text-align:left;width:100%"><div class="tt">${esc(h.title)}</div><div class="meta">${ico('pin')} ${esc(h.area)}${hf.c&&homeKm(h,hf.c)!=null?` · <b class="km">≈ ${homeKm(h,hf.c).toFixed(1)} km ${t('to','到')} ${CAMPUS_SHORT[hf.c]}</b>`:''}${h.near?' · '+t('near ','近 ')+esc(h.near):''} · ${ago(h)}</div></button>
  ${h.zh?`<span class="tag b">${t('中文 OK','中文沟通')}</span>`:''}${!h.bond?`<span class="tag g">${t('No bond','免押金')}</span>`:''}<span class="tag">${h.bills?t('Bills included','包水电网'):t('+ bills','水电另计')}</span>
  ${fl.map(x=>`<span class="flag">⚠ ${x}</span>`).join('')}</div></div>`}).join('')||`<div class="note">${t('No rooms match. Loosen a filter.','没有符合的房源，放宽筛选试试。')}</div>`}
function homeDetail(id){const x=S.homes.find(q=>q.id===id);if(!x)return;const fl=homeFlags(x),room=x.type!=='unit';
 openSheet(`<div class="pic" style="border-radius:18px;overflow:hidden">${art(x)}</div><div class="price" style="margin-top:10px">$${x.rent}<small>/${t('wk','周')} · ${t(HT[x.type][1],HT[x.type][2])}</small></div>
 <div class="tt" style="font-size:19px">${esc(x.title)}</div><div class="meta">${esc(x.area)}${x.near?' · '+t('near ','近 ')+esc(x.near):''}</div>
 <span class="tag">${x.bills?t('Bills included','包水电网'):t('+ bills','水电另计')}</span>${x.furn?`<span class="tag">${t('Furnished','带家具')}</span>`:''}
 ${fl.map(f=>`<span class="flag">⚠ ${f}</span>`).join('')}<div class="note">${esc(x.note)}</div>
 <div class="res">${t('Asked bond','要求押金')}: <b>$${x.bond}</b> (${(x.bond/x.rent).toFixed(1)} ${t('weeks','周')})<br>${t('Legal maximum up front','合法最高入住款')}: $${x.rent*RULES.bondWeeks} ${t('bond','押金')} + $${x.rent*(room?RULES.advRoom:RULES.advFixedWeeks)} ${t('rent in advance','预付房租')}</div>
 ${priceMeter(x)}${ladderHtml(x)}
 ${(()=>{const js=S.jobs.filter(j=>zone(j.area)===zone(x.area)&&!jobFlags(j).length).sort((a,b)=>wk(b)-wk(a)).slice(0,3);return js.length?`<div class="sec">${t('Jobs that could pay for it','能撑起这份房租的工作')}</div>`+js.map(j=>`<button class="mini" data-a="job" data-v="${j.id}"><span><b>${esc(j.title)}</b><i>${esc(j.area)} · ≈ $${wk(j)}/${t('wk before tax','周（税前）')}</i></span><em class="${x.rent/wk(j)<=.4?'gd':'bd'}">${Math.round(x.rent/wk(j)*100)}%<small>${t('of pay','占收入')}</small></em></button>`).join('')+`<div class="note">${t('Share of that job’s weekly pay this rent would take. Under about a third is comfortable.','这份房租占该工作周薪的比例，三分之一以内比较宽松。')}</div>`:''})()}
 <div class="sec">${t('Contact','联系方式')}</div><div class="tt">${esc(x.contact)}</div><div class="meta">${t('Listed by','发布人')} ${esc(x.by)}${x.role&&ROLE[x.role]?' · '+t(ROLE[x.role][0],ROLE[x.role][1]):''}</div>
 <button class="btn ghost" data-a="enq" data-v="${x.id}">${t('Copy a ready enquiry message','复制一段现成的询问信息')}</button>
 <button class="btn ghost" data-a="copy" data-v="${esc(x.contact)}">${t('Copy contact','复制联系方式')}</button>
 <button class="btn" data-a="fav" data-k="homes" data-v="${x.id}" data-re="home">${isSaved('homes',x.id)?t('Saved ♥','已收藏 ♥'):t('Save this home','收藏')}</button>
 ${renterHtml(x)}${inspHtml(x)}
 <div class="note">${t('Loka is a notice board, not an agent. It does not hold money or sign agreements.','Loka 是信息板，不是中介，不经手资金，也不代签协议。')} <a href="https://www.rta.qld.gov.au/">rta.qld.gov.au</a></div><button class="report" data-a="report" data-k="homes" data-v="${x.id}">${ico('flag')} ${t('Report this listing','举报这条房源')}</button>`)}
function matchSheet(){const ch=(k,v,l)=>`<button class="chip ${mq[k]===v?'on':''}" data-a="mq" data-k="${k}" data-v="${v}">${l}</button>`;
 const rooms=S.homes.filter(h=>!homeFlags(h).length&&h.rent<=mq.b&&zone(h.area)===mq.z&&(!mq.zh||h.zh)).sort((a,b)=>(b.verified-a.verified)||a.rent-b.rent);
 const jobs=S.jobs.filter(j=>!jobFlags(j).length&&zone(j.area)===mq.z&&(!mq.zh||j.zh)).sort((a,b)=>wk(b)-wk(a));const best=jobs[0];
 openSheet(`<div class="tt" style="font-family:var(--serif);font-size:28px;font-weight:500">${t('Match me','帮我配')}</div>
 <label>1 · ${t('Weekly rent budget','每周房租预算')}</label><div class="chips">${ch('b',250,'≤ $250')}${ch('b',350,'≤ $350')}${ch('b',500,'≤ $500')}${ch('b',9999,t('Flexible','不限'))}</div>
 <label>2 · ${t('Side of town','想住哪边')}</label><div class="chips">${Object.keys(ZN).map(z=>ch('z',z,t(ZN[z][0],ZN[z][1]))).join('')}</div>
 <label>3 · ${t('Language','语言')}</label><div class="chips">${ch('zh',false,t('English is fine','英文就行'))}${ch('zh',true,t('中文 needed','需要中文沟通'))}</div>
 <div class="sec">${rooms.length} ${t('rooms fit','个房源符合')}</div>${rooms.map(h=>`<button class="mini" data-a="home" data-v="${h.id}"><span><b>$${h.rent}/${t('wk','周')} · ${esc(h.area)}</b><i>${h.verified?'✓ '+t('scout visited','探房员看过')+' · ':''}${esc(h.title)}</i></span>${best?`<em class="${h.rent/wk(best)<=.4?'gd':'bd'}">${Math.round(h.rent/wk(best)*100)}%<small>${t('of pay','占收入')}</small></em>`:''}</button>`).join('')||`<div class="note">${t('Nothing clean in this corner yet. Try a wider budget or another side of town.','这个组合暂时没有合规房源，放宽预算或换个区试试。')}</div>`}
 <div class="sec">${jobs.length} ${t('jobs on the same side','同区工作')}</div>${jobs.map(j=>`<button class="mini" data-a="job" data-v="${j.id}"><span><b>${esc(j.title)}</b><i>${esc(j.area)} · $${j.pay}/${t('hr','时')}</i></span><em class="gd">$${wk(j)}<small>/${t('wk','周')}</small></em></button>`).join('')||`<div class="note">${t('No legal-pay jobs here yet.','这边暂时没有时薪合法的工作。')}</div>`}
 ${best&&rooms.length?`<div class="note">${t('Percentages compare each rent with the best-paying job on this list, before tax.','百分比 = 房租 ÷ 列表中周薪最高的工作（税前）。')}</div>`:''}`)}
function compareHtml(sh){if(sh.length<2)return'';const row=(l,f)=>`<tr><th>${l}</th>${sh.map(x=>`<td>${f(x)}</td>`).join('')}</tr>`;
 return `<div class="sec">${t('Compare saved rooms','对比收藏的房')}</div><div class="cmp"><table><tr><th></th>${sh.map(x=>`<td><b>${esc(x.area)}</b></td>`).join('')}</tr>
 ${row(t('Rent / wk','周租'),x=>'$'+x.rent)}${row(t('Bond','押金'),x=>x.bond?'$'+x.bond+' · '+(x.bond/x.rent).toFixed(1)+t(' wks',' 周'):t('None','无'))}${row(t('Bills','水电网'),x=>x.bills?t('Included','包含'):t('Extra','另计'))}${row(t('Scout visited','实地核实'),x=>x.verified?'✓':'–')}${row(t('Up front','入住款'),x=>'$'+(x.bond+x.rent*2))}${row(t('Red flags','警示'),x=>homeFlags(x).length?'⚠ '+homeFlags(x).length:'–')}</table></div>
 <div class="note">${t('Up front = asked bond + 2 weeks rent.','入住款 = 要求的押金 + 2 周房租。')}</div>`}
function enqText(x){return `Hi, I saw your listing on Loka: ${x.title} ($${x.rent}/wk, ${x.area}). Is it still available? Could I inspect it this week?\nCould you also confirm: the bond amount and that it will be lodged with the RTA, whether bills are included, and the minimum stay. Thank you!\n\n你好，我在 Loka 看到你的房源（$${x.rent}/周，${x.area}）。请问还在吗？这周可以看房吗？\n另外想确认：押金金额以及是否会存入 RTA、是否包水电网、最短租期。谢谢！`}
function verifiedSheet(){const li=(c,en,zh)=>`<div class="li ${c}">${t(en,zh)}</div>`;
 openSheet(`<div class="tt" style="font-size:24px;font-weight:900">${ico('shield')} ${t('How Loka checks a room','Loka 如何核实房源')}</div>
 <div class="sub" style="margin-top:6px">${t('Four checks. Each one is shown on the listing with the date it was done. “Verified” means all four passed.','共四项，每项完成后都会在房源上显示日期。四项全部通过才算“已核实”。')}</div>
 ${CHECKS.map((k,i)=>`<div class="how"><span class="n">${i+1}</span><div><b>${ico(k.ico)} ${t(k.en,k.zh)}</b><p>${t(k.how[0],k.how[1])}</p></div></div>`).join('')}
 <div class="sec">${t('Why a daily code?','为什么要每日验证码？')}</div><div class="note" style="margin-top:0">${t('Scammers copy photos from real listings. They cannot fake a code that did not exist yesterday, held up live in the actual room. You can ask for it yourself on any listing.','骗子常盗用真实房源的照片，但伪造不了一个昨天还不存在、并在房间里实时出示的验证码。每条房源你都可以自己要求对方出示。')}</div>
 <div class="sec">${t('Loka does not check','Loka 不核实')}</div>${li('n','Building safety, smoke alarms or repairs.','房屋安全、烟雾报警器或维修状况。')}${li('n','How the lister or housemates will behave.','房东或室友日后的为人。')}${li('n','The terms of your tenancy agreement.','你的租约条款。')}${li('n','That the place is still available today.','房源今天是否仍然空置。')}
 <div class="note">${t('Verified is not a guarantee. Do your own five checks on the listing before you pay anything.','“已核实”不是担保。付款前，请在房源页完成你自己的五项核实。')}</div>`)}
function verifyForm(id){const x=S.homes.find(q=>q.id===id);if(!x)return;const st=checkState(x).c;
 const ck=(k,en,zh)=>`<label class="tick"><input type="checkbox" id="vc_${k}" ${st[k]!=null&&st[k]!==false?'checked':''}><span>${t(en,zh)}${st[k]?` <i style="color:var(--mut)">(${esc(st[k])})</i>`:''}</span></label>`;
 openSheet(`<div class="tt" style="font-size:21px">${t('Loka Check this listing','核实这条房源')}</div><div class="meta">${esc(x.title)} · ${esc(x.area)}</div>
 <div class="code" style="margin:12px 0"><span>${t('Today’s code to ask for on the video call','视频时要求对方出示的当日验证码')}</span><b>${lokaCode(x.id)}</b></div>
 ${ck('id','I sighted the lister’s photo ID and kept no copy, photo or number.','我查看过发布人的证件，没有留存复印件、照片或号码。')}${ck('live','I saw the room live (visit or video) and the lister held up today’s code.','我实时看过房（实地或视频），对方出示了当日验证码。')}${ck('right','I sighted proof they can let it: ownership, or the owner’s written permission to sub-let.','我查看过出租权证明：产权，或业主的书面转租同意。')}
 <div class="li ${checkState(x).c.terms?'y':'n'}">${t('Fair terms under Qld rules: checked automatically','条款符合昆州规定：系统自动检查')}</div>
 <button class="btn" data-a="adverok" data-v="${id}">${t('Save checks','保存核实结果')}</button><div class="note">${t('Only tick what you actually did. Each tick is shown publicly with today’s date.','只勾选你确实做过的事。每一项都会连同今天的日期公开显示。')}</div>`)}
function homeForm(){openSheet(`<div class="tt" style="font-size:21px">${t('List a place','发布房源')}</div>
 <label>${t('Type','类型')}</label><select id="h_type">${Object.keys(HT).map(k=>`<option value="${k}">${HT[k][0]} ${t(HT[k][1],HT[k][2])}</option>`).join('')}</select>
 <label>${t('Title','标题')}</label><input id="h_title"><div class="g2"><div><label>${t('Suburb','区域')}</label><input id="h_area" list="subs" autocomplete="off"><datalist id="subs">${SUBURB_DATA.suburbs.map(x=>`<option value="${esc(x.name)}">${x.zh?esc(x.zh):''}</option>`).join('')}</datalist></div><div><label>${t('Near (uni / station)','靠近（学校/车站）')}</label><input id="h_near"></div></div>
 <div class="g2"><div><label>${t('Rent per week $','周租 $')}</label><input id="h_rent" type="number"></div><div><label>${t('Bond $','押金 $')}</label><input id="h_bond" type="number"></div></div>
 <div class="g2"><div><label>${t('Bills','水电网')}</label><select id="h_bills"><option value="1">${t('Included','包含')}</option><option value="0">${t('Extra','另计')}</option></select></div><div><label>${t('Furnished','家具')}</label><select id="h_furn"><option value="1">${t('Yes','有')}</option><option value="0">${t('No','无')}</option></select></div></div>
 <div class="g2"><div><label>${t('Agreement','租约类型')}</label><select id="h_agr"><option value="room">${t('Room / periodic','合租 / 无固定期')}</option><option value="fixed">${t('Fixed-term lease','固定期租约')}</option></select></div><div><label>${t('Rent in advance (weeks)','预付房租（周）')}</label><input id="h_adv" type="number" value="2"></div></div>
 <label>${t('You are','你的身份')}</label><select id="h_role">${Object.keys(ROLE).map(k=>`<option value="${k}">${t(ROLE[k][0],ROLE[k][1])}</option>`).join('')}</select>
 <label>${t('Contact (WeChat / phone / email)','联系方式（微信/电话/邮箱）')}</label><input id="h_contact">
 <label class="tick"><input type="checkbox" id="h_c1"><span>${t('The rent above is the fixed price. I will not ask for or accept more.','以上租金为固定价格，我不会要求或接受更高的出价。')}</span></label>
 <label class="tick"><input type="checkbox" id="h_c2"><span>${t('If I take a bond, I will lodge it with the RTA within 10 days.','如收取押金，我会在 10 天内存入 RTA。')}</span></label>
 <label class="tick"><input type="checkbox" id="h_c3"><span>${t('If I am sub-letting, I have the owner’s written permission.','如属转租，我已取得业主的书面同意。')}</span></label>
 <label class="tick"><input type="checkbox" id="h_c4"><span>${t('This listing is true and I accept the Loka listing rules.','信息属实，我接受 Loka 发布规则。')}</span></label>${S.me?'':`<label>${t('Your name','你的名字')}</label><input id="h_by">`}
 <label>${t('Details','详情')}</label><textarea id="h_note" rows="2"></textarea><button class="btn" data-a="createhome">${t('Publish','发布')}</button>
 <div class="note">${t('Loka does not publish a bond above 4 weeks of rent, or more rent in advance than Queensland allows.','押金超过 4 周房租、或预付房租超过昆州上限的房源，Loka 不予发布。')}</div>`)}
