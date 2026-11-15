"""Actual interaction checks for renewed artwork; never lower stroke acceptance thresholds."""
import json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];BASE='http://127.0.0.1:8000';checks=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
 page=c.new_page();page.goto(BASE+'/mini-games.html?game=colors')
 # The target is visible actual artwork; match the color that its semantic token represents.
 def target_color():
  token=page.locator('.sort-item .joyi-art-label').inner_text()
  return 'red' if token in ['🍎','🍓','🎈'] else 'blue' if token in ['💎','🦋','🔵'] else 'yellow'
 right=target_color();wrong=next(x for x in ['red','blue','yellow'] if x!=right);before=page.locator('#round').inner_text();page.locator('.basket.'+wrong).click();assert '다른 색깔' in page.locator('#message').inner_text();assert page.locator('#round').inner_text()==before
 for n in range(5):
  page.locator('.basket.'+target_color()).click();page.wait_for_timeout(760)
 page.locator('.jwg-sheet canvas').wait_for();assert page.locator('.jwg-word').inner_text()=='색'
 def trace(strokes,active_page=None):
  (active_page or page).evaluate('''(strokes)=>{const c=document.querySelector('.jwg-sheet canvas'),r=c.getBoundingClientRect();function e(type,p){c.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:31,isPrimary:true,pointerType:'touch',clientX:r.left+p[0]*r.width/300,clientY:r.top+p[1]*r.height/300}))}for(const path of strokes){e('pointerdown',path[0]);for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let k=1;k<=16;k++)e('pointermove',[a[0]+(b[0]-a[0])*k/16,a[1]+(b[1]-a[1])*k/16])}e('pointerup',path.at(-1))}}''',strokes)
 guide=page.evaluate("JoyiHangulGuide.pathsForHangul('색')")
 trace(guide[:1]);page.wait_for_timeout(650);assert page.locator('.jwg-sheet canvas').count()==1;assert '1단계' in page.locator('#stage').inner_text()
 trace(guide[1:-1]);page.wait_for_timeout(650);assert page.locator('.jwg-sheet canvas').count()==1;assert '1단계' in page.locator('#stage').inner_text()
 trace(guide[-1:]);page.wait_for_timeout(700);assert page.locator('.jwg-shade').count()==0;assert '2단계' in page.locator('#stage').inner_text();checks+=['wrong color does not advance','five correct rounds open required writing','partial strokes blocked','missing final stroke blocked','all strokes advance to next stage']
 page.goto(BASE+'/mini-games.html?game=differences');left=page.locator('.diffpanel').nth(0).locator('.joyi-art-label').all_text_contents();right=page.locator('.diffpanel').nth(1).locator('.joyi-art-label').all_text_contents();different=[i for i,(a,z) in enumerate(zip(left,right)) if a!=z];assert len(left)==9 and len(right)==9 and len(different)==1
 correct=different[0];wrong=next(i for i in range(9) if i!=correct);page.locator('.diffpanel').nth(0).locator('.diff-target').nth(wrong).click();assert '똑같' in page.locator('#message').inner_text();page.locator('.diffpanel').nth(1).locator('.diff-target').nth(correct).click();page.wait_for_timeout(760);assert '2 / 5' in page.locator('#round').inner_text();checks.append('nine paired objects, one difference, wrong and correct hotspot behavior')
 page.goto(BASE+'/adventure.html?game=space');prompt=page.locator('#question').inner_text();labels=page.locator('#tiles button').evaluate_all('(xs)=>xs.map(x=>x.getAttribute("aria-label"))');assert len(labels)==6;paths=page.locator('#tiles img').evaluate_all('(xs)=>xs.map(x=>x.getAttribute("src"))');assert len(set(paths))==6;checks.append('six distinguishable space target artworks')
 page.goto(BASE+'/mini-games.html?game=mole');page.locator('.hole.active').click();page.wait_for_timeout(760);assert '2 / 5' in page.locator('#round').inner_text();checks.append('actual mole tap advances one question')
 page.goto(BASE+'/adventure.html?game=dino');page.locator('#tiles button').first.click();assert '발견' in page.locator('#question').inner_text();assert 'sprite.dinosaur' in page.locator('#scene img').get_attribute('src');checks.append('egg tap actually reveals named dinosaur raster')
 page.goto(BASE+'/adventure.html?game=animal');page.locator('#tiles button[aria-label="🍌"]').click();assert '다른' in page.locator('#feedback').inner_text();page.locator('#tiles button[aria-label="🥕"]').click();page.wait_for_timeout(800);assert '2 / 5' in page.locator('#round').inner_text();checks.append('animal care wrong food blocked and correct carrot advances')
 # Drive the unchanged frame loop with a deterministic RAF source; 20 steps per simulated second.
 c2=b.new_context(viewport={'width':390,'height':844});c2.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));window.__time=0;window.__frames=new Map();window.__id=0;window.requestAnimationFrame=fn=>{const id=++window.__id;window.__frames.set(id,fn);return id};window.cancelAnimationFrame=id=>window.__frames.delete(id);window.__runFrames=n=>{for(let i=0;i<n;i++){window.__time+=50;const frames=[...window.__frames.values()];window.__frames.clear();for(const fn of frames)fn(window.__time)}}")
 fire=c2.new_page();fire.goto(BASE+'/firetruck-rescue.html');fire.locator('#start').click()
 for n in range(2):
  fire.locator('#spray').dispatch_event('pointerdown',{'pointerId':8,'isPrimary':True,'pointerType':'touch'})
  fire.evaluate('__runFrames(42)');assert fire.locator('#waterFill').evaluate('(x)=>parseFloat(x.style.width)')<99
  fire.locator('#spray').dispatch_event('pointerup',{'pointerId':8,'isPrimary':True,'pointerType':'touch'});fire.locator('#hydrant').click();assert fire.locator('#waterFill').evaluate('(x)=>parseFloat(x.style.width)')==100
 checks.append('finite water drains and hydrant refills instantly twice')
 fire.evaluate('__runFrames(6005)');assert '5분' in fire.locator('#modalTitle').inner_text();assert 'hidden' not in (fire.locator('#overlay').get_attribute('class') or '');checks.append('unchanged frame loop ends at five simulated minutes')
 fire2=c2.new_page();fire2.goto(BASE+'/firetruck-rescue.html');fire2.locator('#start').click();canvas=fire2.locator('#game');stage=json.loads(subprocess.check_output(['node','-e',r"const fs=require('fs');const s=fs.readFileSync('firetruck-rescue.html','utf8');const m=s.match(/const STAGES=\[([\s\S]*?)\n\];/);if(!m)throw Error('missing stage data');process.stdout.write(JSON.stringify(new Function('return ['+m[1]+']')()[0]));"],cwd=ROOT,text=True))
 def touch(type,x,y):
  r=canvas.bounding_box();canvas.dispatch_event(type,{'pointerId':51,'isPrimary':True,'pointerType':'touch','clientX':r['x']+x*r['width']/400,'clientY':r['y']+y*r['height']/570})
 building=stage['buildings'][0];fx=building['x']+building['w']*.5;fy=building['y']+105
 touch('pointerdown',fx,fy);touch('pointerup',fx,fy);assert fire2.locator('.jwg-shade').count()==0
 for x,y in stage['flames']:
  fire2.locator('#hydrant').click();touch('pointerdown',x,y);fire2.evaluate('__runFrames(62)');touch('pointerup',x,y)
 assert fire2.locator('#progress').evaluate('(x)=>parseFloat(x.style.width)')==100
 assert fire2.locator('.jwg-shade').count()==0;touch('pointerdown',fx,fy);touch('pointerup',fx,fy);fire2.locator('.jwg-sheet canvas').wait_for();assert fire2.locator('.jwg-word').inner_text()=='소방차'
 for ch in '소방차':
  guide=fire2.evaluate('(ch)=>JoyiHangulGuide.pathsForHangul(ch)',ch);trace(guide,fire2);fire2.wait_for_timeout(620)
 assert fire2.locator('.jwg-shade').count()==0;assert fire2.evaluate("localStorage.getItem('joiland-firetruck-saved')")=='1';assert '구조 성공' in fire2.locator('#modalTitle').inner_text();checks.append('animal cannot be rescued before extinguishing; tap after all fires requires complete 소방차 writing before saving rescue')
 b.close()
(ROOT/'docs/v13/gameplay-results.json').write_text(json.dumps({'passed':checks,'limitations':['Synthetic pointer/frame input; real touch-device and Korean voice listening still require device review','Not a full completion of every game']},ensure_ascii=False,indent=2)+'\n');print('PASS',len(checks),json.dumps(checks,ensure_ascii=False))
