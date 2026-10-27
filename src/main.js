import '@fontsource/anton/latin-400.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './style.css';
import { artwork } from './artwork.js';
import { mountDemo, observePreviews } from './demos.js';
import { profile, projects } from './data.js';
import { createPlayground } from './playground.js';

const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 20 4M4 4h16v16"/></svg>';
const projectPanels = document.querySelector('#project-panels');
const archive = document.querySelector('#archive-list');
// Artwork is local, developer-authored SVG/CSS markup, not user-provided HTML.
projects.forEach((project, index) => {
  const panel = document.createElement('article');
  panel.className = 'panel project-panel'; panel.id = project.id;
  panel.style.setProperty('--accent', project.accent);
  panel.style.setProperty('--secondary', project.secondary);
  panel.style.setProperty('--mobile-title', `${Math.min(12.4, 180 / Math.max(...project.lines.map(line => line.length)))}vw`);
  panel.setAttribute('aria-labelledby', `${project.id}-title`);
  panel.innerHTML = `<div class="shape shape-circle"></div><div class="shape shape-triangle"></div><div class="shape shape-dot"></div><div class="shape shape-ring"></div><span class="project-index">0${index + 1} / ${project.year} — CONCEPT PROJECT</span><div class="project-preview" aria-hidden="true"><div class="project-art ${artwork[index][0]}">${artwork[index][1]}</div></div><h2 class="project-heading" id="${project.id}-title"><span>${project.lines[0]}</span><span>${project.lines[1]}</span></h2><p class="project-caption">${project.caption}</p><button class="project-hit" aria-label="View ${project.name} project"><span>Try the live concept ${arrow}</span></button>`;
  panel.querySelector('button').addEventListener('click', () => navigateToProject(index));
  projectPanels.append(panel);
  const button = document.createElement('button');
  button.innerHTML = `<span>0${index + 1}</span><strong>${project.name}</strong><span>${project.year} ${arrow}</span>`;
  button.setAttribute('aria-label', `View ${project.name} project`);
  button.addEventListener('click', () => navigateToProject(index)); archive.append(button);
});

observePreviews();

