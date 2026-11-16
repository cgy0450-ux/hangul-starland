"""Visit every classic bank question through the production renderer and answer handler."""
import io,json,os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];out=R/'docs/v13/scene-audit';rows=json.loads((out/'classic-questions.json').read_text());results=[];suffix='-targeted' if os.environ.get('CLASSIC_GAME') else ''
if suffix:rows=[q for q in rows if q['game']==int(os.environ['CLASSIC_GAME'])]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def intercept(route):
   response=route.fetch();body=response.text().replace('var el=id=>',"window.JoyiAcademyTest=(q,g)=>{selected=g;deck=[q];round=0;el('menu-screen').hidden=true;el('game').classList.add('active');render()};var el=id=>");route.fulfill(response=response,body=body)
  page.route('**/academy.html*',intercept)
  for subject in os.environ.get('CLASSIC_SUBJECTS','math,science,english,history,coding').split(','):
   page.goto('http://127.0.0.1:8000/academy.html?subject='+subject)
   thumbs=[];print(view,subject,flush=True)
   for q in [r for r in rows if r['subject']==subject]:
    page.evaluate('([q,g])=>JoyiAcademyTest(q,g)',[q,q['game']]);page.wait_for_timeout(35)
    page.locator('#game img').evaluate_all('(xs)=>Promise.all(xs.map(x=>x.decode()))')
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),q
    assert page.locator('#prompt').inner_text()==q['ask']
    residual=page.locator('#visual').evaluate("el=>[...el.querySelectorAll('.visual-word')].map(x=>x.textContent).filter(t=>/\\p{Extended_Pictographic}/u.test(t))")
    assert not residual,(q,residual)
    if not any(t['game']==q['game']for t in results if t['view']==view and t['subject']==subject):
     im=Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB');im.thumbnail((195,500));thumbs.append(im)
    index=q['options'].index(q['answer']);page.locator('#choices [data-answer]').nth(index).click();assert page.locator('#next').is_visible(),q
    results.append(dict(view=view,subject=subject,game=q['game'],answer=q['answer'],result='PASS'))
   contact=Image.new('RGB',(195*len(thumbs),500),'white');[contact.paste(im,(i*195,0))for i,im in enumerate(thumbs)];contact.save(out/(view+'-classic-'+subject+suffix+'.webp'),quality=82)
  assert not errors,errors;c.close()
 b.close()
(out/('classic-runtime'+suffix+'.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS',len(results),'classic actual renders and correct-answer handlers')
