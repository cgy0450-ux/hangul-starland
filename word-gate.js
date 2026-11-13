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
 // 모든 완성형 한글을 같은 규칙으로 분해한 후 배치합니다.
 // 수동으로 그린 완성형 SEG 템플릿은 일부 글자가 틀려 전부 제거합니다.
 const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
 const JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
 const JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
 // 좌표는 모두 0~100 기준이며 획마다 별도의 경로를 유지합니다.
 const JAMO={
  'ㄱ':[[[13,15],[86,15],[86,87]]],
  'ㄲ':[[[5,14],[44,14],[44,87]],[[55,14],[94,14],[94,87]]],
  'ㄴ':[[[16,13],[16,86],[87,86]]],
  'ㄷ':[[[86,15],[16,15]],[[16,15],[16,86],[86,86]]],
  'ㄸ':[[[5,14],[44,14]],[[5,14],[5,85],[44,85]],[[55,14],[94,14]],[[55,14],[55,85],[94,85]]],
  'ㄹ':[[[16,14],[86,14],[86,48],[17,48]],[[17,48],[17,85],[86,85]]],
  'ㅁ':[[[15,14],[15,87]],[[15,14],[85,14],[85,87]],[[15,87],[85,87]]],
  'ㅂ':[[[16,13],[16,85]],[[85,13],[85,85]],[[16,47],[85,47]],[[16,85],[85,85]]],
  'ㅃ':[[[4,13],[4,85]],[[43,13],[43,85]],[[4,48],[43,48]],[[4,85],[43,85]],[[56,13],[56,85]],[[95,13],[95,85]],[[56,48],[95,48]],[[56,85],[95,85]]],
  'ㅅ':[[[51,14],[15,87]],[[51,14],[87,87]]],
  'ㅆ':[[[27,14],[6,86]],[[27,14],[48,86]],[[73,14],[52,86]],[[73,14],[94,86]]],
  'ㅇ':[[[50,13],[28,21],[16,45],[20,70],[38,86],[61,86],[81,68],[85,44],[71,20],[50,13]]],
  'ㅈ':[[[14,15],[87,15]],[[51,15],[14,87]],[[51,15],[87,87]]],
  'ㅉ':[[[4,15],[45,15]],[[25,15],[3,87]],[[25,15],[47,87]],[[54,15],[96,15]],[[75,15],[53,87]],[[75,15],[97,87]]],
  'ㅊ':[[[35,5],[66,5]],[[14,30],[87,30]],[[51,30],[14,88]],[[51,30],[87,88]]],
  'ㅋ':[[[13,15],[87,15],[87,87]],[[18,52],[86,52]]],
  'ㅌ':[[[16,15],[86,15]],[[16,15],[16,85],[86,85]],[[16,51],[86,51]]],
  'ㅍ':[[[14,16],[86,16]],[[14,84],[86,84]],[[35,17],[35,83]],[[66,17],[66,83]]],
  'ㅎ':[[[38,6],[65,6]],[[17,27],[84,27]],[[51,43],[30,52],[20,70],[39,87],[64,87],[82,70],[70,48],[51,43]]],
  'ㅏ':[[[43,12],[43,89]],[[43,50],[83,50]]],
  'ㅐ':[[[29,12],[29,89]],[[29,50],[51,50]],[[72,12],[72,89]]],
  'ㅑ':[[[43,12],[43,89]],[[43,35],[82,35]],[[43,63],[82,63]]],
  'ㅒ':[[[25,12],[25,89]],[[25,35],[48,35]],[[25,63],[48,63]],[[75,12],[75,89]]],
  'ㅓ':[[[64,12],[64,89]],[[22,50],[64,50]]],
  'ㅔ':[[[31,12],[31,89]],[[9,50],[31,50]],[[73,12],[73,89]]],
  'ㅕ':[[[64,12],[64,89]],[[21,35],[64,35]],[[21,63],[64,63]]],
  'ㅖ':[[[29,12],[29,89]],[[7,35],[29,35]],[[7,63],[29,63]],[[71,12],[71,89]]],
  'ㅗ':[[[50,14],[50,66]],[[12,79],[88,79]]],
  'ㅛ':[[[35,14],[35,65]],[[66,14],[66,65]],[[12,79],[88,79]]],
  'ㅜ':[[[12,27],[88,27]],[[50,27],[50,88]]],
  'ㅠ':[[[12,27],[88,27]],[[35,27],[35,88]],[[66,27],[66,88]]],
  'ㅡ':[[[12,53],[88,53]]],
  'ㅣ':[[[51,12],[51,89]]],
  'ㅘ':[[[31,11],[31,51]],[[5,60],[55,60]],[[76,10],[76,91]],[[76,48],[96,48]]],
  'ㅙ':[[[22,11],[22,51]],[[3,60],[42,60]],[[49,10],[49,91]],[[49,48],[65,48]],[[84,10],[84,91]]],
  'ㅚ':[[[30,12],[30,54]],[[8,63],[55,63]],[[79,12],[79,90]]],
  'ㅝ':[[[6,28],[55,28]],[[30,28],[30,87]],[[83,10],[83,90]],[[62,49],[83,49]]],
  'ㅞ':[[[5,28],[43,28]],[[25,28],[25,87]],[[57,12],[57,90]],[[44,49],[57,49]],[[87,12],[87,90]]],
  'ㅟ':[[[7,28],[53,28]],[[30,28],[30,87]],[[80,11],[80,90]]],
  'ㅢ':[[[5,55],[53,55]],[[82,11],[82,90]]]
 };
 const COMPLEX_FINAL={
  'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],
  'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],'ㄽ':['ㄹ','ㅅ'],
  'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ']
 };
 function transformPaths(strokes,x,y,w,h){
  return strokes.map(st=>st.map(([px,py])=>[
   Math.round((x+w*px/100)*10)/10,Math.round((y+h*py/100)*10)/10
  ]));
 }
 function vowelIsVertical(jung){
  return ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ'].includes(jung);
 }
 function pathsForHangul(ch){
  const n=ch.codePointAt(0)-0xAC00;
  if(n<0||n>=11172)return JAMO[ch]?transformPaths(JAMO[ch],70,60,160,180):null;
  const cho=CHO[Math.floor(n/588)],jung=JUNG[Math.floor((n%588)/28)],jong=JONG[n%28];
  if(!JAMO[cho]||!JAMO[jung])return null;
  const hasFinal=Boolean(jong),vertical=vowelIsVertical(jung);
  const upperTop=hasFinal?25:30, upperHeight=hasFinal?156:208;
  let paths=[];
  if(vertical){
   paths.push(...transformPaths(JAMO[cho],33,upperTop,116,upperHeight));
   paths.push(...transformPaths(JAMO[jung],159,upperTop,110,upperHeight));
  }else{
   paths.push(...transformPaths(JAMO[cho],58,hasFinal?18:20,184,hasFinal?105:148));
   paths.push(...transformPaths(JAMO[jung],43,hasFinal?133:174,216,hasFinal?58:79));
  }
  if(hasFinal){
   if(COMPLEX_FINAL[jong]){
    const [first,second]=COMPLEX_FINAL[jong];
    paths.push(...transformPaths(JAMO[first],62,204,91,77));
    paths.push(...transformPaths(JAMO[second],155,204,91,77));
   }else if(JAMO[jong])paths.push(...transformPaths(JAMO[jong],76,204,148,78));
  }
  return paths;
 }
 // Export the pure geometry for GitHub regression checks without a DOM.
 window.JoyiHangulGuide={pathsForHangul};
 function paths(){return pathsForHangul(chars[index])}
 function pathStroke(canvasCtx,path,width,color){canvasCtx.strokeStyle=color;canvasCtx.lineWidth=width;canvasCtx.lineCap='round';canvasCtx.lineJoin='round';canvasCtx.beginPath();canvasCtx.moveTo(...path[0]);for(const v of path.slice(1))canvasCtx.lineTo(...v);canvasCtx.stroke()}
 function paint(){
  ctx.clearRect(0,0,300,300);ctx.fillStyle='white';ctx.fillRect(0,0,300,300);
  ctx.save();ctx.globalAlpha=.20;ctx.drawImage(mask,0,0);ctx.restore();
  if(guide.length){guide.forEach((path,i)=>{
    ctx.save();ctx.strokeStyle='#c6b6ec';ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.setLineDash([4,11]);ctx.beginPath();ctx.moveTo(...path[0]);for(const pt of path.slice(1))ctx.lineTo(...pt);ctx.stroke();ctx.setLineDash([]);
    const [ex,ey]=path.at(-1),[px,py]=path.at(-2);
    // 번호는 시작점을 가리지 않게 바깥으로 배치하며 획 자체는 원래 좌표에 둡니다.
    let [x,y]=path[0];let labelX=x,labelY=y;
    const prior=guide.slice(0,i).filter(p=>Math.hypot(p[0][0]-x,p[0][1]-y)<19).length;
    if(prior){const angle=(prior%4)*Math.PI/2;labelX=Math.max(13,Math.min(287,x+22*Math.cos(angle)));labelY=Math.max(13,Math.min(287,y-22+12*Math.sin(angle)))}
    ctx.save();ctx.strokeStyle='#ee789b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(labelX,labelY);ctx.stroke();ctx.restore();
    ctx.fillStyle='#ee789b';ctx.beginPath();ctx.arc(labelX,labelY,Math.max(9,Math.min(12,75/Math.sqrt(guide.length))),0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='900 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),labelX,labelY);
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
  let m=mask.getContext('2d');if(guide.length){guide.forEach(path=>pathStroke(m,path,17,'#000'))}
  else{m.fillStyle='#000';m.font='900 230px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';m.textBaseline='middle';m.textAlign='center';m.fillText(chars[index],150,155,245)}
  paint();
 }
 function pos(e){let r=c.getBoundingClientRect();return [(e.clientX-r.left)*300/r.width,(e.clientY-r.top)*300/r.height]}
 c.addEventListener('pointerdown',e=>{if(locked)return;e.preventDefault();drawing=true;points.push([pos(e)]);try{c.setPointerCapture(e.pointerId)}catch(_){}paint()});
 c.addEventListener('pointermove',e=>{if(!drawing||locked)return;e.preventDefault();points.at(-1).push(pos(e));paint()});
 const stop=e=>{if(!drawing)return;drawing=false;points.at(-1).push(pos(e));paint();autoTimer=setTimeout(autoCheck,220)};c.addEventListener('pointerup',stop);c.addEventListener('pointercancel',stop);

 function good(){
  if(points.flat().length<8)return false;
  // Match every Hangul component independently; completing only ㄷ of '두' or
  // '두더지' must never be recognized as completing the entire syllable.
  const ink=document.createElement('canvas');ink.width=300;ink.height=300;
  const x=ink.getContext('2d');x.lineWidth=24;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#000';
  for(const stroke of points){if(stroke.length<2)continue;x.beginPath();x.moveTo(...stroke[0]);for(const p of stroke.slice(1))x.lineTo(...p);x.stroke()}
  const a=x.getImageData(0,0,300,300).data;
  const n=chars[index].codePointAt(0)-0xAC00;
  if(n<0||n>=11172)return false;
  const initial=CHO[Math.floor(n/588)],vowel=JUNG[Math.floor((n%588)/28)],final=JONG[n%28];
  const componentLengths=[JAMO[initial]?.length||0,JAMO[vowel]?.length||0];
  if(final)componentLengths.push(COMPLEX_FINAL[final]?(JAMO[COMPLEX_FINAL[final][0]].length+JAMO[COMPLEX_FINAL[final][1]].length):JAMO[final]?.length||0);
  if(componentLengths.some(n=>!n))return false;
  // Check all strokes within a component as one masked shape; this is much
  // more child-friendly than enforcing exact stroke order or stroke count.
  let start=0;let allGuide=0,allHit=0;
  for(const count of componentLengths){
    const component=guide.slice(start,start+count);start+=count;
    const cv=document.createElement('canvas');cv.width=300;cv.height=300;const cx=cv.getContext('2d');
    component.forEach(path=>pathStroke(cx,path,20,'#000'));
    const b=cx.getImageData(0,0,300,300).data;
    let total=0,hit=0;
    for(let gy=0;gy<15;gy++)for(let gx=0;gx<15;gx++){
      let target=false,drawn=false;
      for(let yy=gy*20+2;yy<gy*20+20;yy+=4)for(let xx=gx*20+2;xx<gx*20+20;xx+=4){
        const i=(yy*300+xx)*4;
        if(b[i+3]>100)target=true;
        if(a[i+3]>100)drawn=true;
      }
      if(target){total++;if(drawn)hit++}
    }
    if(total<2||hit/total<.48)return false;
    allGuide+=total;allHit+=hit;
  }
  // A finger-drawn line crossing each component by chance should not count:
  // require enough total overlap and area coverage as well.
  const actual=mask.getContext('2d').getImageData(0,0,300,300).data;
  let guideCells=0,overlap=0,inkCells=0,nearCells=0;
  for(let gy=0;gy<15;gy++)for(let gx=0;gx<15;gx++){
    let target=false,drawn=false;
    for(let yy=gy*20+2;yy<gy*20+20;yy+=4)for(let xx=gx*20+2;xx<gx*20+20;xx+=4){
      const i=(yy*300+xx)*4;
      if(actual[i+3]>100)target=true;
      if(a[i+3]>100)drawn=true;
    }
    if(target){guideCells++;if(drawn)overlap++}
    if(drawn){inkCells++;if(target)nearCells++}
  }
  return allHit/Math.max(allGuide,1)>=.57&&
    overlap/Math.max(guideCells,1)>=.54&&
    nearCells/Math.max(inkCells,1)>=.40;
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