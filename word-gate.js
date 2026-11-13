(()=>{'use strict';
if(window.JoyiWordGate)return;
const css=document.createElement('style');css.textContent='.jwg-shade{position:fixed;inset:0;z-index:9900;background:#30245eae;display:flex;align-items:center;justify-content:center;padding:10px;font-family:system-ui,sans-serif}.jwg-card{color:#503778;background:linear-gradient(135deg,#fff1b9,#fff,#defaff);border:6px solid white;border-radius:28px;width:min(94vw,460px);max-height:94dvh;overflow:auto;text-align:center;padding:13px;box-shadow:0 10px 0 #ac9acb}.jwg-card h2{margin:5px;font-size:clamp(20px,5vw,29px)}.jwg-word{font-size:clamp(28px,8vw,43px);font-weight:950;letter-spacing:5px}.jwg-info{font-size:14px;font-weight:800;min-height:38px}.jwg-sheet{width:min(62vw,270px,38dvh);height:min(62vw,270px,38dvh);margin:8px auto;border:6px solid #c7b8f2;border-radius:22px;overflow:hidden;background:white;touch-action:none}.jwg-sheet canvas{display:block;width:100%;height:100%;touch-action:none}.jwg-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.jwg-actions button,.jwg-close{font:900 15px system-ui,sans-serif;color:#604392;background:#e6ddff;border:3px solid white;border-radius:14px;padding:10px 5px;min-height:43px}.jwg-actions .jwg-check{background:#40bba9;color:white}.jwg-actions .jwg-help{background:#fff1b3}.jwg-close{float:right;padding:6px 9px;min-height:31px;background:white}.jwg-current{font-size:17px;font-weight:900}@media(max-height:620px){.jwg-sheet{width:min(38dvh,50vw);height:min(38dvh,50vw)}.jwg-card{padding:7px}}';document.head.append(css);
let active=null;
function voice(t){try{if(JSON.parse(localStorage.getItem('hangul-starland-v1')||'{}').sound===false||!window.speechSynthesis)return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ko-KR';u.rate=.82;window.speechSynthesis.speak(u)}catch(e){}}
function start(word,success,opts={}){
 if(active)active.destroy();
 let chars=[...word],index=0,points=[],drawing=false,locked=false,attempts=0,mask,guide=[],autoTimer=0;
 const shade=document.createElement('div');shade.className='jwg-shade';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
 shade.innerHTML='<div class="jwg-card"><button class="jwg-close">‹ 돌아가기</button><h2>✍️ 다음 단계 열쇠!</h2><div class="jwg-word"></div><div class="jwg-current"></div><div class="jwg-sheet"><canvas width="300" height="300"></canvas></div><p class="jwg-info" role="status"></p><div class="jwg-actions"><button class="hear">🔊 다시 듣기</button><button class="clear">🧽 다시 쓰기</button><button class="help jwg-help">🔍 획순 다시 보기</button><button class="skip">💛 너무 어려워요</button></div></div>';
 document.body.append(shade);const $=q=>shade.querySelector(q),c=$('canvas'),ctx=c.getContext('2d');

 // 수업에서 사용되는 글자는 정확한 자모 배치로 그린 안내 획을 사용합니다.
 // 각 경로: 첫 점이 시작점, 끝 점이 화살표 방향입니다.
 const SEG={
  '소':[[[82,72],[44,138]],[[82,72],[120,138]],[[45,174],[215,174]],[[129,174],[129,228]]],
  '방':[[[53,52],[53,145]],[[53,54],[120,54]],[[53,98],[120,98]],[[53,145],[120,145]],[[165,46],[165,157]],[[165,98],[232,98]],[[62,220],[97,191],[131,220],[97,251],[62,220]]],
  '차':[[[62,50],[122,50]],[[52,91],[131,91]],[[90,91],[46,159]],[[90,91],[132,159]],[[180,45],[180,231]],[[180,123],[241,123]]],
  '자':[[[58,54],[127,54]],[[91,54],[53,155]],[[91,54],[130,155]],[[179,45],[179,226]],[[179,126],[237,126]]],
  '동':[[[55,57],[125,57]],[[55,57],[55,141]],[[55,141],[125,141]],[[43,171],[221,171]],[[132,171],[132,205]],[[66,246],[95,222],[126,246],[95,271],[66,246]]],
  '공':[[[62,48],[129,48]],[[129,48],[129,135]],[[45,158],[226,158]],[[132,158],[132,190]],[[73,238],[99,209],[131,238],[99,269],[73,238]]],
  '룡':[[[51,47],[122,47]],[[51,47],[51,106]],[[51,106],[124,106]],[[124,106],[124,138]],[[51,138],[125,138]],[[48,178],[221,178]],[[95,178],[95,199]],[[167,178],[167,199]],[[75,245],[103,216],[131,245],[103,272],[75,245]]],
  '우':[[[58,88],[91,47],[125,88],[91,135],[58,88]],[[43,181],[224,181]],[[130,181],[130,235]]],
  '주':[[[49,56],[131,56]],[[90,56],[52,139]],[[90,56],[130,139]],[[40,181],[229,181]],[[132,181],[132,235]]],
  '물':[[[52,49],[52,139]],[[52,49],[132,49],[132,139]],[[52,139],[132,139]],[[45,172],[222,172]],[[130,172],[130,196]],[[62,225],[130,225]],[[62,225],[62,255]],[[62,255],[133,255]],[[133,255],[133,278]],[[61,278],[137,278]]],
  '알':[[[72,86],[98,53],[126,86],[98,123],[72,86]],[[177,50],[177,145]],[[177,105],[236,105]],[[53,182],[126,182]],[[53,182],[53,216]],[[53,216],[127,216]],[[127,216],[127,253]],[[55,253],[134,253]]],
  '별':[[[52,45],[52,140]],[[52,45],[121,45]],[[52,96],[121,96]],[[52,140],[121,140]],[[165,49],[165,158]],[[165,96],[237,96]],[[58,205],[132,205]],[[58,205],[58,235]],[[58,235],[132,235]],[[132,235],[132,264]],[[62,264],[135,264]]],
  '행':[[[50,54],[126,54]],[[88,54],[88,137]],[[54,98],[125,98]],[[166,55],[166,149]],[[166,98],[239,98]],[[59,222],[91,192],[125,222],[91,254],[59,222]]],
  '성':[[[50,58],[128,58]],[[90,58],[48,143]],[[90,58],[131,143]],[[163,52],[163,150]],[[163,98],[229,98]],[[62,222],[96,194],[128,222],[96,253],[62,222]]],
  '화':[[[46,58],[116,58]],[[81,58],[81,144]],[[47,101],[117,101]],[[165,50],[165,155]],[[165,103],[232,103]],[[45,177],[224,177]],[[133,177],[133,231]]],
  '석':[[[54,53],[133,53]],[[93,53],[52,152]],[[93,53],[131,152]],[[158,43],[158,159]],[[158,100],[238,100]],[[53,200],[134,200]],[[53,200],[53,254]],[[53,254],[135,254]]],
  '먹':[[[49,52],[133,52]],[[49,52],[49,120]],[[49,120],[133,120]],[[133,52],[133,120]],[[164,50],[164,158]],[[164,98],[228,98]],[[54,206],[129,206]],[[54,206],[54,260]],[[54,260],[135,260]]],
  '이':[[[69,87],[103,48],[136,87],[103,130],[69,87]],[[197,42],[197,239]]],
  '친':[[[48,52],[131,52]],[[90,52],[53,133]],[[90,52],[128,133]],[[170,51],[170,159]],[[170,100],[235,100]],[[46,196],[122,196]],[[46,196],[46,252]],[[46,252],[129,252]]],
  '구':[[[49,54],[129,54]],[[129,54],[129,142]],[[42,180],[226,180]],[[132,180],[132,237]]]
 };
 function paths(){return SEG[chars[index]]||null}
 function pathStroke(canvasCtx,path,width,color){canvasCtx.strokeStyle=color;canvasCtx.lineWidth=width;canvasCtx.lineCap='round';canvasCtx.lineJoin='round';canvasCtx.beginPath();canvasCtx.moveTo(...path[0]);for(const v of path.slice(1))canvasCtx.lineTo(...v);canvasCtx.stroke()}
 function paint(){
  ctx.clearRect(0,0,300,300);ctx.fillStyle='white';ctx.fillRect(0,0,300,300);
  ctx.save();ctx.globalAlpha=.20;ctx.drawImage(mask,0,0);ctx.restore();
  if(guide.length){guide.forEach((path,i)=>{
    ctx.save();ctx.strokeStyle='#c6b6ec';ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.setLineDash([4,11]);ctx.beginPath();ctx.moveTo(...path[0]);for(const pt of path.slice(1))ctx.lineTo(...pt);ctx.stroke();ctx.setLineDash([]);
    const [x,y]=path[0], [ex,ey]=path.at(-1),[px,py]=path.at(-2);
    ctx.fillStyle='#ee789b';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='900 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),x,y);
    const ang=Math.atan2(ey-py,ex-px);ctx.fillStyle='#ef7899';ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-16*Math.cos(ang-.5),ey-16*Math.sin(ang-.5));ctx.lineTo(ex-16*Math.cos(ang+.5),ey-16*Math.sin(ang+.5));ctx.closePath();ctx.fill();ctx.restore();
  })}
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#33bbaa';ctx.lineWidth=18;
  for(const stroke of points){if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(...stroke[0]);for(const p of stroke.slice(1))ctx.lineTo(...p);ctx.stroke()}
 }
 function render(){
  points=[];drawing=false;attempts=0;clearTimeout(autoTimer);
  $('.jwg-word').textContent=word;$('.jwg-current').textContent='🖐️ '+chars[index]+' · '+(index+1)+' / '+chars.length+'글자';
  $('.jwg-info').textContent='① 분홍색 시작점부터 화살표 방향으로 써요!';
  guide=paths()||[];mask=document.createElement('canvas');mask.width=300;mask.height=300;
  let m=mask.getContext('2d');if(guide.length){guide.forEach(path=>pathStroke(m,path,23,'#000'))}
  else{m.fillStyle='#000';m.font='900 230px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';m.textBaseline='middle';m.textAlign='center';m.fillText(chars[index],150,155,245)}
  paint();
 }
 function pos(e){let r=c.getBoundingClientRect();return [(e.clientX-r.left)*300/r.width,(e.clientY-r.top)*300/r.height]}
 c.addEventListener('pointerdown',e=>{if(locked)return;e.preventDefault();drawing=true;points.push([pos(e)]);try{c.setPointerCapture(e.pointerId)}catch(_){}paint()});
 c.addEventListener('pointermove',e=>{if(!drawing||locked)return;e.preventDefault();points.at(-1).push(pos(e));paint()});
 const stop=e=>{if(!drawing)return;drawing=false;points.at(-1).push(pos(e));paint();autoTimer=setTimeout(autoCheck,220)};c.addEventListener('pointerup',stop);c.addEventListener('pointercancel',stop);

 function good(){
 if(points.flat().length<6)return false;
 const test=document.createElement('canvas');test.width=300;test.height=300;let x=test.getContext('2d');x.lineWidth=29;x.lineCap='round';x.lineJoin='round';x.strokeStyle='black';
 for(const stroke of points){if(stroke.length<2)continue;x.beginPath();x.moveTo(...stroke[0]);for(const p of stroke.slice(1))x.lineTo(...p);x.stroke()}
 const a=x.getImageData(0,0,300,300).data,b=mask.getContext('2d').getImageData(0,0,300,300).data;
 let total=0,hit=0,used=0,correct=0,minX=12,maxX=0,minY=12,maxY=0;
 for(let gy=0;gy<12;gy++)for(let gx=0;gx<12;gx++){let g=false,w=false;
  for(let yy=gy*25;yy<gy*25+25;yy+=4)for(let xx=gx*25;xx<gx*25+25;xx+=4){let i=(yy*300+xx)*4;if(b[i+3]>90)g=true;if(a[i+3]>90)w=true}
  if(g){total++;if(w)hit++}if(w){used++;if(g)correct++;minX=Math.min(minX,gx);maxX=Math.max(maxX,gx);minY=Math.min(minY,gy);maxY=Math.max(maxY,gy)}
 }
 return total>4&&hit/total>=.42&&correct/Math.max(used,1)>=.40&&maxX-minX>=3&&maxY-minY>=3;
 }
 function autoCheck(){clearTimeout(autoTimer);if(!locked&&good()){advance();return}if(points.flat().length>=5){$('.jwg-info').textContent='좋아요! 나머지 점선도 따라 써 봐요.'}}
 function destroy(){clearTimeout(autoTimer);shade.remove();if(active?.destroy===destroy)active=null}
 function advance(){if(locked)return;locked=true;$('.jwg-info').textContent='🌟 잘했어!';voice('정말 잘했어!');setTimeout(()=>{if(!shade.isConnected)return;locked=false;index++;if(index<chars.length){render();voice(chars[index]+' 따라 써 볼까?')}else{destroy();success?.()}},550)}
 $('.help').onclick=()=>{voice('분홍색 숫자에서 시작해 화살표를 따라 써 봐!');$('.jwg-info').textContent='분홍색 ①에서 시작하고, 화살표 끝까지 따라 써요.';paint()};
 $('.skip').onclick=()=>{if(points.flat().length>=5){advance()}else{$('.jwg-info').textContent='먼저 손가락으로 글자를 조금 써 볼까요?';voice('글자를 조금 써 보고 도움을 받아 봐!')}};
 $('.hear').onclick=()=>voice(word+'! '+chars[index]+' 따라 쓰기');
 $('.clear').onclick=()=>{clearTimeout(autoTimer);points=[];paint();$('.jwg-info').textContent='①부터 다시 써 볼까요?'};
 $('.jwg-close').onclick=()=>{destroy();opts.onCancel?.()};
 active={destroy};render();voice(word+'! '+chars[0]+' 따라 써 봐요!');return active;
}
window.JoyiWordGate={start,isOpen:()=>!!active};
})();