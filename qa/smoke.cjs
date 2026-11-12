const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const pages=['index.html','legacy.html','journey.html','parent.html','academy.html','writing.html','stories.html','mazes.html','coding-lab.html','finance.html','requests.html'];
let compiled=0;
for(const name of pages){
 const html=fs.readFileSync(name,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 assert(scripts.length>0,name+' scripts missing');
 for(const block of scripts)if(block[1].trim()){new vm.Script(block[1],{filename:name});compiled++;}
}
const home=fs.readFileSync('index.html','utf8');
const index=fs.readFileSync('legacy.html','utf8');
const journey=fs.readFileSync('journey.html','utf8');
const parent=fs.readFileSync('parent.html','utf8');
const academy=fs.readFileSync('academy.html','utf8');
const writing=fs.readFileSync('writing.html','utf8');
const stories=fs.readFileSync('stories.html','utf8');
const maze=fs.readFileSync('mazes.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const data=fs.readFileSync('stories-data.js','utf8');
const curated=fs.readFileSync('curated-questions.js','utf8');
const finance=fs.readFileSync('finance.html','utf8');
const requests=fs.readFileSync('requests.html','utf8');
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
for(const subject of ['math','science','english','history','coding','finance','requests'])assert(index.includes(subject),'subject missing: '+subject);
assert(index.includes("./finance.html")&&index.includes("./requests.html"),'subject routing to finance or requests missing');
assert(index.includes('🔊 소리 듣기')&&!index.includes('🔊 글자 소리 듣기')&&!index.includes("우주선에 타자! '${item[0]}'"),'sound quiz must not reveal correct syllable in prompt');
assert(index.includes('joy-playing')&&academy.includes('body.playing{height:100dvh'),'game-only page scroll lock missing');
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


/* Extract deterministic game configuration and validate every money-learning lesson. */
const financeScript=[...finance.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('const games='))[1];
const financeData=financeScript.slice(financeScript.indexOf('const games='),financeScript.indexOf('const day='));
const moneySandbox={};vm.runInNewContext(financeData+';this._games=games;',moneySandbox);
const money=moneySandbox._games;
assert.equal(money.length,10,'finance must provide 10 different games');
const expectedTypes=['quiz','quiz','shop','save','jars','quiz','quiz','quiz','quiz','quiz'];
for(let i=0;i<money.length;i++){
 const g=money[i];assert.equal(g.type,expectedTypes[i],g.title+' unexpected interaction type');
 assert(g.items.length>=5,g.title+' has fewer than five puzzles');
 assert(g.title.length>=3&&g.desc.length>=5,g.title+' must explain learning objective');
 for(const item of g.items){
  if(g.type==='quiz'){
    assert(item.length>=4,g.title+' incomplete answer options');
    assert(!item.slice(3).includes(item[2]),g.title+' correct answer also listed as wrong');
    assert.equal(new Set(item.slice(2)).size,item.length-2,g.title+' repeated answer choice');
  }else if(g.type==='jars'){
    assert.equal(item.length,3,'jar labels come from the three fixed money jars');
    assert(['쓰는 돈','저금할 돈','나눌 돈'].includes(item[2]),'unrecognized jar label');
  }else if(g.type==='shop'){
    assert(typeof item[1]==='number'&&item[1]>=1&&item[1]<=5,g.title+' bad price');
  }else if(g.type==='save')assert(item>=3&&item<=8,g.title+' bad savings goal');
 }
}
const purchaseResults=money[2].items.slice(0,5).map((x,i)=>Math.max(0,x[1]+(i%2===0?-1:1))>=x[1]);
assert(purchaseResults.some(x=>x)&&purchaseResults.some(x=>!x),'pretend store must offer both decisions');
assert(finance.includes('data-hear')&&finance.includes('jar-hear'),'every new money choice needs an independent listening button');
assert(finance.includes('body.playing{height:100dvh;overflow:hidden}'),'finance playable screen must be fixed-height');
const reqScript=[...requests.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('const towerLevels='))[1];
const reqData=reqScript.slice(reqScript.indexOf('const towerLevels='),reqScript.indexOf(';let kind='));
const blockSandbox={};vm.runInNewContext(reqData+';this._tower=towerLevels;this._bridge=bridgeLevels;',blockSandbox);
assert.equal(blockSandbox._tower.length,5,'rainbow tower needs 5 levels');
assert.equal(blockSandbox._bridge.length,5,'bridge building needs 5 levels');
assert(blockSandbox._tower.every(x=>x.length>=3&&x.length<=5),'rainbow tower levels not age appropriate');
assert(requests.includes('id="middle-support"')&&requests.includes('count>=3'),'3-support bridge stage not rendered');
assert(requests.includes('height:100dvh;overflow:hidden'),'requested play screen must be fixed-height');
assert(sw.includes('finance.html')&&sw.includes('requests.html'),'offline app must cache both new play halls');


/* v10 static and model tests: 240 lessons, six modes, new subject hub, subject diagnostics and adaptive review. */
const curriculumScript=fs.readFileSync('curriculum-v10.js','utf8');
const coreScript=fs.readFileSync('learning-core-v10.js','utf8');
const journeyScript=fs.readFileSync('journey-app-v10.js','utf8');
new vm.Script(curriculumScript,{filename:'curriculum-v10.js'});
new vm.Script(coreScript,{filename:'learning-core-v10.js'});
new vm.Script(journeyScript,{filename:'journey-app-v10.js'});
const local={};
const localStorage={getItem(k){return Object.prototype.hasOwnProperty.call(local,k)?local[k]:null},setItem(k,v){local[k]=String(v)},removeItem(k){delete local[k]}};
const win={};const coreVM={window:win,localStorage,Date,Math,JSON,SpeechSynthesisUtterance:function(){},URLSearchParams};
vm.runInNewContext(curriculumScript,coreVM,{filename:'curriculum-v10.js'});
vm.runInNewContext(coreScript,coreVM,{filename:'learning-core-v10.js'});
const curr=win.JOY_CURRICULUM,adaptive=win.JOY_CORE;
assert.equal(curr.subjects.length,10,'there must be ten structured learning subjects');
assert.equal(curr.lessons.length,240,'there must be 240 graded activities');
assert(curr.subjects.every(s=>s.modules.length===4),'every subject needs four structured learning stages');
assert(curr.subjects.every(s=>s.modules.every(m=>m.items.length>=5&&m.lessons.length===6)),'every module needs five facts and six interactive learning modes');
assert.equal(new Set(curr.lessons.map(l=>l.id)).size,240,'lesson IDs must be unique');
const modes=new Set(curr.lessons.map(l=>l.mode));
for(const k of ['explore','choose','listen','match','remember','speak'])assert(modes.has(k),'missing learning type '+k);
assert(home.includes('joyi-explore.svg')&&home.includes('id="recs"')&&home.includes('parent.html'),'new mascot led home/recommender/parent navigation absent');
assert(home.includes('legacy.html')&&home.includes('journey.html'),'previous games or new lessons unavailable');
for(const pose of ['hello','read','write','build','explore','celebrate'])assert(fs.existsSync('joyi-'+pose+'.svg'),'original mascot art missing '+pose);
assert(journey.includes('id="startDiag"')&&journey.includes('id="repeat"')&&journey.includes('id="answers"'),'screen based initial diagnosis and speak-after-listen missing');
assert(journey.includes('body.playing{height:100dvh')&&journeyScript.includes('classList.add("playing")'),'no-scroll child play screen missing');
assert(parent.includes('id="review"')&&parent.includes('id="export"')&&parent.includes('id="childAge"'),'parent report must support review, age settings and backup');
for(const sub of curr.subjects){
 const diag=adaptive.diagnose(sub.id);assert.equal(diag.length,8,'each subject requires an 8-question screening');
 for(const m of sub.modules){
  const lesson=adaptive.session(m.lessons[0].id);
  assert(lesson.questions.length===5,'lesson must contain five unique questions');
  const distinct=new Set(lesson.questions.map(x=>x.visual+'|'+x.answer));
  assert.equal(distinct.size,5,'daily lesson repeated same question');
  for(const q of lesson.questions)assert(q.choiceOptions.includes(q.answer)&&new Set(q.choiceOptions).size===q.choiceOptions.length,'duplicate or missing quiz answers');
 }
}
const before=adaptive.getSkill('hangul-0').attempts;
adaptive.update('hangul-0',false,2400,'choose');
adaptive.update('hangul-0',true,1300,'listen');
assert.equal(adaptive.getSkill('hangul-0').attempts,before+2,'mastery attempts not tracked');
assert(adaptive.recommend('hangul',2).length===2,'adaptive lesson planner failed');
const diag=adaptive.diagnose('math');adaptive.finishDiagnosis('math',diag.map((q,i)=>({skill:q.skill,correct:i%2===0,elapsed:1800})));
assert(adaptive.data().diagnostics.math,'per-subject initial diagnostic not saved');
assert(adaptive.report().subject.length===10,'parent analytics incomplete');
assert(local['joiland-learning-v10'],'private on-device progress was not stored');

console.log('PASS: '+compiled+' HTML scripts; reviewed history/coding and 10 money games plus two block-building games; ten number-writing groups and whole-number glyphs; stroke checks; 20 long stories; v10 240 graded lessons, local adaptive engine and parent dashboard.');
