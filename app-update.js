(()=>{
const button=document.getElementById('refresh');if(!button)return;
const status=document.createElement('p');status.setAttribute('role','status');status.style.cssText='text-align:center;color:#604497;font-weight:bold';button.closest('header').after(status);
const overlay=document.createElement('div');overlay.hidden=true;overlay.setAttribute('role','status');overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#fff9f0f5;place-content:center;text-align:center;font-size:24px;font-weight:bold;color:#604497';document.body.append(overlay);
let available=false,target=null;
const version=()=>new Promise(resolve=>{const ch=new MessageChannel();setTimeout(()=>resolve(null),1500);ch.port1.onmessage=e=>resolve(e.data);navigator.serviceWorker.controller.postMessage("JOY_VERSION",[ch.port2])});
const busy=text=>{overlay.textContent=text;overlay.hidden=false;overlay.style.display='grid';button.disabled=true};
const done=()=>{overlay.hidden=true;overlay.style.display='none';button.disabled=false};
button.textContent='업데이트 확인';
button.onclick=async()=>{
 busy(available?'새 버전을 적용하고 있어요…':'최신 버전을 확인하고 있어요…');
 try{
  if(!navigator.onLine)throw Error('offline');
  const r=await navigator.serviceWorker.getRegistration();if(!r||!navigator.serviceWorker.controller)throw Error('uncontrolled');
  if(available){
   if(await version()===target){sessionStorage.setItem("joyi-update-applied","1");location.reload();return;}
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('timeout')),120000);navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve()},{once:true});r.update().catch(reject)});
   sessionStorage.setItem('joyi-update-applied','1');location.reload();return;
  }
  const response=await fetch('./sw.js?check='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('network');const remote=(await response.text()).match(/const CACHE = '([^']+)'/)?.[1];if(!remote)throw Error('version');
  const current=await new Promise(resolve=>{const ch=new MessageChannel();const timer=setTimeout(()=>resolve(null),1500);ch.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data)};navigator.serviceWorker.controller.postMessage('JOY_VERSION',[ch.port2])});
  target=remote;available=current!==remote||remote!=="hangul-starland-v14-6-1-quiz-context-20261117";status.textContent=available?'새 업데이트가 있어요. 업데이트하기를 눌러 주세요.':'최신 버전입니다.';button.textContent=available?'업데이트하기':'업데이트 확인';
 }catch(e){status.textContent=navigator.onLine?'업데이트를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.':'인터넷 연결 후 업데이트를 확인해 주세요.'}
 finally{done()}
};
if(sessionStorage.getItem('joyi-update-applied')){sessionStorage.removeItem('joyi-update-applied');status.textContent='업데이트가 완료되었습니다.'}
})();
