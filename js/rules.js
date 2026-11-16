// Loka · rules.js: Queensland rules: limits, warning flags, publish checks. Pure logic, no DOM. Tested by tests/rules.test.mjs.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// Rules the app checks listings against. Sources: Qld Government rental law pages (bond, rent in advance), Fair Work Ombudsman (wages from 1 July 2026), Home Affairs condition 8105 (student hours).
const RULES={bondWeeks:4,advRoom:2,advFixedWeeks:4,minWage:26.44,minCasual:33.05,studentHrs:48};
// ───────── checks: the thing the big portals don't do ─────────
function homeFlags(h){const f=[];if(h.bond>h.rent*RULES.bondWeeks)f.push(t(`Bond is ${(h.bond/h.rent).toFixed(1)} weeks of rent. Qld limit is ${RULES.bondWeeks} weeks.`,`押金相当于 ${(h.bond/h.rent).toFixed(1)} 周房租，昆州上限是 ${RULES.bondWeeks} 周。`));
 if(/cash only|只收现金/i.test(h.note||''))f.push(t('Cash only. Ask for a receipt and an RTA bond lodgement number.','只收现金：记得要收据和 RTA 押金编号。'));const am=h.agr==='fixed'?RULES.advFixedWeeks:RULES.advRoom;if(h.adv>am)f.push(t(`Asks for ${h.adv} weeks of rent in advance. The Qld limit here is ${am} weeks.`,`要求预付 ${h.adv} 周房租，昆州此类租约上限是 ${am} 周。`));if(h.role==='head'&&!h.consent)f.push(t('Sub-let by a tenant. Ask to see the owner’s written permission before you pay.','二房东转租：付款前请对方出示业主的书面同意。'));return f}
function jobFlags(j){const min=j.casual?RULES.minCasual:RULES.minWage;return j.pay<min?[t(`$${j.pay}/h is under the national minimum for ${j.casual?'casual':'permanent'} adults ($${min.toFixed(2)}).`,`时薪 $${j.pay} 低于全国成人${j.casual?'临时工':'正式工'}最低工资（$${min.toFixed(2)}）。`)]:[]}
// Publish gate. Returns null when a listing may be published, or the rule it breaks:
// 'bond' (bond above RULES.bondWeeks of rent) or 'advance' (more rent in advance than Qld allows).
// agr is 'fixed' for a fixed-term lease, anything else counts as a room / periodic agreement.
function publishBlock(rent,bond,adv,agr){if(bond>rent*RULES.bondWeeks)return'bond';if(adv>(agr==='fixed'?RULES.advFixedWeeks:RULES.advRoom))return'advance';return null}
