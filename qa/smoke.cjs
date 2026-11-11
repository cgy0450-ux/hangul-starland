const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const pages=['index.html','academy.html','writing.html','stories.html','mazes.html'];
let compiled=0;
for(const name of pages){
 const html=fs.readFileSync(name,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 assert(scripts.length>0,name+' scripts missing');
 for(const block of scripts)if(block[1].trim()){new vm.Script(block[1],{filename:name});compiled++;}
}
const index=fs.readFileSync('index.html','utf8');
const academy=fs.readFileSync('academy.html','utf8');
const writing=fs.readFileSync('writing.html','utf8');
const stories=fs.readFileSync('stories.html','utf8');
const maze=fs.readFileSync('mazes.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const data=fs.readFileSync('stories-data.js','utf8');
const sandbox={window:{}};vm.runInNewContext(data,sandbox);
assert.equal(sandbox.window.JOY_STORIES.length,20,'exactly twenty stories expected');
for(const b of sandbox.window.JOY_STORIES){
 assert.equal(b.pages.length,10,b.title+' must be ten pages');
 assert(b.pages.every(p=>p.text.length>=35),b.title+' pages too short');
 assert(b.setting&&b.icons.length>0,b.title+' art scene metadata missing');
}
assert(index.includes('function chooseSubjects()'),'subject gateway missing');
for(const subject of ['math','science','english','history','coding'])assert(index.includes(subject),'subject missing: '+subject);
assert(index.includes('dayShuffle(mode,WORDS)'),'daily Hangul decks missing');
assert(!index.includes('<script src="./bgm.js'),'background music must be removed from home');
assert(!academy.includes('<script src="./bgm.js'),'background music must be removed from games');
assert(!stories.includes('<script src="./bgm.js'),'background music must be removed from books');
assert(!maze.includes('<script src="./bgm.js'),'background music must be removed from maze');
assert(stories.includes('function scenePicture')&&stories.includes('window.JOY_STORIES'),'illustrated ten-page story renderer missing');
assert(maze.includes('pointermove')&&maze.includes('trail.push(pos)'),'finger maze missing');
assert(writing.includes('function drawGuide')&&writing.includes('function coverage')&&writing.includes('letters={'),'number and English finger writing missing');
for(const x of [10,20,30,40,50,60,70,80,90,100])assert(writing.includes(String(x)),'ten-step writing target missing: '+x);
assert(academy.includes('name:"숫자 듣고 찾기"')&&academy.includes('numbered(Number(answer))'),'spoken number game missing');
assert(academy.includes('const bank=generate(subject,i)'),'non-repeating deck generation missing');
assert(academy.includes('name:"사과 빼기"'),'ten math games missing');
assert(academy.includes('name:"어떤 계절일까?"'),'ten science games missing');
assert(academy.includes('name:"영어 글자 찾기"'),'ten English games missing');
assert(academy.includes('games.history=')&&academy.includes('games.coding='),'history and coding subjects missing');
assert(sw.includes('academy.html')&&sw.includes('writing.html')&&sw.includes('stories-data.js'),'offline assets missing');
console.log('PASS: '+compiled+' HTML scripts; 20 10-page stories; 5 subject groups; writing, daily decks, maze, audio and music removal.');
