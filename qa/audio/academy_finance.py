"""Exercise every classic academy and finance game's actual Korean speech routes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
INIT="""
localStorage.setItem('joiland-audio-mode','device');localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:true}));
window.nativeKorean=[];window.nativeEnglish=[];window.recordedMissing=[];window.recordedStarts=[];
const nativeSpeak=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{(/^ko/i.test(u.lang||'ko-KR')?nativeKorean:nativeEnglish).push(u.text);return nativeSpeak(u)};
window.addEventListener('joyi-recorded-audio-error',e=>{if(e.detail.reason==='missing')recordedMissing.push(e.detail.text)});
const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);const play=a.play.bind(a);a.play=function(){const result=play();result.then(()=>recordedStarts.push(a.src)).catch(()=>{});return result};return a};
"""
checks=[];all_missing=[];all_native_korean=[];recorded_starts=0;native_english=0
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844});context.add_init_script(INIT);page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for subject in ['math','science','english','history','coding']:
  for game in range(10):
   page.goto(f'http://127.0.0.1:8000/academy.html?subject={subject}&game={game}');page.wait_for_timeout(35)
   if page.locator('#game.active').count()==0:continue
   page.locator('#listen').click()
   for button in page.locator('[data-hear]').all():button.evaluate('(b)=>b.click()')
   if subject=='history' and page.locator('#learn').is_visible():page.locator('#learn').click()
   for button in page.locator('[data-answer]').all():
    if page.locator('#next').is_visible():break
    button.evaluate('(b)=>b.click()')
   snapshot=page.evaluate("()=>{const x={missing:[...recordedMissing],korean:[...nativeKorean],starts:recordedStarts.length,english:nativeEnglish.length};recordedMissing.length=nativeKorean.length=recordedStarts.length=nativeEnglish.length=0;return x}")
   all_missing+=snapshot['missing'];all_native_korean+=snapshot['korean'];recorded_starts+=snapshot['starts'];native_english+=snapshot['english']
   checks.append(subject+':'+str(game))
 for game in range(10):
  page.goto(f'http://127.0.0.1:8000/finance.html?game={game}');page.wait_for_timeout(35);page.locator('#listen').click()
  for button in page.locator('[data-hear]').all():button.evaluate('(b)=>b.click()')
  snapshot=page.evaluate("()=>({missing:[...recordedMissing],korean:[...nativeKorean],starts:recordedStarts.length,english:nativeEnglish.length})")
  all_missing+=snapshot['missing'];all_native_korean+=snapshot['korean'];recorded_starts+=snapshot['starts'];native_english+=snapshot['english']
  checks.append('finance:'+str(game))
 assert not errors,errors
 (ROOT/'docs/v13/audio/academy-finance-missing.json').write_text(json.dumps({'missing':sorted(set(all_missing)),'nativeKorean':sorted(set(all_native_korean))},ensure_ascii=False,indent=2)+'\n')
 assert not all_native_korean,all_native_korean
 assert not all_missing,all_missing
 assert recorded_starts>0 and native_english>0
 browser.close()
data={'routes':len(checks),'recordedStarts':recorded_starts,'nativeKoreanCalls':0,'missingRecordedKorean':[],'nativeEnglishCalls':native_english,'checks':checks}
(ROOT/'docs/v13/audio/academy-finance-coverage.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('PASS',data)
