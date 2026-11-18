// Loka · map.js: the drawn Brisbane map. Classic script, loaded after suburbs.js and ui.js.
// Positions come from SUBURB_DATA (approximate centres). Not a street map: it shows which side of
// town things are on, the river, the M1 and the campuses, so people can orient fast.
//
// mapSvg()             Home map: count bubbles per suburb.
// mapSvg({rooms:true}) Rooms map: one price pin per listing, zooms to the chosen zone (hf.z),
//                      draws 2 km / 5 km rings round the chosen campus (hf.c), highlights mapSel.
const MAPBOX={lng0:152.955,lng1:153.145,lat0:-27.432,lat1:-27.655,w:400};
MAPBOX.h=Math.round(MAPBOX.w*((MAPBOX.lat0-MAPBOX.lat1)*111.2)/((MAPBOX.lng1-MAPBOX.lng0)*98.7));
const PXKM=MAPBOX.w/((MAPBOX.lng1-MAPBOX.lng0)*98.7);
const mx=lng=>+((lng-MAPBOX.lng0)/(MAPBOX.lng1-MAPBOX.lng0)*MAPBOX.w).toFixed(1);
const my=lat=>+((MAPBOX.lat0-lat)/(MAPBOX.lat0-MAPBOX.lat1)*MAPBOX.h).toFixed(1);
const ZCOL={inner:{tint:'#F4D3C2',ink:'#B84C26'},west:{tint:'#D4E5D1',ink:'#3F7A52'},innersouth:{tint:'#F1E1B5',ink:'#8A6A14'},south:{tint:'#C9E2D8',ink:'#1F6F5C'}};
const CAMPUS_SHORT={'uq':'UQ','qut-gp':'QUT','qut-kg':'QUT KG','gu-nathan':'Griffith','gu-sb':'Griffith SB'};
const RIVER=[[-27.506,152.952],[-27.511,152.972],[-27.522,152.988],[-27.524,153.002],[-27.516,153.014],[-27.503,153.019],[-27.493,153.010],[-27.484,153.002],[-27.474,153.007],[-27.472,153.018],[-27.479,153.027],[-27.474,153.034],[-27.463,153.037],[-27.462,153.045],[-27.474,153.052],[-27.466,153.060],[-27.452,153.058],[-27.440,153.066],[-27.430,153.085]];
const M1=[[-27.488,153.036],[-27.506,153.049],[-27.524,153.062],[-27.545,153.078],[-27.565,153.089],[-27.580,153.099],[-27.600,153.120],[-27.618,153.140]];
let mapSel='';
function smoothPath(pts){const p=pts.map(([la,ln])=>[mx(ln),my(la)]);let d=`M${p[0][0]} ${p[0][1]}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
  d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0]} ${c[1]}`}return d}
function hull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
 for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
 for(const q of p.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
 return lo.slice(0,-1).concat(up.slice(0,-1))}
// Straight-line distance in km (haversine). Shown to users as "≈ x km", never as travel time.
function kmBetween(a,b){const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lng-a.lng)*r;
 const h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
const campus=id=>SUBURB_DATA.campuses.find(c=>c.id===id);
function homeKm(h,cid){const s=SUB(h.area),c=campus(cid);return s&&c?kmBetween(s,c):null}
// Where each listing's pin sits: its suburb centre, fanned out when a suburb has several rooms.
function pinPos(list){const by={},out={};for(const h of list)(by[h.area]=by[h.area]||[]).push(h);
 for(const [a,hs] of Object.entries(by)){const s=SUB(a);if(!s)continue;const X=mx(s.lng),Y=my(s.lat);
  hs.forEach((h,i)=>{const ang=i*2.4,r=hs.length>1?9+i*3:0;out[h.id]=[X+Math.cos(ang)*r,Y+Math.sin(ang)*r]})}return out}

