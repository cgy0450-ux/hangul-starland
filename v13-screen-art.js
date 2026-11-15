/* Decorate known art-only slots. Never replace writing surfaces, interactive answer trees or text questions. */
(()=>{'use strict';if(!window.JoyiArt)return;
if(!Intl.Segmenter)return;const A=window.JoyiArt,segmenter=new Intl.Segmenter('ko',{granularity:'grapheme'});
function artOnly(node){
 if(node.querySelector('img,svg,canvas,input,a')||node.querySelector('button'))return;
 const text=node.textContent.trim(),tokens=[...segmenter.segment(text)].map(x=>x.segment).filter(x=>x.trim());
 if(!tokens.length||tokens.length>12||!tokens.every(t=>A.MAP[t]))return;
 node.dataset.visualText=text;if(!node.hasAttribute('aria-label'))node.setAttribute('aria-label',tokens.map(t=>A.NAME[t]||t).join(', '));
 node.replaceChildren(...tokens.map(t=>{const image=A.svg(t);image.classList.add('lesson-raster');return image}));
 node.classList.add('v13-object-group');
}
function decorate(){document.querySelectorAll('#visual,.iconbox,.question-image,.daily-quiz-art,.exampleemoji,.choice .visual-token,#answers .choice').forEach(artOnly)}
let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;decorate()})});
observer.observe(document.body,{childList:true,subtree:true});decorate();
const params=new URLSearchParams(location.search),subject=params.get('subject')||'math';
if(location.pathname.endsWith('academy.html')){const img=document.querySelector('.intro-tiger img');if(img){img.src='./assets/v13/subject.'+subject+'.webp';img.alt=subject+' 학습관의 쪼이'}}
})();
