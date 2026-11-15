const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('stories-data.js','utf8'),c);vm.runInNewContext(fs.readFileSync('audio-normalize.js','utf8'),c);const rows=new Map();function add(t,kind){if(typeof t!=='string')return;t=c.window.JoyiAudioNormalize(t);if(!(/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(t)||/^\d+(?:[+-]\d+)?$/.test(t))||t.length<1||/[<>{}=]|function|document|querySelector/.test(t))return;if(!rows.has(t))rows.set(t,{text:t,kind})}for(const b of c.window.JOY_STORIES)for(const p of b.pages)add(p.text,'story');
for(const file of fs.readdirSync('.').filter(f=>/\.(js|html)$/.test(f)&&!f.startsWith('stories-data'))){const s=fs.readFileSync(file,'utf8');for(const m of s.matchAll(/(?:say|voice|speak)\(\s*(['"])((?:\\.|(?!\1).)*?)\1/g)){try{add(vm.runInNewContext(m[1]+m[2]+m[1]),'guide')}catch{}}}
// Include every Korean phrase stored in application data. Many learning calls pass
// question/answer variables rather than string literals directly to speak().
for(const file of ['academy.html','finance.html','coding-lab.html','writing.html','joiland-unified.js','word-gate.js','mazes.html','parent.html']){
 const s=fs.readFileSync(file,'utf8');
 for(const m of s.matchAll(/(['"])((?:\\.|(?!\1)[^\\\r\n])*?)\1/g)){
  try{const t=vm.runInNewContext(m[0]);if(typeof t==='string'&&t.length<=240&&/[가-힣]/.test(t)&&!/[<>{}=]/.test(t))add(t,'application')}catch{}
 }
}
const curriculumContext={window:{}};vm.runInNewContext(fs.readFileSync('curriculum-v10.js','utf8'),curriculumContext);
for(const subject of curriculumContext.window.JOY_CURRICULUM.subjects)for(const module of subject.modules)for(const q of module.items){
 for(const value of [q.visual,q.answer,q.hint,q.question,q.explain])add(String(value||''),'learning');
 add(q.explain+' '+(q.question||'이 이야기에서 무엇을 배웠을까요?'),'learning');
 add('이름을 기억해 봐요. '+q.answer,'learning');
 add("'"+q.answer+"'에 해당하는 그림을 골라요",'learning');
}
for(const t of ['우리 친구 정말 잘하네!','다시 배워보자!','다섯 문제 성공! 다음 단계 또는 다른 놀이를 골라 봐요!','아까 본 그림의 이름은?','더하기'])add(t,'learning');
const curatedContext={window:{}};vm.runInNewContext(fs.readFileSync('curated-questions.js','utf8'),curatedContext);
for(const subject of Object.values(curatedContext.window.JOY_CURATED))for(const game of subject)for(const row of game){
 for(const value of row.slice(1))add(String(value),'academy');
 const answer=String(row[2]);if(/[가-힣]/.test(answer)){add('맞아요! '+answer+'예요.','academy');add('쪼이가 알려줄게! 이번 문제의 답은 '+answer+'! 이제 천천히 골라볼까?','academy')}
}
const ones=['','일','이','삼','사','오','육','칠','팔','구'];for(let n=0;n<=100;n++){add(String(n),'number');if(n===0)add('영','number');else if(n===100)add('백','number');else add((n>=10?(n>=20?ones[Math.floor(n/10)]:'')+'십':'')+ones[n%10],'number')}
const financeSource=fs.readFileSync('finance.html','utf8'),financeStart=financeSource.indexOf('const games='),financeEnd=financeSource.indexOf('\nconst day=',financeStart);const financeGames=new Function(financeSource.slice(financeStart,financeEnd)+';return games')();
for(const game of financeGames)for(const q of game.items){
 if(Array.isArray(q))for(const value of q)add(String(value),'finance');
 if(game.type==='shop'){for(const round of [0,1]){const stock=Math.max(0,q[1]+(round===0?-1:1));add('동전 '+stock+'개가 있어요. '+q[0]+'은 '+q[1]+'개예요. 살 수 있을까요?','finance')}}
 if(game.type==='save')add('동전 '+q+'개를 모아 봐요!','finance');
}
for(const t of ['안녕! 나는 쪼이야. 오늘은 어떤 재미있는 놀이를 해 볼까?','안녕, 우리 이현이! 오늘도 쪼이랑 신나게 놀자!','와아! 정말 잘했어!','다음 단계로 출발!','나온 공룡을 잘 보고 같은 그림을 눌러요','그림 안의 넓은 부분을 눌러 봐요.'])add(t,'guide');
for(const n of ['별','달','토성','지구','혜성','로켓']){add(n+(n==='지구'?'를':'을')+' 찾아 보세요!','guide');add(n+' 그림을 다시 찾아봐요','guide')}
for(const n of ['티라노사우루스','디플로도쿠스','스테고사우루스','파라사우롤로푸스','안킬로사우루스','트리케라톱스']){add(n+'가 나왔어요! 아래에서 같은 공룡을 찾아 주세요.','guide');add('짜잔! '+n+'가 나왔어!','guide')}
const legacy=fs.readFileSync('legacy.html','utf8'),start=legacy.indexOf('const WORDS=['),end=legacy.indexOf('const CONSONANTS=',start);const words=new Function(legacy.slice(start,end)+';return WORDS')();for(const w of words)add(w.w,'word');
for(const word of ['소방차','자동차','공룡','알','화석','별','우주','행성','먹이','동물','친구','두더지','색깔','그림자','다른그림','숨은그림']){add(word,'word');add(word+'! '+[...word][0]+' 따라 써 봐요!','guide');for(const ch of [...word]){add(word+'! '+ch+' 따라 쓰기','guide');add(ch+' 따라 써 볼까?','guide')}}
for(const file of ['mini-games.html','adventure.html','car-collect.html','car-dodge.html','firetruck-rescue.html','coloring.js']){const src=fs.readFileSync(file,'utf8');for(const m of src.matchAll(/(['"])((?:\\.|(?!\1)[^\\\r\n])*?)\1/g)){try{const t=vm.runInNewContext(m[0]);if(typeof t==='string'&&t.length<120&&!/[A-Za-z]/.test(t))add(t,'guide')}catch{}}}
const mini=fs.readFileSync('mini-games.html','utf8');for(const [id,prefix,suffix] of [['ICONS','그림 속에서 ',' 찾기!'],['ANIMALS','',' 친구와 똑같은 그림자를 찾아 연결해 봐요.']]){const list=vm.runInNewContext(mini.match(new RegExp('const '+id+'=(\\[.*?\\]);'))[1]);for(const icon of list)add(prefix+c.window.JoyiAudioNames[icon]+suffix,'guide')}
for(const name of ['사과','딸기','빨간 풍선','해바라기','별','바나나','파란 보석','파란 나비','파란 공'])add(name+'과 같은 색깔의 바구니에 담아 볼까?','guide');
for(const t of ['과 같은 색깔의 바구니에 담아 볼까?','와아! 잘 찾았어!','정말 멋져!','이현이 최고!','잘했어! 다음 문제!','멋지게 성공! 알를 따라 써 볼까?','토끼에게 당근을 주세요','강아지에게 뼈다귀를 주세요','고양이에게 생선을 주세요','곰에게 꿀을 주세요','원숭이에게 바나나를 주세요','코끼리에게 수박을 주세요'])add(t,'guide');
for(const t of ['이 그림의 이름은 무엇일까요?','그림을 보고 낱말을 만들어 볼까요?','좋아하는 색으로 글자를 써 볼까요?'])add(t,'guide');
const praise=vm.runInNewContext(legacy.match(/const PRAISE_VARIANTS=(\[[\s\S]*?\n\]);/)[1]);for(const f of praise){const t=f('친구');add(t,'praise');const parts=t.match(/^([^!！]+[!！])\s*(.*)$/);if(parts&&parts[2]){add(parts[1],'praise');add(parts[2],'praise')}}
for(const w of words)add(w.w+' 글자를 손가락으로 따라 써 봐요!','guide');
const sets=new Function(legacy.slice(legacy.indexOf('const CONSONANTS='),legacy.indexOf('const COLOR_WORDS='))+';return {CONSONANTS,VOWELS,SYLLABLES}')();for(const list of Object.values(sets))for(const row of list){add(row[1],'learning');add(row[2],'learning')}for(const row of sets.SYLLABLES){add(row[0],'learning');add('들리는 글자를 찾아 볼까요? '+row[0],'learning')}
const animals=new Function(legacy.match(/const ANIMALS=(\[[^;]+\]);/)[0]+';return ANIMALS')();for(const a of animals){add(a.name,'learning');add('동물 친구를 찾아 봐요. '+a.name,'learning')}
fs.writeFileSync('docs/v13/audio/corpus.json',JSON.stringify([...rows.values()],null,2));console.log(rows.size,'phrases', [...rows.values()].reduce((a,x)=>a+x.text.length,0),'characters');
