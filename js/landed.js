// Loka · landed.js: "Just landed" kit for people arriving at Brisbane Airport, and the
// "Add Loka to your home screen" prompt. Works offline once Loka has been opened once.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
//
// Facts here were checked on LANDED_CHECKED against the linked official pages. Fares change:
// re-check the Airtrain and Translink pages before editing, and update the date.
const LANDED_CHECKED=['18 Nov 2026','2026 年 11 月 18 日'];
let installEvt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;const b=document.getElementById('installb');if(b)b.hidden=false});
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
async function doInstall(){if(!installEvt)return;installEvt.prompt();try{await installEvt.userChoice}catch(e){}installEvt=null;render()}

function installCard(){if(isStandalone())return `<div class="inst done">${ico('check')} ${t('Loka is on your home screen. It opens even without a SIM or Wi-Fi.','Loka 已在主屏幕上，没有 SIM 卡或 Wi-Fi 也能打开。')}</div>`;
 return `<div class="inst"><div class="in-h"><span class="in-ic">L<b></b></span><span><b>${t('Keep Loka on your phone','把 Loka 放到手机主屏幕')}</b><i>${t('Free, no app store, under 1 MB. After the first open it works offline, so this kit is there before your SIM is.','免费、不用应用商店、不到 1 MB。打开过一次就能离线使用，SIM 卡还没装好也能看。')}</i></span></div>
  <button id="installb" class="btn" data-a="install" ${installEvt?'':'hidden'}>${t('Add to home screen','添加到主屏幕')}</button>
  ${isIOS()?`<ol class="in-ios"><li>${t('Tap the Share button','点 Safari 的分享按钮')} <span class="shr">⬆︎</span></li><li>${t('Choose “Add to Home Screen”','选择“添加到主屏幕”')}</li><li>${t('Tap “Add”','点“添加”')}</li></ol>`:installEvt?'':`<div class="note">${t('In Chrome: menu ⋮, then “Add to Home screen” or “Install app”.','Chrome：点右上角 ⋮，选“添加到主屏幕”或“安装应用”。')}</div>`}</div>`}

const LANDED=[
 {ic:'plane',en:'Get into the city',zh:'从机场进城',
  p:['The Airtrain is the train at the airport. It is run by a private company, so it is not part of the 50c Translink fare: Airtrain fares start from $23.30 to Brisbane City stations (from 27 April 2026). You can tap on with a go card or a contactless bank card, or book online.','机场的火车叫 Airtrain，由私人公司经营，不在 Translink 50 分车资之内：到市区各站 $23.30 起（2026 年 4 月 27 日起）。可以刷 go card 或感应式银行卡，也可以网上预订。'],
  more:['Starting uni? UQ, QUT and Griffith run airport reception for new international students. Check your uni’s page before you fly; some are free, some charge, and most need booking ahead.','刚来读书？UQ、QUT、Griffith 都有新国际生接机服务。起飞前先看学校网页：有的免费、有的收费，大多要提前预约。'],
  links:[['Airtrain','https://www.airtrain.com.au/'],['Translink: airport','https://translink.com.au/travel-with-us/airport-services'],['UQ','https://my.uq.edu.au/information-and-services/student-support/accommodation/airport-reception'],['QUT','https://www.qut.edu.au/study/student-life/support/airport-reception'],['Griffith','https://www.griffith.edu.au/international/prepare-university/airport-reception']]},
 {ic:'card',en:'Buses, trains and ferries: 50c a trip',zh:'公交、火车、渡轮：一程 50 分',
  p:['Translink services cost a flat 50 cents a trip. Tap your contactless bank card or phone on, and tap off with the same card or phone. Forgetting to tap off costs more than 50c.','Translink 的服务一律一程 50 分。上车刷感应式银行卡或手机，下车用同一张卡或同一部手机再刷一次。忘记下车刷卡，扣的钱会多过 50 分。'],
  links:[['Translink','https://translink.com.au/']]},
 {ic:'phone',en:'Get a number',zh:'办一个手机号',
  p:['Buy a SIM or eSIM at the airport or any supermarket. Many Australian services, banks included, send you a code by SMS, so get the number before you open accounts.','在机场或任何超市都能买 SIM 卡或 eSIM。很多澳洲服务（包括银行）都会用短信发验证码，所以先办号码，再开户。']},
 {ic:'shield',en:'Numbers to save now',zh:'现在就存好的号码',
  p:['000 for police, fire or ambulance in an emergency. 13 HEALTH (13 43 25 84) to talk to a Queensland nurse any time. Policelink 131 444 for non-urgent police. 131 450 for a free interpreter.','紧急情况（警察、消防、救护车）打 000。13 HEALTH（13 43 25 84）随时可以咨询昆州护士。非紧急报警打 Policelink 131 444。免费口译打 131 450。'],
  tels:['000','13 43 25 84','131 444','131 450']},
 {ic:'house',en:'Somewhere to stay',zh:'住的地方',
  p:['Inspect before you pay anything, in person or on a live video call. A bond is at most 4 weeks of rent and has to go to the RTA. Loka checks every listing against these rules.','付任何钱之前先看房（当面或实时视频）。押金最多 4 周房租，而且必须存进 RTA。Loka 每一条房源都会按这些规定检查。'],act:['homes','Find a room','找房']},
 {ic:'sun',en:'Brisbane sun and water',zh:'布村的太阳和海水',
  p:['The sun here burns fast, even on cloudy days: hat, sunscreen, water. At the beach, swim between the red and yellow flags. Loka’s Today page shows any heatwave or storm warning from the Bureau of Meteorology.','这里的太阳很猛，阴天也会晒伤：戴帽子、擦防晒、多喝水。去海边要在红黄旗之间游泳。Loka 的“今日布村”会显示气象局的热浪或风暴警报。'],act:['today','Open Today in Brisbane','打开今日布村']},
 {ic:'list',en:'Your first 30 days',zh:'落地 30 天',
  p:['Tax File Number, bank account, health cover, visa work conditions: the full checklist, with a tick for each one you finish.','税号、银行账户、医疗保险、签证打工条件：完整清单，做完一项勾一项。'],act:['guide','Open the checklist','打开清单']}];

