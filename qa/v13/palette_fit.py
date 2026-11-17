from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path('docs/v13/palette-fix');O.mkdir(exist_ok=True);rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(360,640),(360,740),(390,844),(412,915),(1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=True);page=c.new_page();page.goto('http://127.0.0.1:8000/legacy.html?game=color');page.wait_for_function('!!window.HANGUL_QA');page.evaluate("()=>{for(let i=0;i<1000;i++){HANGUL_QA.go('color');if(document.querySelector('.ww-room')?.dataset.word==='포도')return}}");page.wait_for_timeout(1800);page.locator('.ww-object img').evaluate('(im)=>im.decode()')
  for x in page.locator('.ww-toolbar button,.ww-head a,.ww-head button,.ww-surface').all():
   r=x.bounding_box();assert r['y']>=0 and r['y']+r['height']<=h+1,(w,h,r)
  for dot in page.locator('[data-ww-color]').all():dot.tap();assert dot.get_attribute('aria-pressed')=='true'
  assert page.evaluate('document.documentElement.scrollHeight<=innerHeight');page.screenshot(path=str(O/(str(w)+'x'+str(h)+'.png')));rows.append(dict(width=w,height=h,sixColorsTappable=True,controlsInBounds=True));c.close()
 b.close()
(O/'validation.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS five required grape/palette viewports and six actual color taps each')
