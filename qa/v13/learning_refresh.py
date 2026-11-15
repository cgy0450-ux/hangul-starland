import io,json,collections
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/v13/learning-refresh/behavior';OUT.mkdir(parents=True,exist_ok=True);checks=[]
def snap(page,name):Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(OUT/name,quality=85)
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for label,w,h in [('narrow',360,800),('mobile',390,844),('tablet',800,1280),('landscape',1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8000/legacy.html?game=learn');page.locator('#joy-splash').wait_for(state='hidden');assert page.locator('.screenhead').bounding_box()['y']<35;assert page.locator('.letter').count()==14;assert page.locator('.detail-ex button').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")===e}');page.locator('[data-a=letter]').nth(1).click();assert page.locator('.detail-glyph').inner_text()=='ㄴ';snap(page,label+'-learn.webp')
  for mode,selector in [('space','.letter-planet'),('safari','.animal-big img')]:
   page.goto('http://127.0.0.1:8000/legacy.html?game='+mode);page.locator('#joy-splash').wait_for(state='hidden');assert page.locator(selector).count()==3;assert page.locator(selector).evaluate_all('(xs)=>xs.every(i=>i.complete&&i.naturalWidth>0)');assert page.locator('.screenhead').bounding_box()['y']<35;snap(page,label+'-'+mode+'.webp')
  page.goto('http://127.0.0.1:8000/writing.html?mode=english');assert page.locator('.pick.word').count()==12;assert page.locator('.pick.word').filter(has_text='CAT').count()==0;assert page.locator('.pick.word').nth(0).locator('img').get_attribute('src').endswith('sprite.cat.webp');assert page.locator('.pick.word').nth(11).locator('img').count()==2;page.locator('[data-i="2"]').click();assert page.locator('#target').inner_text()=='c';assert page.locator('#practice').is_visible();checks.append(label+': top-aligned learning, decoded illustrated games, picture CAT selects lowercase c')
  page.goto('http://127.0.0.1:8000/mazes.html')
  for level in range(20):
   if level:page.locator('#back').click()
   page.locator('[data-index="'+str(level)+'"]').click();state=page.evaluate('JoyiMaze.snapshot()');n=state['n'];cells=state['cells'];r=page.locator('#board').evaluate('(e)=>{const r=e.getBoundingClientRect();return{x:r.x+e.clientLeft,y:r.y+e.clientTop,w:e.clientWidth,h:e.clientHeight}}')
   def point(x,y):return(r['x']+x*r['w']/n,r['y']+y*r['h']/n)
   sx,sy=point(.5,.5);page.mouse.move(sx,sy);page.mouse.down();x,y=point(.68,.61);page.mouse.move(x,y);tip=page.evaluate('JoyiMaze.snapshot().ink.at(-1)');assert abs(tip[0]-.68)<.03 and abs(tip[1]-.61)<.03;page.mouse.up()
   page.mouse.move(*point(n-.5,n-.5));page.mouse.down();page.mouse.up();assert page.evaluate('JoyiMaze.snapshot().pos')==0
   page.mouse.move(*point(*tip));page.mouse.down();page.mouse.move(*point(.5,.5));page.mouse.up()
   # Every closed wall adjacent to start blocks a long stroke and never teleports.
   for d,wall in enumerate(cells[0]):
    if wall:
     dx,dy=[(0,-1),(1,0),(0,1),(-1,0)][d];page.mouse.move(*point(.5,.5));page.mouse.down();page.mouse.move(*point(.5+dx*1.6,.5+dy*1.6));page.mouse.up();assert page.evaluate('JoyiMaze.snapshot().pos')==0;page.locator('#again').click();break
   prev={0:None};q=collections.deque([0])
   while q:
    cell=q.popleft()
    for d,wall in enumerate(cells[cell]):
     to=cell+[-n,1,n,-1][d]
     if not wall and to not in prev:prev[to]=cell;q.append(to)
   path=[];node=n*n-1
   while node is not None:path.append(node);node=prev[node]
   path.reverse()
   closed=next(((k,d)for k,cell in enumerate(path)for d,wall in enumerate(cells[cell])if wall and ((d==0 and cell//n>0)or(d==1 and cell%n<n-1)or(d==2 and cell//n<n-1)or(d==3 and cell%n>0))),None)
   if closed:
    k,d=closed;page.mouse.move(*point(.5,.5));page.mouse.down()
    for cell in path[1:k+1]:page.mouse.move(*point(cell%n+.5,cell//n+.5))
    cell=path[k];dx,dy=[(0,-1),(1,0),(0,1),(-1,0)][d];page.mouse.move(*point(cell%n+.5+dx,cell//n+.5+dy));page.mouse.up();assert page.evaluate('JoyiMaze.snapshot().pos')==cell;page.locator('#again').click()
   page.mouse.move(*point(.5,.5));page.mouse.down()
   for cell in path[1:]:page.mouse.move(*point(cell%n+.5,cell//n+.5))
   page.mouse.up();assert page.evaluate('JoyiMaze.snapshot().solved'),(label,level,r,page.locator('#board').bounding_box(),page.evaluate('JoyiMaze.snapshot()'));assert level in page.evaluate("JSON.parse(localStorage.getItem('joiland-maze-done'))");assert page.locator('.maze-goal').evaluate('(i)=>i.complete&&i.naturalWidth>0'),level
   if level in [0,19]:snap(page,label+'-maze-'+str(level)+'.webp')
  assert not errors,errors;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');checks.append(label+': all 20 mazes continuous single-stroke completion, exact within-cell ink, wall/teleport blocking, progress persisted');c.close()
 b.close()
(OUT/'results.json').write_text(json.dumps({'passed':checks},ensure_ascii=False,indent=2)+'\n');print('PASS',len(checks),'learning/maze scenarios; 80 complete maze paths')
