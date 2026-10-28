import './experience.css';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let portal = null, portalAnimation = null, worldAnimations = [];

export function projectEntrance(dialog, source, destination) {
  cancelEntrance();
  if (motion.matches) return;
  if (dialog.classList.contains('project-world')) {
    const stage = destination.querySelector('.demo-stage');
    const title = stage?.querySelector('.orbit-demo-title,.world-form-title,.landscape-word,.record-copy');
    worldAnimations.push(dialog.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'}));
    if(stage)worldAnimations.push(stage.animate([{transform:'scale(1.045)',opacity:.55},{transform:'scale(1)',opacity:1}],{duration:1100,easing:'cubic-bezier(.16,1,.3,1)'}));
    if(title)worldAnimations.push(title.animate([{transform:'translateY(35px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:1000,easing:'cubic-bezier(.42,0,.58,1)'}));
    return;
  }
  const rect = source?.getBoundingClientRect();
  if (!rect || rect.right < 0 || rect.left > innerWidth || rect.bottom < 0 || rect.top > innerHeight) {
    dialog.animate([{ opacity: 0, transform: 'translateY(24px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    return;
  }
  const target = destination.getBoundingClientRect();
  portal = source.cloneNode(true);
  portal.className = 'portal-ghost'; portal.setAttribute('aria-hidden', 'true'); portal.inert = true;
  Object.assign(portal.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  // Popover top layer puts the decorative flight above the modal without hiding controls.
  portal.setAttribute('popover', 'manual'); document.body.append(portal);
  if (portal.showPopover) portal.showPopover();
  portalAnimation = portal.animate([
    { transform: 'translate(0,0) rotate(3deg)', opacity: 1, borderRadius: '3px' },
    { transform: `translate(${target.left - rect.left}px,${target.top - rect.top}px) scale(${target.width / rect.width},${target.height / rect.height})`, opacity: 0, borderRadius: '0' },
  ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
  const ghost = portal;
  portalAnimation.finished.catch(() => {}).finally(() => { ghost.remove(); if (portal === ghost) portal = null; });
  destination.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
}

export function cancelEntrance() { portalAnimation?.cancel(); portal?.remove(); portal = null; worldAnimations.forEach(a=>a.cancel());worldAnimations=[]; }

export function initExperience() {
  const panels = [...document.querySelectorAll('.project-panel')];
  let scheduled = null, userPaused = document.body.classList.contains('motion-paused');
  function updateScene() {
    scheduled = null;
    if (motion.matches || userPaused) return;
    const vertical = innerWidth <= 700;
    for (const panel of panels) {
      const r = panel.getBoundingClientRect();
      const travel = Math.max(-1, Math.min(1, vertical
        ? (r.top + r.height / 2 - innerHeight / 2) / innerHeight
        : (r.left + r.width / 2 - innerWidth / 2) / innerWidth));
      panel.style.setProperty('--scene-x', `${travel * 42}px`);
      panel.style.setProperty('--scene-y', `${travel * 28}px`);
      panel.style.setProperty('--scene-turn', `${travel * 16}deg`);
    }
  }
  function scheduleScene() {
    if (scheduled === null && !motion.matches && !userPaused && !document.hidden) scheduled = requestAnimationFrame(updateScene);
  }
  function resetScene() {
    if (scheduled !== null) cancelAnimationFrame(scheduled);
    scheduled = null;
    panels.forEach(panel => ['--scene-x','--scene-y','--scene-turn','--tilt-x','--tilt-y'].forEach(name => panel.style.removeProperty(name)));
    if (!motion.matches && !userPaused) scheduleScene();
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-inview', entry.isIntersecting));
    scheduleScene();
  }, { threshold: .18 });
  panels.forEach(panel => {
    observer.observe(panel);
    panel.addEventListener('pointermove', event => {
      if (!finePointer.matches || motion.matches || userPaused) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--tilt-x', `${((event.clientX - rect.left) / rect.width - .5) * 15}deg`);
      panel.style.setProperty('--tilt-y', `${-((event.clientY - rect.top) / rect.height - .5) * 15}deg`);
    });
    panel.addEventListener('pointerleave', () => { panel.style.setProperty('--tilt-x', '0deg'); panel.style.setProperty('--tilt-y', '0deg'); });
  });
  document.querySelector('#work-track').addEventListener('scroll', scheduleScene, { passive: true });
  window.addEventListener('scroll', scheduleScene, { passive: true });
  window.addEventListener('resize', scheduleScene, { passive: true });
  motion.addEventListener('change', resetScene);
  document.addEventListener('portfolio-motion', event => { userPaused = event.detail.paused; resetScene(); });
  const cursor = document.createElement('div'); cursor.className = 'experience-cursor'; cursor.setAttribute('aria-hidden', 'true'); document.body.append(cursor);
  document.addEventListener('pointermove', event => {
    const target = event.target.closest('.project-hit');
    const visible = target && finePointer.matches && !motion.matches && !userPaused && !document.querySelector('dialog[open]');
    cursor.classList.toggle('cursor-visible', !!visible);
    if (!visible) return;
    cursor.textContent = 'EXPLORE';
    cursor.style.transform = `translate(${event.clientX + 18}px,${event.clientY + 18}px)`;
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) cursor.classList.remove('cursor-visible'); });
  document.addEventListener('portfolio-motion', event => { if (event.detail.paused) cursor.classList.remove('cursor-visible'); });
}
