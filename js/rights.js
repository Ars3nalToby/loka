// Loka · rights.js: the "Renter rights" page. Who the RTA, QSTARS, QCAT and others are, what each
// can and cannot do, and which door to knock on first for common problems.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
//
// Every fact here was checked against the official site on RIGHTS_CHECKED. Phone numbers, fees and
// hours change: re-check them against the linked pages before editing, and update the date.
const RIGHTS_CHECKED=['18 Nov 2026','2026 年 11 月 18 日'];

const HELP=[
 {k:'rta',name:'RTA · Residential Tenancies Authority',zh:'昆州租务管理局',
  en:'Holds every rental bond in Queensland, runs a free dispute resolution service, and investigates breaches of the rental law. Neutral: it does not take your side.',
  zhd:'昆州所有租房押金都由它保管；提供免费调解；调查违反租房法的行为。它是中立的，不站在任何一方。',
  tel:'1300 366 311',url:'https://www.rta.qld.gov.au/',site:'rta.qld.gov.au'},
 {k:'qstars',name:'QSTARS · Tenants Queensland',zh:'租客免费咨询热线',
  en:'Free, independent advice for renters. They can help you understand your rights, talk to your landlord or agent, write a letter, fill in forms and get ready for a QCAT hearing. Free interpreters, including Mandarin and Cantonese.',
  zhd:'免费、独立、站在租客这边。可以帮你弄懂权利、和房东或中介沟通、写信、填表、准备 QCAT 听证。提供免费口译，包括普通话和粤语。',
  tel:'1300 744 263',hrs:['Mon–Fri 9am–5pm. Tenants Queensland lists extended hours to 7pm on Tue and Wed.','周一至周五 9:00–17:00；Tenants Queensland 写明周二、周三延长到晚上 7 点。'],url:'https://qstars.org.au/',site:'qstars.org.au'},
 {k:'qcat',name:'QCAT · Civil and Administrative Tribunal',zh:'昆州民事与行政仲裁庭',
  en:'The tribunal that makes binding decisions (orders) in rental disputes. You speak for yourself; lawyers are not allowed unless there are exceptional circumstances. Filing fees change every year and start at $27.90 for claims up to $500. You can ask for a fee waiver if money is tight.',
  zhd:'租房纠纷里真正能“判”的机构，作出有约束力的裁决。一般要自己出庭陈述，除特殊情况外不允许请律师。申请费每年调整，$500 以下的申请目前是 $27.90；经济困难可以申请免费。',
  tel:'1300 753 228',url:'https://www.qcat.qld.gov.au/matter-types/residential-tenancy-disputes',site:'qcat.qld.gov.au'},
 {k:'clc',name:'Community legal centres',zh:'社区法律中心',
  en:'Free legal help near you. Use the “Find a CLC” directory. Note: Legal Aid Queensland says it does not advise on landlord and tenant problems and refers renters to Tenants Queensland.',
  zhd:'就近的免费法律帮助，用 “Find a CLC” 目录查找。注意：Legal Aid Queensland 写明不处理房东与租客纠纷，会把租客转介给 Tenants Queensland。',
  url:'https://www.communitylegalqld.org.au/',site:'communitylegalqld.org.au'},
 {k:'scam',name:'Scamwatch',zh:'防诈骗举报',
  en:'Report a fake listing or a deposit scam. If you already sent money, call your bank straight away.',
  zhd:'举报假房源、骗定金。如果钱已经转出去，马上打给你的银行。',
  url:'https://www.scamwatch.gov.au/',site:'scamwatch.gov.au'},
 {k:'tis',name:'TIS National',zh:'免费电话口译',
  en:'Free phone interpreter. Call, ask for Mandarin, and ask them to connect you to the service you need.',
  zhd:'免费电话口译。打过去说要普通话，再请他们帮你接通要找的机构。',
  tel:'131 450',url:'https://www.tisnational.gov.au/',site:'tisnational.gov.au'}];

// What the RTA can and cannot do. Source: RTA compliance and enforcement pages.
const RTA_CAN=[
 ['Keep your bond safe. It has to be lodged with the RTA, and the RTA sends you its own receipt.','保管押金：押金必须存进 RTA，RTA 会直接给你发确认。'],
 ['Run free, confidential conciliation so both sides can agree, for example on a bond refund.','免费、保密的调解，帮双方谈出结果，例如押金退还。'],
 ['Investigate offences under the rental law. Investigators can search a property, inspect documents and require people or businesses to hand over information in certain circumstances.','调查违反租房法的行为。调查员在特定情况下可以搜查物业、查阅文件，并要求个人或公司提供资料。'],
 ['Issue fines (Penalty Infringement Notices).','开罚单（Penalty Infringement Notice）。'],
 ['Prosecute serious cases in the Magistrates Court, for offences in the past 2 years.','严重个案可以告上 Magistrates Court（限 2 年内发生的违法行为）。']];
