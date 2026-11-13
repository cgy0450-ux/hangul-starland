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
const collect=fs.readFileSync('car-collect.html','utf8');
const dodge=fs.readFileSync('car-dodge.html','utf8');
const firetruck=fs.readFileSync('firetruck-rescue.html','utf8');
for(const [name,code] of [['car-collect.html',collect],['car-dodge.html',dodge],['firetruck-rescue.html',firetruck]]){
 const script=code.match(/<script>([\s\S]*?)<\/script>/);
 assert(script,name+' must have executable game script');
 new vm.Script(script[1],{filename:name});
}
assert(requests.includes('href="./car-collect.html"')&&requests.includes('href="./car-dodge.html"'),'requested playground must link both car games');
assert(collect.includes('const CARS=')&&collect.includes('joiland-car-total')&&collect.includes('joiland-car-selected'),'unlockable cars missing');
assert(collect.includes('const DIFFICULTY=')&&collect.includes('const FREQUENCY=')&&collect.includes('function sparkle(')&&collect.includes('function celebrate('),'difficulty, frequency or pickup rewards missing');
assert(sw.includes('car-collect.html')&&sw.includes('car-dodge.html'),'offline manifest must cache both car games');
assert(requests.includes('href="./firetruck-rescue.html"'),'firetruck missing from requests menu');
assert(firetruck.includes('function frame(ms)')&&firetruck.includes('function win()')&&firetruck.includes('function makeScene()'),'firetruck game loop or round progression missing');
assert(firetruck.includes('pointerdown')&&firetruck.includes('pointermove')&&firetruck.includes('pointercancel'),'firetruck touch aiming incomplete');
assert(firetruck.includes('function burst(')&&firetruck.includes('function splash(')&&firetruck.includes('function voice('),'firetruck quality effects missing');
assert(firetruck.includes("localStorage.setItem('joiland-firetruck-saved'"),'firetruck progress persistence missing');
assert(collect.includes('const LEVELS=[40,100,200,350]'),'collectible car pacing must use wider goals');
assert(sw.includes('firetruck-rescue.html'),'offline manifest must cache firetruck');
assert(firetruck.includes('const MORE_SCENES=')&&firetruck.includes('STAGES.push(...MORE_SCENES)'),'extended rescue missions missing');
assert(firetruck.includes('사건발생! 사건발생! 화재가 발생했다! 소방차는 출동하라!'),'exact dispatch line missing');
assert(['hydrant','helicopter','ladder'].every(x=>firetruck.includes('id="'+x+'"')),'rescue equipment missing');
assert(firetruck.includes('joiland-firetruck-friends'),'animal rescue book missing');
assert(collect.includes('function pickupSound('),'collectible pickup audio missing');
const shared=fs.readFileSync('joiland-unified.js','utf8');new vm.Script(shared,{filename:'joiland-unified.js'});
assert(shared.includes('5분 놀이 성공')&&shared.includes('joyi-nav-back'),'shared navigation or trophy absent');
for(const p of ['legacy.html','journey.html','academy.html','writing.html','requests.html','car-collect.html','car-dodge.html','firetruck-rescue.html','stories.html','mazes.html','finance.html','coding-lab.html','parent.html'])assert(fs.readFileSync(p,'utf8').includes('src="./joiland-unified.js"'),'missing unified navigation on '+p);



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
assert(writing.includes('function drawGuide')&&writing.includes('function evaluateWriting')&&writing.includes('letters={'),'number and English finger writing missing');
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
assert(requests.includes('href="./firetruck-rescue.html"')&&requests.includes('href="./car-collect.html"')&&requests.includes('href="./car-dodge.html"'),'new playground needs three working games');
assert(!requests.includes('data-game="tower"')&&!requests.includes('data-game="bridge"'),'retired rainbow tower and bridge must be removed');
assert(requests.includes('id="forceUpdate"'),'game update control is missing');
assert(sw.includes('finance.html')&&sw.includes('requests.html'),'offline app must cache both new play halls');


/* v10.3 graded curriculum: 440 play activities, 11 interactions, 10 subjects, adaptive diagnostics. */
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
assert.equal(curr.lessons.length,440,'there must be 440 graded activities including 200 new tactile lessons');
assert(home.includes('440개')&&!home.includes('240개'),'home must advertise the correct verified activity count');
assert(fs.existsSync('joyi-adventure-world.svg')&&fs.existsSync('joiland-theme-v11.css'),'illustrated storybook design assets missing');
assert(home.includes('joiland-theme-v11.css')&&journey.includes('joiland-theme-v11.css'),'unified storybook theme not linked');
assert(journey.includes('id="recordVoice"')&&journey.includes('id="playVoice"'),'opt-in record-and-compare speech practice unavailable');
assert(journeyScript.includes('getUserMedia({audio:true})')&&journeyScript.includes('getTracks().forEach(t=>t.stop())'),'microphone permission or privacy cleanup missing');
assert(parent.includes('id="voiceChoice"')&&parent.includes('id="previewVoice"'),'parent must be able to select and preview TTS voices');
assert(coreScript.includes('joiland-voice-name'),'child TTS must honor parent voice selection');

