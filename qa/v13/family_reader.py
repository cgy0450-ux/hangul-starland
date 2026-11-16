"""Private screenshots stay outside the repository; public output contains counts only."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];private=Path('/workspace/joyi-private');shots=private/'review';shots.mkdir(exist_ok=True);key=(private/'key.txt').read_text().strip();results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for view,w,h in [('mobile',390,844),('tablet',800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h},service_workers='block');c.add_init_script("window.audios=[];const A=Audio;window.Audio=function(src){const a=new A(src);audios.push(a);return a};window.nativeCalls=0;speechSynthesis.speak=()=>nativeCalls++");page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:8000/family-stories.html');assert page.locator('#locked').is_visible();assert page.locator('#shelf img').count()==0
  page.locator('#key').fill('A'*43);page.locator('#unlock').click();page.get_by_text('책장을 열지 못했어요. 열쇠와 인터넷 연결을 확인해 주세요.').wait_for();assert page.locator('#locked').is_visible()
  page.goto('http://127.0.0.1:8000/family-stories.html#key='+key);page.locator('#shelf button').first.wait_for();assert page.locator('#shelf button').count()==4
  imageCount=0;audioCount=0
  for book in range(4):
   page.locator('#shelf button').nth(book).click()
   for i in range(6):
    assert page.locator('#count').inner_text()==str(i+1)+' / 6장';assert len(page.locator('#text').inner_text())>80;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    if page.locator('#scene').is_visible():page.locator('#scene').evaluate('(im)=>im.decode()');imageCount+=1
    else:
     notice=page.locator('#notice').inner_text();assert all(t in notice for t in ['삽화','보류','음성'])
    page.wait_for_function('audios.at(-1)?.currentTime>.03');assert page.evaluate('audios.at(-1).duration>5');audioCount+=1
    if i==0:page.screenshot(path=str(shots/(view+'-'+str(book)+'.png')));page.locator('#pause').click();assert page.evaluate('audios.at(-1).paused');page.locator('#pause').click()
    page.locator('#next').click()
   assert page.locator('#discussion').is_visible();buttons=page.locator('#discussion button');buttons.nth(0).click();page.get_by_text('다시 생각해 볼까요? 이야기 속 장면을 떠올려 봐요.').wait_for();buttons.nth(1).click();page.get_by_text('맞아요! 함께 생각해 줘서 고마워요.').wait_for();buttons.last.click()
  assert imageCount==18 and audioCount==24;assert page.evaluate('nativeCalls')==0;page.locator('#lock').click();assert page.locator('#locked').is_visible();assert page.locator('#shelf img').count()==0;assert not page.evaluate('location.hash');assert not errors,errors
  pending=[]
  page.route('**/family-books.bin',lambda route:pending.append(route))
  page.locator('#key').fill(key);page.locator('#unlock').click();page.wait_for_timeout(100);assert pending;page.locator('#lock').click();pending[0].fulfill(body=(R/'family-books.bin').read_bytes(),content_type='application/octet-stream');page.wait_for_timeout(350);assert page.locator('#locked').is_visible() and page.locator('#shelf button').count()==0
  results.append(dict(view=view,wrongKeyRejected=True,books=4,sceneImages=imageCount,actualAudioStarts=audioCount,nativeKoreanCalls=0,pauseAndComprehension=True,lockClearsContent=True,lockCancelsPendingDecrypt=True));c.close()
 b.close()
out=R/'docs/v13/family-reader';out.mkdir(exist_ok=True);(out/'validation.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS encrypted access, four books, 18 illustrations, 24 actual recorded scenes, pause/next/comprehension/lock at both viewports')
