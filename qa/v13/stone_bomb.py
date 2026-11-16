import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];out=R/'docs/v13/stone-bomb';out.mkdir(exist_ok=True);results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();page.clock.install();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def intercept(route):
   res=route.fetch();s=res.text().replace('Promise.all(Object.entries(paths)',"window.SlingAudit=()=>({phase,shots,level,started,ended,detonated,blocks:blocks.map(b=>({x:b.position.x,y:b.position.y,hp:b.hp,destroyed:!!b.destroyed})),targets:targets.map(g=>({hp:g.hp,collected:!!g.collected}))});Promise.all(Object.entries(paths)");route.fulfill(response=res,body=s)
  page.route('**/slingshot.js*',intercept);page.goto('http://127.0.0.1:8000/slingshot.html');page.wait_for_function('window.SlingAudit?.().blocks.length>0')
  state=lambda:page.evaluate('SlingAudit()')
  def drag(x,y):
   page.locator('canvas').scroll_into_view_if_needed();r=page.locator('canvas').bounding_box();point=lambda x,y:(r['x']+x*r['width']/640,r['y']+y*r['height']/580);page.mouse.move(*point(135,365));page.mouse.down();page.mouse.move(*point(x,y),steps=8);page.mouse.up()
  drag(135,365);assert state()['shots']==3
  page.screenshot(path=str(out/(view+'-ready.png')));page.locator('#launch').click();page.clock.run_for(7000);assert state()['phase']!='won';assert state()['targets'][0]['hp']>0
  started=state()['started'];page.locator('#retry').click();assert state()['started']==started
  page.locator('#launch').click();page.clock.run_for(40);page.locator('#detonate').click();before=state();assert before['detonated'] and before['targets'][0]['hp']==180;assert page.locator('#detonate').is_disabled();page.clock.run_for(1800)
  for miss in range(2):
   page.locator('#launch').click();page.clock.run_for(40);page.locator('#detonate').click();page.clock.run_for(1800)
  assert state()['phase']=='lost' and state()['shots']==0;assert page.locator('#launch').is_disabled();page.locator('#retry').click();assert state()['started']==started

  for shot in range(3):
   drag(35,345);page.clock.run_for(300)
   if not page.locator('#detonate').is_disabled():page.locator('#detonate').click()
   page.clock.run_for(100)
   if shot==0:page.screenshot(path=str(out/(view+'-blast.png')))
   page.clock.run_for(3100)
   if shot==0:assert state()['phase']!='won' and state()['targets'][0]['hp']<180;page.screenshot(path=str(out/(view+'-damaged.png')))
   if state()['phase']=='won':break
  assert state()['phase']=='won',state();page.locator('#action').click();assert state()['level']==2;assert state()['started']==started
  page.clock.fast_forward(300001);assert state()['ended'];assert page.locator('#detonate').is_disabled()
  layouts=[]
  for n in range(1,13):
   page.evaluate('(n)=>localStorage.setItem("joyi-sling-level",n)',n);page.reload();page.wait_for_function('window.SlingAudit?.().blocks.length>0');s=state();assert all(x['hp']>0 for x in s['blocks']+s['targets']);layouts.append([(round(x['x']),round(x['y']))for x in s['blocks']])
   if n==12:page.screenshot(path=str(out/(view+'-stage12.png')))
  assert len(set(json.dumps(x)for x in layouts))==12;assert not errors,errors
  results.append(dict(view=view,oldEasyShotFails=True,farBlastNoDamage=True,finiteAmmoLoss=True,oneBlastPerShot=True,aimedRepeatedShotsWin=True,retryAndNextPreserveTimer=True,capAndLayouts=True));c.close()
 b.close()
(out/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS stone armor, blast range/once, difficult but solvable shots, timer and twelve layouts on phone/tablet')
