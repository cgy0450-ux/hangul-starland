from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path('docs/v13/all-openings');O.mkdir(exist_ok=True);rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(1280,800)]:
  for subject,tokens in [('math',['1','2','3']),('english',['A','B','C']),('hangul',['ㄱ','ㄴ','ㄷ']),('science',['관찰','비교','발견']),('history',['생활','문화','지혜']),('coding',['순서','규칙','해결']),('finance',['모아요','골라요','나눠요']),('reading',['읽어요','생각해요','발견해요']),('life',['깨끗이','건강하게','함께']),('creativity',['색','선','상상'])]:
   c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/journey.html?subject='+subject);page.locator('.subject-opening.ready').wait_for();assert page.locator('.opening-letters span').all_text_contents()==tokens;page.locator('.opening-world').evaluate('(i)=>i.decode()');
   for im in page.locator('.opening-prop').all():im.evaluate('(i)=>i.decode()')
   page.wait_for_timeout(1150);page.screenshot(path=str(O/(subject+'-'+str(w)+'.png')));page.locator('.opening-skip').click();assert page.locator('.subject-opening').is_hidden();assert not page.locator('main').evaluate('(e)=>e.inert');page.locator('.opening-replay').click();page.wait_for_function('document.querySelector(".subject-opening").hidden');assert not errors,errors;rows.append(dict(subject=subject,viewport=[w,h],matchingArt=True,tokens=tokens,skipReplay=True));c.close()
 c=b.new_context(reduced_motion='reduce');page=c.new_page();page.goto('http://127.0.0.1:8000/journey.html?subject=english');page.wait_for_function('document.querySelector(".subject-opening").hidden');rows.append(dict(reducedMotion=True));page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);page.goto('http://127.0.0.1:8000/journey.html?subject=math');page.wait_for_function('document.querySelector(".subject-opening").hidden');assert page.locator('#modules').count()==1;rows.append(dict(offline=True));b.close()
(O/'validation.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS all ten subjects with distinct art and motion, skip/replay, reduced motion and offline on phone/tablet')
