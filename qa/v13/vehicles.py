"""Exercise enlarged cars through real steering, pickups and collisions at phone/tablet sizes."""
import io,json,re
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'docs/v13/fixes/vehicles';out.mkdir(parents=True,exist_ok=True);results=[]
INIT="""localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));localStorage.setItem('joiland-car-total','42');localStorage.setItem('joiland-car-selected','2');Math.random=()=>0;window.__time=0;window.__frames=new Map();window.__id=0;window.requestAnimationFrame=fn=>{const id=++window.__id;window.__frames.set(id,fn);return id};window.cancelAnimationFrame=id=>window.__frames.delete(id);window.__runFrames=n=>{for(let i=0;i<n;i++){window.__time+=50;const frames=[...window.__frames.values()];window.__frames.clear();for(const fn of frames)fn(window.__time)}}"""
def snap(page,name):Image.open(io.BytesIO(page.screenshot(full_page=True,animations='disabled'))).convert('RGB').save(out/name,quality=84)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for label,w,h in [('narrow',360,800),('mobile',390,844),('tablet',800,1280),('landscape',1280,800)]:
  for route in ['car-collect.html','car-dodge.html']:
   c=b.new_context(viewport={'width':w,'height':h});c.add_init_script(INIT);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/'+route);page.evaluate('__runFrames(1)');page.locator('[data-vehicle="fire"]').click();assert page.locator('#start').evaluate('(b)=>{const r=b.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b}');snap(page,label+'-'+route+'-choice.webp');page.locator('#start').click();page.locator('#road').evaluate('(x)=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
   if route=='car-collect.html':
    page.locator('#left').click();page.evaluate('__runFrames(180)');assert int(re.search(r'\d+',page.locator('#score').inner_text())[0])>0;assert int(page.evaluate("localStorage.getItem('joiland-car-total')"))>42;assert page.evaluate("localStorage.getItem('joiland-car-selected')")=='2';snap(page,label+'-'+route+'-running.webp');page.locator('#pause').click();score=page.locator('#score').inner_text();page.evaluate('__runFrames(40)');assert page.locator('#score').inner_text()==score;page.locator('#start').click();page.evaluate('__runFrames(80)');assert int(re.search(r'\d+',page.locator('#score').inner_text())[0])>=int(re.search(r'\d+',score)[0])
   else:
    page.evaluate('__runFrames(180)');assert page.locator('#lives').inner_text().count('💛')==3;assert int(re.search(r'\d+',page.locator('#score').inner_text())[0])>0;page.locator('#left').click()
    for step in range(80):
     page.evaluate('__runFrames(2)')
     if page.locator('#lives').inner_text().count('💛')<3:break
    assert page.locator('#lives').inner_text().count('💛')==2;snap(page,label+'-'+route+'-running.webp')
   assert not errors,errors;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');results.append({'view':label,'route':route,'steeringAndPhysics':'PASS','startVisibleWithoutScroll':True,'pageErrors':errors});c.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS',len(results),'vehicle steering/physics/viewport scenarios')
