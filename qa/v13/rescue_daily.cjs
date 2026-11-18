const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};for(const f of ['stories-data.js','stories-additions.js','stories-friends.js','stories-rescue.js','daily-selection.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),c);
const books=c.window.JOY_STORIES,D=c.window.JoyiDaily;assert.equal(books.length,27);assert.equal(D.storyTotal,books.length);assert.deepEqual(Array.from(D.characterStoryIds).sort((a,b)=>a-b),[21,22,23,24,25,26]);
const counts=Array(books.length).fill(0),start=Date.UTC(2026,10,17,15),ids=books.map((_,i)=>i);
for(let day=0;day<42;day++){const time=start+day*86400000,selected=D.stories(ids,time);assert.equal(selected.length,3);assert.equal(new Set(selected).size,3);assert.equal(selected.filter(i=>D.characterStoryIds.includes(i)).length,1);assert.deepEqual(selected,D.stories(ids,time));selected.forEach(i=>counts[i]++)}
assert(counts.every((n,i)=>n===(D.characterStoryIds.includes(i)?7:4)),'all classics and character stories must rotate fairly');assert(D.stories(ids,start).includes(26),'new rescue narration must be available on release day');assert.notDeepEqual(D.stories(ids,start-1),D.stories(ids,start),'KST midnight must rotate');
const subCounts=Array(10).fill(0);for(let i=0;i<10;i++)D.pick(Array.from({length:10},(_,i)=>i),3,start+i*86400000).forEach(x=>subCounts[x]++);assert(subCounts.every(n=>n===3),'subject selection fairness changed');
const book=books[26];assert.equal(book.format,'audio');assert.equal(book.cover,null);assert.equal(book.pages.length,10);assert.equal(book.question.answer,0);
for(const p of book.pages){assert(p.text.length>100&&p.chapter);assert.equal(p.art,null);assert(fs.statSync(p.audio.replace('./','')).size>1024);assert(fs.readFileSync('sw.js','utf8').includes("'"+p.audio+"'"))}
for(const pair of [[],[0],[21,22],[0,21],[0,1,21,22]]){const a=D.stories(pair,start);assert.equal(a.length,Math.min(pair.length,3));assert.equal(a.length,new Set(a).size)}
console.log('PASS 42 KST days: daily exactly three, one character, fair complete rotation; unchanged subject schedule; ten real narration files and explicit no-art edition');
