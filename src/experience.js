import './experience.css';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let portal = null, portalAnimation = null;

export function projectEntrance(dialog, source, destination) {
  portalAnimation?.cancel(); portal?.remove();
  if (motion.matches) return;
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

export function cancelEntrance() { portalAnimation?.cancel(); portal?.remove(); portal = null; }

export function initExperience() {
  const hero = document.querySelector('.hero');
  const hint = document.createElement('span'); hint.className = 'sculpture-hint';
  hint.textContent = 'SCULPTURE NO. 01 / DRAG TO DISCOVER'; hero.append(hint);
  const ticker = document.createElement('div'); ticker.className = 'hero-ticker'; ticker.setAttribute('aria-hidden', 'true');
  ticker.innerHTML = '<div>'+Array(4).fill('<span>DESIGN WITH INTENT</span><b>✦</b><span>CODE WITH CURIOSITY</span><b>✦</b><span>MADE TO FEEL SOMETHING</span><b>✦</b>').join('')+'</div>';
  hero.append(ticker);
  document.body.classList.add('experience-ready');
  // Load real 3D only after the content is usable; Canvas remains the fallback.
  let sculptureRequested = false;
  function loadSculpture() {
    if (sculptureRequested || document.querySelector('dialog[open]') || navigator.connection?.saveData) return;
    const box = hero.getBoundingClientRect();
    if (box.right <= 0 || box.left >= innerWidth || box.bottom <= 0 || box.top >= innerHeight) return;
    sculptureRequested = true;
    const load = () => import('./sculpture.js').then(module => module.mountSculpture(hero)).catch(() => {});
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1800 }); else setTimeout(load, 500);
  }
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadSculpture(); }).observe(hero);
  document.querySelector('#project-dialog').addEventListener('close', loadSculpture);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-inview', entry.isIntersecting));
  }, { threshold: .18 });
  document.querySelectorAll('.project-panel').forEach(panel => {
    observer.observe(panel);
    panel.addEventListener('pointermove', event => {
      if (!finePointer.matches || motion.matches) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--tilt-x', `${((event.clientX - rect.left) / rect.width - .5) * 15}deg`);
      panel.style.setProperty('--tilt-y', `${-((event.clientY - rect.top) / rect.height - .5) * 15}deg`);
    });
    panel.addEventListener('pointerleave', () => { panel.style.setProperty('--tilt-x', '0deg'); panel.style.setProperty('--tilt-y', '0deg'); });
  });
  const cursor = document.createElement('div'); cursor.className = 'experience-cursor'; cursor.setAttribute('aria-hidden', 'true'); document.body.append(cursor);
  document.addEventListener('pointermove', event => {
    const target = event.target.closest('.project-hit,.chrome-canvas');
    const visible = target && finePointer.matches && !motion.matches && !document.querySelector('dialog[open]');
    cursor.classList.toggle('cursor-visible', !!visible);
    if (!visible) return;
    cursor.textContent = target.matches('.project-hit') ? 'EXPLORE' : 'DRAG';
    cursor.style.transform = `translate(${event.clientX + 18}px,${event.clientY + 18}px)`;
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) cursor.classList.remove('cursor-visible'); });
  document.addEventListener('portfolio-motion', event => { if (event.detail.paused) cursor.classList.remove('cursor-visible'); });
}
