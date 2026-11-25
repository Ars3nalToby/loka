// Loka · play.js: "Brisbane, how to play · 布村怎么玩". Creator-style day plans (the kind travel
// YouTubers and 小红书 bloggers post), but tied to live data: each plan shows today's real sessions
// from the council feed and any ferry or transport notice that affects it.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
//
// Facts in stops were checked on PLAY_CHECKED (see HANDOFF.md log). No restaurant or shop names:
// Loka does not recommend businesses. Prices: only "free" where the official source says free.
const PLAY_CHECKED=['18 Nov 2026','2026 年 11 月 18 日'];
const PLAYS=[
 {id:'free-city',vb:'100 16 200 61',en:'A free half-day in the city',zh:'市区免费半日游',hook:['Zero dollars, one whole afternoon','一分钱不花，玩满一个下午'],time:['3–4 hours','3–4 小时'],cost:['Free, plus 50c transport','免费，车资 50 分'],
  live:/botanic gardens|clock tower|greeters|museum of brisbane/i,tr:null,
  stops:[['City Botanic Gardens','City Botanic Gardens, Brisbane City','Free volunteer-guided walks start at the information kiosk on many days. Shade, river paths, bin chickens.','常有免费的志愿者导览，从信息亭出发。有树荫、河边步道，还有很多白鹮。'],
   ['Queen’s Wharf and the Sky Deck','Queen’s Wharf Brisbane','The Sky Deck is open to the public about 100 m above the river. Best just before sunset.','Sky Deck 离河面约 100 米，对公众开放，日落前最好看。'],
   ['Neville Bonner Bridge to South Bank','Neville Bonner Bridge, Brisbane','Walk the bridge (opened August 2024) across to the cultural precinct.','走过 2024 年 8 月开通的 Neville Bonner 步行桥，到对岸的文化区。'],
   ['Streets Beach','Streets Beach, South Bank','A free swimming lagoon in the middle of the city. Bring togs (Queensland for swimwear).','市中心的免费人工沙滩泳池。记得带 togs（昆州人说泳衣）。'],
   ['Kangaroo Point Cliffs at dusk','Kangaroo Point Cliffs','The classic city view: Story Bridge and the CBD lighting up.','最经典的布村夜景：Story Bridge 和市中心的灯慢慢亮起来。']]},
 {id:'citycat',vb:'250 20 152 66',en:'Ride the CityCat',zh:'坐 CityCat 看布村',hook:['The 50c river cruise locals use every day','本地人每天坐的 50 分“游河船”'],time:['1–2 hours','1–2 小时'],cost:['50c a trip','一程 50 分'],
  live:null,tr:/ferry|citycat|F1|cross river/i,
  stops:[['Board at UQ St Lucia','UQ St Lucia ferry terminal','Start at one end so you get a seat at the front or back.','从终点站上船，比较容易坐到船头或船尾。'],
   ['Through the CBD reach','Riverside ferry terminal, Brisbane','Queen’s Wharf, the Kangaroo Point Cliffs and the city towers slide past.','Queen’s Wharf、Kangaroo Point 悬崖和市中心高楼一路从身边经过。'],
   ['Under the Story Bridge','Story Bridge, Brisbane','Look straight up as you pass under Australia’s longest cantilever bridge (opened 1940).','从澳洲最长的悬臂桥下面穿过（1940 年通车），记得抬头看。'],
   ['Tap off, then tap on again','','Tap off with the same card or phone you tapped on with. If you forget to tap off, you can be charged more than 50c.','下船要用上船时同一张卡或同一部手机刷卡；忘记刷卡下船，可能会被多扣钱。']]},
 {id:'cootha',vb:'0 18 140 61',en:'Mt Coot-tha: gardens and the lookout',zh:'Mt Coot-tha：植物园和观景台',hook:['The view every Brisbane photo is taken from','布村城市照片几乎都是在这里拍的'],time:['Half a day','半天'],cost:['Gardens and walks free','植物园和导览免费'],
  live:/coot-tha|botanic gardens mt/i,tr:null,
  stops:[['Brisbane Botanic Gardens Mt Coot-tha','Brisbane Botanic Gardens Mt Coot-tha','Free volunteer-guided walks on many days. Check today’s times below.','很多天都有免费志愿者导览，今天的时间看下面。'],
   ['Up to the lookout','Mt Coot-tha Lookout','The TV masts mark the top. Go late afternoon for sunset over the city.','山顶的电视塔就是标志。傍晚去，可以看日落和城市。'],
   ['Bring water and a hat','','Queensland sun is strong even in the hills. Check the Today page for heat warnings.','山上太阳一样猛。出门前看“今日布村”有没有高温警报。']]},
 {id:'friends',vb:'160 17 143 62',en:'Make friends and practise English, free',zh:'免费交朋友、练英语',hook:['How new arrivals actually make friends here','新来的人到底怎么在这里交到朋友'],time:['An hour or two','一两个小时'],cost:['Free','免费'],
  live:/english conversation|greeters|tea and trivia|book club/i,tr:null,
  stops:[['English conversation groups','Brisbane City Council libraries','Libraries run free, friendly English conversation groups every week. All levels welcome.','市立图书馆每周都有免费的英语会话小组，什么程度都欢迎。'],
   ['Brisbane Greeters walk','Brisbane City Hall','Free guided walks with locals who love the city. Bookings on their site.','由热爱布村的本地人带的免费导览，在官网预约。'],
   ['Join a squad on Loka','','Badminton, a run or a hotpot table that needs one more person.','羽毛球、跑步，或者火锅局还差一个人？直接在 Loka 上车。','play']]},
 {id:'rainy',vb:'160 17 143 62',en:'Rainy day in Brisbane',zh:'下雨天去哪',hook:['Storm season plan: indoors and still fun','雷雨季的室内玩法'],time:['Any length','随意'],cost:['Mostly free','大多免费'],
  live:/museum of brisbane|exhibition|library/i,tr:null,
  stops:[['Museum of Brisbane','Museum of Brisbane, City Hall','Free exhibitions inside City Hall, plus the Clock Tower Tour.','市政厅里的免费展览，还有钟楼导览。'],
   ['A council library','Brisbane Square Library','Free Wi-Fi, desks, exhibitions and events. Good for a slow afternoon.','免费 Wi-Fi、座位、展览和活动，适合慢慢待一个下午。'],
   ['Check storm warnings first','','In storm season the Bureau of Meteorology issues warnings. Loka’s Today page shows them.','雷雨季气象局会发警报，Loka 的“今日布村”会显示。','today']]}];

