/* Decorate known art-only slots. Never replace writing surfaces, interactive answer trees or text questions. */
(()=>{'use strict';if(!window.JoyiArt)return;
if(!Intl.Segmenter)return;const A=window.JoyiArt,segmenter=new Intl.Segmenter('ko',{granularity:'grapheme'});
function artOnly(node){
 if(node.id==='visual'&&node.dataset.sceneSource&&!['🔍','🐯 🔎','🚂 🎯','❔'].includes(node.textContent.trim())){
  const src=node.dataset.sceneSource;if(node.querySelector('img.learning-scene')?.getAttribute('src')===src)return;
  const image=new Image();image.className='history-scene learning-scene';image.src=src;image.alt=node.dataset.sceneAlt||'설명에 맞는 학습 이야기 장면';node.replaceChildren(image);node.classList.add('history-picture');return;
 }
 const portraits={'신사임당':'saimdang','세종대왕':'sejong','이순신':'yisunshin','장영실':'jang','허준':'heojun','유관순':'yugwansun','김구':'kimgu','한복':'hanbok','물레':'spinning','측우기':'raingauge','훈민정음':'hangulbook','장독':'onggi','투호':'tuho','짚신':'jipsin','북':'buk','공기놀이':'gonggi','줄넘기':'jumprope','왕관':'royalcrown'};
 const person=node.dataset.historyAnswer;
 if(portraits[person]&&node.id==='visual'&&!['🔍','🐯 🔎','🚂 🎯','❔'].includes(node.textContent.trim())){
  const src='./assets/v13/history.'+portraits[person]+'.webp';
  if(node.querySelector('img.history-scene')?.getAttribute('src')===src)return;
  const image=new Image();image.className='history-scene';image.src=src;image.alt=person+'의 활동을 보여주는 역사 이야기 장면';node.replaceChildren(image);node.classList.add('history-picture');return;
 }
 node.classList.remove('history-picture');
 if(node.querySelector('img,svg,canvas,input,a')||node.querySelector('button'))return;
 const text=node.textContent.trim(),tokens=[...segmenter.segment(text)].map(x=>x.segment).filter(x=>x.trim());
 if(!tokens.length||tokens.length>120)return;
 if(!tokens.every(t=>A.MAP[t])){
  if(!tokens.some(t=>A.MAP[t]))return;
  const fragments=[...segmenter.segment(text)].map(x=>x.segment);const arrow={'⬆️':'↑','⬇️':'↓','⬅️':'←','➡️':'→','❓':'?'};
  node.dataset.visualText=text;node.replaceChildren(...fragments.map(t=>{if(A.MAP[t]){const im=A.svg(t);im.classList.add('lesson-raster');return im}const span=document.createElement('span');span.className='visual-word';span.textContent=arrow[t]||t;if(t==='\n')span.classList.add('visual-break');return span}));node.classList.add('v13-object-group','mixed-visual');return;
 }
 node.dataset.visualText=text;if(!node.hasAttribute('aria-label'))node.setAttribute('aria-label',tokens.map(t=>A.NAME[t]||t).join(', '));
 node.replaceChildren(...tokens.map(t=>{const image=A.svg(t);image.classList.add('lesson-raster');return image}));
 node.classList.add('v13-object-group');
}
function decorate(){document.querySelectorAll('#visual,.iconbox,.question-image,.daily-quiz-art,.exampleemoji,.choice .visual-token,#answers .choice,#choices .choice').forEach(artOnly)}
let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;decorate()})});
observer.observe(document.body,{childList:true,subtree:true});decorate();
const params=new URLSearchParams(location.search),subject=params.get('subject')||'math';
if(location.pathname.endsWith('academy.html')){const img=document.querySelector('.intro-tiger img');if(img){img.src='./assets/v13/subject.'+subject+'.webp';img.alt=subject+' 학습관의 쪼이'}}
})();
