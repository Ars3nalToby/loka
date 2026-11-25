// Loka · flyer.js (25 Nov 2026, owner's request: "time to look for customers").
// Two things, both no database change:
//  1. Noticeboard flyers. An A4 image (1240x1754 = A4 at 150 dpi) with a big QR code and tear-off
//     strips, in English AND 中文 on the same sheet (a noticeboard has both kinds of reader).
//     Two kinds: "landlord" (QR opens the List a place form) and "renter" (QR opens 求租 Wanted).
//  2. Where people came from. Each flyer carries a place tag in its QR link (?src=sunnybank-plaza).
//     On arrival the tag is kept on this device only (first tag wins, 60 days) and removed from the
//     address bar. If that person then creates an account, the tag rides along as sign-up metadata
//     (auth.js, Supabase user_metadata `src`). Nothing else is recorded: no tracking pixels, no
//     third-party analytics. The owner reads the counts with:
//       select raw_user_meta_data->>'src' as src, count(*) from auth.users group by 1 order by 2 desc;
//     The privacy page says this in plain words.
// Classic script, loaded after scout.js and js/vendor/qrcode.js.

const SRC_KEY='loka-src';
// Tag: lowercase letters, digits and dashes only, max 24. Anything else is dropped, so a tag can
// never carry a name, phone number or script into the database.
function srcClean(s){return String(s||'').toLowerCase().trim().replace(/[\s_]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,24)}
(function srcCapture(){try{if(typeof location==='undefined'||!location.search)return;const q=new URLSearchParams(location.search);if(!q.has('src'))return;
 const s=srcClean(q.get('src'));if(s&&!srcGet())localStorage.setItem(SRC_KEY,JSON.stringify({s,at:Date.now()}));
 q.delete('src');const rest=q.toString();history.replaceState(null,'',location.pathname+(rest?'?'+rest:'')+location.hash)}catch(e){}})();
function srcGet(){try{const j=JSON.parse(localStorage.getItem(SRC_KEY)||'null');if(!j||!j.at||Date.now()-j.at>60*864e5)return'';return srcClean(j.s)}catch(e){return''}}
// Sign-up metadata for auth.js: {src} or nothing.
function srcData(){const s=srcGet();return s?{src:s}:undefined}

const FLYER_KINDS={
 landlord:{go:'list',head:['有房出租？','免费发布。'],headEn:'Room to rent? List it free.',
  pts:[['免费 · 没有中介费 · 没有佣金','Free. No agent fee, no commission.'],
       ['中文、英文都可以写','Write it in Chinese or English.'],
       ['押金按昆州规定检查','Bond and rent in advance checked against Queensland rules.'],
       ['租客直接联系你','Renters contact you directly. Loka never touches money.']],
  strip:'免费招租 · Free ad'},
 renter:{go:'wanted',head:['在布村找房？','免费发求租。'],headEn:'Looking for a room? Post what you need, free.',
  pts:[['写下预算、区域、入住日期','Say your budget, area and move-in date.'],
       ['房东看到合适的会来找你','Landlords with a match can find you.'],
       ['免费 · 不收中介费','Free. No agent fee.'],
       ['防骗：先看房，再付钱','Safety tip: see the room and get the agreement before you pay.']],
  strip:'免费求租 · Wanted'}};
function flyerUrl(kind,src){const k=FLYER_KINDS[kind]||FLYER_KINDS.landlord,s=srcClean(src)||'flyer';return `${location.origin}/?src=${s}#/go/${k.go}`}

// Wrap text to a width; returns lines.
function fwrap(c,txt,w){const out=[];let line='';const cjk=/[　-鿿＀-￯]/;
 const parts=cjk.test(txt)?Array.from(txt):txt.split(/(\s+)/);
 for(const p of parts){const tryL=line+p;if(c.measureText(tryL).width>w&&line.trim()){out.push(line.trim());line=p.trimStart()}else line=tryL}
 if(line.trim())out.push(line.trim());return out}

