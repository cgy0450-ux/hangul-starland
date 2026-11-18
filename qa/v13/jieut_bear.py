from pathlib import Path
import json
from playwright.sync_api import sync_playwright
O=Path('docs/v13/jieut-bear');O.mkdir(exist_ok=True);rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));localStorage.setItem('joyi-gana-progress','8')");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.HANGUL_QA');page.locator('#joy-splash').wait_for(state='hidden');paths=page.evaluate("HANGUL_QA.glyphStrokes('자')");assert len(paths)==4
  def draw(path,selector='.ww-cell canvas',scale=100):
   r=page.locator(selector).first.bounding_box();conv=lambda t:(r['x']+r['width']*t[0]/scale,r['y']+r['height']*t[1]/scale)
   page.mouse.move(*conv(path[0]));page.mouse.down()
   for i in range(1,len(path)):
    a,z=path[i-1],path[i]
    for k in range(1,25):page.mouse.move(*conv([a[0]+(z[0]-a[0])*k/24,a[1]+(z[1]-a[1])*k/24]))
   page.mouse.up()
  page.screenshot(path=str(O/f'jieut-guide-{w}.png'));draw(paths[0][:2]);assert page.locator('.ww-counter').inner_text().startswith('0 /');draw([paths[0][0],paths[0][-1]]);assert page.locator('.ww-counter').inner_text().startswith('0 /');draw(paths[0]);assert page.locator('.ww-counter').inner_text().startswith('1 /');assert not page.evaluate('HANGUL_QA.view().answered');draw(paths[1]);assert page.locator('.ww-counter').inner_text().startswith('2 /');assert not page.evaluate('HANGUL_QA.view().answered');page.screenshot(path=str(O/f'jieut-written-{w}.png'))
  for path in paths[2:]:draw(path)
  assert page.evaluate('HANGUL_QA.view().answered')
  # Stage writing uses the independent shared gate and must also accept exactly two full ㅈ strokes.
  page.goto('http://127.0.0.1:8000/mini-games.html?game=mole');page.wait_for_function('!!window.JoyiWordGate');page.evaluate("()=>{window.passed=false;JoyiWordGate.start('ㅈ',()=>{passed=true})}");stage=page.evaluate("JoyiHangulGuide.pathsForHangul('ㅈ')");assert len(stage)==2;draw(stage[0][:2],'.jwg-sheet canvas',300);assert '0 / 2획' in page.locator('.jwg-current').inner_text();draw(stage[0],'.jwg-sheet canvas',300);assert '1 / 2획' in page.locator('.jwg-current').inner_text();assert not page.evaluate('passed');page.screenshot(path=str(O/f'jieut-stage-{w}.png'));draw(stage[1],'.jwg-sheet canvas',300);page.wait_for_function('passed')
  # Real reading question uses the new complete bear scene and the existing correct honey answer.
  page.goto('http://127.0.0.1:8000/journey.html?subject=reading');page.locator('.opening-skip').click();page.evaluate("()=>{const old=JOY_CORE.session;JOY_CORE.session=id=>{const s=old(id);s.questions=[{...JOY_CURRICULUM.subject('reading').modules[0].items[1],module:0}];return s}}")
  item=page.locator('#modules [data-lesson]').first;item.evaluate("e=>e.dataset.lesson='reading-0-choose'");item.click();im=page.locator('#visual img');im.evaluate('(i)=>i.decode()');assert im.get_attribute('src').endswith('lesson.reading-0.1-bear.webp');page.screenshot(path=str(O/f'bear-{w}.png'));page.locator('[data-opt="꿀"]').click();assert page.locator('#next').is_visible();assert not errors,errors;rows.append(dict(viewport=[w,h],initialJieutTwoStrokes=True,partialCornerCutRejected=True,vowelStillRequired=True,stageGateTwoStrokes=True,newBearDecodedAndHoneyCorrect=True));c.close()
 b.close()
(O/'validation.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS actual phone/tablet handwriting paths and strict partial rejection in both engines; complete bear/honey scene')
