(function(){"use strict";
const C=window.JOY_CURRICULUM,A=window.JOY_CORE,$=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const subject=C.subject(params.get("subject")||"hangul")||C.subject("hangul");
let run=null,index=0,score=0,answered=false,phase="quiz",shownAt=0,diagnosticResults=[],pictureOptions=null;
let soundOn=true;try{soundOn=JSON.parse(localStorage.getItem("hangul-starland-v1")||"{}").sound!==false}catch(e){}
function speak(text,lang){if(soundOn)A.speak(text,lang||"ko-KR")}
function setSound(){ $("sound").textContent=soundOn?"🔊 소리 켬":"🔇 소리 끔"}
setSound();$("sound").onclick=()=>{soundOn=!soundOn;setSound();try{const prev=JSON.parse(localStorage.getItem("hangul-starland-v1")||"{}");prev.sound=soundOn;localStorage.setItem("hangul-starland-v1",JSON.stringify(prev))}catch(e){}if(!soundOn&&"speechSynthesis"in window)speechSynthesis.cancel()};
$("topTitle").textContent=subject.name;$("subjectTitle").textContent=subject.name+" 탐험";$("heroMascot").src="./joyi-"+subject.pose+".svg";
document.documentElement.style.setProperty("--subject-bg",subject.bg);
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function catalog(){
 try{speechSynthesis.cancel()}catch(e){}
 document.body.classList.remove("playing");$("play").classList.remove("active");$("catalog").classList.remove("hidden");run=null;
 $("diagnosis").classList.toggle("hidden",!!A.data().diagnostics[subject.id]);
 const root=$("modules");root.replaceChildren();
 for(const [mi,m] of subject.modules.entries()){
 const card=el("div","module"),head=el("div","module-title");let title=el("strong","",String(mi+1)+"단계 · "+m.title);
 const sk=A.getSkill(m.id);const small=el("small","",sk.attempts?("익힘 "+Math.round(100*A.mastery(m.id))+"% · "+sk.attempts+"회"):"처음 배우기");
 head.append(title,small);const grid=el("div","tile-grid");
 const symbols=["📖","🖐️","🔊","🧩","🌟","🎤"];
 for(const [i,lesson] of m.lessons.entries()){
 const btn=el("button","tile");btn.type="button";btn.dataset.lesson=lesson.id;
 const emoji=el("span","badge",symbols[i]);const span=el("span"),big=el("strong","",lesson.title),sub=el("small","",String(i+1)+" / 6 · 직접 해봐요");span.append(big,sub);btn.append(emoji,span);grid.append(btn)
 }
 card.append(head,grid);root.append(card);
 }
 const external={
 hangul:[["글자별 게임","legacy.html"],["숫자와 글자 쓰기","writing.html?mode=numbers"],["동화 그림책","stories.html"]],
 math:[["수학 퀴즈 10종","academy.html?subject=math"],["숫자 따라 쓰기","writing.html?mode=numbers"],["블록 쌓기","requests.html"]],
 english:[["영어 퀴즈 10종","academy.html?subject=english"],["알파벳·단어 쓰기","writing.html?mode=english"]],
 science:[["과학 퀴즈 10종","academy.html?subject=science"],["동물 자동차 탐험","legacy.html"]],
 history:[["역사 퀴즈 10종","academy.html?subject=history"],["위인과 전래동화","stories.html"]],
 coding:[["코딩 퀴즈 10종","academy.html?subject=coding"],["진짜 블록 명령 코딩","coding-lab.html"],["손가락 미로","mazes.html"]],
 finance:[["가게·저금통 체험 10종","finance.html"],["블록 놀이","requests.html"]],
 reading:[["동화책 20편","stories.html"],["우리 가족 이름 쓰기","legacy.html"]],
 life:[["동화로 감정 배우기","stories.html"],["사회성과 일상 놀이","legacy.html"]],
 creativity:[["블록 탑과 자동차 다리","requests.html"],["손가락 색칠·글씨","legacy.html"]]
 };
 const extras=$("extras");extras.replaceChildren();
 for(const [name,url] of (external[subject.id]||[])){
 const a=el("a","tile"),badge=el("span","badge","🌟"),label=el("strong","",name);
 a.href="./"+url;a.append(badge,label);extras.append(a);
 }
}
function beginDiagnostic(){run={type:"diagnostic",lesson:{mode:"choose",subject:subject.id},questions:A.diagnose(subject.id)};diagnosticResults=[];index=0;score=0;enter()}
function beginLesson(id){const lesson=C.lesson(id);if(!lesson||lesson.subject!==subject.id)return;run={type:"lesson",...A.session(id)};index=0;score=0;enter()}
function enter(){document.body.classList.add("playing");$("catalog").classList.add("hidden");$("play").classList.add("active");render()}
function quizOptions(q){return q.choiceOptions||A.options(subject.id,q.module,q)}
function optionsRender(options){const parent=$("answers");parent.replaceChildren();
 const distinct=[...new Set(options)];for(const [i,opt] of distinct.entries()){const b=el("button","choice",opt);b.type="button";b.dataset.opt=opt;b.style.setProperty("--choice",["#e6f7ff","#fff2d4","#f8e8ff","#e7ffe9"][i%4]);parent.append(b)}}
function locale(){return subject.id==="english"?"en-US":"ko-KR"}
function current(){return run.questions[index]}
function render(){
 answered=false;phase="quiz";pictureOptions=null;$("feedback").textContent="";$("explain").classList.add("hidden");$("answers").classList.remove("hidden");$("next").classList.add("hidden");$("ready").classList.add("hidden");$("repeat").classList.add("hidden");$("answerTitle").classList.add("hidden");$("visual").classList.remove("hidden");$("hear").textContent="🔊 소리 듣기";
 $("count").textContent=(index+1)+" / "+run.questions.length;$("stars").textContent="⭐ "+score;$("bar").style.width=(100*index/run.questions.length)+"%";
 const q=current(),mode=run.type==="diagnostic"?"choose":run.lesson.mode;
 if(!q)return;
 $("visual").textContent=q.visual;$("question").textContent=q.question||q.hint||"어떤 것일까요?";
 $("hint").textContent="차근차근 생각하고 골라봐요";
 $("playMascot").src="./joyi-"+(["hello","read","explore","build","write","celebrate"][index%6])+".svg";
 if(mode==="match"){
   const m=run.module;const rivals=m.items.filter(x=>x.answer!==q.answer&&x.visual!==q.visual);
   pictureOptions=A.shuffle([q,...A.shuffle(rivals,q.answer).slice(0,2)],q.answer+A.day()).map(x=>({visual:x.visual,answer:x.answer}));
   $("visual").textContent="🔍";$("question").textContent="'"+q.answer+"'에 해당하는 그림을 골라요";
   optionsRender(pictureOptions.map(x=>x.visual));
 }else optionsRender(quizOptions(q));
 if(mode==="explore"||mode==="remember"){
   $("answerTitle").textContent=q.answer;$("answerTitle").classList.remove("hidden");$("answers").classList.add("hidden");
   $("ready").classList.remove("hidden");$("ready").textContent=mode==="remember"?"기억했어요!":"이제 골라볼래요!";
   $("question").textContent=mode==="remember"?"쪼이와 함께 기억해요":"먼저 그림과 뜻을 알아봐요";
   $("hint").textContent=mode==="remember"?"그림과 이름을 보고 머릿속에 기억해요":"쪼이 설명을 들은 뒤 골라 봐요";
   if(mode==="explore"){$("explain").textContent=q.explain;$("explain").classList.remove("hidden")}
   phase="intro";
 }else if(mode==="listen"){
   $("visual").classList.add("hidden");$("question").textContent="소리를 듣고 같은 글자를 골라요";$("hint").textContent="정답은 소리로만 알려줘요";speak(q.answer,locale());
 }else if(mode==="speak"){
   $("answerTitle").textContent=q.answer;$("answerTitle").classList.remove("hidden");$("answers").classList.add("hidden");
   $("repeat").classList.remove("hidden");$("question").textContent="듣고 입으로 따라 말해봐요";
   $("hint").textContent="직접 말한 다음 버튼을 누르세요. 발음 점수는 매기지 않아요.";
   phase="speaking";speak(q.answer,locale());
 }else speak($("question").textContent);
 shownAt=performance.now();
}
$("ready").onclick=()=>{if(phase!=="intro")return;let q=current(),mode=run.lesson.mode;phase="quiz";
 $("answers").classList.remove("hidden");$("ready").classList.add("hidden");$("explain").classList.add("hidden");$("answerTitle").classList.add("hidden");
 if(mode==="remember"){$("visual").textContent="❔";$("question").textContent="아까 본 그림의 이름은?"}else $("question").textContent=q.question||q.hint||"어떤 것일까요?";
 shownAt=performance.now()};
$("repeat").onclick=()=>{if(phase!=="speaking")return;phase="quiz";$("repeat").classList.add("hidden");$("answerTitle").classList.add("hidden");$("answers").classList.remove("hidden");$("question").textContent=current().question||current().hint||"어떤 것일까요?";shownAt=performance.now()};
$("hear").onclick=()=>{const q=current();if(!q)return;const mode=run.type==="diagnostic"?"choose":run.lesson.mode;const answerMode=mode==="speak"||mode==="listen";speak(answerMode?q.answer:q.question||q.hint||q.answer,answerMode?locale():"ko-KR")};
$("answers").onclick=e=>{
 const btn=e.target.closest("[data-opt]");if(!btn||answered||phase!=="quiz")return;
 const q=current(),chosen=btn.dataset.opt,actual=pictureOptions?(pictureOptions.find(x=>x.visual===chosen)||{}).answer:chosen,ok=actual===q.answer,elapsed=Math.max(0,performance.now()-shownAt);
 answered=true;
 if(ok){score++;btn.classList.add("good");$("feedback").textContent="🌟 잘했어! "+(A.profile().name||"이현")+"!";speak("잘했어! "+(A.profile().name||"이현")+"! 정말 멋져!")}
 else{btn.classList.add("bad");$("feedback").textContent="💛 다음엔 더 잘할 수 있어!";speak("괜찮아, 다시 배워보자!")}
 if(run.type==="diagnostic")diagnosticResults.push({skill:q.skill,correct:ok,elapsed});
 else A.update(run.lesson.skill,ok,elapsed,run.lesson.mode);
 $("explain").textContent=run.type==="diagnostic"?"정답은 "+q.answer+"예요.":q.explain;$("explain").classList.remove("hidden");$("next").classList.remove("hidden");
};
$("next").onclick=()=>{
 if(!answered)return;index++;if(index<run.questions.length){render();return}
 if(run.type==="diagnostic"){A.finishDiagnosis(subject.id,diagnosticResults);speak("처음 진단 끝! 이제 쪼이랑 같이 배워요!")}
 else{A.markDone(run.lesson.id,Math.round(100*score/run.questions.length));speak("오늘의 탐험 성공! "+(A.profile().name||"이현")+"!")}
 $("feedback").textContent="🎉 탐험 완료!";$("bar").style.width="100%";setTimeout(catalog,950);
};
$("back").onclick=catalog;$("startDiag").onclick=beginDiagnostic;
$("modules").onclick=e=>{const btn=e.target.closest("[data-lesson]");if(btn)beginLesson(btn.dataset.lesson)};
window.addEventListener("pagehide",()=>{try{speechSynthesis.cancel()}catch(e){}});
catalog();if(params.has("lesson")&&C.lesson(params.get("lesson"))?.subject===subject.id)beginLesson(params.get("lesson"));
})();