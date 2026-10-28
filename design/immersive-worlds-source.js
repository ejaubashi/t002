const ids=[];const track=n=>{ids.push(n.id);return n};
await Promise.all([{family:'Anton',style:'Regular'},{family:'DM Sans',style:'Regular'},{family:'DM Sans',style:'Bold'},{family:'Cormorant Garamond',style:'Regular'},{family:'Cormorant Garamond',style:'Italic'}].map(f=>figma.loadFontAsync(f)));
const variables=await figma.variables.getLocalVariablesAsync();const vars=Object.fromEntries(variables.map(v=>[v.name,v]));
const palette={paper:'#f4f0df',ink:'#29251f',blue:'#101759',lime:'#caf6a6',pink:'#e9a6c2',mulberry:'#57213e',forest:'#263e3a',sand:'#ba9670'};
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const paint=name=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(palette[name])},'color',vars[name]);
function text(parent,words,x,y,size,font='DM Sans',ink='paper',style='Regular'){
 const n=track(figma.createText());n.fontName={family:font,style};n.fontSize=size;n.characters=words;n.lineHeight={unit:'PERCENT',value:font==='Anton'?94:font==='Cormorant Garamond'?85:120};n.fills=[paint(ink)];parent.appendChild(n);n.x=x;n.y=y;return n;
}
function svg(parent,source,name,x=0,y=0){const n=figma.createNodeFromSvg(source);parent.appendChild(n);n.name=name;n.x=x;n.y=y;ids.push(n.id,...n.findAll(()=>true).map(c=>c.id));return n;}
function rect(parent,name,x,y,w,h,fill){const n=track(figma.createRectangle());n.name=name;n.resize(w,h);parent.appendChild(n);n.x=x;n.y=y;n.fills=[paint(fill)];return n;}
const navs=[];const navProperties=[];
for(const [i,tone] of ['Orbit','Form','Offgrid','Noise'].entries()){
 const c=track(figma.createComponent());c.name='Tone='+tone;c.resize(1312,34);c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.primaryAxisAlignItems='SPACE_BETWEEN';c.counterAxisAlignItems='CENTER';c.fills=[];
 const color=['lime','ink','paper','mulberry'][i];
 const brand=text(c,'PROJECT / VISUAL EXPERIENCE',0,0,13,'DM Sans',color);const index=text(c,'SELECTED WORK / 01',0,0,11,'DM Sans',color);
 const brandKey=c.addComponentProperty('Brand','TEXT','PROJECT / VISUAL EXPERIENCE');brand.componentPropertyReferences={characters:brandKey};
 const indexKey=c.addComponentProperty('Index','TEXT','SELECTED WORK / 01');index.componentPropertyReferences={characters:indexKey};
 navProperties.push({brandKey,indexKey});navs.push(c);
}
const navSet=track(figma.combineAsVariants(navs,figma.currentPage));navSet.name='World navigation';navSet.x=3600;navSet.y=2360;navSet.layoutMode='VERTICAL';navSet.paddingLeft=24;navSet.paddingRight=24;navSet.paddingTop=24;navSet.paddingBottom=24;navSet.itemSpacing=24;navSet.fills=[];navSet.description='Project-only header, with four palette variants and editable brand/index properties.';
const frames=[];const motionTargets=[];
const names=['Orbit — Sound in motion','Form & Field — Objects with soul','Offgrid — A different pace','Good Noise — Feel the frequency'];
for(let i=0;i<4;i++){
 const f=track(figma.createFrame());f.name='IMMERSIVE / '+names[i];f.resize(1440,900);f.x=3600+(i%2)*1540;f.y=200+Math.floor(i/2)*1000;f.clipsContent=true;f.fills=[paint(['blue','paper','forest','pink'][i])];frames.push(f);
}
// Orbit: a monumental type composition around a suspended orbital sculpture.
const orbit=frames[0];
const shader=await figma.importShaderById('fd61f95f-20e4-414c-a704-8b72bacdebbf/721e3db1cd27c3bf4179705f33ac64320cf5f925');
const field=track(figma.createRectangle());field.name='Living signal / native animated shader';field.resize(1440,900);orbit.appendChild(field);field.fills=[{type:'SHADER',id:shader.id}];
let ringPaths='';for(let i=0;i<3;i++)ringPaths+=`<ellipse cx="470" cy="340" rx="${300+i*22}" ry="${94+i*48}" transform="rotate(${-40+i*43} 470 340)" stroke="url(#ring)" stroke-width="${7-i}"/>`;
const rings=svg(orbit,`<svg width="940" height="680" viewBox="0 0 940 680" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ring" x1="0" x2="1"><stop stop-color="#78976b"/><stop offset=".42" stop-color="#e0ffbc"/><stop offset="1" stop-color="#caf6a6"/></linearGradient></defs><g fill="none">${ringPaths}</g><g fill="#caf6a6">${Array.from({length:80},(_,i)=>`<circle cx="${(i*137)%940}" cy="${(i*73)%680}" r="${i%7===0?2:1}" opacity=".4"/>`).join('')}</g></svg>`,'Orbit sculpture / dynamic production scene',470,98);
motionTargets.push(rings);
const orbitalTitle=text(orbit,'SOUND\nIN MOTION.',64,205,132,'Anton','lime');orbitalTitle.name='Orbit / kinetic title';
text(orbit,'AN EXPERIMENT IN SOUND,\nSPACE AND HUMAN INPUT.',68,532,13,'DM Sans','lime');
text(orbit,'MOVE TO BEND THE FIELD\nSCROLL TO UNFOLD THE FORM',68,717,11,'DM Sans','lime');
// Form & Field: quiet tension between huge editorial type and grounded materials.
const form=frames[1];
svg(form,`<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bg" cx=".6" cy=".3" r=".8"><stop stop-color="#fffaf0"/><stop offset="1" stop-color="#d4c7ad"/></radialGradient><linearGradient id="glaze"><stop stop-color="#846b4b"/><stop offset=".34" stop-color="#d8b98d"/><stop offset=".64" stop-color="#bd9868"/><stop offset="1" stop-color="#81674b"/></linearGradient><radialGradient id="shadow"><stop stop-color="#4e3c2a" stop-opacity=".3"/><stop offset="1" stop-color="#4e3c2a" stop-opacity="0"/></radialGradient></defs><path fill="url(#bg)" d="M0 0h1440v900H0z"/><ellipse cx="1050" cy="723" rx="310" ry="55" fill="url(#shadow)"/><g fill="url(#glaze)"><path d="M870 230C870 315 745 365 745 540C745 660 790 706 915 706S1080 660 1080 540C1080 365 960 315 960 230Z"/><path d="M1140 402C1140 460 1060 490 1060 610C1060 690 1090 722 1170 722S1280 690 1280 610C1280 490 1200 460 1200 402Z"/></g><ellipse cx="915" cy="230" rx="45" ry="11" fill="#5c4932"/><ellipse cx="915" cy="227" rx="45" ry="9" fill="none" stroke="#d9bc93" stroke-width="8"/><ellipse cx="1170" cy="402" rx="30" ry="7" fill="#5c4932"/></svg>`,'Ceramic studio / dynamic production scene');
text(form,'Objects\nwith soul.',64,238,148,'Cormorant Garamond','ink');text(form,'THOUGHTFUL OBJECTS.\nA SLOWER WAY TO LIVE.',68,553,13,'DM Sans','ink');
text(form,'DRAG TO TURN\nFOUR FINISHES. ONE EVERYDAY RITUAL.',68,717,11,'DM Sans','ink');
// Offgrid: full-bleed atmospheric terrain with contour lines and huge grounded type.
const offgrid=frames[2];
svg(offgrid,`<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#899cad"/><stop offset="1" stop-color="#eac7a1"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h1440v900H0z"/><circle cx="1045" cy="230" r="120" fill="#f8e6b5"/><path d="M0 490Q160 350 320 485L565 285 780 490 1050 360 1440 530V900H0Z" fill="#748789"/><path d="M0 560Q180 470 390 600L690 435 1060 610 1440 490V900H0Z" fill="#3e605c"/><path d="M0 760Q280 530 660 700T1440 640V900H0Z" fill="#203d35"/><g fill="none" stroke="#c2d1b5" opacity=".14" stroke-width="1">${Array.from({length:13},(_,i)=>`<path d="M-80 ${670+i*18}Q280 ${460+i*25} 660 ${620+i*16}T1520 ${580+i*24}"/>`).join('')}</g></svg>`,'Landscape / dynamic time and depth layers');
text(offgrid,'LESS SIGNAL.\nMORE FEELING.',66,153,26,'DM Sans','paper');text(offgrid,'offgrid.',64,507,266,'DM Sans','paper','Bold');text(offgrid,'46°35′ N / 12°18′ E',68,786,11,'DM Sans','paper');
// Good Noise: a full-cover composition with a physically oversized record.
const noise=frames[3];
let grooves='';for(let r=100;r<390;r+=6)grooves+=`<circle cx="400" cy="400" r="${r}" stroke="#624056" stroke-width="1"/>`;
const vinyl=svg(noise,`<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><circle cx="400" cy="400" r="392" fill="#291b2c"/>${grooves}<circle cx="400" cy="400" r="118" fill="#ecb987"/><circle cx="400" cy="400" r="5" fill="#291b2c"/></svg>`,'Vinyl / interactive rotation and sleeve',700,65);motionTargets.push(vinyl);
text(noise,'FEEL\nTHE\nFREQUENCY.',64,170,139,'Anton','mulberry');text(noise,'INDEPENDENT CULTURE.\nUNFILTERED IDEAS. GOOD NOISE.',68,626,13,'DM Sans','mulberry');text(noise,'01 — AFTER HOURS\nDRAG THE RECORD. TURN IT OVER.',68,753,11,'DM Sans','mulberry');
for(let i=0;i<4;i++){
 const instance=track(navs[i].createInstance());frames[i].appendChild(instance);instance.x=64;instance.y=38;
 const properties=Object.keys(instance.componentProperties);const brandKey=properties.find(k=>k.startsWith('Brand'));const indexKey=properties.find(k=>k.startsWith('Index'));
 instance.setProperties({[brandKey]:['ORBIT® / AUDIOVISUAL EXPERIMENT','FORM & FIELD / EVERYDAY OBJECTS','OFFGRID / OUTDOOR JOURNEYS','GOOD NOISE / INDEPENDENT CULTURE'][i],[indexKey]:`SELECTED WORK / 0${i+1}`});
 const color=['lime','ink','paper','mulberry'][i];const footer=track(figma.createAutoLayout('HORIZONTAL'));frames[i].appendChild(footer);footer.name='Project entry';footer.resize(1312,48);footer.primaryAxisSizingMode='FIXED';footer.counterAxisSizingMode='FIXED';footer.primaryAxisAlignItems='SPACE_BETWEEN';footer.counterAxisAlignItems='CENTER';footer.fills=[];footer.x=64;footer.y=820;
 text(footer,'SCROLL TO EXPLORE',0,0,11,'DM Sans',color);text(footer,'ENTER THE EXPERIENCE  ↗',0,0,13,'DM Sans',color);
}
return {createdNodeIds:ids,frameIds:frames.map(f=>f.id),motionTargetIds:motionTargets.map(n=>n.id),titleId:orbitalTitle.id,navSetId:navSet.id,frameBounds:frames.map(f=>({id:f.id,name:f.name,width:f.width,height:f.height})),fonts:['Anton','DM Sans','Cormorant Garamond']};
