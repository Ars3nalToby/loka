# Run from the repo root: python3 tests/e2e/mobile_audit.py   (Playwright; CHROME=path if needed)
# Phone usability: text boxes that make iPhone zoom (font < 16px), tap targets under 32px, number boxes
# without a number keypad. Prints TOTAL 0 when clean.
import subprocess,time,sys,json,os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
srv=subprocess.Popen([sys.executable,os.path.join(HERE,'fixture_server.py'),'8339',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
TABS=['home','homes','jobs','today','landed','guides','rights','play','help','earn','tools','guide','ask','me','about','privacy','check']
J=r"""()=>{const o=[];const vis=e=>{const r=e.getBoundingClientRect();const c=getComputedStyle(e);return r.width&&r.height&&c.visibility!=='hidden'&&c.display!=='none'};
for(const e of document.querySelectorAll('input,select,textarea')){if(!vis(e)||e.type==='checkbox'||e.type==='radio')continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<16)o.push(['ZOOM-ON-FOCUS (font<16px)',e.id||e.name||e.type,f+'px'])}
for(const e of document.querySelectorAll('button,a[href],[data-a],input[type=checkbox],select,label.tick')){if(!vis(e)||e.closest('svg'))continue;let r=e.getBoundingClientRect();const af=getComputedStyle(e,'::after');if(e.matches('.tickb,.vf,.card .row .heart')&&af.content!=='none'&&af.position==='absolute'){const i=parseFloat(af.top)||0;r={width:r.width-2*i,height:r.height-2*i}}
 if(e.matches('input[type=checkbox]')){const l=e.closest('label');if(l){const q=l.getBoundingClientRect();if(q.height>=24)continue}}
 const inline=e.tagName==='A'&&getComputedStyle(e).display==='inline'&&e.closest('p,.note,.fine,.sub,span,li,div');
 if(inline)continue;
 if(r.height<32||r.width<32)o.push(['SMALL-TAP (<32px)',(e.dataset.a||e.tagName.toLowerCase())+(e.dataset.v?'='+e.dataset.v:'')+' '+(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,24),Math.round(r.width)+'x'+Math.round(r.height)])}
for(const e of document.querySelectorAll('input[type=number],input#h_rent,input#j_pay')){if(vis(e)&&!e.getAttribute('inputmode'))o.push(['NO-INPUTMODE',e.id,e.type])}
return o}"""
seen={}
with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None)
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block');pg=ctx.new_page()
  pg.route('**/supabase.co/**',lambda r:r.abort())
  pg.goto('http://localhost:8339/');pg.wait_for_selector('#nav button');time.sleep(1)
  def go(lbl):
    for k in pg.evaluate(J):seen.setdefault((k[0],k[1]),[k[2],set()])[1].add(lbl)
  for t in TABS:
    pg.evaluate(f"closeSheet();tab='{t}';render();scrollTo(0,0)");time.sleep(.3);go(t)
  for f in ['homeForm()','jobForm()','authSheet()','homeDetail(S.homes[0].id)','jobDetail(S.jobs[0].id)','matchSheet()']:
    pg.evaluate("closeSheet();"+f);time.sleep(.5);go(f)
  #print('nav height',pg.evaluate("document.querySelector('#nav').getBoundingClientRect().height"),'| nav padding-bottom',pg.evaluate("getComputedStyle(document.querySelector('#nav')).paddingBottom"))
  b.close()
srv.kill()
for (k,n),(d,ls) in sorted(seen.items()):print(f"{k:28} {n[:50]:50} {d:9} x{len(ls)} {sorted(ls)[:3]}")
print('TOTAL',len(seen))
