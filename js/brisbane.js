// Loka · brisbane.js: Brisbane-flavoured art. The skyline strip on the home poster, the seasonal
// petals, the ibis mascot "Bin Bin 宾宾", and the CityCat that sails the map river.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// All drawings are original, hand-written SVG. No logos, no brand marks, no photos.

// Brisbane's street trees flower in turn. October–November is jacaranda (purple), December–January
// is poinciana (red), the rest of the year we use frangipani (cream).
function season(d){const m=(d||new Date()).getMonth();
 if(m===9||m===10)return {k:'jac',c:'#A68BE0',c2:'#8C6FD1',en:'Jacaranda season',zh:'蓝花楹季'};
 if(m===11||m===0)return {k:'poin',c:'#F0603C',c2:'#D9472A',en:'Poinciana season',zh:'凤凰木季'};
 return {k:'frang',c:'#FFF3D6',c2:'#F4C766',en:'Frangipani days',zh:'鸡蛋花季'}}

// Falling petals. Positions come from a fixed list so the page looks the same every render.
function petals(){const s=season(),P=[[6,0,9],[18,3.2,11],[31,1.4,10],[47,5.1,12],[60,2.3,9.5],[72,6.4,11.5],[84,.8,10.5],[93,4.2,12.5]];
 return `<div class="petals" aria-hidden="true">${P.map(([x,d,u],i)=>`<i style="left:${x}%;--d:${d}s;--u:${u}s;--r:${i%2?-1:1}"><svg viewBox="0 0 10 10"><path d="M5 0C8 2 8 7 5 10C2 7 2 2 5 0Z" fill="${i%3?s.c:s.c2}"/></svg></i>`).join('')}</div>`}

// Bin Bin 宾宾: an Australian white ibis, Brisbane's unofficial bird ("bin chicken").
// mood: 'idle' (head bob) or 'walk' (waddle). size in px.
function ibis(size,mood,label){size=size||64;
 return `<svg class="ibis ${mood||'idle'}" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${esc(label||t('Bin Bin the ibis','宾宾，一只白鹮'))}">
 <g class="legs" stroke="#3a3530" stroke-width="2" stroke-linecap="round"><path class="l1" d="M30 46L29 60M29 60L25 61"/><path class="l2" d="M38 46L39 60M39 60L43 61"/></g>
 <g class="bodyg"><path d="M50 36C58 34 60 42 54 46L48 44Z" fill="#191512"/><ellipse cx="36" cy="38" rx="17" ry="12.5" fill="#fff" stroke="#E7E0D2" stroke-width="1.2"/>
 <path d="M28 33C33 31 41 33 44 37" fill="none" stroke="#EDE6D8" stroke-width="2" stroke-linecap="round"/>
 <path d="M24 34C21 28 20 22 21 18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
 <g class="head"><circle cx="20" cy="15" r="7" fill="#191512"/><path d="M15 17C10 21 6 28 4 36" fill="none" stroke="#191512" stroke-width="3" stroke-linecap="round"/>
 <circle cx="21.5" cy="13.5" r="2.2" fill="#fff"/><circle cx="22" cy="13.6" r="1.1" fill="#191512"/><circle cx="23.5" cy="18" r="1.8" fill="#F2A7A0" opacity=".9"/></g></g></svg>`}

// The small CityCat that sails up and down the map river. Skipped for Reduce Motion and still maps.
function mapBoat(pathId){if(typeof REDUCED!=='undefined'&&REDUCED.matches)return'';
 return `<g class="mboat" aria-hidden="true"><g transform="scale(.9)"><path d="M-9 0H9L6 4H-6Z" fill="#fff" stroke="#1F6F5C" stroke-width="1"/><rect x="-5" y="-4" width="10" height="4" rx="1.4" fill="#1F6F5C"/></g><animateMotion dur="38s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"><mpath href="#${pathId}"/></animateMotion></g>`}

// Brissie words: everyday Australian (and a few Queensland) words that new arrivals hear and do not
// find in a textbook. One per day; tap the card to flip to the next one.
const SLANG=[['arvo','afternoon','下午','See you this arvo.'],['brekkie','breakfast','早餐','Brekkie at the markets?'],['servo','petrol station','加油站','Grab milk at the servo.'],
 ['togs','swimmers (the Queensland word)','泳衣（昆州说法）','Bring your togs to Streets Beach.'],['port','school bag or suitcase (old Queensland word)','书包或行李箱（昆州老说法）','Pack your port for the coast.'],
 ['bubbler','drinking fountain','饮水机','Fill your bottle at the bubbler.'],['heaps','a lot, very','很多、非常','Heaps of rooms near UQ.'],['reckon','think, suppose','觉得、认为','Reckon it will rain?'],
 ['no worries','it is fine, you are welcome','没关系、不客气','Thanks! — No worries.'],['bin chicken','the white ibis','白鹮（垃圾鸡）','A bin chicken stole my chips.'],['Brissie','Brisbane','布里斯班的昵称','Back in Brissie next week.'],
 ['ute','pickup truck','皮卡车','Can you borrow a ute to move?'],['thongs','flip-flops','人字拖','Thongs are fine at the pub.'],['how ya going?','hello, how are you?','你好吗？（打招呼）','How ya going, mate?'],
 ['chuck a U-ey','make a U-turn','掉头','Chuck a U-ey at the lights.'],['bottle-o','bottle shop','酒类专卖店','The bottle-o shuts at ten.']];