async function drawA4(kind,src){const K=FLYER_KINDS[kind]||FLYER_KINDS.landlord,W=1240,H=1754,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 try{await Promise.all(['130px "Bagel Fat One"','900 60px "Noto Sans SC"','900 40px Nunito','700 30px Nunito'].map(f=>document.fonts.load(f)))}catch(e){}
 const G='#1F6F5C',GS='#185a4a',INK='#191512',CR='#F4F0E7',COR='#E2683C',MUT='#6B645A';
 c.fillStyle=CR;c.fillRect(0,0,W,H);
 // Green poster band with the long-shadow wordmark (house style: long shadow on green only).
 const BH=620;c.fillStyle=G;c.fillRect(0,0,W,BH);
 c.font='150px "Bagel Fat One", "Noto Sans SC", sans-serif';c.textBaseline='alphabetic';
 for(let i=40;i>0;i--){c.fillStyle=GS;c.fillText('Loka.',80+i,215+i)}
 c.fillStyle=CR;c.fillText('Loka.',80,215);
 c.font='800 34px Nunito, "Noto Sans SC", sans-serif';c.fillStyle='rgba(244,240,231,.85)';c.fillText('布村生活站 · BRISBANE',86,272);
 c.font='900 92px "Noto Sans SC", sans-serif';c.fillStyle=CR;c.fillText(K.head[0],80,410);c.fillStyle='#F3C9A8';c.fillText(K.head[1],80,515);
 await drawIbis(c,W-370,70,300,kind==='landlord'?'房东免费！':'我帮你找！');
 c.font='800 38px Nunito, sans-serif';c.fillStyle=CR;fwrap(c,K.headEn,W-160).slice(0,1).forEach((l,i)=>c.fillText(l,82,580+i*44));
 // Points on the left, QR on the right.
 const QS=470,QX=W-80-QS,QY=BH+60;let y=BH+100;
 K.pts.forEach(p=>{c.fillStyle=COR;c.beginPath();c.arc(96,y-14,10,0,7);c.fill();
  c.font='900 38px "Noto Sans SC", sans-serif';c.fillStyle=INK;const z=fwrap(c,p[0],QX-160);z.forEach((l,i)=>c.fillText(l,124,y+i*48));y+=z.length*48;
  c.font='700 28px Nunito, sans-serif';c.fillStyle=MUT;const e=fwrap(c,p[1],QX-160);e.forEach((l,i)=>c.fillText(l,124,y+i*34));y+=e.length*34+40});
 // QR (white card, dark modules). Error correction M; the link is short enough for a large module size.
 c.fillStyle='#fff';c.strokeStyle='rgba(25,21,18,.12)';c.lineWidth=3;c.beginPath();c.roundRect?c.roundRect(QX,QY,QS,QS,28):c.rect(QX,QY,QS,QS);c.fill();c.stroke();
 try{const q=qrcode(0,'M');q.addData(flyerUrl(kind,src));q.make();const n=q.getModuleCount(),pad=Math.ceil(QS/(q.getModuleCount()+8))*4,m=Math.floor((QS-pad*2)/n),off=(QS-m*n)/2;c.fillStyle=INK;
  for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))c.fillRect(QX+off+k*m,QY+off+r*m,m,m)}catch(e){}
 c.textAlign='center';c.font='900 44px "Noto Sans SC", sans-serif';c.fillStyle=G;c.fillText('扫码 · Scan me',QX+QS/2,QY+QS+64);
 c.font='900 46px Nunito, sans-serif';c.fillStyle=INK;c.fillText('lokabne.au',QX+QS/2,QY+QS+122);c.textAlign='left';
 // Tear-off strips along the bottom.
 const SY=H-330,N=8,SW=W/N;c.strokeStyle='rgba(25,21,18,.35)';c.lineWidth=3;c.setLineDash([14,12]);
 c.beginPath();c.moveTo(0,SY);c.lineTo(W,SY);c.stroke();
 for(let i=1;i<N;i++){c.beginPath();c.moveTo(i*SW,SY);c.lineTo(i*SW,H);c.stroke()}c.setLineDash([]);
 c.font='800 18px Nunito, sans-serif';c.fillStyle=MUT;c.fillText('✂ ' ,16,SY-12);
 for(let i=0;i<N;i++){c.save();c.translate(i*SW+SW/2,H-24);c.rotate(-Math.PI/2);
  c.font='900 40px Nunito, sans-serif';c.fillStyle=G;c.fillText('lokabne.au',0,-6);
  c.font='800 24px "Noto Sans SC", Nunito, sans-serif';c.fillStyle=INK;c.fillText(K.strip,0,28);c.restore()}
 return cv}

