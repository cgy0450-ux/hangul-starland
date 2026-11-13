const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const assert=require('node:assert/strict');
const roots=process.cwd();
function chromeBinary(){for(const exe of ['google-chrome','google-chrome-stable','chromium','chromium-browser']){const v=cp.spawnSync(exe,['--version'],{encoding:'utf8'});if(!v.error&&v.status===0)return exe;}return null;}
const chrome=chromeBinary();
if(!chrome){console.log('SKIP: no Chromium/Chrome binary on runner (static functional QA still ran).');process.exit(0);}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.webmanifest':'application/manifest+json'};
// Browser is asynchronous so the Node HTTP server can respond while Chrome loads each page.
const server=http.createServer((req,res)=>{let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end();return;}let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';const resolved=path.resolve(roots,rel);if(!(resolved===roots||resolved.startsWith(roots+path.sep))||!fs.existsSync(resolved)||fs.statSync(resolved).isDirectory()){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(resolved)]||'application/octet-stream'});fs.createReadStream(resolved).pipe(res);});
server.listen(0,'127.0.0.1',async()=>{
 const port=server.address().port, cases=[
 ['index.html','data-subject="coding"'],['index.html','data-subject="history"'],['index.html','data-subject="finance"'],['index.html','href="./requests.html"'],['index.html','href="./parent.html"'],['legacy.html','class="quick-primary q-write"'],['journey.html?subject=hangul','data-lesson="hangul-0-explore"'],['journey.html?subject=math','data-lesson="math-0-choose"'],['journey.html?subject=english','data-lesson="english-0-listen"'],['journey.html?subject=science','data-lesson="science-0-match"'],['journey.html?subject=history','data-lesson="history-0-remember"'],['journey.html?subject=coding','data-lesson="coding-0-speak"'],['journey.html?subject=finance','data-lesson="finance-0-explore"'],['journey.html?subject=reading','data-lesson="reading-0-explore"'],['journey.html?subject=life','data-lesson="life-0-explore"'],['journey.html?subject=creativity','data-lesson="creativity-0-explore"'],['journey.html?subject=hangul&lesson=hangul-0-choose','data-opt="'],['journey.html?subject=hangul&lesson=hangul-0-tap','id="answers"'],['journey.html?subject=hangul&lesson=hangul-0-drag','id="dropTarget"'],['journey.html?subject=english&lesson=english-1-pair','data-voice="'],['journey.html?subject=math&lesson=math-0-order','id="interaction"'],['journey.html?subject=history&lesson=history-0-story','id="answerTitle"'],['journey.html?subject=english&lesson=english-1-speak','id="recordVoice"'],['journey.html?subject=math&lesson=math-0-listen','id="answers"'],['parent.html','id="report"'],
 ['academy.html?subject=math','data-i="9"'],['academy.html?subject=science','data-i="9"'],
 ['academy.html?subject=english','data-i="9"'],['academy.html?subject=history','data-i="9"'],
 ['academy.html?subject=coding','data-i="9"'],['academy.html?subject=coding&game=5','class="direction-scene"'],['academy.html?subject=history&game=0','id="learn"'],['stories.html','data-book="19"'],
 ['writing.html?mode=numbers','data-i="9"'],['writing.html?mode=numbers&lesson=1&step=10','id="target">10'],['writing.html?mode=numbers&lesson=10&step=10','id="target">100'],['writing.html?mode=english','data-i="11"'],
 ['mazes.html','data-index="19"'],['coding-lab.html','class="grid"'],['finance.html','data-game="9"'],['finance.html?game=0','id="answers"'],['finance.html?game=2','🪙'],['finance.html?game=3','id="addcoin"'],['finance.html?game=4','class="jarrow"'],['finance.html?game=9','id="ask"'],['requests.html','href="./firetruck-rescue.html"'],['requests.html','href="./car-collect.html"'],['requests.html','href="./car-dodge.html"'],['firetruck-rescue.html','id="hydrant"'],['firetruck-rescue.html','id="helicopter"'],['firetruck-rescue.html','id="ladder"'],['car-collect.html','id="difficulty"'],['adventure.html?game=dino','공룡 알 탐험'],['adventure.html?game=space','반짝반짝 우주'],['adventure.html?game=animal','동물 친구 돌보기'],['firetruck-rescue.html','id="waterFill"'],['firetruck-rescue.html','src="./word-gate.js"'],['index.html','class="quick-primary q-write"'],['legacy.html?game=trace','trace-pad']
 ];
 try{
  let n=0;
  for(const [route,text] of cases){
   const url='http://127.0.0.1:'+port+'/'+route;
   let cmd=null,passes=false;
   for(let attempt=0;attempt<3&&!passes;attempt++){
     cmd=await new Promise(resolve=>cp.execFile(chrome,['--headless=new','--disable-gpu','--no-sandbox','--no-first-run','--disable-extensions','--disable-dev-shm-usage','--virtual-time-budget=2200','--dump-dom',url],{encoding:'utf8',timeout:22000,maxBuffer:10000000},(err,stdout,stderr)=>resolve({status:err?err.code:0,stdout,stderr})));
     passes=cmd.status===0&&cmd.stdout.includes(text);
   }
   assert(passes,route+' did not render '+text+'; exit='+cmd.status+'; DOM='+String(cmd.stdout).slice(-850)+'; stderr='+String(cmd.stderr).slice(-500));
   n++;
  }
  console.log('PASS: Chromium rendered '+n+' live-style pages including the storybook mascot hub, ten adaptive subjects, eleven distinct lesson modes, audio recording controls, parent reporting and legacy games.');
 }catch(e){console.error('FAIL:',e.message);process.exitCode=1;}finally{server.close();}
});