"""Read-only baseline regression through real UI and service worker (no production deployment)."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
BASE='http://127.0.0.1:8000'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':390,'height':844})
    page=context.new_page()
    page.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))")
    page.goto(BASE+'/stories.html'); books=page.evaluate('window.JOY_STORIES')
    count=0
    for i,b in enumerate(books):
        page.goto(BASE+'/stories.html');page.locator('[data-book="'+str(i)+'"]').click()
        for j,scene in enumerate(b['pages']):
            assert page.locator('#storytext').inner_text()==scene['text'],(i,j)
            assert page.locator('#pagecount').inner_text()==f'{j+1} / {len(b["pages"])}장'
            if j<len(b['pages'])-1:page.locator('#next').click()
            count+=1
        page.locator('#prev').click()
        assert page.locator('#storytext').inner_text()==b['pages'][-2]['text']
    page.goto(BASE+'/')
    # Await full installation and control, then check offline navigation and image decoding.
    page.evaluate('navigator.serviceWorker.ready')
    page.reload();page.wait_for_function('navigator.serviceWorker.controller !== null')
    cached=page.evaluate('''async()=>{const names=await caches.keys();const keys=await (await caches.open(names.find(n=>n.startsWith('hangul-starland-')))).keys();return keys.length}''')
    assert cached>=51,cached
    context.set_offline(True)
    page.goto(BASE+'/requests.html');assert page.locator('a.game-card').count()==11
    page.goto(BASE+'/journey.html?subject=hangul')
    failures=[]
    if page.locator('[data-lesson="hangul-0-explore"]').count()==0:
        failures.append('Offline query route journey.html?subject=hangul falls back to home instead of requested learning hall')
    page.goto(BASE+'/journey.html');assert page.locator('[data-lesson="hangul-0-explore"]').count()>0
    page.goto(BASE+'/');page.wait_for_function("[...document.images].filter(i=>i.src.endsWith('joyi-hello.svg')).every(i=>i.complete && i.naturalWidth>0)")
    context.set_offline(False)
    browser.close()
    result={'storyPagesTraversed':count,'storyPreviousChecks':len(books),'serviceWorkerCachedRequests':cached,'offlineRoutesVerified':['requests.html','journey.html','index.html'],'failures':failures,'limitations':['No narration audio quality evaluation','No complete gameplay, 5-minute timing or 200 scene visual review in this baseline test']}
    (ROOT/'docs/v13/behavior-results.json').write_text(json.dumps(result,indent=2)+'\n')
    print('FAIL' if failures else 'PASS',json.dumps(result))
    if failures:raise SystemExit(1)
