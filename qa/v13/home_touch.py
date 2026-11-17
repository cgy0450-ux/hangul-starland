from playwright.sync_api import sync_playwright
from pathlib import Path
import json
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);page=c.new_page();page.goto('http://127.0.0.1:8000/');page.wait_for_function('!!document.querySelector("#daily-subjects")');track=page.locator('#daily-subjects');r=track.bounding_box();y=r['y']+r['height']*.6;session=c.new_cdp_session(page);x=r['x']+r['width']*.8;session.send('Input.dispatchTouchEvent',dict(type='touchStart',touchPoints=[dict(x=x,y=y,id=9)]))
 for k in range(1,15):session.send('Input.dispatchTouchEvent',dict(type='touchMove',touchPoints=[dict(x=x-k*12,y=y,id=9)]))
 session.send('Input.dispatchTouchEvent',dict(type='touchEnd',touchPoints=[]));page.wait_for_timeout(600);assert track.evaluate('(e)=>e.scrollLeft')>0;assert page.url.endswith('/');page.screenshot(path='docs/v13/home-daily/mobile-after-swipe.png');Path('docs/v13/home-daily/touch.json').write_text(json.dumps(dict(nativeTouchSwipe=True,noAccidentalNavigation=True))+'\n');b.close();print('PASS native touch swipe scrolls cards without navigating')
