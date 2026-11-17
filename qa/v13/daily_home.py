from pathlib import Path
from playwright.sync_api import sync_playwright
import json,subprocess
O=Path('docs/v13/home-daily');O.mkdir(exist_ok=True);rows=[]
# Baseline and mobile A/B use the pre-change source and existing artwork, not copied reference graphics.
old=subprocess.check_output(['git','show','HEAD:index.html'],text=True).replace('<head>','<head><base href="../">',1);tmp=Path('qa/home-before.html');tmp.write_text(old)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(360,800),(390,844),(800,1280),(1280,800),(1600,900),(800,360)]:
  c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  if w in [360,1280]:page.goto('http://127.0.0.1:8000/qa/home-before.html');page.screenshot(path=str(O/(f'before-{w}.png')))
  page.goto('http://127.0.0.1:8000/');page.wait_for_function('document.querySelectorAll("[data-daily-subject]").length===3');page.locator('[data-daily-subject] img').first.evaluate('(im)=>im.decode()');ids=page.locator('[data-daily-subject]').evaluate_all('(xs)=>xs.map(x=>x.dataset.dailySubject)');assert len(set(ids))==3
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight')
  for x in page.locator('.home-dock').all():r=x.bounding_box();assert r['y']+r['height']<=h+1
  page.screenshot(path=str(O/(f'after-{w}x{h}.png')))
  if w==360:
   style=page.add_style_tag(content='.daily-subject{flex-basis:calc((100% - 16px)/2)!important}');page.screenshot(path=str(O/'candidate-two-cards.png'));style.evaluate('(s)=>s.remove()')
  page.reload();assert page.locator('[data-daily-subject]').evaluate_all('(xs)=>xs.map(x=>x.dataset.dailySubject)')==ids
  page.locator('#all-subjects').click();assert page.locator('dialog #subjects [data-subject]').count()==10;page.locator('dialog form button').click();assert page.locator('.write-now').get_attribute('href').endswith('course=gana')
  if w<600:page.locator('#subject-next').click();page.wait_for_timeout(500);assert page.locator('#daily-subjects').evaluate('(e)=>e.scrollLeft')>0
  assert not errors,errors;rows.append(dict(viewport=[w,h],cards=ids,allTenAccessible=True,noPageOverflow=True));c.close()
 # Pure scheduling guarantees plus KST boundary.
 page=b.new_page();page.goto('http://127.0.0.1:8000/');assert page.evaluate('''()=>{const ids=Array.from({length:10},(_,i)=>i),counts=Array(10).fill(0);for(let d=0;d<10;d++){const a=JoyiDaily.pick(ids,3,Date.UTC(2026,0,1+d));if(new Set(a).size!==3)return false;for(const i of a)counts[i]++}const union=new Set(Array.from({length:4},(_,i)=>JoyiDaily.pick(ids,3,Date.UTC(2026,0,1+i))).flat());return counts.every(n=>n===3)&&union.size===10&&JoyiDaily.day(Date.parse('2026-11-17T14:59:59Z'))!==JoyiDaily.day(Date.parse('2026-11-17T15:00:00Z'))}''')
 page.goto('http://127.0.0.1:8000/stories.html');assert page.locator('[data-book]').count()==3;ids=page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>x.dataset.book)');page.reload();assert page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>x.dataset.book)')==ids
 page.clock.install();page.clock.set_system_time('2026-11-18T14:59:59Z');page.reload();first=page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>x.dataset.book)');page.clock.fast_forward(31000);second=page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>x.dataset.book)');assert len(second)==3 and second!=first
 rows.append(dict(equalTenDayExposure=True,allWithinFourDays=True,kstMidnight=True,storiesThreeStable=True,storiesRotateAtMidnight=True));b.close()
tmp.unlink();(O/'validation.json').write_text(json.dumps(rows,indent=2)+'\n');print('PASS home six sizes, daily 3/10 fairness/KST, all subjects, swipe controls, stories daily three')
