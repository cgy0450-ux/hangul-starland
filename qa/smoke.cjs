const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const pages=['index.html','stories.html','mazes.html','academy.html'];
let parsed=0;
for(const name of pages){
  const html=fs.readFileSync(name,'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert(scripts.length>0,name+' must contain scripts');
  for(const script of scripts){
    if(!script[1].trim())continue;
    new vm.Script(script[1],{filename:name});
    parsed++;
  }
}
new vm.Script(fs.readFileSync('bgm.js','utf8'),{filename:'bgm.js'});
const index=fs.readFileSync('index.html','utf8');
const stories=fs.readFileSync('stories.html','utf8');
const maze=fs.readFileSync('mazes.html','utf8');
const academy=fs.readFileSync('academy.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
for(const path of ['./stories.html','./mazes.html'])assert(index.includes(path),'home link missing: '+path);
assert(index.includes('v6.5 image-art corrections'),'art fix not preserved');
assert(stories.includes('토끼와 거북이')&&stories.includes('용감한 빨간 자동차'),'five-story book list missing');
assert(maze.includes('별자리')&&maze.includes('joiland-maze-done'),'maze levels missing');
assert(sw.includes('stories.html')&&sw.includes('mazes.html')&&sw.includes('bgm.js')&&sw.includes('academy.html'),'offline cache paths missing');
assert(index.includes('function chooseSubjects()')&&index.includes('data-a="choose-subject"'),'four-subject gateway missing');
assert(index.includes('dayShuffle(mode,WORDS)')&&index.includes('dayIndex("quiz-picture",WORDS.length)'),'daily Hangul challenge rotation missing');
assert(academy.includes('math:')&&academy.includes('science:')&&academy.includes('english:'),'math/science/English games missing');
for(const title of ['동물 수 세기','숫자 더하기','도형 탐험','식물 성장 탐험','오감 탐정','동물 영어','색깔 영어'])assert(academy.includes(title),'subject game missing: '+title);
assert(maze.includes('pointermove')&&maze.includes('polyline points=')&&maze.includes('cellAt(')&&maze.includes('trail.push(pos)'),'finger-drawn maze trace missing');
console.log('PASS: '+parsed+' inline scripts + bgm.js; 4 pages; four subjects, rotating learning decks, finger maze, stories, and offline links present.');