const play=id=>PLAYS.find(p=>p.id===id);
const mapsQ=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q+', Brisbane QLD');
function playLive(p){const ev=LIVE.events&&LIVE.events.items,tr=LIVE.transit&&LIVE.transit.items;let h='';
 if(p.live&&ev){const m=ev.filter(e=>p.live.test(e.t+' '+e.v)).slice(0,6);if(m.length)h+=`<div class="sec">${t('Happening today and tomorrow','今明两天的场次')} <span class="live-dot"></span></div>`+m.map(evCard).join('')}
 if(p.tr&&tr){const m=tr.filter(i=>p.tr.test(i.t+' '+i.d)).slice(0,4);h+=`<div class="sec">${t('Ferry notices right now','渡轮最新通知')}</div>`+(m.length?m.map(i=>`<a class="tr ${sev(i)===2?'maj':''}" href="${esc(safeUrl(i.u,'https://translink.com.au/service-updates'))}" target="_blank" rel="noopener"><b>${esc(i.t)}</b><i>${esc(i.d)}</i></a>`).join(''):`<div class="note">${t('No ferry notices right now.','目前没有渡轮通知。')}</div>`)}
 return h}
function guidesHtml(){liveLoad();const night=isNight()||isDark();
 return `<section class="ghero"><span class="kick">${t('Brisbane, the way creators do it','跟着博主玩布村')}</span><h1>${t('How to play<br><em>Brisbane.</em>','布村<br><em>怎么玩。</em>')}</h1><p>${t('Day plans like the ones on YouTube and 小红书 (RedNote), joined to today’s real sessions and transport notices.','像 YouTube 和小红书（RedNote）上的攻略，再接上今天真实的活动场次和交通通知。')}</p></section>
 ${PLAYS.map((p,i)=>`<button class="gcard" data-a="guide1" data-v="${p.id}" style="--i:${i}"><span class="g-art${night?' night':''}">${panorama({vb:p.vb,par:'xMidYMid meet',night})}</span><span class="g-b"><em>${t(p.hook[0],p.hook[1])}</em><b>${t(p.en,p.zh)}</b><i>${ico('guide')} ${t(p.time[0],p.time[1])} · ${t(p.cost[0],p.cost[1])}</i></span></button>`).join('')}
 <div class="note">${t('Checked against official sources on','已于')} ${t(PLAY_CHECKED[0],PLAY_CHECKED[1])}${t('. Loka does not recommend businesses and is not paid by any place listed.','对照官方资料核对。Loka 不推荐商家，也没有收任何地点的钱。')}</div>`}
function guideSheet(id){const p=play(id);if(!p)return;const night=isNight()||isDark();
 openSheet(`<div class="g-top${night?' night':''}">${panorama({vb:p.vb,par:'xMidYMid meet',night})}</div><em class="g-hook">${t(p.hook[0],p.hook[1])}</em><div class="tt" style="font-size:22px">${t(p.en,p.zh)}</div>
 <div class="g-meta"><span>${ico('guide')} ${t(p.time[0],p.time[1])}</span><span>${ico('coin')} ${t(p.cost[0],p.cost[1])}</span></div>
 <ol class="g-steps">${p.stops.map((s,i)=>`<li style="--i:${i}"><b>${esc(s[0])}</b><p>${t(s[2],s[3])}</p>${s[1]?`<a class="mini-btn" href="${mapsQ(s[1])}" target="_blank" rel="noopener">${ico('pin')} ${t('Map','地图')} ↗</a>`:''}${s[4]?`<button class="mini-btn hot" data-a="tab" data-v="${s[4]}">${t('Open in Loka','在 Loka 打开')} →</button>`:''}</li>`).join('')}</ol>
 <div id="glive">${playLive(p)}</div>
 <button class="btn" data-a="gcopy" data-v="${p.id}">📕 ${t('Copy as a 小红书 (RedNote) post','复制成小红书（RedNote）文案')}</button>
 <div class="note">${t('Times and services change; tap through to the official page before you go.','时间和服务会变动，出发前点进官方页面确认。')}</div>`)}
function rednoteText(p){const zh=S.lang==='zh';
 return `${zh?'📍':'📍'}${p.zh}｜${p.hook[1]}\n\n⏰ ${p.time[1]}  💰 ${p.cost[1]}\n\n${p.stops.map((s,i)=>`${['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'][i]||'•'} ${s[0]}\n${s[3]}`).join('\n\n')}\n\n💡 今天有什么场次、交通有没有变动，我都在 Loka 上看：${BRAND.url}\n\n#布里斯班 #布村 #布里斯班旅游 #澳洲留学 #布里斯班生活 #昆士兰`}