// Bin Bin as a picture on the canvas, with a speech bubble.
function ibisImg(px){return new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);
 im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(ibis(px,'idle').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))})}
async function drawIbis(c,x,y,size,say){const im=await ibisImg(size);
 if(say){c.save();c.font='900 '+Math.round(size*.12)+'px "Noto Sans SC", Nunito, sans-serif';const tw=c.measureText(say).width,bw=tw+size*.16,bh=size*.2,bx=x-bw*.35,by=y-bh*.4;
  c.fillStyle='#F4F0E7';c.beginPath();c.roundRect?c.roundRect(bx,by,bw,bh,bh/2):c.rect(bx,by,bw,bh);c.fill();
  c.beginPath();c.moveTo(bx+bw*.55,by+bh);c.lineTo(bx+bw*.62,by+bh+size*.07);c.lineTo(bx+bw*.72,by+bh);c.fill();
  c.fillStyle='#E2683C';c.textBaseline='middle';c.fillText(say,bx+size*.08,by+bh/2+1);c.restore()}
 if(im)c.drawImage(im,x,y+size*.08,size,size)}
// Formats: A4 to print; 小红书 (RedNote) 3:4 with NO QR or link (the platform holds back notes that send
// people off-site, so the brand is written big for people to search instead); Story 9:16 with a QR.
let STORY_TEXT_Y=0; // last text baseline on a story; must stay above H-250 (tests/e2e check)
const FLYER_FMT={a4:[1240,1754],rednote:[1080,1440],story:[1080,1920]};
async function drawFlyer(kind,src,fmt){if(!FLYER_FMT[fmt]||fmt==='a4')return drawA4(kind,src);
 const K=FLYER_KINDS[kind]||FLYER_KINDS.landlord,[W,H]=FLYER_FMT[fmt],cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 try{await Promise.all(['130px "Bagel Fat One"','900 60px "Noto Sans SC"','900 40px Nunito','700 30px Nunito'].map(f=>document.fonts.load(f)))}catch(e){}
 const G='#1F6F5C',GS='#185a4a',INK='#191512',CR='#F4F0E7',COR='#E2683C',story=fmt==='story';
 const g=c.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,'#25806a');g.addColorStop(.6,G);g.addColorStop(1,GS);c.fillStyle=g;c.fillRect(0,0,W,H);
 // soft light blobs
 [[W*.85,H*.12,W*.35,'rgba(243,201,168,.16)'],[W*.1,H*.72,W*.45,'rgba(255,255,255,.06)']].forEach(b=>{const r=c.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);r.addColorStop(0,b[3]);r.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=r;c.fillRect(0,0,W,H)});
 const top=story?250:90; // Instagram keeps the top/bottom 250px for its own buttons
 c.font='130px "Bagel Fat One", "Noto Sans SC", sans-serif';c.textBaseline='alphabetic';
 for(let i=34;i>0;i--){c.fillStyle=GS;c.fillText('Loka.',70+i,top+120+i)}c.fillStyle=CR;c.fillText('Loka.',70,top+120);
 c.font='800 30px Nunito, "Noto Sans SC", sans-serif';c.fillStyle='rgba(244,240,231,.85)';c.fillText('布村生活站 · BRISBANE',76,top+170);
 await drawIbis(c,W-330,top-10,260,kind==='landlord'?'房东免费！':'我帮你找！');
 let y=top+330;c.font='900 96px "Noto Sans SC", sans-serif';c.fillStyle=CR;c.fillText(K.head[0],70,y);y+=110;c.fillStyle='#F3C9A8';c.fillText(K.head[1],70,y);
 y+=62;c.font='800 36px Nunito, sans-serif';c.fillStyle=CR;fwrap(c,K.headEn,W-140).forEach(l=>{c.fillText(l,72,y);y+=44});
 // white card with the points
 y+=26;const cardH=430,cx=56,cw=W-112;c.fillStyle=CR;c.beginPath();c.roundRect?c.roundRect(cx,y,cw,cardH,36):c.rect(cx,y,cw,cardH);c.fill();
 let py=y+70;K.pts.slice(0,3).forEach(p=>{c.fillStyle=COR;c.beginPath();c.arc(cx+46,py-14,10,0,7);c.fill();
  c.font='900 40px "Noto Sans SC", sans-serif';c.fillStyle=INK;c.fillText(fwrap(c,p[0],cw-120)[0],cx+76,py);
  c.font='700 27px Nunito, sans-serif';c.fillStyle='#6B645A';c.fillText(fwrap(c,p[1],cw-120)[0],cx+76,py+40);py+=122});
 y+=cardH+40;c.textAlign='center';
 if(story){const QS=300,QX=(W-QS)/2;c.fillStyle='#fff';c.beginPath();c.roundRect?c.roundRect(QX,y,QS,QS,26):c.rect(QX,y,QS,QS);c.fill();
  try{const q=qrcode(0,'M');q.addData(flyerUrl(kind,src));q.make();const n=q.getModuleCount(),m=Math.floor((QS-2*Math.ceil(QS/(n+8))*4)/n)||1,off=(QS-m*n)/2;c.fillStyle=INK;
   for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))c.fillRect(QX+off+k*m,y+off+r*m,m,m)}catch(e){}
  y+=QS+62;c.font='900 52px Nunito, sans-serif';c.fillStyle=CR;c.fillText('lokabne.au',W/2,y);STORY_TEXT_Y=y}
 else{c.font='900 40px "Noto Sans SC", sans-serif';c.fillStyle='#F3C9A8';c.fillText('浏览器搜索',W/2,y+20);
  c.font='900 92px Nunito, sans-serif';c.fillStyle=CR;c.fillText('lokabne.au',W/2,y+125)}
 c.textAlign='left';return cv}

