from pathlib import Path
import json
from playwright.sync_api import sync_playwright
O=Path('docs/v13/natural-opening');O.mkdir(exist_ok=True);rows=[]
titles={'hangul':'한글 이야기 숲으로!','math':'수학 놀이를 시작해요!','english':'영어 친구들을 만나요!','science':'과학 탐험을 떠나요!','history':'옛날로 시간 여행!','coding':'순서대로 코딩 놀이!','finance':'돈과 경제를 배워요!','reading':'이야기 속으로 떠나요!','life':'건강한 하루를 만들어요!','creativity':'상상의 날개를 펼쳐요!'}
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(360,640),(390,844),(1280,800),(800,360)]:
  for sub,title in titles.items():
   c=b.new_context(viewport={'width':w,'height':h});page=c.new_page();page.goto('http://127.0.0.1:8000/journey.html?subject='+sub);page.locator('.subject-opening.ready').wait_for();assert page.locator('.opening-copy h1').inner_text()==title;page.locator('.opening-world').evaluate('(i)=>i.decode()');page.wait_for_timeout(500)
   for sel in ['.opening-copy h1','.opening-skip','.opening-letters']:
    r=page.locator(sel).bounding_box();assert r['x']>=0 and r['y']>=0 and r['x']+r['width']<=w+1 and r['y']+r['height']<=h+1,(sub,w,sel,r)
   a=page.locator('.opening-copy p').bounding_box();z=page.locator('.opening-skip').bounding_box();assert a['x']+a['width']<=z['x'] or a['y']+a['height']<=z['y'],(sub,w,a,z)
   if sub in ['finance','life']:page.screenshot(path=str(O/(sub+'-'+str(w)+'.png')))
   page.locator('.opening-skip').click();assert page.locator('.subject-opening').is_hidden();rows.append(dict(subject=sub,viewport=[w,h],title=title,bounds=True));c.close()
 c=b.new_context();page=c.new_page();page.add_init_script("window.pending=[];HTMLImageElement.prototype.decode=function(){return new Promise((resolve,reject)=>pending.push({resolve,reject}))}")
 page.goto('http://127.0.0.1:8000/journey.html?subject=history');page.wait_for_function('pending.length===1');page.locator('.opening-skip').click();page.locator('.opening-replay').click();page.wait_for_function('pending.length===2');page.evaluate('pending[0].resolve()');page.wait_for_timeout(100);assert not page.locator('.subject-opening').evaluate('(e)=>e.classList.contains("ready")');page.evaluate('pending[1].reject()');page.locator('.subject-opening.ready').wait_for();assert '그림 없이' in page.locator('.opening-copy p').inner_text();page.locator('.opening-skip').click();page.locator('.opening-replay').click();page.wait_for_function('pending.length===3');assert page.locator('.opening-world').evaluate('(i)=>i.style.visibility')=='';page.evaluate('pending[2].resolve()');page.locator('.subject-opening.ready').wait_for();assert '준비됐어요' in page.locator('.opening-copy p').inner_text();c.close()
 c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:8000/parent.html');assert page.locator('label[for=childName]').inner_text()=='학습 기록에 쓸 이름';page.evaluate("()=>{speechSynthesis.speak=u=>u.onerror()}");page.locator('#previewEnglishVoice').click();assert '재생하지 못했어요' in page.locator('#saveMessage').inner_text();c.close();b.close()
(O/'validation.json').write_text(json.dumps(dict(screens=rows,staleDecodeIgnored=True,replayRestoresFailedImage=True,truthfulFallback=True,voiceErrorFeedback=True),ensure_ascii=False,indent=2)+'\n');print('PASS 40 responsive titles, stale decode, replay recovery and voice error feedback')
