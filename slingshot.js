(()=>{'use strict';
const {Engine,Bodies,Body,Composite,Events}=Matter,$=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),engine=Engine.create({enableSleeping:true}),world=engine.world;
const anchor={x:135,y:365},images={},paths={background:'sling.background',bird:'sling.bird',plank:'sling.stone',pillar:'sling.column',crystal:'sling.crystal',sling:'sling.sling',reward:'sling.reward',bomb:'sling.bomb',blast:'sling.blast',cracked:'sling.cracked',armor:'sling.armor'};
ctx.scale(2,2);
let level=1,shots=5,bird=null,blocks=[],targets=[],particles=[],drag=null,phase='ready',flight=0,started=null,ended=false,last=0,sound=true,angle=.25,detonated=false,fuse=null,blast=null;
try{sound=JSON.parse(localStorage.getItem('hangul-starland-v1')||'{}').sound!==false;level=Math.min(12,Math.max(1,Number(localStorage.getItem('joyi-sling-level'))||1))}catch(e){}
const art=(key,x,y,w,h,a=0)=>{const im=images[key];if(!im?.complete||!im.naturalWidth)return;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()};
const ui=()=>{$('level').textContent=level+' / 12 단계';$('shots').textContent='남은 발사 '+shots+'번';$('launch').disabled=phase!=='ready'||ended;$('detonate').disabled=phase!=='flying'||detonated||ended;$('sound').textContent=sound?'소리 켬':'소리 끔'};
function tone(){if(!sound)return;try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.06,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.2);o.frequency.setValueAtTime(720,a.currentTime);o.frequency.exponentialRampToValueAtTime(1100,a.currentTime+.2);o.start();o.stop(a.currentTime+.2);o.onended=()=>a.close()}catch(e){}}
function modal(title,detail,label,action){$('action').hidden=false;$('title').textContent=title;$('detail').textContent=detail;$('action').textContent=label;$('action').onclick=action;$('message').hidden=false}
function setup(){Composite.clear(world,false);blocks=[];targets=[];bird=null;particles=[];drag=null;shots=level>=9?5:level>=4?4:3;detonated=false;fuse=null;blast=null;phase='ready';$('message').hidden=true;Composite.add(world,[Bodies.rectangle(320,550,1400,60,{isStatic:true}),Bodies.rectangle(-20,200,40,1000,{isStatic:true}),Bodies.rectangle(660,200,40,1000,{isStatic:true})]);
 const towers=level<4?1:2,rows=1+Math.floor((level-1)/4);
 for(let t=0;t<towers;t++){const x=towers===1?470:410+t*145;for(let row=0;row<rows;row++){const y=490-row*105;for(const dx of [-(30+(level-1)%4*6),30+(level-1)%4*6]){const b=Bodies.rectangle(x+dx,y,27,60,{density:.008,friction:.9,restitution:.05});b.art='pillar';b.hp=b.maxHp=160;blocks.push(b)}const plank=Bodies.rectangle(x,y-43,112,24,{density:.008,friction:.9});plank.art='plank';plank.hp=plank.maxHp=180;blocks.push(plank)}const gem=Bodies.circle(x,520-(rows-1)*105-30,17,{density:.001,restitution:.15});gem.isGem=true;gem.hp=gem.maxHp=180;gem.home={x:gem.position.x,y:gem.position.y};targets.push(gem)}
 Composite.add(world,[...blocks,...targets]);for(let i=0;i<100;i++)Engine.update(engine,1000/60);targets.forEach(g=>g.home={...g.position});$('hint').textContent='단단한 돌 요새! 가까이 보내고 타이밍에 맞춰 펑!';ui();}
