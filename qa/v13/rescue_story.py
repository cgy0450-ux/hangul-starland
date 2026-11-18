from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
import json
O=Path('docs/v13/spider-rescue');rows=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(1280,800)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script('window.clips=[];const Native=Audio;window.Audio=function(src){const a=new Native(src);clips.push(a);return a}');page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install();page.clock.set_system_time(datetime(2026,11,18,1,tzinfo=timezone.utc));page.goto('http://127.0.0.1:8000/stories.html');assert page.locator('[data-book]').count()==3;ids=page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>Number(x.dataset.book))');assert 26 in ids;assert len([i for i in ids if i>=21])==1;page.screenshot(path=str(O/f'shelf-{w}.png'));page.reload();assert page.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>Number(x.dataset.book))')==ids
  page.locator('[data-book="26"]').click();assert page.locator('#autoTurn').is_checked();assert page.locator('#scene img').count()==0;assert '삽화 준비 중' in page.locator('#scene').inner_text()
  def playing():page.wait_for_function('clips.at(-1)?.currentTime>.03&&clips.at(-1).duration>15')
  def end():playing();page.evaluate('()=>{const a=clips.at(-1);a.currentTime=a.duration-.05}')
  playing();page.screenshot(path=str(O/f'reader-{w}.png'),full_page=True);end();page.wait_for_function('document.querySelector("#pagecount").textContent.startsWith("2 / ")');playing();page.locator('#pauseVoice').click();assert page.evaluate('clips.at(-1).paused');page.locator('#pauseVoice').click();playing();page.locator('#autoTurn').uncheck();end();page.wait_for_timeout(1200);assert page.locator('#pagecount').inner_text().startswith('2 / ');page.locator('#speak').click()
  for i in range(1,10):
   playing();assert page.locator('#pagecount').inner_text().startswith(str(i+1)+' / ');assert page.locator('.audio-chapter strong').inner_text();assert page.locator('#scene img').count()==0;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if i<9:page.locator('#next').click()
  page.locator('#autoTurn').check();end();page.locator('#comprehension').wait_for(state='visible');page.get_by_role('button',name='자동차 안의 사람들',exact=True).click();assert '먼저' in page.locator('.story-feedback').inner_text();page.locator('#back').click()
  # Every existing character series receives its turn; illustrated editions still render their actual scenes.
  for d in range(1,6):
   page.clock.set_system_time(datetime.fromtimestamp(datetime(2026,11,18,1,tzinfo=timezone.utc).timestamp()+86400*d,timezone.utc));page.evaluate("dispatchEvent(new Event('pageshow'))");assert page.locator('[data-book]').count()==3;char=25-(d-1);page.locator(f'[data-book="{char}"]').click();page.wait_for_function('document.querySelector("#scene img")?.naturalWidth>0');assert not page.locator('#reader').evaluate('(e)=>e.classList.contains("audio-story")');page.locator('#back').click()
  assert not errors,errors;rows.append(dict(viewport=[w,h],dailyThreeOneCharacter=True,allSixCharacterBooksRotate=True,tenActualAudioStarts=True,truthfulNoSceneArt=True,autoEndPauseReplayManualAndDiscussion=True));c.close()
 # Midnight while a book is open returns to the fresh three-book shelf.
 c=b.new_context();c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page=c.new_page();page.clock.install();page.clock.set_system_time(datetime(2026,11,18,14,59,59,tzinfo=timezone.utc));page.goto('http://127.0.0.1:8000/stories.html');page.locator('[data-book="26"]').click();page.clock.fast_forward(31000);assert not page.locator('#reader').evaluate('(e)=>e.classList.contains("active")');assert page.locator('[data-book]').count()==3;assert page.locator('[data-book="25"]').count()==1;c.close()
 # Actual production worker delivers new recording/data offline. Speech API is not required for recorded editions.
 c=b.new_context();page=c.new_page();page.clock.install();page.clock.set_system_time(datetime(2026,11,18,1,tzinfo=timezone.utc));page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);page.goto('http://127.0.0.1:8000/stories.html');page.evaluate("()=>{delete window.speechSynthesis;delete window.SpeechSynthesisUtterance}");assert page.evaluate("!('speechSynthesis'in window)&&!('SpeechSynthesisUtterance'in window)");page.locator('[data-book="26"]').click();page.wait_for_function('document.querySelector("#paper").classList.contains("narrating")');assert page.locator('.audio-chapter').is_visible();c.close();b.close()
(O/'validation.json').write_text(json.dumps(dict(cases=rows,actualWorkerOffline=True,recordedEditionWithoutDeviceSpeechAPI=True),indent=2)+'\n');print('PASS daily three/character inclusion, ten audio pages, native playback/controls, five existing illustrated books and offline rescue narration')
