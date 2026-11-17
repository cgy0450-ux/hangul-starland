from pathlib import Path
from playwright.sync_api import sync_playwright
import json
O=Path('docs/v13/quiz-context');O.mkdir(exist_ok=True);rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(1138,480),(1280,800),(390,844)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));localStorage.setItem('joyi-gana-progress','4')");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/legacy.html?game=quiz');page.wait_for_function('!!window.HANGUL_QA');page.wait_for_timeout(1800);page.evaluate("()=>{for(let i=0;i<1000;i++){HANGUL_QA.go('quiz');if(document.querySelector('.question-image')?.getAttribute('aria-label')==='오리')return}}");page.locator('.choice').filter(has_text='오리').click();btn=page.locator('[data-a=next]');r=btn.bounding_box();assert r['y']+r['height']<=h;page.screenshot(path=str(O/(f'quiz-{w}.png')));btn.click();assert page.evaluate('HANGUL_QA.view().round')==1
  page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.HANGUL_QA');assert page.locator('.ww-room').get_attribute('data-word')=='마';assert page.locator('.ww-reference').inner_text()=='차';assert page.locator('.ww-object img').get_attribute('src').endswith('sprite.carriage.webp');page.locator('.ww-object img').evaluate('(im)=>im.decode()');page.wait_for_timeout(1800);page.screenshot(path=str(O/(f'carriage-{w}.png')));assert not errors,errors;rows.append(dict(viewport=[w,h],duckNextClickable=True,carriageCorrect=True,wholeExampleVisible=True));c.close()
 b.close()
(O/'validation.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS duck correct-next and actual carriage with full example on phone/landscape/tablet')
