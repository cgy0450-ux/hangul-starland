"""Install production worker then disconnect and render new artwork on actual routes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));localStorage.setItem('joiland-drive-vehicle','helicopter')");page=c.new_page();page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True)
 page.goto('http://127.0.0.1:8000/journey.html?subject=finance');assert page.locator('#modules .activity-art').count()==11
 for img in page.locator('#modules .activity-art').all():img.scroll_into_view_if_needed();img.evaluate('(i)=>i.decode()')
 for route in ['car-collect.html','car-dodge.html']:
  page.goto('http://127.0.0.1:8000/'+route);page.locator('.vehicle-preview').evaluate('(i)=>i.decode()');assert page.locator('[data-vehicle="helicopter"]').get_attribute('aria-pressed')=='true';page.locator('#start').click();page.evaluate("()=>Promise.all(['vehicle-top.helicopter','vehicle-rotor.helicopter'].map(x=>JoyiArt.imageFor(x).decode()))");page.locator('.vehicle-change').click();page.locator('[data-vehicle="police"]').click();page.locator('#start').click();assert page.locator('#overlay').get_attribute('class').endswith('hidden')
 b.close()
(root/'docs/v13/vehicle-refresh/offline.json').write_text(json.dumps({'offline11ActivityImages':'PASS','offlineHelicopterBodyRotorPreview':'PASS','offlineSwitchBothGames':'PASS'},indent=2)+'\n');print('PASS new lesson cards and helicopter games offline')
