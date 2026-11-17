from playwright.sync_api import sync_playwright
from pathlib import Path
import json
O=Path('docs/v13/gana-voice');rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);c=b.new_context();c.add_init_script("window.events=[];window.addEventListener('joyi-letter-pronounced',e=>events.push(e.detail));window.clips=[];const A=Audio;window.Audio=function(src){const a=new A(src);clips.push(a);return a}");page=c.new_page();page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.JoyiLetterVoice');page.wait_for_timeout(1800)
 for char in '가나다라마바사아자차카타파하무기도호':
  page.evaluate("ch=>{events=[];window.finished=false;JoyiLetterVoice.play(ch,()=>finished=true,true)}",char)
  for n in range(1,4):
   page.wait_for_function('(n)=>events.length===n',arg=n);page.wait_for_function('clips.at(-1).currentTime>.02');page.evaluate('()=>{const a=clips.at(-1);a.currentTime=a.duration-.05}')
  page.wait_for_function('finished');assert page.evaluate('events.map(e=>e.number)')==[1,2,3];rows.append(dict(char=char,actualStarts=3))
 page.evaluate("()=>{events=[];JoyiLetterVoice.play('나',()=>{},true)}");page.wait_for_function('events.length===1');page.evaluate('JoyiLetterVoice.cancel()');page.wait_for_timeout(400);assert page.evaluate('events.length')==1;assert page.evaluate('clips.at(-1).paused')
 page.evaluate("()=>{events=[];finished=false;JoyiLetterVoice.play('가',()=>finished=true,false)}");assert page.evaluate('finished&&events.length===0')
 page.evaluate("()=>{finished=false;JoyiLetterVoice.play('없는 음원',()=>finished=true,true)}");assert page.evaluate('finished')
 page.goto('http://127.0.0.1:8000/');page.evaluate('navigator.serviceWorker.ready');page.reload();page.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);page.goto('http://127.0.0.1:8000/legacy.html?game=trace&course=gana');page.wait_for_function('!!window.JoyiLetterVoice');page.wait_for_timeout(1800);page.evaluate("()=>{events=[];finished=false;JoyiLetterVoice.play('나',()=>finished=true,true)}")
 for n in range(1,4):
  page.wait_for_function('(n)=>events.length===n',arg=n);page.wait_for_function('clips.at(-1).currentTime>.02');page.evaluate('()=>{const a=clips.at(-1);a.currentTime=a.duration-.05}')
 page.wait_for_function('finished');assert page.locator('.ww-room').count()==1
 b.close()
(O/'audio-controls.json').write_text(json.dumps(dict(syllables=rows,cancelStops=True,muteSilent=True,missingClipDoesNotBlock=True,offlineTripleAndGana=True),ensure_ascii=False,indent=2)+'\n');print('PASS actual three starts for all14 clips, cancel, mute and missing-clip recovery')
