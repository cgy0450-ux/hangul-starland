(()=>{'use strict';
if(window.JoyiWordGate)return;
const css=document.createElement('style');css.textContent='.jwg-shade{position:fixed;inset:0;z-index:9900;background:#30245eae;display:flex;align-items:center;justify-content:center;padding:10px;font-family:system-ui,sans-serif}.jwg-card{color:#503778;background:linear-gradient(135deg,#fff1b9,#fff,#defaff);border:6px solid white;border-radius:28px;width:min(94vw,460px);max-height:94dvh;overflow:auto;text-align:center;padding:13px;box-shadow:0 10px 0 #ac9acb}.jwg-card h2{margin:5px;font-size:clamp(20px,5vw,29px)}.jwg-word{font-size:clamp(28px,8vw,43px);font-weight:950;letter-spacing:5px}.jwg-info{font-size:14px;font-weight:800;min-height:38px}.jwg-sheet{width:min(62vw,270px,38dvh);height:min(62vw,270px,38dvh);margin:8px auto;border:6px solid #c7b8f2;border-radius:22px;overflow:hidden;background:white;touch-action:none}.jwg-sheet canvas{display:block;width:100%;height:100%;touch-action:none}.jwg-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.jwg-actions button,.jwg-close{font:900 15px system-ui,sans-serif;color:#604392;background:#e6ddff;border:3px solid white;border-radius:14px;padding:10px 5px;min-height:43px}.jwg-actions .jwg-check{background:#40bba9;color:white}.jwg-actions .jwg-help{background:#fff1b3}.jwg-close{float:right;padding:6px 9px;min-height:31px;background:white}.jwg-current{font-size:17px;font-weight:900}@media(max-height:620px){.jwg-sheet{width:min(38dvh,50vw);height:min(38dvh,50vw)}.jwg-card{padding:7px}}';document.head.append(css);
let active=null;
function voice(t){try{if(JSON.parse(localStorage.getItem('hangul-starland-v1')||'{}').sound===false||!window.speechSynthesis)return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ko-KR';u.rate=.82;window.speechSynthesis.speak(u)}catch(e){}}
function start(word,success,opts={}){
 if(active)active.destroy();
 let chars=[...word],index=0,points=[],drawing=false,locked=false,attempts=0,mask;
 const shade=document.createElement('div');shade.className='jwg-shade';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
 shade.innerHTML='<div class="jwg-card"><button class="jwg-close">‹ 돌아가기</button><h2>✍️ 다음 단계 열쇠!</h2><div class="jwg-word"></div><div class="jwg-current"></div><div class="jwg-sheet"><canvas width="300" height="300"></canvas></div><p class="jwg-info" role="status"></p><div class="jwg-actions"><button class="hear">🔊 다시 듣기</button><button class="clear">🧽 다시 쓰기</button><button class="help jwg-help">💡 도움받기</button><button class="check jwg-check">✅ 다 썼어요</button></div></div>';
 document.body.append(shade);const $=q=>shade.querySelector(q),c=$('canvas'),ctx=c.getContext('2d');
 function paint(){
 ctx.clearRect(0,0,300,300);ctx.fillStyle='white';ctx.fillRect(0,0,300,300);ctx.save();ctx.globalAlpha=.15;ctx.drawImage(mask,0,0);ctx.restore();
 ctx.lineWidth=2;ctx.strokeStyle='#d7c3f0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 230px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';ctx.strokeText(chars[index],150,155,245);
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#33bbaa';ctx.lineWidth=18;
 for(const stroke of points){if(stroke.length===0)continue;ctx.beginPath();ctx.moveTo(stroke[0][0],stroke[0][1]);for(const p of stroke.slice(1))ctx.lineTo(p[0],p[1]);ctx.stroke()}
 }
 function render(){
 points=[];drawing=false;
 $('.jwg-word').textContent=word;$('.jwg-current').textContent='🖐️ '+chars[index]+' · '+(index+1)+' / '+chars.length+'글자';$('.jwg-info').textContent='연한 글자를 따라 써 봐요. 획순은 자유예요!';
 mask=document.createElement('canvas');mask.width=300;mask.height=300;let m=mask.getContext('2d');m.fillStyle='#000';m.font='900 230px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';m.textBaseline='middle';m.textAlign='center';m.fillText(chars[index],150,155,245);paint();
 }
 function pos(e){let r=c.getBoundingClientRect();return [(e.clientX-r.left)*300/r.width,(e.clientY-r.top)*300/r.height]}
 c.addEventListener('pointerdown',e=>{if(locked)return;e.preventDefault();drawing=true;points.push([pos(e)]);try{c.setPointerCapture(e.pointerId)}catch(_){}paint()});
 c.addEventListener('pointermove',e=>{if(!drawing||locked)return;e.preventDefault();points.at(-1).push(pos(e));paint()});
 const stop=e=>{if(!drawing)return;drawing=false;points.at(-1).push(pos(e));paint()};c.addEventListener('pointerup',stop);c.addEventListener('pointercancel',stop);
 function good(){
 if(points.flat().length<6)return false;const test=document.createElement('canvas');test.width=300;test.height=300;let x=test.getContext('2d');x.lineWidth=22;x.lineCap='round';x.lineJoin='round';x.strokeStyle='black';
 for(const stroke of points){if(stroke.length<2)continue;x.beginPath();x.moveTo(...stroke[0]);for(let i=1;i<stroke.length;i++)x.lineTo(...stroke[i]);x.stroke()}
 let a=x.getImageData(0,0,300,300).data,b=mask.getContext('2d').getImageData(0,0,300,300).data;
 let total=0,hit=0,used=0,correct=0,minX=12,maxX=0,minY=12,maxY=0;
 for(let gy=0;gy<12;gy++)for(let gx=0;gx<12;gx++){let g=false,w=false;for(let yy=gy*25;yy<gy*25+25;yy+=4)for(let xx=gx*25;xx<gx*25+25;xx+=4){let i=(yy*300+xx)*4;if(b[i+3]>100)g=true;if(a[i+3]>100)w=true}
 if(g){total++;if(w)hit++}if(w){used++;if(g)correct++;minX=Math.min(minX,gx);maxX=Math.max(maxX,gx);minY=Math.min(minY,gy);maxY=Math.max(maxY,gy)}}
 return total>5&&hit/total>=.43&&correct/Math.max(used,1)>=.42&&maxX-minX>=3&&maxY-minY>=3;
 }
 function destroy(){shade.remove();if(active?.destroy===destroy)active=null}
 function advance(){if(locked)return;locked=true;$('.jwg-info').textContent='🌟 잘했어!';voice('정말 잘했어!');setTimeout(()=>{if(!shade.isConnected)return;locked=false;index++;if(index<chars.length){render();voice(chars[index]+' 따라 써 볼까?')}else{destroy();success?.()}},550)}
 $('.check').onclick=()=>{if(good())advance();else{attempts++;$('.jwg-info').textContent='모양을 조금 더 따라 써 봐요. 어려우면 도움받기!';voice('조금 더 따라 써 볼까?')}};
 $('.help').onclick=advance;$('.hear').onclick=()=>voice(word+'! '+chars[index]+' 글자 쓰기');$('.clear').onclick=()=>{points=[];paint()};$('.jwg-close').onclick=()=>{destroy();opts.onCancel?.()};
 active={destroy};render();voice(word+'! '+chars[0]+' 따라 써 봐요!');return active;
}
window.JoyiWordGate={start,isOpen:()=>!!active};
})();