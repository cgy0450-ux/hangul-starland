/* Scene artwork in game introductions, pause and results; state/collision logic remains in each game. */
(()=>{'use strict';const file=location.pathname.split('/').pop(),scene={'firetruck-rescue.html':'firetruck','car-collect.html':'collect','car-dodge.html':'dodge'}[file];if(!scene)return;
const modal=document.querySelector('.overlay .modal');if(!modal)return;
function render(){let art=modal.querySelector('.v13-modal-art');const hero=modal.querySelector('#hero');if(hero){if(hero.querySelector('img'))return;hero.replaceChildren();art=new Image();art.className='v13-modal-art';art.src='./assets/v13/game.'+scene+'.webp';art.alt='';hero.append(art)}else if(!art){art=new Image();art.className='v13-modal-art';art.src='./assets/v13/game.'+scene+'.webp';art.alt='';modal.prepend(art)}}
new MutationObserver(render).observe(modal,{childList:true,subtree:true});render();
})();
