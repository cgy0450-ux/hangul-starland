import json,collections
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=True);c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();page.goto('http://127.0.0.1:8000/mazes.html');page.locator('[data-index="0"]').click();s=page.evaluate('JoyiMaze.snapshot()');n=s['n'];r=page.locator('#board').evaluate('(e)=>{const r=e.getBoundingClientRect();return{x:r.x+e.clientLeft,y:r.y+e.clientTop,w:e.clientWidth,h:e.clientHeight}}');prev={0:None};q=collections.deque([0])
  while q:
   v=q.popleft()
   for d,wall in enumerate(s['cells'][v]):
    to=v+[-n,1,n,-1][d]
    if not wall and to not in prev:prev[to]=v;q.append(to)
  path=[];v=n*n-1
  while v is not None:path.append(v);v=prev[v]
  path.reverse();session=c.new_cdp_session(page)
  def touch(kind,cell):
   pts=[]if kind=='touchEnd'else[{'x':r['x']+(cell%n+.5)*r['w']/n,'y':r['y']+(cell//n+.5)*r['h']/n}];session.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':pts})
  touch('touchStart',0);mid=len(path)//2
  for v in path[1:mid]:touch('touchMove',v)
  touch('touchEnd',0);assert not page.evaluate('JoyiMaze.snapshot().solved');touch('touchStart',path[mid-1])
  for v in path[mid:]:touch('touchMove',v)
  touch('touchEnd',0);assert page.evaluate('JoyiMaze.snapshot().solved');results.append({'viewport':[w,h],'nativeTouchContinuousStrokeAndResume':'PASS'});c.close()
 b.close()
(ROOT/'docs/v13/learning-refresh/touch-results.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS real touchStart/move/end drawing and resume in phone/tablet')
