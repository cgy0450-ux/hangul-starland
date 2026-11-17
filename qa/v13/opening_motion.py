from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path('docs/v13/home-daily');rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(360,800),(1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();page.goto('http://127.0.0.1:8000/journey.html?subject=hangul');page.locator('.subject-opening.ready').wait_for();page.screenshot(path=str(O/(f'opening-{w}.png')));frames=page.evaluate('''()=>new Promise(resolve=>{const ts=[],end=performance.now()+500;function tick(t){ts.push(t);if(t<end)requestAnimationFrame(tick);else resolve(ts)}requestAnimationFrame(tick)})''');page.locator('.opening-skip').click();assert page.locator('.subject-opening').is_hidden();rows.append(dict(viewport=[w,h],frameSampleCount=len(frames),sampleMs=round(frames[-1]-frames[0],2),skip=True));c.close()
 c=b.new_context(reduced_motion='reduce');page=c.new_page();page.goto('http://127.0.0.1:8000/journey.html?subject=hangul');page.wait_for_function('document.querySelector(".subject-opening").hidden');page.locator('.opening-replay').click();page.wait_for_function('document.querySelector(".subject-opening").hidden');rows.append(dict(reducedMotionFastPoster=True,replay=True));b.close()
(O/'opening-motion.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS opening poster/skip/replay/reduced-motion and measured browser frame sample; not low-end-device FPS')
