// Loka · art.js: the illustrated room "photos" shown until real listing photos exist (task O4).
// Classic script. Loaded after js/ui.js. Exports art(listing) -> SVG string, viewBox 400x150.
//
// Each listing gets a stable, different scene from its id: wall colour, furniture layout,
// time of day, and a window view that matches its side of town (city towers for the inner
// city, river and trees for the UQ side, Queenslander roofs and jacaranda for the south).
// All shapes are hand-placed; no images, no external files.

const ART_PAL=[
 // wall, wall-shade, floor, floor-line, textile, textile-2, wood, accent
 ['#E6DCC8','#D6CAB2','#C9A882','#B59470','#2F6B5A','#F1E6D2','#8A6446','#E2683C'], // oat + forest
 ['#EBD7CB','#DDC2B3','#B99B80','#A4876D','#C4593A','#F4E9DD','#7A5A40','#1F6F5C'], // blush + terracotta
 ['#D9E2D6','#C6D1C2','#C7AE8E','#B09878','#3E5C76','#F2EEE3','#8C6B4C','#C99A2B'], // sage + navy
 ['#F0E3BF','#E1D0A6','#BFA27C','#A98D69','#7C4F86','#FBF4E2','#80603F','#2F6B5A'], // butter + plum
 ['#DCE3EA','#C8D1DA','#C2A98A','#AC9474','#B4483A','#F3EFE8','#6E5440','#C99A2B']  // mist + brick
];
const ART_SKY={day:['#BFDCEB','#EAF2EE'],dusk:['#F2B58C','#F7DFC3'],night:['#1E2A4A','#3B4A72']};

function artHash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}

