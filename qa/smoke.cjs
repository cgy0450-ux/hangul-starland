const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const pages=['index.html','academy.html','writing.html','stories.html','mazes.html','coding-lab.html'];
let compiled=0;
for(const name of pages){
 const html=fs.readFileSync(name,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 assert(scripts.length>0,name+' scripts missing');
 for(const block of scripts)if(block[1].trim()){new vm.Script(block[1],{filename:name});compiled++;}
}
const index=fs.readFileSync('index.html','utf8');
const academy=fs.readFileSync('academy.html','utf8');
const writing=fs.readFileSync('writing.html','utf8');
const stories=fs.readFileSync('stories.html','utf8');
const maze=fs.readFileSync('mazes.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const data=fs.readFileSync('stories-data.js','utf8');
const curated=fs.readFileSync('curated-questions.js','utf8');
const checkData={window:{}};vm.runInNewContext(curated,checkData);
for(const sub of ['history','coding']){const lessons=checkData.window.JOY_CURATED[sub];assert.equal(lessons.length,sub==='history'?10:9);for(const [i,rows] of lessons.entries()){assert(rows.length>=5,sub+' '+i+' has too few questions');for(const q of rows){assert.equal(q.length,6,'unreviewed question '+sub+i);assert.equal(new Set(q.slice(2)).size,4,'ambiguous or duplicate answer '+sub+i);assert(!q.slice(2).some(a=>['없어요','잘 모르겠어요','다른 것'].includes(a)),'vague distractor '+sub+i);}}}
const sandbox={window:{}};vm.runInNewContext(data,sandbox);
assert.equal(sandbox.window.JOY_STORIES.length,20,'exactly twenty stories expected');
for(const b of sandbox.window.JOY_STORIES){
 assert.equal(b.pages.length,10,b.title+' must be ten pages');
 assert(b.pages.every(p=>p.text.length>=35),b.title+' pages too short');
 assert(b.setting&&b.icons.length>0,b.title+' art scene metadata missing');
}
assert(index.includes('function chooseSubjects()'),'subject gateway missing');
for(const subject of ['math','science','english','history','coding'])assert(index.includes(subject),'subject missing: '+subject);
assert(index.includes('dayShuffle(mode,WORDS)'),'daily Hangul decks missing');
assert(!index.includes('<script src="./bgm.js'),'background music must be removed from home');
assert(!academy.includes('<script src="./bgm.js'),'background music must be removed from games');
assert(!stories.includes('<script src="./bgm.js'),'background music must be removed from books');
assert(!maze.includes('<script src="./bgm.js'),'background music must be removed from maze');
assert(stories.includes('function scenePicture')&&stories.includes('window.JOY_STORIES'),'illustrated ten-page story renderer missing');
assert(maze.includes('pointermove')&&maze.includes('trail.push(pos)'),'finger maze missing');
assert(writing.includes('function drawGuide')&&writing.includes('function coverage')&&writing.includes('letters={'),'number and English finger writing missing');
assert(writing.includes('groups=Array.from({length:10}')&&writing.includes('selection[index]'),'missing ten ten-number groups');
assert(writing.includes('function glyphs(value)')&&writing.includes('viewBox')&&writing.includes('part.ox+part.scale*p.x'),'multi-digit rendering missing');
assert(writing.includes('part.ox+part.scale*p.x')&&writing.includes('Math.min(...guidePaths.map'),'whole-number stroke coverage missing');
for(const [char,pattern] of [['F','M109 78 L109 226'],['E','M105 78 L105 226'],['M','M87 78 L87 226'],['N','M104 78 L104 226'],['P','M105 78 L105 226'],['R','M105 78 L105 226'],['Y','M215 78 L155 150']])assert(writing.includes(pattern),'uppercase stroke starts in wrong direction: '+char);
for(const x of [10,20,30,40,50,60,70,80,90,100])assert(writing.includes(String(x)),'ten-step writing target missing: '+x);
assert(academy.includes('name:"숫자 듣고 찾기"')&&academy.includes('numbered(Number(answer))'),'spoken number game missing');
assert(academy.includes('const bank=generate(subject,i)'),'non-repeating deck generation missing');
assert(academy.includes('name:"사과 빼기"'),'ten math games missing');
assert(academy.includes('name:"어떤 계절일까?"'),'ten science games missing');
assert(academy.includes('name:"영어 글자 찾기"'),'ten English games missing');
assert(academy.includes('games.history=')&&academy.includes('games.coding='),'history and coding subjects missing');
assert(sw.includes('academy.html')&&sw.includes('writing.html')&&sw.includes('coding-lab.html')&&sw.includes('stories-data.js'),'offline assets missing');
assert(!fs.existsSync('bgm.js'),'background music module must be deleted');
const coding=fs.readFileSync('coding-lab.html','utf8');
assert(coding.includes('function add(d)')&&coding.includes('async function run()'),'interactive block coding must execute arrows');
assert(academy.includes('route:"./coding-lab.html"'),'coding hall must link to interactive lab');
assert(academy.includes('function directionMap(q)')&&academy.includes('direction-scene'),'coding map visualization missing');
assert(academy.includes('const HISTORY_FACTS=')&&academy.includes('3') ,'history learning facts missing');

assert(academy.includes('button.choice')&&academy.includes('data-hear')&&academy.includes('소리 켬'),'read-aloud answer buttons missing');
assert(academy.includes('String.fromCharCode(92)+"n"'),'bear/tiger honey group separation missing');

/* Run the preschool question-bank model in a minimal DOM harness, not just a syntax check. */
const source=academy.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi).find(x=>x.includes('var games='));
assert(source,'academy game script missing');
const body=source.replace(/^<script(?:\s[^>]*)?>/i,'').replace(/<\/script>$/i,'');
const wrapped=body.slice(0,body.lastIndexOf('menu();'))+'window.__qa={games,generate,shuffled};})();';
for(const sub of ['math','science','english','history','coding']){
 const fakeEl=()=>({textContent:'',innerHTML:'',addEventListener(){},classList:{add(){},remove(){}},style:{}});
 const sandbox={window:{addEventListener(){}},document:{title:'',getElementById:fakeEl},location:{search:'?subject='+sub},URLSearchParams,Date,Math};
 vm.runInNewContext(curated,sandbox,{filename:'curated-questions.js'});
 vm.runInNewContext(wrapped,sandbox,{filename:'academy-harness.js'});
 const {games,generate,shuffled}=sandbox.window.__qa;
 assert.equal(games[sub].length,10,sub+' must offer 10 games');
 for(let i=0;i<10;i++){
   if(games[sub][i].route)continue;
   const questions=generate(sub,i);
   const signatures=new Set(questions.map(q=>q.visual+'|'+q.ask+'|'+q.answer));
   assert(signatures.size>=5,sub+' game '+i+' has fewer than 5 distinct questions');
   for(const q of questions){
     assert(q.options.includes(q.answer),sub+' game '+i+' missing correct answer');
     assert.equal(q.options.length,new Set(q.options).size,sub+' game '+i+' duplicates response choices');
     assert.equal(q.options.length,['history','coding'].includes(sub)?3:4,sub+' game '+i+' wrong choice count');
   }
   const five=shuffled(questions).slice(0,5);
   assert.equal(five.length,5);
   assert.equal(new Set(five.map(q=>q.unique)).size,5,sub+' game '+i+' repeated a question');
 }
}

console.log('PASS: '+compiled+' HTML scripts; reviewed history/coding decks; ten number-writing groups and whole-number glyphs; stroke checks; 20 long stories.');
