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
      float line(float x,float width){return 1.-smoothstep(0.,width,abs(sin(x)));}
      void main(){
        vec2 p=(vUv-.5)*vec2(uAspect,1.);
        vec2 mouse=(uPointer-.5)*vec2(uAspect,1.);
        vec2 d=p-mouse;
        float lens=exp(-dot(d,d)*38.);
        p+=d*lens*.32;
        float t=uTime*.55;
        float wave=line(p.y*90.+sin(p.x*7.+t)*2.8,.17);
        float orbit=line(length(p)*95.-t*1.4+sin(atan(p.y,p.x)*3.+t)*.8,.14);
        float a=length(p-vec2(-.19,0.));
        float b=length(p-vec2(.19,0.));
        float interference=line(a*95.-t,.15)*.55+line(b*95.+t*.7,.15)*.55;
        float ripple=line(length(d)*80.-(1.-uPulse)*24.,.24)*uPulse;
        float ink=dot(vec3(wave,orbit,interference),uModes)+ripple*.65;
        float fade=1.-smoothstep(.22,.85,length(p));
        vec3 color=mix(vec3(.32,.58,.9),vec3(.79,.97,.65),.7);
        gl_FragColor=vec4(color,(ink*.28+lens*.02)*fade);
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
