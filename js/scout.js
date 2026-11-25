// Loka · scout invites (23 Nov 2026, owner's request).
// A Loka admin sees a room ad on a noticeboard, types the ROOM details here (never the landlord's contact),
// and gets a link + a ready-to-send message. The landlord opens #/draft/<code>, signs in, sees the
// "List a place" form already filled, adds their own contact, ticks the declarations themselves and
// publishes as the lister. Loka stays a notice board: nothing is published without the landlord.
//
// The draft lives only in the link (base64url JSON in the #fragment, which browsers never send to a
// server) and in this device's localStorage until it is used. No database change.
const SCOUT_KEY='loka.draft';
const SCOUT_FIELDS={type:'s',title:'s',area:'s',near:'s',rent:'n',bond:'n',bills:'b',furn:'b',agr:'s',adv:'n',note:'s'};
// Contact details must never ride in a draft: a phone number, an email or a WeChat ID is refused.
// A phone number = 8 or more digits in one run of digits, spaces, dots or dashes (so "bond $920, 5 min" or a date is fine).
const SCOUT_TAGS=/@|微信|wechat|\bwx\s*[:：]|\bvx\s*[:：]/i;
// Web links are refused too: a crafted draft link must not be able to show a Loka-branded page pointing somewhere else.
const SCOUT_LINK=/https?:|www\.|\b[a-z0-9-]+\.(com|net|org|cn|au|io|me|co|xyz|top|link|ly)\b/i;
function scoutHasContact(o){return ['title','near','note'].some(k=>{const s=String(o[k]||'');return SCOUT_TAGS.test(s)||SCOUT_LINK.test(s)||(s.match(/\+?\d[\d\s.-]*\d/g)||[]).some(r=>r.replace(/\D/g,'').length>=8)})}
const b64u={enc:s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),
 dec:s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))};
function scoutClean(o){if(!o||typeof o!=='object')return null;const d={v:1};
 for(const k in SCOUT_FIELDS){const ty=SCOUT_FIELDS[k],x=o[k];if(x==null||x==='')continue;
  if(ty==='n'){const n=+x;if(Number.isFinite(n)&&n>=0&&n<=20000)d[k]=Math.round(n*100)/100}
  else if(ty==='b')d[k]=!!x&&x!=='0';
  else d[k]=String(x).replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,k==='note'?400:140)}
 if(d.type&&!(typeof HT!=='undefined'&&HT[d.type]))delete d.type;
 if(d.agr&&d.agr!=='room'&&d.agr!=='fixed')delete d.agr;
 if(!d.title||!d.rent)return null;
 if(scoutHasContact(d))return null;
 return d}
function scoutEncode(o){const d=scoutClean(o);return d?b64u.enc(JSON.stringify(d)):null}
function scoutDecode(code){try{if(!/^[\w-]{4,3000}$/.test(code||''))return null;return scoutClean(JSON.parse(b64u.dec(code)))}catch(e){return null}}
function scoutUrl(code){return `${location.origin}/#/draft/${code}`}
function scoutSave(d){try{localStorage.setItem(SCOUT_KEY,JSON.stringify({d,at:Date.now()}))}catch(e){}}
function scoutPending(){try{const j=JSON.parse(localStorage.getItem(SCOUT_KEY)||'null');if(!j||Date.now()-j.at>14*864e5)return null;return scoutClean(j.d)}catch(e){return null}}
function scoutDone(){try{localStorage.removeItem(SCOUT_KEY)}catch(e){}}

// ---------- Admin side ----------
function scoutCard(){return `<div class="card scout-card"><div class="tt">${ico('pin')} ${t('Scout: invite a landlord','星探：邀请房东')}</div>
 <div class="meta">${t('Saw a room ad on a noticeboard? Type the room details (not their contact). Loka makes a link the landlord opens to check it, add their own contact and post it themselves.','在公告栏看到出租广告？输入房间资料（不要输入对方联系方式）。Loka 会生成链接，房东打开后自己核对、填写联系方式、亲自发布。')}</div>
 <div class="cta"><button class="btn" data-a="scoutnew">${t('New invite','新建邀请')}</button></div></div>`}
