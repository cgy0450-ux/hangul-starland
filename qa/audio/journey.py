"""Exercise every subject/stage/mode entry and every visible speaker button."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
SUBJECTS=['hangul','math','english','science','history','coding','finance','reading','life','creativity']
INIT="""
localStorage.setItem('joiland-audio-mode','recorded');localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:true}));
window.nativeKorean=[];window.nativeEnglish=[];window.recordedMissing=[];window.recordedStarts=[];
const nativeSpeak=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{(/^ko/i.test(u.lang||'ko-KR')?nativeKorean:nativeEnglish).push(u.text);return nativeSpeak(u)};
window.addEventListener('joyi-recorded-audio-error',e=>{if(e.detail.reason==='missing')recordedMissing.push(e.detail.text)});
const NativeAudio=Audio;window.Audio=function(src){const a=new NativeAudio(src);const play=a.play.bind(a);a.play=function(){const result=play();result.then(()=>recordedStarts.push(a.src)).catch(()=>{});return result};return a};
"""
result=[];all_missing=[];all_native_korean=[];recorded_starts=0;native_english=0
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':844});context.add_init_script(INIT);page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for subject in SUBJECTS:
  for stage in range(4):
   page.goto('http://127.0.0.1:8000/journey.html?subject='+subject)
   page.evaluate("([s,n])=>localStorage.setItem('joiland-stage-'+s,String(n))",[subject,stage]);page.reload()
   cards=page.locator('#modules [data-lesson]');assert cards.count()==11
   for index in range(11):
    cards=page.locator('#modules [data-lesson]');lesson=cards.nth(index).get_attribute('data-lesson');cards.nth(index).click();page.wait_for_timeout(25)
    page.locator('#hear').click()
    for button in page.locator('#answers [data-voice]').all():button.evaluate('(b)=>b.click()')
    if page.locator('#ready').is_visible():page.locator('#ready').click()
    snapshot=page.evaluate("()=>{const x={missing:[...recordedMissing],korean:[...nativeKorean],starts:recordedStarts.length,english:nativeEnglish.length};recordedMissing.length=nativeKorean.length=recordedStarts.length=nativeEnglish.length=0;return x}")
    all_missing+=snapshot['missing'];all_native_korean+=snapshot['korean'];recorded_starts+=snapshot['starts'];native_english+=snapshot['english']
    page.locator('#back').click();assert page.locator('#catalog').is_visible()
    result.append({'subject':subject,'stage':stage,'lesson':lesson})
 assert not errors,errors
 assert not all_native_korean,all_native_korean
 assert not all_missing,all_missing
 assert native_english>0 and recorded_starts>0,(native_english,recorded_starts)
 browser.close()
data={'lessonEntries':len(result),'uniqueLessons':len({x['lesson'] for x in result}),'recordedStarts':recorded_starts,'nativeKoreanCalls':0,'missingRecordedKorean':[],'nativeEnglishCalls':native_english,'note':'English curriculum pronunciation intentionally uses the device English voice.'}
(ROOT/'docs/v13/audio/journey-coverage.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('PASS',data)
