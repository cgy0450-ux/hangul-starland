from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re
O=Path('docs/v13/full-word-fix');O.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();page.goto('http://127.0.0.1:8000/legacy.html?game=trace');page.wait_for_function('!!window.HANGUL_QA');page.wait_for_timeout(1800)
  for word in ['라디오','우유','자동차','기차']:
   page.evaluate("word=>{for(let i=0;i<1000;i++){HANGUL_QA.go('trace');if(document.querySelector('.ww-room')?.dataset.word===word)return}throw Error(word)}",word)
   page.locator('.ww-object img').evaluate('(im)=>im.decode()');assert page.locator('.ww-cell').count()==len(word);assert page.locator('.ww-head h2').inner_text()==word
   r=page.locator('.ww-object img').bounding_box();assert r['width']>100 and r['height']>100,r
   page.screenshot(path=str(O/(view+'-'+word+'.png')))
   for i,ch in enumerate(word):
    paths=page.evaluate('(ch)=>HANGUL_QA.glyphStrokes(ch)',ch)
    page.evaluate('''([i,paths])=>{const c=document.querySelectorAll('.ww-cell canvas')[i],r=c.getBoundingClientRect();function e(t,p){c.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:31,clientX:r.left+p[0]*r.width/100,clientY:r.top+p[1]*r.height/100}))}for(const st of paths){e('pointerdown',st[0]);for(let j=1;j<st.length;j++)for(let k=1;k<=16;k++)e('pointermove',[st[j-1][0]+(st[j][0]-st[j-1][0])*k/16,st[j-1][1]+(st[j][1]-st[j-1][1])*k/16]);e('pointerup',st.at(-1))}}''',[i,paths])
    assert page.evaluate('HANGUL_QA.view().answered')==(i==len(word)-1)
   page.wait_for_function('HANGUL_QA.view().round===1');results.append(dict(view=view,word=word,imageDecoded=True,allLettersRequired=True))
  art=json.loads(re.search(r'const writingArt=(.*?);',Path('legacy.html').read_text()).group(1));page.evaluate('async art=>{for(const src of Object.values(art)){const im=new Image();im.src=src;await im.decode();if(!im.naturalWidth)throw Error(src)}}',art)
  # Every selectable first question must be a full noun with a decodable visible illustration.
  seen=set()
  for _ in range(100):
   page.evaluate("HANGUL_QA.go('trace')");word=page.locator('.ww-room').get_attribute('data-word');assert len(word)>=2;page.locator('.ww-object img').evaluate('(im)=>im.decode()');seen.add(word)
  results.append(dict(view=view,auditedWords=sorted(seen)));c.close()
 b.close()
(O/'validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS full-word completion for radio/milk/car/train and whole-pool image decode on phone/tablet')
