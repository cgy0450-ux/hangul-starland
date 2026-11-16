"""Render every curriculum question at phone/tablet size; preserve actual answer flow."""
import io,json,os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/v13/scene-audit';OUT.mkdir(exist_ok=True);results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("Math.random=()=>.999999;localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
  page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for subject in os.environ.get('SCENE_SUBJECTS','hangul,math,english,science,history,coding,finance,reading,life,creativity').split(','):
   for stage in range(4):
    page.goto('http://127.0.0.1:8000/journey.html?subject='+subject)
    data=page.evaluate("([s,n])=>{localStorage.setItem('joiland-stage-'+s,n);const mod=JOY_CURRICULUM.subject(s).modules[n],old=JOY_CORE.session;JOY_CORE.session=id=>{const x=old(id);x.questions=mod.items.map(q=>({...q,choiceOptions:[q.answer,'다른 것','잘 모르겠어요']}));return x};return mod.items}",[subject,stage])
    # Catalog initially shows stage zero; request the stage through its actual lesson ID.
    page.evaluate("([s,n])=>{document.querySelector('#modules [data-lesson]').dataset.lesson=s+'-'+n+'-explore'}",[subject,stage])
    page.locator('#modules [data-lesson]').first.click()
    thumbs=[]
    for i in range(6):
     question=page.locator('#question');question.wait_for();page.locator('#visual img').evaluate_all('(xs)=>Promise.all(xs.map(x=>x.decode()))')
     row=data[i];expected=page.evaluate('(r)=>JoyiSceneCatalog.find(r.s,r.a,r.v)',{'s':subject,'a':row['answer'],'v':row['visual']})
     if expected:
      image=page.locator('#visual .learning-scene');assert image.get_attribute('src')==expected;box=image.bounding_box();assert box['width']>=250 and box['height']>=130,box
     assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');assert page.locator('#ready').is_visible()
     shot=Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB');shot.thumbnail((195,422));thumbs.append(shot)
     if subject=='history' and row['answer'] in ['절구','갓','거북선','제기차기']:Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(OUT/(view+'-'+row['answer']+'.webp'),quality=88)
     results.append({'view':view,'subject':subject,'stage':stage,'index':i,'answer':row['answer'],'scene':expected,'render':'PASS'})
     page.locator('#ready').click();page.locator('#answers [data-opt]').first.evaluate('(b)=>b.click()');assert page.locator('#next').is_visible()
     if i<5:page.locator('#next').click()
    canvas=Image.new('RGB',(195*6,422),'#fff');[canvas.paste(im,(i*195,0))for i,im in enumerate(thumbs)];canvas.save(OUT/(view+'-'+subject+'-'+str(stage)+'.webp'),quality=82)
  assert not errors,errors;c.close()
 b.close()
(OUT/('runtime-partial.json' if os.environ.get('SCENE_SUBJECTS') else 'runtime.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS',len(results),'actual question/viewport render and answer-flow cases')
