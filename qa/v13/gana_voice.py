from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path('docs/v13/gana-voice');O.mkdir(exist_ok=True);results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for name,w,h in [('mobile',390,844),('tablet',1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("if(!localStorage.getItem('hangul-starland-v1'))localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));window.pronounced=[];window.addEventListener('joyi-letter-pronounced',e=>pronounced.push(e.detail));window.clips=[];const A=Audio;window.Audio=function(src){const a=new A(src);clips.push(a);return a}")
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.HANGUL_QA');page.wait_for_timeout(1800)
  def stroke(paths):page.evaluate('''paths=>{const c=document.querySelector('.ww-cell canvas'),r=c.getBoundingClientRect();function e(t,p){c.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:7,clientX:r.left+p[0]*r.width/100,clientY:r.top+p[1]*r.height/100}))}for(const st of paths){e('pointerdown',st[0]);for(let j=1;j<st.length;j++)for(let k=1;k<=16;k++)e('pointermove',[st[j-1][0]+(st[j][0]-st[j-1][0])*k/16,st[j-1][1]+(st[j][1]-st[j-1][1])*k/16]);e('pointerup',st.at(-1))}}''',paths)
  for i,ch in enumerate('가나다라마바사아자차카타파하'):
   assert page.locator('.ww-room').get_attribute('data-word')==ch
   paths=page.evaluate('(ch)=>HANGUL_QA.glyphStrokes(ch)',ch);stroke(paths[:-1]);assert not page.evaluate('HANGUL_QA.view().answered');stroke(paths[-1:]);assert page.evaluate('HANGUL_QA.view().answered'),(ch,page.locator('.ww-counter').inner_text(),errors,page.locator('.ww-hint').inner_text())
   if i==0:page.screenshot(path=str(O/(name+'-gana.png')))
   if i<13:page.wait_for_function('(i)=>HANGUL_QA.view().round===i',arg=i+1)
  page.wait_for_function("document.body.textContent.includes('가나다 글씨쓰기 완성!')");assert page.evaluate('pronounced.length')==0
  # Actual native MP3 ended events drive exactly three starts, never a fourth.
  page.evaluate("localStorage.setItem('joyi-gana-progress','0')");page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.HANGUL_QA');page.evaluate("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:true}))");page.reload();page.wait_for_function('!!window.HANGUL_QA');page.wait_for_timeout(1800);paths=page.evaluate("HANGUL_QA.glyphStrokes('가')");stroke(paths)
  for n in range(1,4):
   page.wait_for_function('(n)=>pronounced.length===n',arg=n);assert page.evaluate('pronounced.at(-1).char')=='가';assert page.locator('.ww-room').get_attribute('data-word')=='가';page.wait_for_function('clips.some(a=>!a.paused&&a.currentTime>.02)');page.evaluate('()=>{const a=clips.findLast(a=>!a.paused);a.currentTime=a.duration-.05}')
  page.wait_for_function('HANGUL_QA.view().answered');page.locator('.ww-head button').click()
  for n in range(4,7):
   page.wait_for_function('(n)=>pronounced.length===n',arg=n);assert page.locator('.ww-room').get_attribute('data-word')=='가';page.wait_for_function('clips.some(a=>!a.paused&&a.currentTime>.02)');page.evaluate('()=>{const a=clips.findLast(a=>!a.paused);a.currentTime=a.duration-.05}')
  page.wait_for_function("document.querySelector('.ww-room')?.dataset.word==='나'");assert page.evaluate('pronounced.length')==6
  page.evaluate("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana&practice=short');page.wait_for_function('!!window.HANGUL_QA');assert page.locator('.ww-room').get_attribute('data-word')=='나';assert '1 / 5' in page.locator('.ww-meta').inner_text();stroke(page.evaluate("HANGUL_QA.glyphStrokes('나')"));page.wait_for_function('HANGUL_QA.view().round===1');page.reload();page.wait_for_function('!!window.HANGUL_QA');assert page.locator('.ww-room').get_attribute('data-word')=='다'
  assert not errors,errors;results.append(dict(view=name,all14Strict=True,mutedNoSpeech=True,actualThreeRecordedStarts=True,onlyAfterFullGlyph=True,replayTripleBeforeAdvance=True,shortModeResume=True));c.close()
 b.close()
(O/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS all14 strict glyphs, ordered progress, mute, actual triple narration then next on phone/tablet')
