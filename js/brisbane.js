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

// Skyline strip for the bottom of the home poster: the river, a CityCat, the Story Bridge with
// twinkling lights, a Queenslander on stumps, a palm, a big wheel and Bin Bin on the bank.
// Brisbane clock, whatever the phone's own time zone is. Queensland has no daylight saving.
function brisHour(){try{return +new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Brisbane',hour:'numeric',hourCycle:'h23'}).format(new Date())}catch(e){return new Date().getHours()}}
const isNight=()=>{const h=brisHour();return h>=19||h<6};
function skyline(){const L='#F4F0E7',night=isNight()||(typeof isDark==='function'&&isDark()),lights=[60,74,88,102,116,130,144].map((x,i)=>`<circle class="tw" style="--t:${i*.35}s" cx="${x}" cy="${i%2?35:33}" r="1.3" fill="#F4C766"/>`).join('');
 const stars=[[20,10],[52,4],[96,12],[140,6],[176,14],[248,8],[300,4],[336,14],[120,22],[70,24]].map(([x,y],i)=>`<circle class="star" style="--t:${(i*.37).toFixed(2)}s" cx="${x}" cy="${y}" r="${i%3?.8:1.2}" fill="#FFF3D6"/>`).join('');
 return `<div class="sky${night?' night':''}" aria-hidden="true"><svg viewBox="0 0 360 86" preserveAspectRatio="xMidYMax meet">
 ${night?`<g class="stars">${stars}</g><g class="moon"><circle cx="160" cy="12" r="7" fill="#FFF3D6"/><circle cx="163" cy="10" r="6" fill="#1d6a56"/></g>`:''}
 <g opacity=".22" fill="${L}"><rect x="180" y="20" width="12" height="44"/><rect x="194" y="8" width="10" height="56"/><rect x="206" y="26" width="14" height="38"/><rect x="222" y="14" width="9" height="50"/><rect x="233" y="30" width="12" height="34"/></g>
 <g class="wheel" opacity=".55"><g class="spin-w"><circle cx="270" cy="38" r="17" fill="none" stroke="${L}" stroke-width="1.4"/>${[0,30,60,90,120,150].map(a=>`<path d="M${(270+17*Math.cos(a*Math.PI/180)).toFixed(1)} ${(38+17*Math.sin(a*Math.PI/180)).toFixed(1)}L${(270-17*Math.cos(a*Math.PI/180)).toFixed(1)} ${(38-17*Math.sin(a*Math.PI/180)).toFixed(1)}" stroke="${L}" stroke-width=".6"/>`).join('')}${[0,60,120,180,240,300].map(a=>`<circle cx="${(270+17*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(38+17*Math.sin(a*Math.PI/180)).toFixed(1)}" r="2" fill="#F4C766"/>`).join('')}</g><path d="M262 64L270 38L278 64" fill="none" stroke="${L}" stroke-width="1.4"/></g>
 <g class="bridge" fill="none" stroke="${L}" stroke-width="1.6" opacity=".8"><path d="M30 46H170"/><path d="M48 46L74 22L100 46L126 22L152 46"/><path d="M74 22V58M126 22V58"/><path d="M58 46L74 30L90 46M110 46L126 30L142 46" stroke-width=".8"/>${lights}</g>
 <g class="qlder" opacity=".9"><path d="M298 44L318 32L338 44Z" fill="#E2683C"/><rect x="302" y="44" width="32" height="12" fill="${L}"/><path d="M302 49H334" stroke="#1F6F5C" stroke-width=".8"/><path d="M306 56V64M318 56V64M330 56V64" stroke="${L}" stroke-width="1.6"/><rect x="314" y="46" width="7" height="6" fill="#F4C766" class="glow"/>${night?`<g class="possum"><ellipse cx="327" cy="37.5" rx="4.5" ry="3" fill="#8f8a84"/><circle cx="323" cy="35.5" r="2.6" fill="#a5a09a"/><circle cx="321.6" cy="33.4" r="1" fill="#a5a09a"/><circle cx="324.4" cy="33.4" r="1" fill="#a5a09a"/><circle class="eye" cx="322.3" cy="35.4" r=".55" fill="#F4C766"/><circle class="eye" cx="323.9" cy="35.4" r=".55" fill="#F4C766"/><path d="M331 38c3 0 4 3 2 5" stroke="#5e5953" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>`:''}</g>
 <g class="palm"><path d="M350 64C349 54 350 46 352 40" stroke="#c9a46a" stroke-width="2" fill="none"/><g class="frond" fill="#2f9a7f"><path d="M352 40C346 36 340 38 337 42C343 39 348 40 352 40Z"/><path d="M352 40C358 35 364 37 366 41C360 38 356 39 352 40Z"/><path d="M352 40C350 33 353 29 357 28C354 32 353 36 352 40Z"/></g></g>
 <path d="M0 64C60 60 120 68 180 64S300 60 360 64V86H0Z" fill="#185a4a"/><path class="ripple" d="M0 70C40 68 80 72 120 70S200 68 240 71S320 69 360 70" stroke="#2f9a7f" stroke-width="1.2" fill="none" opacity=".7"/>
 <g class="cat"><path d="M0 69H26L22 74H4Z" fill="${L}"/><rect x="6" y="63" width="15" height="6" rx="2" fill="${L}"/><path d="M8 65H19" stroke="#1F6F5C" stroke-width="1.6" stroke-dasharray="2 1.2"/><path d="M-6 72H-1M-10 74H-3" stroke="${L}" stroke-width=".8" opacity=".6"/></g>
 <g transform="translate(150 38) scale(.5)">${ibis(64,'idle')}</g></svg></div>`}

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
