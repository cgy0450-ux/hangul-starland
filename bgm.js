/* 쪼이랜드의 오리지널 배경음악: 음원 파일·외부 스트리밍 없이 브라우저 내에서 직접 합성합니다. */
(function(){
let ctx=null,gain=null,playing=false,muted=false,nextTimer=null,index=0;
const tune=[392,440,523.25,587.33,659.25,523.25,440,392,349.23,392,440,523.25,587.33,440,392,349.23];
const noteLength=.31,volume=.035;
function ensure(){if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();gain=ctx.createGain();gain.gain.value=volume;gain.connect(ctx.destination);return true;}
function beep(freq,when){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(.21,when+.025);g.gain.exponentialRampToValueAtTime(.0001,when+noteLength*.82);o.connect(g).connect(gain);o.start(when);o.stop(when+noteLength);}
function schedule(){if(!playing||!ctx||muted||document.hidden)return;const t=ctx.currentTime+.06;for(let i=0;i<8;i++)beep(tune[(index+i)%tune.length],t+i*noteLength);index=(index+8)%tune.length;nextTimer=setTimeout(schedule,8*noteLength*1000-90);}
function stop(){playing=false;clearTimeout(nextTimer);if(ctx)ctx.suspend().catch(()=>{});}
function start(){if(muted||playing||document.hidden||!ensure())return;ctx.resume().then(()=>{if(playing)return;playing=true;schedule();}).catch(()=>{});}
function setMuted(value){muted=!!value;localStorage.setItem('joiland-bgm-muted',muted?'1':'0');if(muted)stop();else start();}
muted=localStorage.getItem('joiland-bgm-muted')==='1';
window.JoyBgm={start,stop,setMuted,get muted(){return muted;},duck(v){if(gain&&ctx)gain.gain.setTargetAtTime(v?.007:volume,ctx.currentTime,.08);}};
document.addEventListener('pointerdown',()=>start(),{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(!muted)start();});
})();