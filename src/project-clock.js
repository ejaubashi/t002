/** A project owns its clock. Idle, hidden and closed projects schedule no frames. */
export function createProjectClock(draw, { fps = 30 } = {}) {
  let frame = null, last = null, elapsed = 0;
  let running = false, visible = true, disposed = false;
  const canRun = () => running && visible && !document.hidden && !disposed;
  function schedule() {
    if (canRun() && frame === null) frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (!canRun()) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; last = null;
    } else schedule();
  }
  function tick(now) {
    frame = null;
    if (!canRun()) return;
    if (last === null || now - last >= 1000 / fps) {
      const delta = last === null ? 0 : Math.min((now - last) / 1000, .05);
      elapsed += delta; last = now;
      draw(elapsed, delta);
    }
    schedule();
  }
  document.addEventListener('visibilitychange', sync);
  return {
    get elapsed() { return elapsed; },
    setRunning(value) { running = value; sync(); },
    setVisible(value) { visible = value; sync(); },
    invalidate() { if (!disposed) draw(elapsed, 0); },
    dispose() {
      disposed = true; sync();
      document.removeEventListener('visibilitychange', sync);
    },
  };
}