// Window view, drawn inside a clip of (x,y,w,h). side: inner | west | south | other.
function artView(x,y,w,h,side,time,r,u){
 const g=y+h, dark=time==='night', fog=time==='dusk'?'#E9C2A6':time==='night'?'#2C3A5E':'#D7E6E4';
 let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky${u})"/>`;
 if(time==='night')s+=`<circle cx="${x+w*.78}" cy="${y+h*.22}" r="4.5" fill="#F6EBC8"/><circle cx="${x+w*.2}" cy="${y+h*.15}" r=".9" fill="#fff" opacity=".8"/><circle cx="${x+w*.45}" cy="${y+h*.28}" r=".8" fill="#fff" opacity=".6"/>`;
 else s+=`<circle cx="${x+w*.74}" cy="${y+h*.3}" r="${time==='dusk'?9:6}" fill="${time==='dusk'?'#FBE3B8':'#FFF6DA'}" opacity=".95"/>`;
 if(side==='inner'){ // CBD towers + Story Bridge silhouette
  const tw=[[.02,.42,.14],[.15,.22,.12],[.28,.5,.1],[.39,.12,.13],[.53,.34,.11],[.65,.28,.14],[.8,.46,.18]];
  s+=tw.map(([a,b,c],i)=>{const bx=x+w*a,by=y+h*b,bw=w*c,col=dark?['#33405F','#2A3654','#3A4768'][i%3]:['#9FB2BF','#8EA3B2','#B3C2CB'][i%3];
   let lit='';if(dark)for(let k=0;k<5;k++){const lx=bx+2+((r+i*7+k*13)%Math.max(1,Math.floor(bw-4))),ly=by+4+((r+k*11+i)%Math.max(1,Math.floor(g-by-8)));lit+=`<rect x="${lx}" y="${ly}" width="1.6" height="2" fill="#F7D98B"/>`}
   return `<rect x="${bx}" y="${by}" width="${bw}" height="${g-by}" fill="${col}"/>${lit}`}).join('');
  const by=g-h*.18;s+=`<path d="M${x} ${by} Q${x+w*.3} ${by-h*.22} ${x+w*.5} ${by} Q${x+w*.7} ${by-h*.22} ${x+w} ${by}" fill="none" stroke="${dark?'#56658A':'#6F8494'}" stroke-width="2.4"/><rect x="${x}" y="${by}" width="${w}" height="2.2" fill="${dark?'#56658A':'#6F8494'}"/>`;
 }else if(side==='west'){ // river with UQ-side trees
  s+=`<path d="M${x} ${g-h*.34} q${w*.25} ${-h*.14} ${w*.5} 0 t${w*.5} 0 V${g} H${x}z" fill="${dark?'#2E4A3E':'#8FB59A'}"/>`;
  s+=`<rect x="${x}" y="${g-h*.2}" width="${w}" height="${h*.2}" fill="${dark?'#2A3C5C':'#9CC3D6'}"/><path d="M${x+w*.1} ${g-h*.12}h${w*.22}M${x+w*.5} ${g-h*.07}h${w*.3}" stroke="#fff" stroke-width="1" opacity="${dark?.25:.7}"/>`;
  for(let i=0;i<4;i++){const tx=x+w*(.12+i*.25),ty=g-h*(.38+((r>>>i)&1)*.08);s+=`<circle cx="${tx}" cy="${ty}" r="${h*.13}" fill="${dark?'#2F5244':['#5E8F6E','#6E9E79','#4F7F60'][i%3]}"/>`}
 }else{ // south: rolling hill, Queenslander on stumps, jacaranda or palm
  s+=`<path d="M${x} ${g-h*.3} q${w*.35} ${-h*.18} ${w*.7} ${-h*.04} t${w*.3} ${h*.02} V${g} H${x}z" fill="${dark?'#2E4638':'#A9C59C'}"/>`;
  const hx=x+w*.12,hy=g-h*.42,hw=w*.42;
  s+=`<rect x="${hx}" y="${hy}" width="${hw}" height="${h*.2}" fill="${dark?'#4A4F6B':'#F4EEE2'}"/><path d="M${hx-3} ${hy}L${hx+hw/2} ${hy-h*.16}L${hx+hw+3} ${hy}z" fill="${dark?'#3B4058':'#A8B2B5'}"/>`;
  s+=`<rect x="${hx+hw*.18}" y="${hy+h*.05}" width="${hw*.18}" height="${h*.08}" fill="${dark?'#F2CF7E':'#7FA7B8'}"/><rect x="${hx+hw*.6}" y="${hy+h*.05}" width="${hw*.18}" height="${h*.08}" fill="${dark?'#F2CF7E':'#7FA7B8'}"/>`;
  s+=`<path d="M${hx+3} ${hy+h*.2}v${h*.12}M${hx+hw-3} ${hy+h*.2}v${h*.12}M${hx+hw/2} ${hy+h*.2}v${h*.12}" stroke="${dark?'#3B4058':'#8D8577'}" stroke-width="1.4"/>`;
  const jx=x+w*.78,jy=g-h*.5;
  if(r%2){s+=`<path d="M${jx} ${g}V${jy+h*.12}" stroke="#6B5444" stroke-width="2.2"/>`+[[0,0,.15],[-.09,.05,.11],[.09,.06,.12],[-.03,-.08,.1],[.05,-.06,.09]].map(([a,b,c],i)=>`<circle cx="${jx+w*a}" cy="${jy+h*b}" r="${h*c}" fill="${dark?'#4C3F6E':['#9C80CC','#B39BDA','#8B6FBF'][i%3]}"/>`).join('')}
  else{s+=`<path d="M${jx} ${g}q${-w*.02} ${-h*.3} ${w*.03} ${-h*.55}" stroke="#7A6450" stroke-width="2.2" fill="none"/>`+[-60,-25,10,40,75,-95].map(d=>`<path d="M${jx+w*.03} ${g-h*.55}q${Math.cos(d*Math.PI/180)*h*.12} ${-h*.08} ${Math.cos(d*Math.PI/180)*h*.26} ${Math.sin((d+90)*Math.PI/180)*h*.06+h*.04}" stroke="${dark?'#2F5244':'#4F8A5E'}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join('')}
 }
 return s+`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fog}" opacity=".12"/>`;
}

function art(x){
 const r=artHash(x.id), P=ART_PAL[r%ART_PAL.length], [wall,shade,floor,fline,tex,tex2,wood,acc]=P;
 const time=['day','day','dusk','night'][(r>>>3)%4], dark=time==='night', u=String(x.id).replace(/\W/g,'')+(r%997);
 const side=(typeof zone==='function'?zone(x.area):'other'), flip=(r>>>5)%2===1;
 const type=x.type||'room';
 // Room shell: back wall 80..320 x 0..104, side walls and floor in one-point perspective.
 let s=`<defs>
  <linearGradient id="sky${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ART_SKY[time][0]}"/><stop offset="1" stop-color="${ART_SKY[time][1]}"/></linearGradient>
  <linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fline}"/><stop offset="1" stop-color="${floor}"/></linearGradient>
  <radialGradient id="glow${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A3" stop-opacity="${dark?.85:.45}"/><stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig${u}" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#191512" stop-opacity="0"/><stop offset="1" stop-color="#191512" stop-opacity=".22"/></radialGradient>
  <clipPath id="win${u}"><rect x="0" y="0" width="1" height="1"/></clipPath>
 </defs>
 <rect width="400" height="150" fill="${wall}"/>
 <path d="M0 0H80V104L0 150z" fill="${shade}"/><path d="M400 0H320V104L400 150z" fill="${shade}"/>
 <path d="M0 150L80 104H320L400 150z" fill="url(#fl${u})"/>`;
 for(let i=-6;i<=6;i++){const bx=200+i*44,tx=200+i*44*.55;s+=`<path d="M${tx} 104L${bx} 150" stroke="${fline}" stroke-width=".7" opacity=".55"/>`}
 s+=`<path d="M80 104H320" stroke="${shade}" stroke-width="2"/><path d="M80 0V104M320 0V104" stroke="#191512" stroke-opacity=".06"/>`;
 // Window (wide sliding door for a whole place, tall for a studio, classic for a room)
 const W=type==='unit'?{x:96,y:14,w:150,h:84}:type==='student'?{x:104,y:8,w:70,h:92}:{x:100,y:16,w:96,h:66};
 if(flip)W.x=400-W.x-W.w;
 s=s.replace(`<rect x="0" y="0" width="1" height="1"/>`,`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="2"/>`);
 s+=`<g clip-path="url(#win${u})">${artView(W.x,W.y,W.w,W.h,side,time,r,u)}</g>`;
 s+=`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="2" fill="none" stroke="#FBF8F1" stroke-width="4"/>`;
 s+=type==='unit'?`<path d="M${W.x+W.w/2} ${W.y}V${W.y+W.h}" stroke="#FBF8F1" stroke-width="3"/>`:`<path d="M${W.x+W.w/2} ${W.y}V${W.y+W.h}M${W.x} ${W.y+W.h*.42}H${W.x+W.w}" stroke="#FBF8F1" stroke-width="2.4"/>`;
 if(type!=='unit')s+=`<rect x="${W.x-5}" y="${W.y+W.h+1}" width="${W.w+10}" height="4" rx="1" fill="#FBF8F1"/>`;
 // Sheer curtain on one side
 const cx=flip?W.x+W.w-4:W.x-10;s+=`<path d="M${cx} ${W.y-6}h14v${W.h+12}q-7 3-14 0z" fill="${tex2}" opacity=".85"/><path d="M${cx+4} ${W.y-4}v${W.h+8}M${cx+9} ${W.y-4}v${W.h+8}" stroke="${shade}" stroke-width=".8" opacity=".7"/>`;
 // Light pooling from the window onto the floor
 if(!dark)s+=`<path d="M${W.x} ${W.y+W.h}H${W.x+W.w}L${W.x+W.w*1.25+(flip?-60:30)} 150H${W.x-W.w*.2+(flip?-60:30)}z" fill="#FFF8E6" opacity="${time==='dusk'?.16:.22}"/>`;
 // Rug
 s+=`<path d="M128 120H282L300 140H108z" fill="${acc}" opacity=".22"/><path d="M134 123H276L290 137H118z" fill="none" stroke="${acc}" stroke-opacity=".35" stroke-width="1"/>`;
 // Furniture: mirrored when flip so the window and bed swap sides
 const fx=v=>flip?400-v:v, fr=(X,Y,w,h,f,rx)=>`<rect x="${flip?400-X-w:X}" y="${Y}" width="${w}" height="${h}" rx="${rx||0}" fill="${f}"/>`;
 let f='';
 if(type==='unit'){ // sofa, coffee table, floor lamp, side plant
  f+=`<ellipse cx="${fx(262)}" cy="133" rx="62" ry="5" fill="#191512" opacity=".12"/>`;
  f+=fr(206,96,118,30,tex,8)+fr(200,104,14,26,tex,6)+fr(316,104,14,26,tex,6)+fr(212,110,104,14,tex2,4);
  f+=fr(222,99,22,13,acc,4)+fr(286,99,22,13,tex2,4);
  f+=fr(206,126,4,6,wood)+fr(320,126,4,6,wood);
  f+=`<ellipse cx="${fx(250)}" cy="138" rx="24" ry="4" fill="${wood}"/>`+fr(236,138,3,6,wood)+fr(262,138,3,6,wood);
  f+=`<path d="M${fx(346)} 132V58" stroke="#3A3330" stroke-width="1.6"/><path d="M${fx(336)} 58H${fx(356)}L${fx(352)} 46H${fx(340)}z" fill="${tex2}"/>`;
 }else{ // bed with headboard, pillows, duvet fold, throw; side table + lamp
  f+=`<ellipse cx="${fx(262)}" cy="134" rx="70" ry="6" fill="#191512" opacity=".12"/>`;
  f+=fr(196,72,134,46,wood,6)+fr(200,76,126,40,shade,4);
  f+=fr(196,98,134,30,'#FBF8F1',6)+fr(204,90,38,16,'#FFFFFF',7)+fr(246,90,38,16,tex2,7);
  f+=fr(196,106,134,24,tex,5)+fr(196,106,134,5,tex2,2)+fr(300,104,30,26,acc,4);
  f+=fr(198,128,5,8,wood)+fr(323,128,5,8,wood);
  f+=fr(338,104,26,24,wood,3)+fr(340,112,22,1.5,shade);
  f+=`<path d="M${fx(351)} 104V90" stroke="#3A3330" stroke-width="1.4"/><path d="M${fx(342)} 90H${fx(360)}L${fx(356)} 79H${fx(346)}z" fill="${tex2}"/>`;
 }
 if(type==='student'){ // desk, chair, shelf with books
  const dx=flip?400-60-64:60;
  f+=`<rect x="${dx}" y="96" width="64" height="5" rx="1" fill="${wood}"/><rect x="${dx+3}" y="101" width="3" height="30" fill="${wood}"/><rect x="${dx+58}" y="101" width="3" height="30" fill="${wood}"/>`;
  f+=`<rect x="${dx+16}" y="86" width="26" height="10" rx="1.5" fill="#3A3330"/><rect x="${dx+18}" y="88" width="22" height="7" fill="${dark?'#9EC1E0':'#CFE1EC'}"/>`;
  f+=`<rect x="${dx+20}" y="106" width="22" height="4" rx="2" fill="${acc}"/><path d="M${dx+24} 110v20M${dx+38} 110v20M${dx+40} 106V90" stroke="#3A3330" stroke-width="1.6"/>`;
  const sx=flip?400-214-56:214;f+=`<rect x="${sx}" y="30" width="56" height="3" fill="${wood}"/>`+[0,6,11,18,24,31].map((o,i)=>`<rect x="${sx+4+o}" y="${18+(i%3)}" width="5" height="${12-(i%3)}" fill="${[tex,acc,tex2,'#C99A2B',tex,acc][i]}"/>`).join('');
 }else{ // framed print above the bed or sofa
  const ax=flip?400-238-44:238;f+=`<rect x="${ax}" y="26" width="44" height="32" fill="#FBF8F1" stroke="${wood}" stroke-width="2"/><circle cx="${ax+16}" cy="40" r="7" fill="${acc}" opacity=".85"/><path d="M${ax+6} 52q12-12 32-2" stroke="${tex}" stroke-width="3" fill="none"/>`;
 }
 // Plant in a terracotta pot
 const px=flip?400-38:38;
 f+=`<path d="M${px-9} 120h18l-3 16h-12z" fill="#C46A45"/>`+[[-14,-26,-30],[12,-28,30],[-3,-38,-5],[-18,-12,-55],[16,-14,55]].map(([a,b,rot])=>`<ellipse cx="${px+a}" cy="${120+b*.7}" rx="8" ry="13" transform="rotate(${rot} ${px+a} ${120+b*.7})" fill="${dark?'#2E5240':['#4F8A5E','#3F7A52','#5E9A6B'][(a+40)%3]}"/>`).join('');
 // Pendant light
 const lx=fx(type==='unit'?300:type==='student'?192:216);
 f+=`<path d="M${lx} 0V20" stroke="#3A3330" stroke-width="1"/><path d="M${lx-9} 30a9 9 0 0 1 18 0z" fill="${acc}"/><ellipse cx="${lx}" cy="31" rx="5" ry="1.6" fill="#FFF3CF"/>`;
 s+=f;
 if(dark)s+=`<rect width="400" height="150" fill="#1B2140" opacity=".3"/>`;
 if(dark||time==='dusk')s+=`<circle cx="${lx}" cy="44" r="${dark?58:40}" fill="url(#glow${u})"/><circle cx="${fx(type==='unit'?346:351)}" cy="${type==='unit'?52:86}" r="${dark?40:26}" fill="url(#glow${u})"/>`;
 s+=`<rect width="400" height="150" fill="url(#vig${u})"/>`;
 return `<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}