function landedHtml(){const tel=n=>`<a class="mini-btn" href="tel:${n.replace(/\s/g,'')}">${ico('phone')} ${n}</a>`;
 return `<section class="lhero"><div class="lh-sky" aria-hidden="true"><svg viewBox="0 0 340 120"><path class="lh-trail" d="M-10 96C70 92 150 70 230 40" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 7" opacity=".55"/><g class="lh-plane"${REDUCED.matches?' transform="translate(170 54) rotate(-20)"':''}><path d="M-20 0l14-3 6-9 3 1-3 8 10-2 3-5 2 1-1 5 3 1-3 1 1 5-2 1-3-5-10-2 3 8-3 1-6-9z" fill="#fff"/>${REDUCED.matches?'':'<animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="M-10 96C70 92 150 70 230 40"/>'}</g><g transform="translate(250 64) scale(.5)">${ibis(64,'idle')}</g></svg></div>
  <span class="kick">${t('Just landed at BNE','刚落地布里斯班机场')}</span><h1>${t('Welcome to<br><em>Brissie.</em>','欢迎来到<br><em>布村。</em>')}</h1><p>${t('The first hours, sorted: getting into town, paying for transport, a phone number, safe numbers and a safe room.','落地头几个小时要做的事，一页搞定：进城、坐车、手机号、紧急电话、安全住处。')}</p></section>
 ${installCard()}
 ${LANDED.map((s,i)=>`<div class="lstep" style="--i:${i}"><div class="ls-n">${i+1}</div><div class="ls-c"><b>${ico(s.ic)} ${t(s.en,s.zh)}</b><p>${t(s.p[0],s.p[1])}</p>${s.more?`<p class="more">${t(s.more[0],s.more[1])}</p>`:''}
  ${s.tels||s.links||s.act?`<div class="ct-a">${(s.tels||[]).map(tel).join('')}${(s.links||[]).map(l=>`<a class="mini-btn" href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join('')}${s.act?`<button class="mini-btn hot" data-a="tab" data-v="${s.act[0]}">${t(s.act[1],s.act[2])} →</button>`:''}</div>`:''}</div></div>`).join('')}
 <div class="note">${t('Checked against the linked official pages on','已于')} ${t(LANDED_CHECKED[0],LANDED_CHECKED[1])}${t('. Fares and services change; the linked pages are the final word.',' 对照官方页面核对。票价和服务会变动，以链接页面为准。')}</div>`}