let slangOff=0;
function slangIdx(){const d=Math.floor((Date.now()+10*36e5)/864e5);return (d+slangOff)%SLANG.length}
function slangCard(){const w=SLANG[slangIdx()];
 return `<button class="slang" data-a="slang" aria-label="${t('Next Brissie word','下一个布村用语')}"><span class="sl-k">${t('Brissie word','布村用语')} · ${slangIdx()+1}/${SLANG.length}</span><span class="sl-w">${esc(w[0])}</span><span class="sl-m">${esc(t(w[1],w[2]))}</span><span class="sl-e">“${esc(w[3])}”</span><span class="sl-n">${t('Tap for another','点一下换一个')} ↻</span></button>`}

// ───────── Brisbane panorama (18 Nov 2026) ─────────
// The river skyline as seen from the south bank, left to right in real order: Mt Coot-tha and its
// TV masts, Kurilpa Bridge, Queen's Wharf with the Sky Deck and the Neville Bonner Bridge, the CBD,
// City Hall's clock tower, South Bank's wheel and Streets Beach, the Story Bridge landing on the
// Kangaroo Point Cliffs. Original line drawing. Colours come from CSS (currentColor, --rv) so the
// same art works on the green poster, on cream cards and in dark mode. o.vb crops it for the
// landmark cards, so every card is a window onto the same city.
function panorama(o){o=o||{};const night=o.night!=null?o.night:(isNight()||(typeof isDark==='function'&&isDark()));
 const P=(d,c)=>`<path d="${d}" class="${c}"/>`,R=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
 // Story Bridge top chord: approach, up to the north pier, down the cantilever arm, the suspended span, and back
 const sbTop='M286 56 L300 43 L312 30 L324 42 L332 49 L348 49 L356 42 L368 30 L380 43 L394 56',sbDeck='M282 56 H398';
 const web=[[300,43,306,56],[312,30,306,56],[312,30,318,56],[324,42,318,56],[324,42,330,56],[332,49,340,56],[348,49,340,56],[356,42,350,56],[356,42,362,56],[368,30,362,56],[368,30,374,56],[380,43,374,56],[380,43,388,56],[300,43,294,56]].map(([a,b,c,d])=>`M${a} ${b}L${c} ${d}`).join('');
 const sbLights=[[300,43],[306,36.5],[312,30],[318,36],[324,42],[332,49],[340,49],[348,49],[356,42],[362,36],[368,30],[374,36.5],[380,43]].map(([x,y],i)=>`<circle class="tw" style="--t:${(i*.21).toFixed(2)}s" cx="${x}" cy="${y}" r="1.1"/>`).join('');
 const nbCables=[150,156,170,178,186,194].map(x=>`M166 32L${x} ${(70+((x-146)/60)*2-Math.sin((x-146)/60*Math.PI)*4).toFixed(1)}`).join('');
 const kurilpa=[[76,72,70,52],[76,72,84,54],[90,72,86,50],[90,72,98,55],[104,72,100,53],[104,72,110,57]];
 const wheelSpokes=[0,30,60,90,120,150].map(a=>{const r=a*Math.PI/180,c=Math.cos(r)*16,s=Math.sin(r)*16;return `M${(262+c).toFixed(1)} ${(52+s).toFixed(1)}L${(262-c).toFixed(1)} ${(52-s).toFixed(1)}`}).join('');
 const gond=[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return `<circle cx="${(262+Math.cos(r)*16).toFixed(1)}" cy="${(52+Math.sin(r)*16).toFixed(1)}" r="1.7" class="pv-gold"/>`}).join('');
 const stars=night?[[14,12],[60,6],[96,14],[150,6],[200,10],[244,5],[300,12],[340,6],[388,10],[120,26]].map(([x,y],i)=>`<circle class="star" style="--t:${(i*.37).toFixed(2)}s" cx="${x}" cy="${y}" r="${i%3?.7:1.1}" fill="#FFF3D6"/>`).join('')+`<g class="moon"><circle cx="232" cy="12" r="6" fill="#FFF3D6"/><circle cx="234.6" cy="10.4" r="5.2" class="pv-sky"/></g>`:'';
 const towerWin=(x,y,w,h)=>`<path d="${Array.from({length:Math.floor(h/4)},(_,i)=>`M${x+1.5} ${y+3+i*4}H${x+w-1.5}`).join('')}" class="pv-win"/>`;
 return `<svg class="pano${night?' night':''}" viewBox="${o.vb||'0 0 400 100'}" preserveAspectRatio="${o.par||'xMidYMax meet'}" aria-hidden="true">${o.vb?`<rect x="-10" y="-10" width="420" height="120" class="pv-sky"/>`:''}${stars}
 ${P('M0 70C18 50 44 42 70 51S100 66 116 72V78H0Z','pv-hill')}
 <g class="pv-masts">${[[34,47,26],[44,45,21],[56,49,29]].map(([x,b,t])=>`<path d="M${x} ${b}V${t}M${x-2.5} ${b}L${x} ${t+6}L${x+2.5} ${b}" class="pv-line thin"/><circle class="blink" cx="${x}" cy="${t}" r="1.2"/>`).join('')}</g>
 <g class="pv-cbd">${[[176,34,10],[188,22,9],[199,40,8],[228,26,10],[240,36,9],[251,46,8],[155,42,8]].map(([x,y,w])=>R(x,y,w,78-y,'pv-back')).join('')}</g>
 <g class="pv-qw">${R(114,30,11,48,'pv-solid')}${R(127,26,12,52,'pv-solid')}${R(141,35,8,43,'pv-solid')}${towerWin(114,30,11,48)}${towerWin(127,26,12,52)}${towerWin(141,35,8,43)}
  <path d="M107 27Q127 20 149 24V27.6Q127 24 107 30.4Z" class="pv-deck"/><path d="M110 29.6Q127 25 147 27.2" class="pv-glow"/></g>
 <g class="pv-hall">${R(204,58,24,20,'pv-solid')}${R(212.5,33,7,25,'pv-solid')}<path d="M211.5 33.5Q216 26 220.5 33.5Z" class="pv-solid"/><path d="M216 27V21" class="pv-line thin"/><circle cx="216" cy="38" r="2" class="pv-gold clock"/><path d="M207 62V76M211 62V76M221 62V76M225 62V76" class="pv-cut"/><path class="flag" d="M216 21h4l-1 1.6 1 1.6h-4z"/></g>
 <g class="pv-kur">${kurilpa.map(([a,b,c,d])=>`<path d="M${a} ${b}L${c} ${d}" class="pv-line"/>`).join('')}<path d="M70 52L90 72M84 54L76 72M86 50L104 72M98 55L90 72M100 53L110 57" class="pv-line hair"/>${P('M66 72H116','pv-line')}</g>
 <g class="pv-nb">${P('M146 70Q176 64 206 72','pv-line')}<path d="M160 70L166 32" class="pv-line thick"/><path d="${nbCables}" class="pv-line hair"/></g>
 <g class="pv-sb">${P('M236 74Q258 69 290 74V78H236Z','pv-sand')}<g class="wheel"><g class="spin-w"><circle cx="262" cy="52" r="16" class="pv-line"/><path d="${wheelSpokes}" class="pv-line hair"/>${gond}</g><path d="M255 72L262 52L269 72" class="pv-line"/></g>
  ${[[242,74],[284,74]].map(([x,y])=>`<g class="palm"><path d="M${x} ${y}C${x-1} ${y-7} ${x} ${y-12} ${x+2} ${y-16}" class="pv-trunk"/><g class="frond" style="transform-origin:${x+2}px ${y-16}px"><path d="M${x+2} ${y-16}C${x-4} ${y-20} ${x-9} ${y-18} ${x-11} ${y-14}C${x-5} ${y-17} ${x-1} ${y-16} ${x+2} ${y-16}Z" class="pv-leaf"/><path d="M${x+2} ${y-16}C${x+8} ${y-21} ${x+13} ${y-19} ${x+15} ${y-15}C${x+9} ${y-18} ${x+5} ${y-17} ${x+2} ${y-16}Z" class="pv-leaf"/><path d="M${x+2} ${y-16}C${x} ${y-23} ${x+3} ${y-27} ${x+7} ${y-27}C${x+4} ${y-24} ${x+3} ${y-20} ${x+2} ${y-16}Z" class="pv-leaf"/></g></g>`).join('')}</g>
 <g class="pv-cliff">${P('M374 60H400V78H372Z','pv-rock')}<path d="M378 62V77M383 61V77M388 62V77M393 61V77M397 62V77" class="pv-cut"/>${P('M372 61Q386 56 400 59V62H374Z','pv-leaf')}</g>
 <g class="pv-story"><path d="M312 56V78M368 56V78" class="pv-line pier"/><path d="${sbTop}" class="pv-line thick"/><path d="${sbDeck}" class="pv-line"/><path d="${web}" class="pv-line hair"/><path d="M312 30V56M368 30V56" class="pv-line"/>${sbLights}</g>
 ${P('M0 78H400V100H0Z','pv-river')}<path class="ripple" d="M0 84C40 82 80 86 120 84S200 82 240 85S320 83 400 84" fill="none" stroke-width="1.2"/>
 <path d="M186 79h46M300 80h36M60 81h28" class="pv-refl"/>
 <g class="cat"><path d="M0 83H26L22 88H4Z" class="pv-boat"/><rect x="6" y="77" width="15" height="6" rx="2" class="pv-boat"/><path d="M8 79H19" stroke="#1F6F5C" stroke-width="1.6" stroke-dasharray="2 1.2"/></g>
 <g transform="translate(290 58) scale(.32)">${ibis(64,'idle')}</g></svg>`}

