import * as THREE from 'three';

// Browser translation of the Figma Signal field; this is a local GLSL renderer.
export function createSignalField(scene, resources) {
  const uniforms = {
    uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(.5, .5) },
    uModes: { value: new THREE.Vector3(0, 1, 0) },
    uPulse: { value: 0 }, uAspect: { value: 1.5 }, uPixelRatio: { value: 1 },
  };
  const fieldGeometry = new THREE.PlaneGeometry(2, 2);
  const fieldMaterial = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}',
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime; uniform vec2 uPointer;
      uniform vec3 uModes; uniform float uAspect; uniform float uPulse;
      float line(float phase){
        float edge=max(fwidth(phase)*.8,.025);
        return 1.-smoothstep(.23-edge,.23+edge,abs(sin(phase)));
      }
      void main(){
        vec2 aspect=vec2(uAspect,1.);
        vec2 uv=vec2(vUv.x,1.-vUv.y);
        vec2 p=(uv-vec2(.65,.47))*aspect;
        vec2 mouse=(vec2(uPointer.x,1.-uPointer.y)-vec2(.65,.47))*aspect;
        vec2 d=p-mouse;
        float lens=exp(-dot(d,d)*14.);
        p+=d*lens*.24;
        float t=uTime*.12;
        float a=line(p.y*96.+sin(p.x*4.6+t)*3.);
        float b=line(p.y*98.4+sin(p.x*4.6-t)*3.3+.4);
        float wave=a*.45+b*.25+a*b*.55;
        float d1=length(p+vec2(.16*sin(t),.11*cos(t*.7)));
        float d2=length(p-vec2(.17*cos(t*.8),.13*sin(t)));
        a=line(d1*126.-t);b=line(d2*131.4+t*.7);
        float orbit=a*.45+b*.25+a*b*.55;
        a=line((p.x*.84+p.y*.28)*93.+sin(p.y*5.-t)*2.4);
        b=line((p.x*.81-p.y*.31)*96.+sin(p.y*4.+t)*2.4);
        float interference=a*.45+b*.25+a*b*.55;
        float ripple=line(length(d)*80.-(1.-uPulse)*24.)*uPulse;
        float ink=dot(vec3(wave,orbit,interference),uModes)+ripple*.65;
        float fade=1.-smoothstep(.18,.7,length(p));
        gl_FragColor=vec4(.79,.97,.65,clamp((ink*.58+lens*.015)*fade,0.,.85));
      }`,
  });
  const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
  field.frustumCulled = false; field.renderOrder = -1; scene.add(field);
  const count = innerWidth < 700 ? 180 : 360;
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = i * 2.39996323, r = .6 + Math.sqrt(i / count) * 2;
    points.set([Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 1.71) * .5], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime;uniform vec3 uModes;uniform float uPixelRatio;
      uniform vec2 uPointer;uniform float uPulse;varying float vFade;
      void main(){vec3 p=position;float a=atan(p.y,p.x)+uTime*.035;float r=length(p.xy);
      vec3 orbit=vec3(cos(a)*r,sin(a)*r,p.z);
      vec3 wave=vec3(p.x,sin(p.x*3.+uTime)*.45+p.y*.22,p.z);
      vec3 interference=vec3(p.x,p.y,sin(p.x*3.+uTime)*cos(p.y*3.-uTime)*.5);
      p=wave*uModes.x+orbit*uModes.y+interference*uModes.z;
      vec2 d=p.xy-(uPointer-.5)*4.;p.xy+=d*exp(-dot(d,d)*2.)*(.12+uPulse*.45);
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(14./-mv.z,1.,3.)*uPixelRatio;
      vFade=.2+.35*(.5+.5*sin(position.x*8.+uTime));}`,
    fragmentShader: `varying float vFade;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.79,.98,.66,vFade*(1.-smoothstep(.2,.5,d)));}`,
  });
  scene.add(new THREE.Points(geometry, material));
  resources.geometries.push(fieldGeometry, geometry);
  resources.materials.push(fieldMaterial, material);
  return uniforms;
}
