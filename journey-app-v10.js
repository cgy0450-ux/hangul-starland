(function(){"use strict";
const C=window.JOY_CURRICULUM,A=window.JOY_CORE,$=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const subject=C.subject(params.get("subject")||"hangul")||C.subject("hangul");
let run=null,index=0,score=0,answered=false,phase="quiz",shownAt=0,diagnosticResults=[],pictureOptions=null,interaction=null;
let soundOn=true;try{soundOn=JSON.parse(localStorage.getItem("hangul-starland-v1")||"{}").sound!==false}catch(e){}
function speak(text,lang){if(soundOn)A.speak(text,lang||"ko-KR")}
function setSound(){ $("sound").textContent=soundOn?"🔊 소리 켬":"🔇 소리 끔"}
setSound();$("sound").onclick=()=>{soundOn=!soundOn;setSound();try{const prev=JSON.parse(localStorage.getItem("hangul-starland-v1")||"{}");prev.sound=soundOn;localStorage.setItem("hangul-starland-v1",JSON.stringify(prev))}catch(e){}if(!soundOn&&"speechSynthesis"in window)speechSynthesis.cancel()};
$("topTitle").textContent=subject.name;$("subjectTitle").textContent=subject.name+" 탐험";$("heroMascot").src="./joyi-"+subject.pose+".svg";
document.documentElement.style.setProperty("--subject-bg",subject.bg);
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
let recorder=null,voiceStream=null,voiceUrl=null,voiceAudio=null,voiceTimeout=null;
function clearVoice(){
 if(voiceTimeout){clearTimeout(voiceTimeout);voiceTimeout=null}
 if(recorder&&recorder.state!=="inactive"){try{recorder.onstop=null;recorder.stop()}catch(e){}}
 if(voiceStream){voiceStream.getTracks().forEach(t=>t.stop());voiceStream=null}
 if(voiceAudio){voiceAudio.pause();voiceAudio=null}
 if(voiceUrl){URL.revokeObjectURL(voiceUrl);voiceUrl=null}
 recorder=null;$("recordVoice").textContent="🎙️ 내 목소리 녹음";$("recordVoice").classList.remove("recording");$("playVoice").classList.add("hidden")
}
$("recordVoice").onclick=async()=>{
 if(recorder&&recorder.state==="recording"){recorder.stop();return}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){$("feedback").textContent="이 기기는 녹음 기능이 없어요. 그냥 따라 말해도 좋아요!";return}
 try{
  if("speechSynthesis"in window)speechSynthesis.cancel();
  voiceStream=await navigator.mediaDevices.getUserMedia({audio:true});
  const chunks=[],r=new MediaRecorder(voiceStream);recorder=r;
  r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  r.onstop=()=>{
    if(voiceStream){voiceStream.getTracks().forEach(t=>t.stop());voiceStream=null}
    if(voiceUrl)URL.revokeObjectURL(voiceUrl);
    if(chunks.length){voiceUrl=URL.createObjectURL(new Blob(chunks,{type:r.mimeType||"audio/webm"}));$("playVoice").classList.remove("hidden")}
    $("recordVoice").textContent="🎙️ 다시 녹음";$("recordVoice").classList.remove("recording");
    if(voiceTimeout){clearTimeout(voiceTimeout);voiceTimeout=null}
  };
  r.start();$("recordVoice").textContent="⏹️ 녹음 끝내기";$("recordVoice").classList.add("recording");
  $("feedback").textContent="🎤 이현이가 직접 말해 봐요! (최대 6초)";
  voiceTimeout=setTimeout(()=>{if(r.state==="recording")r.stop()},6000)
 }catch(e){$("feedback").textContent="마이크 허용 없이도 그냥 말하며 연습할 수 있어요!"}
};
$("playVoice").onclick=()=>{if(!voiceUrl)return;if(voiceAudio)voiceAudio.pause();voiceAudio=new Audio(voiceUrl);voiceAudio.play().catch(()=>{$("feedback").textContent="재생 버튼을 다시 눌러 주세요."})};
function catalog(){
 clearVoice();try{speechSynthesis.cancel()}catch(e){}
 document.body.classList.remove("playing");$("play").classList.remove("active");$("catalog").classList.remove("hidden");run=null;
 $("diagnosis").classList.toggle("hidden",!!A.data().diagnostics[subject.id]);
 const root=$("modules");root.replaceChildren();
 let stage=0;try{stage=Math.max(0,Math.min(3,Number(localStorage.getItem('joiland-stage-'+subject.id)||0)))}catch(e){}
 const m=subject.modules[stage],card=el("div","module"),head=el("div","module-title");
 head.append(el("strong","","오늘의 "+subject.name+" 놀이"),el("small","",(stage+1)+"번째 배움 · 5문제를 풀면 다음 단계로!"));
 const grid=el("div","tile-grid"),symbols=["📖","🖐️","🔊","🧩","🌟","🎤","🔍","🧲","🎴","🚂","🎬"];
 for(const [i,lesson] of m.lessons.entries()){
 const btn=el("button","tile");btn.type="button";btn.dataset.lesson=lesson.id;
 const span=el("span");span.append(el("strong","",lesson.title),el("small","","5문제씩 도전 · 다음 단계 선택"));
 btn.append(el("span","badge",symbols[i]),span);grid.append(btn);
 }
 card.append(head,grid);root.append(card);
 const external={
 hangul:[["한글 글씨 쓰기","legacy.html?game=trace"],["그림 낱말 놀이","legacy.html?game=quiz"],["동화 그림책","stories.html"]],
 math:[["수학 퀴즈 10종","academy.html?subject=math"],["숫자 따라 쓰기","writing.html?mode=numbers"],["자동차·소방차 놀이","requests.html"]],
 english:[["영어 퀴즈 10종","academy.html?subject=english"],["알파벳·단어 쓰기","writing.html?mode=english"]],
 science:[["과학 퀴즈 10종","academy.html?subject=science"],["동물 자동차 탐험","legacy.html"]],
 history:[["역사 퀴즈 10종","academy.html?subject=history"],["위인과 전래동화","stories.html"]],
 coding:[["코딩 퀴즈 10종","academy.html?subject=coding"],["진짜 블록 명령 코딩","coding-lab.html"],["손가락 미로","mazes.html"]],
 finance:[["가게·저금통 체험 10종","finance.html"],["자동차·소방차 놀이","requests.html"]],
 reading:[["동화책 20편","stories.html"],["우리 가족 이름 쓰기","legacy.html?game=family"]],
 life:[["동화로 감정 배우기","stories.html"],["사회성과 일상 놀이","legacy.html"]],
 creativity:[["자동차·소방차 놀이","requests.html"],["손가락 색칠·글씨","legacy.html"]]
 };
 const extras=$("extras");extras.replaceChildren();
 for(const [name,url] of (external[subject.id]||[])){
 const a=el("a","tile"),badge=el("span","badge","🌟"),label=el("strong","",name);
 a.href="./"+url;a.append(badge,label);extras.append(a);
 }
}
function beginDiagnostic(){run={type:"diagnostic",lesson:{mode:"choose",subject:subject.id},questions:A.diagnose(subject.id)};diagnosticResults=[];index=0;score=0;enter()}
function beginLesson(id){const lesson=C.lesson(id);if(!lesson||lesson.subject!==subject.id)return;run={type:"lesson",...A.session(id)};
 const bank=run.questions;for(let i=bank.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bank[i],bank[j]]=[bank[j],bank[i]];}
 try{const key='joiland-first-'+id,prev=localStorage.getItem(key);if(bank.length>1&&bank[0].answer===prev){let j=bank.findIndex(x=>x.answer!==prev);if(j>0)[bank[0],bank[j]]=[bank[j],bank[0]];}if(bank[0])localStorage.setItem(key,bank[0].answer)}catch(e){}
 index=0;score=0;enter()}