const RTA_CANT=[
 ['Get your money back through an investigation. Investigations enforce the law; they do not pay compensation.','靠“调查”拿回钱。调查是执法，不负责赔偿。'],
 ['Make a binding decision. If conciliation fails, QCAT decides.','作出有约束力的裁决。调解谈不拢，要由 QCAT 来判。'],
 ['Act as your advocate. For someone on your side, call QSTARS.','替你出头。需要站在你这边的人，请打 QSTARS。']];

// Common problems → first step → if that fails. Urgent QCAT categories are from QCAT's own list.
const DOORS=[
 {ic:'coin',en:'My bond has not come back',zh:'押金一直不退',
  s:[['Lodge a dispute resolution request with the RTA. It is free.','向 RTA 申请调解（免费）。'],['No agreement? Apply to QCAT. Bond refunds are a non-urgent dispute, so the RTA step comes first.','谈不拢就申请 QCAT。押金退还属于“非紧急”纠纷，必须先走 RTA 调解。']]},
 {ic:'flag',en:'They took a bond but I never got an RTA receipt',zh:'交了押金，却没收到 RTA 确认',
  s:[['Call the RTA on 1300 366 311 and ask whether a bond is lodged in your name.','打 RTA 1300 366 311，问有没有以你名字存的押金。'],['Not lodged? You can ask the RTA to investigate. Keep your payment proof and messages.','没存的话可以请 RTA 调查。保留转账记录和聊天记录。']]},
 {ic:'house',en:'Something urgent is broken (for example a burst water pipe)',zh:'紧急维修（例如水管爆裂）',
  s:[['Tell the landlord or agent in writing, with photos.','用书面方式通知房东或中介，附照片。'],['Emergency repairs are an urgent dispute: you can go straight to QCAT, no RTA step needed. Everyday repairs go to the RTA first.','紧急维修属于“紧急”纠纷，可以直接找 QCAT，不必先经 RTA。一般维修要先走 RTA。']]},
 {ic:'pin',en:'They keep coming in without proper notice',zh:'房东或中介不按规定通知就进屋',
  s:[['Keep a dated log of each entry and any messages.','记下每次进屋的日期和相关讯息。'],['Entry to the premises is on QCAT’s urgent list. Unlawful entry can also be reported to the RTA for investigation. Call QSTARS for advice on which to use.','“进入物业”在 QCAT 的紧急清单上；违法进屋也可以向 RTA 举报调查。不确定选哪个，先打 QSTARS。']]},
 {ic:'coin',en:'Rent went up again within 12 months, or I was asked to bid',zh:'12 个月内又涨租，或被要求加价竞租',
  s:[['Rent can rise only once every 12 months, and since 6 June 2024 that limit follows the property, not the tenancy. Rent bidding is banned.','房租 12 个月内只能涨一次；2024 年 6 月 6 日起这个限制跟着房子走，不是跟着租约走。加价竞租已被禁止。'],['Ask the RTA or QSTARS. You do not have to agree to pay more than the advertised rent.','问 RTA 或 QSTARS。你不必答应付高于广告的租金。']]},
 {ic:'shield',en:'They threaten me for complaining, or to list me on a tenancy database',zh:'因投诉被报复，或被威胁列入租客黑名单',
  s:[['Retaliatory action and tenancy database listings are both on QCAT’s urgent list.','“报复行为”和“租客数据库登记”都在 QCAT 的紧急清单上。'],['Call QSTARS first. They help with the QCAT form.','先打 QSTARS，他们会帮你填 QCAT 表格。']]},
 {ic:'list',en:'I rent a room from someone who lives there',zh:'我向住在里面的人租一个房间',
  s:[['You may be a boarder or lodger. Most of the tenancy law may not cover you, but any bond you pay is still covered and must go to the RTA.','你可能算“寄宿者”（boarder/lodger），大部分租房法未必适用，但你交的押金仍然受保护，必须存进 RTA。'],['Some room rentals count as rooming accommodation, which is covered. QSTARS can tell you which one you are.','有些房间出租属于“rooming accommodation”，受法律保护。打 QSTARS 问清楚你属于哪一种。']]}];

