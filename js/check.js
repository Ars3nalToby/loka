// Loka · check.js: "Loka Check", how a room gets verified, and what a renter can verify themselves.
// Classic script, loaded after rules.js and ui.js. No DOM work here except building HTML strings.
//
// Two halves:
//  1. Listing checks (done by Loka or a scout, shown on the listing as a 4-step ladder):
//     id    the lister showed photo ID; Loka looked and kept no copy (never store ID images or numbers)
//     live  someone saw the room live, with today's Loka code held up on paper (see lokaCode)
//     right the lister showed they may let it: owner, or the owner's written permission to sub-let
//     terms the listing passes the Queensland rules in rules.js (automatic, re-checked every render)
//     "Verified" = all four. Each manual check stores the date it was done.
//  2. Renter checks (done by the renter, saved on their own device): five steps that need nobody's
//     trust, ending with the RTA bond acknowledgement, which only the RTA can send.

// Today's code for a listing: changes every day, so an old photo or a copied video cannot pass.
function lokaCode(id,d){d=d||new Date();const day=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
 let h=2166136261;for(const c of id+'|'+day){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}h>>>=0;
 const A='ACDEFGHJKMNPQRTUVWXY34679';let s='';for(let i=0;i<4;i++){s+=A[h%A.length];h=Math.floor(h/A.length)}return 'LK-'+s}

const CHECKS=[
 {k:'id',ico:'idc',en:'Lister ID sighted',zh:'发布人证件已查看',how:['The lister showed photo ID on a video call or in person. Loka looked and kept no copy, photo or number.','发布人通过视频或当面出示带照片的证件。Loka 只看，不留复印件、照片或号码。']},
 {k:'live',ico:'cam',en:'Room seen live, with today’s code',zh:'实时看过房，并出示当日验证码',how:['A Loka scout visited, or the lister did a live video call walking through the room while holding today’s Loka code on paper. The code changes daily, so old photos cannot pass.','Loka 探房员实地看过，或发布人实时视频带看，并手持写有当日 Loka 验证码的纸。验证码每天更换，旧照片无法冒充。']},
 {k:'right',ico:'key',en:'Allowed to rent it out',zh:'有权出租',how:['The lister showed they own it (e.g. a rates notice in their name), or showed the owner’s written permission to sub-let. Loka looked and kept no copy.','发布人证明是业主（例如本人名下的地税单），或出示业主的书面转租同意。Loka 只看，不留存。']},
 {k:'terms',ico:'scale',en:'Fair terms under Qld rules',zh:'条款符合昆州规定',how:['Checked automatically: one fixed weekly rent, bond 4 weeks or less, rent in advance within the limit. Re-checked every time the listing is shown.','自动检查：固定周租、押金不超过 4 周、预付房租不超上限。每次显示房源都会重新检查。']}
];
// Line icons used by the ladder (24x24, stroke).
Object.assign(LI,{
 idc:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2.3"/><path d="M5.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h4M14.5 13.5h3"/>',
 cam:'<rect x="3" y="7" width="13" height="10" rx="2.5"/><path d="M16 11l5-3v8l-5-3"/>',
 key:'<circle cx="8" cy="12" r="3.6"/><path d="M11.6 12H21M18 12v3M15 12v2"/>',
 scale:'<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6h5zM19 8l-2.5 6h5z"/>',
 shield:'<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.4 2.4 4.6-4.8"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
});

// State of the four checks for a listing. Older saved data only has verified/vdate: treat as all done.
function checkState(x){const c=Object.assign({},x.checks||{});
 if(x.verified&&!x.checks){c.id=c.live=c.right=x.vdate||'';}
 c.terms=!homeFlags(x).length;
 const done=['id','live','right'].filter(k=>c[k]!=null&&c[k]!==false).length+(c.terms?1:0);
 return {c,done,all:done===4}}

// Compact badge for cards: "Verified" when 4/4, otherwise "2/4 checks".
function checkBadge(x){const s=checkState(x);
 return s.all?`<button class="vf" data-a="vinfo">${ico('shield')} ${t('Verified','已核实')}</button>`
  :`<button class="vf part" data-a="vinfo" aria-label="${t('Loka Check','Loka 核实')}"><span class="dots">${CHECKS.map(k=>`<i class="${(k.k==='terms'?s.c.terms:s.c[k.k]!=null&&s.c[k.k]!==false)?'on':''}"></i>`).join('')}</span>${s.done}/4</button>`}

