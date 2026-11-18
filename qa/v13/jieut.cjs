const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const legacy=fs.readFileSync('legacy.html','utf8'),gate=fs.readFileSync('word-gate.js','utf8');
const baseline=JSON.parse(fs.readFileSync('docs/v13/jieut-bear/evaluator-baseline.json'));for(const [f,sha]of Object.entries(baseline))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(f,'utf8').match(/function traceEvaluation\(points,expected\).*$/m)[0]).digest('hex'),sha,f+' strict evaluator changed');
for(const f of ['legacy.html','word-gate.js']){const old=cp.execFileSync('git',['show','HEAD:'+f],{encoding:'utf8'}),now=fs.readFileSync(f,'utf8');assert.equal(now.match(/function traceEvaluation\(points,expected\).*$/m)[0],old.match(/function traceEvaluation\(points,expected\).*$/m)[0],f+' evaluator thresholds changed')}
const basic=new Function(legacy.slice(legacy.indexOf('function circlePath()'),legacy.indexOf('function dist(a,b)'))+';return glyphStrokes;')();
const a=gate.indexOf(' const CHO='),b=gate.indexOf(' function pathStroke(',a),stage=new Function('window',gate.slice(a,b)+';return window.JoyiHangulGuide.pathsForHangul;')({});
assert.equal(basic('ㅈ').length,2);assert.equal(stage('ㅈ').length,2);assert.equal(basic('ㅈ')[0].length,3);assert.equal(stage('ㅈ')[0].length,3);
for(const [ch,n]of Object.entries({'자':4,'조':4,'짖':5,'잊':4,'차':5})){assert.equal(basic(ch).length,n);assert.equal(stage(ch).length,n)}
assert.equal(stage('ㅉ').length,4);assert.equal(stage('짱').length,7);assert.equal(stage('앉').length,6);
const evaluator=new Function(legacy.slice(legacy.indexOf('function dist(a,b)'),legacy.indexOf('function tracePathD'))+';return traceEvaluation;')();
function sample(path){const p=[];for(let i=1;i<path.length;i++)for(let j=0;j<=30;j++)p.push(path[i-1].map((n,k)=>n+(path[i][k]-n)*j/30));return p}
for(const paths of [basic('ㅈ'),stage('ㅈ').map(s=>s.map(p=>p.map(v=>v/3)))]){const first=paths[0];assert(evaluator(sample(first),first).ok);assert(!evaluator(sample(first.slice(0,2)),first).ok,'horizontal alone passed');assert(!evaluator(sample([first[0],first.at(-1)]),first).ok,'corner-cut passed');assert(!evaluator(sample(first).reverse(),first).ok,'reverse passed')}
console.log('PASS ㅈ two-stroke geometry in both engines, initial/final/compound propagation and unchanged strict evaluators');
