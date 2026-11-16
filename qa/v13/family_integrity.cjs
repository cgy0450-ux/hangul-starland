// CI needs no secret: verify the exact locally tested encrypted artifact and public reader files.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const audit=JSON.parse(fs.readFileSync('docs/v13/family-reader/privacy.json','utf8')),bytes=fs.readFileSync('family-books.bin'),worker=fs.readFileSync('sw.js','utf8');
assert.equal(bytes.subarray(0,5).toString(),'JOYI1');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),audit.ciphertextSHA256);assert.equal(audit.books,4);assert.equal(audit.actualDecodedAudioFiles,40);assert.equal(audit.illustratedScenes,40);assert.equal(audit.illustrationsPending,0);
for(const file of ['family-books.bin','family-stories.html','family-stories.js','family-stories.css']){assert(fs.statSync(file).size>0);assert(worker.includes('./'+file),file+' not offline');}
for(const file of ['family-stories.js','slingshot.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
console.log('PASS authenticated-family artifact checksum, private illustration pending count, reader/game syntax and offline entries; no key needed in CI');
