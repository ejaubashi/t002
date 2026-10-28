/** Horizontal gestures keep vertical touch scrolling available. Controls remain usable without dragging. */
export function bindHorizontalDrag(element, { onStart, onMove, onEnd }, signal) {
  let drag = null;
  const listen = (name, handler) => element.addEventListener(name, handler, { signal });
  function finish(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const state = drag; drag = null;
    element.classList.remove('is-dragging');
    if (element.hasPointerCapture(state.id)) element.releasePointerCapture(state.id);
    onEnd?.({ cancelled, moved: state.moved });
  }
  listen('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button,a,input')) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');
    onStart?.({ x: event.clientX, y: event.clientY });
  });
  listen('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    drag.moved ||= Math.abs(dx) > 3;
    onMove?.({ dx, dy, x: event.clientX, y: event.clientY });
  });
  listen('pointerup', event => finish(event));
  listen('pointercancel', event => finish(event, true));
  listen('lostpointercapture', event => finish(event, true));
  signal.addEventListener('abort', () => {
    if (drag && element.hasPointerCapture(drag.id)) element.releasePointerCapture(drag.id);
    drag = null; element.classList.remove('is-dragging');
  }, { once: true });
}
