"""Capture actual running games and illustrated reading, not only entry overlays."""
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
import io,json
out=Path('docs/v13/active-review');out.mkdir(exist_ok=True);rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page()
  for route in ['firetruck-rescue.html','car-collect.html','car-dodge.html']:
   page.goto('http://127.0.0.1:8000/'+route);page.locator('#start').click();page.wait_for_timeout(900);file=view+'-'+route+'.webp';Image.open(io.BytesIO(page.screenshot(full_page=True,animations="disabled"))).convert('RGB').save(out/file,quality=85);rows.append({'view':view,'route':route,'state':'running','screenshot':file})
  for book in [0,6,19]:
   page.goto('http://127.0.0.1:8000/stories.html');page.locator('[data-book="'+str(book)+'"]').click();page.locator('#scene img').evaluate('(i)=>i.decode()');file=view+'-story-'+str(book)+'.webp';Image.open(io.BytesIO(page.screenshot(full_page=True,animations="disabled"))).convert('RGB').save(out/file,quality=85);rows.append({'view':view,'book':book,'screenshot':file})
  page.goto('http://127.0.0.1:8000/journey.html?subject=hangul&lesson=hangul-0-choose');page.wait_for_timeout(400);file=view+'-lesson.webp';Image.open(io.BytesIO(page.screenshot(full_page=True,animations="disabled"))).convert('RGB').save(out/file,quality=85);rows.append({'view':view,'route':'Hangul choose lesson','screenshot':file})
  c.close()
 b.close()
(out/'results.json').write_text(json.dumps(rows,indent=2)+'\n');print('Captured',len(rows),'active game/reading/learning states')