function mapSvg(o){o=o||{};const W=MAPBOX.w,H=MAPBOX.h,subs=SUBURB_DATA.suburbs,zones=Object.keys(ZCOL);
 // View box: whole map, or zoomed to the chosen zone at the same shape as the frame.
 let vb=[0,0,W,H];
 if(o.rooms&&hf.z){const zs=subs.filter(x=>x.zone===hf.z);let x0=Math.min(...zs.map(x=>mx(x.lng)))-34,x1=Math.max(...zs.map(x=>mx(x.lng)))+34,y0=Math.min(...zs.map(x=>my(x.lat)))-34,y1=Math.max(...zs.map(x=>my(x.lat)))+34;
  const asp=W/H;let w=x1-x0,h=y1-y0;if(w/h<asp){const nw=h*asp;x0-=(nw-w)/2;w=nw}else{const nh=w/asp;y0-=(nh-h)/2;h=nh}vb=[x0,y0,w,h]}
 const k=vb[2]/W,fz=n=>(n*k).toFixed(1),zoomed=!!(o.rooms&&hf.z);
 let s=`<svg class="${o.still?'still':''}" viewBox="${vb.map(v=>v.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${t('Map of Brisbane inner city and south side with rooms','布里斯班市中心和南区房源地图')}">
 <defs><pattern id="mdots${o.rooms?'r':''}" width="${fz(14)}" height="${fz(14)}" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="${fz(.9)}" fill="#191512" opacity=".07"/></pattern></defs>
 <rect x="-200" y="-200" width="${W+400}" height="${H+400}" fill="#F8F4EB"/><rect x="-200" y="-200" width="${W+400}" height="${H+400}" fill="url(#mdots${o.rooms?'r':''})"/>`;
 // Zones: convex hull of each zone's suburbs, fat round stroke = soft shape. Others fade when one is chosen.
 s+=zones.map(z=>{const pts=hull(subs.filter(x=>x.zone===z).map(x=>[mx(x.lng),my(x.lat)]));const d='M'+pts.map(p=>p.join(' ')).join('L')+'Z';const dim=zoomed&&hf.z!==z;
  return `<g opacity="${dim?.35:1}"><path d="${d}" fill="${ZCOL[z].tint}" stroke="${ZCOL[z].tint}" stroke-width="34" stroke-linejoin="round" opacity=".9"/><path d="${d}" fill="none" stroke="${ZCOL[z].ink}" stroke-width="34" stroke-linejoin="round" opacity=".06"/></g>`}).join('');
 // Campus rings, 2 km and 5 km, straight line
 if(o.rooms&&hf.c&&campus(hf.c)){const c=campus(hf.c),X=mx(c.lng),Y=my(c.lat);
  s+=[5,2].map(km=>`<circle cx="${X}" cy="${Y}" r="${(km*PXKM).toFixed(1)}" fill="${km===2?'rgba(31,111,92,.08)':'none'}" stroke="#1F6F5C" stroke-width="${fz(1.4)}" stroke-dasharray="${fz(4)} ${fz(4)}"/><text x="${X}" y="${(Y-km*PXKM-4*k).toFixed(1)}" text-anchor="middle" font-size="${fz(9)}" font-weight="900" fill="#1F6F5C" paint-order="stroke" stroke="#F8F4EB" stroke-width="${fz(3)}">${km} km</text>`).join('')}
 // River + M1
 const rv=smoothPath(RIVER),m1=smoothPath(M1);
 const rid='rvp'+(o.rooms?'r':o.courts?'c':'h');s+=`<g class="river"><path id="${rid}" d="${rv}" pathLength="1" fill="none" stroke="#BCD9E6" stroke-width="13" stroke-linecap="round"/><path d="${rv}" pathLength="1" fill="none" stroke="#E4F1F6" stroke-width="5" stroke-linecap="round"/></g>`+mapBoat(rid);
 s+=`<path d="${m1}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="${m1}" fill="none" stroke="#C9BFAD" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 5"/>`;
 const ml=M1[4];s+=`<g transform="translate(${mx(ml[1])+10*k},${my(ml[0])}) scale(${k})"><rect x="-1" y="-8" width="22" height="13" rx="3" fill="#1F6F5C"/><text x="10" y="2" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">M1</text></g>`;
 if(!zoomed)s+=`<text x="${mx(152.962)}" y="${my(-27.527)}" font-size="10" font-weight="800" fill="#7FA7B8" font-style="italic">${t('Brisbane River','布里斯班河')}</text>`;
 if(!zoomed)s+=zones.map(z=>{const xs=subs.filter(x=>x.zone===z);const cx=xs.reduce((a,b)=>a+mx(b.lng),0)/xs.length,cy=xs.reduce((a,b)=>a+my(b.lat),0)/xs.length;
  const off={inner:[10,-52],west:[-10,46],innersouth:[40,10],south:[-62,96]}[z];const ax=z==='south'?mx(153.093):cx+off[0],ay=z==='south'?my(-27.634):cy+off[1];
  return `<text x="${ax.toFixed(0)}" y="${ay.toFixed(0)}" text-anchor="middle" font-size="10.5" font-weight="900" letter-spacing="1.6" fill="${ZCOL[z].ink}" opacity=".9">${esc(t(ZN[z][0],ZN[z][1])).toUpperCase()}</text>`}).join('');
 const cnt={};for(const h of S.homes)cnt[h.area]=(cnt[h.area]||0)+1;
 // Suburb dots, with names when zoomed into a zone
 s+=subs.filter(x=>o.rooms||o.courts||!cnt[x.name]).map(x=>{const X=mx(x.lng),Y=my(x.lat),dim=zoomed&&x.zone!==hf.z;
  return `<g class="pin" data-a="${o.rooms?'msub':'pin'}" data-v="${esc(x.name)}" opacity="${dim?.4:1}"><circle cx="${X}" cy="${Y}" r="${fz(9)}" fill="transparent"/><circle cx="${X}" cy="${Y}" r="${fz(2.6)}" fill="${ZCOL[x.zone].ink}" opacity=".45"/>${zoomed&&!dim?`<text x="${X}" y="${(Y+12*k).toFixed(1)}" text-anchor="middle" font-size="${fz(8.5)}" font-weight="800" fill="#6B645A" paint-order="stroke" stroke="#F8F4EB" stroke-width="${fz(2.5)}">${esc(x.name)}</text>`:''}</g>`}).join('');
 // Campuses
 s+=SUBURB_DATA.campuses.map(c=>{const x=mx(c.lng),y=my(c.lat),on=o.rooms&&hf.c===c.id;
  const lab=on?CAMPUS_SHORT[c.id]:zoomed?'':{'uq':'UQ','qut-gp':'QUT','gu-nathan':'Griffith'}[c.id];
  return `<g transform="translate(${x},${y}) scale(${(k*(on?1.35:1)).toFixed(3)})"><rect x="-6" y="-6" width="12" height="12" rx="3.5" fill="${on?'#1F6F5C':'#191512'}"/><path d="M-4 -.8l4-2.1 4 2.1-4 2.1z" fill="#F4F0E7"/>${lab?`<text x="9" y="3.5" font-size="9.5" font-weight="900" fill="${on?'#1F6F5C':'#191512'}" paint-order="stroke" stroke="#F8F4EB" stroke-width="3">${lab}</text>`:''}</g>`}).join('');
 s+=`<g transform="translate(${mx(153.025)},${my(-27.468)}) scale(${k})"><circle r="4" fill="#191512"/><text x="-8" y="-7" text-anchor="end" font-size="9.5" font-weight="900" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3">CBD</text></g>`;
 if(o.rooms){ // One price pin per listing: verified = green with a gold dot, others ink, selected = coral on top.
  const list=filtHomes(),pos=pinPos(list),order=list.slice().sort((a,b)=>(a.id===mapSel)-(b.id===mapSel));
  s+=order.map((h,i)=>{const p=pos[h.id];if(!p)return'';const sel=h.id===mapSel,v=checkState(h).all,lab='$'+h.rent,w=lab.length*7.4+14,fill=sel?'#E2683C':v?'#1F6F5C':'#191512';
   return `<g class="pp" data-a="mpick" data-v="${h.id}" transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) scale(${(k*(sel?1.18:1)).toFixed(3)})"><g class="drop" style="--d:${i}">${sel?'<circle class="pulse" cy="-16" r="16" fill="#E2683C"/>':''}<rect x="${-w/2}" y="-25" width="${w}" height="21" rx="10.5" fill="#191512" opacity=".18"/><rect x="${-w/2}" y="-27" width="${w}" height="21" rx="10.5" fill="${fill}" stroke="#fff" stroke-width="2"/><path d="M-5 -7.5 0 -1 5 -7.5z" fill="${fill}"/><text y="-12.5" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${lab}</text>${v&&!sel?`<circle cx="${w/2-2}" cy="-25" r="4.5" fill="#F4C766" stroke="#fff" stroke-width="1.5"/>`:''}</g></g>`}).join('');
 }else if(o.courts){ // Squads: one shuttlecock pin per badminton venue on the map
  s+=COURTS.filter(onMap).map((c,i)=>`<g class="pin bub cpin" data-a="court" data-v="${c.id}" style="--d:${i}" transform="translate(${mx(c.lng)},${my(c.lat)})"><circle r="20" fill="transparent"/><circle r="13" fill="#191512" opacity=".15" cy="2"/><circle r="13" fill="#F4F0E7" stroke="#E2683C" stroke-width="2.4"/><g transform="translate(-9 -10) scale(.75)">${shuttle()}</g><text y="26" text-anchor="middle" font-size="8.5" font-weight="900" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3">${esc(c.area)}</text></g>`).join('');
 }else{ // Home: count bubbles
  s+=subs.filter(x=>cnt[x.name]).map((x,i)=>{const X=mx(x.lng),Y=my(x.lat),c=ZCOL[x.zone].ink,right=x.zone==='west'?false:X<W-90;
   return `<g class="pin bub" data-a="pin" data-v="${esc(x.name)}" style="--d:${i}"><circle cx="${X}" cy="${Y}" r="22" fill="transparent"/><circle cx="${X}" cy="${Y+2}" r="12" fill="#191512" opacity=".15"/><circle cx="${X}" cy="${Y}" r="12" fill="${c}" stroke="#fff" stroke-width="2.5"/><text x="${X}" y="${Y+4}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fff">${cnt[x.name]}</text><text x="${right?X+16:X-16}" y="${Y+4}" text-anchor="${right?'start':'end'}" font-size="11" font-weight="800" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3.5">${esc(x.name)}</text></g>`}).join('');
 }
 // Compass + scale bar, fixed size in the corner of the current view
 const bx=vb[0]+vb[2],by=vb[1]+vb[3],sk=zoomed?2:5,L=sk*PXKM;
 s+=`<g transform="translate(${(bx-24*k).toFixed(1)},${(by-26*k).toFixed(1)}) scale(${k.toFixed(3)})"><circle r="13" fill="#fff" stroke="#E4DCCB"/><path d="M0-8 3.6 3 0 .8-3.6 3z" fill="#E2683C"/><text y="-16" text-anchor="middle" font-size="8.5" font-weight="900" fill="#6B645A">N</text></g>`;
 s+=`<g transform="translate(${(vb[0]+14*k).toFixed(1)},${(by-16*k).toFixed(1)})"><path d="M0 0h${L.toFixed(1)}" stroke="#6B645A" stroke-width="${fz(2)}"/><path d="M0 ${-3*k}v${6*k}M${L.toFixed(1)} ${-3*k}v${6*k}" stroke="#6B645A" stroke-width="${fz(1.5)}"/><text x="${(L/2).toFixed(1)}" y="${(-6*k).toFixed(1)}" text-anchor="middle" font-size="${fz(8.5)}" font-weight="800" fill="#6B645A">${sk} km</text></g>`;
 return s+'</svg>'}

