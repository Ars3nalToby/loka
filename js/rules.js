// Loka · rules.js: Queensland rules: limits, warning flags, publish checks. Pure logic, no DOM. Tested by tests/rules.test.mjs.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// Rules the app checks listings against. Sources: RTA (bond: 4 weeks max since 30 Sep 2024; rent in advance: 2 weeks for periodic
// AND for all rooming accommodation whatever the term, 1 month for a fixed-term general tenancy; Loka uses 4 weeks for that
// so the check stays simple and never allows more than the law), Fair Work (wages from 1 July 2026), student visa 48 h/fortnight.
// Rechecked 25 Nov 2026: rta.qld.gov.au rent-in-rooming-accommodation and rent payments fact sheets.
const RULES={bondWeeks:4,advRoom:2,advFixedWeeks:4,minWage:26.44,minCasual:33.05,studentHrs:48};
// ───────── checks: the thing the big portals don't do ─────────
function homeFlags(h){const f=[];if(h.bond>h.rent*RULES.bondWeeks)f.push(t(`Bond is ${(h.bond/h.rent).toFixed(1)} weeks of rent. Qld limit is ${RULES.bondWeeks} weeks.`,`押金相当于 ${(h.bond/h.rent).toFixed(1)} 周房租，昆州上限是 ${RULES.bondWeeks} 周。`));
 if(/cash only|只收现金/i.test(h.note||''))f.push(t('Cash only. Ask for a receipt and an RTA bond lodgement number.','只收现金：记得要收据和 RTA 押金编号。'));const am=advLimit(h.agr,h.type);if(h.adv>am)f.push(t(`Asks for ${h.adv} weeks of rent in advance. The Qld limit here is ${am} weeks.`,`要求预付 ${h.adv} 周房租，昆州此类租约上限是 ${am} 周。`));if(h.role==='head'&&!h.consent)f.push(t('Sub-let by a tenant. Ask to see the owner’s written permission before you pay.','二房东转租：付款前请对方出示业主的书面同意。'));return f}
function jobFlags(j){const min=j.casual?RULES.minCasual:RULES.minWage,f=[];if(j.pay<min)f.push(t(`$${j.pay}/h is under the national minimum for ${j.casual?'casual':'permanent'} adults ($${min.toFixed(2)}).`,`时薪 $${j.pay} 低于全国成人${j.casual?'临时工':'正式工'}最低工资（$${min.toFixed(2)}）。`));
 if(j.cash)f.push(t('Cash in hand: you are still owed a payslip, tax withheld and super.','现金工资：你仍然应该拿到工资单，雇主要代扣税并付养老金。'));return f}
// Publish gate. Returns null when a listing may be published, or the rule it breaks:
// 'bond' (bond above RULES.bondWeeks of rent) or 'advance' (more rent in advance than Qld allows).
// agr is 'fixed' for a fixed-term lease, anything else counts as a periodic agreement. type is 'room' / 'student' /
// 'unit'. A room (rooming accommodation) is capped at 2 weeks in advance even on a fixed term; only a whole place
// on a fixed term may ask for more.
function advLimit(agr,type){return agr==='fixed'&&type==='unit'?RULES.advFixedWeeks:RULES.advRoom}
function publishBlock(rent,bond,adv,agr,type){if(bond>rent*RULES.bondWeeks)return'bond';if(adv>advLimit(agr,type||'unit'))return'advance';return null}