document.querySelectorAll('a[href="mailto:endyj@dev.com"]').forEach(link => {
  link.href = `mailto:${profile.email}`;
  if (link.classList.contains('email-link')) link.firstChild.textContent = profile.email + ' ';
});
document.querySelectorAll('.nav-brand').forEach(el => { el.textContent = profile.name; });
document.querySelector('#year').textContent = new Date().getFullYear();
const mobile = matchMedia('(max-width: 700px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const workTrack = document.querySelector('#work-track');
const aboutTrack = document.querySelector('#about-track');
const nextButton = document.querySelector('#next-panel');
const previousButton = document.querySelector('#previous-panel');
const dialog = document.querySelector('#project-dialog');
const content = document.querySelector('#project-content');
const workLink = document.querySelector('.site-nav a[href="#work"]');
const aboutLink = document.querySelector('.site-nav a[href="#about"]');
let isAbout = false, lastWorkPosition = 0, lastAboutPosition = 0;
let projectReturnHash = '#work', focusReturn = null;
let activeProject = 0;
let lastScrollTime = 0;
const currentTrack = () => isAbout ? aboutTrack : workTrack;
const panels = () => [...currentTrack().querySelectorAll('.panel')];
const position = () => mobile.matches ? window.scrollY : currentTrack().scrollLeft;
const panelPosition = (element) => mobile.matches
  ? element.getBoundingClientRect().top + window.scrollY
  : element.getBoundingClientRect().left - currentTrack().getBoundingClientRect().left + currentTrack().scrollLeft;
function scrollToPosition(value, smooth = true) {
  const options = { behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' };
  if (mobile.matches) window.scrollTo({ top: value, ...options });
  else currentTrack().scrollTo({ left: value, ...options });
}
function showTrack(about) {
  if (isAbout === about) return;
  if (isAbout) lastAboutPosition = position(); else lastWorkPosition = position();
  isAbout = about; workTrack.hidden = about; aboutTrack.hidden = !about;
  aboutLink.toggleAttribute('aria-current', about);
  workLink.toggleAttribute('aria-current', !about);
  if (about) aboutLink.setAttribute('aria-current', 'page'); else workLink.setAttribute('aria-current', 'page');
  document.querySelector('meta[name="theme-color"]').content = about ? '#8a36d9' : '#ff400a';
  document.title = about ? `About — ${profile.name}` : `${profile.name} — Creative Development`;
  scrollToPosition(about ? lastAboutPosition : lastWorkPosition, false);
  updateControls();
}
function nearestPanel() {
  const all = panels();
  const current = position();
  let selected = 0, distance = Infinity;
  all.forEach((panel, i) => {
    const delta = Math.abs(panelPosition(panel) - current);
    if (delta < distance) { selected = i; distance = delta; }
  });
  return selected;
}
function updateControls() {
  const all = panels(), index = nearestPanel();
  const panelAt = (x) => all.find(panel => { const r = panel.getBoundingClientRect(); return x >= r.left && x <= r.right && innerHeight - 45 >= r.top && innerHeight - 45 <= r.bottom; });
  const isDark = panel => !!panel?.matches('.hero,.about-hero,.archive');
  document.querySelector('.site-nav').classList.toggle('on-dark', isDark(panelAt(innerWidth * .06)));
  document.querySelector('.page-controls').classList.toggle('on-dark', isDark(panelAt(innerWidth * .94)));
  previousButton.hidden = index === 0;
  nextButton.hidden = index === all.length - 1;
  document.querySelector('#position-label').textContent = `${String(index + 1).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}`;
  const max = mobile.matches ? document.documentElement.scrollHeight - innerHeight : currentTrack().scrollWidth - currentTrack().clientWidth;
  document.querySelector('.progress span').style.width = `${max > 0 ? position() / max * 100 : 0}%`;
}
function movePanel(direction) {
  const all = panels(); const index = Math.max(0, Math.min(all.length - 1, nearestPanel() + direction));
  scrollToPosition(panelPosition(all[index]));
}
nextButton.addEventListener('click', () => movePanel(1));
previousButton.addEventListener('click', () => movePanel(-1));
[workTrack, aboutTrack].forEach(track => {
  track.addEventListener('wheel', (event) => {
    if (mobile.matches || dialog.open || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const scale = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerWidth : 1;
    track.scrollLeft += event.deltaY * scale;
  }, { passive: false });
  track.addEventListener('scroll', () => {
    if (track !== currentTrack()) return;
    if (performance.now() - lastScrollTime > 50) { updateControls(); lastScrollTime = performance.now(); }
  }, { passive: true });
  track.addEventListener('scrollend', updateControls);
});
window.addEventListener('scroll', updateControls, { passive: true });
window.addEventListener('resize', updateControls);
mobile.addEventListener('change', () => {
  lastWorkPosition = lastAboutPosition = 0; scrollToPosition(0, false); updateControls();
});
document.addEventListener('keydown', (event) => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); movePanel(event.key === 'ArrowRight' ? 1 : -1);
  } else if (event.key === 'Home' && event.target === currentTrack()) {
    event.preventDefault(); scrollToPosition(0);
  } else if (event.key === 'End' && event.target === currentTrack()) {
    event.preventDefault(); scrollToPosition(panelPosition(panels().at(-1)));
  }
});

