/** Small, independent Canvas simulation. Decorative: no content depends on it. */
export function createPlayground(canvas, { star = false, reducedMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setPaused() {} };
  let width = 0, height = 0, particles = [], paused = reducedMotion, visible = true;
  let pointer = { x: -2000, y: -2000 };
  let last = 0, frame = 0;
  const presets = [
    [.57, .18, .21], [1.01, .43, .145], [.8, .96, .049],
    [.30, .48, .021], [.16, .64, .013], [.53, .57, .017],
    [.80, .50, .012], [.92, .16, .013], [.81, .165, .015],
    [.79, .22, .021], [.84, .235, .022], [.86, .28, .011],
    [.215, .18, .021], [.75, .81, .008],
  ];
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.max(width, height * .8);
    particles = presets.map(([x, y, r], i) => ({
      x: x * width, y: y * height, r: r * scale,
      homeX: x * width, homeY: y * height,
      vx: Math.sin(i * 5) * .25, vy: Math.cos(i * 3) * .25,
    }));
    draw();
  }
  function starPath(x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2 + frame * .0007;
      const r = i % 2 === 0 ? radius : radius * .44;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#141414';
    particles.forEach((p, i) => {
      if (star && i === 0) starPath(p.x, p.y, p.r * 1.1);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    });
  }
  function step(time) {
    if (!paused && visible && !document.hidden && time - last > 1000 / 45) {
      const dt = Math.min((time - last) / 16.67, 2); last = time; frame++;
      for (const p of particles) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy), reach = p.r + 100;
        if (distance < reach && distance > 0) {
          const force = (1 - distance / reach) * .65;
          p.vx += dx / distance * force;
          p.vy += dy / distance * force;
        }
        p.vx += (p.homeX - p.x) * .00012 * dt;
        p.vy += (p.homeY - p.y) * .00012 * dt;
        p.vx *= .993; p.vy *= .993;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      draw();
    }
    requestAnimationFrame(step);
  }
  canvas.addEventListener('pointermove', (event) => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
  });
  canvas.addEventListener('pointerleave', () => { pointer = { x: -2000, y: -2000 }; });
  canvas.addEventListener('pointerdown', () => {
    if (paused) return;
    for (const p of particles) {
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length < p.r + 220) { p.vx += dx / length * 6; p.vy += dy / length * 6; }
    }
  });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);
  resize(); requestAnimationFrame(step);
  return { setPaused(value) { paused = value; } };
}
