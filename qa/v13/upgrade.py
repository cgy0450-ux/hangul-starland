"""Verify real v12 service-worker upgrade without modifying checkout files."""
import functools, http.server, json, subprocess, threading, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
old=subprocess.check_output(['git','show','1c24aeb:sw.js'],cwd=ROOT)
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
        before=page.evaluate('caches.keys()');assert any('v12-1' in k for k in before)
        page.evaluate("navigator.serviceWorker.addEventListener('controllerchange',()=>window.didUpgrade=true)")
        state['upgrade']=True
        page.evaluate('''async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()}''')
        page.wait_for_function("expected=>caches.keys().then(ks=>ks.includes(expected) && !ks.some(k=>k.includes('v12-1')))",arg=expected_cache)
        page.wait_for_function('window.didUpgrade === true')
        context.set_offline(True);page.goto(base+'/journey.html?subject=math')
        assert page.locator('[data-lesson="math-0-choose"]').count()>0
        result={'oldCache':before,'newCaches':page.evaluate('caches.keys()'),'offlineQueryAfterUpgrade':'PASS'}
        (ROOT/'docs/v13/upgrade-results.json').write_text(json.dumps(result,indent=2)+'\n')
        print('PASS',json.dumps(result));browser.close()
finally:server.shutdown()