// Full ladder for the detail sheet.
function ladderHtml(x){const s=checkState(x);
 return `<div class="ladder"><div class="lh"><span>${ico('shield')} Loka Check</span><b>${s.done}/4</b></div>
 ${CHECKS.map((k,i)=>{const v=k.k==='terms'?s.c.terms:(s.c[k.k]!=null&&s.c[k.k]!==false);
  return `<div class="rung ${v?'on':''}"><span class="n">${v?'✓':i+1}</span><span class="lt">${ico(k.ico)}<b>${t(k.en,k.zh)}</b>${v&&k.k!=='terms'&&s.c[k.k]?`<i>${esc(s.c[k.k])}</i>`:''}${!v&&k.k==='terms'?`<i class="bad">${t('Breaks a rule, see the warning above','违反规定，见上方警示')}</i>`:''}</span></div>`}).join('')}
 <button class="link sm" data-a="vinfo">${t('How Loka checks a room','Loka 如何核实房源')} →</button></div>`}

// What the renter can do themselves. Saved per listing on their own device in S.mine.
const RSTEPS=[
 {k:'code',en:'Video call: ask them to show today’s code',zh:'视频看房：请对方出示当日验证码',how:['Copy the message below and send it. On the call, the lister walks through the room and holds up the code on paper. If they refuse or the code is wrong, stop here.','复制下面的消息发给对方。视频时请对方带你看房，并手持写有验证码的纸。若对方拒绝或验证码不对，就到此为止。'],act:'codemsg'},
 {k:'see',en:'Inspect before any money moves',zh:'付任何钱之前先看房',how:['In person, or the live video above. Never pay a “holding deposit” for a place you have not seen.','亲自看房，或上面的实时视频。没看过的房，不要付任何“定金”。']},
 {k:'who',en:'Confirm who you are renting from',zh:'确认出租人是谁',how:['Ask for the owner’s full name. If it is a sub-let, ask to see the owner’s written permission. A real lister will not mind.','问清业主全名。如属转租，请对方出示业主的书面同意。正规的发布人不会介意。']},
 {k:'paper',en:'Get it in writing, with receipts',zh:'签书面协议，所有付款要收据',how:['Sign a written agreement before paying. Get a receipt for every payment. Pay to a bank account in a real name, not cash with no receipt.','付款前签好书面协议，每笔付款都要收据。转账到实名银行账户，不要付没有收据的现金。']},
 {k:'rta',en:'Bond: wait for the RTA’s own message',zh:'押金：等 RTA 本身发来的确认',how:['Bond must be lodged with the RTA within 10 days. The RTA then sends you an Acknowledgement of rental bond with a bond number. No message? Call the RTA on 1300 366 311.','押金必须在 10 天内存入 RTA。RTA 会直接发给你“押金确认”（Acknowledgement of rental bond），附押金编号。没收到？打 RTA 电话 1300 366 311。'],link:'https://www.rta.qld.gov.au/renting/starting-a-tenancy/rental-bond'}
];
function myChecks(id){S.mine=S.mine||{};return S.mine[id]||[]}
function renterHtml(x){const m=myChecks(x.id),n=m.length,pct=Math.round(n/RSTEPS.length*100),code=lokaCode(x.id);
 return `<div class="rcheck"><div class="rh"><div><b>${t('Verify it yourself','自己也能核实')}</b><span>${t('Five checks that need nobody’s word for it.','五个步骤，不用靠任何人的保证。')}</span></div>
 <div class="ring" style="--p:${pct}"><span>${n}/${RSTEPS.length}</span></div></div>
 <div class="code"><span>${t('Today’s code for this room','这间房今天的验证码')}</span><b>${code}</b><i>${t('Changes at midnight','每晚零点更换')}</i></div>
 ${RSTEPS.map((r,i)=>{const on=m.includes(r.k);return `<div class="rs ${on?'on':''}"><button class="tickb" data-a="rcheck" data-v="${x.id}" data-k="${r.k}" aria-pressed="${on}">${on?'✓':i+1}</button>
  <div><b>${t(r.en,r.zh)}</b><p>${t(r.how[0],r.how[1])}</p>${r.act?`<button class="mini-btn" data-a="${r.act}" data-v="${x.id}">${t('Copy the video-call request','复制视频看房请求')}</button>`:''}${r.link?`<a class="mini-btn" href="${r.link}" target="_blank" rel="noopener">${t('RTA: rental bond page','RTA 押金说明页')} ↗</a>`:''}</div></div>`}).join('')}
 </div>`}
