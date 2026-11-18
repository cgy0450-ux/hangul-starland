(()=>{'use strict';
const day=(time=Date.now())=>Math.floor((time+9*3600000)/86400000);
const pick=(items,count=3,time=Date.now())=>{if(!items.length)return[];const start=((day(time)*count)%items.length+items.length)%items.length;return Array.from({length:Math.min(count,items.length)},(_,i)=>items[(start+i)%items.length])};
// Stable public indices: Spider-Man, Poli, Mario, Pororo, Tayo, and the new rescue narration.
const characterStoryIds=Object.freeze([26,25,24,23,22,21]);
const epoch=day(Date.UTC(2026,10,17,15)); // New rescue story leads on its KST release day, then every character book rotates fairly.
function stories(indices,time=Date.now()){
 const unique=[...new Set(indices)],characters=characterStoryIds.filter(i=>unique.includes(i));if(!characters.length)return pick(unique,3,time);
 const offset=((day(time)-epoch)%characters.length+characters.length)%characters.length;
 const selected=[characters[offset],...pick(unique.filter(i=>!characterStoryIds.includes(i)),2,time)];
 if(selected.length<Math.min(3,unique.length))selected.push(...pick(unique.filter(i=>!selected.includes(i)),Math.min(3,unique.length)-selected.length,time));
 return selected;
}
window.JoyiDaily={storyTotal:27,characterStoryIds,day,pick,stories};
})();
