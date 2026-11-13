/* Shared navigation and a five-minute trophy for Joiland. */
(()=>{'use strict';
const page=(location.pathname.split('/').pop()||'index.html');
if(page==='index.html')return;
const header=document.querySelector('header');if(!header)return;
const css=document.createElement('style');
css.textContent='.joyi-unified-nav{display:flex;gap:5px;align-items:center;flex:none}.joyi-unified-nav a,.joyi-unified-nav button{font-family:inherit;font-size:clamp(12px,2.6vw,15px)!important;font-weight:900!important;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:#fff!important;color:#584296!important;border:2px solid #fff!important;border-radius:13px!important;padding:7px 9px!important;box-shadow:0 3px 0 #cfc1e9!important;min-width:48px}.joyi-unified-nav button{cursor:pointer}.joyi-time-badge{position:fixed;top:calc(env(safe-area-inset-top, 0px) + 68px);bottom:auto;right:8px;z-index:120;background:#fff9d9;color:#604698;border:2px solid white;border-radius:13px;padding:5px 9px;font-size:12px;font-weight:900;box-shadow:0 2px 8px #46358933;pointer-events:none}.joyi-trophy-shade{position:fixed;inset:0;z-index:99999;display:flex;justify-content:center;align-items:center;padding:20px;background:#2c2465bb}.joyi-trophy-content{background:linear-gradient(145deg,#fff6c7,#fff,#d9f8ed);border:6px solid #fff;border-radius:30px;max-width:430px;width:100%;padding:23px;text-align:center;color:#5e438e;box-shadow:0 12px 0 #9b8eb4}.joyi-trophy-content h2{font-size:clamp(27px,6vw,36px);margin:8px 0}.joyi-trophy-content p{font-size:17px}.joyi-trophy-content a{display:inline-flex;text-decoration:none;padding:14px 19px;background:#7459d3;color:white;border:4px solid white;border-radius:19px;font-weight:900;font-size:17px}@media(max-width:720px){.joyi-unified-nav{gap:3px}.joyi-unified-nav a,.joyi-unified-nav button{padding:6px!important;min-width:43px}header{gap:5px!important}}';
document.head.append(css);
const nav=document.createElement('nav');nav.className='joyi-unified-nav';nav.setAttribute('aria-label','공통 화면 이동');
nav.innerHTML='<button type="button" id="joyi-nav-back" aria-label="이전 화면으로 돌아가기">‹ 뒤로</button><a href="./index.html" aria-label="쪼이랜드 홈으로 이동">🏠 홈</a>';header.prepend(nav);
function reconcileHeader(){
 const current=document.querySelector('header');if(!current)return;
 if(!current.querySelector('.joyi-unified-nav'))current.prepend(nav);
 // Hide a pre-existing top-level Home control; the shared Home link is canonical.
 for(const a of [...current.children]){if(a===nav||a.tagName!=='A')continue;
 const href=a.getAttribute('href')||'',label=(a.textContent||'')+' '+(a.getAttribute('aria-label')||'');
 if((/\bindex\.html(?:\?|$)/.test(href)||href==='./')&&/홈|처음으로/.test(label))a.style.display='none';
 }
}
const navObserver=new MutationObserver(()=>{reconcileHeader()});
navObserver.observe(document.body,{subtree:true,childList:true});
reconcileHeader();
function goBack(){
 if(page==='writing.html'&&document.querySelector('#practice.active')){document.getElementById('back')?.click();return}
 if(page==='journey.html'&&document.body.classList.contains('playing')){document.getElementById('back')?.click();return}
 if(page==='academy.html'&&document.body.classList.contains('playing')){document.getElementById('back')?.click();return}
 if(page==='requests.html'&&document.querySelector('#play.active')){document.getElementById('back')?.click();return}
 if(page==='stories.html'&&document.querySelector('#reader.active')){document.getElementById('back')?.click();return}
 if(page==='mazes.html'&&document.querySelector('#game.active')){document.getElementById('back')?.click();return}
 if(page==='legacy.html'){const back=document.querySelector('[data-a="trace-back"]');if(back){back.click();return}location.href='./index.html';return}
 if(['car-collect.html','car-dodge.html','firetruck-rescue.html'].includes(page)){location.href='./requests.html';return}
 location.href='./index.html';
}
nav.querySelector('button').onclick=goBack;
const gameActive=()=>{
 if(window.JoyiWordGate?.isOpen?.())return false;
 if(page==='adventure.html')return document.body.classList.contains('playing');
 if(page==='mini-games.html')return document.body.classList.contains('playing');
 if(['car-collect.html','car-dodge.html','firetruck-rescue.html'].includes(page))return !!document.querySelector('#overlay.hidden');
 if(page==='writing.html')return !!document.querySelector('#practice.active');
 if(page==='legacy.html')return document.body.classList.contains('joy-playing')&&!document.querySelector('.endboard');
 if(['journey.html','academy.html','finance.html','requests.html'].includes(page))return document.body.classList.contains('playing');
 if(page==='mazes.html')return !!document.querySelector('#game.active');
 if(page==='coding-lab.html')return true;
 return false;
};
let elapsed=0,ended=false,previous=performance.now(),wasPlaying=false,widget=null;
function trophy(){
 if(ended)return;ended=true;try{window.JOY_stopGame?.()}catch(e){}
 const shade=document.createElement('div');shade.className='joyi-trophy-shade';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');shade.setAttribute('aria-label','5분 놀이 완료');
 shade.innerHTML='<div class="joyi-trophy-content"><div style="font-size:75px">🏆🐯</div><h2>5분 놀이 성공!</h2><p>와아, 정말 잘했어!<br>오늘의 트로피를 받았어요! 🎉</p><a href="./index.html">🏠 다른 놀이 선택하기</a></div>';document.body.append(shade);
 try{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('와아! 5분 놀이 성공! 이현이 트로피를 받았어!');u.lang='ko-KR';u.rate=.9;speechSynthesis.speak(u)}}catch(e){}
}
function tick(now){
 const active=gameActive();
 if(!active&&wasPlaying){widget?.remove();widget=null}
 if(active&&!ended){if(wasPlaying)elapsed+=Math.min(1.25,(now-previous)/1000);
  if(!widget){widget=document.createElement('div');widget.className='joyi-time-badge';document.body.append(widget)}
  widget.textContent='🏆 '+Math.max(0,Math.ceil(300-elapsed))+'초 후 트로피';
  if(elapsed>=300)trophy();
 }
 wasPlaying=active;previous=now;
}
setInterval(()=>tick(performance.now()),500);
})();