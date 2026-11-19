"""Real Chrome before/after captures. No device claims; no canvas coordinate changes."""
import os,json,subprocess,threading,http.server,functools
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('JOY_SPACE_OUTPUT','/tmp/joy-space-results'));OUT.mkdir(parents=True,exist_ok=True)
base=Path('/tmp/joy-space-before');base.mkdir(exist_ok=True)
subprocess.run('git archive f169e18 | tar -x -C /tmp/joy-space-before',shell=True,check=True)
servers=[]
for port,root in [(8020,base),(8021,Path.cwd())]:
 class Quiet(http.server.SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 s=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Quiet,directory=str(root)));threading.Thread(target=s.serve_forever,daemon=True).start();servers.append(s)
rows=[]
subjects=['hangul','math','english','science','history','coding','finance','reading','life','creativity']
cases=[(s+'-explore',f'journey.html?subject={s}&lesson={s}-0-explore') for s in subjects]
cases += [('life-match','journey.html?subject=life&lesson=life-0-match'),('coding-order','journey.html?subject=coding&lesson=coding-2-order')]
others=['legacy.html?game=learn','legacy.html?game=trace','legacy.html?game=color','legacy.html?game=quiz','legacy.html?game=space','legacy.html?game=safari','writing.html?mode=english','writing.html?mode=numbers','academy.html?subject=math','coding-lab.html','finance.html','mazes.html','requests.html','firetruck-rescue.html','car-collect.html','car-dodge.html','adventure.html?game=dino','adventure.html?game=space','adventure.html?game=animal','mini-games.html?game=hidden','mini-games.html?game=colors','mini-games.html?game=shadows','mini-games.html?game=mole','mini-games.html?game=differences','slingshot.html','stories.html']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('JOY_CHROME','/usr/bin/google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(360,640),(390,844),(412,915),(1280,800)]:
  for label,route in cases:
   # Four sizes for actual feedback cases; two sizes for every other subject.
   if w in (360,412) and label not in ['creativity-explore','life-match','reading-explore']:continue
   for phase,port in [('before',8020),('after',8021)]:
    c=browser.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));Date.now=()=>1794934800000")
    page=c.new_page();page.goto(f'http://127.0.0.1:{port}/'+route);page.locator('.opening-skip').click();page.wait_for_timeout(400);page.evaluate('Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})))')
    metrics=page.evaluate('''()=>{const bounds=s=>Array.from(document.querySelectorAll(s)).filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,x:r.x,y:r.y,w:r.width,h:r.height,src:e.getAttribute('src')}});return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,images:bounds('#visual img,#answers img'),controls:bounds('#ready,#hear,#next,#answers button'),paper:bounds('.paper')}}''')
    page.screenshot(path=str(OUT/f'{label}-{w}-{phase}.png'));rows.append(dict(label=label,route=route,viewport=[w,h],phase=phase,**metrics))
    if phase=='after':
     assert metrics['scrollWidth']<=w,(label,w,'horizontal overflow')
     for r in metrics['controls']:assert r['y']>=0 and r['y']+r['h']<=h+1,(label,w,r)
     if label.endswith('explore'):
      assert len(metrics['images'])>0,(label,w,'missing image')
      assert max(r['h'] for r in metrics['images'])>=h*.25,(label,w,'picture too small')
      page.locator('#ready').click();assert page.locator('#answers').is_visible();assert page.locator('#question').is_visible()
    (OUT/'metrics.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');c.close()
 # Survey all remaining real routes, retain evidence; no blanket CSS changes to working games.
 for w,h in [(390,844),(1280,800)]:
  for i,route in enumerate(others):
   c=browser.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));Date.now=()=>1794934800000")
   page=c.new_page();response=page.goto('http://127.0.0.1:8021/'+route);assert response.status==200,route
   page.wait_for_timeout(350);page.screenshot(path=str(OUT/f'survey-{i:02}-{w}.png'));rows.append(dict(route=route,viewport=[w,h],phase='survey',scroll=page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight})')))
   if route=='stories.html':
    page.locator('[data-book="26"]').click();page.evaluate('document.querySelector("#scene img").decode()');page.screenshot(path=str(OUT/f'aiya-reader-{w}.png'),full_page=True)
    for n in range(10):
     assert page.locator('#scene img').get_attribute('src').endswith(f'{n:02}.webp');page.evaluate('document.querySelector("#scene img").decode()');assert page.locator('#scene img').evaluate('(e)=>e.naturalWidth>0')
     if n<9:page.locator('#next').click()
   c.close()
 browser.close()
(OUT/'metrics.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('PASS real Chrome viewport bounds, 10 subjects, before/after captures, route survey and ten illustrated story pages')