function scoutForm(){openSheet(`<div class="tt" style="font-size:21px">${t('Scout invite','星探邀请')}</div>
 <div class="note">${t('Room details only. Never type the landlord’s phone, WeChat or email: they add that themselves, so nothing personal is shared without them.','只填房间资料。不要输入房东的电话、微信或邮箱：由房东自己填写，未经本人同意不分享任何个人资料。')}</div>
 <label>${t('Your name (the landlord sees who is writing)','你的名字（让房东知道是谁联系他）')}</label><input id="s_name" maxlength="40" autocomplete="given-name">
 <label>${t('Where you saw it (only for your message)','在哪里看到（只用在讯息里）')}</label><input id="s_where" placeholder="${t('e.g. Sunnybank Plaza noticeboard','例如 Sunnybank Plaza 公告栏')}">
 <label>${t('Type','类型')}</label><select id="s_type">${Object.keys(HT).map(k=>`<option value="${k}">${HT[k][0]} ${t(HT[k][1],HT[k][2])}</option>`).join('')}</select>
 <label>${t('Title','标题')}</label><input id="s_title" maxlength="140">
 <div class="g2"><div><label>${t('Suburb','区域')}</label><input id="s_area" list="ssubs" autocomplete="off"><datalist id="ssubs">${SUBURB_DATA.suburbs.map(x=>`<option value="${esc(x.name)}">${x.zh?esc(x.zh):''}</option>`).join('')}</datalist></div><div><label>${t('Near (uni / station)','靠近（学校/车站）')}</label><input id="s_near" maxlength="140"></div></div>
 <div class="g2"><div><label>${t('Rent per week $','周租 $')}</label><input id="s_rent" type="number" inputmode="decimal"></div><div><label>${t('Bond $','押金 $')}</label><input id="s_bond" type="number" inputmode="decimal"></div></div>
 <div class="g2"><div><label>${t('Bills','水电网')}</label><select id="s_bills"><option value="1">${t('Included','包含')}</option><option value="0">${t('Extra','另计')}</option></select></div><div><label>${t('Furnished','家具')}</label><select id="s_furn"><option value="1">${t('Yes','有')}</option><option value="0">${t('No','无')}</option></select></div></div>
 <label>${t('Details from the ad','广告上的其他信息')}</label><textarea id="s_note" rows="2" maxlength="400"></textarea>
 <button class="btn" data-a="scoutmake">${t('Make the link','生成链接')}</button>`)}
// Spam Act 2003: every message says who is sending it and how to say no; one message, no follow-ups.
function scoutMessages(url,where,owner,name){const w=(where||'').trim(),n=String(name||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,40),me=(n?`我是 ${n}，`:'')+(owner?'Loka（lokabne.au）的创办人':'在用 Loka（lokabne.au）'),meEn=(n?`I'm ${n}. `:'')+(owner?'I run Loka (lokabne.au)':'I use Loka (lokabne.au)');
 const zh=`您好！我在${w?' '+w+' ':'公告栏'}看到您的出租信息。${me}，这是一个免费的布村中英双语租房平台。我已经按您的广告先填好草稿，您打开下面的链接核对一下、填上您自己的联系方式，就可以免费发布（大约两分钟）。免费发布、不收佣金，您随时可以下架。如果不需要，回复“不用了”，我不会再联系您。谢谢！\n${url}`;
 const en=`Hi! I saw your room ad ${w?'at '+w:'on a noticeboard'}. ${meEn}, a free bilingual rooms board for Brisbane. I've started a draft from your ad: open the link, check it, add your own contact and post it free (about 2 minutes). Free to list, no commission, and you can take it down anytime. If you'd rather not, reply STOP and I won't contact you again. Thanks!\n${url}`;
 return {zh,en}}
function scoutMake(){if(!val('s_name'))return toast(t('Add your name: the landlord should know who is writing.','请填写你的名字：房东应该知道是谁联系他。'));const where=val('s_where'),o={type:val('s_type'),title:val('s_title'),area:val('s_area'),near:val('s_near'),rent:val('s_rent'),bond:val('s_bond'),bills:val('s_bills')==='1',furn:val('s_furn')==='1',note:val('s_note')};
 if(scoutHasContact(o))return toast(t('Take out the phone, email or WeChat. The landlord adds their own contact.','请删掉电话、邮箱或微信。联系方式由房东自己填。'));
 if(!o.title||!(+o.rent))return toast(t('Title and rent are needed','需要标题和租金'));
 if(o.area&&!SUB(o.area))return toast(t('Pick a suburb from the list. Loka covers the inner city and south side.','请从列表选择区名。Loka 目前覆盖市中心和南区。'));
 const code=scoutEncode(o);if(!code)return toast(t('Check the details and try again','请检查后再试'));
 const url=scoutUrl(code),m=scoutMessages(url,where,typeof DB!=='undefined'&&DB.admin,val('s_name')),pb=publishBlock(+o.rent,+o.bond||0,2,'room');
 SCOUT_LAST=m;
 openSheet(`<div class="tt" style="font-size:21px">${t('Invite ready','邀请已生成')}</div>
 ${pb==='bond'?`<div class="note warn">⚠ ${t('This ad asks for more than 4 weeks of bond. Loka will not publish it until the landlord lowers it; the form will tell them.','此广告押金超过 4 周。房东降低押金前 Loka 不会发布，表单会提示房东。')}</div>`:''}
 <div class="note">${t('Send it to the landlord yourself (text or WeChat), once. If they say no or do not reply, do not message them again. Nothing is posted until they publish it.','请你自己用短信或微信发给房东，只发一次。对方拒绝或没回复，就不要再发。房东亲自发布前，什么都不会公开。')}</div>
 <label>${t('Link','链接')}</label><input readonly value="${esc(url)}">
 <div class="cta"><button class="btn" data-a="scoutcopy" data-v="zh">${t('Copy message · 中文','复制讯息 · 中文')}</button><button class="btn ghost" data-a="scoutcopy" data-v="en">${t('Copy message · English','复制讯息 · English')}</button></div>
 <div class="cta"><a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">${t('Preview as the landlord','以房东身份预览')}</a></div>`)}
