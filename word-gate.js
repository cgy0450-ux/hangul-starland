(()=>{'use strict';
if(window.JoyiWordGate)return;
const css=document.createElement('style');css.textContent='.jwg-shade{position:fixed;inset:0;z-index:9900;background:#30245eae;display:flex;align-items:center;justify-content:center;padding:10px;font-family:system-ui,sans-serif}.jwg-card{color:#503778;background:linear-gradient(135deg,#fff1b9,#fff,#defaff);border:6px solid white;border-radius:28px;width:min(94vw,460px);max-height:94dvh;overflow:auto;text-align:center;padding:13px;box-shadow:0 10px 0 #ac9acb}.jwg-card h2{margin:5px;font-size:clamp(20px,5vw,29px)}.jwg-word{font-size:clamp(28px,8vw,43px);font-weight:950;letter-spacing:5px}.jwg-info{font-size:14px;font-weight:800;min-height:38px}.jwg-sheet{width:min(62vw,270px,38dvh);height:min(62vw,270px,38dvh);margin:8px auto;border:6px solid #c7b8f2;border-radius:22px;overflow:hidden;background:white;touch-action:none}.jwg-sheet canvas{display:block;width:100%;height:100%;touch-action:none}.jwg-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.jwg-actions button,.jwg-close{font:900 15px system-ui,sans-serif;color:#604392;background:#e6ddff;border:3px solid white;border-radius:14px;padding:10px 5px;min-height:43px}.jwg-actions .jwg-check{background:#40bba9;color:white}.jwg-actions .jwg-help{background:#fff1b3}.jwg-close{float:right;padding:6px 9px;min-height:31px;background:white}.jwg-current{font-size:17px;font-weight:900}@media(max-height:620px){.jwg-sheet{width:min(38dvh,50vw);height:min(38dvh,50vw)}.jwg-card{padding:7px}}';css.textContent+= '.jwg-card{background:linear-gradient(142deg,#f8fbfa,#edf1f7)!important;color:#2e3c55!important;border:1px solid #fff!important;box-shadow:0 25px 65px #18284362!important}.jwg-word{color:#344560!important;letter-spacing:3px!important}.jwg-banner{display:flex;align-items:center;gap:12px;text-align:left;background:#e1eeed;border-radius:17px;padding:8px 12px;margin:12px 0}.jwg-banner svg{width:87px;height:67px;flex:none;border-radius:15px}.jwg-banner strong{display:block;font-size:18px;letter-spacing:-.05em}.jwg-banner small{display:block;color:#617888;font-size:12px;margin-top:3px;line-height:1.3}.jwg-current{color:#526581!important}.jwg-sheet{background:#fff!important;border:3px solid #fff!important;box-shadow:0 12px 24px #59708418!important}.jwg-actions button{background:#fff!important;color:#3e5670!important;border:1px solid #d9e4ec!important;box-shadow:0 4px 11px #526c8319}.jwg-actions .jwg-help{background:#e4f2ed!important}.jwg-info{color:#5e7486!important}.jwg-close{background:#fff!important;color:#4f637e!important}@media(max-height:690px){.jwg-banner{margin:4px 0;padding:4px 8px}.jwg-banner svg{width:62px;height:48px}.jwg-banner strong{font-size:15px}.jwg-banner small{font-size:10px}}';css.textContent+='.jwg-banner img{width:72px;height:72px;object-fit:contain;flex:none}.jwg-steps{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin:5px}.jwg-steps span{border:1px solid #dbe4ed;border-radius:50%;width:23px;height:23px;display:grid;place-items:center;font-size:12px;font-weight:800;color:#75869a}.jwg-steps .passed{background:#37ae9e;color:white}.jwg-steps .now{background:#ed809e;color:white}';document.head.append(css);
let active=null;
function voice(t){try{if(JSON.parse(localStorage.getItem('hangul-starland-v1')||'{}').sound===false||!window.speechSynthesis)return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='ko-KR';u.rate=.82;window.speechSynthesis.speak(u)}catch(e){}}
function start(word,success,opts={}){
 if(active)active.destroy();
 // Explicit user preference only: disabled practice skips the stage gate, never relaxes stroke scoring.
 if(window.JoyiPlaySettings && !window.JoyiPlaySettings.enabled()){queueMicrotask(()=>success?.());return;}
 let chars=[...word],index=0,points=[],drawing=false,locked=false,attempts=0,mask,guide=[],autoTimer=0,done=[],pointer=null;
 const shade=document.createElement('div');shade.className='jwg-shade';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
 shade.innerHTML='<div class="jwg-card"><button class="jwg-close">‹ 돌아가기</button><div class="jwg-banner"><img src="./joyi-hello.svg" alt="쪼이 호랑이"><div><strong>한 글자씩 천천히</strong><small>글씨를 완성하면 다음 모험이 열려요</small></div></div><div class="jwg-word"></div><div class="jwg-current"></div><div class="jwg-steps"></div><div class="jwg-sheet"><canvas width="300" height="300"></canvas></div><p class="jwg-info" role="status"></p><div class="jwg-actions"><button class="hear">🔊 다시 듣기</button><button class="clear">🧽 다시 쓰기</button><button class="help jwg-help">🔍 획순 다시 보기</button><button class="skip">↶ 한 획 다시</button></div></div>';
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
  'ㄷ':[[[16,15],[86,15]],[[16,15],[16,86],[86,86]]],
  'ㄸ':[[[5,14],[44,14]],[[5,14],[5,85],[44,85]],[[55,14],[94,14]],[[55,14],[55,85],[94,85]]],
  'ㄹ':[[[16,14],[86,14],[86,48]],[[16,48],[86,48]],[[17,48],[17,85],[86,85]]],
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
  'ㅓ':[[[22,50],[64,50]],[[64,12],[64,89]]],
  'ㅔ':[[[31,12],[31,89]],[[9,50],[31,50]],[[73,12],[73,89]]],
  'ㅕ':[[[21,35],[64,35]],[[21,63],[64,63]],[[64,12],[64,89]]],
  'ㅖ':[[[29,12],[29,89]],[[7,35],[29,35]],[[7,63],[29,63]],[[71,12],[71,89]]],
  'ㅗ':[[[50,14],[50,79]],[[12,79],[88,79]]],
  'ㅛ':[[[35,14],[35,79]],[[66,14],[66,79]],[[12,79],[88,79]]],
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
function dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}
function nearestPathInfo(pt,path){let best={distance:1e4,t:0};let total=0;for(let i=1;i<path.length;i++)total+=dist(path[i-1],path[i]);let acc=0;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),frac=len?Math.max(0,Math.min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dy)/(len*len))):0;const proj=[a[0]+dx*frac,a[1]+dy*frac];const d=dist(pt,proj);if(d<best.distance)best={distance:d,t:(acc+len*frac)/(total||1)};acc+=len;}return best;}
function traceEvaluation(points,expected){if(!expected||points.length<2)return {ok:false,reason:'시작점부터 차근차근 그어 보자!'};const start=dist(points[0],expected[0]),end=dist(points.at(-1),expected.at(-1));const data=points.map(p=>nearestPathInfo(p,expected));const near=data.filter(d=>d.distance<=10).length/points.length;const steps=[.25,.5,.75].every(k=>data.some(d=>Math.abs(d.t-k)<.12&&d.distance<12));let length=0;for(let i=1;i<points.length;i++)length+=dist(points[i-1],points[i]);let target=0;for(let i=1;i<expected.length;i++)target+=dist(expected[i-1],expected[i]);const backtracks=data.slice(1).filter((d,i)=>d.t<data[i].t-.14).length;const ok=start<=13&&end<=14&&near>=.72&&steps&&length>=target*.65&&length<=target*2.4&&backtracks<=Math.max(2,points.length*.16);return {ok,reason:start>13?'분홍색 시작점부터 시작해 보자!':end>14?'화살표 끝까지 이어서 써 볼까?':'화살표를 따라 천천히 한 번 더 해 보자!',start,end,near,steps,length,target};}

 function progress(){
  $('.jwg-current').textContent=chars[index]+' · '+(index+1)+' / '+chars.length+'글자 · '+done.length+' / '+guide.length+'획';
  const row=$('.jwg-steps');row.replaceChildren();guide.forEach((_,i)=>{const node=document.createElement('span');node.textContent=i+1;node.className=i<done.length?'passed':i===done.length?'now':'';row.append(node)});
 }
 function paint(){
  ctx.clearRect(0,0,300,300);ctx.fillStyle='white';ctx.fillRect(0,0,300,300);
  guide.forEach((path,i)=>{pathStroke(ctx,path,13,'#ddd9e8');if(i===done.length){ctx.save();ctx.setLineDash([4,11]);pathStroke(ctx,path,7,'#ed789b');ctx.restore();const [labelX,labelY]=path[0];ctx.fillStyle='#ed789b';ctx.beginPath();ctx.arc(labelX,labelY,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),labelX,labelY);const [ex,ey]=path.at(-1),[px,py]=path.at(-2),ang=Math.atan2(ey-py,ex-px);ctx.fillStyle='#ed789b';ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-15*Math.cos(ang-.5),ey-15*Math.sin(ang-.5));ctx.lineTo(ex-15*Math.cos(ang+.5),ey-15*Math.sin(ang+.5));ctx.closePath();ctx.fill()}});
  done.forEach(st=>pathStroke(ctx,st,15,'#33bbaa'));if(points.length>1)pathStroke(ctx,points,14,'#7560c5');
 }
 function render(){done=[];points=[];drawing=false;pointer=null;clearTimeout(autoTimer);$('.jwg-word').textContent=word;guide=paths()||[];progress();$('.jwg-info').textContent='분홍색 1번부터 화살표를 따라 써요!';paint()}
 function pos(e){const r=c.getBoundingClientRect();return [(e.clientX-r.left)*300/r.width,(e.clientY-r.top)*300/r.height]}
 function add(p){const last=points.at(-1);if(!last){points.push(p);return}const length=dist(last,p);if(length<.5)return;const n=Math.ceil(length/6);for(let i=1;i<=n;i++)points.push([last[0]+(p[0]-last[0])*i/n,last[1]+(p[1]-last[1])*i/n])}
 function good(){const expected=guide[done.length];if(!expected)return {ok:false,reason:'한 획씩 따라 써요!'};return traceEvaluation(points.map(p=>p.map(v=>v/3)),expected.map(p=>p.map(v=>v/3)))}
 function autoCheck(){if(locked||!guide.length)return;const result=good();if(!result.ok){points=[];$('.jwg-info').textContent=result.reason;paint();return}done.push(points.slice());points=[];progress();paint();if(done.length===guide.length){advance();return}$('.jwg-info').textContent=(done.length+1)+'번 시작점에서 화살표를 따라 써요!'}
 c.addEventListener('pointerdown',e=>{if(locked||drawing||done.length>=guide.length)return;e.preventDefault();const p=pos(e);if(dist(p,guide[done.length][0])>39){$('.jwg-info').textContent='분홍색 시작점부터 시작해 보자!';return}drawing=true;pointer=e.pointerId;points=[p];try{c.setPointerCapture(pointer)}catch(_){}paint()});
 c.addEventListener('pointermove',e=>{if(!drawing||e.pointerId!==pointer||locked)return;e.preventDefault();add(pos(e));paint()});
 c.addEventListener('pointerup',e=>{if(!drawing||e.pointerId!==pointer)return;add(pos(e));drawing=false;pointer=null;autoCheck()});
 c.addEventListener('pointercancel',e=>{if(e.pointerId!==pointer)return;drawing=false;pointer=null;points=[];paint()});
 function destroy(){clearTimeout(autoTimer);shade.remove();if(active?.destroy===destroy)active=null}
 function advance(){if(locked||!guide.length||done.length!==guide.length)return;locked=true;$('.jwg-info').textContent='🌟 잘했어!';voice('정말 잘했어!');setTimeout(()=>{if(!shade.isConnected)return;locked=false;index++;if(index<chars.length){render();voice(chars[index]+' 따라 써 볼까?')}else{destroy();success?.()}},550)}
 $('.help').onclick=()=>{voice('분홍색 숫자에서 시작해 화살표를 따라 써 봐!');$('.jwg-info').textContent='분홍색 ①에서 시작하고, 화살표 끝까지 따라 써요.';paint()};
 $('.skip').onclick=()=>{if(locked)return;done.pop();points=[];progress();paint()};
 $('.hear').onclick=()=>voice(word+'! '+chars[index]+' 따라 쓰기');
 $('.clear').onclick=()=>{if(locked)return;render();$('.jwg-info').textContent='①부터 다시 써 볼까요?'};
 $('.jwg-close').onclick=()=>{destroy();opts.onCancel?.()};
 active={destroy};render();voice(word+'! '+chars[0]+' 따라 써 봐요!');return active;
}
window.JoyiWordGate={start,isOpen:()=>!!active};
})();