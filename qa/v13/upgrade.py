"""Verify a selected released service-worker upgrade without modifying checkout files."""
import argparse, functools, http.server, json, subprocess, threading, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
ap=argparse.ArgumentParser();ap.add_argument('--baseline',default='1c24aeb');args=ap.parse_args()
old=subprocess.check_output(['git','show',args.baseline+':sw.js'],cwd=ROOT)
old_cache=re.search(r"const CACHE = '([^']+)'",old.decode()).group(1)
state={'upgrade':False}
expected_cache=re.search(r"const CACHE = '([^']+)'",(ROOT/'sw.js').read_text()).group(1)
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path=='/sw.js':
            data=(ROOT/'sw.js').read_bytes() if state['upgrade'] else old
            self.send_response(200);self.send_header('Content-Type','application/javascript');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
        else:super().do_GET()
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
    base='http://127.0.0.1:'+str(server.server_port)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
        context=browser.new_context();page=context.new_page();page.goto(base+'/')
        page.evaluate('navigator.serviceWorker.ready');page.reload()
        before=page.evaluate('caches.keys()');assert old_cache in before
        page.evaluate("navigator.serviceWorker.addEventListener('controllerchange',()=>window.didUpgrade=true)")
        state['upgrade']=True
        page.evaluate('''async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()}''')
        page.wait_for_function("([expected,old])=>caches.keys().then(ks=>ks.includes(expected) && !ks.includes(old))",arg=[expected_cache,old_cache])
        page.wait_for_function('window.didUpgrade === true')
        context.set_offline(True);page.goto(base+'/journey.html?subject=math')
        assert page.locator('[data-lesson="math-0-choose"]').count()>0
        page.goto(base+'/car-collect.html');page.locator('[data-vehicle=ambulance]').click();page.locator('.vehicle-preview').evaluate('(i)=>i.decode()');page.evaluate("JoyiArt.imageFor('vehicle-top.ambulance').decode()");page.locator('#start').click();page.locator('[data-stage-writing]').uncheck();page.goto(base+'/legacy.html?game=quiz');page.locator('#joy-splash').wait_for(state='hidden');page.locator('.question-image img').evaluate('(i)=>i.decode()');page.goto(base+'/adventure.html?game=space');assert not page.locator('[data-stage-writing]').is_checked();page.locator('#scene img').evaluate('(i)=>i.decode()')
        result={'offlineNewVehicleQuizSettingsSpace':'PASS','oldCache':before,'newCaches':page.evaluate('caches.keys()'),'offlineQueryAfterUpgrade':'PASS'}
        (ROOT/('docs/v13/upgrade-results.json' if args.baseline=='1c24aeb' else 'docs/v13/fixes/upgrade-from-v13.json')).write_text(json.dumps(result,indent=2)+'\n')
        print('PASS',json.dumps(result));browser.close()
finally:server.shutdown()
