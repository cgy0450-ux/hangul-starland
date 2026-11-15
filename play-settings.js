/* User-selected optional stage writing; the stroke evaluator remains strict when enabled. */
(()=>{'use strict';const KEY='joiland-stage-writing-enabled';let memory=true;
function enabled(){try{const value=localStorage.getItem(KEY);return value===null?memory:value!=='false'}catch(e){return memory}}
function set(value){memory=Boolean(value);try{localStorage.setItem(KEY,String(memory))}catch(e){}document.querySelectorAll('[data-stage-writing]').forEach(x=>x.checked=memory);window.dispatchEvent(new Event('joyi-play-settings'))}
window.JoyiPlaySettings={enabled,set};
const pages=['requests.html','mini-games.html','adventure.html','car-collect.html','car-dodge.html','firetruck-rescue.html','parent.html'];
function mount(){if(!pages.includes(location.pathname.split('/').pop()))return;const label=document.createElement('label');label.className='stage-writing-setting';const input=document.createElement('input');input.type='checkbox';input.dataset.stageWriting='';input.checked=enabled();input.onchange=()=>set(input.checked);const text=document.createElement('span');text.textContent='단계 사이 글씨쓰기 연습';const note=document.createElement('small');note.textContent='끄면 바로 다음 놀이로 넘어가요';label.append(input,text,note);const header=document.querySelector('header');if(header)header.after(label);else document.body.prepend(label)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
