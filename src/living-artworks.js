/** Original procedural artworks. Shared by gallery fallbacks and interactive project views. */
export const artTitles=['TENSION','INTERVAL','DRIFT','RESONANCE'];

export function tensionPoint(u,v,mode=1,time=0,px=0,py=0){
 const t=time*.36,angle=u*1.8+.22*Math.sin(t);
 const wave=[u*1.65,v*1.25+Math.sin(u*2.4+t)*.22*(1-v*v),Math.sin(u*3+t)*.5+v*.15];
 const fold=[u*1.65,v*1.45*Math.cos(angle),v*1.45*Math.sin(angle)];
 const crossed=[u*1.65,v*1.1+.4*Math.sin(u*3.4+v*1.2+t),.8*Math.sin(u*2.2-t)*Math.sin(v*1.8)+.3*v];
 const p=[wave,fold,crossed][mode]||fold;
 const dx=p[0]-px*3,dy=p[1]-py*3,lens=Math.exp(-(dx*dx+dy*dy)*1.5)*.12;
 return [p[0]+dx*lens,p[1]+dy*lens,p[2]];
}
function project(p,angle=-.35){
 const [x,y,z]=p,c=Math.cos(angle),s=Math.sin(angle),xx=x*c-z*s,zz=x*s+z*c;
 return [xx*.94+y*.22,-y*.94+xx*.22+zz*.38];
}
export function tensionSVG(mode=1){
 let paths='';
 for(let row=0;row<48;row++){
  const v=-1+row/47*2;
  const d=Array.from({length:49},(_,i)=>{const p=project(tensionPoint(-1+i/24,v,mode));return (i?'L':'M')+(420+p[0]*180).toFixed(1)+' '+(310+p[1]*180).toFixed(1);}).join('');
  paths+='<path d="'+d+'"/>';
 }
 return '<svg width="840" height="620" viewBox="0 0 840 620" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#caf6a6" stroke-width="1" opacity=".82">'+paths+'</g></svg>';
}
export function reliefSVG(prefix='relief'){
 const source='<svg width="640" height="760" viewBox="0 0 640 760" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="paper-face"><stop stop-color="var(--paper-dark,#a08c70)"/><stop offset=".4" stop-color="var(--paper-light,#eee5d2)"/><stop offset=".7" stop-color="var(--paper-mid,#c9b99b)"/><stop offset="1" stop-color="var(--paper-dark,#a08c70)"/></linearGradient><linearGradient id="paper-fold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--paper-light,#eee5d2)"/><stop offset="1" stop-color="var(--paper-dark,#a08c70)"/></linearGradient><radialGradient id="paper-shadow"><stop stop-color="#493d29" stop-opacity=".23"/><stop offset="1" stop-color="#493d29" stop-opacity="0"/></radialGradient></defs><ellipse cx="322" cy="669" rx="195" ry="33" fill="url(#paper-shadow)"/><path d="M199 144C420 83 514 188 423 288L253 472C175 560 250 626 445 603L445 649C202 695 97 568 218 435L386 250C448 179 366 149 199 189Z" fill="url(#paper-face)"/><path d="M199 144L199 189C366 149 448 179 386 250L423 288C514 188 420 83 199 144Z" fill="url(#paper-fold)"/><path d="M253 472C175 560 250 626 445 603L445 649C202 695 97 568 218 435Z" fill="url(#paper-fold)"/><path d="M200 143C421 82 514 188 423 288L253 472C175 560 250 626 445 603" fill="none" stroke="#fff8e8" stroke-opacity=".65" stroke-width="1.5"/></svg>';
 return source.replaceAll('paper-face',prefix+'-face').replaceAll('paper-fold',prefix+'-fold').replaceAll('paper-shadow',prefix+'-shadow');
}
export function driftSVG(){
 let paths='';
 for(let i=0;i<40;i++){
  const v=(i-19.5)/19.5;
  const y=250+v*126;
  paths+='<path d="M90 '+y.toFixed(1)+' C250 '+(y-90-v*35).toFixed(1)+' 350 '+(y+175-v*v*55).toFixed(1)+' 505 '+(y+v*30).toFixed(1)+' S740 '+(y-135+v*25).toFixed(1)+' 918 '+(y+v*12).toFixed(1)+'"/>';
 }
 return '<svg width="1020" height="560" viewBox="0 0 1020 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none"><g class="drift-lines" stroke="currentColor" stroke-width="1.3">'+paths+'</g><path class="drift-thread" d="M75 270C300 94 315 464 507 263S760 101 938 245" stroke="currentColor" stroke-width="2.5"/></svg>';
}
export function scoreSVG(track){
 let shapes='';
 if(track===0){
  for(let i=0;i<36;i++){
   const inset=i*3.15;
   shapes+='<path d="M'+(112+inset).toFixed(1)+' '+(590-inset*.26).toFixed(1)+' C'+(-70+inset*2).toFixed(1)+' '+(310-inset*.48).toFixed(1)+' '+(560-inset*2).toFixed(1)+' '+(45+inset*.22).toFixed(1)+' '+(576-inset).toFixed(1)+' '+(224+inset*.45).toFixed(1)+' C'+(620-inset).toFixed(1)+' '+(393-inset*.1).toFixed(1)+' '+(190+inset*.5).toFixed(1)+' '+(155+inset*.62).toFixed(1)+' '+(158+inset).toFixed(1)+' '+(443-inset*.25).toFixed(1)+'"/>';
  }
 }else if(track===1){
  for(let i=0;i<20;i++)shapes+='<ellipse cx="350" cy="350" rx="84" ry="240" transform="rotate('+i*9+' 350 350)"/>';
 }else{
  for(let i=0;i<24;i++){const o=i*5;shapes+='<path d="M'+(108+o)+' 554 '+(350-o*.3)+' '+(82+o*.45)+' '+(410-o*.48)+' '+(500-o*.4)+' '+(604-o)+' '+(184+o*.5)+'"/>';}
 }
 return '<svg width="700" height="700" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="'+(track===0?2.2:track===1?1.8:2.5)+'"><g class="cover-'+['ribbon','rosette','signal'][track]+'">'+shapes+'</g></svg>';
}
