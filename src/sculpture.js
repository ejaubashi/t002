import * as THREE from 'three';
import { createSignalField } from './orbit-shaders.js';

/** Restrained, project-specific 3D. Nothing mounts on the portfolio homepage. */
export function mountProjectSculpture(stage, index, { onFallback } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'project-sculpture'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = index === 0 ? 1.35 : 1.15;
  stage.append(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 30); camera.position.set(0, .25, 7.5);
  const group = new THREE.Group(); scene.add(group);
  const geometries = [], materials = [], textures = [];
  const rings = []; let signalUniforms; let mode = 1;
  const weights = new THREE.Vector3(0,1,0);
  const targetColor = new THREE.Color(0xba9670); let finishChanging = false;
  const makeMaterial = options => { const material = new THREE.MeshStandardMaterial(options); materials.push(material); return material; };
  function mesh(geometry, material, parent = group) { geometries.push(geometry); const object = new THREE.Mesh(geometry, material); parent.add(object); return object; }
  scene.add(new THREE.HemisphereLight(0xffffff, index === 0 ? 0x171b72 : 0x8b7257, index === 0 ? 3 : 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(index === 0 ? 0x92baff : 0xffe8c4, 3); rim.position.set(4, 2, -2); scene.add(rim);
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let disposed = false, visible = true, frame, last = 0, time = 0, tempo = 1, phase = 0, turn = 0;
  let pointerX = 0, pointerY = 0;
  const vessels = [];
  let ceramic;
  let roughnessTarget = .65;
  if (index === 0) {
    const lime = makeMaterial({ color: 0xcaf6b2, metalness: .3, roughness: .35 });
    for (let i = 0; i < 3; i++) {
      const ring = mesh(new THREE.TorusGeometry(1.18 + i * .16, .055, 16, 120), lime);
      ring.rotation.set(i * .8, i * .62, i * .35); rings.push(ring);
    }
    const sphereGeometry = new THREE.SphereGeometry(.08, 20, 12); geometries.push(sphereGeometry);
    for (let i = 0; i < 9; i++) {
      const dot = new THREE.Mesh(sphereGeometry, lime);
      dot.position.set(Math.cos(i * 2.4) * 1.8, Math.sin(i * 2.4) * 1.5, Math.sin(i) * .6); group.add(dot);
    }
    group.rotation.set(.3, -.3, -.3);
    signalUniforms = createSignalField(scene, { geometries, materials });
  } else {
    const grain = document.createElement('canvas'); grain.width = grain.height = 128;
    const ctx = grain.getContext('2d'); const pixels = ctx.createImageData(128,128);
    for(let i=0;i<pixels.data.length;i+=4){const value=150+Math.sin(i*12.9898)*22;pixels.data.set([value,value,value,255],i);}
    ctx.putImageData(pixels,0,0);
    const texture = new THREE.CanvasTexture(grain); texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,3);textures.push(texture);
    ceramic = new THREE.MeshPhysicalMaterial({ color: 0xba9670, roughness: .65, metalness: 0, bumpMap:texture,bumpScale:.018,clearcoat:.18,clearcoatRoughness:.38 });materials.push(ceramic);
    renderer.shadowMap.enabled = true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    key.castShadow=true;key.shadow.mapSize.set(innerWidth<700?512:1024,innerWidth<700?512:1024);key.shadow.bias=-.001;
    key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;
    const floorMaterial = new THREE.ShadowMaterial({opacity:.2});materials.push(floorMaterial);
    const floor=mesh(new THREE.PlaneGeometry(12,12),floorMaterial,scene);floor.rotation.x=-Math.PI/2;floor.position.y=-1.01;floor.receiveShadow=true;
    // Follow the outer wall, lip and inner wall to model a genuinely hollow vessel.
    const points = [[.01,0],[.42,0],[.54,.05],[.62,.22],[.65,.5],[.62,.8],[.52,1.12],[.38,1.4],[.34,1.55],[.34,1.61],[.31,1.64],[.28,1.61],[.28,1.55],[.32,1.4],[.46,1.12],[.56,.8],[.59,.5],[.56,.22],[.45,.12],[.01,.12]].map(([x,y])=>new THREE.Vector2(x,y));
    const geometry = new THREE.LatheGeometry(points, 72); geometries.push(geometry);
    for (let i = 0; i < 2; i++) {
      const vase = new THREE.Mesh(geometry, ceramic);
      vase.scale.setScalar(i === 0 ? 1.3 : .9); vase.position.set(i === 0 ? -.7 : .8, -.95, i === 0 ? .1 : -.1);
      vase.castShadow=true;vase.receiveShadow=true;
      vase.rotation.z = i === 0 ? -.1 : .1; group.add(vase); vessels.push(vase);
    }
    camera.position.set(0, 2.2, 7.2); camera.lookAt(0, .2, 0);
  }
  const abort = new AbortController();
  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5);
    pointerY = ((event.clientY - rect.top) / rect.height - .5);
    if (paused) render();
  }, { signal: abort.signal });
  stage.addEventListener('pointerleave', () => { pointerX = pointerY = 0; if (paused) render(); }, { signal: abort.signal });
  function render() {
    if (disposed) return;
    if (index === 0) {
      const target=new THREE.Vector3(mode===0?1:0,mode===1?1:0,mode===2?1:0);
      weights.lerp(target, paused?1:.12);signalUniforms.uModes.value.copy(weights);
      signalUniforms.uTime.value=time+phase;signalUniforms.uPointer.value.set(pointerX+.5,.5-pointerY);
      group.rotation.set(.3+pointerY*.2,time*.1+pointerX*.3+phase,-.3);
      rings.forEach((ring,i)=>{ring.rotation.x=i*.8*weights.y+(i-1)*.22*weights.x+i*1.1*weights.z;ring.rotation.y=i*.62*weights.y+Math.sin(time*.3+i)*.6*weights.z;ring.scale.y=1-weights.x*.65;});
    }
    else {
      if(finishChanging){ceramic.color.lerp(targetColor,paused?1:.12);ceramic.roughness=THREE.MathUtils.lerp(ceramic.roughness,roughnessTarget,paused?1:.12);if(Math.abs(ceramic.color.r-targetColor.r)+Math.abs(ceramic.color.g-targetColor.g)+Math.abs(ceramic.color.b-targetColor.b)<.001)finishChanging=false;}
      group.rotation.y = turn * Math.PI / 180 + pointerX * .12;
      vessels.forEach((vase, i) => { vase.rotation.z = (i === 0 ? -.1 : .1) + Math.sin(turn * Math.PI / 180) * .12; });
    }
    renderer.render(scene, camera);
  }
  const resize = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height || disposed) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); render();
  }); resize.observe(stage);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(stage);
  function animate(now) {
    if (disposed) return;
    if (visible && !paused && !document.hidden && now - last >= 1000 / 30) { time += Math.min((now - last) / 1000, .05) * tempo; last = now; render(); }
    frame = requestAnimationFrame(animate);
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); api.dispose(); onFallback?.(); }, { signal: abort.signal });
  const api = {
    setPaused(value) { paused = value; },
    setMode(value) { mode = ['wave','orbit','interference'].indexOf(value); if(mode<0)mode=1; render(); },
    setTempo(value) { tempo = Number(value); },
    remix() { phase += .9; render(); },
    setTurn(value) { turn = Number(value); render(); },
    setFinish(value) { targetColor.set({sand:'#ba9670',sage:'#92a58b',clay:'#c37151',ink:'#3b566a'}[value]||'#ba9670');roughnessTarget=value==='ink'?.38:.65;finishChanging=true; render(); },
    dispose() {
      if (disposed) return; disposed = true;
      abort.abort(); cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect();
      textures.forEach(texture=>texture.dispose()); key.shadow?.map?.dispose();
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      const context = renderer.getContext();
      renderer.dispose(); if (!context.isContextLost()) renderer.forceContextLoss(); canvas.remove(); stage.classList.remove('demo-3d-ready');
    },
  };
  stage.classList.add('demo-3d-ready'); render(); frame = requestAnimationFrame(animate);
  return api;
}