function enter(){document.body.classList.add("playing");$("catalog").classList.add("hidden");$("play").classList.add("active");render()}
function quizOptions(q){return q.choiceOptions||A.options(subject.id,q.module,q)}
function optionsRender(options){const parent=$("answers");parent.replaceChildren();
 const distinct=[...new Set(options)];for(const [i,opt] of distinct.entries()){
 const wrap=el("div","choice-wrap"),b=el("button","choice",opt),hear=el("button","choice-hear","🔊");
 b.type="button";b.dataset.opt=opt;b.style.setProperty("--choice",["#e6f7ff","#fff2d4","#f8e8ff","#e7ffe9"][i%4]);
 hear.type="button";hear.dataset.voice=opt;hear.setAttribute("aria-label","보기 소리 듣기");
 wrap.append(b,hear);parent.append(wrap)
}}
function locale(){return subject.id==="english"?"en-US":"ko-KR"}
function current(){return run.questions[index]}
function freshRivals(q){return A.shuffle(run.module.items.filter(x=>x.answer!==q.answer&&x.visual!==q.visual),A.day()+q.answer).filter((x,i,a)=>a.findIndex(y=>y.answer===x.answer)===i).slice(0,2)}
function addInteractionText(text){$("hint").textContent=text}
function makeTouchTarget(){
 const target=el("div","drop-target","📦 여기에 옮겨 놓아요");
 target.tabIndex=0;target.setAttribute("role","button");target.setAttribute("aria-label","정답 넣기");
 target.id="dropTarget";$("interaction").append(target);
 target.onclick=()=>{if(!interaction||interaction.type!=="drag"||!interaction.selected)return;processAnswer(interaction.selected)};
 target.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();target.click()}};
 target.ondragover=e=>e.preventDefault();
 target.ondrop=e=>{e.preventDefault();const value=e.dataTransfer?.getData("text/plain");if(value)processAnswer(value)}
}
function specialRender(q,mode){
 const rivals=freshRivals(q),panel=$("interaction");panel.replaceChildren();panel.classList.remove("hidden");
 if(mode==="tap"||mode==="pair"){
   pictureOptions=A.shuffle([q,...rivals],q.answer+A.day()).map(x=>({visual:x.visual,answer:x.answer}));
   optionsRender(pictureOptions.map(x=>x.visual));
   $("visual").textContent="🐯 🔎";$("question").textContent=mode==="pair"?"첫 번째: 소리를 듣고 그림을 찾아요":"쪼이가 말하는 그림을 찾아요!";
   addInteractionText("정답은 눈으로 찾고, 귀로 들어 봐요");interaction={type:mode,step:0};speak(q.answer,locale());
 } else if(mode==="drag"){
   optionsRender(quizOptions(q));$("question").textContent="맞는 말을 골라 상자에 넣어 봐요";
   addInteractionText("보기를 누르고 상자를 누르거나, 끌어다 놓아요");
   interaction={type:mode,selected:null};makeTouchTarget();speak(q.question,"ko-KR");
   $("answers").querySelectorAll("[data-opt]").forEach(btn=>{btn.draggable=true;btn.ondragstart=e=>{e.dataTransfer.setData("text/plain",btn.dataset.opt)}});
 } else if(mode==="order"){
   const seq=A.shuffle([q,...rivals],q.answer+"order").slice(0,3);
   interaction={type:mode,step:0,seq};
   optionsRender(seq.map(x=>x.answer));$("visual").textContent="🚂 🎯";
   $("question").textContent="쪼이가 말하는 낱말을 차례로 골라요";
   addInteractionText("첫 번째 소리를 듣고 찾아요 · 1 / "+seq.length);speak(seq[0].answer,locale());
 } else if(mode==="story"){
   $("visual").textContent=q.visual;$("question").textContent="쪼이와 이야기 먼저 들어요";
   optionsRender(quizOptions(q));$("answers").classList.add("hidden");
   $("answerTitle").textContent="📖 "+q.explain;$("answerTitle").classList.remove("hidden");
   $("ready").classList.remove("hidden");$("ready").textContent="이야기 듣고 퀴즈!";
   interaction={type:mode,step:0};phase="intro";speak(q.explain,"ko-KR");
 }
}
function processAnswer(chosen){
 const q=current(),mode=run.type==="diagnostic"?"choose":run.lesson.mode;
 if(!q||answered||phase!=="quiz")return;
 if(mode==="drag"&&interaction){interaction.selected=chosen}
 if(mode==="order"&&interaction){
   const target=interaction.seq[interaction.step].answer;
   if(chosen!==target){$("feedback").textContent="💛 다시 잘 들어봐요";speak(target,locale());return}
   interaction.step++;
   if(interaction.step<interaction.seq.length){
      $("feedback").textContent="🌟 좋아요! 다음 소리를 들어요!";
      $("hint").textContent=(interaction.step+1)+" / "+interaction.seq.length+" · 소리를 듣고 골라요";
      speak(interaction.seq[interaction.step].answer,locale());return;
   }
 }
 if(mode==="pair"&&interaction&&interaction.step===0){
   const selected=(pictureOptions||[]).find(x=>x.visual===chosen);
   if(!selected||selected.answer!==q.answer){$("feedback").textContent="💛 그림을 다시 찾아보자!";speak(q.answer,locale());return}
   interaction.step=1;pictureOptions=null;optionsRender(quizOptions(q));
   $("visual").textContent=q.visual;$("question").textContent="두 번째: 알맞은 말을 찾아요";
   $("hint").textContent="그림과 말이 한 쌍이에요";speak(q.question||q.answer,"ko-KR");return;
 }
 const btn=Array.from($("answers").querySelectorAll("[data-opt]")).find(b=>b.dataset.opt===chosen);
 const actual=pictureOptions?(pictureOptions.find(x=>x.visual===chosen)||{}).answer:chosen;
 const correct=mode==="order"?true:actual===q.answer;
 finishAnswer(correct,btn,performance.now()-shownAt);
}
function finishAnswer(ok,btn,elapsed){
 const q=current();if(answered)return;answered=true;
 if(ok){score++;btn?.classList.add("good");$("feedback").textContent="🌟 잘했어! "+(A.profile().name||"이현")+"!";speak("우리 "+(A.profile().name||"이현")+" 정말 잘하네!")}
 else{btn?.classList.add("bad");$("feedback").textContent="💛 설명을 듣고 다시 배워봐요!";speak("다시 배워보자!")}
 if(run.type==="diagnostic")diagnosticResults.push({skill:q.skill,correct:ok,elapsed});
 else {A.update(run.lesson.skill,ok,elapsed,run.lesson.mode);A.recordQuestion(subject.id,run.module.id,q,ok)}
 $("explain").textContent=run.type==="diagnostic"?"정답은 "+q.answer+"예요.":q.explain;
 $("explain").classList.remove("hidden");$("next").classList.remove("hidden");
}
function render(){
 clearVoice();document.getElementById('joyi-finish-actions')?.remove();$("voicePractice").classList.add("hidden");answered=false;phase="quiz";pictureOptions=null;interaction=null;$("interaction").replaceChildren();$("interaction").classList.add("hidden");$("feedback").textContent="";$("explain").classList.add("hidden");$("answers").classList.remove("hidden");$("next").classList.add("hidden");$("ready").classList.add("hidden");$("repeat").classList.add("hidden");$("answerTitle").classList.add("hidden");$("visual").classList.remove("hidden");$("hear").textContent="🔊 소리 듣기";
 $("count").textContent=(index+1)+" / "+run.questions.length;$("stars").textContent="⭐ "+score;$("bar").style.width=(100*index/run.questions.length)+"%";
 const q=current(),mode=run.type==="diagnostic"?"choose":run.lesson.mode;
 if(!q)return;
 $("visual").textContent=q.visual;$("question").textContent=q.question||q.hint||"어떤 것일까요?";
 $("hint").textContent="차근차근 생각하고 골라봐요";
 $("playMascot").src="./joyi-"+(index===run.questions.length-1?"celebrate":subject.id)+".svg";
 if(["tap","drag","pair","order","story"].includes(mode)){
   specialRender(q,mode);
 }else if(mode==="match"){
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
   phase="intro";speak(mode==="remember"?"이름을 기억해 봐요. "+q.answer:q.explain,"ko-KR");
 }else if(mode==="listen"){
   $("visual").classList.add("hidden");$("question").textContent="소리를 듣고 알맞은 답을 골라요";$("hint").textContent="정답은 소리로만 알려줘요";speak(q.answer,locale());
 }else if(mode==="speak"){
   $("voicePractice").classList.remove("hidden");$("answerTitle").textContent=q.answer;$("answerTitle").classList.remove("hidden");$("answers").classList.add("hidden");
   $("repeat").classList.remove("hidden");$("question").textContent="듣고 입으로 따라 말해봐요";
   $("hint").textContent="직접 말한 다음 버튼을 누르세요. 발음 점수는 매기지 않아요.";
   phase="speaking";speak(q.answer,locale());
 }else if(!["tap","drag","pair","order","story"].includes(mode))speak($("question").textContent);
 shownAt=performance.now();
}
$("ready").onclick=()=>{if(phase!=="intro")return;let q=current(),mode=run.lesson.mode;phase="quiz";
 $("answers").classList.remove("hidden");$("ready").classList.add("hidden");$("explain").classList.add("hidden");$("answerTitle").classList.add("hidden");
 if(mode==="remember"){$("visual").textContent="❔";$("question").textContent="아까 본 그림의 이름은?"}
 else if(mode==="story"){$("question").textContent=q.question||"이야기를 잘 들었나요?";$("hint").textContent="이야기에 나왔던 답을 찾아요"}
 else $("question").textContent=q.question||q.hint||"어떤 것일까요?";
 speak($("question").textContent,"ko-KR");shownAt=performance.now()};
