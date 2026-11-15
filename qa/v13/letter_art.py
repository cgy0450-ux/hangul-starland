import io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});page.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}))");page.goto('http://127.0.0.1:8000/legacy.html?game=learn');page.locator('#joy-splash').wait_for(state='hidden')
 for tab in ['consonants','vowels','syllables']:
  page.locator('[data-tab="'+tab+'"]').click();count=page.locator('[data-a=letter]').count()
  for i in range(count):
   page.locator('[data-a=letter]').nth(i).click();image=page.locator('.exampleemoji img');assert image.count()==1,(tab,i);image.evaluate('(i)=>i.decode()');assert page.locator('.detail-ex button').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest("button")===e}');results.append({'tab':tab,'index':i,'art':image.get_attribute('src')})
   if (tab,i)in [('vowels',0),('vowels',7),('syllables',4)]:Image.open(io.BytesIO(page.screenshot(full_page=True))).convert('RGB').save(ROOT/'docs/v13/learning-refresh'/('letter-'+tab+'-'+str(i)+'.webp'),quality=86)
 b.close()
(ROOT/'docs/v13/learning-refresh/letter-art-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS',len(results),'letter examples decoded as actual raster, no emoji fallback; read button reachable')
