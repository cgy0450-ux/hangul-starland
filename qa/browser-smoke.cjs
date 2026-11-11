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
 ['index.html','data-subject="coding"'],['index.html','data-subject="history"'],
 ['academy.html?subject=math','data-i="9"'],['academy.html?subject=science','data-i="9"'],
 ['academy.html?subject=english','data-i="9"'],['academy.html?subject=history','data-i="9"'],
 ['academy.html?subject=coding','data-i="9"'],['stories.html','data-book="19"'],
 ['writing.html?mode=numbers','data-i="9"'],['writing.html?mode=english','data-i="11"'],
 ['mazes.html','data-index="19"'],['coding-lab.html','class="grid"']
 ];
 try{
  let n=0;
  for(const [route,text] of cases){
   const url='http://127.0.0.1:'+port+'/'+route;
   const cmd=await new Promise(resolve=>cp.execFile(chrome,['--headless=new','--disable-gpu','--no-sandbox','--no-first-run','--disable-extensions','--disable-dev-shm-usage','--virtual-time-budget=1400','--dump-dom',url],{encoding:'utf8',timeout:20000,maxBuffer:10000000},(err,stdout,stderr)=>resolve({status:err?err.code:0,stdout,stderr})));
   assert.equal(cmd.status,0,route+' browser startup failed: '+String(cmd.stderr).slice(-500));
   assert(cmd.stdout.includes(text),route+' missing rendered content: '+text);
   n++;
  }
  console.log('PASS: Chromium rendered '+n+' live-style pages including 6 subjects, stories, writing, maze and coding.');
 }catch(e){console.error('FAIL:',e.message);process.exitCode=1;}finally{server.close();}
});