function navigateToProject(index) {
  if (!dialog.open) { projectReturnHash = location.hash || '#work'; focusReturn = document.activeElement; }
  location.hash = `project/${projects[index].id}`;
}
let disposeDemo = () => {};
function renderProject(index) {
  disposeDemo();
  activeProject = index;
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  content.innerHTML = `<div class="detail-header"><p class="detail-label">0${index + 1} / ${project.year} / Self-initiated concept</p><h2 class="detail-title" id="detail-title">${project.name}</h2><p class="detail-description">${project.description}</p></div><div id="interactive-demo"></div><div class="detail-meta"><div><strong>Services</strong>${project.services}</div><div><strong>Year</strong>${project.year}</div><div><strong>Status</strong>Self-initiated concept</div></div><div class="detail-body"><h3>The approach</h3><div><p>${project.approach}</p><p>${project.outcome}</p></div></div><div class="detail-bottom"><span>Next project / 0${(index + 1) % projects.length + 1}</span><button class="detail-next">${next.name} ${arrow}</button></div>`;
  disposeDemo = mountDemo(content.querySelector('#interactive-demo'), index);
  content.querySelector('.detail-next').addEventListener('click', () => navigateToProject((activeProject + 1) % projects.length));
  document.title = `${project.name} — ${profile.name}`;
  if (!dialog.open) {
    dialog.showModal(); document.body.classList.add('is-dialog-open');
    document.body.style.overflow = 'hidden';
  }
  dialog.scrollTop = 0;
  document.querySelector('.close-dialog').focus({ preventScroll: true });
}
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  disposeDemo();
  document.body.classList.remove('is-dialog-open'); document.body.style.overflow = '';
  if (location.hash.startsWith('#project/')) history.replaceState(null, '', projectReturnHash);
  document.title = isAbout ? `About — ${profile.name}` : `${profile.name} — Creative Development`;
  focusReturn?.focus({ preventScroll: true });
});
function renderRoute() {
  const hash = location.hash.slice(1);
  if (hash.startsWith('project/')) {
    const index = projects.findIndex(project => project.id === hash.slice(8));
    if (index !== -1) { showTrack(false); renderProject(index); return; }
    history.replaceState(null, '', '#work');
  }
  if (dialog.open) dialog.close();
  if (['about', 'bio', 'contact'].includes(hash)) {
    showTrack(true);
    if (hash !== 'about') scrollToPosition(panelPosition(document.getElementById(hash)));
    else scrollToPosition(0);
  } else {
    showTrack(false);
    if (hash === 'home' || !hash) scrollToPosition(0);
    else if (hash === 'selected') scrollToPosition(panelPosition(document.querySelector('#selected')));
  }
  updateControls();
}
window.addEventListener('hashchange', renderRoute);
// Clicking an already-active anchor should still return to its section.
document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', () => {
  if (anchor.hash === location.hash) renderRoute();
}));
renderRoute();
const heroSimulation = createPlayground(document.querySelector('#playground'), { reducedMotion: reducedMotion.matches });
const aboutSimulation = createPlayground(document.querySelector('#about-playground'), { star: true, reducedMotion: reducedMotion.matches });
let manuallyPaused = false;
const pauseButtons = [...document.querySelectorAll('.play-toggle')];
function updateAnimation() {
  const paused = manuallyPaused || reducedMotion.matches;
  document.body.classList.toggle('motion-paused', paused);
  heroSimulation.setPaused(paused); aboutSimulation.setPaused(paused);
  pauseButtons.forEach(pauseButton => {
  pauseButton.hidden = reducedMotion.matches;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? 'Play background animation' : 'Pause background animation');
  pauseButton.innerHTML = paused ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 8 6-8 6Z"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4v12M13 4v12"/></svg>';
  });
}
pauseButtons.forEach(button => button.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateAnimation(); }));
reducedMotion.addEventListener('change', updateAnimation); updateAnimation();
let copyTimer;
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status'); clearTimeout(copyTimer);
  try { await navigator.clipboard.writeText(profile.email); status.textContent = 'Email copied. Say hello!'; }
  catch { status.textContent = `Copy this address: ${profile.email}`; }
  copyTimer = setTimeout(() => { status.textContent = ''; }, 5000);
});
updateControls();
