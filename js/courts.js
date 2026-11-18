// Loka · courts.js: badminton venues in and around Brisbane, for the Squads page and the squad form.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
//
// There is no official open dataset or live-availability feed for badminton courts in Brisbane:
// Brisbane City Council's open data covers council facilities (tennis courts, pools), and badminton
// halls are private or university venues, each with its own booking system. So this is a short list
// checked by hand on COURTS_CHECKED, with each venue's own link. Loka never books on anyone's behalf.
//
// lat/lng are approximate (suburb or campus level), good for the map and distances only. The
// "Directions" button searches the street address in Google Maps for the exact door.
// Only write what a source shows. Unknown price or phone: leave it out, do not guess.
const COURTS_CHECKED=['18 Nov 2026','2026 年 11 月 18 日'];
const COURTS=[
 {id:'ibc-cp',name:'IBC Badminton Centre',area:'Coopers Plains',addr:'4/260 Musgrave Road, Coopers Plains QLD',lat:-27.565,lng:153.040,
  note:['Badminton shoes only on court.','只准穿羽毛球鞋上场。']},
 {id:'gu-mtg',name:'Griffith Uni Recreation Hall',area:'Mount Gravatt',addr:'Recreation Hall (M12), Griffith University, Park Road, Mount Gravatt QLD',lat:-27.553,lng:153.055,courts:4,
  url:'https://www.griffith.edu.au/sport/sport-and-recreation/recreation-hall',note:['Uni hall, open for public hire. Student discount with a Griffith card.','大学场馆，公众可租；凭 Griffith 学生卡有折扣。']},
 {id:'uq-ctr',name:'UQ Sport · UQ Centre',area:'St Lucia',addr:'UQ Centre, The University of Queensland, St Lucia QLD',lat:-27.497,lng:153.013,
  url:'https://uqsport.com.au/facilities/courts/',note:['Book through UQ Sport.','通过 UQ Sport 预订。']},
 {id:'sky',name:'Sky Badminton Centre',area:'Logan Central',addr:'Unit B2, 116–118 Wembley Road, Logan Central QLD',lat:-27.643,lng:153.108,courts:9,
  tel:'07 3808 9443',url:'https://skybadminton.com.au/',price:['$25 per court per hour (from 1 Mar 2026)','每场每小时 $25（2026 年 3 月 1 日起）'],
  note:['Bring your own racquet and shuttles. Non-marking shoes. They suggest booking a week ahead.','自带球拍和羽毛球；须穿不留痕球鞋；建议提前一周订。']},
 {id:'qbc',name:'Queensland Badminton Centre',area:'Carole Park',addr:'2/140 Mica Street, Carole Park QLD',lat:-27.616,lng:152.930,
  url:'https://qbc-v1.squarespace.com/',note:['Further out, west towards Ipswich. Peak and off-peak rates.','较远，在西边靠近 Ipswich；分高峰和非高峰价。']},
 {id:'bec',name:'Brisbane Entertainment Centre · Sports Centre',area:'Boondall',addr:'Brisbane Entertainment Centre, Boondall QLD',lat:-27.343,lng:153.069,courts:8,
  url:'https://www.brisent.com.au/',note:['North side. Hall set up for up to 8 badminton courts. Cashless.','北区；场馆最多可设 8 片羽毛球场；只收电子支付。']},
 {id:'sams',name:'Sam’s Badminton Arena',area:'Nundah',addr:'Sam’s Badminton Arena, Nundah QLD',lat:-27.401,lng:153.059,courts:6,
  note:['North side.','北区。']}];

const court=id=>COURTS.find(c=>c.id===id);
const onMap=c=>c.lng>=MAPBOX.lng0&&c.lng<=MAPBOX.lng1&&c.lat<=MAPBOX.lat0&&c.lat>=MAPBOX.lat1;
const dirUrl=c=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(c.addr);
// Distance from a campus (km, straight line) when the renter has picked one on the Rooms page.
const courtKm=c=>{const cp=hf.c&&campus(hf.c);return cp?kmBetween(c,cp):null};

function courtCard(c,full){const km=courtKm(c);
 return `<div class="court" id="ct-${c.id}"><div class="ct-h"><span class="shut" aria-hidden="true">${shuttle()}</span><span><b>${esc(c.name)}</b><i>${ico('pin')} ${esc(c.area)}${c.courts?' · '+c.courts+' '+t('courts','片场'):''}${km!=null?' · '+km.toFixed(1)+' km '+t('from','距')+' '+esc(CAMPUS_SHORT[hf.c]||''):''}${onMap(c)?'':' · '+t('off the map','地图外')}</i></span></div>
 ${c.price?`<div class="ct-p">${t(c.price[0],c.price[1])}</div>`:''}${c.note?`<p>${t(c.note[0],c.note[1])}</p>`:''}${full?`<div class="meta">${esc(c.addr)}</div>`:''}
 <div class="ct-a"><button class="mini-btn hot" data-a="courtsq" data-v="${c.id}">🏸 ${t('Start a squad here','在这里开一局')}</button>${c.tel?`<a class="mini-btn" href="tel:${c.tel.replace(/\s/g,'')}">${ico('phone')} ${c.tel}</a>`:''}${c.url?`<a class="mini-btn" href="${c.url}" target="_blank" rel="noopener">${t('Book on their site','去官网订场')} ↗</a>`:''}<a class="mini-btn" href="${dirUrl(c)}" target="_blank" rel="noopener">${t('Directions','路线')} ↗</a></div></div>`}

function courtsHtml(){return `<div class="sec row2"><span>🏸 ${t('Badminton courts','羽毛球场')}</span><span class="cnt">${COURTS.length}</span></div>
 <div class="map courts-map">${mapSvg({courts:true})}</div>
 <div class="note">${t('Pins show the suburb, not the door. Tap a pin for details.','图钉只标到区，不是门口；点图钉看详情。')}</div>
 ${COURTS.map(c=>courtCard(c)).join('')}
 <div class="note">${t('Checked against each venue’s own page on','已于')} ${t(COURTS_CHECKED[0],COURTS_CHECKED[1])}${t('. No venue publishes live availability that Loka can read, so book on their site. Know a hall we missed? Tell us in Ask.',' 对照各场馆官网核对。没有场馆公开 Loka 能读取的实时空场资料，请在场馆自己的网站订场。知道我们漏了哪家？在“问问”告诉我们。')}</div>`}

function courtSheet(id){const c=court(id);if(!c)return;openSheet(courtCard(c,true))}

// Little shuttlecock drawing, used on cards, map pins and the flying one on the Squads page.
function shuttle(){return `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 3l3 9h2l3-9" fill="#fff" stroke="#191512" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 3l1.6 9M14 3l-1.6 9M12 3v9" stroke="#191512" stroke-width=".8"/><path d="M8.6 6.5h6.8" stroke="#E2683C" stroke-width="1.2"/><circle cx="12" cy="15.5" r="3.6" fill="#E2683C" stroke="#191512" stroke-width="1.3"/></svg>`}
