# Run from the repo root: python3 tests/e2e/clip_audit.py   (Playwright; CHROME=path if needed)
# Opens every tab and the main pop-up sheets at phone widths, in English and 中文, light and dark,
# and reports anything cut off: content past the screen edge, text clipped or "..."-truncated,
# boxes whose content is taller than the box, and side-scrolling rows with no scroll hint (fade).
import subprocess,time,json,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,os.path.join(HERE,'fixture_server.py'),'8336',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
U='http://localhost:8336/'
TABS=['home','homes','jobs','today','landed','guides','rights','play','help','earn','tools','guide','ask','me','about','privacy','check','admin','wanted']
JS=r"""()=>{const W=innerWidth,out=[];const name=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;if(e.classList.length)s+='.'+[...e.classList].slice(0,3).join('.');return s};
const txt=e=>(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40);
const vis=e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;const c=getComputedStyle(e);return c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity!==0};
const inHScroll=e=>{for(let p=e.parentElement;p;p=p.parentElement){const c=getComputedStyle(p);if(/(auto|scroll)/.test(c.overflowX)&&p.scrollWidth>p.clientWidth+1)return p}return null};
const textOut=(box,ax)=>{const B=box.getBoundingClientRect();for(const d of box.querySelectorAll('*')){if(d.closest('svg,[aria-hidden="true"]')||!vis(d))continue;if(![...d.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const r=d.getBoundingClientRect();if(ax==='x'?(r.right>B.right+1||r.left<B.left-1):(r.bottom>B.bottom+1))return true}return false};
const decorative=e=>e.closest('svg,[aria-hidden="true"],.blob,.petals,.sky,.orbit,.toast:not(.show)');
for(const e of document.querySelectorAll('body *')){if(!vis(e)||decorative(e))continue;const r=e.getBoundingClientRect(),c=getComputedStyle(e);
 if(c.position==='fixed'&&(r.right<0||r.left>W))continue;
 if((r.right>W+1||r.left<-1)&&!inHScroll(e)&&e.children.length===0)out.push(['OFF-SCREEN',name(e),txt(e),Math.round(r.left)+'..'+Math.round(r.right)]);
 const oh=/(hidden|clip)/.test(c.overflowX),ov=/(hidden|clip)/.test(c.overflowY);
 if(oh&&e.scrollWidth>e.clientWidth+2&&e.innerText&&e.innerText.trim()&&(c.textOverflow==='ellipsis'||textOut(e,'x')))out.push([c.textOverflow==='ellipsis'?'TRUNCATED…':'CLIPPED-X',name(e),txt(e),e.scrollWidth+'>'+e.clientWidth]);
 if(ov&&e.scrollHeight>e.clientHeight+2&&e.innerText&&e.innerText.trim()&&!/(auto|scroll)/.test(c.overflowY)&&c.webkitLineClamp==='none'&&textOut(e,'y'))out.push(['CLIPPED-Y',name(e),txt(e),e.scrollHeight+'>'+e.clientHeight]);
 if(c.webkitLineClamp!=='none'&&e.scrollHeight>e.clientHeight+2)out.push(['LINE-CLAMPED',name(e),txt(e),'']);
 if(/(auto|scroll)/.test(c.overflowX)&&e.scrollWidth>e.clientWidth+1){const fade=e.classList.contains('fr')||e.classList.contains('fl')||/mask|gradient/.test(c.maskImage+c.webkitMaskImage);
   const kids=[...e.children].filter(vis);const peek=kids.some(k=>{const q=k.getBoundingClientRect(),pr=e.getBoundingClientRect();return q.left<pr.right-4&&q.right>pr.right+4});
   if(!fade&&!peek)out.push(['NO-SCROLL-HINT',name(e),txt(e),e.scrollWidth+'>'+e.clientWidth]);}
}
if(document.documentElement.scrollWidth>W+1)out.push(['PAGE-SIDEWAYS','html','',document.documentElement.scrollWidth+'>'+W]);
return out}"""
seen={};errs=[]
def audit(pg,label):
  for k in pg.evaluate(JS):
    key=(k[0],k[1],k[2]);seen.setdefault(key,set()).add(label)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None)
  for w in ([320,390] if os.environ.get('QUICK') else [320,375,390,430]):
   for lang in ['en','zh']:
    for dark in ([False] if os.environ.get('QUICK') else [False,True]):
     ctx=b.new_context(viewport={'width':w,'height':780},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce');pg=ctx.new_page()
     pg.on('pageerror',lambda e:errs.append(str(e)))
     pg.goto(U);pg.wait_for_selector('#nav button');time.sleep(1.2)
     pg.evaluate(f"S.lang='{lang}';document.documentElement.dataset.theme='{'dark' if dark else ''}'")
     L=f"{w}/{lang}/{'dark' if dark else 'light'}"
     # Wanted posts 求租: one from someone else (long note, every field) and one of the visitor's own.
     pg.evaluate("S.wanted=[{id:'wa1',db:false,mine:false,kind:'room',budget:280,zones:['south','innersouth','west','inner'],move:'2027-02-14',stay:'12',campus:'gu-nathan',zh:true,note:'Griffith master’s student from Chengdu, quiet, non-smoker, cooks simple meals, looking for a long stay near the 130 bus line, happy to share a bathroom',by:'Amy Zhang Xiaoyu',ago:5},{id:'wa2',db:false,mine:true,kind:'any',budget:350,zones:['west'],move:'',stay:'any',campus:'uq',zh:false,note:'',by:'Me',ago:30}]")
     for t in TABS:
      pg.evaluate(f"tab='{t}';render();scrollTo(0,0)");time.sleep(.35);audit(pg,L+':'+t)
     # pop-up sheets
     for t,sel in [('homes','[data-a="home"]'),('jobs','[data-a="job"]'),('guides','[data-a="guide1"]'),('play','[data-a="court"]')]:
      pg.evaluate(f"closeSheet&&closeSheet();tab='{t}';render();scrollTo(0,0)");time.sleep(.3)
      if pg.query_selector(sel):
       pg.click(sel);time.sleep(.6);audit(pg,L+':sheet-'+t)
       if w==390 and lang=='zh' and not dark:pg.screenshot(path=f'/tmp/aud/sheet-{t}.png')
     for nm,js in [('want','wantDetail("wa1")'),('want-mine','wantDetail("wa2")'),('want-form','(()=>{const a=AUTHU;AUTHU={id:"x"};wantForm();AUTHU=a})()')]:
      pg.evaluate(f"closeSheet&&closeSheet();tab='wanted';render();scrollTo(0,0);{js}");time.sleep(.6);audit(pg,L+':sheet-'+nm)
      if w==390 and not dark:pg.screenshot(path=f'/tmp/aud/sheet-{nm}-{lang}.png')
     if w==390 and not dark:
      pg.evaluate("closeSheet();tab='wanted';render();scrollTo(0,0)");time.sleep(.4);pg.screenshot(path=f'/tmp/aud/wanted-{lang}.png',full_page=True)
     if w==320:
      for t in ['home','homes','jobs','today','landed']:
       pg.evaluate(f"closeSheet&&closeSheet();tab='{t}';render();scrollTo(0,0)");time.sleep(.4);pg.screenshot(path=f'/tmp/aud/{L.replace("/","-")}-{t}.png',full_page=True)
     ctx.close()
  b.close()
finally:srv.kill()
order={'PAGE-SIDEWAYS':0,'OFF-SCREEN':1,'CLIPPED-X':2,'CLIPPED-Y':3,'NO-SCROLL-HINT':4,'TRUNCATED…':5,'LINE-CLAMPED':6}
for key in sorted(seen,key=lambda k:order.get(k[0],9)):
  ls=sorted(seen[key]);print(f"{key[0]:15} {key[1][:45]:45} '{key[2]}'  x{len(ls)}  e.g. {ls[0]}")
print('ISSUES',len(seen),'| page errors',len(set(errs)),list(set(errs))[:3])
