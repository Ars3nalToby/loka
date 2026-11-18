# Run from the repo root: python3 tests/e2e/pwa_check.py   (needs: pip install playwright; playwright install chromium)
# Checks Loka works as an installable, offline PWA: manifest, installability, offline reload,
# offline shortcut, offline Today page from the saved copy, and the check-up screen.
import subprocess,time,json,os,sys
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,os.path.join(HERE,'fixture_server.py'),'8335',ROOT]);time.sleep(1)
U='http://localhost:8335/'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None)
  ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(U);pg.wait_for_selector('#nav button')
  pg.wait_for_function("navigator.serviceWorker&&navigator.serviceWorker.controller",timeout=15000)
  time.sleep(3)  # first load fetches live data
  cdp=ctx.new_cdp_session(pg);print('installability errors:',cdp.send('Page.getInstallabilityErrors').get('installabilityErrors'))
  m=cdp.send('Page.getAppManifest');print('manifest errors:',m.get('errors'))
  ctx.set_offline(True)
  pg.reload();pg.wait_for_selector('#nav button',timeout=8000);print('OFFLINE reload ok, title:',pg.title(),'| css loaded:',pg.evaluate("getComputedStyle(document.body).backgroundColor"))
  pg.goto(U+'#/go/landed');time.sleep(1);print('offline shortcut -> tab:',pg.evaluate('tab'),'| h1:',pg.evaluate("document.querySelector('.lhero h1')&&document.querySelector('.lhero h1').innerText.replace(/\\n/,' ')"))
  pg.evaluate("tab='today';render()");time.sleep(2);print('offline today events shown:',pg.evaluate("document.querySelectorAll('#livebox .ev').length"))
  pg.evaluate("tab='check';render()");pg.click('[data-a=\"runcheck\"]');time.sleep(3)
  print('check-up offline:',pg.evaluate("[...document.querySelectorAll('.hc')].map(x=>(x.classList.contains('ok')?'OK ':x.classList.contains('no')?'NO ':'-- ')+x.querySelector('b').innerText)"))
  pg.screenshot(path='/tmp/pwa-check.png',full_page=True)
  ctx.set_offline(False)
  pg.evaluate("tab='guides';render();scrollTo(0,0)");time.sleep(2);pg.screenshot(path='/tmp/pwa-guides.png')
  pg.click('[data-a=\"guide1\"][data-v=\"friends\"]');time.sleep(1.5);pg.screenshot(path='/tmp/pwa-guide1.png',full_page=False)
  pg.evaluate("document.querySelector('#sheetIn').scrollTop=600");time.sleep(.6);pg.screenshot(path='/tmp/pwa-guide2.png')
  print('errors',errs)
  b.close()
finally:srv.kill()