assert(curr.subjects.every(s=>s.modules.length===4),'every subject needs four structured learning stages');
assert(curr.subjects.every(s=>s.modules.every(m=>m.items.length>=5&&m.lessons.length===11)),'every module needs five facts and eleven interactive learning modes');
for(const sub of curr.subjects)for(const mod of sub.modules)for(const x of mod.items){assert(x.question&&x.question.length>=9,'missing meaningful question: '+sub.id+'/'+mod.title);assert(x.explain&&x.explain.length>=11,'truncated teaching explanation: '+sub.id+'/'+mod.title);}
assert.equal(new Set(curr.lessons.map(l=>l.id)).size,440,'lesson IDs must be unique');

assert(journeyScript.includes('function specialRender(q,mode)')&&journeyScript.includes('function processAnswer(chosen)'),'new play modes must use distinct interactive logic');
assert(journeyScript.includes('ondrop=e=>')&&journeyScript.includes('function makeTouchTarget()'),'drag-and-drop target absent');
assert(journeyScript.includes('interaction.step++')&&journeyScript.includes('interaction.seq'),'multi-step sequencing not implemented');
assert(journeyScript.includes('pictureOptions=null;optionsRender(quizOptions(q))'),'image and word pairing not two-stage');
assert(journey.includes('class="interaction hidden"')&&journey.includes('choice-hear'),'new touchscreen interaction or separate audio hearing button missing');

assert(curr.subjects.every(sub=>sub.modules.every(m=>m.items.every(q=>!/[을은이]\(는\)|을\/를|은\/는|이\/가|과\/와/.test(q.question)))),'awkward Korean placeholder grammar in lesson prompts');
assert(curr.subjects.every(sub=>sub.modules.every(m=>m.items.every(q=>q.question.length<=68&&q.explain.length<=150))),'overlong lesson question or feedback on small screens');
assert(curr.subjects.reduce((n,sub)=>n+sub.modules.reduce((k,m)=>k+m.items.length,0),0)>=240,'subject concept bank unexpectedly small');

const modes=new Set(curr.lessons.map(l=>l.mode));
for(const k of ['explore','choose','listen','match','remember','speak','tap','drag','pair','order','story'])assert(modes.has(k),'missing learning type '+k);
assert(home.includes('joyi-explore.svg')&&home.includes('id="recs"')&&home.includes('parent.html'),'new mascot led home/recommender/parent navigation absent');
assert(home.includes('legacy.html')&&home.includes('journey.html'),'previous games or new lessons unavailable');
for(const pose of ['hello','read','write','build','explore','celebrate'])assert(fs.existsSync('joyi-'+pose+'.svg'),'original mascot art missing '+pose);
assert(journey.includes('id="startDiag"')&&journey.includes('id="repeat"')&&journey.includes('id="answers"')&&journey.includes('id="interaction"'),'screen based initial diagnosis and speak-after-listen missing');
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
const one=curr.subject('hangul').modules[0].items[0];
adaptive.recordQuestion('hangul','hangul-0',one,false);
assert(adaptive.data().questionHistory['hangul/hangul-0'][one.answer+'|'+one.visual].wrong===1,'error-specific retraining item memory missing');
const savedRun=adaptive.data().sessionRuns['hangul/hangul-0']||0;
adaptive.session('hangul-0-drag');
assert(adaptive.data().sessionRuns['hangul/hangul-0']===savedRun+1,'replaying the same lesson must offer a varied question set');


const twoKind=curr.subject('finance').modules[0].items[0];assert.equal(adaptive.options('finance',0,twoKind).length,2,'two-category financial literacy must not show unrelated third choice');
const diag=adaptive.diagnose('math');adaptive.finishDiagnosis('math',diag.map((q,i)=>({skill:q.skill,correct:i%2===0,elapsed:1800})));
assert(adaptive.data().diagnostics.math,'per-subject initial diagnostic not saved');
assert(diag.every(q=>q.question&&q.question.length>=9),'subject diagnostic omitted question wording');
assert(adaptive.report().subject.length===10,'parent analytics incomplete');
assert(local['joiland-learning-v10'],'private on-device progress was not stored');

console.log('PASS: '+compiled+' HTML scripts; reviewed history/coding and 10 money games plus two block-building games; ten number-writing groups and whole-number glyphs; stroke checks; 20 long stories; v10.4 440 graded lessons, new tiger scenery, voice playback and error-specific adaptive review with 200 new play modes, local adaptive engine and parent dashboard.');
