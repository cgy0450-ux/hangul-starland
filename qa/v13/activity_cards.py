"""All curriculum subjects retain eleven real lesson links with unique illustrated modes."""
import io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'docs/v13/activity-refresh';out.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for label,w,h in [('narrow',360,800),('mobile',390,844),('tablet',800,1280),('landscape',1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for subject in ['hangul','math','english','science','history','coding','finance','reading','life','creativity']:
   page.goto('http://127.0.0.1:8000/journey.html?subject='+subject)
   cards=page.locator('#modules [data-lesson]');assert cards.count()==11;ids=cards.evaluate_all('(xs)=>xs.map(x=>x.dataset.lesson)');assert len(set(ids))==11
   for i in range(11):
    cards.nth(i).scroll_into_view_if_needed();cards.nth(i).locator('img').evaluate('(im)=>im.decode()');assert cards.nth(i).bounding_box()['height']>=150
   urls=cards.locator('img').evaluate_all('(xs)=>xs.map(i=>i.src)');assert len(set(urls))==11;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if subject=='finance':
    page.locator('#modules').scroll_into_view_if_needed();Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(out/(label+'-finance.webp'),quality=88)
    cards.nth(1).click();assert page.locator('#play').is_visible();assert page.locator('#answers button').count()>0;page.locator('#back').click();assert page.locator('#modules [data-lesson]').count()==11
   results.append({'view':label,'subject':subject,'uniqueIllustratedLessons':11,'imagesDecoded':True})
  assert not errors,errors;c.close()
 b.close()
(out/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS',len(results),'subject/viewport scenarios; all 440 rendered card links')
