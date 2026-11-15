"""Test narration state and race handling; this is not audible voice-quality validation."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);page=b.new_page()
 page.add_init_script('''window.voiceCalls=[];window.SpeechSynthesisUtterance=function(text){this.text=text};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'Korean fixture',lang:'ko-KR'}],speak:u=>{window.lastUtterance=u;voiceCalls.push('speak');u.onstart?.()},cancel:()=>voiceCalls.push('cancel'),pause:()=>voiceCalls.push('pause'),resume:()=>voiceCalls.push('resume')}});localStorage.setItem('joiland-voice-name','Korean fixture')''')
 page.goto('http://127.0.0.1:8000/stories.html');page.locator('[data-book="0"]').click();assert page.evaluate('lastUtterance.voice.name')=='Korean fixture';assert page.evaluate('lastUtterance.lang')=='ko-KR'
 page.locator('#pauseVoice').click();assert page.evaluate("voiceCalls.at(-1)")=='pause';assert page.locator('#pauseVoice').inner_text()=='이어 듣기';page.locator('#pauseVoice').click();assert page.evaluate("voiceCalls.at(-1)")=='resume'
 page.evaluate('window.oldEnd=lastUtterance.onend');page.locator('#autoTurn').check();page.locator('#next').click();page.evaluate('oldEnd()');page.wait_for_timeout(1000);assert page.locator('#pagecount').inner_text()=='2 / 10장'
 page.locator('#autoTurn').uncheck();page.locator('#audio-switch').click();calls=page.evaluate('voiceCalls.length');page.locator('#speak').click();assert 'speak' not in page.evaluate('voiceCalls.slice('+str(calls)+')')
 page.locator('#audio-switch').click();page.locator('#autoTurn').check();page.evaluate('lastUtterance.onend()');page.wait_for_timeout(1000);assert page.locator('#pagecount').inner_text()=='3 / 10장'
 page.locator('#back').click();assert not page.locator('#reader').is_visible();b.close();print('PASS: voice preference, Korean language, pause/resume, stale end cancellation, mute, auto-turn and shelf exit. Audible device voice quality remains unverified.')
