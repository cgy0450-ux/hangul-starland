/* JOY LEARNING CORE v10: local-only, privacy-preserving assessment and spaced review. */
(function(g){"use strict";
const C=g.JOY_CURRICULUM;if(!C)throw Error("Curriculum is required");
const KEY="joiland-learning-v10";
const defaults=()=>({version:10,created:Date.now(),name:"이현",age:5,dailyMinutes:12,diagnostics:{},skills:{},events:[],missions:{},voice:true});
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||"null");return o&&o.version===10?Object.assign(defaults(),o):defaults()}catch(e){return defaults()}}
let data=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
function day(){return new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Seoul"})}
function stable(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
function shuffle(arr,seed){const a=arr.slice();let z=stable(String(seed));for(let i=a.length-1;i>0;i--){z=(Math.imul(z,1664525)+1013904223)>>>0;const j=z%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function getSkill(id){return data.skills[id]||{attempts:0,correct:0,streak:0,mastery:0,due:"",last:"",avgMs:0}}
function mastery(id){const s=getSkill(id);return s.attempts?(s.correct+1)/(s.attempts+2):0}
function update(id,correct,elapsed,mode){
 const o=getSkill(id);o.attempts++;if(correct)o.correct++;o.streak=correct?o.streak+1:0;
 o.mastery=Math.round(100*masteryFrom(o));o.last=day();o.avgMs=Math.round((o.avgMs*(o.attempts-1)+Math.min(120000,Math.max(0,elapsed||0)))/o.attempts);
 const plus=correct?Math.min(9,[0,1,2,4,7,9][Math.min(o.streak,5)]):1;
 const next=new Date();next.setDate(next.getDate()+plus);o.due=next.toLocaleDateString("en-CA",{timeZone:"Asia/Seoul"});data.skills[id]=o;
 data.events.push({date:day(),skill:id,correct:!!correct,mode:mode||"choose",duration:Math.min(120000,Math.max(0,elapsed||0))});
 if(data.events.length>1500)data.events=data.events.slice(-1200);
 save();return o;
}
function masteryFrom(s){return (s.correct+1)/(s.attempts+2)}
function options(subjectId,moduleIdx,item){const sub=C.subject(subjectId),mod=sub.modules[moduleIdx];
 const wrong=shuffle([...new Set(mod.items.map(x=>x.answer).filter(x=>x!==item.answer))],day()+item.answer+moduleIdx);
 // For two legitimate categories, two meaningful answers are better than a random third.
 return shuffle([item.answer,...wrong.slice(0,2)],item.answer+day());
}
function session(lessonId,count=5){
 const lesson=C.lesson(lessonId);if(!lesson)throw Error("Unknown lesson");const sub=C.subject(lesson.subject),mod=sub.modules[lesson.module];
 const bank=shuffle(mod.items,lessonId+day()).slice(0,Math.min(count,mod.items.length));
 return {lesson,subject:sub,module:mod,questions:bank.map((item,i)=>({...item,choiceOptions:options(lesson.subject,lesson.module,item),seq:i}))};
}
function diagnose(subjectId){const sub=C.subject(subjectId);if(!sub)throw Error("Unknown subject");
 return sub.modules.flatMap((m,i)=>shuffle(m.items,subjectId+i+"diagnostic").slice(0,2).map(x=>({subject:subjectId,module:i,skill:m.id,answer:x.answer,visual:x.visual,question:x.question,explain:x.explain,hint:x.hint,choiceOptions:options(subjectId,i,x)})));
}
function finishDiagnosis(subjectId,records){
 const sums={};for(const r of records){const id=r.skill;if(!sums[id])sums[id]={correct:0,total:0};sums[id].total++;if(r.correct)sums[id].correct++;update(id,r.correct,r.elapsed||0,"diagnostic");}
 data.diagnostics[subjectId]={date:day(),summary:sums,method:"short screening, not a standardized test"};save();return data.diagnostics[subjectId];
}
function due(s){return !s.due||s.due<=day()}
function recommend(subjectId,limit=3){
 const subjects=subjectId?[C.subject(subjectId)].filter(Boolean):C.subjects;
 let all=subjects.flatMap(sub=>sub.modules.flatMap(mod=>mod.lessons.map(lesson=>{
 const sk=getSkill(mod.id),s=mastery(mod.id),unseen=!sk.attempts,overdue=due(sk);
 let priority=(unseen?80:0)+(overdue?35:0)+(1-s)*22+(lesson.mode==="explore"?8:0);
 const targetLevel=Math.min(4,Math.max(1,(data.age||5)-3));
 const previous=mod.level>1?getSkill(sub.modules[mod.level-2].id):null;
 const predecessorReady=previous&&previous.attempts>=4&&(previous.correct+1)/(previous.attempts+2)>=.72;
 if(mod.level>targetLevel&&!predecessorReady)priority-=70*(mod.level-targetLevel);
 if(mod.level>1&&previous&&!previous.attempts)priority-=28;
 if(data.missions[day()]&&data.missions[day()][lesson.id])priority-=65;
 if(sk.attempts>=4&&s>=.78)priority-=55;
 if(lesson.mode==="speak"&&!sk.attempts)priority-=12;
 return {lesson,subject:sub,module:mod,skill:sk,priority};
 })));
 all.sort((a,b)=>b.priority-a.priority||stable(day()+a.lesson.id)-stable(day()+b.lesson.id));
 const picked=[],used={};for(const x of all){if(picked.length===limit)break;const id=x.lesson.skill;if(used[id]||picked.filter(a=>a.subject.id===x.subject.id).length>=2)continue;used[id]=true;picked.push(x);}
 return picked;
}
function review(){return C.subjects.flatMap(sub=>sub.modules.filter(m=>getSkill(m.id).attempts&&due(getSkill(m.id))).map(m=>({subject:sub,module:m,mastery:mastery(m.id)}))).sort((a,b)=>a.mastery-b.mastery)}
function report(){const today=day(),events=data.events.filter(e=>e.date===today);
 return {today,attempts:events.length,correct:events.filter(e=>e.correct).length,minutes:Math.round(events.reduce((s,e)=>s+e.duration,0)/60000),subject:C.subjects.map(sub=>{
 const skills=sub.modules.map(m=>({id:m.id,title:m.title,...getSkill(m.id),mastery:mastery(m.id)}));
 const tried=skills.filter(s=>s.attempts>0);return {id:sub.id,name:sub.name,skills,attempts:tried.reduce((n,s)=>n+s.attempts,0),accuracy:tried.length?tried.reduce((n,s)=>n+s.correct,0)/Math.max(1,tried.reduce((n,s)=>n+s.attempts,0)):null};
 }),weak:review().slice(0,8)};
}
function profile(){return {...data,name:data.name||"이현"}}
function configure(values){if(values.name!==undefined)data.name=String(values.name).slice(0,15);if(values.age!==undefined)data.age=Math.min(8,Math.max(4,Number(values.age)||5));if(values.dailyMinutes!==undefined)data.dailyMinutes=Math.min(25,Math.max(5,Number(values.dailyMinutes)||12));save()}
function markDone(lessonId,accuracy){const k=day();const m=data.missions[k]||{};m[lessonId]={date:k,accuracy,finished:Date.now()};data.missions[k]=m;save()}
function playedToday(){return Object.keys(data.missions[day()]||{}).length}
function speak(text,lang="ko-KR"){
 if(!("speechSynthesis" in g))return false;
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text));u.lang=lang;u.rate=.86;u.pitch=1.16;const voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));u.voice=voices.find(v=>/natural|enhanced|premium|google/i.test(v.name))||voices[0]||null;speechSynthesis.speak(u);return true}catch(e){return false}
}
g.JOY_CORE={data:()=>data,profile,configure,day,stable,shuffle,session,options,diagnose,finishDiagnosis,update,getSkill,mastery,recommend,review,report,markDone,playedToday,speak};
})(window);