// Legend under the Home map: one tappable chip per zone with its room count.
function mapLegend(){const cnt={};for(const h of S.homes){const z=zone(h.area);cnt[z]=(cnt[z]||0)+1}
 return `<div class="mleg">${Object.keys(ZN).map(z=>`<button class="mz" data-a="mz" data-v="${z}"><i style="background:${ZCOL[z].ink}"></i><span>${t(ZN[z][0],ZN[z][1])}</span><b>${cnt[z]||0}</b></button>`).join('')}</div>`}

// Preview card under the Rooms map for the tapped pin.
function mapPreview(){const list=filtHomes(),x=list.find(h=>h.id===mapSel);
 if(!x)return `<div class="mprev empty">${ico('pin')} ${list.length?t(`Tap a price to preview. ${list.length} rooms on the map.`,`点价格预览房源。地图上共有 ${list.length} 个房源。`):t('No rooms match these filters.','没有符合筛选的房源。')}</div>`;
 const km=hf.c?homeKm(x,hf.c):null;
 return `<button class="mprev" data-a="home" data-v="${x.id}"><div class="pic">${art(x)}</div><div class="mpb"><div class="mpt"><span class="price">$${x.rent}<small>/${t('wk','周')}</small></span>${checkBadge(x).replace(/<(\/?)button/g,'<$1span').replace(/ data-a="vinfo"/,'').replace('class="vf','class="vf in')}</div>
 <div class="tt">${esc(ttl(x.title))}</div><div class="meta">${ico('pin')} ${esc(x.area)}${km!=null?` · ≈ ${km.toFixed(1)} km ${t('to','到')} ${CAMPUS_SHORT[hf.c]}`:''}</div><span class="go">${t('View room','查看房源')} →</span></div></button>`}
