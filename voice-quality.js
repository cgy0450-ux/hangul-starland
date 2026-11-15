/* Shared device voice selection. Does not call external TTS services. */
(()=>{'use strict';if(!window.speechSynthesis)return;const synth=window.speechSynthesis;
function rank(v){const n=v.name||'';return (/natural|neural/i.test(n)?100:/enhanced|premium|고품질/i.test(n)?80:/google/i.test(n)?60:0)+(/yuna|유나|sunhi|선히/i.test(n)?10:0)}
function choose(lang){const list=synth.getVoices().filter(v=>v.lang.toLowerCase().split('-')[0]===(lang||'ko-KR').toLowerCase().split('-')[0]);let name='';try{name=localStorage.getItem('joiland-voice-name')||''}catch(e){}return list.find(v=>v.name===name)||list.slice().sort((a,b)=>rank(b)-rank(a))[0]||null}
const original=synth.speak.bind(synth);synth.speak=function(u){const lang=u.lang||'ko-KR',v=choose(lang);if(v)u.voice=v;if(/^ko/i.test(lang)){u.pitch=1;u.rate=Math.max(.88,Math.min(1.02,u.rate||1))}return original(u)};
window.JoyiVoiceQuality={choose,rank};
function mount(){if(!location.pathname.endsWith('parent.html'))return;const select=document.getElementById('voiceChoice');if(!select)return;const button=document.getElementById('previewVoice')||document.createElement('button');button.type='button';button.textContent='새 쪼이 목소리 들어보기';button.style.cssText='min-height:44px;margin:8px 0;padding:10px;border-radius:12px';button.onclick=()=>{const u=new SpeechSynthesisUtterance('안녕! 나는 쪼이야. 오늘은 어떤 재미있는 놀이를 해 볼까?');u.lang='ko-KR';synth.cancel();synth.speak(u)};const note=document.createElement('p');note.textContent='한국어는 앱에 넣은 새 쪼이 음원으로 재생됩니다. 아래 기기 음성 선택은 영어 학습 발음에만 사용됩니다.';select.after(button,note)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
