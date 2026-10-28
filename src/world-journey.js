/** Native scroll drives the composition. No wheel interception and no idle animation loop. */
export function mountWorldJourney(hero, onProgress) {
  const dialog=hero.closest('dialog');const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=null,disposed=false;
  function update(){
    frame=null;if(disposed)return;
    const distance=hero.offsetHeight-dialog.clientHeight;
    const value=motion.matches||distance<=0?0:Math.max(0,Math.min(1,(dialog.scrollTop-hero.offsetTop)/distance));
    hero.style.setProperty('--journey',String(value));
    hero.style.setProperty('--journey-y',`${value*-65}px`);
    hero.style.setProperty('--journey-turn',`${value*18}deg`);
    onProgress(value);
  }
  function schedule(){if(frame===null)frame=requestAnimationFrame(update);}
  dialog.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);motion.addEventListener('change',schedule);update();
  return ()=>{disposed=true;if(frame!==null)cancelAnimationFrame(frame);dialog.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);motion.removeEventListener('change',schedule);};
}