function codeMsg(x){const c=lokaCode(x.id);return S.lang==='zh'
 ?`你好，我在 Loka 上看到你的房源：${x.title}（$${x.rent}/周，${x.area}）。看房前可以先视频一下吗？请带我看一下房间，并手持一张写着 ${c} 的纸（这是 Loka 今天的验证码）。谢谢！`
 :`Hi, I saw your listing on Loka: ${x.title} ($${x.rent}/wk, ${x.area}). Before I inspect, could we do a quick video call? Please walk me through the room and hold up a piece of paper with ${c} written on it (today's Loka code). Thanks!`}

// After an inspection, renters say whether the room matched the listing. Shown as a count.
function inspHtml(x){const i=x.insp||{ok:0,bad:0},mine=(S.inspd||{})[x.id];
 return `<div class="insp"><div><b>${t('Inspected it?','看过这间房？')}</b><span>${i.ok+i.bad?`${i.ok} ${t('said it matched','人说与描述一致')} · ${i.bad} ${t('said it did not','人说不一致')}`:t('No inspection reports yet.','还没有人反馈看房结果。')}</span></div>
 ${mine?`<em>${mine==='ok'?t('You said: matched','你的反馈：一致'):t('You said: did not match','你的反馈：不一致')}</em>`:`<div class="ib"><button data-a="insp" data-v="${x.id}" data-k="ok">👍 ${t('Matched','一致')}</button><button data-a="insp" data-v="${x.id}" data-k="bad">👎 ${t('Did not','不一致')}</button></div>`}</div>`}

// Fair price meter: this rent against other Loka rooms of the same type on the same side of town.
function priceMeter(x){const peers=S.homes.filter(h=>h.id!==x.id&&h.type===x.type&&zone(h.area)===zone(x.area)).map(h=>h.rent).sort((a,b)=>a-b);
 const all=S.homes.filter(h=>h.id!==x.id&&h.type===x.type).map(h=>h.rent).sort((a,b)=>a-b);
 const use=peers.length>=3?peers:all,scope=peers.length>=3?t(ZN[zone(x.area)]?.[0]||'this area',ZN[zone(x.area)]?.[1]||'本区'):t('all of Brisbane on Loka','Loka 全布村');
 if(use.length<2)return `<div class="pm"><b>${t('Price check','价格对比')}</b><span>${t('Not enough similar rooms on Loka yet to compare.','Loka 上类似房源还不够多，暂时无法对比。')}</span></div>`;
 const med=use[Math.floor(use.length/2)],lo=Math.min(...use,x.rent),hi=Math.max(...use,x.rent),pos=hi===lo?50:Math.round((x.rent-lo)/(hi-lo)*100),d=Math.round((x.rent-med)/med*100);
 const verdict=d<=-10?[t('Below typical','低于一般价'),'g']:d>=10?[t('Above typical','高于一般价'),'h']:[t('About typical','价格适中'),'m'];
 return `<div class="pm"><div class="pmh"><b>${t('Price check','价格对比')}</b><span class="pv ${verdict[1]}">${verdict[0]}</span></div>
 <div class="bar3"><i style="left:${pos}%"></i></div><div class="pml"><span>$${lo}</span><span>${t('typical','一般')} $${med}</span><span>$${hi}</span></div>
 <span class="pms">${t(`Compared with ${use.length} similar listings in ${scope}. A guide only.`,`对比 ${scope} ${use.length} 条同类房源，仅供参考。`)}</span></div>`}
