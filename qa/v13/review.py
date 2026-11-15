"""Capture changed routes with lazy art fully loaded, and fail for missing images/errors."""
import argparse,io,json,time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
p=argparse.ArgumentParser();p.add_argument('--out',default='docs/v13/batch03');p.add_argument('--all-sizes',action='store_true');p.add_argument('--routes',nargs='+',default=['index.html','requests.html','journey.html?subject=hangul','journey.html?subject=science']);args=p.parse_args()
out=ROOT/args.out;out.mkdir(parents=True,exist_ok=True);results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in ([('mobile360',360,800),('mobile',390,844),('tablet',800,1280),('landscape',1280,800)] if args.all_sizes else [('mobile',390,844),('tablet',800,1280)]):
  c=b.new_context(viewport={'width':w,'height':h});page=c.new_page()
  for n,route in enumerate(args.routes):
   errors=[]
   def error(e):errors.append(str(e))
   page.on('pageerror',error);page.goto('http://127.0.0.1:8000/'+route,wait_until='networkidle')
   if page.locator('#joy-splash').count():page.locator('#joy-splash').wait_for(state='hidden',timeout=5000)
   height=page.evaluate('document.documentElement.scrollHeight')
   for y in range(0,height,h//2):page.evaluate('(y)=>window.scrollTo(0,y)',y);page.wait_for_timeout(60)
   page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(250)
   page.locator('img').evaluate_all('(imgs)=>{for(const i of imgs)i.loading="eager"}')
   page.wait_for_function('[...document.images].every(i=>i.complete)',timeout=15000)
   Image.open(io.BytesIO(page.screenshot(full_page=True,animations="disabled"))).convert('RGB').save(out/(view+'-'+str(n)+'.webp'),quality=85)
   results.append({'view':view,'route':route,'screenshot':view+'-'+str(n)+'.webp','pageErrors':errors,'overflow':page.evaluate('document.documentElement.scrollWidth>innerWidth'),'brokenImages':page.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)')})
   page.remove_listener('pageerror',error)
  c.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results))
if any(r['pageErrors'] or r['overflow'] or r['brokenImages'] for r in results):raise SystemExit(1)
