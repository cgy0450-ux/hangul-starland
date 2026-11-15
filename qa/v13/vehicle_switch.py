"""Actual Canvas helicopter, five choices, mid-game state persistence and resumed play."""
import json,io
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
from drive_fixture import INIT
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'docs/v13/vehicle-refresh';out.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for label,w,h in [('mobile',390,844),('tablet',800,1280),('landscape',1280,800)]:
  for route in ['car-collect.html','car-dodge.html']:
   c=b.new_context(viewport={'width':w,'height':h});c.add_init_script(INIT+";localStorage.setItem('joiland-stage-writing-enabled','false')");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://127.0.0.1:8000/'+route);page.evaluate('__runFrames(1)');assert page.locator('[data-vehicle]').count()==5
   page.locator('[data-vehicle="helicopter"]').click();page.evaluate("async()=>{await Promise.all(['vehicle-top.helicopter','vehicle-rotor.helicopter'].map(x=>JoyiArt.imageFor(x).decode()));window.__sprites=[];const orig=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im,...args){if(im.src)window.__sprites.push(im.src);return orig.call(this,im,...args)}}")
   page.locator('#start').click();page.evaluate('__runFrames(70)');before=page.evaluate('JoyiDriveSnapshot()');assert before['running'] and not before['paused'];assert any('vehicle-top.helicopter' in x for x in page.evaluate('__sprites'));assert any('vehicle-rotor.helicopter' in x for x in page.evaluate('__sprites'))
   page.locator('.vehicle-change').click();paused=page.evaluate('JoyiDriveSnapshot()');assert paused['paused'];page.evaluate('__runFrames(600)');assert page.evaluate('JoyiDriveSnapshot()')==paused
   for vehicle in ['ambulance','convertible','fire','police','helicopter']:
    page.locator('[data-vehicle="'+vehicle+'"]').click();assert page.evaluate('JoyiDriveSnapshot()')==paused
   page.locator('#start').click();after=page.evaluate('JoyiDriveSnapshot()');assert not after['paused'];assert {k:v for k,v in after.items() if k!='paused'}=={k:v for k,v in paused.items() if k!='paused'}
   page.evaluate('__runFrames(5)');assert page.evaluate('JoyiDriveSnapshot().'+('sessionElapsed' if 'collect' in route else 'playElapsed'))>before.get('sessionElapsed',before.get('playElapsed'))
   page.locator('#pause').click();page.locator('#start').click();page.evaluate('__runFrames(1)');Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(out/(label+'-'+route+'.webp'),quality=86)
   timer='sessionElapsed' if 'collect' in route else 'playElapsed'
   while page.evaluate('JoyiDriveSnapshot().'+timer)<299.75:
    if page.locator('#start').is_visible():page.locator('#start').click()
    elapsed=page.evaluate('JoyiDriveSnapshot().'+timer);page.evaluate('__runFrames('+str(max(1,min(100,int((299.8-elapsed)/.05))))+')')
   assert page.evaluate('JoyiDriveSnapshot().running');page.evaluate('__runFrames(12)');assert not page.evaluate('JoyiDriveSnapshot().running');assert '5분' in page.locator('#message-title').inner_text()
   page.reload();page.evaluate('__runFrames(1)');assert page.locator('[data-vehicle="helicopter"]').get_attribute('aria-pressed')=='true';assert not errors,errors;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');results.append({'route':route,'view':label,'choices':5,'canvasBodyAndRotor':True,'pausedStateExact':True,'resumePreservesState':True,'persisted':True,'fiveMinuteLimitAfterSwitch':True});c.close()
 b.close()
(out/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS',len(results),'helicopter and live switching scenarios')
