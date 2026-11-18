from pathlib import Path
from datetime import datetime,timezone,timedelta
from playwright.sync_api import sync_playwright
import json
# Read the existing local key only; never include it or decrypted pages in evidence.
key=Path('/workspace/joyi-private/key.txt').read_text().strip()
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context();public=c.new_page();private=c.new_page();start=datetime(2026,11,18,1,tzinfo=timezone.utc)
 for page in [public,private]:page.clock.install();page.clock.set_system_time(start)
 public.goto('http://127.0.0.1:8000/stories.html');private.goto('http://127.0.0.1:8000/family-stories.html');private.locator('#key').fill(key);private.locator('#unlock').click();private.wait_for_function('document.querySelector("#locked").hidden && !document.querySelector("#shelf").hidden');seen=set()
 for day in range(24):
  for page in [public,private]:page.clock.set_system_time(start+timedelta(days=day));page.evaluate("dispatchEvent(new Event('pageshow'))")
  ids=public.locator('[data-book]').evaluate_all('(xs)=>xs.map(x=>Number(x.dataset.book))');expected=sorted(i-20 for i in ids if 20<=i<24);visible=private.locator('#shelf button:visible').evaluate_all('(xs)=>xs.map(x=>Number(x.dataset.book))');assert visible==expected;seen.update(visible)
 assert seen=={0,1,2,3};b.close()
Path('docs/v13/spider-rescue/private-daily.json').write_text(json.dumps(dict(privateShelfFollowsActualPublicDailyIds=True,days=24,allFourLegacyBooksGetTurns=True,noKeyInEvidence=True))+'\n');print('PASS private shelf matches actual public daily IDs over 24 days; no key/content in evidence')
