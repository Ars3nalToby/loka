// Loka · map.js: the drawn Brisbane map on Home. Classic script, loaded after suburbs.js and ui.js.
// Positions come from SUBURB_DATA (approximate centres). Not a street map: it shows which side of
// town things are on, the river, the M1, and the five campuses, so people can orient fast.
const MAPBOX={lng0:152.955,lng1:153.145,lat0:-27.432,lat1:-27.655,w:400};
MAPBOX.h=Math.round(MAPBOX.w*((MAPBOX.lat0-MAPBOX.lat1)*111.2)/((MAPBOX.lng1-MAPBOX.lng0)*98.7));
const mx=lng=>+((lng-MAPBOX.lng0)/(MAPBOX.lng1-MAPBOX.lng0)*MAPBOX.w).toFixed(1);
const my=lat=>+((MAPBOX.lat0-lat)/(MAPBOX.lat0-MAPBOX.lat1)*MAPBOX.h).toFixed(1);
const ZCOL={inner:{tint:'#F4D3C2',ink:'#B84C26'},west:{tint:'#D4E5D1',ink:'#3F7A52'},innersouth:{tint:'#F1E1B5',ink:'#8A6A14'},south:{tint:'#C9E2D8',ink:'#1F6F5C'}};
// Brisbane River, upstream (Indooroopilly) to the mouth side (Hamilton). Approximate.
const RIVER=[[-27.506,152.952],[-27.511,152.972],[-27.522,152.988],[-27.524,153.002],[-27.516,153.014],[-27.503,153.019],[-27.493,153.010],[-27.484,153.002],[-27.474,153.007],[-27.472,153.018],[-27.479,153.027],[-27.474,153.034],[-27.463,153.037],[-27.462,153.045],[-27.474,153.052],[-27.466,153.060],[-27.452,153.058],[-27.440,153.066],[-27.430,153.085]];
// Pacific Motorway (M1), Woolloongabba to Rochedale South. Approximate.
const M1=[[-27.488,153.036],[-27.506,153.049],[-27.524,153.062],[-27.545,153.078],[-27.565,153.089],[-27.580,153.099],[-27.600,153.120],[-27.618,153.140]];
function smoothPath(pts){const p=pts.map(([la,ln])=>[mx(ln),my(la)]);let d=`M${p[0][0]} ${p[0][1]}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
  d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0]} ${c[1]}`}return d}
