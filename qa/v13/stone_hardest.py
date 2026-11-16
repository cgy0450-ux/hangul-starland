from pathlib import Path
import json
from playwright.sync_api import sync_playwright
import math
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);page=b.new_page(viewport={'width':800,'height':1280});page.clock.install();page.add_init_script("localStorage.setItem('joyi-sling-level','12')")
 def route(r):
  res=r.fetch();s=res.text().replace('Promise.all(Object.entries(paths)',"window.Probe=()=>({phase,shots,fuse,detonated,bird:bird?{x:bird.position.x,y:bird.position.y}:null,targets:targets.map(g=>({x:g.position.x,y:g.position.y,hp:g.hp,collected:!!g.collected}))});Promise.all(Object.entries(paths)");r.fulfill(response=res,body=s)
 page.route('**/slingshot.js*',route);page.goto('http://127.0.0.1:8000/slingshot.html');page.wait_for_function('window.Probe?.().targets.length');state=lambda:page.evaluate('Probe()')
 for shot in range(5):
  s=state();print('before',shot,s,flush=True)
  if s['phase']=='won':break
  target=next(t for t in s['targets'] if not t['collected']);t=24;vx=(target['x']-135)/t;vy=(target['y']-365-.5*.27778*t*t)/t;dx=vx/.22;dy=-vy/.22
  page.locator('canvas').scroll_into_view_if_needed();r=page.locator('canvas').bounding_box();xy=lambda x,y:(r['x']+x*r['width']/640,r['y']+y*r['height']/580);page.mouse.move(*xy(135,365));page.mouse.down();page.mouse.move(*xy(135-dx,365+dy),steps=8);page.mouse.up();previous=10000
  for step in range(70):
   page.clock.run_for(30);s=state()
   if s['phase']!='flying' or s['detonated']:break
   pos=s['bird'];d=math.hypot(pos['x']-target['x'],pos['y']-target['y'])
   if d<50 or (d>previous and previous<135) or (s['fuse'] is not None and d<130):page.locator('#detonate').click();break
   previous=d
  page.clock.run_for(3500)
 final=state();assert final['phase']=='won',final
 out=Path('docs/v13/stone-bomb');out.mkdir(exist_ok=True);page.screenshot(path=str(out/'tablet-hardest-won.png'));(out/'hardest.json').write_text(json.dumps({'stage':12,'cleared':True,'shotsUsed':5-final['shots'],'method':'actual pointer input and timed detonation; read-only state probe'},indent=2)+'\n');print('PASS hardest stone stage clears within five actual aimed shots');b.close()