const NEWRULES=[
 ['Bond: 4 weeks of rent at most, for every kind of tenancy, since 30 September 2024.','押金：2024 年 9 月 30 日起，所有租约最多 4 周房租。'],
 ['Rent increases: once every 12 months, tied to the property since 6 June 2024.','涨租：12 个月一次；2024 年 6 月 6 日起跟着房子算。'],
 ['Rent bidding: banned since 6 June 2024. No inviting or accepting offers above the advertised rent.','竞租：2024 年 6 月 6 日起禁止，不能邀请或接受高于广告价的出价。'],
 ['Applications: since 1 May 2025, agents and owners must use the RTA’s standard application form and cannot ask for more than it allows. New privacy rules cover renters’ information.','申请表：2025 年 5 月 1 日起必须用 RTA 的标准申请表，不能要求超出表格范围的资料；租客个人资料有新的隐私规定。']];

function rightsHtml(){const tel=n=>`<a class="tel" href="tel:${n.replace(/\s/g,'')}">${ico('phone')} ${n}</a>`;
 return `<section class="rhero"><div class="rh-t"><span class="kick">${t('Know your rights','租客权益')}</span><h1>${t('Who helps renters,<br><em>and what they can do.</em>','谁能帮租客，<br><em>能帮到哪一步。</em>')}</h1></div><div class="rh-bird">${ibis(92,'idle',t('Bin Bin the ibis','宾宾，一只白鹮'))}</div></section>
 <div class="note">${t('Bin Bin, Brisbane’s famous “bin chicken”, checked every number below against the official sites on','宾宾（布里斯班有名的“垃圾鸡”白鹮）已于')} <b>${t(RIGHTS_CHECKED[0],RIGHTS_CHECKED[1])}</b>${t('.',' 对照官方网站核对过以下资料。')}</div>

 <div class="sec">${t('Who to call','找谁')}</div>
 ${HELP.map(h=>`<div class="hcard ${h.k}"><div class="hc-h"><b>${esc(h.name)}</b><span>${esc(h.zh)}</span></div><p>${t(h.en,h.zhd)}</p>${h.hrs?`<div class="meta">${t(h.hrs[0],h.hrs[1])}</div>`:''}<div class="hc-a">${h.tel?tel(h.tel):''}<a class="site" href="${h.url}" target="_blank" rel="noopener">${esc(h.site)} ↗</a></div></div>`).join('')}

 <div class="sec">${t('The RTA’s powers','RTA 的权力')}</div>
 <div class="pw"><div class="pw-c can"><b>${t('It can','能做')}</b>${RTA_CAN.map(r=>`<p>${ico('check')}<span>${t(r[0],r[1])}</span></p>`).join('')}</div>
 <div class="pw-c cant"><b>${t('It cannot','不能做')}</b>${RTA_CANT.map(r=>`<p>${ico('x')}<span>${t(r[0],r[1])}</span></p>`).join('')}</div></div>
 <div class="callout">${t('The usual order: raise it in writing first, then RTA conciliation, then QCAT. Urgent problems can go straight to QCAT. QSTARS can help at every step.','一般顺序：先书面沟通，再找 RTA 调解，最后才到 QCAT。紧急问题可以直接找 QCAT。每一步都可以请 QSTARS 帮忙。')}</div>

 <div class="sec">${t('Which door first?','遇到问题，先敲哪扇门？')}</div>
 ${DOORS.map((d,i)=>`<details class="door"${i===0?' open':''}><summary><span class="di">${ico(d.ic)}</span><b>${t(d.en,d.zh)}</b></summary><ol>${d.s.map(s=>`<li>${t(s[0],s[1])}</li>`).join('')}</ol></details>`).join('')}

 <div class="sec">${t('Rules that changed recently','最近改过的规定')}</div>
 ${NEWRULES.map(r=>`<div class="rule">${t(r[0],r[1])}</div>`).join('')}

 <div class="sec">${t('Habits that win disputes','能帮你赢的好习惯')}</div>
 <div class="habits">${[['camera','Dated photos on move-in and move-out','入住和退房都拍带日期的照片'],['doc','Fill in the entry condition report and keep a copy','填好入住状况报告并留副本'],['chat','Agree things in writing, not only by voice','重要的事用文字确认，别只靠口头'],['coin','Pay by bank transfer and keep the receipts','用银行转账付款并保留收据']].map(h=>`<div class="hb">${ico(h[0])}<span>${t(h[1],h[2])}</span></div>`).join('')}</div>

 <div class="note">${t('General information, not legal advice. Rules, fees and phone hours change; the linked official sites are the final word.','以上为一般信息，不构成法律建议。规定、费用和热线时间会变动，以链接的官方网站为准。')}</div>`}
