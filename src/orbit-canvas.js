import {tensionPoint} from './living-artworks.js';

/** A matching line artwork remains interactive when WebGL is unavailable. */
export function createOrbitCanvas(canvas,getState){
 const ctx=canvas.getContext('2d');if(!ctx)return {draw(){},dispose(){}};
 let width=1,height=1,lastTime=0;
 const weights=[0,1,0];
 function draw(t,delta=0){
  lastTime=t;const {mode,x,y,remix,tempo,paused}=getState();
  const selected=['wave','orbit','interference'].indexOf(mode);
  weights.forEach((w,i)=>weights[i]=paused?Number(i===selected):w+(Number(i===selected)-w)*(1-Math.exp(-delta*8)));
  ctx.clearRect(0,0,width,height);ctx.strokeStyle='#caf6a6';ctx.lineWidth=.8;
  const mobile=width<700,rows=mobile?32:56,steps=mobile?54:82;
  const scale=Math.min(width*(mobile ? .28 : .22),height*.34),cx=width*(mobile ? .55 : .69),cy=height*(mobile ? .52 : .45);
  const angle=-.35+remix*.22,c=Math.cos(angle),s=Math.sin(angle);
  for(let modeIndex=0;modeIndex<3;modeIndex++)if(weights[modeIndex]>.005){
   ctx.globalAlpha=.83*weights[modeIndex];
   for(let row=0;row<rows;row++){
    ctx.beginPath();
    for(let i=0;i<=steps;i++){
     const p=tensionPoint(-1+i/steps*2,-1+row/(rows-1)*2,modeIndex,t*tempo+remix,x,y);
     const xx=p[0]*c-p[2]*s,zz=p[0]*s+p[2]*c;
     const dx=cx+(xx*.94+p[1]*.22)*scale,dy=cy+(-p[1]*.94+xx*.22+zz*.38)*scale;
     i?ctx.lineTo(dx,dy):ctx.moveTo(dx,dy);
    }ctx.stroke();
   }
  }ctx.globalAlpha=1;
 }
 const resize=new ResizeObserver(()=>{const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio||1,innerWidth<700?1:1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw(lastTime);});
 resize.observe(canvas);
 return {draw,dispose(){resize.disconnect();}};
}
