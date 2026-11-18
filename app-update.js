(()=>{'use strict';
const button=document.getElementById('refresh');if(!button)return;
const BUILD='hangul-starland-v14-10-rescue-daily-character-20261118';
const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='text-align:center;color:#604497;font-weight:bold';button.closest('header').after(status);
const overlay=document.createElement('div');overlay.hidden=true;overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#fff9f0f5;place-content:center;text-align:center;padding:24px;font-size:22px;font-weight:bold;color:#604497';
const message=document.createElement('p');message.setAttribute('role','status');const cancel=document.createElement('button');cancel.textContent='닫고 기다리기';cancel.style.cssText='padding:14px 22px;border-radius:18px;background:white;color:#604497;font:inherit';overlay.append(message,cancel);document.body.append(overlay);
let available=false,target=null,busy=false,attempt=0;
function done(){busy=false;overlay.hidden=true;overlay.style.display='none';button.disabled=false}
cancel.onclick=()=>{attempt++;done();status.textContent='확인을 닫았어요. 잠시 후 다시 확인해 주세요.'};
const deadline=(promise,ms=12000)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms)})]).finally(()=>clearTimeout(timer))};
function version(worker=navigator.serviceWorker?.controller){return new Promise(resolve=>{if(!worker){resolve(null);return}const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(null)},1200);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data)};try{worker.postMessage('JOY_VERSION',[channel.port2])}catch(e){clearTimeout(timer);resolve(null)}})}
async function remoteVersion(){const r=await deadline(fetch('./sw.js?check='+Date.now(),{cache:'no-store'}));if(!r.ok)throw Error('network');const v=(await deadline(r.text())).match(/const CACHE = '([^']+)'/)?.[1];if(!v)throw Error('version');return v}
function reload(){try{sessionStorage.setItem('joyi-update-applied',target||BUILD)}catch(e){}location.reload()}
navigator.serviceWorker?.addEventListener('message',e=>{if(busy&&e.data?.type==='JOY_UPDATE_PROGRESS')message.textContent='새 버전을 준비하고 있어요… '+e.data.done+' / '+e.data.total});
button.textContent='업데이트 확인';button.onclick=async()=>{
if(busy)return;const run=++attempt,applying=available;busy=true;button.disabled=true;overlay.hidden=false;overlay.style.display='grid';message.textContent=applying?'새 버전을 적용하고 있어요…':'최신 버전을 확인하고 있어요…';
try{
 if(!navigator.onLine)throw Error('offline');if(!('serviceWorker'in navigator))throw Error('unsupported');
 const registration=await deadline(navigator.serviceWorker.getRegistration());if(!registration)throw Error('uncontrolled');
 const remote=await remoteVersion();if(run!==attempt)return;target=remote;
 if(applying){
  // The new worker may already control this tab. No second controllerchange is expected.
  if(await version()===target){if(run===attempt)reload();return}
  await deadline(registration.update());
  const began=Date.now();while(Date.now()-began<15000&&run===attempt){
   if(await version()===target){reload();return}
   registration.waiting?.postMessage('JOY_ACTIVATE');
   await new Promise(resolve=>setTimeout(resolve,250));
  }
  if(run!==attempt)return;
  status.textContent='새 버전을 아직 준비하고 있어요. 잠시 후 업데이트하기를 다시 눌러 주세요.';
 }else{
  const current=await version();if(run!==attempt)return;
  if(!current)throw Error('version');available=current!==target||BUILD!==target;
  status.textContent=available?'새 업데이트가 있어요. 업데이트하기를 눌러 주세요.':'최신 버전입니다.';
  if(available)registration.update().catch(()=>{});
 }
 button.textContent=available?'업데이트하기':'업데이트 확인';
}catch(e){if(run===attempt)status.textContent=!navigator.onLine?'인터넷 연결 후 업데이트를 확인해 주세요.':e.message==='timeout'?'확인이 오래 걸리고 있어요. 연결을 확인하고 다시 시도해 주세요.':'업데이트를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'}
finally{if(run===attempt)done()}
};
try{const applied=sessionStorage.getItem('joyi-update-applied');if(applied){sessionStorage.removeItem('joyi-update-applied');version().then(v=>{const expected=applied==='1'?BUILD:applied;status.textContent=v===expected&&BUILD===expected?'업데이트가 완료되었습니다.':'새 버전 적용을 다시 확인해 주세요.'})}}catch(e){}
})();
