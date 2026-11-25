# Flyers + Home "stop and look" pieces (25 Nov 2026). Run: python3 tests/e2e/flyer_check.py
# Draws every flyer (3 formats x 2 kinds), checks the QR decodes to the right link (if OpenCV is
# installed), that story text stays out of Instagram's bottom 250px, and that Home shows the
# landlord card, the ticker (decorative, aria-hidden) and Bin Bin, with no page errors.
import asyncio,base64,os,subprocess,sys,time
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(HERE))
srv=subprocess.Popen([sys.executable,os.path.join(HERE,'fixture_server.py'),'8341',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
try:
  import cv2,numpy as np
except Exception: cv2=None
bad=[]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path=os.environ.get('CHROME') or None)
    pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8341/');await pg.wait_for_timeout(1500)
    home=await pg.evaluate("({ll:!!document.querySelector('.llcard[data-a=listfree]'),tk:document.querySelector('.lticker')?.getAttribute('aria-hidden'),w:!!document.querySelector('.walker .ibis')})")
    if not home['ll']:bad.append('no landlord card on Home')
    if home['tk']!='true':bad.append('ticker missing or not aria-hidden')
    if not home['w']:bad.append('Bin Bin walker missing')
    for f in ['a4','rednote','story']:
      for k in ['landlord','renter']:
        d=await pg.evaluate(f"drawFlyer('{k}','test-tag','{f}').then(c=>[c.width,c.height,c.toDataURL('image/png'),STORY_TEXT_Y])")
        w,h,url,sy=d
        if f=='story' and not (0<sy<=h-250):bad.append(f'story text at {sy}, inside Instagram bottom 250px')
        if cv2 is not None:
          im=cv2.imdecode(np.frombuffer(base64.b64decode(url.split(',')[1]),np.uint8),1);txt=cv2.QRCodeDetector().detectAndDecode(im)[0]
          want='/?src=test-tag#/go/'+('list' if k=='landlord' else 'wanted')
          if f=='rednote':
            if txt:bad.append('rednote flyer must not carry a QR')
          elif not txt.endswith(want):bad.append(f'{f}/{k} QR decodes to {txt!r}')
    await pg.evaluate("flyerSheet('landlord')");await pg.wait_for_timeout(1200)
    await pg.evaluate("document.querySelector('[data-a=listfree]')&&flyerLanding()");await pg.wait_for_timeout(300)
    if errs:bad.append('page errors: '+'; '.join(errs))
    await b.close()
asyncio.run(main());srv.terminate()
print('QR decode:', 'checked' if cv2 is not None else 'skipped (no OpenCV)')
for x in bad:print('FAIL',x)
print('FLYER CHECK', 'OK' if not bad else 'FAILED');sys.exit(1 if bad else 0)
