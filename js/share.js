// Loka · share.js: sharing a room to Threads, Instagram, WeChat / 小红书, and opening shared links.
// Classic script, loaded after check.js and js/vendor/qrcode.js.
//
// What is real and what is not (checked against Meta's developer docs, 18 Nov 2026):
//  • Threads: the official Post Intent https://www.threads.com/intent/post?text=&url= opens the
//    Threads app (or web) with the post pre-filled. The person still taps Post themselves.
//  • Instagram: there is NO web link that posts to Instagram. What does work: we draw a
//    1080x1920 story image and hand it to the phone's share sheet (Web Share API with files);
//    the person picks Instagram. Instagram will not let a website add a link sticker, so we copy
//    the room link first and tell them to paste it into a Link sticker. Where the share sheet
//    cannot take files (many in-app browsers, desktop), the image downloads instead.
//  • Automatic posting from Loka's own accounts needs a Meta app, tokens and a server, and needs
//    the shared database (task O2) so the server knows about new listings. Not built yet.

const roomUrl=id=>`${location.origin}${location.pathname.replace(/index\.html$/,'')}#/room/${id}`;
function shareText(x){const st=checkState(x);
 return S.lang==='zh'
  ?`🏠 $${x.rent}/周 · ${x.title} · ${x.area}\n${st.all?'Loka 已核实 ✓':`Loka 核实 ${st.done}/4`} · 中文 OK\n布村租房，按昆州规定检查过 👇`
  :`🏠 $${x.rent}/wk · ${x.title} · ${x.area}\n${st.all?'Loka verified ✓':`Loka Check ${st.done}/4`} · 中文 OK\nBrisbane rooms checked against Queensland rules 👇`}
const threadsUrl=x=>`https://www.threads.com/intent/post?text=${encodeURIComponent(shareText(x))}&url=${encodeURIComponent(roomUrl(x.id))}`;

// ---------- Story image (1080 x 1920) ----------
function svgImage(svg,w,h){return new Promise((ok,no)=>{const s=svg.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
 const u=URL.createObjectURL(new Blob([s],{type:'image/svg+xml'}));const im=new Image();im.onload=()=>{URL.revokeObjectURL(u);ok(im)};im.onerror=e=>{URL.revokeObjectURL(u);no(e)};im.src=u})}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function wrapLines(c,text,maxW,maxLines){const out=[];let line='';
 for(const ch of Array.from(text)){const test=line+ch;if(c.measureText(test).width>maxW&&line){out.push(line);line=ch.trimStart();if(out.length===maxLines)break}else line=test}
 if(out.length<maxLines&&line)out.push(line);if(out.length===maxLines&&c.measureText(out[maxLines-1]).width>maxW-30)out[maxLines-1]=out[maxLines-1].slice(0,-2)+'…';return out}
