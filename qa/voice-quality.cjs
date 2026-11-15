const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let spoken;const values={};const voices=[{name:'Basic Korean',lang:'ko-KR'},{name:'Korean Natural',lang:'ko-KR'},{name:'English Neural',lang:'en-US'}];
const context={window:{speechSynthesis:{getVoices:()=>voices,speak:u=>spoken=u}},localStorage:{getItem:k=>values[k]||null},document:{readyState:'loading',addEventListener:()=>{}},location:{pathname:'/adventure.html'}};
vm.runInNewContext(fs.readFileSync('voice-quality.js','utf8'),context);
context.window.speechSynthesis.speak({lang:'ko-KR',pitch:1.4,rate:1.3});assert.equal(spoken.voice.name,'Korean Natural');assert.equal(spoken.pitch,1);assert.equal(spoken.rate,1.02);
values['joiland-voice-name']='Basic Korean';context.window.speechSynthesis.speak({lang:'ko-KR'});assert.equal(spoken.voice.name,'Basic Korean');
context.window.speechSynthesis.speak({lang:'en-US',pitch:1.2});assert.equal(spoken.voice.name,'English Neural');assert.equal(spoken.pitch,1.2);
voices.length=0;context.window.speechSynthesis.speak({lang:'ko-KR'});assert.equal(spoken.lang,'ko-KR');
console.log('PASS natural priority, stored preference, Korean pitch/rate, English separation and empty voice list');
