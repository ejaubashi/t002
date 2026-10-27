import * as THREE from 'three';

// Shared controls drive both shader layers and the 3D composition.
export function createSignalField(scene, resources) {
  const uniforms = {
    uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(.5, .5) },
    uModes: { value: new THREE.Vector3(0, 1, 0) },
  };
  const fieldGeometry = new THREE.PlaneGeometry(18, 12);
  const fieldMaterial = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec3 uModes;
      float line(float x,float width){return 1.-smoothstep(0.,width,abs(sin(x)));}
      void main(){
        vec2 p=(vUv-.5)*vec2(1.5,1.);
        vec2 mouse=(uPointer-.5)*vec2(1.5,1.);
        vec2 d=p-mouse;
        float lens=exp(-dot(d,d)*42.);
        p+=d*lens*.38;
        float t=uTime*.55;
        float wave=line(p.y*90.+sin(p.x*7.+t)*2.8,.16);
        float orbit=line(length(p)*95.-t*1.4+sin(atan(p.y,p.x)*3.+t)*.8,.13);
        float interference=line(sin(p.x*13.+t)*3.+sin(p.y*14.-t*.7)*3.,.075);
        float ink=dot(vec3(wave,orbit,interference),uModes);
        float fade=(1.-smoothstep(.05,.75,length(p)));
        vec3 color=mix(vec3(.32,.58,.9),vec3(.76,.96,.57),lens*.7+ink*.4);
        gl_FragColor=vec4(color,(ink*.22+lens*.025)*fade);
      }`,
  });
  const field = new THREE.Mesh(fieldGeometry, fieldMaterial); field.position.z = -3; scene.add(field);
  const points = new Float32Array(420 * 3);
  for (let i=0;i<420;i++) {
    const a=i*2.39996323,r=.6+Math.sqrt(i/420)*2;
    points[i*3]=Math.cos(a)*r;points[i*3+1]=Math.sin(a)*r;points[i*3+2]=Math.sin(i*1.71)*.5;
  }
  const geometry = new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(points,3));
  const material = new THREE.ShaderMaterial({
    uniforms, transparent:true,depthWrite:false,
    vertexShader:`uniform float uTime;uniform vec3 uModes;varying float vFade;
      void main(){vec3 p=position;float a=atan(p.y,p.x)+uTime*.035;float r=length(p.xy);
      vec3 orbit=vec3(cos(a)*r,sin(a)*r,p.z);
      vec3 wave=vec3(p.x,sin(p.x*3.+uTime)*.45+p.y*.22,p.z);
      vec3 interference=vec3(p.x,p.y,sin(p.x*3.+uTime)*cos(p.y*3.-uTime)*.5);
      p=wave*uModes.x+orbit*uModes.y+interference*uModes.z;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(16./-mv.z,1.,4.);vFade=.25+.45*(.5+.5*sin(position.x*8.+uTime));}`,
    fragmentShader:`varying float vFade;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.79,.98,.66,vFade*(1.-smoothstep(.2,.5,d)));}`,
  });
  const particles = new THREE.Points(geometry,material);scene.add(particles);
  resources.geometries.push(fieldGeometry,geometry);resources.materials.push(fieldMaterial,material);
  return uniforms;
}
