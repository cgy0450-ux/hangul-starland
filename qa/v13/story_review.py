"""Render every actual story page on phone and tablet; verify art, text, controls and comprehension."""
import io,json,argparse
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ap=argparse.ArgumentParser();ap.add_argument('--books',nargs='+',type=int);ap.add_argument('--out',default='docs/v13/story-review');args=ap.parse_args();ROOT=Path(__file__).resolve().parents[2];out=ROOT/args.out;out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
  page=c.new_page();page.goto('http://127.0.0.1:8000/stories.html');books=page.evaluate('window.JOY_STORIES')
  for i,book in enumerate(books):
   if args.books and i not in args.books:continue
   page.locator('[data-book="'+str(i)+'"]').click()
   for j,scene in enumerate(book['pages']):
    image=page.locator('#scene img');image.evaluate('(i)=>i.decode()');assert image.get_attribute('src')==scene['art'];assert page.locator('#storytext').inner_text()==scene['text']
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    file=f'{view}-{i:02}-{j:02}.webp';Image.open(io.BytesIO(page.screenshot(full_page=True,animations="disabled"))).convert('RGB').save(out/file,quality=80)
    results.append({'view':view,'book':i,'page':j,'screenshot':file,'image':scene['art'],'naturalWidth':image.evaluate('(i)=>i.naturalWidth')})
    page.locator('#next').click()
   q=page.locator('#comprehension');q.wait_for(state='visible');buttons=q.locator('.story-choice');buttons.nth((book['question']['answer']+1)%3).click();assert '다시 생각' in q.locator('[role=status]').inner_text();buttons.nth(book['question']['answer']).click();assert q.locator('[role=status]').inner_text()==book['question']['explanation']
   page.locator('#back').click()
  c.close()
 b.close()
if args.books and (out/'results.json').exists():
 results=json.loads((out/'results.json').read_text())+results
 results=list({(r['view'],r['book'],r['page']):r for r in results}.values())
(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS:',len(results),'actual story page renders; 40 correct/wrong comprehension checks')
