import * as THREE from 'three';

/** TENSION: one ruled line field, without solid objects or decorative particle clouds. */
export function createSignalField(parent,resources){
 const uniforms={
  uTime:{value:0},uPointer:{value:new THREE.Vector2(.5,.5)},
  uModes:{value:new THREE.Vector3(0,1,0)},uPulse:{value:0},
  uAspect:{value:1.5},uPixelRatio:{value:1},
 };
 const rows=innerWidth<700?40:72,steps=innerWidth<700?64:112,coords=[],wefts=[];
 function edge(u,v,a,b,w){coords.push(u,v,a,b);wefts.push(w,w);}
 for(let row=0;row<rows;row++)for(let i=0;i<steps;i++)edge(-1+2*i/steps,-1+2*row/(rows-1),-1+2*(i+1)/steps,-1+2*row/(rows-1),0);
 for(let col=0;col<9;col++)for(let i=0;i<steps;i++)edge(-1+col/4,-1+2*i/steps,-1+col/4,-1+2*(i+1)/steps,1);
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(wefts.length*3),3));
 geometry.setAttribute('aCoord',new THREE.Float32BufferAttribute(coords,2));
 geometry.setAttribute('aWeft',new THREE.Float32BufferAttribute(wefts,1));
 const material=new THREE.ShaderMaterial({
  uniforms,transparent:true,depthWrite:false,
  vertexShader:`
   attribute vec2 aCoord;attribute float aWeft;
   uniform float uTime;uniform vec3 uModes;uniform vec2 uPointer;uniform float uPulse;
   varying float vInk;
   void main(){
    float u=aCoord.x,v=aCoord.y,t=uTime*.36;
    float angle=u*1.8+.22*sin(t);
    vec3 wave=vec3(u*1.65,v*1.25+sin(u*2.4+t)*.22*(1.-v*v),sin(u*3.+t)*.5+v*.15);
    vec3 fold=vec3(u*1.65,v*1.45*cos(angle),v*1.45*sin(angle));
    vec3 crossed=vec3(u*1.65,v*1.1+.4*sin(u*3.4+v*1.2+t),.8*sin(u*2.2-t)*sin(v*1.8)+.3*v);
    vec3 p=wave*uModes.x+fold*uModes.y+crossed*uModes.z;
    vec2 d=p.xy-(uPointer-.5)*3.;
    p.xy+=d*exp(-dot(d,d)*1.5)*(.12+uPulse*.35);
    vInk=mix(.87,.2,aWeft)*(.85+.15*cos(u*2.));
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
   }`,
  fragmentShader:`varying float vInk;void main(){gl_FragColor=vec4(.792,.965,.65,vInk);}`,
 });
 const field=new THREE.LineSegments(geometry,material);field.frustumCulled=false;parent.add(field);
 resources.geometries.push(geometry);resources.materials.push(material);
 return uniforms;
}
