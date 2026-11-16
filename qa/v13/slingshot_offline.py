from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(service_workers='allow');page=c.new_page();page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True);page.goto('http://127.0.0.1:8000/requests.html');page.locator('[href="./slingshot.html"]').click();page.locator('#launch').wait_for(state='visible');page.wait_for_function('!document.querySelector("#launch").disabled && document.querySelector("#message").hidden');page.locator('#launch').click();page.get_by_text('보석을 모두 모았어요!',exact=True).wait_for(timeout=12000);b.close()
print('PASS offline playground entry, all local artwork/physics, actual shot and stage win')
