/** Each full-screen gallery scene owns its GPU only while it is actually visible. */
export function mountWorldGallery() {
  const panels=[...document.querySelectorAll('.world-gallery')];
  const dialog=document.querySelector('#project-dialog');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const visible=new Set(), scenes=new Map(), pending=new Map();
  let generation=0;
  const canRender=()=>!dialog.open&&!document.hidden;
  function release(panel){pending.delete(panel);scenes.get(panel)?.dispose();scenes.delete(panel);}
  function sync(){
    const current=canRender()?[...visible][0]:null;
    if(current)document.body.dataset.galleryWorld=current.dataset.world;else delete document.body.dataset.galleryWorld;
    for(const panel of panels){
      if(!visible.has(panel)||!canRender()){release(panel);continue;}
      const index=Number(panel.dataset.world);
      if(index>1||scenes.has(panel)||pending.has(panel)||navigator.connection?.saveData)continue;
      const token=++generation;pending.set(panel,token);
      import('./sculpture.js').then(module=>{
        if(pending.get(panel)!==token||!visible.has(panel)||!canRender())return;
        pending.delete(panel);
        const scene=module.mountProjectSculpture(panel.querySelector('.project-preview'),index,{presentation:'world',owner:'gallery',onFallback:()=>{scenes.delete(panel);}});
        if(scene){scenes.set(panel,scene);scene.setPaused(motion.matches||document.body.classList.contains('motion-paused'));}
      }).catch(()=>pending.delete(panel));
    }
  }
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target);}sync();},{threshold:[0,.25]});
  panels.forEach(panel=>{
    observer.observe(panel);
    panel.addEventListener('pointermove',event=>{
      if(motion.matches||event.pointerType==='touch')return;
      const r=panel.getBoundingClientRect();scenes.get(panel)?.setPointer((event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5);
    },{passive:true});
    panel.addEventListener('pointerleave',()=>scenes.get(panel)?.setPointer(0,0));
  });
  new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',sync);
  const preference=()=>{for(const scene of scenes.values())scene.setPaused(motion.matches||document.body.classList.contains('motion-paused'));};
  motion.addEventListener('change',preference);document.addEventListener('portfolio-motion',preference);
}
