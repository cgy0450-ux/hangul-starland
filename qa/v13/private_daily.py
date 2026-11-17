from pathlib import Path
from playwright.sync_api import sync_playwright
import json
key=Path('/workspace/joyi-private/key.txt').read_text().strip()
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);page=b.new_page();page.clock.install();day=20000
 while day%26!=24:day+=1
 page.clock.set_system_time(__import__('datetime').datetime.fromtimestamp(day*86400,__import__('datetime').timezone.utc));page.goto('http://127.0.0.1:8000/family-stories.html');page.locator('#key').fill(key);page.locator('#unlock').click();page.locator('#shelf').wait_for(state='visible');assert page.locator('#shelf button:visible').count()==3;assert page.locator('#shelf button:visible').evaluate_all('(xs)=>xs.map(x=>Number(x.dataset.book))')==[0,1,2]
 page.clock.fast_forward(86400000);assert page.locator('#shelf button:visible').count()==1;assert page.locator('#shelf button:visible').get_attribute('data-book')=='3';b.close()
Path('docs/v13/home-daily/private-daily.json').write_text(json.dumps(dict(privateShelfFollowsSamePublicDailyIds=True,midnightRefresh=True,noKeyInEvidence=True))+'\n');print('PASS legacy private shelf follows the same three daily public book IDs, without exposing key/content')
