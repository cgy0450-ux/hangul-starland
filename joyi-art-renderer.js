(()=>{'use strict';if(window.JoyiArt)return;
const MAP={
 '🍎':'apple','🍓':'berry','🍒':'berry','⭐':'star','🌟':'star','💫':'star','✨':'star',
 '🚗':'car','🚙':'car','🚕':'car','🚒':'firetruck','🦕':'dinosaur','🦖':'dinosaur',
 '🐱':'cat','🐶':'dog','🐰':'rabbit','🐸':'frog','🐵':'monkey','🐻':'bear','🐼':'bear',
 '🦊':'cat','🐯':'joyi','🐹':'mole','🐨':'bear','🐧':'duck','🐮':'bear','🐷':'bear',
 '🌻':'flower','🌼':'flower','🌺':'flower','🌹':'flower','🌳':'tree','🌲':'tree','🌿':'tree',
 '🎈':'balloon','❤️':'balloon','💙':'blueball','🔵':'blueball','💎':'gem','🫐':'gem',
 '🦋':'butterfly','🧢':'blueball','🐳':'blueball','🧸':'bear','🎁':'gift','🍄':'flower',
 '🍌':'banana','🍋':'lemon','🌽':'banana','🧀':'lemon','🐤':'duck',
 '☀️':'sun','🌙':'star','☁️':'cloud','⚽':'ball','🎀':'gift','🍉':'apple',
 '🛴':'car','🚲':'car','🥕':'lemon','🦴':'gift','🐟':'gem','🍯':'gift',
 '🪁':'butterfly','🐝':'bee','🐣':'duck','🍍':'lemon','🍐':'pear',
 '🧺':'basket','🥦':'tree','🥒':'tree','🍀':'tree','🟢':'tree','🍅':'apple',
 '🍰':'gift','🧁':'gift','🏡':'tree','🍇':'berry','🍈':'pear','🪐':'blueball',
 '🥚':'egg','🚀':'rocket','🌠':'star','🌈':'butterfly','🧩':'gift'
};
const NAME={'🍎':'사과','🍓':'딸기','⭐':'별','🚗':'자동차','🦕':'공룡','🐱':'고양이','🌻':'꽃','🎈':'풍선','🐸':'개구리','🎁':'선물','🐶':'강아지','🐵':'원숭이','🌳':'나무','🐰':'토끼','🍌':'바나나','🍋':'레몬','💎':'보석','🐹':'두더지','🐻':'곰','🍐':'배','🦋':'나비','🐝':'벌','🧺':'바구니'};
function svg(token,klass='joyi-vector'){
 const id=MAP[token]||(/^[a-z-]+$/.test(token)&&token);if(!id)return null;
 const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.classList.add(klass);
 el.setAttribute('viewBox','0 0 240 180');el.setAttribute('aria-hidden','true');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href','./joyi-illustrations.svg#character-'+id);el.append(use);return el;
}
function replace(node,token,{keepText=true}={}){
 const art=svg(token);if(!art)return false;
 const text=document.createElement('span');text.className='joyi-art-label';text.textContent=token;
 node.replaceChildren(art);if(keepText)node.append(text);
 node.classList.add('joyi-art-object');node.setAttribute('aria-label',NAME[token]||token);return true;
}
function decorate(node,token){const art=svg(token);if(art)node.append(art);return art}
const css=document.createElement('style');
css.textContent='.joyi-vector{width:100%;height:100%;min-height:0;max-width:100%;max-height:100%;display:block;overflow:visible;object-fit:contain;filter:drop-shadow(0 5px 3px rgba(58,67,92,.11))}.joyi-art-object{position:relative;overflow:hidden}.joyi-art-object>.joyi-vector{width:100%;height:100%}.joyi-art-label{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.shadowcol button.shadow .joyi-vector{filter:grayscale(1) brightness(0)!important;opacity:.68}.hidden-object .joyi-vector,.diff-target .joyi-vector{filter:drop-shadow(0 5px 3px #4564a23b)}.hole .joyi-vector{width:92%;height:90%;filter:drop-shadow(0 4px 3px #56425e33)}.sort-item .joyi-vector{max-width:200px;max-height:170px}.basket .joyi-vector{height:60px;max-height:70px}';
document.head.append(css);window.JoyiArt={MAP,NAME,svg,replace,decorate};
})();