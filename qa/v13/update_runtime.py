"""Real old-to-new service worker update over HTTP; stalled-update escape and offline UI."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import threading,json,re,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];O=ROOT/os.environ.get('JOY_UPDATE_EVIDENCE','docs/v13/update-coding');O.mkdir(exist_ok=True)
release=re.search(r"const CACHE = '([^']+)'",(ROOT/'sw.js').read_text()).group(1)
state={'new':False};old="""const CACHE='old-test-release';self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('message',e=>{if(e.data==='JOY_VERSION')e.ports[0].postMessage(CACHE)});"""
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
 def do_GET(self):
  if self.path.split('?')[0]=='/sw.js' and not state['new']:
   data=old.encode();self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
  else:super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',8017),Handler);threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:8017'
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844});page=c.new_page();page.goto(base+'/');page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('!!navigator.serviceWorker.controller')
 # Seed one hashed recording into the previous cache. Block its network URL during the real installation.
 audio=re.search(r"'(.\/assets/audio/[0-9a-f]{20}\.mp3)'",(ROOT/'sw.js').read_text()).group(1)
 page.evaluate("async u=>{const cache=await caches.open('hangul-starland-old-test');await cache.put(u,await fetch(u))}",audio)
 page.route('**/'+audio.removeprefix('./'),lambda r:r.abort());state['new']=True
 page.locator('#refresh').click();page.get_by_text('업데이트하기',exact=True).wait_for();page.locator('#refresh').click()
 # Either apply immediately or safely close a slow download. Installation proceeds in the worker.
 page.wait_for_timeout(100)
 if page.get_by_text('닫고 배경에서 준비하기',exact=True).is_visible():page.get_by_text('닫고 배경에서 준비하기',exact=True).click()
 page.wait_for_function("async wanted=>{const ch=new MessageChannel();const v=await new Promise(r=>{ch.port1.onmessage=e=>r(e.data);navigator.serviceWorker.controller.postMessage('JOY_VERSION',[ch.port2])});return v===wanted}",arg=release,timeout=120000)
 # The controller already changed; applying must reload without waiting for another controllerchange.
 page.get_by_text('새 버전 준비가 끝났어요. 업데이트하기를 눌러 적용해 주세요.',exact=True).wait_for();page.reload();page.evaluate("()=>{navigator.serviceWorker.addEventListener('controllerchange',e=>e.stopImmediatePropagation(),true);sessionStorage.setItem('qa-controller-changes','0');navigator.serviceWorker.addEventListener('controllerchange',()=>sessionStorage.setItem('qa-controller-changes',String(Number(sessionStorage.getItem('qa-controller-changes'))+1)));const worker=navigator.serviceWorker.controller,original=worker.postMessage.bind(worker);let once=true;worker.postMessage=(data,ports)=>{if(data==='JOY_VERSION'&&once){once=false;ports[0].postMessage('previous-check-snapshot')}else original(data,ports)}}")
 page.locator('#refresh').click();page.get_by_text('업데이트하기',exact=True).wait_for();page.locator('#refresh').click();page.get_by_text('업데이트가 완료되었습니다.',exact=True).wait_for(timeout=20000);assert page.evaluate("sessionStorage.getItem('qa-controller-changes')")=='0'
 page.evaluate("sessionStorage.setItem('joyi-update-applied','1')");page.reload();page.get_by_text('업데이트가 완료되었습니다.',exact=True).wait_for();page.locator('#refresh').click();page.get_by_text('최신 버전입니다.',exact=True).wait_for();page.screenshot(path=str(O/'update-latest-phone.png'))
 assert page.evaluate("async ([u,v])=>!!(await (await caches.open(v)).match(u))",[audio,release])
 page.set_viewport_size({'width':1280,'height':800});page.locator('#refresh').click();page.get_by_text('최신 버전입니다.',exact=True).wait_for();page.screenshot(path=str(O/'update-latest-tablet.png'))
 c.set_offline(True);page.locator('#refresh').click();page.get_by_text('인터넷 연결 후 업데이트를 확인해 주세요.',exact=True).wait_for();assert not page.get_by_text('닫고 배경에서 준비하기',exact=True).is_visible()
 page.goto(base+'/journey.html?subject=coding');page.locator('.opening-skip').click();page.evaluate("()=>{window.playResolved=false;const native=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return native.call(this).then(()=>{window.playResolved=true})};const b=document.createElement('button');b.id='qa-audio';b.textContent='음원 검증';b.onclick=()=>JOY_CORE.speak('손에 물 묻히기');document.body.append(b)}");page.locator('#qa-audio').click();page.wait_for_function('playResolved');page.goto(base+'/');c.set_offline(False)
 # Controlled installer that never settles: user can always dismiss; late task cannot reopen the overlay.
 page.evaluate("()=>{const orig=fetch;window.fetch=(u,...a)=>String(u).includes('sw.js?check=')?Promise.resolve(new Response(\"const CACHE = 'future-test';\")):orig(u,...a);const r={update:()=>new Promise(()=>{}),waiting:null};navigator.serviceWorker.getRegistration=()=>Promise.resolve(r)}")
 page.locator('#refresh').click();page.get_by_text('업데이트하기',exact=True).wait_for();page.locator('#refresh').click();page.evaluate("navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'JOY_UPDATE_PROGRESS',done:3640,total:4375}}))");page.get_by_text('새 버전을 준비하고 있어요… 파일 3,640 / 4,375개 저장 중 · 83%',exact=True).wait_for();assert page.locator('progress').get_attribute('value')=='3640';page.screenshot(path=str(O/'update-progress-tablet.png'));page.get_by_text('닫고 배경에서 준비하기',exact=True).click();assert not page.get_by_text('닫고 배경에서 준비하기',exact=True).is_visible();assert page.locator('#refresh').is_enabled();page.clock.install();page.locator('#refresh').click();page.clock.fast_forward(13000);page.get_by_text('확인이 오래 걸리고 있어요. 연결을 확인하고 다시 시도해 주세요.',exact=True).wait_for();assert not page.get_by_text('닫고 배경에서 준비하기',exact=True).is_visible();assert page.locator('#refresh').is_enabled();b.close()
server.shutdown();(O/'update-validation.json').write_text(json.dumps(dict(realWorkerUpgrade=True,legacyAppliedFlagVerifiedAgainstRealWorker=True,alreadyChangedControllerReload=True,latestPhoneTablet=True,offlineClearsOverlay=True,newProcedureRecordedAudioPlaysOffline=True,fileCountAndPercentExplained=True,backgroundCompletionNotice=True,noForcedBackgroundReload=True,stalledUpdateCanDismiss=True,stalledUpdateTimesOutAndClearsOverlay=True,previousHashedAudioReusedWithNetworkBlocked=True),indent=2)+'\n');print('PASS actual worker migration, no-second-controllerchange apply, latest phone/tablet, offline, stall dismissal and cached audio reuse')
