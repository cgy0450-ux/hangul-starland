"""Actual media-ended auto paging, cancellation and ten-page boundaries."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];private=Path('/workspace/joyi-private');key=(private/'key.txt').read_text().strip();results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h},service_workers='block');c.add_init_script("window.audios=[];const A=Audio;window.Audio=function(src){const a=new A(src);audios.push(a);return a}");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  def opened():page.locator('#shelf button').first.wait_for();assert page.locator('#shelf button').count()==4
  def playing():page.wait_for_function('audios.at(-1)?.currentTime>.03&&audios.at(-1).duration>5')
  def end():playing();page.evaluate('()=>{const a=audios.at(-1);a.currentTime=a.duration-.05}')
  page.goto('http://127.0.0.1:8000/family-stories.html#key='+key);opened();page.locator('#shelf button').first.click();assert page.locator('#mute').count()==0;assert page.locator('#autoNext').is_checked();page.locator('#autoNext').uncheck();page.reload();opened();assert not page.locator('#autoNext').is_checked();page.locator('#shelf button').first.click();end();page.wait_for_function('audios.at(-1).ended');assert page.locator('#count').inner_text()=='1 / 10장'
  page.locator('#autoNext').check();page.locator('#play').click();end();page.wait_for_function("document.querySelector('#count').textContent==='2 / 10장'");playing();page.locator('#pause').click();page.evaluate('audios.at(-1).currentTime=audios.at(-1).duration-.05');page.wait_for_timeout(300);assert page.locator('#count').inner_text()=='2 / 10장';page.locator('#pause').click();page.wait_for_function("document.querySelector('#count').textContent==='3 / 10장'")
  page.locator('#autoNext').uncheck();end();page.wait_for_function('audios.at(-1).ended');assert page.locator('#count').inner_text()=='3 / 10장';page.locator('#play').click();playing();page.evaluate('window.staleEnded=audios.at(-1).onended');page.locator('#next').click();page.evaluate('staleEnded()');assert page.locator('#count').inner_text()=='4 / 10장';page.locator('#back').click();page.evaluate('staleEnded()');assert page.locator('#shelf').is_visible()
  page.locator('#shelf button').nth(1).click();page.locator('#autoNext').check();page.evaluate('staleEnded()');assert page.locator('#count').inner_text()=='1 / 10장'
  page.evaluate("()=>{window.realPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('blocked','NotAllowedError'))}");page.locator('#play').click();page.get_by_text('목소리 듣기 버튼을 눌러 주세요.').wait_for();assert page.locator('#count').inner_text()=='1 / 10장';page.evaluate('()=>{HTMLMediaElement.prototype.play=realPlay}')
  page.reload();opened();assert page.locator('#autoNext').is_checked();page.locator('#shelf button').first.click()
  for _ in range(9):page.locator('#next').click()
  assert page.locator('#count').inner_text()=='10 / 10장';end();page.locator('#discussion').wait_for();assert page.locator('#reader').is_hidden();assert page.evaluate('audios.every(a=>a.paused)')
  assert not errors,errors;results.append(dict(view=view,defaultChecked=True,uncheckedPreferencePersists=True,manualEndStays=True,checkedEndAdvances=True,pauseBlocksAdvance=True,uncheckCancelsAdvance=True,staleEventsIgnored=True,errorDoesNotAdvance=True,preferencePersists=True,lastPageDiscussion=True,oldReadToggleRemoved=True));c.close()
 b.close()
out=R/'docs/v13/family-reader';(out/'auto-next.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS phone/tablet actual ended/manual/pause/stale/error/persistence/ten-page-boundary cases')