let flyerFmt='a4',flyerKind='landlord',flyerBlob=null,flyerSeq=0;
function flyerSheet(kind){if(kind&&FLYER_KINDS[kind])flyerKind=kind;const tag=(document.getElementById('f_src')||{}).value;
 openSheet(`<div class="tt" style="font-size:21px">${t('Noticeboard flyer','公告栏传单')}</div>
 <div class="meta">${t('A4, English and 中文 on one sheet, with tear-off strips. Print it, ask the centre or shop first, then pin it up.','A4，中英文同一张，底部可撕。打印后先问商场或店家可不可以贴，再贴上去。')}</div>
 <div class="themes">${[['landlord',t('For landlords','给房东')],['renter',t('For renters','给租客')]].map(m=>`<button class="${flyerKind===m[0]?'on':''}" data-a="flyerkind" data-v="${m[0]}">${m[1]}</button>`).join('')}</div>
 <div class="themes">${[['a4',t('A4 print','A4 打印')],['rednote','小红书 (RedNote)'],['story',t('Story 9:16','快拍 9:16')]].map(m=>`<button class="${flyerFmt===m[0]?'on':''}" data-a="flyerfmt" data-v="${m[0]}">${m[1]}</button>`).join('')}</div>
 <label>${t('Where this flyer goes (a short tag)','这张贴在哪里（简短标签）')}</label><input id="f_src" maxlength="40" autocapitalize="off" autocomplete="off" placeholder="sunnybank-plaza" value="${esc(tag||'')}">
 <div class="note">${t('Use a different tag for each place, e.g. sunnybank-plaza, market-square, griffith-nathan. The tag goes inside the QR link, so you can see which noticeboard brings sign-ups. Letters, numbers and dashes only.','每个地点用不同标签，例如 sunnybank-plaza、market-square、griffith-nathan。标签放在二维码链接里，你就能看出哪个公告栏带来注册。只能用英文字母、数字和横线。')}</div>
 <button class="btn ghost" data-a="flyerdraw">${t('Update preview','更新预览')}</button>
 <div class="story-prev flyer-prev"><div class="sp-load">${t('Drawing the flyer…','正在生成传单…')}</div></div>
 <div class="cta"><button class="btn" data-a="flyerprint" disabled>${t('Print','打印')}</button><button class="btn ghost" data-a="flyersave" disabled>${t('Save image','保存图片')}</button></div>`);
 flyerDraw()}