let SCOUT_LAST=null;

// ---------- Landlord side ----------
function scoutSummary(d){return `<div class="card"><div class="tt">${esc(d.title)}</div><div class="meta">$${esc(d.rent)}/${t('wk','周')}${d.bond?` · ${t('bond','押金')} $${esc(d.bond)}`:''}${d.area?` · ${esc(d.area)}`:''}${d.near?` · ${esc(d.near)}`:''}</div>${d.note?`<div class="note">${esc(d.note)}</div>`:''}</div>`}
function scoutLanding(d){openSheet(`<div class="tt" style="font-size:22px">${t('Your room, ready to post','您的房间，已准备好发布')}</div>
 <div class="sub">${t('A Loka scout saw your ad and started a free listing for you. Nothing is public yet: you check it, add your own contact, tick the rules and post it yourself.','Loka 探房员看到您的广告，先帮您填好了免费房源草稿。目前没有公开：由您核对、填写自己的联系方式、勾选规则，再亲自发布。')}</div>
 ${scoutSummary(d)}
 <div class="note">${t('Free to list, no commission. Edit or take it down anytime. Not interested? Just close this.','免费发布，不收佣金，可随时修改或下架。不需要的话关掉就好。')}</div>
 <button class="btn" data-a="scoutgo">${dbLive()&&!AUTHU?t('Sign in and check it','登录并核对'):t('Check and post','核对并发布')}</button>
 <button class="btn ghost" data-a="scoutno">${t('No thanks','不用了')}</button>`)}
// Fill the normal form. Contact, "you are" and every declaration stay empty: only the landlord fills those.
function scoutFill(d){homeForm();const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!=null)e.value=String(v)};
 set('h_type',d.type);set('h_title',d.title);set('h_area',d.area);set('h_near',d.near);set('h_rent',d.rent);set('h_bond',d.bond);
 if(d.bills!=null)set('h_bills',d.bills?'1':'0');if(d.furn!=null)set('h_furn',d.furn?'1':'0');set('h_agr',d.agr);if(d.adv!=null)set('h_adv',d.adv);set('h_note',d.note);
 const top=document.querySelector('#sheetIn .tt');if(top)top.insertAdjacentHTML('afterend',`<div class="note scout-note">${t('Filled in from your ad. Please check every line, then add your own contact and tick the declarations.','已根据您的广告填好。请逐项核对，再填写您自己的联系方式并勾选声明。')}</div>`)}
function scoutGo(){const d=scoutPending();if(!d){closeSheet();return toast(t('That draft has expired. Tap “List a place” to start fresh.','草稿已过期。请点“发布房源”重新填写。'))}
 if(dbLive()&&!AUTHU){authSheet();return}
 scoutFill(d)}
// After sign-in, pick up a waiting draft (the landlord came from a scout link).
function scoutAfterSignIn(){const d=scoutPending();if(d&&!document.getElementById('h_title'))setTimeout(()=>scoutFill(d),300)}
function openDraftFromHash(){const m=location.hash.match(/^#\/draft\/([\w-]+)$/);if(!m)return false;
 history.replaceState(null,'',location.pathname+location.search);
 const d=scoutDecode(m[1]);tab='homes';render();
 if(!d){toast(t('That link is broken or too old.','链接无效或已过期。'));return true}
 scoutSave(d);scoutLanding(d);return true}
