import * as THREE from 'three';
import { createSignalField } from './orbit-shaders.js';
import { createProjectClock } from './project-clock.js';

/** Project-only graphics, mounted lazily and fully disposed on close. */
export function mountProjectSculpture(stage, index, { onFallback, presentation = 'demo', owner = 'project' } = {}) {
  const world = presentation === 'world';
  const canvas = document.createElement('canvas');
  canvas.className = 'project-sculpture'; canvas.dataset.graphicsOwner = owner; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: innerWidth >= 700, powerPreference: 'low-power' }); }
  catch { return null; }
  const mobile = innerWidth < 700;
  const pixelRatio = Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = index === 0 ? 1.2 : 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
  camera.position.set(0, .25, world && mobile ? 12 : 7.5);
  const group = new THREE.Group(); scene.add(group);
  if (world) { group.position.x = mobile ? .15 : 1.2; if (index === 0 && mobile) group.position.y = -.65; }
  const geometries = [], materials = [], textures = [], rings = [];
  const abort = new AbortController();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false, paused = reduced.matches, mode = 1;
  let time = 0, tempo = 1, phase = 0, turn = 0, pointerX = 0, pointerY = 0;
  let signalUniforms, ceramic, finishChanging = false;
  const weights = new THREE.Vector3(0, 1, 0), targetWeights = weights.clone();
  const targetColor = new THREE.Color(0xba9670);
  let roughnessTarget = .72, coatTarget = .12;
  let pulse = 0, inspection = 0, inspectionTarget = 0, inspectionChanging = false, journey = 0;
  const makeMaterial = options => { const m = new THREE.MeshStandardMaterial(options); materials.push(m); return m; };
  function mesh(geometry, material, parent = group) {
    geometries.push(geometry); const object = new THREE.Mesh(geometry, material); parent.add(object); return object;
  }
  scene.add(new THREE.HemisphereLight(0xfffcf5, index === 0 ? 0x171b72 : 0x8b7257, index === 0 ? 2.5 : 1.65));
  const key = new THREE.DirectionalLight(0xfffaf0, index === 0 ? 3 : 3.2);
  key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(index === 0 ? 0x92baff : 0xffe8d2, index === 0 ? 2 : .65);
  rim.position.set(4, 2, -2); scene.add(rim);

  if (index === 0) {
    const lime = makeMaterial({ color: 0xcaf6a6, metalness: .08, roughness: .58 });
    for (let i = 0; i < 3; i++) {
      const ring = mesh(new THREE.TorusGeometry(1.18 + i * .16, .035, mobile ? 10 : 16, mobile ? 80 : 120), lime);
      rings.push(ring);
    }
    signalUniforms = createSignalField(scene, { geometries, materials });
    signalUniforms.uPixelRatio.value = pixelRatio;
  } else {
    // Local deterministic clay grain: fine mineral speckles and faint wheel marks.
    const grain = document.createElement('canvas'); grain.width = grain.height = 256;
    const ctx = grain.getContext('2d'); const pixels = ctx.createImageData(256, 256);
    let seed = 17;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 4294967296;
      const value = 155 + noise * 55 + Math.sin(y * .5) * 5;
      const p = (y * 256 + x) * 4;
      pixels.data.set([value, value, value, 255], p);
    }
    ctx.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(grain);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3, 2); textures.push(texture);
    ceramic = new THREE.MeshPhysicalMaterial({
      color: 0xba9670, roughness: .72, metalness: 0,
      bumpMap: texture, bumpScale: .012, clearcoat: .12, clearcoatRoughness: .35,
    }); materials.push(ceramic);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    key.castShadow = true; key.shadow.radius = 3; key.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
    key.shadow.bias = -.0003; key.shadow.normalBias = .015;
    key.shadow.camera.left = -3; key.shadow.camera.right = 3;
    key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
    const floorMaterial = new THREE.ShadowMaterial({ opacity: .18 }); materials.push(floorMaterial);
    const floor = mesh(new THREE.PlaneGeometry(12, 12), floorMaterial, scene);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.955; floor.receiveShadow = true;
    const points = [[.01,0],[.42,0],[.54,.05],[.62,.22],[.65,.5],[.62,.8],[.52,1.12],[.38,1.4],[.34,1.55],[.34,1.61],[.31,1.64],[.28,1.61],[.28,1.55],[.32,1.4],[.46,1.12],[.56,.8],[.59,.5],[.56,.22],[.45,.12],[.01,.12]].map(([x,y]) => new THREE.Vector2(x,y));
    const geometry = new THREE.LatheGeometry(points, mobile ? 48 : 72); geometries.push(geometry);
    for (let i = 0; i < 2; i++) {
      const vase = new THREE.Mesh(geometry, ceramic);
      vase.scale.setScalar(i === 0 ? 1.3 : .9);
      vase.position.set(i === 0 ? -.65 : .8, -.95, i === 0 ? .12 : -.18);
      vase.castShadow = true; vase.receiveShadow = true; group.add(vase);
    }
    camera.position.set(0, world && mobile ? 3.5 : 2.0, world && mobile ? 13.5 : mobile ? 7.6 : 7.1); camera.lookAt(0, world && mobile ? 1.25 : .12, 0);
  }

  function syncClock() { clock.setRunning(!paused && (index === 0 || finishChanging || inspectionChanging)); }
  function render(delta = 0) {
    if (disposed) return;
    const blend = paused ? 1 : 1 - Math.exp(-delta * 8);
    if (index === 0) {
      weights.lerp(targetWeights, blend); signalUniforms.uModes.value.copy(weights);
      signalUniforms.uTime.value = time + phase;
      pulse = paused ? 0 : pulse * Math.exp(-delta * 3.2);
      signalUniforms.uPulse.value = pulse;
      group.scale.setScalar(1 + pulse * .13);
      signalUniforms.uPointer.value.set(pointerX + .5, .5 - pointerY);
      group.rotation.set(.3 + pointerY * .2 + journey * .35, time * .1 + pointerX * .3 + phase + journey * .8, -.3 + journey * .2 + (world ? (1-Math.cos(time*Math.PI*2/5))*.28 : 0));
      if(world) group.position.x = (mobile ? .15 : 1.2) + journey * .45;
      rings.forEach((ring, i) => {
        ring.rotation.x = i * .8 * weights.y + (i - 1) * .22 * weights.x + i * 1.1 * weights.z;
        ring.rotation.y = i * .62 * weights.y + Math.sin(time * .3 + i) * .6 * weights.z;
        ring.scale.y = 1 - weights.x * .65;
      });
    } else {
      if (finishChanging) {
        ceramic.color.lerp(targetColor, blend);
        ceramic.roughness = THREE.MathUtils.lerp(ceramic.roughness, roughnessTarget, blend);
        ceramic.clearcoat = THREE.MathUtils.lerp(ceramic.clearcoat, coatTarget, blend);
        const distance = Math.abs(ceramic.color.r - targetColor.r) + Math.abs(ceramic.color.g - targetColor.g) + Math.abs(ceramic.color.b - targetColor.b);
        if (distance < .001 && Math.abs(ceramic.clearcoat - coatTarget) < .001) {
          ceramic.color.copy(targetColor); ceramic.roughness = roughnessTarget; ceramic.clearcoat = coatTarget;
          finishChanging = false; syncClock();
        }
      }
      if (inspectionChanging) {
        inspection = THREE.MathUtils.lerp(inspection, inspectionTarget, blend);
        if (Math.abs(inspection - inspectionTarget) < .001) { inspection = inspectionTarget; inspectionChanging = false; syncClock(); }
      }
      camera.position.z = (world && mobile ? 13.5 : mobile ? 7.6 : 7.1) - inspection * 1.5 - journey * .6;
      camera.lookAt(-inspection * .15, (world && mobile ? 1.25 : .12) + inspection * .12, 0);
      group.rotation.y = turn * Math.PI / 180 + pointerX * .12 + journey * .5;
    }
    renderer.render(scene, camera);
  }
  const clock = createProjectClock((_, delta) => { time += delta * tempo; render(delta); });
  stage.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    const rect = stage.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
    if (paused || index !== 0) render();
  }, { signal: abort.signal });
  stage.addEventListener('pointerleave', () => { pointerX = pointerY = 0; render(); }, { signal: abort.signal });
  const resize = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height || disposed) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix(); if (signalUniforms) signalUniforms.uAspect.value = camera.aspect;
    render();
  });
  const intersection = new IntersectionObserver(([entry]) => clock.setVisible(entry.isIntersecting));
  const api = {
    setPaused(value) { if (paused === value) return; paused = value; render(); syncClock(); },
    setMode(value) {
      mode = ['wave', 'orbit', 'interference'].indexOf(value); if (mode < 0) mode = 1;
      targetWeights.set(mode === 0 ? 1 : 0, mode === 1 ? 1 : 0, mode === 2 ? 1 : 0);
      render(); syncClock();
    },
    setJourney(value) { if(Math.abs(value-journey)<.001)return;journey=value;render(); },
    setPointer(x, y) { pointerX = x; pointerY = y; if (paused || index !== 0) render(); },
    pulse() { phase += .18; pulse = paused ? 0 : 1; render(); },
    setInspection(value) { paused = reduced.matches; inspectionTarget = value ? 1 : 0; inspectionChanging = true; render(); syncClock(); },
    setTempo(value) { tempo = Number(value); },
    remix() { phase += .9; render(); },
    setTurn(value) { paused = reduced.matches; turn = Number(value); render(); syncClock(); },
    setFinish(value) {
      // Preference events may arrive after a control action; read the live value.
      paused = reduced.matches;
      targetColor.set({ sand:'#ba9670', sage:'#92a58b', clay:'#c37151', ink:'#3b566a' }[value] || '#ba9670');
      roughnessTarget = { sand:.72, sage:.84, clay:.64, ink:.34 }[value] ?? .72;
      coatTarget = { sand:.12, sage:.04, clay:.16, ink:.5 }[value] ?? .12;
      finishChanging = true; render(); syncClock();
    },
    dispose() {
      if (disposed) return; disposed = true;
      abort.abort(); clock.dispose(); resize.disconnect(); intersection.disconnect();
      textures.forEach(t => t.dispose()); key.shadow?.map?.dispose();
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      const context = renderer.getContext(); renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss();
      canvas.remove(); stage.classList.remove('demo-3d-ready');
    },
  };
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); api.dispose(); onFallback?.();
  }, { signal: abort.signal });
  stage.append(canvas); stage.classList.add('demo-3d-ready');
  resize.observe(stage); intersection.observe(stage); render(); syncClock();
  return api;
}
