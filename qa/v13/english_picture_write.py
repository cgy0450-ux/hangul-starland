import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();page.goto('http://127.0.0.1:8000/writing.html?mode=english');page.locator('[data-i="2"]').click();page.wait_for_timeout(150);assert page.locator('#target').inner_text()=='c';page.locator('#check').click();assert page.locator('#target').inner_text()=='c'
  for expected in ['c','a','t','cat']:
   assert page.locator('#target').inner_text()==expected
   paths=page.locator('#guide path[stroke-dasharray]').evaluate_all('''ps=>ps.map(p=>{const len=p.getTotalLength(),matrix=p.getScreenCTM();return Array.from({length:71},(_,i)=>{const a=p.getPointAtLength(len*i/70),point=new DOMPoint(a.x,a.y).matrixTransform(matrix);return [point.x,point.y]})})''')
   for path in paths:
    page.mouse.move(*path[0]);page.mouse.down()
    for point in path[1:]:page.mouse.move(*point)
    page.mouse.up()
   page.locator('#check').click();page.wait_for_timeout(120)
  assert 'word:cat' in page.evaluate("JSON.parse(localStorage.getItem('joiland-writing-english'))");results.append({'viewport':[w,h],'pictureToCat':'PASS','emptyWritingRejected':True,'allLowercaseLettersAndWholeWord':'PASS'});c.close()
 b.close()
(ROOT/'docs/v13/learning-refresh/english-writing-results.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS picture selects c/a/t then whole cat; empty attempt rejected; completion saved')