$("repeat").onclick=()=>{if(phase!=="speaking")return;phase="quiz";$("repeat").classList.add("hidden");$("answerTitle").classList.add("hidden");$("answers").classList.remove("hidden");$("question").textContent=current().question||current().hint||"어떤 것일까요?";shownAt=performance.now()};
$("hear").onclick=()=>{const q=current();if(!q)return;const mode=run.type==="diagnostic"?"choose":run.lesson.mode;const answerMode=mode==="speak"||mode==="listen";speak(answerMode?q.answer:q.question||q.hint||q.answer,answerMode?locale():"ko-KR")};
$("answers").onclick=e=>{
 const hear=e.target.closest("[data-voice]");
 if(hear){speak(hear.dataset.voice,locale());return}
 const btn=e.target.closest("[data-opt]");if(!btn||answered)return;
 const mode=run.type==="diagnostic"?"choose":run.lesson.mode;
 if(mode==="drag"){interaction.selected=btn.dataset.opt;$("dropTarget").textContent="🧲 "+btn.dataset.opt+" → 상자를 눌러 넣어요";$("dropTarget").classList.add("selected");return}
 processAnswer(btn.dataset.opt)
};
function finishFive(){
 const diagnostic=run.type==="diagnostic",lesson=run.lesson;
 if(diagnostic)A.finishDiagnosis(subject.id,diagnosticResults);
 else A.markDone(lesson.id,Math.round(100*score/run.questions.length));
 if(!diagnostic){try{localStorage.setItem('joiland-stage-'+subject.id,String(Math.min(3,lesson.module+1)))}catch(e){}}
 $("bar").style.width="100%";$("visual").textContent="🏆🐯";$("question").textContent="다섯 문제 모두 성공!";$("hint").textContent="다음 단계 또는 다른 놀이를 선택해요!";
 $("answers").classList.add("hidden");$("next").classList.add("hidden");$("ready").classList.add("hidden");$("repeat").classList.add("hidden");$("answerTitle").classList.add("hidden");$("interaction").classList.add("hidden");$("explain").classList.add("hidden");
 $("feedback").textContent="🌟 이현이 최고!";
 document.getElementById('joyi-finish-actions')?.remove();
 const actions=el("div","",undefined);actions.id="joyi-finish-actions";actions.style.cssText="display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin:10px";
 const other=el("button","primary","🎨 다른 놀이 하기");other.onclick=catalog;actions.append(other);
 if(!diagnostic){const nextStage=Math.min(3,lesson.module+1),nextLesson=subject.modules[nextStage]?.lessons.find(x=>x.mode===lesson.mode);
 if(nextLesson){const nextBtn=el("button","primary",nextStage===lesson.module?"🔁 다시 도전":"🚀 다음 단계 5문제");nextBtn.onclick=()=>beginLesson(nextLesson.id);actions.prepend(nextBtn)}}
 $("feedback").parentElement.append(actions);speak("다섯 문제 성공! 다음 단계 또는 다른 놀이를 골라 봐요!","ko-KR");
}
$("next").onclick=()=>{if(!answered)return;index++;if(index<run.questions.length){render();return}finishFive()};
$("back").onclick=catalog;$("startDiag").onclick=beginDiagnostic;
$("modules").onclick=e=>{const btn=e.target.closest("[data-lesson]");if(btn)beginLesson(btn.dataset.lesson)};
window.addEventListener("pagehide",()=>{clearVoice();try{speechSynthesis.cancel()}catch(e){}});
catalog();if(params.has("lesson")&&C.lesson(params.get("lesson"))?.subject===subject.id)beginLesson(params.get("lesson"));
})();