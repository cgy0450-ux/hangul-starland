import io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/v13/history-refresh';OUT.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for label,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for name,id in [('신사임당','saimdang'),('세종대왕','sejong'),('이순신','yisunshin'),('장영실','jang'),('허준','heojun'),('유관순','yugwansun'),('한복','hanbok'),('물레','spinning'),('측우기','raingauge'),('훈민정음','hangulbook')]:
   page.goto('http://127.0.0.1:8000/journey.html?subject=history')
   page.evaluate("name=>{const item=JOY_CURRICULUM.subject('history').modules.flatMap(m=>m.items).find(q=>q.answer===name);if(!item)throw Error(name);const old=JOY_CORE.session;JOY_CORE.session=id=>{const s=old(id);s.questions=Array(5).fill({...item,choiceOptions:[item.answer,'별','집']});return s}}",name)
   page.locator('[data-lesson="history-0-explore"]').click();page.locator('#visual img.history-scene').evaluate('(im)=>im.decode()');expected=page.evaluate("name=>{const q=JOY_CURRICULUM.subject('history').modules.flatMap(m=>m.items).find(q=>q.answer===name);return window.JoyiSceneCatalog?.find('history',q.answer,q.visual)}",name);assert page.locator('#visual img').get_attribute('src')==(expected or './assets/v13/history.'+id+'.webp')
   box=page.locator('#visual img').bounding_box();assert box['width']>250 and box['height']>150,box
   page.locator('#ready').wait_for(state='visible');assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if id=='saimdang':Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(OUT/(label+'-saimdang.webp'),quality=88)
   results.append({'view':label,'person':name,'imageDecoded':True,'width':box['width'],'height':box['height']})
  assert not errors,errors;c.close()
 b.close()
(OUT/'validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS',len(results),'history scene phone/tablet scenarios')
