"""Whole-word handwriting: real pointer strokes, strict gates, stable board and viewport fit."""
import json,subprocess,re
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'docs/v13/word-writing';O.mkdir(exist_ok=True);results=[]
old=subprocess.check_output(['git','show','HEAD:legacy.html'],text=True);current=(R/'legacy.html').read_text()
pattern=r'function traceEvaluation\(points,expected\).*?(?=\nfunction tracePathD)'
assert re.search(pattern,old,re.S).group()==re.search(pattern,current,re.S).group(),'Legacy evaluator changed'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for name,w,h in [('mobile',390,844),('small',360,640),('tablet',800,1280),('landscape',1024,600)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/legacy.html?game=color');page.wait_for_function('!!window.HANGUL_QA');page.wait_for_timeout(1800)
  def pick(mode,word):
   page.evaluate("([mode,word])=>{for(let i=0;i<1000;i++){HANGUL_QA.go(mode);if(document.querySelector('.ww-room')?.dataset.word===word)return}throw Error('Requested word not drawn')}",[mode,word]);page.locator('.ww-object img').evaluate('(im)=>im.decode()')
  def fit():
   assert page.evaluate('document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth')
   for item in page.locator('.ww-room button,.ww-room a,.ww-surface').all():
    r=item.bounding_box();assert r and r['y']>=0 and r['y']+r['height']<=h+1,(name,r)
   page.mouse.wheel(0,700);page.wait_for_timeout(80);assert page.evaluate('scrollY')==0
  def send(letter,paths):
   page.evaluate('''([letter,paths])=>{const canvas=document.querySelectorAll('.ww-cell canvas')[letter],r=canvas.getBoundingClientRect();function event(type,p){canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:71,pointerType:'touch',isPrimary:true,clientX:r.left+p[0]*r.width/100,clientY:r.top+p[1]*r.height/100}))}for(const path of paths){event('pointerdown',path[0]);for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let k=1;k<=16;k++)event('pointermove',[a[0]+(b[0]-a[0])*k/16,a[1]+(b[1]-a[1])*k/16])}event('pointerup',path.at(-1))}}''',[letter,paths])
  def count():return int(page.locator('.ww-counter').inner_text().split(' / ')[0])
  pick('color','하마');fit();assert page.locator('.ww-cell').count()==2;assert page.locator('.ww-object img').get_attribute('src').endswith('hippo-belly.webp');page.screenshot(path=str(O/(name+'-hippo.png')))
  ha=page.evaluate("HANGUL_QA.glyphStrokes('하')");ma=page.evaluate("HANGUL_QA.glyphStrokes('마')");page.evaluate('window.firstBoard=document.querySelector(".ww-surface");window.firstCanvas=document.querySelector(".ww-cell canvas")')
  send(1,ma[:1]);assert count()==0 # right letter cannot skip the left one
  send(0,[[ha[0][0],[(ha[0][0][0]+ha[0][-1][0])/2,ha[0][0][1]]]]);assert count()==0 # short stroke
  # A real mouse trace through the first complete stroke.
  r=page.locator('.ww-cell canvas').first.bounding_box();a,z=ha[0][0],ha[0][-1];page.mouse.move(r['x']+a[0]*r['width']/100,r['y']+a[1]*r['height']/100);page.mouse.down();page.mouse.move(r['x']+z[0]*r['width']/100,r['y']+z[1]*r['height']/100,steps=16);page.mouse.up();assert count()==1
  page.locator('[data-ww="undo"]').click();assert count()==0
  session=c.new_cdp_session(page)
  x0,y0=r['x']+a[0]*r['width']/100,r['y']+a[1]*r['height']/100;x1,y1=r['x']+z[0]*r['width']/100,r['y']+z[1]*r['height']/100
  session.send('Input.dispatchTouchEvent',dict(type='touchStart',touchPoints=[dict(x=x0,y=y0,id=3)]))
  for k in range(1,17):session.send('Input.dispatchTouchEvent',dict(type='touchMove',touchPoints=[dict(x=x0+(x1-x0)*k/16,y=y0+(y1-y0)*k/16,id=3)]))
  session.send('Input.dispatchTouchEvent',dict(type='touchEnd',touchPoints=[]));assert count()==1
  page.locator('[data-ww="undo"]').click();assert count()==0
  send(0,ha);assert count()==len(ha);assert not page.evaluate('HANGUL_QA.view().answered');assert page.evaluate('firstBoard===document.querySelector(".ww-surface")&&firstCanvas===document.querySelector(".ww-cell canvas")');page.screenshot(path=str(O/(name+'-half-word.png')))
  assert page.locator('.ww-cell.ww-done').count()==1
  send(1,[list(reversed(ma[0]))]);assert count()==len(ha) # long backward stroke, checked against the unchanged evaluator
  page.locator('[data-ww-color]').nth(3).click();send(1,ma[:-1]);assert not page.evaluate('HANGUL_QA.view().answered');assert page.locator('.ww-room').get_attribute('data-word')=='하마'
  # A cancelled last stroke must not finish the word.
  page.evaluate('''p=>{const c=document.querySelectorAll('.ww-cell canvas')[1],r=c.getBoundingClientRect();for(const type of ['pointerdown','pointercancel'])c.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:71,pointerType:'touch',clientX:r.left+p[0]*r.width/100,clientY:r.top+p[1]*r.height/100}))}''',ma[-1][0]);assert not page.evaluate('HANGUL_QA.view().answered')
  send(1,ma[-1:]);assert page.evaluate('HANGUL_QA.view().answered');assert page.locator('.ww-room').get_attribute('data-complete')=='true';page.screenshot(path=str(O/(name+'-completed.png')));page.wait_for_function('HANGUL_QA.view().round===1');fit()
  # The normal trace game also uses the same uncluttered room; a full noun still requires every stroke.
  pick('trace','나무');fit();page.screenshot(path=str(O/(name+'-trace-word.png')));na=page.evaluate("HANGUL_QA.glyphStrokes('나')");send(0,na[:-1]);assert not page.evaluate('HANGUL_QA.view().answered');send(0,na[-1:]);assert not page.evaluate('HANGUL_QA.view().answered');send(1,page.evaluate("HANGUL_QA.glyphStrokes('무')"));assert page.evaluate('HANGUL_QA.view().answered');page.wait_for_function('HANGUL_QA.view().round===1')
  pick('color','호랑이');fit();assert page.locator('.ww-cell').count()==3
  for i,ch in enumerate('호랑이'):
   send(i,page.evaluate('(ch)=>HANGUL_QA.glyphStrokes(ch)',ch))
   if i<2:assert not page.evaluate('HANGUL_QA.view().answered')
  assert page.evaluate('HANGUL_QA.view().answered');assert not errors,errors
  results.append(dict(view=name,viewport=[w,h],fitsWithoutScroll=True,wholeWordStable=True,shortLongReverseAndOutOfOrderRejected=True,missingLastAndCancelRejected=True,undo=True,realMouseStroke=True,trustedTouchStroke=True,threeLetterWord=True,fullNounTrace=True,autoNextAfterCompleteOnly=True));c.close()
 # Offline production worker must include the new room, semantic illustration and evaluator.
 c=b.new_context(viewport={'width':390,'height':844});page=c.new_page();page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);page.goto('http://127.0.0.1:8000/legacy.html?game=color');page.wait_for_function('!!window.HANGUL_QA');page.evaluate("()=>{for(let i=0;i<1000;i++){HANGUL_QA.go('color');if(document.querySelector('.ww-room')?.dataset.word==='하마')return}throw Error('No hippo')}");page.locator('.ww-object img').evaluate('(im)=>im.decode()');assert page.locator('.ww-cell').count()==2;results.append(dict(offline=True,hippoImageDecoded=True,wordRoomLoaded=True));c.close();b.close()
(O/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS stable whole-word board, unchanged strict scoring, real mouse/touch, partial/reverse/order/cancel/undo, three-letter and full-noun trace, no scroll at four sizes, offline')
