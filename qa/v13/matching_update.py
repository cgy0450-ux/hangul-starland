from playwright.sync_api import sync_playwright
from pathlib import Path
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(800,1280)]:
  c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
  page=c.new_page();page.goto('http://127.0.0.1:8000/journey.html?subject=history');page.locator('[data-lesson="history-0-match"]').click();assert not page.locator('#visual').is_visible();assert page.locator('#answers img').count()>0
  page.screenshot(path='/tmp/match-'+str(w)+'.png');page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('navigator.serviceWorker.controller');page.locator('#refresh').click();page.get_by_text('최신 버전입니다.',exact=True).wait_for(timeout=30000);page.screenshot(path='/tmp/update-'+str(w)+'.png');page.route('**/sw.js?check=*',lambda r:r.fulfill(body="const CACHE = 'future-test';",content_type='application/javascript'));page.locator('#refresh').click();page.get_by_text('업데이트하기',exact=True).wait_for();c.set_offline(True);page.locator('#refresh').click();page.get_by_text('인터넷 연결 후 업데이트를 확인해 주세요.',exact=True).wait_for();c.close()
 b.close()
print('PASS phone/tablet matching hides answer cue; actual worker latest-version checks')
