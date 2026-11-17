// Loka · jobs.js: Jobs: list, detail, job form.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
function listJobs(){let l=S.jobs.filter(j=>(!jf.fair||!jobFlags(j).length)&&(!jf.zh||j.zh)&&(!jf.cash||j.cash)&&(!jf.q||(j.area+' '+j.title).toLowerCase().includes(jf.q.toLowerCase()))).sort((a,b)=>b.pay-a.pay);
 LC=l.length+' '+t(l.length===1?'job':'jobs','个工作');
 return l.map(j=>{const fl=jobFlags(j);return `<div class="card"><div class="row"><button data-a="job" data-v="${j.id}" style="text-align:left;flex:1"><div class="tt">${esc(j.title)}</div><div class="meta">${ico('pin')} ${esc(j.area)} · ${esc(j.hrs)} · ${ago(j)}</div></button>
  <div style="text-align:right"><div class="price">$${j.pay}<small>/${t('hr','时')}</small></div><button class="heart ${isSaved('jobs',j.id)?'on':''}" data-a="fav" data-k="jobs" data-v="${j.id}" style="font-size:18px;color:${isSaved('jobs',j.id)?'var(--hot)':'rgba(25,21,18,.25)'}">♥</button></div></div>
  ${j.zh?`<span class="tag b">${t('Mandarin a plus','会中文优先')}</span>`:''}${j.cash?`<span class="tag g">${t('Cash','现金')}</span>`:''}<span class="tag">${j.casual?t('Casual','临时'):t('Part time','兼职')}</span>
  ${fl.length?fl.map(x=>`<span class="flag">⚠ ${x}</span>`).join(''):`<span class="ok">✓ ${t('Legal pay','时薪合法')}</span>`}</div>`}).join('')||`<div class="note">${t('No jobs match.','没有符合的工作。')}</div>`}

function jobDetail(id){const x=S.jobs.find(q=>q.id===id);if(!x)return;const fl=jobFlags(x);
 openSheet(`<div class="tt" style="font-size:21px">${esc(x.title)}</div><div class="meta">${esc(x.area)} · ${esc(x.hrs)} · ${esc(x.lang)}</div><div class="price" style="margin-top:8px">$${x.pay}<small>/${t('h','时')} · ${x.casual?t('casual','临时'):t('part time','兼职')}</small></div>
 ${fl.length?fl.map(f=>`<span class="flag">⚠ ${f}</span>`).join(''):`<span class="ok">✓ ${t('At or above national minimum','不低于全国最低工资')}</span>`}<div class="note">${esc(x.note)}</div>
 <div class="res">${t('At','按')} ${x.hpw||15} ${t('h a week this pays about','小时/周计算，约')} <b>$${wk(x)}</b>/${t('wk before tax','周（税前）')}</div>
 ${(()=>{const hs=S.homes.filter(h=>zone(h.area)===zone(x.area)&&!homeFlags(h).length).sort((a,b)=>a.rent-b.rent).slice(0,3);return hs.length?`<div class="sec">${t('Rooms near this job','这份工作附近的房')}</div>`+hs.map(h=>`<button class="mini" data-a="home" data-v="${h.id}"><span><b>$${h.rent}/${t('wk','周')} · ${esc(h.area)}</b><i>${esc(h.title)}</i></span><em class="${h.rent/wk(x)<=.4?'gd':'bd'}">${Math.round(h.rent/wk(x)*100)}%<small>${t('of pay','占收入')}</small></em></button>`).join(''):''})()}
 <div class="sec">${t('Contact','联系方式')}</div><div class="tt">${esc(x.contact)}</div><div class="meta">${t('Posted by','发布人')} ${esc(x.by)}</div>
 <button class="btn ghost" data-a="copy" data-v="${esc(x.contact)}">${t('Copy contact','复制联系方式')}</button>
 <button class="btn" data-a="fav" data-k="jobs" data-v="${x.id}" data-re="job">${isSaved('jobs',x.id)?t('Saved ♥','已收藏 ♥'):t('Save this job','收藏')}</button><button class="link" data-a="report" data-k="jobs" data-v="${x.id}">${t('Report this job','举报这份工作')}</button>`)}
function jobForm(){openSheet(`<div class="tt" style="font-size:21px">${t('Post a job','发布工作')}</div>
 <label>${t('Role','职位')}</label><input id="j_title"><div class="g2"><div><label>${t('Suburb','区域')}</label><input id="j_area"></div><div><label>${t('Hours','工时')}</label><input id="j_hrs" placeholder="15–20 h/wk"></div></div>
 <div class="g2"><div><label>${t('Hourly pay $','时薪 $')}</label><input id="j_pay" type="number" step="0.01"></div><div><label>${t('Type','类型')}</label><select id="j_cas"><option value="1">${t('Casual','临时工')}</option><option value="0">${t('Part / full time','兼职/全职')}</option></select></div></div>
 <label>${t('Languages','语言')}</label><input id="j_lang" value="English"><label>${t('Contact','联系方式')}</label><input id="j_contact">${S.me?'':`<label>${t('Your name','你的名字')}</label><input id="j_by">`}
 <label>${t('Details','详情')}</label><textarea id="j_note" rows="2"></textarea><button class="btn" data-a="createjob">${t('Publish','发布')}</button>
 <div class="note">${t('Pay under the national minimum is shown to job seekers with a warning.','低于全国最低工资的职位会向求职者显示警示。')}</div>`)}