// Landmark cards: each a crop of the panorama, with a checked fact and a way into rooms nearby.
const LANDMARKS=[
 {k:'story',vb:'274 26 130 57',area:'Kangaroo Point',en:'Story Bridge',zh:'故事桥 Story Bridge',f:['Opened on 6 July 1940; Australia’s longest cantilever bridge. It lands on the Kangaroo Point Cliffs.','1940 年 7 月 6 日通车，澳洲最长的悬臂桥，南端落在 Kangaroo Point 悬崖上。']},
 {k:'qw',vb:'100 16 140 61',area:'Brisbane City',en:'Queen’s Wharf',zh:'皇后码头 Queen’s Wharf',f:['The Sky Deck is open to the public about 100 m above the river. The Neville Bonner Bridge (opened August 2024) walks you to South Bank; its mast is 75 m, as tall as the Story Bridge.','Sky Deck 离河面 100 多米，对公众开放。Neville Bonner 步行桥 2024 年 8 月开通，走过去就是 South Bank；桥塔高 75 米，和 Story Bridge 一样高。']},
 {k:'hall',vb:'160 17 143 62',area:'Brisbane City',en:'City Hall',zh:'市政厅 City Hall',f:['Free Clock Tower Tours run from the Museum of Brisbane inside City Hall. Check Today in Brisbane for the next one.','市政厅里的 Museum of Brisbane 有免费钟楼导览，下一场可以在“今日布村”查。']},
 {k:'sb',vb:'220 34 104 46',area:'South Brisbane',en:'South Bank',zh:'南岸 South Bank',f:['The big wheel, Streets Beach (a free swimming lagoon) and the riverside parklands, right across from the CBD.','摩天轮、免费的人工沙滩泳池 Streets Beach，还有河边公园，就在市中心对岸。']},
 {k:'coot',vb:'0 18 140 61',area:'Toowong',en:'Mt Coot-tha & Kurilpa',zh:'Mt Coot-tha 与 Kurilpa 桥',f:['The TV masts on Mt Coot-tha mark the lookout and the Botanic Gardens (free guided walks). Kurilpa’s spiky masts carry walkers and bikes from the CBD to South Brisbane.','Mt Coot-tha 上的电视塔旁边是观景台和植物园（有免费导览）。Kurilpa 桥的尖桅杆连接市中心和 South Brisbane，只给行人和单车走。']}];
function landmarksHtml(){const night=isNight()||isDark();
 return `<div class="sec row2"><span>${t('Brisbane landmarks','布村地标')}</span><span class="cnt">${LANDMARKS.length}</span></div><div class="lms">${LANDMARKS.map((l,i)=>`<div class="lm${night?' night':''}" style="--i:${i}"><div class="lm-art">${panorama({vb:l.vb,par:'xMidYMid meet',night})}</div><div class="lm-b"><b>${t(l.en,l.zh)}</b><p>${t(l.f[0],l.f[1])}</p><button class="mini-btn" data-a="lmrooms" data-v="${esc(l.area)}">${ico('house')} ${t('Rooms near here','附近房源')}</button></div></div>`).join('')}</div>`}

// Brisbane clock, whatever the phone's own time zone is. Queensland has no daylight saving.
function brisHour(){try{return +new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Brisbane',hour:'numeric',hourCycle:'h23'}).format(new Date())}catch(e){return new Date().getHours()}}
function isNight(){const h=brisHour();return h>=19||h<6}
