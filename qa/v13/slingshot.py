"""Actual browser input/physics checks, with read-only test instrumentation."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];out=R/'docs/v13/slingshot';out.mkdir(exist_ok=True);results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for name,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();page.clock.install();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def intercept(route):
   response=route.fetch();body=response.text().replace('Promise.all(Object.entries(paths)',"window.SlingAudit=()=>({phase,shots,level,started,ended,blocks:blocks.map(b=>({x:b.position.x,y:b.position.y,a:b.angle})),targets:targets.map(g=>({x:g.position.x,y:g.position.y,collected:!!g.collected}))});Promise.all(Object.entries(paths)");route.fulfill(response=response,body=body)
  page.route('**/slingshot.js*',intercept);page.goto('http://127.0.0.1:8000/slingshot.html');page.wait_for_function('window.SlingAudit?.().blocks.length>0');assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  box=page.locator('canvas').bounding_box();xy=lambda x,y:(box['x']+x*box['width']/640,box['y']+y*box['height']/580)
  page.mouse.move(*xy(135,365));page.mouse.down();page.mouse.move(*xy(135,365));page.mouse.up();assert page.evaluate('SlingAudit().shots')==5
  page.screenshot(path=str(out/(name+'-ready.png')));page.locator('#launch').click();assert page.evaluate('SlingAudit().shots')==4;page.clock.run_for(7500);state=page.evaluate('SlingAudit()');print(name,state,flush=True)
  assert state['phase']=='won',state
  page.screenshot(path=str(out/(name+'-won.png')));page.locator('#action').click();assert page.evaluate('SlingAudit().level')==2
  before=page.evaluate('SlingAudit().started');page.locator('#retry').click();assert page.evaluate('SlingAudit().started')==before
  page.mouse.move(*xy(135,365));page.mouse.down();page.mouse.move(*xy(60,400),steps=8);page.screenshot(path=str(out/(name+'-aim.png')));page.mouse.up();assert page.evaluate('SlingAudit().shots')==4
  page.clock.fast_forward(300001);assert page.evaluate('SlingAudit().ended');assert page.locator('#title').inner_text()=='별빛 새총 챔피언!';assert page.locator('#launch').is_disabled();assert not errors,errors
  layouts=[]
  for stage in range(1,13):
   page.evaluate('(n)=>localStorage.setItem("joyi-sling-level",n)',stage);page.reload();page.wait_for_function('window.SlingAudit?.().blocks.length>0');state=page.evaluate('SlingAudit()');assert state['level']==stage;assert all(0<g['y']<520 for g in state['targets']);layouts.append([(round(a['x']),round(a['y']))for a in state['blocks']])
   if stage==12:page.screenshot(path=str(out/(name+'-stage12.png')))
  assert len(set(json.dumps(x) for x in layouts))==12
  results.append(dict(view=name,zeroPullCancel=True,actualShotWins=True,nextStage=True,retryPreservesTimer=True,dragLaunch=True,fiveMinuteCap=True,twelveDistinctLayouts=True));c.close()
 b.close()
(out/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS actual mobile/tablet slingshot mechanics')
