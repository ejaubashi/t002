/**
 * Original Figma PERCEPTION timelines translated to native Web Animations.
 * Only transient compositor transforms run; observers and animations are disposed.
 */
export function artTransitionMarkup(index) {
  if (index === 1) return '';
  const count = index === 0 ? 12 : index === 2 ? 3 : 6;
  return '<div class="art-entry art-entry-'+index+'" aria-hidden="true">'+Array.from({length:count},(_,i)=>
    '<i style="--piece:'+i+';--pieces:'+count+'">'+(index===3?'<span>GOOD NOISE</span>':'')+'</i>'
  ).join('')+'</div>';
}

export function mountArtTransition(root,index,{gallery=false}={}) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const container=root.querySelector('.art-entry');
  const aperture=index===1?root.querySelector('.form-aperture'):null;
  let animations=[],observer=null,disposed=false,visible=false,played=false,run=0;
  const blocked=()=>reduced.matches||document.body.classList.contains('motion-paused')||document.hidden;
  function cancel(){run++;animations.forEach(a=>a.cancel());animations=[];root.classList.remove('art-entering');}
  function play(){
    cancel();if(disposed||blocked())return;
    played=true;const token=run;root.classList.add('art-entering');
    if(container){
      container.querySelectorAll(':scope>i').forEach((piece,i)=>{
        const sign=i%2===0?1:-1;
        const from=index===0?'translateY(0)':index===2?'translateY(0)':'translateX(0)';
        const to=index===0?'translateY(-102%)':index===2?'translateY(310%)':'translateX('+sign*102+'%)';
        animations.push(piece.animate([{transform:from},{transform:to}],{
          duration:index===0?1050:index===2?1300:1150,
          delay:index===0?i*28:index===2?80+i*120:60+i*35,
          easing:'cubic-bezier(.42,0,.58,1)',fill:'both'
        }));
      });
    }
    if(aperture)animations.push(aperture.animate([{transform:'scaleX(.015)'},{transform:'scaleX(1)'}],{duration:1500,delay:300,easing:'cubic-bezier(.42,0,.58,1)',fill:'backwards'}));
    Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(!disposed&&run===token)root.classList.remove('art-entering');});
  }
  function preference(){if(blocked())cancel();else if(!played&&(!gallery||visible))play();}
  if(gallery){
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        visible=entry.isIntersecting&&entry.intersectionRatio>=.55;
        if(visible&&!played)play();
        if(!entry.isIntersecting){cancel();played=false;}
      }
    },{threshold:[0,.55]});observer.observe(root);
  }else play();
  reduced.addEventListener('change',preference);
  document.addEventListener('portfolio-motion',preference);
  document.addEventListener('visibilitychange',preference);
  return ()=>{disposed=true;cancel();observer?.disconnect();reduced.removeEventListener('change',preference);document.removeEventListener('portfolio-motion',preference);document.removeEventListener('visibilitychange',preference);};
}