function collect(g){if(g.collected)return;g.collected=true;for(let i=0;i<14;i++)particles.push({x:g.position.x,y:g.position.y,vx:(Math.random()-.5)*6,vy:-Math.random()*5,life:55});Composite.remove(world,g);tone();}
function damage(body,amount){
 if(body.collected||body.destroyed||!body.hp)return;
 body.hp=Math.max(0,body.hp-amount);
 if(body.hp===0){if(body.isGem)collect(body);else{body.destroyed=true;for(let i=0;i<8;i++)particles.push({x:body.position.x,y:body.position.y,vx:(Math.random()-.5)*6,vy:-Math.random()*5,life:65,kind:'plank',angle:Math.random()*6,spin:(Math.random()-.5)*.3});Composite.remove(world,body)}}
}
function explode(){
 if(phase!=='flying'||detonated||!bird)return;
 detonated=true;blast={x:bird.position.x,y:bird.position.y,age:0};
 for(const body of [...blocks,...targets]){
  if(body.collected||body.destroyed)continue;
  const dx=body.position.x-blast.x,dy=body.position.y-blast.y,d=Math.hypot(dx,dy),power=Math.max(0,1-d/150);
  if(!power)continue;
  damage(body,(body.isGem?235:260)*power);
  if(!body.destroyed&&!body.collected){Body.setVelocity(body,{x:body.velocity.x+dx/(d||1)*power*8,y:body.velocity.y+dy/(d||1)*power*8-2*power});Body.setAngularVelocity(body,(dx>0?1:-1)*power*.18)}
 }
 Composite.remove(world,bird);tone();$('hint').textContent='펑! 가까이 터뜨릴수록 더 강해요!';ui();
}
Events.on(engine,'collisionStart',event=>{
 if(phase!=='flying')return;
 for(const {bodyA:a,bodyB:b}of event.pairs){
  const speed=Math.hypot(a.velocity.x-b.velocity.x,a.velocity.y-b.velocity.y);
  if((a===bird||b===bird)&&!detonated&&fuse===null)fuse=flight+900;
  for(const body of [a,b]){
   if(!body.hp||body.destroyed||body.collected||speed<4.5)continue;
   if(engine.timing.timestamp-(body.lastDamage??-10000)<350)continue;
   body.lastDamage=engine.timing.timestamp;damage(body,Math.min(75,(speed-3)*(body.isGem?11:6)));
  }
 }
});
function fire(point){if(phase!=='ready'||ended)return;const dx=anchor.x-point.x,dy=anchor.y-point.y;if(Math.hypot(dx,dy)<12){drag=null;return}started??=performance.now();shots--;detonated=false;fuse=null;bird=Bodies.circle(anchor.x,anchor.y,22,{density:.005,restitution:.35,friction:.5,frictionAir:.002});Composite.add(world,bird);Body.setVelocity(bird,{x:dx*.22,y:dy*.22});phase='flying';flight=0;drag=null;$('hint').textContent='돌 가까이에서 화면이나 폭발 버튼을 눌러요!';ui();}
function position(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*640/r.width,y:(e.clientY-r.top)*580/r.height}}
canvas.onpointerdown=e=>{if(phase==='flying'){explode();return}if(phase!=='ready'||ended)return;const p=position(e);if(Math.hypot(p.x-anchor.x,p.y-anchor.y)>85)return;canvas.setPointerCapture(e.pointerId);drag={...anchor};move(e)};
function move(e){if(!drag)return;const p=position(e),dx=Math.min(0,p.x-anchor.x),dy=Math.max(-35,Math.min(95,p.y-anchor.y)),scale=Math.min(1,105/Math.hypot(dx,dy));drag={x:anchor.x+dx*scale,y:anchor.y+dy*scale}}
canvas.onpointermove=move;canvas.onpointerup=()=>{if(drag)fire(drag)};canvas.onpointercancel=()=>{drag=null};
$('detonate').onclick=explode;
$('launch').onclick=()=>fire({x:anchor.x-60*Math.cos(angle),y:anchor.y+60*Math.sin(angle)});$('aimUp').onclick=()=>{angle=Math.min(1.1,angle+.1);$('hint').textContent='높은 궤적으로 조준했어요'};$('aimDown').onclick=()=>{angle=Math.max(.1,angle-.1);$('hint').textContent='낮은 궤적으로 조준했어요'};$('retry').onclick=()=>{if(!ended)setup()};$('sound').onclick=()=>{sound=!sound;ui()};
function finish(){ended=true;phase='end';ui();modal('별빛 새총 챔피언!','5분 동안 멋지게 도전했어요. 트로피를 받았어요!','놀이터로',()=>location.href='./requests.html')}
function bar(body,y,width){ctx.fillStyle='#332940';ctx.fillRect(body.position.x-width/2,y,width,5);ctx.fillStyle=body.hp>body.maxHp*.5?'#5cdaae':'#ffbd56';ctx.fillRect(body.position.x-width/2,y,width*body.hp/body.maxHp,5)}
function frame(now){const dt=Math.min(32,now-(last||now));last=now;if(!document.hidden&&!ended){if(started&&now-started>=300000)finish();Engine.update(engine,dt||1000/60);if(phase==='flying'){flight+=dt;if(fuse!==null&&flight>=fuse)explode();
 if(targets.every(g=>g.collected)){phase='won';ui();modal('보석을 모두 모았어요!',shots>=3?'멋진 한 방이에요!':'포기하지 않고 해냈어요!',level===12?'처음부터 다시':'다음 숲으로',()=>{level=level%12+1;try{localStorage.setItem('joyi-sling-level',String(level))}catch(e){}setup()})}
 else if(flight>6500||detonated&&blast?.age>950||flight>1100&&(bird.position.x>750||bird.position.x< -80)){Composite.remove(world,bird);bird=null;if(shots){phase='ready';$('hint').textContent='조금 더 높게, 또는 낮게! 다시 당겨 보세요'}else{phase='lost';modal('한 번 더 도전해 볼까요?','보석의 높이를 보고 날아갈 길을 바꿔 보세요.','다시 도전',setup)}ui()}}}
 ctx.clearRect(0,0,640,580);art('background',320,290,640,580);art('sling',135,419,85,153);
 for(const b of blocks){if(b.destroyed)continue;const horizontal=b.art==='plank';art(horizontal&&b.hp<b.maxHp*.6?'cracked':b.art,b.position.x,b.position.y,horizontal?118:32,horizontal?30:66,b.angle);bar(b,b.position.y-(horizontal?22:38),42)}
 for(const g of targets)if(!g.collected){art('armor',g.position.x,g.position.y,46,46,g.angle);bar(g,g.position.y-30,40)}
 if(blast){blast.age+=dt;if(blast.age<650){ctx.save();ctx.globalAlpha=1-blast.age/650;const size=110+blast.age*.3;art('blast',blast.x,blast.y,size,size);ctx.restore()}}
 if(phase==='ready'){const p=drag||anchor;ctx.strokeStyle='#96623d';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(114,369);ctx.lineTo(p.x,p.y);ctx.lineTo(153,369);ctx.stroke();art('bomb',p.x,p.y,57,57);if(drag){const vx=(anchor.x-p.x)*.22,vy=(anchor.y-p.y)*.22;ctx.fillStyle='#fff';for(let i=1;i<22;i++){const t=i*2.2;ctx.beginPath();ctx.arc(anchor.x+vx*t,anchor.y+vy*t+.5*engine.gravity.y*engine.gravity.scale*(1000/60)**2*t*t,3,0,7);ctx.fill()}}}if(bird&&!detonated)art('bomb',bird.position.x,bird.position.y,54,54,bird.angle);
 particles=particles.filter(p=>p.life-->0);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.angle=(p.angle||0)+(p.spin||0);art(p.kind||'reward',p.x,p.y,p.kind?15:20,p.kind?13:20,p.angle)}if(started&&!ended)$('timer').textContent=Math.max(0,Math.ceil((300000-now+started)/1000))+'초 후 트로피';requestAnimationFrame(frame)}
Promise.all(Object.entries(paths).map(([key,path])=>new Promise((resolve,reject)=>{const im=new Image();images[key]=im;im.onload=resolve;im.onerror=reject;im.src='./assets/v13/'+path+'.webp'}))).then(()=>{setup();requestAnimationFrame(frame)}).catch(()=>modal('그림을 불러오지 못했어요','인터넷 연결을 확인하고 다시 시작해 주세요.','다시 불러오기',()=>location.reload()));
})();
