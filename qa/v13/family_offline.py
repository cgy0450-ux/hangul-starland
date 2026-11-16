"""Actual production-worker offline private playback and stone game input."""
from pathlib import Path
from playwright.sync_api import sync_playwright
key=Path('/workspace/joyi-private/key.txt').read_text().strip()
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844},service_workers='allow');c.add_init_script("window.audios=[];const A=Audio;window.Audio=function(src){const a=new A(src);audios.push(a);return a}");page=c.new_page();page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True)
 page.goto('http://127.0.0.1:8000/family-stories.html#key='+key);page.locator('#shelf button').nth(1).click();page.locator('#scene').evaluate('(im)=>im.decode()');page.wait_for_function('audios.at(-1)?.currentTime>.05');page.locator('#next').click();page.wait_for_function('audios.at(-1)?.currentTime>.05')
 page.goto('http://127.0.0.1:8000/slingshot.html');page.wait_for_function('document.querySelector("#message").hidden');page.clock.install()
 for shot in range(3):
  page.locator('canvas').scroll_into_view_if_needed();r=page.locator('canvas').bounding_box();xy=lambda x,y:(r['x']+x*r['width']/640,r['y']+y*r['height']/580);page.mouse.move(*xy(135,365));page.mouse.down();page.mouse.move(*xy(35,345),steps=8);page.mouse.up();page.clock.run_for(300)
  if not page.locator('#detonate').is_disabled():page.locator('#detonate').click()
  page.clock.run_for(3200)
  if page.locator('#title').inner_text()=='보석을 모두 모았어요!':break
 assert page.locator('#title').inner_text()=='보석을 모두 모았어요!';b.close()
print('PASS offline encrypted unlock, illustrated scenes/actual recorded playback, aimed stone/bomb clear')
