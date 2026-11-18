from pathlib import Path
import json
from playwright.sync_api import sync_playwright
O=Path('docs/v13/update-coding');O.mkdir(exist_ok=True);rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(1280,800),(360,640)]:
  c=b.new_context(viewport={'width':w,'height':h},has_touch=True);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def lesson(mode,mod=0,qi=None):
   page.goto('http://127.0.0.1:8000/journey.html?subject=coding');page.locator('.subject-opening.ready').wait_for();page.locator('.opening-skip').click()
   page.evaluate("([m,i])=>{window.voiceCalls=[];JOY_CORE.speak=t=>voiceCalls.push(t);const orig=JOY_CORE.session;JOY_CORE.session=id=>{const run=orig(id);run.questions=[{...JOY_CURRICULUM.subject('coding').modules[m].items[i],module:m}];return run}}",[mod,qi if qi is not None else (5 if mod==0 else 0)])
   item=page.locator('#modules [data-lesson]').first;item.evaluate('(e,id)=>e.dataset.lesson=id',f'coding-{mod}-{mode}');item.click()
  lesson('drag');page.locator('#visual .coding-arrow').first.wait_for();assert page.locator('#visual .coding-arrow').count()==2
  for im in page.locator('#visual .coding-arrow').all():im.evaluate('(i)=>i.decode()')
  page.screenshot(path=str(O/f'coding-drag-{w}.png'));page.locator('[data-opt="오른쪽 두 칸"]').click();assert page.locator('#next').is_visible();assert '1' in page.locator('#stars').inner_text();assert '상자를 눌러' not in page.locator('#interaction').inner_text()
  lesson('drag');btn=page.locator('[data-opt="오른쪽 두 칸"]');r=btn.bounding_box();t=page.locator('#dropTarget').bounding_box();x,y=r['x']+r['width']/2,r['y']+r['height']/2;tx,ty=t['x']+t['width']/2,t['y']+t['height']/2
  cd=c.new_cdp_session(page);cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});cd.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':tx,'y':ty}]});assert page.locator('.drag-ghost').count()==1;cd.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});assert page.locator('#next').is_visible();assert page.locator('.drag-ghost').count()==0;assert page.locator('#dropTarget').inner_text()=='오른쪽 두 칸'
  lesson('drag');r=page.locator('[data-opt="오른쪽 두 칸"]').bounding_box();page.mouse.move(r['x']+30,r['y']+20);page.mouse.down();page.mouse.move(5,5,steps=5);page.mouse.up();assert not page.locator('#next').is_visible()
  for mod in [0,2]:
   lesson('order',mod);assert not page.locator('.picture').is_visible();assert page.locator('.order-label').count()==3
   for im in page.locator('#answers img').all():im.evaluate('(i)=>i.decode()')
   if w>=900:assert len(set(round(e.bounding_box()['y'])for e in page.locator('#answers .choice-wrap').all()))==1
   page.screenshot(path=str(O/f'coding-order-{mod}-{w}.png'))
   first=page.evaluate('voiceCalls.at(-1)');wrong=next(x for x in page.locator('[data-opt]').evaluate_all('(bs)=>bs.map(b=>b.dataset.opt)')if x!=first);page.locator('[data-opt='+json.dumps(wrong,ensure_ascii=False)+']').click();assert page.locator('.order-slot.completed').count()==0;page.locator('[data-opt='+json.dumps(first,ensure_ascii=False)+']').click();assert page.locator('.order-slot.completed').count()==1
   target=page.evaluate('voiceCalls.at(-1)');page.locator('#hear').click();assert page.evaluate('voiceCalls.at(-1)')==target
   for _ in range(2):
    target=page.evaluate('voiceCalls.at(-1)');page.locator('[data-opt='+json.dumps(target,ensure_ascii=False)+']').click()
   assert page.locator('#next').is_visible();assert page.locator('.order-slot.completed').count()==3
   assert page.locator('#hear').bounding_box()['y']<h
  if w==1280:
   expected=[['손에 물 묻히기','비누로 문지르기','물로 헹구기'],['칫솔 준비하기','치아 골고루 닦기','입 헹구기'],['화분 살펴보기','알맞게 물 주기','햇빛 살펴보기'],['신발 신기','문 열기','밖으로 나가기'],['읽을 책 고르기','책 펼치기','글과 그림 읽기'],['바닥 블록 놓기','벽 쌓기','집 완성하기']]
   for i,steps in enumerate(expected):
    lesson('order',2,i);assert set(page.locator('.order-label').all_text_contents())==set(steps)
    for im in page.locator('#answers img').all():im.evaluate('(i)=>i.decode()')
    page.screenshot(path=str(O/f'procedure-{i}-tablet.png'))
    for step in steps:
     assert page.evaluate('voiceCalls.at(-1)')==step;page.locator('[data-opt='+json.dumps(step,ensure_ascii=False)+']').click()
    assert page.locator('.order-slot.completed').count()==3
  assert not errors,errors;rows.append(dict(viewport=[w,h],oneTapSubmit=True,trustedTouchDrag=True,outsideDropNoSubmit=True,exactArrowImages=True,orderMatchingArtLabels=True,currentStepReplay=True));c.close()
 # Every ordinary and repeat visit remains visible for more than three seconds after readiness.
 c=b.new_context();page=c.new_page()
 for repeat in range(2):
  page.goto('http://127.0.0.1:8000/journey.html?subject=coding');page.locator('.subject-opening.ready').wait_for();page.wait_for_timeout(3200);assert page.locator('.subject-opening').is_visible();page.wait_for_function('document.querySelector(".subject-opening").hidden')
 c.close();b.close()
(O/'coding-validation.json').write_text(json.dumps(dict(cases=rows,openingFirstRepeatOver3Seconds=True,allSixRoutinesExactOrder=True),ensure_ascii=False,indent=2)+'\n');print('PASS phone/tablet one tap, trusted touch drag, drop outside, correct sequence art/labels/replay and opening duration')