function hull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
 for(const q of p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
 for(const q of p.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
 return lo.slice(0,-1).concat(up.slice(0,-1))}
function mapCounts(){const c={};for(const h of S.homes)c[h.area]=(c[h.area]||0)+1;return c}
function mapSvg(){const W=MAPBOX.w,H=MAPBOX.h,cnt=mapCounts(),subs=SUBURB_DATA.suburbs;
 const zones=Object.keys(ZCOL);
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('Map of Brisbane inner city and south side with rooms','布里斯班市中心和南区房源地图')}">
 <defs><pattern id="mdots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="#191512" opacity=".07"/></pattern>
 </defs>
 <rect width="${W}" height="${H}" fill="#F8F4EB"/><rect width="${W}" height="${H}" fill="url(#mdots)"/>`;
 // Zone regions: the convex hull of each zone's suburbs, drawn with a fat round stroke so it reads as a soft shape.
 s+=zones.map(z=>{const pts=hull(subs.filter(x=>x.zone===z).map(x=>[mx(x.lng),my(x.lat)]));const d='M'+pts.map(p=>p.join(' ')).join('L')+'Z';
  return `<path d="${d}" fill="${ZCOL[z].tint}" stroke="${ZCOL[z].tint}" stroke-width="34" stroke-linejoin="round" opacity=".9"/><path d="${d}" fill="none" stroke="${ZCOL[z].ink}" stroke-width="34" stroke-linejoin="round" opacity=".06"/>`}).join('');
 // River and M1
 const rv=smoothPath(RIVER);
 s+=`<path d="${rv}" fill="none" stroke="#BCD9E6" stroke-width="13" stroke-linecap="round"/><path d="${rv}" fill="none" stroke="#E4F1F6" stroke-width="5" stroke-linecap="round"/>`;
 const m1=smoothPath(M1);
 s+=`<path d="${m1}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="${m1}" fill="none" stroke="#C9BFAD" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 5"/>`;
 const m1l=M1[4];s+=`<g transform="translate(${mx(m1l[1])+10},${my(m1l[0])})"><rect x="-1" y="-8" width="22" height="13" rx="3" fill="#1F6F5C"/><text x="10" y="2" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">M1</text></g>`;
 s+=`<text x="${mx(152.962)}" y="${my(-27.527)}" font-size="10" font-weight="800" fill="#7FA7B8" font-style="italic">${t('Brisbane River','布里斯班河')}</text>`;
 // Zone labels at each zone's centre
 s+=zones.map(z=>{const xs=subs.filter(x=>x.zone===z);const cx=xs.reduce((a,b)=>a+mx(b.lng),0)/xs.length,cy=xs.reduce((a,b)=>a+my(b.lat),0)/xs.length;
  const off={inner:[10,-52],west:[-10,46],innersouth:[40,10],south:[-62,96]}[z];
  const ax=z==='south'?mx(153.093):cx+off[0],ay=z==='south'?my(-27.634):cy+off[1];
  return `<text x="${ax.toFixed(0)}" y="${ay.toFixed(0)}" text-anchor="middle" font-size="10.5" font-weight="900" letter-spacing="1.6" fill="${ZCOL[z].ink}" opacity=".9">${esc(t(ZN[z][0],ZN[z][1])).toUpperCase()}</text>`}).join('');
 // Every covered suburb as a small dot
 s+=subs.filter(x=>!cnt[x.name]).map(x=>`<g class="pin" data-a="pin" data-v="${esc(x.name)}"><circle cx="${mx(x.lng)}" cy="${my(x.lat)}" r="9" fill="transparent"/><circle cx="${mx(x.lng)}" cy="${my(x.lat)}" r="2.6" fill="${ZCOL[x.zone].ink}" opacity=".45"/></g>`).join('');
 // Campuses: black squares. Only the three main campuses get a label, to keep the city area readable.
 s+=SUBURB_DATA.campuses.map(c=>{const x=mx(c.lng),y=my(c.lat),lab={'uq':['UQ',1],'qut-gp':['QUT',1],'gu-nathan':['Griffith',1]}[c.id];
  return `<g><rect x="${x-6}" y="${y-6}" width="12" height="12" rx="3.5" fill="#191512"/><path d="M${x-4} ${y-.8}l4-2.1 4 2.1-4 2.1z" fill="#F4F0E7"/>${lab?`<text x="${lab[1]>0?x+9:x-9}" y="${y+3.5}" text-anchor="${lab[1]>0?'start':'end'}" font-size="9.5" font-weight="900" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3">${lab[0]}</text>`:''}</g>`}).join('');
 // CBD marker
 s+=`<g transform="translate(${mx(153.025)},${my(-27.468)})"><circle r="4" fill="#191512"/><text x="-8" y="-7" text-anchor="end" font-size="9.5" font-weight="900" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3">CBD</text></g>`;
 // Suburbs with rooms: count bubble + name
 s+=subs.filter(x=>cnt[x.name]).map(x=>{const X=mx(x.lng),Y=my(x.lat),c=ZCOL[x.zone].ink,lab=x.name,right=x.zone==='west'?false:X<W-90;
  return `<g class="pin" data-a="pin" data-v="${esc(x.name)}"><circle cx="${X}" cy="${Y}" r="22" fill="transparent"/>
  <circle cx="${X}" cy="${Y+2}" r="12" fill="#191512" opacity=".15"/><circle cx="${X}" cy="${Y}" r="12" fill="${c}" stroke="#fff" stroke-width="2.5"/>
  <text x="${X}" y="${Y+4}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fff">${cnt[x.name]}</text>
  <text x="${right?X+16:X-16}" y="${Y+4}" text-anchor="${right?'start':'end'}" font-size="11" font-weight="800" fill="#191512" paint-order="stroke" stroke="#F8F4EB" stroke-width="3.5">${esc(lab)}</text></g>`}).join('');
 // Compass + scale
 s+=`<g transform="translate(${W-24},${H-26})"><circle r="13" fill="#fff" stroke="#E4DCCB"/><path d="M0-8 3.6 3 0 .8-3.6 3z" fill="#E2683C"/><text y="-16" text-anchor="middle" font-size="8.5" font-weight="900" fill="#6B645A">N</text></g>`;
 const km=(5/((MAPBOX.lng1-MAPBOX.lng0)*98.7))*W;
 s+=`<g transform="translate(14,${H-16})"><path d="M0 0h${km.toFixed(0)}" stroke="#6B645A" stroke-width="2"/><path d="M0-3v6M${km.toFixed(0)}-3v6" stroke="#6B645A" stroke-width="1.5"/><text x="${(km/2).toFixed(0)}" y="-6" text-anchor="middle" font-size="8.5" font-weight="800" fill="#6B645A">5 km</text></g>`;
 return s+'</svg>'}
// Legend under the map: one tappable chip per zone with its room count.
function mapLegend(){const cnt={};for(const h of S.homes){const z=zone(h.area);cnt[z]=(cnt[z]||0)+1}
 return `<div class="mleg">${Object.keys(ZN).map(z=>`<button class="mz" data-a="mz" data-v="${z}"><i style="background:${ZCOL[z].ink}"></i><span>${t(ZN[z][0],ZN[z][1])}</span><b>${cnt[z]||0}</b></button>`).join('')}</div>`}
