// Loka · auth.js: accounts. Google sign-in, email code, Australian mobile code, and two-step
// verification with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy).
// Classic script, loaded after ui.js. Uses Supabase Auth through js/vendor/supabase.js (MIT),
// which is only downloaded when AUTH.url and AUTH.key are set in js/config.js.
//
// Rules this file keeps (see docs/AUTH.md for sources):
//  • Nothing is collected before the person sees the collection notice and confirms they are 18+.
//  • Phone numbers are used only to send sign-in codes. Never for marketing (Spam Act 2003).
//  • No ID documents, ID numbers or dates of birth are ever asked for.
//  • When AUTH is not configured, the sign-in sheet is a labelled preview with every button disabled.

let sb=null,AUTHU=null,authBusy=false,otpTo=null,mfaEnroll=null;
const authReady=()=>!!(AUTH.url&&AUTH.key);

function loadSb(){return new Promise((ok,no)=>{if(window.supabase&&window.supabase.createClient)return ok();
 const s=document.createElement('script');s.src='js/vendor/supabase.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function authInit(){if(!authReady())return;
 try{await loadSb();sb=window.supabase.createClient(AUTH.url,AUTH.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
  const {data}=await sb.auth.getSession();AUTHU=data.session?data.session.user:null;
  sb.auth.onAuthStateChange((ev,session)=>{const was=AUTHU&&AUTHU.id;AUTHU=session?session.user:null;if(ev==='SIGNED_IN')afterSignIn();render();
   if((AUTHU&&AUTHU.id)!==was)setTimeout(dbLoad,0)});
  if(AUTHU)await needMfa();render();dbLoad()}catch(e){console.warn('Auth unavailable',e)}}

// ---------- Australian mobile numbers ----------
// Accepts 0412 345 678, 412345678, +61 412 345 678, 61412345678. Returns +61412345678 or null.
function auMobile(raw){let d=String(raw||'').replace(/[\s()\-.]/g,'');
 if(d.startsWith('+'))d=d.slice(1);if(d.startsWith('61'))d=d.slice(2);if(d.startsWith('0'))d=d.slice(1);
 return /^4\d{8}$/.test(d)?'+61'+d:null}
const showPhone=p=>p?p.replace(/^\+61(\d{3})(\d{3})(\d{3})$/,'0$1 $2 $3'):'';

// ---------- Sign-in sheet ----------
function authSheet(step){const live=authReady(),dis=live?'':' disabled';step=step||'start';
 const pre=live?'':`<div class="note warn"><b>${t('Preview only.','仅为预览。')}</b> ${t('Sign-in is built but not switched on yet: Loka’s own account database still has to be connected. Nothing you type here is sent anywhere.','登录功能已经做好，但还没启用：Loka 自己的账户数据库还没接上。这里输入的任何内容都不会被发送。')}</div>`;
 if(step==='code'){const em=otpTo.kind==='email';openSheet(`<div class="tt" style="font-size:24px;font-weight:900">${em?t('Enter the code from your email','输入邮件里的验证码'):t('Enter the 6-digit code','输入 6 位验证码')}</div>
  <div class="sub">${t('Sent to','已发送到')} <b>${esc(em?otpTo.v:showPhone(otpTo.v))}</b>. ${em?t('Type the code from the email from Loka (no-reply@lokabne.au). It can take a minute to arrive.','请输入 Loka（no-reply@lokabne.au）寄来的验证码。邮件可能要一分钟左右才到。'):t('It expires soon, so use it now.','验证码很快过期，请尽快输入。')}</div>
  ${em?`<div class="fine">${t('Not there? Check Junk or Spam. The code works in the browser and in the home-screen app.','没收到？请看看垃圾邮件箱。验证码在浏览器和主屏幕 app 里都能用。')}</div>`:''}
  <input id="au_code" data-enter="au_verify" enterkeyhint="go" inputmode="numeric" autocomplete="one-time-code" maxlength="10" class="otp" placeholder="••••••">
  <button class="btn" data-a="au_verify">${t('Sign in','登录')}</button><button class="btn ghost" data-a="au_start">${t('Use a different email or number','换一个邮箱或号码')}</button>`);return}
 openSheet(`<div class="tt" style="font-size:26px;font-weight:900">${t('Sign in to Loka','登录 Loka')}</div>
 <div class="sub">${t('Needed to post a room, see contact details, report a listing or save across devices. Browsing never needs an account.','发布房源、查看联系方式、举报或跨设备收藏才需要登录。浏览房源不需要账户。')}</div>${pre}
 <label class="tick agree"><input type="checkbox" id="au_ok"${dis}><span>${t('I am 18 or older, and I have read the','我已年满 18 岁，并已阅读')} <a href="#" data-a="tab" data-v="privacy">${t('privacy notice','隐私说明')}</a> ${t('and','和')} <a href="#" data-a="tab" data-v="about">${t('listing rules','发布规则')}</a>.</span></label>
 ${AUTH.google?`<button class="authb g" data-a="au_google"${dis}><span class="gl">${GLOGO}</span>${t('Continue with Google','使用 Google 继续')}</button>`:''}
 ${AUTH.email?`<div class="or"><span>${t('or with your email','或用邮箱')}</span></div><input id="au_email" data-enter="au_email" enterkeyhint="send" type="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="you@example.com"${dis}><button class="authb" data-a="au_email"${dis}>${t('Email me a sign-in link','发登录邮件')}</button>`:''}
 ${AUTH.phone?`<div class="or"><span>${t('or with an Australian mobile','或用澳洲手机号')}</span></div><div class="phone"><span>+61</span><input id="au_phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="0412 345 678"${dis}></div><button class="authb" data-a="au_phone"${dis}>${t('Text me a code','短信发验证码')}</button><div class="fine">${t('Your number is only used to send sign-in codes. Loka will never send marketing texts.','手机号只用来发送登录验证码，Loka 绝不会发广告短信。')}</div>`:''}
 <div class="fine">${t('Loka never asks for ID documents, ID numbers or your date of birth.','Loka 不会要求你提供证件、证件号码或出生日期。')}</div>`)}

async function authAct(a){if(!authReady()||authBusy)return;
 const need18=()=>{const c=document.getElementById('au_ok');if(c&&!c.checked){toast(t('Please confirm you are 18+ and have read the privacy notice','请先确认已满 18 岁并已阅读隐私说明'));return false}return true};
 authBusy=true;try{
  if(a==='au_google'){if(!need18())return;const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error)throw error}
  if(a==='au_email'){if(!need18())return;const v=(document.getElementById('au_email').value||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return toast(t('Check the email address','请检查邮箱地址'));
   const {error}=await sb.auth.signInWithOtp({email:v,options:{shouldCreateUser:true,emailRedirectTo:location.origin+'/',data:(typeof srcData==='function'?srcData():undefined)}});if(error)throw error;otpTo={kind:'email',v};authSheet('code')}
  if(a==='au_phone'){if(!need18())return;const p=auMobile(document.getElementById('au_phone').value);if(!p)return toast(t('Enter an Australian mobile, e.g. 0412 345 678','请输入澳洲手机号，例如 0412 345 678'));
   const {error}=await sb.auth.signInWithOtp({phone:p,options:{data:(typeof srcData==='function'?srcData():undefined)}});if(error)throw error;otpTo={kind:'phone',v:p};authSheet('code')}
  if(a==='au_verify'){const code=(document.getElementById('au_code').value||'').replace(/\D/g,'');if(code.length<6||code.length>10)return toast(t('Type all the digits of the code','请输入完整的验证码'));
   const q=otpTo.kind==='phone'?{phone:otpTo.v,token:code,type:'sms'}:{email:otpTo.v,token:code,type:'email'};const {error}=await sb.auth.verifyOtp(q);if(error)throw error;closeSheet()}
  if(a==='au_out'){await sb.auth.signOut();closeSheet();toast(t('Signed out','已退出'))}
  if(a==='mfa_start'){const {data,error}=await sb.auth.mfa.enroll({factorType:'totp',friendlyName:'Loka '+new Date().toISOString().slice(0,10)});if(error)throw error;mfaEnroll=data;accountSheet()}
  if(a==='mfa_confirm'){const code=(document.getElementById('mfa_code').value||'').replace(/\D/g,'');const {error}=await sb.auth.mfa.challengeAndVerify({factorId:mfaEnroll.id,code});if(error)throw error;mfaEnroll=null;accountSheet();toast(t('Two-step verification is on','两步验证已开启'))}
  if(a==='mfa_cancel'){if(mfaEnroll)await sb.auth.mfa.unenroll({factorId:mfaEnroll.id});mfaEnroll=null;accountSheet()}
  if(a==='mfa_off'){const f=document.querySelector('[data-a="mfa_off"]').dataset.v;const {error}=await sb.auth.mfa.unenroll({factorId:f});if(error)throw error;accountSheet();toast(t('Two-step verification removed','已关闭两步验证'))}
  if(a==='mfa_check'){const code=(document.getElementById('mfa_code').value||'').replace(/\D/g,'');const f=document.querySelector('[data-a="mfa_check"]').dataset.v;const {error}=await sb.auth.mfa.challengeAndVerify({factorId:f,code});if(error)throw error;closeSheet();render()}
 }catch(e){toast(t('That did not work: ','未成功：')+(e&&e.message?e.message:''))}finally{authBusy=false}}
function afterSignIn(){needMfa();if(typeof scoutAfterSignIn==='function')scoutAfterSignIn();if(typeof flyerAfterSignIn==='function')flyerAfterSignIn()}
// If the account has an authenticator app, ask for its code before treating the session as fully signed in.
async function needMfa(){if(!sb)return false;const {data}=await sb.auth.mfa.getAuthenticatorAssuranceLevel();
 if(data&&data.currentLevel==='aal1'&&data.nextLevel==='aal2'){const {data:f}=await sb.auth.mfa.listFactors();const v=(f&&f.totp||[]).find(x=>x.status==='verified');
  if(v){openSheet(`<div class="tt" style="font-size:24px;font-weight:900">${ico('shield')} ${t('Two-step verification','两步验证')}</div><div class="sub">${t('Open your authenticator app and enter the 6-digit code for Loka.','打开验证器 app，输入 Loka 的 6 位验证码。')}</div><input id="mfa_code" data-enter="mfa_check" enterkeyhint="go" class="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"><button class="btn" data-a="mfa_check" data-v="${v.id}">${t('Confirm','确认')}</button>`);return true}}return false}

// ---------- Account sheet ----------
async function accountSheet(){if(!authReady()||!AUTHU)return authSheet();
 let f=[];try{const r=await sb.auth.mfa.listFactors();f=(r.data&&r.data.totp||[]).filter(x=>x.status==='verified')}catch(e){}
 const how=(AUTHU.app_metadata&&AUTHU.app_metadata.provider)||'email';
 const id=AUTHU.email||showPhone(AUTHU.phone?('+'+String(AUTHU.phone).replace(/^\+/,'')):'');
 let mfa;
 if(mfaEnroll)mfa=`<div class="mfa-set"><ol><li>${t('Open Google Authenticator (or any authenticator app) and tap +.','打开 Google Authenticator（或任何验证器 app），点 +。')}</li><li>${t('Scan this code.','扫描这个二维码。')}</li></ol>
  <img class="mfa-qr" alt="${t('QR code for your authenticator app','验证器 app 二维码')}" src="${qrSrc(mfaEnroll.totp.qr_code)}"><div class="fine">${t('Can’t scan? Enter this key:','无法扫码？手动输入这个密钥：')} <code>${esc(mfaEnroll.totp.secret)}</code></div>
  <label>${t('3. Enter the 6-digit code it shows','3. 输入 app 显示的 6 位数字')}</label><input id="mfa_code" class="otp" inputmode="numeric" maxlength="6" placeholder="••••••">
  <button class="btn" data-a="mfa_confirm">${t('Turn on','开启')}</button><button class="btn ghost" data-a="mfa_cancel">${t('Cancel','取消')}</button></div>`;
 else mfa=f.length?`<div class="li y">${t('On: an authenticator app code is needed at every sign-in.','已开启：每次登录都需要验证器 app 的验证码。')}</div><button class="btn ghost" data-a="mfa_off" data-v="${f[0].id}">${t('Turn off two-step verification','关闭两步验证')}</button>`
  :`<div class="note" style="margin-top:0">${t('Adds a second lock: after signing in, you also enter a code from an app like Google Authenticator. Recommended for anyone who lists rooms.','多加一道锁：登录后还要输入 Google Authenticator 等 app 里的验证码。发布房源的人强烈建议开启。')}</div><button class="btn" data-a="mfa_start">${ico('shield')} ${t('Set up with Google Authenticator','用 Google Authenticator 设置')}</button>`;
 openSheet(`<div class="tt" style="font-size:24px;font-weight:900">${t('Your account','你的账户')}</div>
 <div class="acct"><span class="av">${esc((id||'?').slice(0,1).toUpperCase())}</span><div><b>${esc(id)}</b><i>${t('Signed in with','登录方式：')} ${how==='google'?'Google':how==='phone'?t('mobile','手机'):t('email','邮箱')}</i></div></div>
 <div class="sec">${t('Two-step verification','两步验证')}</div>${mfa}
 <div class="sec">${t('Your information','你的资料')}</div><div class="note" style="margin-top:0">${t('You can ask to see, correct or delete what Loka holds about you.','你可以要求查看、更正或删除 Loka 保存的你的资料。')} ${BRAND.contact?`<a href="mailto:${esc(BRAND.contact)}">${esc(BRAND.contact)}</a>`:''}</div>
 <button class="btn ghost" data-a="au_out">${t('Sign out','退出登录')}</button>`)}

// Supabase returns the QR as SVG text (supabase-js may prefix it as a data URL). Encode it so quotes
// inside the SVG cannot break the img attribute.
function qrSrc(q){const raw=String(q||'').replace(/^data:image\/svg\+xml;(utf-8|charset=utf-8),/,'');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(raw)}
const GLOGO='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// Card on the Me page
function accountCard(){if(authReady()&&AUTHU){const id=AUTHU.email||showPhone(AUTHU.phone?('+'+String(AUTHU.phone).replace(/^\+/,'')):'');
  return `<button class="acct-card" data-a="acct"><span class="av">${esc((id||'?').slice(0,1).toUpperCase())}</span><span><b>${esc(id)}</b><i>${t('Account, two-step verification, sign out','账户、两步验证、退出')}</i></span>›</button>`}
 return `<button class="acct-card" data-a="signin"><span class="av">${ico('shield')}</span><span><b>${t('Sign in','登录')}${authReady()?'':' · '+t('preview','预览')}</b><i>${authReady()?t('Google, email or mobile. Two-step verification available.','Google、邮箱或手机。可开启两步验证。'):t('Accounts are built but not switched on yet.','账户功能已做好，尚未启用。')}</i></span>›</button>`}