function flyerDraw(){const src=srcClean((document.getElementById('f_src')||{}).value)||'flyer',seq=++flyerSeq;flyerBlob=null;
 document.querySelectorAll('[data-a="flyerprint"],[data-a="flyersave"]').forEach(b=>b.disabled=true);
 drawFlyer(flyerKind,src,flyerFmt).then(cv=>{if(seq!==flyerSeq)return;const p=document.querySelector('.flyer-prev');if(p)p.innerHTML=`<img alt="${esc(t('Flyer preview','传单预览'))}" src="${cv.toDataURL('image/png')}"><div class="meta">${flyerFmt==='rednote'?esc(t('No QR code on this one: 小红书 (RedNote) holds back posts that send people to outside links, so lokabne.au is written big for people to search.','这张没有二维码：小红书（RedNote）会限流带站外链接的笔记，所以把 lokabne.au 写大，让大家自己搜。')):esc(flyerUrl(flyerKind,src).replace(/^https?:\/\//,''))}</div>`;
  cv.toBlob(b=>{if(seq!==flyerSeq)return;flyerBlob=b;document.querySelectorAll('[data-a="flyersave"]').forEach(x=>x.disabled=false);document.querySelectorAll('[data-a="flyerprint"]').forEach(x=>{x.disabled=flyerFmt!=='a4';x.hidden=flyerFmt!=='a4'})},'image/png')})}
async function flyerSave(){if(!flyerBlob)return;const src=srcClean((document.getElementById('f_src')||{}).value)||'flyer',file=new File([flyerBlob],`loka-${flyerFmt}-${flyerKind}-${src}.png`,{type:'image/png'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});return}catch(e){if(e&&e.name==='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(flyerBlob);a.download=file.name;document.body.appendChild(a);a.click();a.remove();toast(t('Flyer saved.','传单已保存。'))}
function flyerPrint(){if(!flyerBlob)return;let box=document.getElementById('printf');if(!box){box=document.createElement('div');box.id='printf';document.body.appendChild(box)}
 const url=URL.createObjectURL(flyerBlob),img=new Image();img.alt='';img.onload=()=>{document.documentElement.classList.add('printing');
  const done=()=>{document.documentElement.classList.remove('printing');box.innerHTML='';URL.revokeObjectURL(url);removeEventListener('afterprint',done)};
  addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(()=>{if(document.documentElement.classList.contains('printing'))done()},60000)},50)};
 img.src=url;box.innerHTML='';box.appendChild(img)}
function flyerCard(){return `<div class="card scout-card"><div class="tt">${ico('pin')} ${t('Noticeboard flyer','公告栏传单')}</div>
 <div class="meta">${t('Print an A4 flyer with a QR code for landlords or renters. Each flyer gets a place tag so you can see which noticeboard works.','打印带二维码的 A4 传单，给房东或租客。每张有地点标签，看得出哪个公告栏有效。')}</div>
 <div class="cta"><button class="btn" data-a="flyer" data-v="landlord">${t('Landlord flyer','房东传单')}</button><button class="btn ghost" data-a="flyer" data-v="renter">${t('Renter flyer','租客传单')}</button></div></div>`}