async function storyCanvas(x){
 try{await Promise.all(['400 120px "Bagel Fat One"','900 90px "Nunito"','800 40px "Nunito"','900 40px "Noto Sans SC"'].map(f=>document.fonts.load(f)))}catch(e){}
 const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
 const F=(w,s,fam)=>c.font=`${w} ${s}px ${fam||'"Nunito","Noto Sans SC",sans-serif'}`;
 const g=c.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,'#2a8a72');g.addColorStop(.55,'#1F6F5C');g.addColorStop(1,'#154d40');c.fillStyle=g;c.fillRect(0,0,W,H);
 const hl=c.createRadialGradient(W*.9,0,0,W*.9,0,W*.9);hl.addColorStop(0,'rgba(255,255,255,.14)');hl.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=hl;c.fillRect(0,0,W,H);
 // Wordmark with long shadow
 // Instagram covers ~250px at the top (profile bar) and bottom (reply box): keep content between.
 F(400,130,'"Bagel Fat One","Nunito",sans-serif');c.textBaseline='alphabetic';
 for(let i=42;i>0;i--){c.fillStyle='#185a4a';c.fillText('Loka',80+i,370+i)}c.fillStyle='#F4F0E7';c.fillText('Loka',80,370);
 const lw=c.measureText('Loka').width;c.fillStyle='#E2683C';c.beginPath();c.arc(80+lw+22,354,15,0,7);c.fill();
 F(800,30);c.fillStyle='#cfe3da';c.fillText('布村生活站  ·  BRISBANE ROOMS',86,436);
 // Card
 const cx=70,cy=486,cw=W-140,ch=880;c.save();c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=60;c.shadowOffsetY=24;rrect(c,cx,cy,cw,ch,48);c.fillStyle='#F4F0E7';c.fill();c.restore();
 c.save();rrect(c,cx,cy,cw,ch,48);c.clip();
 try{const im=await svgImage(art(x),cw,470);c.drawImage(im,cx,cy,cw,470)}catch(e){c.fillStyle='#E6DCC8';c.fillRect(cx,cy,cw,470)}
 c.restore();
 const st=checkState(x),pad=cx+52;let y=cy+470+100;
 F(900,104);c.fillStyle='#1F6F5C';const pr='$'+x.rent;c.fillText(pr,pad,y);const pw=c.measureText(pr).width;F(800,40);c.fillStyle='#6B645A';c.fillText(S.lang==='zh'?' /周':' /wk',pad+pw+6,y);
 // Check pill
 const pill=st.all?(S.lang==='zh'?'✓ Loka 已核实':'✓ Loka verified'):(S.lang==='zh'?`Loka 核实 ${st.done}/4`:`Loka Check ${st.done}/4`);F(900,34);const plw=c.measureText(pill).width+56;
 rrect(c,cx+cw-52-plw,y-60,plw,70,35);c.fillStyle=st.all?'#1F6F5C':'#E8E1D3';c.fill();c.fillStyle=st.all?'#fff':'#191512';c.fillText(pill,cx+cw-52-plw+28,y-13);
 y+=78;F(900,54);c.fillStyle='#191512';for(const ln of wrapLines(c,x.title,cw-104,2)){c.fillText(ln,pad,y);y+=68}
 y+=8;F(800,38);c.fillStyle='#B84C26';c.fillText('● ',pad,y);c.fillStyle='#4d463f';const z=ZN[zone(x.area)];c.fillText(`${x.area}${z?'  ·  '+(S.lang==='zh'?z[1]:z[0]):''}`,pad+40,y);
 y+=62;F(700,34);c.fillStyle='#6B645A';const facts=[x.bills?(S.lang==='zh'?'包水电':'Bills included'):(S.lang==='zh'?'水电另计':'Plus bills'),x.zh?'中文 OK':null,x.bond?(S.lang==='zh'?`押金 $${x.bond}`:`Bond $${x.bond}`):(S.lang==='zh'?'无押金':'No bond')].filter(Boolean).join('   ·   ');c.fillText(facts,pad,y);
 // QR + link
 const url=roomUrl(x.id),qs=200,qx=cx,qy=cy+ch+46;rrect(c,qx,qy,qs+40,qs+40,28);c.fillStyle='#fff';c.fill();
 try{const q=qrcode(0,'M');q.addData(url);q.make();const n=q.getModuleCount(),m=qs/n;c.fillStyle='#191512';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))c.fillRect(qx+20+k*m,qy+20+r*m,Math.ceil(m),Math.ceil(m))}catch(e){}
 const tx=qx+qs+76;F(900,46);c.fillStyle='#F4F0E7';c.fillText(S.lang==='zh'?'扫码看这间房':'Scan to see this room',tx,qy+70);
 F(700,32);c.fillStyle='#F4C766';c.fillText(location.host||BRAND.url,tx,qy+120);
 F(700,28);c.fillStyle='#cfe3da';for(const [i,l] of (S.lang==='zh'?['付钱前先看房。押金只交给 RTA。','Rooms checked against Qld rules']:['Inspect before you pay. Bond goes','to the RTA. 中文 OK.']).entries())c.fillText(l,tx,qy+176+i*38);
 return cv}

// ---------- Share sheet ----------
let shareBlob=null,shareFor='';
function shareSheet(id){const x=S.homes.find(h=>h.id===id);if(!x)return;shareBlob=null;shareFor=id;
 openSheet(`<div class="tt" style="font-size:24px;font-weight:900">${t('Share this room','分享这间房')}</div>
 <div class="sub" style="margin-top:4px">${t('Help it reach someone who needs it.','让需要的人看到。')}</div>
 <div class="story-prev"><div class="sp-load">${t('Drawing the story image…','正在生成图片…')}</div></div>
 <div class="shb">
  <button class="sh ig" data-a="shig" data-v="${id}" disabled><span class="shi">${ico('igl')}</span><span><b>${t('Instagram Story','Instagram 快拍')}</b><i>${t('Image + link copied for a Link sticker','图片 + 已复制链接，可贴进 Link 贴纸')}</i></span></button>
  <a class="sh th" href="${threadsUrl(x)}" target="_blank" rel="noopener"><span class="shi">${ico('thr')}</span><span><b>Threads</b><i>${t('Opens Threads with the post written for you','打开 Threads，帖子已帮你写好')}</i></span></a>
  <button class="sh wc" data-a="shtext" data-v="${id}"><span class="shi">${ico('chat')}</span><span><b>${t('WeChat / 小红书 (RedNote) text','微信 / 小红书（RedNote）文案')}</b><i>${t('Copies the text and link','复制文案和链接')}</i></span></button>
  <button class="sh ln" data-a="shlink" data-v="${id}"><span class="shi">${ico('lnk')}</span><span><b>${t('Copy link','复制链接')}</b><i>${esc(roomUrl(id).replace(/^https?:\/\//,''))}</i></span></button>
 </div>
 <div class="note">${t('Instagram does not let websites post for you or add links. After the image opens in Instagram: tap the sticker icon, choose Link, and paste. The link is already copied.','Instagram 不允许网站代你发帖或加链接。图片在 Instagram 打开后：点贴纸图标，选 Link，粘贴即可，链接已经帮你复制好。')}</div>
 ${!seed().homes.some(h=>h.id===id)?`<div class="note warn">${t('Demo build: this listing is saved on your phone only, so the link will not open it on someone else’s phone yet. Sample listings work everywhere.','演示版：这条房源只存在你的手机里，别人打开链接暂时看不到。示例房源在任何手机都能打开。')}</div>`:''}`);
 storyCanvas(x).then(cv=>{if(shareFor!==id)return;const p=document.querySelector('.story-prev');if(p)p.innerHTML=`<img alt="" src="${cv.toDataURL('image/png')}">`;
  cv.toBlob(b=>{shareBlob=b;const btn=document.querySelector('[data-a="shig"]');if(btn)btn.disabled=false},'image/png')})}
