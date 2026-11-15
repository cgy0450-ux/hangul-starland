import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];results=[]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox'])
 for w,h in [(390,844),(800,1280)]:
  for mode in ['space','safari']:
   c=b.new_context(viewport={'width':w,'height':h});c.add_init_script("localStorage.setItem('hangul-starland-v1',JSON.stringify({sound:true}));window.deviceCalls=[];const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{deviceCalls.push(u.text);return sp(u)}");page=c.new_page();page.goto('http://127.0.0.1:8000/legacy.html?game='+mode);page.locator('#joy-splash').wait_for(state='hidden');page.evaluate('()=>{window.heard=[];const original=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{heard.push(u.text);return original(u)}}')
   for n in range(5):
    if mode=='space':
     target=page.locator('[data-a=read]').get_attribute('data-text');choices=page.locator('[data-a=answer-space]')
    else:
     page.evaluate('heard=[]');page.locator('[data-a=race-hear]').click();target=page.evaluate('heard.at(-1)');choices=page.locator('[data-a=race-pick]')
    choices.filter(has_not_text=target).first.click();assert not page.evaluate('HANGUL_QA.view().answered');choices.filter(has_text=target).click();assert page.evaluate('HANGUL_QA.view().answered')
    if mode=='safari':page.locator('.race-passenger img').evaluate('(i)=>i.decode()')
    page.locator('[data-a=next]').click()
   assert page.locator('.endboard').count()==1;assert not page.evaluate('deviceCalls'),page.evaluate('deviceCalls');results.append({'viewport':[w,h],'mode':mode,'fiveRoundsAndWrongAnswer':'PASS','deviceVoiceCalls':page.evaluate('deviceCalls')});c.close()
 b.close()
(ROOT/'docs/v13/learning-refresh/classic-games-results.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS new space/animal artwork games: 20 actual rounds, wrong answers blocked, completion, no old TTS')