// ---------- Landlord arriving from a flyer QR (#/go/list) ----------
// Sign in FIRST, then the form, so a landlord never types a whole listing and loses it at a sign-in wall.
const GOLIST_KEY='loka.golist';
function flyerLanding(){openSheet(`<div class="tt" style="font-size:22px">${t('List your room on Loka, free','在 Loka 免费发布房源')}</div>
 <div class="sub">${t('Brisbane rooms for students and locals, in English and 中文.','布里斯班房源，面向学生和本地人，中英文都可以。')}</div>
 <div class="card">${[['Free to list. No commission when someone moves in.','免费发布，有人入住也不收佣金。'],['Renters contact you directly. Loka never handles rent or bond.','租客直接联系你，Loka 不经手租金或押金。'],['Bond and rent in advance are checked against Queensland rules before it goes up.','发布前按昆州规定检查押金和预付租金。'],['Edit or take it down anytime.','随时修改或下架。']].map(r=>`<div class="rule">✓ ${t(r[0],r[1])}</div>`).join('')}</div>
 <button class="btn" data-a="golist">${flyerNeedsAuth()?t('Sign in with email to start','用邮箱登录后开始'):t('Start my listing','开始填写')}</button>
 <button class="btn ghost" data-a="tab" data-v="homes">${t('Just looking','先看看')}</button>`)}
function flyerNeedsAuth(){return (typeof authReady==='function'&&authReady()||dbLive())&&!AUTHU}
function goList(){if(flyerNeedsAuth()){try{sessionStorage.setItem(GOLIST_KEY,'1')}catch(e){}return authSheet()}homeForm()}
function flyerAfterSignIn(){let f=null;try{f=sessionStorage.getItem(GOLIST_KEY);sessionStorage.removeItem(GOLIST_KEY)}catch(e){}if(f&&!document.getElementById('h_title'))setTimeout(homeForm,300)}

// ---------- Home: things that make a passer-by stop and look (25 Nov 2026) ----------
// Ticker under the poster: the promises Loka actually keeps, scrolling like a shop sign. Decorative
// (aria-hidden): every line is also said elsewhere on the page in full.
const TICK=[['Free to list','免费发布'],['No agent fees','不收中介费'],['中文 OK','中文 OK'],['Bond checked: 4 weeks max','押金自动检查：最多 4 周'],['Renter rights on one page','租客权益一页看懂'],['Anti-scam tips','防骗提示'],['50c Translink fares','50 分公交'],['Sunnybank · Inner city · UQ side','布村 · 市中心 · UQ 一带']];
function ticker(){const row=TICK.map(x=>`<span>${esc(t(x[0],x[1]))}</span><i>✦</i>`).join('');
 return `<div class="lticker" aria-hidden="true"><div class="tk-in">${row}${row}</div></div>`}
// Bin Bin the ibis strolls along the skyline. Skipped when the phone asks for less motion.
function walker(){if(typeof REDUCED!=='undefined'&&REDUCED.matches)return'';return `<span class="walker" aria-hidden="true">${ibis(30,'walk')}</span>`}
// Landlord door on Home: the supply side needs a way in too.
function landlordCard(){const n=(typeof DB!=='undefined'&&DB.wantOk&&typeof wPublic==='function')?wPublic().filter(w=>!w.mine).length:0;
 return `<button class="llcard" data-a="listfree"><span class="ll-art" aria-hidden="true"><svg viewBox="0 0 80 64"><path class="ll-roof" d="M8 30L40 6L72 30" fill="none" stroke="#1F6F5C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="28" width="48" height="32" rx="3" fill="#F4F0E7" stroke="#1F6F5C" stroke-width="3"/><rect class="ll-win" x="22" y="35" width="12" height="11" rx="1.5" fill="#F3C9A8"/><g class="ll-door"><rect x="44" y="38" width="13" height="22" rx="1.5" fill="#E2683C"/><circle cx="54" cy="50" r="1.3" fill="#F4F0E7"/></g><g class="ll-key"><circle cx="66" cy="14" r="5" fill="none" stroke="#C99A2B" stroke-width="3"/><path d="M66 19V31M66 26H70M66 30H69" stroke="#C99A2B" stroke-width="3" stroke-linecap="round"/></g></svg></span>
 <span><b>${t('Got a room to rent? List it free.','有房出租？免费发布。')}</b><i>${n?t(`${n} renters are looking right now. No fees, 中文 OK.`,`现在有 ${n} 位租客在找房。不收费，中文 OK。`):t('No fees or commission. 中文 OK. Bond checked against Queensland rules.','不收费、不抽佣。中文 OK。押金按昆州规定检查。')}</i></span><em>→</em></button>`}
