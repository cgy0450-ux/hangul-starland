"""Unified shelf: actual images, recorded playback, controls and offline access."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'docs/v13/friends-stories';O.mkdir(exist_ok=True);results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script('window.clips=[];const A=Audio;window.Audio=function(src){const a=new A(src);clips.push(a);return a}');page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8000/stories.html');assert page.locator('[data-book]').count()==26;assert page.locator('[data-book]').first.get_attribute('data-book')=='24';assert page.locator('a[href="./family-stories.html"]').count()==0
  page.locator('[data-book="24"]').scroll_into_view_if_needed();page.screenshot(path=str(O/(view+'-shelf.png')))
  for book in range(24,26):
   page.locator('[data-book="'+str(book)+'"]').click();assert page.locator('#autoTurn').is_checked()
   def playing():page.wait_for_function('clips.at(-1)?.currentTime>.03&&clips.at(-1).duration>5')
   def end():playing();page.evaluate('()=>{const a=clips.at(-1);a.currentTime=a.duration-.05}')
   playing();page.wait_for_function('document.querySelector("#scene img").naturalWidth>0');page.screenshot(path=str(O/(view+'-book-'+str(book)+'.png')),full_page=True)
   end();page.wait_for_function('document.querySelector("#pagecount").textContent.startsWith("2 / ")');playing();page.locator('#pauseVoice').click();assert page.evaluate('clips.at(-1).paused');page.locator('#pauseVoice').click();playing()
   page.locator('#autoTurn').uncheck();end();page.wait_for_timeout(1100);assert page.locator('#pagecount').inner_text().startswith('2 / ')
   page.locator('#speak').click()
   for i in range(1,10):
    playing();page.wait_for_function('document.querySelector("#scene img").naturalWidth>0');assert page.locator('#pagecount').inner_text().startswith(str(i+1)+' / ')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    if i<9:page.locator('#next').click()
   page.locator('#autoTurn').check();end();page.locator('#comprehension').wait_for(state='visible');assert page.evaluate('clips.every(a=>a.paused)');page.locator('#back').click()
  assert not errors,errors;results.append(dict(view=view,books=26,additionalPages=20,actualImageAndAudioStarts=20,autoEnd=True,pauseResume=True,manualEndStays=True,lastPageDiscussion=True));c.close()
 # Production worker must serve the new data/images/recordings without a key offline.
 c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:8000/stories.html');page.evaluate("()=>navigator.serviceWorker.register('./sw.js')");page.evaluate('()=>navigator.serviceWorker.ready');page.reload();page.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);page.reload();assert page.locator('[data-book]').count()==26
 for book in range(24,26):
  page.locator('[data-book="'+str(book)+'"]').click();page.wait_for_function('document.querySelector("#scene img").naturalWidth>0');page.wait_for_function('document.querySelector("#paper").classList.contains("narrating")');page.locator('#back').click()
 results.append(dict(offline=True,additionalBooksReadable=2,keyRequired=False));c.close();b.close()
(O/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS 26-card unified shelf, 40 new scene/media cases, end-only auto, pause/manual/discussion and offline no-key entry')
