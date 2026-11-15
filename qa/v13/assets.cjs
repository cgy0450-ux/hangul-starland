// CI-compatible check: approved art must really exist, match its export, and be available offline.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync('docs/v13/asset-plan.json','utf8')),cache=fs.readFileSync('sw.js','utf8'),seen=new Set();let count=0;
for(const item of [...manifest.planned,...(manifest.supporting||[])]){
 if(item.status==='pending'){assert.equal(item.path,null,'pending art cannot claim an output path');continue;}
 assert.equal(item.status,'approved');assert(item.reviewed&&item.alt&&item.provenance,'missing art review/provenance');
 const file=path.resolve(item.path);assert(file.startsWith(root+path.sep),'art path escapes repository');const bytes=fs.readFileSync(file);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');const sha=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha,item.sha256,item.id+' export checksum mismatch');assert(!seen.has(sha),'duplicated art export');seen.add(sha);assert(cache.includes("'./"+item.path+"'"),item.id+' missing offline cache');count++;
}
console.log('PASS: '+count+' real reviewed WebP exports, checksums, unique content and offline inclusion.');
