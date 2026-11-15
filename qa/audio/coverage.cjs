const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};
for(const file of ['audio-normalize.js','audio-manifest.js','curriculum-v10.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
const normalize=ctx.window.JoyiAudioNormalize,map=ctx.window.JoyiAudioClips,C=ctx.window.JOY_CURRICULUM;
const required=new Map();
function add(text,where){const key=normalize(String(text||''));if(/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(key)||/^\d+(?:[+-]\d+)?$/.test(key))required.set(key,where)}
for(const subject of C.subjects)for(const module of subject.modules)for(const q of module.items){
 for(const key of ['visual','answer','hint','question','explain'])add(q[key],subject.id+'.'+module.id+'.'+key);
 add(q.explain+' '+(q.question||'이 이야기에서 무엇을 배웠을까요?'),subject.id+'.'+module.id+'.story');
 add('이름을 기억해 봐요. '+q.answer,subject.id+'.'+module.id+'.remember');
 add("'"+q.answer+"'에 해당하는 그림을 골라요",subject.id+'.match');
}
for(const file of fs.readdirSync('.').filter(f=>/\.(js|html)$/.test(f)&&!f.startsWith('audio-manifest'))){
 const source=fs.readFileSync(file,'utf8');
 if(/speechSynthesis|SpeechSynthesisUtterance|joiland-unified\.js|learning-core-v10\.js/.test(source)&&file.endsWith('.html')){
  assert(source.includes('audio-normalize.js'),file+' missing normalizer');
  assert(source.includes('audio-manifest.js'),file+' missing generated manifest');
  assert(source.includes('prerecorded-audio.js'),file+' missing recorded adapter');
 }
 for(const match of source.matchAll(/(?:say|voice|speak)\(\s*(['"])((?:\\.|(?!\1).)*?)\1/g)){
  try{add(vm.runInNewContext(match[1]+match[2]+match[1]),file+': direct call')}catch{}
 }
}
for(const text of ['우리 친구 정말 잘하네!','다시 배워보자!','다섯 문제 성공! 다음 단계 또는 다른 놀이를 골라 봐요!'])add(text,'journey fixed');
const missing=[...required].filter(([text])=>!map[text]);
assert.deepEqual(missing,[],'missing recorded Korean: '+JSON.stringify(missing.slice(0,10)));
assert(!/if\(!src\)return native\.speak\(u\)/.test(fs.readFileSync('prerecorded-audio.js','utf8')),'recorded Korean still has device fallback');
console.log('PASS '+required.size+' statically reachable Korean utterances mapped; all speech pages load the recorded adapter; recorded Korean has no device fallback');