async function shareInstagram(id){const x=S.homes.find(h=>h.id===id);if(!x||!shareBlob)return;
 try{await navigator.clipboard.writeText(roomUrl(id))}catch(e){}
 const file=new File([shareBlob],`loka-${id}.png`,{type:'image/png'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){
  try{await navigator.share({files:[file]});return}catch(e){if(e&&e.name==='AbortError')return}}
 // Fallback: save the image; they open Instagram and pick it.
 const a=document.createElement('a');a.href=URL.createObjectURL(shareBlob);a.download=file.name;document.body.appendChild(a);a.click();a.remove();
 toast(t('Image saved. Open Instagram → Story → pick it. Link copied for the sticker.','图片已保存。打开 Instagram → 快拍 → 选这张图。链接已复制，可贴进贴纸。'))}

// ---------- Shared links: #/room/<id> opens that room ----------
// Home-screen shortcuts open #/go/<tab>. Only tabs in this list are allowed.
const GO_TABS=['wanted','homes','jobs','today','landed','play','rights','guides'];
function openFromHash(){if(typeof openDraftFromHash==='function'&&openDraftFromHash())return;if(location.hash==='#/go/list'){tab='homes';render();scrollTo(0,0);history.replaceState(null,'',location.pathname+location.search);flyerLanding();return}
 const g=location.hash.match(/^#\/go\/([a-z]+)$/);if(g&&GO_TABS.includes(g[1])){tab=g[1];render();scrollTo(0,0);history.replaceState(null,'',location.pathname+location.search);return}
 const m=location.hash.match(/^#\/room\/([\w-]+)/);if(!m)return;const id=m[1];
 if(S.homes.some(h=>h.id===id)){tab='homes';render();homeDetail(id)}
 // A first-time visitor (QR, WeChat link) has no saved copy yet: wait for the database before saying "not found".
 else if(typeof authReady==='function'&&authReady()&&!(typeof DB!=='undefined'&&DB.on)){PEND_ROOM=id;tab='homes';render();toast(t('Opening the room…','正在打开这间房…'))}
 else{tab='homes';render();toast(t('That room is not on Loka yet, or it was taken down.','这间房还没上 Loka，或已下架。'))}
 history.replaceState(null,'',location.pathname+location.search)}
// Called by dbLoad() when it finishes (also when it fails, so the visitor always gets an answer).
let PEND_ROOM=null;
function openPendingRoom(){const id=PEND_ROOM;if(!id)return;PEND_ROOM=null;
 if(S.homes.some(h=>h.id===id)){tab='homes';render();homeDetail(id)}
 else toast(t('That room is not on Loka yet, or it was taken down.','这间房还没上 Loka，或已下架。'))}
addEventListener('hashchange',openFromHash);

// Line icons for the share sheet (24x24, stroke)
Object.assign(LI,{
 // Meta's brand rules allow only its own unaltered logos, so these are plain generic icons, not redrawn logos:
 // a phone-shaped story frame for Instagram Stories and an @ sign for Threads. The button text names the app.
 igl:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3"/>',
 thr:'<circle cx="12" cy="12" r="3.6"/><path d="M15.6 12v1.4a2.6 2.6 0 0 0 5.2 0V12a8.8 8.8 0 1 0-3.4 6.9"/>',
 chat:'<path d="M4 5.5h16v10H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
 lnk:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 share:'<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v7.5h14V12"/>'
});
