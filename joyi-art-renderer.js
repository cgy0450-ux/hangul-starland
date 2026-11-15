(()=>{'use strict';if(window.JoyiArt)return;
const MAP={
'🔎':'magnifier','🔍':'magnifier','☝️':'hand','👆':'hand','🎤':'microphone','🎙️':'microphone','🏆':'trophy','🧱':'blocks','🍎':'apple','🍓':'strawberry','🍒':'cherry','⭐':'star','🌟':'star','💫':'star','✨':'star','🌠':'comet',
'🚗':'car','🚙':'car','🚕':'taxi','🚒':'firetruck','🦕':'dinosaur-croc','🦖':'dinosaur-trex','🐉':'dinosaur-dragon','🦎':'dinosaur-lizard','🐢':'turtle','🐊':'dinosaur-croc',
'🐱':'cat','🐶':'dog','🐰':'rabbit','🐸':'frog','🐵':'monkey','🐻':'bear','🐼':'panda','🦊':'fox','🐯':'tiger','🐹':'mole','🐨':'koala','🦌':'deer','🦉':'owl','🐘':'elephant','🐧':'penguin','🐮':'cow','🐷':'pig','🦁':'lion',
'🌻':'flower','🌼':'daisy','🌺':'hibiscus','🌹':'rose','🌳':'tree','🌲':'pine','🌿':'leaf','🎈':'balloon','❤️':'heart','💙':'blueheart','🔵':'blueball','💎':'gem','🫐':'blueberry','🦋':'butterfly','🧢':'cap','🐳':'whale','🧸':'teddy','🎁':'gift','🍄':'mushroom',
'🍌':'banana','🍋':'lemon','🌽':'corn','🧀':'cheese','🐤':'chick','🐥':'chick','☀️':'sun','🌙':'moon','☁️':'cloud','⚽':'ball','🎀':'bow','🍉':'watermelon','🛴':'scooter','🚲':'bicycle','🥕':'carrot','🦴':'bone','🐟':'fish','🍯':'honey','🪁':'kite','🐝':'bee','🐣':'chick','🍍':'pineapple','🍐':'pear','🧺':'basket','🥦':'broccoli','🥒':'cucumber','🍀':'clover','🟢':'greenball','🍅':'tomato','🍰':'cake','🧁':'cupcake','🏡':'house','🍇':'grapes','🍈':'melon','🪐':'saturn','🥚':'egg','🚀':'rocket','🌍':'earth','☄️':'comet','🌈':'rainbow','🧩':'puzzle'
};
const NAME={'🍎':'사과','🍓':'딸기','🍒':'체리','⭐':'별','🚗':'자동차','🚕':'택시','🦕':'디플로도쿠스','🦖':'티라노사우루스','🐱':'고양이','🌻':'해바라기','🎈':'빨간 풍선','🐸':'개구리','🎁':'선물','🐶':'강아지','🐵':'원숭이','🌳':'나무','🐰':'토끼','🍌':'바나나','🍋':'레몬','💎':'파란 보석','🔵':'파란 공','🐹':'두더지','🐻':'곰','🍐':'배','🦋':'파란 나비','🐝':'벌','🧺':'바구니','🪐':'토성','🌙':'달','🌍':'지구','☄️':'혜성','🚀':'로켓','🥕':'당근','🐟':'생선','🦴':'뼈다귀','🍯':'꿀','🍉':'수박','🥚':'알','dinosaur-trex':'티라노사우루스','dinosaur-croc':'디플로도쿠스','dinosaur-dragon':'스테고사우루스','dinosaur-lizard':'파라사우롤로푸스','dinosaur-turtle':'안킬로사우루스','dinosaur':'트리케라톱스'};
const images=new Map();
function source(token){if(/^background\.[a-z]+$/.test(token))return './assets/v13/'+token+'.webp';const id=MAP[token]||(/^[a-z-]+$/.test(token)&&token);return id?'./assets/v13/sprite.'+id+'.webp':null}
function imageFor(token){const src=source(token);if(!src)return null;if(images.has(src))return images.get(src);const img=new Image();img.onload=()=>window.dispatchEvent(new Event('joyi-art-ready'));img.src=src;images.set(src,img);return img}
// Keep the public method name for existing callers; the output is actual generated raster art.
function svg(token,klass='joyi-vector'){const src=source(token);if(!src)return null;const img=new Image();img.className=klass;img.src=src;img.alt='';img.setAttribute('aria-hidden','true');img.draggable=false;return img}
function draw(ctx,token,x,y,w,h){const img=imageFor(token);if(!img||!img.complete||!img.naturalWidth)return false;ctx.drawImage(img,x,y,w,h);return true}
function replace(node,token,{keepText=true}={}){
 const art=svg(token);if(!art)return false;
 const text=document.createElement('span');text.className='joyi-art-label';text.textContent=token;
 node.replaceChildren(art);if(keepText)node.append(text);
 node.classList.add('joyi-art-object');node.setAttribute('aria-label',NAME[token]||token);return true;
}
function decorate(node,token){const art=svg(token);if(art)node.append(art);return art}
const css=document.createElement('style');
css.textContent='.joyi-vector{width:100%;height:100%;min-height:0;max-width:100%;max-height:100%;display:block;overflow:visible;object-fit:contain;filter:drop-shadow(0 5px 3px rgba(58,67,92,.11))}.joyi-art-object{position:relative;overflow:hidden}.joyi-art-object>.joyi-vector{width:100%;height:100%}.joyi-art-label{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.shadowcol button.shadow .joyi-vector{filter:grayscale(1) brightness(0)!important;opacity:.68}.hidden-object .joyi-vector,.diff-target .joyi-vector{filter:drop-shadow(0 5px 3px #4564a23b)}.hole .joyi-vector{width:92%;height:90%;filter:drop-shadow(0 4px 3px #56425e33)}.sort-item .joyi-vector{max-width:200px;max-height:170px}.basket .joyi-vector{height:60px;max-height:70px}';
document.head.append(css);window.JoyiArt={MAP,NAME,svg,replace,decorate,draw,imageFor};
})();