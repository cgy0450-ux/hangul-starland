const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};for(const f of ['curriculum-v10.js','learning-scenes.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const C=c.window.JOY_CURRICULUM,S=c.window.JoyiSceneCatalog,report=[];
for(const sub of C.subjects)for(const mod of sub.modules)for(const [index,q]of mod.items.entries()){
 const path=S.find(sub.id,q.answer,q.visual);const existingHistory=sub.id==='history'&&mod.id==='history-0';
 const intentional=['hangul','math'].includes(sub.id)||sub.id==='english'&&mod.id!=='english-3'||sub.id==='coding'&&['coding-0','coding-1'].includes(mod.id)||sub.id==='creativity'&&mod.id!=='creativity-3';
 assert(path||existingHistory||intentional,'Unreviewed or missing scene '+mod.id+':'+q.answer);
 if(path)assert(fs.existsSync(path.replace(/^\.\//,'')),path);
 report.push({subject:sub.id,module:mod.id,index,question:q.question,answer:q.answer,visual:q.visual,path:path||null,decision:path?'new contextual scene':existingHistory?'existing contextual historical scene':'preserve precise teaching glyph/count/color/direction or appropriate existing single-object illustration'});
}
assert.equal(report.length,240);assert.equal(S.rows.length,138);assert.equal(new Set(S.rows.map(r=>r.path)).size,138);
for(const [action,tool]of [['비의 양','측우기'],['바람 일으키기','부채'],['찧기','절구'],['실','물레'],['밝혀 주기','등잔']]){
 const target=S.find('history',tool,'')||({'측우기':'./assets/v13/history.raingauge.webp','물레':'./assets/v13/history.spinning.webp'})[tool];
 // Both are valid reviewed contextual scenes for rain gauge/spinning; explicit targets avoid misleading book/lamp mappings.
 assert.equal(S.find('history',action,''),({'비의 양':'./assets/v13/history.raingauge.webp','실':'./assets/v13/history.spinning.webp'})[action]||target,action);
}
fs.mkdirSync('docs/v13/scene-audit',{recursive:true});fs.writeFileSync('docs/v13/scene-audit/curriculum.json',JSON.stringify(report,null,2)+'\n');console.log('PASS 240 curriculum illustration decisions; 138 unique actual context scenes');
