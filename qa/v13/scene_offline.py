"""Decode new scenes/props offline and choose actual picture options without altering their values."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844},service_workers='allow');c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:false}));Math.random=()=>.999999");page=c.new_page();page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('navigator.serviceWorker.controller');c.set_offline(True)
 for subject,stage in [('history',1),('history',3),('science',0),('reading',1),('life',0),('finance',2)]:
  page.goto('http://127.0.0.1:8000/journey.html?subject='+subject);page.evaluate('([s,n])=>localStorage.setItem("joiland-stage-"+s,n)',[subject,stage]);page.reload();page.locator('[data-lesson="'+subject+'-'+str(stage)+'-match"]').click();pictures=page.locator('#answers img.scene-choice');assert pictures.count()>0,(subject,stage);pictures.evaluate_all('(xs)=>Promise.all(xs.map(x=>x.decode()))')
  target=page.locator('#question').inner_text().split("'")[1];button=page.locator('#answers [data-opt]').filter(has=page.locator('img[alt="'+target+'"]'));assert button.count()==1;correct=button.get_attribute('data-opt');button.click();assert page.locator('#next').is_visible();results.append(dict(subject=subject,stage=stage,pictureOptions=pictures.count(),originalChoiceValue=correct,offlineAnswer='PASS'))
  if subject=='history' and stage==1:
   for index in range(4):
    page.locator('#next').click();target=page.locator('#question').inner_text().split("'")[1];page.locator('#answers [data-opt]').filter(has=page.locator('img[alt="'+target+'"]')).click();assert page.locator('#next').is_visible()
   page.locator('#next').click();assert page.locator('#joyi-finish-actions').is_visible();assert page.locator('#visual img.learning-scene').count()==0
 paths=page.evaluate('()=>Object.keys(JoyiArt.MAP).map(x=>JoyiArt.source(x))');assert page.evaluate('async(paths)=>{for(const src of new Set(paths)){const im=new Image();im.src=src;await im.decode()}return true}',paths)
 b.close()
(R/'docs/v13/scene-audit/offline-scenes.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print('PASS six offline contextual picture-choice flows; all mapped sprite images decode offline')
