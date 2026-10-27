/** Lightweight Canvas translation of the same three Figma signal studies. */
export function createOrbitCanvas(canvas, getState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { draw() {}, dispose() {} };
  let width = 1, height = 1, lastTime = 0;
  const weights = [0, 1, 0];
  function draw(t, delta = 0) {
    lastTime = t;
    const { mode, x, y, remix, tempo, paused } = getState();
    const selected = ['wave', 'orbit', 'interference'].indexOf(mode);
    weights.forEach((weight, i) => { weights[i] = paused ? Number(i === selected) : weight + (Number(i === selected) - weight) * (1 - Math.exp(-delta * 8)); });
    ctx.clearRect(0, 0, width, height);
    const size = Math.min(width * .4, height * .46), time = t * tempo * .55 + remix;
    const cx = width / 2, cy = height / 2;
    const lensX = cx + x * width, lensY = cy + y * height;
    function point(px, py) {
      const dx = px - lensX, dy = py - lensY;
      const lens = Math.exp(-(dx * dx + dy * dy) / (size * size * .14)) * .32;
      return [px + dx * lens, py + dy * lens];
    }
    ctx.strokeStyle = '#caf6a6'; ctx.lineWidth = .8;
    if (weights[0] > .005) {
      ctx.globalAlpha = weights[0] * .42;
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 80; j++) {
          const px = (j / 80) * width;
          const py = cy + (i - 12) * size / 17 + Math.sin(j / 80 * 7 + time + i * .08) * size * .1;
          const p = point(px, py); j ? ctx.lineTo(...p) : ctx.moveTo(...p);
        }
        ctx.stroke();
      }
    }
    if (weights[1] > .005) {
      ctx.globalAlpha = weights[1] * .48;
      for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, size * (.2 + i * .035), size * (.07 + i * .013), i * .12 + time * .05 + x * .15, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (weights[2] > .005) {
      ctx.globalAlpha = weights[2] * .38;
      for (const offset of [-.25, .25]) for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 96; j++) {
          const a = j / 96 * Math.PI * 2, r = size * (.05 + i * .06) + Math.sin(time) * 2;
          const p = point(cx + offset * size + Math.cos(a) * r, cy + Math.sin(a) * r);
          j ? ctx.lineTo(...p) : ctx.moveTo(...p);
        }
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#caf6a6';
    for (let i = 0; i < (width < 700 ? 65 : 120); i++) {
      const px = (i * 97.1 % width), py = (i * 53.7 % height);
      const p = point(px, py);
      ctx.globalAlpha = .18 + .3 * (.5 + .5 * Math.sin(time + i));
      ctx.beginPath(); ctx.arc(...p, .65, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const resize = new ResizeObserver(() => {
    const box = canvas.getBoundingClientRect(); width = box.width; height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(lastTime);
  });
  resize.observe(canvas);
  return { draw, dispose() { resize.disconnect(); } };
}
