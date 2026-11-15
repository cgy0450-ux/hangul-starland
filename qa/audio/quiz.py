import json,subprocess,io
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
INIT="""window.nativeCalls=[];const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{nativeCalls.push(u.text);return sp(u)};localStorage.setItem('joiland-audio-mode','recorded');localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:true,family:{kid:'테스트'}}));window.played=[];const A=Audio;window.Audio=function(src){const a=src===undefined?new A():new A(src);const play=a.play.bind(a);let ticket=0;a.play=function(){const id=++ticket,source=a.src;a.addEventListener('playing',()=>{if(ticket!==id||a.src!==source)return;played.push(source);setTimeout(()=>{if(ticket===id&&a.src===source&&!a.paused&&a.duration)a.currentTime=Math.max(0,a.duration-.06)},90)},{once:true});return play()};return a};"""
def snap(page,name):Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(ROOT/'docs/v13/audio'/name,quality=85)
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844});page.add_init_script(INIT)
 page.goto('http://127.0.0.1:8000/legacy.html?game=quiz');page.locator('#joy-splash').wait_for(state='hidden');page.mouse.click(5,5);page.wait_for_timeout(300);snap(page,'quiz-mobile.webp')
 for n in range(5):
  word=page.locator('.question-image').get_attribute('aria-label')
  page.locator('[data-a=read]').click();page.wait_for_timeout(250)
  page.locator('[data-a=answer-quiz]').filter(has_not_text=word).first.click();page.wait_for_timeout(250)
  page.locator('[data-a=answer-quiz]').filter(has_text=word).click();page.wait_for_timeout(850)
  page.locator('[data-a=next]').click();page.wait_for_timeout(250)
 assert not page.evaluate('nativeCalls'),page.evaluate('nativeCalls')
 words=json.loads(subprocess.check_output(['node','-e',"const s=require('fs').readFileSync('legacy.html','utf8');const a=s.indexOf('const WORDS=['),z=s.indexOf('const CONSONANTS=',a);console.log(JSON.stringify(new Function(s.slice(a,z)+';return WORDS')().map(w=>w.w)))"],cwd=ROOT,text=True))
 for word in words:
  page.evaluate('(w)=>HANGUL_QA.speakParts([w])',word);page.wait_for_timeout(220)
 variants=json.loads(subprocess.check_output(['node','-e',"const s=require('fs').readFileSync('legacy.html','utf8');const a=s.match(/const PRAISE_VARIANTS=(\\[[\\s\\S]*?\\n\\]);/)[1];console.log(JSON.stringify(eval(a).map(f=>f('친구'))))"],cwd=ROOT,text=True))
 for text in variants:
  parts=page.evaluate('(s)=>{const p=s.match(/^([^!！]+[!！])\\s*(.*)$/);return p&&p[2]?[p[1],p[2]]:[s]}',text)
  page.evaluate('(ps)=>HANGUL_QA.speakParts(ps,230,true)',parts);page.wait_for_timeout(850)
 assert not page.evaluate('nativeCalls'),page.evaluate('nativeCalls')
 assert len(page.evaluate('played'))>=45,len(page.evaluate('played'))
 result={'realQuizQuestions':5,'allVocabulary':len(words),'praiseVariants':len(variants),'nativeDeviceSpeechCalls':page.evaluate('nativeCalls'),'actualMp3Starts':len(page.evaluate('played'))}
 second=b.new_page(viewport={'width':800,'height':1280});second.add_init_script(INIT);second.goto('http://127.0.0.1:8000/legacy.html?game=quiz');second.locator('#joy-splash').wait_for(state='hidden');second.mouse.click(5,5);second.wait_for_function('played.length>=1')
 word=second.locator('.question-image').get_attribute('aria-label');second.locator('[data-a=read]').click();second.wait_for_timeout(400);second.locator('[data-a=answer-quiz]').filter(has_text=word).click();second.wait_for_timeout(1100)
 assert not second.evaluate('nativeCalls'),second.evaluate('nativeCalls');assert len(second.evaluate('played'))>=3
 snap(second,'quiz-tablet.webp');result['tabletNativeDeviceSpeechCalls']=second.evaluate('nativeCalls')
 (ROOT/'docs/v13/audio/quiz-regression.json').write_text(json.dumps(result,indent=2)+'\n');print('PASS',result);b.close()
