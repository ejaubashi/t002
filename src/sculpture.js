import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Real geometry and lighting, with a procedural environment: no remote assets.
export function mountSculpture(hero) {
  const canvas = document.createElement('canvas');
  canvas.className = 'chrome-canvas'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch { return; } // The original Canvas playground remains the fallback.
  hero.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth <= 700 ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
  camera.position.z = 8;
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04, .1, 100, { size: innerWidth <= 700 ? 64 : 128 });
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  const group = new THREE.Group(); scene.add(group);
  const geometry = new THREE.TorusKnotGeometry(1.15, .41, 160, 28, 2, 3);
  const material = new THREE.MeshStandardMaterial({ color: 0xf2f1ef, metalness: 1, roughness: .13 });
  const knot = new THREE.Mesh(geometry, material); group.add(knot);
  const satelliteGeometry = new THREE.SphereGeometry(.14, 24, 16);
  const satellites = [];
  for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(satelliteGeometry, material);
    satellites.push(sphere); group.add(sphere);
  }
  const fill = new THREE.DirectionalLight(0xffddb5, 4); fill.position.set(-4, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe0f1ff, 5); rim.position.set(4, -2, 2); scene.add(rim);
  let paused = document.body.classList.contains('motion-paused');
  let renderedAt = 0;
  let visible = true, dragging = false, previousX = 0, previousY = 0;
  let targetX = -.3, targetY = .2, time = 0, previousTime = 0;
  const resize = new ResizeObserver(() => {
    const box = hero.getBoundingClientRect();
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height; camera.updateProjectionMatrix();
    const mobile = box.width <= 700;
    group.position.set(mobile ? .15 : 1.6, mobile ? -.15 : 0, 0);
    group.scale.setScalar(mobile ? .72 : 1.1);
    renderer.render(scene, camera);
  });
  resize.observe(hero);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(hero);
  document.addEventListener('portfolio-motion', event => { paused = event.detail.paused; });
  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || paused) return;
    dragging = true; previousX = event.clientX; previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging) return;
    targetY += (event.clientX - previousX) * .009;
    targetX += (event.clientY - previousY) * .009;
    previousX = event.clientX; previousY = event.clientY;
  });
  function release() { dragging = false; canvas.classList.remove('is-dragging'); }
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  function animate(timestamp) {
    const dt = Math.min((timestamp - previousTime) / 1000 || 0, .05);
    previousTime = timestamp;
    if (visible && !document.hidden && !paused && timestamp - renderedAt > 1000 / 30) {
      renderedAt = timestamp;
      time += dt;
      if (!dragging) targetY += dt * .14;
      knot.rotation.x += (targetX - knot.rotation.x) * .08;
      knot.rotation.y += (targetY - knot.rotation.y) * .08;
      knot.position.y = Math.sin(time * .65) * .14;
      satellites.forEach((sphere, i) => {
        const a = time * .25 + i * Math.PI * 2 / satellites.length;
        sphere.position.set(Math.cos(a) * 2.15, Math.sin(a * 1.4) * 1.6, Math.sin(a) * .8);
      });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
  // An intentional static composition is also rendered for reduced motion.
  knot.rotation.set(targetX, targetY, -.2);
  satellites.forEach((sphere, i) => { const a = i * 1.25; sphere.position.set(Math.cos(a) * 2.15, Math.sin(a) * 1.6, -.2); });
  renderer.render(scene, camera);
  hero.classList.add('sculpture-ready');
  requestAnimationFrame(animate);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); visible = false; hero.classList.remove('sculpture-ready'); canvas.hidden = true;
  });
}
