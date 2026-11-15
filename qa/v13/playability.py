"""User-reported regressions: visible solvable puzzles, exact cue art, optional writing and real selected cars."""
import json,io,subprocess
from pathlib import Path
from datetime import datetime,timezone,timedelta
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];BASE='http://127.0.0.1:8000';out=ROOT/'docs/v13/fixes/verified';out.mkdir(parents=True,exist_ok=True);checks=[]
def snap(page,file):Image.open(io.BytesIO(page.screenshot(full_page=True,animations='disabled'))).convert('RGB').save(out/file,quality=84)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 # Verify all word-quiz semantic tokens have actual art, not merely today's five sampled words.
 words=json.loads(subprocess.check_output(['node','-e',r"const fs=require('fs');const s=fs.readFileSync('legacy.html','utf8');const a=s.indexOf('const WORDS=['),z=s.indexOf('const CONSONANTS=',a);process.stdout.write(JSON.stringify(new Function(s.slice(a,z)+';return WORDS')()))"],cwd=ROOT,text=True));expected={w['w']:w['e'] for w in words};seen=set()
 for day in range(40):
  c=browser.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();page.clock.set_fixed_time(datetime(2026,11,15,tzinfo=timezone.utc)+timedelta(days=day));page.goto(BASE+'/legacy.html?game=quiz');page.locator('#joy-splash').wait_for(state='hidden',timeout=5000)
  for n in range(5):
   question=page.locator('.question-image');image=question.locator('img');image.wait_for();image.evaluate('(i)=>i.decode()');word=question.get_attribute('aria-label');token=expected[word];asset=page.evaluate('(t)=>JoyiArt.MAP[t]',token);assert asset;assert image.get_attribute('src').endswith('sprite.'+asset+'.webp'),word;seen.add(word)
   if day==0 and n==0:snap(page,'quiz-mobile.webp')
   page.locator('[data-a="answer-quiz"]').filter(has_text=word).click();page.locator('[data-a="next"]').click()
  c.close()
  if len(seen)==len(words):break
 assert len(seen)==len(words),(len(seen),len(words));checks.append('all '+str(len(seen))+' word-quiz vocabulary items actually rendered as matching decoded raster artwork')
 for label,w,h in [('narrow',360,800),('mobile',390,844),('tablet',800,1280),('landscape',1280,800)]:
  c=browser.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));localStorage.setItem('joiland-stage-writing-enabled','false')");page=c.new_page();page.goto(BASE+'/mini-games.html?game=differences')
  for n in range(15):
   page.locator('.diff-target img').evaluate_all('(xs)=>Promise.all(xs.map(i=>i.decode()))');panels=page.locator('.diffpanel');left=panels.nth(0).locator('img').evaluate_all('(xs)=>xs.map(i=>i.src)');right=panels.nth(1).locator('img').evaluate_all('(xs)=>xs.map(i=>i.src)');slots=[i for i,(a,b) in enumerate(zip(left,right)) if a!=b];assert len(left)==9 and len(right)==9 and len(slots)==1
   reachable=page.locator('.diffpanel').evaluate_all('''ps=>ps.every(p=>[...p.querySelectorAll('.diff-target')].every(b=>{const r=b.getBoundingClientRect(),q=p.getBoundingClientRect();return getComputedStyle(b).position==='absolute'&&r.left>=q.left&&r.right<=q.right&&r.top>=q.top&&r.bottom<=q.bottom&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===b}))''');assert reachable,(label,n)
   if n==0:snap(page,'difference-'+label+'.webp')
   page.locator('.diffpanel').nth(1).locator('.diff-target').nth(slots[0]).click();page.wait_for_timeout(760)
  assert page.locator('#ending').evaluate('(e)=>e.classList.contains("active")');checks.append(label+': all 15 different-picture rounds have exactly one visible, reachable difference and finish without a writing gate when disabled')
  page.goto(BASE+'/mini-games.html?game=hidden');boxes=page.locator('.hidden-object').evaluate_all('''xs=>xs.map(b=>{const r=b.getBoundingClientRect(),p=b.parentElement.getBoundingClientRect();return{width:r.width,inside:r.left>=p.left&&r.right<=p.right&&r.top>=p.top&&r.bottom<=p.bottom}})''');assert len(boxes)==12 and all(x['width']>=62 and x['inside'] for x in boxes);snap(page,'hidden-'+label+'.webp')
  page.goto(BASE+'/adventure.html?game=space')
  for n in range(15):
   ref=page.locator('#scene');target=ref.get_attribute('data-target');image=ref.locator('img');image.evaluate('(i)=>i.decode()');answer=page.locator('[data-choice="'+target+'"]');assert answer.locator('img').get_attribute('src')==image.get_attribute('src');assert page.evaluate('(t)=>JoyiArt.NAME[t]',target) in page.locator('#question').inner_text()
   if n==0:snap(page,'space-'+label+'.webp')
   answer.click();page.wait_for_timeout(810)
  assert page.locator('#ending').evaluate('(e)=>e.classList.contains("active")');checks.append(label+': all 15 space cues match the named target and the actual answer image')
  page.goto(BASE+'/adventure.html?game=dino');assert page.locator('#tiles button').count()==0;page.locator('.dino-hatch').click();target=page.locator('#scene').get_attribute('data-target');assert page.locator('#tiles button').count()==6
  wrong_token=page.locator('[data-choice]').evaluate_all('(xs)=>xs.map(x=>x.dataset.choice)');wrong_token=next(x for x in wrong_token if x!=target);page.locator('[data-choice="'+wrong_token+'"]').click();assert '1 / 5' in page.locator('#round').inner_text();snap(page,'dino-'+label+'.webp');page.locator('[data-choice="'+target+'"]').click();page.wait_for_timeout(1550);assert '2 / 5' in page.locator('#round').inner_text();assert page.locator('.dino-hatch').count()==1;checks.append(label+': hatch first, see dinosaur, wrong match blocked, correct match advances')
  c.close()
 # Setting is stored and changes gates only; strict stroke tests remain in gameplay.py.
 c=browser.new_context();page=c.new_page();page.goto(BASE+'/requests.html');toggle=page.locator('[data-stage-writing]');assert toggle.is_checked();toggle.uncheck();page.goto(BASE+'/mini-games.html?game=colors');assert not page.locator('[data-stage-writing]').is_checked();page.evaluate("window.offAdvanced=false;JoyiWordGate.start('두',()=>window.offAdvanced=true)");page.wait_for_timeout(30);assert page.evaluate('window.offAdvanced') and page.locator('.jwg-shade').count()==0;page.locator('[data-stage-writing]').check();page.evaluate("JoyiWordGate.start('두',()=>window.onAdvanced=true)");assert page.locator('.jwg-shade').count()==1;assert not page.evaluate('!!window.onAdvanced');checks.append('writing toggle persists across pages; disabled skips stage exercise; re-enabled requires actual complete writing')
 c.close()
 for route in ['car-collect.html','car-dodge.html']:
  for vehicle in ['police','fire','ambulance','convertible']:
   c=browser.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));window.drawn=[];const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img,...args){if(img.src)window.drawn.push({src:img.src,args});return original.call(this,img,...args)}");page=c.new_page();page.goto(BASE+'/'+route);page.locator('[data-vehicle="'+vehicle+'"]').click();assert page.evaluate("localStorage.getItem('joiland-drive-vehicle')")==vehicle;assert page.locator('#start').evaluate('(b)=>{const r=b.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b}');snap(page,route+'-'+vehicle+'-choice.webp');page.locator('#start').click();page.wait_for_timeout(500);drawn=page.evaluate('drawn');match=[x for x in drawn if x['src'].endswith('vehicle-top.'+vehicle+'.webp')];assert match and match[-1]['args'][-2]>65 and match[-1]['args'][-1]>100;assert page.evaluate('JoyiVehicles.metrics(340).item')>=68;snap(page,route+'-'+vehicle+'-running.webp');page.goto(BASE+'/'+route);assert page.locator('[data-vehicle="'+vehicle+'"]').get_attribute('aria-pressed')=='true';c.close()
  checks.append(route+': all four free vehicle choices persist and draw the matching enlarged actual sprite, not only a selector thumbnail')
 browser.close()
(out/'results.json').write_text(json.dumps({'passed':checks,'wordCoverage':sorted(seen)},ensure_ascii=False,indent=2)+'\n');print('PASS',len(checks),'playability scenarios; word coverage',len(seen))
