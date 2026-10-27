import { recordArtwork, records } from './record-artwork.js';
import { createProjectClock } from './project-clock.js';
import { createOrbitCanvas } from './orbit-canvas.js';
import { artwork } from './artwork.js';
import '@fontsource/dm-sans/latin-400-italic.css';
import './demos.css';

const labels = ['Shape the sound.', 'Make it your own.', 'Find your golden hour.', 'Put a different spin on it.'];

/** Interactive, original concept demos. Disposed whenever a case study closes. */
export function mountDemo(root, index) {
  const controller = new AbortController();
  const { signal } = controller;
  const listen = (element, event, handler) => element.addEventListener(event, handler, { signal });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let sculpture = null, disposed = false;
  let orbitMode='orbit';
  let sound=null,soundEnabled=false,selectedTrack=0;
  root.className = `demo-shell demo-${index}`;
  root.innerHTML = `<div class="demo-topline"><span><i></i> INTERACTIVE CONCEPT / 0${index + 1}</span><span>PLAY A LITTLE</span></div><div class="demo-stage"></div><div class="demo-controls"></div><p class="demo-instruction">${labels[index]}</p>`;
  const stage = root.querySelector('.demo-stage');
  const controls = root.querySelector('.demo-controls');
  let drawFrame = () => {};
  let active = false, inView = true, paused = reduced.matches;
  const clock = createProjectClock((t, delta) => drawFrame(t, delta));
  function syncMotion() {
    const moving = !paused && inView && !document.hidden;
    stage.classList.toggle('motion-playing', moving);
    clock.setVisible(inView);
    clock.setRunning(active && !paused && !sculpture);
    sculpture?.setPaused(paused);
  }
  function animate(draw) {
    active = true; drawFrame = draw; clock.invalidate(); syncMotion();
  }
  listen(document, 'visibilitychange', syncMotion);
  function bindPause(button) {
    function sync() {
      button.textContent = paused ? 'Play motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(!paused));
      syncMotion();
    }
    listen(button, 'click', () => { paused = !paused; sync(); });
    const onPreference = () => { paused = reduced.matches; sync(); };
    reduced.addEventListener('change', onPreference);
    cleanups.push(() => reduced.removeEventListener('change', onPreference));
    sync();
  }
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncMotion(); });
  observer.observe(stage);
  cleanups.push(() => observer.disconnect());

  if (index === 0) {
    stage.innerHTML = '<canvas aria-hidden="true"></canvas><div class="orbit-demo-title">ORBIT<span>SOUND, REIMAGINED.</span></div>';
    controls.innerHTML = '<div class="orbit-modes" role="group" aria-label="Signal mode"><button data-mode="wave" aria-pressed="false">Wave</button><button data-mode="orbit" aria-pressed="true">Orbit</button><button data-mode="interference" aria-pressed="false">Interference</button></div><label>Tempo <input aria-label="Orbit tempo" type="range" min="0.3" max="2" step="0.1" value="1"></label><button class="burst">Remix shape</button><button class="motion-toggle"></button>';
    let x = 0, y = 0, remix = 0;
    const tempo = controls.querySelector('input');
    const fallback = createOrbitCanvas(stage.querySelector('canvas'), () => ({
      mode: orbitMode, x, y, remix, tempo: Number(tempo.value), paused,
    }));
    const draw = fallback.draw;
    cleanups.push(() => fallback.dispose());
    controls.querySelectorAll('[data-mode]').forEach(button => listen(button, 'click', () => {
      orbitMode = button.dataset.mode; stage.dataset.mode = orbitMode; sculpture?.setMode(orbitMode);
      controls.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      stage.querySelector('.orbit-demo-title span').textContent = {
        wave:'FOLLOW THE FREQUENCY.', orbit:'SOUND, REIMAGINED.', interference:'FIND YOUR OWN SIGNAL.',
      }[orbitMode];
      draw(clock.elapsed);
    }));
    stage.dataset.mode = 'orbit';
    listen(stage, 'pointermove', event => {
      if (reduced.matches) return;
      const r = stage.getBoundingClientRect(); x = (event.clientX - r.left) / r.width - .5; y = (event.clientY - r.top) / r.height - .5;
      if (paused) draw(clock.elapsed);
    });
    listen(stage, 'pointerleave', () => { x = y = 0; if (paused) draw(clock.elapsed); });
    listen(tempo, 'input', () => { draw(clock.elapsed); sculpture?.setTempo(tempo.value); });
    listen(controls.querySelector('.burst'), 'click', () => { remix += .9; draw(clock.elapsed); sculpture?.remix(); });
    bindPause(controls.querySelector('.motion-toggle')); animate(draw);
  }

  if (index === 1) {
    stage.innerHTML = `<div class="demo-ceramics art-form">${artwork[1][1]}<span class="ceramic-edition">THE EVERYDAY COLLECTION / 001</span></div>`;
    controls.innerHTML = '<div class="finish-picker" role="group" aria-label="Ceramic finish"><span>Finish</span><button data-color="sand" aria-label="Sand finish" aria-pressed="true"></button><button data-color="sage" aria-label="Sage finish" aria-pressed="false"></button><button data-color="clay" aria-label="Clay finish" aria-pressed="false"></button><button data-color="ink" aria-label="Ink finish" aria-pressed="false"></button></div><label>Turn <input aria-label="Turn ceramics" type="range" min="-30" max="30" value="0"></label><output aria-live="polite">Sand / 01</output>';
    for (const button of controls.querySelectorAll('[data-color]')) listen(button, 'click', () => {
      stage.dataset.finish = button.dataset.color;
      sculpture?.setFinish(button.dataset.color);
      controls.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const name = button.dataset.color; controls.querySelector('output').textContent = `${name[0].toUpperCase() + name.slice(1)} / 01`;
    });
    listen(controls.querySelector('input'), 'input', event => { stage.style.setProperty('--turn', `${event.target.value}deg`); sculpture?.setTurn(event.target.value); });
    stage.dataset.finish = 'sand';
    const onPreference = () => { paused = reduced.matches; syncMotion(); };
    reduced.addEventListener('change', onPreference);
    cleanups.push(() => reduced.removeEventListener('change', onPreference));
  }

  if (index === 2) {
    stage.innerHTML = '<div class="demo-landscape"><span class="landscape-note">LESS SIGNAL. MORE FEELING.</span><div class="landscape-stars"></div><div class="landscape-sun"></div><div class="landscape-ridge ridge-far"></div><div class="landscape-ridge ridge-near"></div><div class="landscape-ridge ridge-front"></div><div class="landscape-word">offgrid.</div><span class="landscape-coordinate">46°35′ N / 12°18′ E</span><span class="landscape-hour">12:00 / DAYLIGHT</span></div>';
    controls.innerHTML = '<label class="time-picker">Time of day <input aria-label="Landscape time of day" type="range" min="0" max="100" value="35"></label><div class="time-presets" role="group" aria-label="Time presets"><button data-time="10">Dawn</button><button data-time="35">Day</button><button data-time="65">Dusk</button><button data-time="100">Night</button></div>';
    const range = controls.querySelector('input');
    function update(value) {
      const v = Number(value); range.value = String(v);
      stage.style.setProperty('--night', String(v / 100));
      stage.style.setProperty('--sun-y', `${v * 1.5}px`);
      stage.style.setProperty('--sun-x', `${v * .8}px`);
      const period = v < 20 ? 'DAWN' : v < 55 ? 'DAYLIGHT' : v < 82 ? 'GOLDEN HOUR' : 'NIGHTFALL';
      stage.querySelector('.landscape-hour').textContent = `${String(Math.round(6 + v * .17)).padStart(2, '0')}:00 / ${period}`;
      controls.querySelectorAll('[data-time]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.time) === v)));
    }
    listen(range, 'input', event => update(event.target.value));
    controls.querySelectorAll('[data-time]').forEach(button => listen(button, 'click', () => update(button.dataset.time)));
    listen(stage, 'pointermove', event => { const box = stage.getBoundingClientRect(); stage.style.setProperty('--parallax', `${((event.clientX - box.left) / box.width - .5) * 25}px`); });
    listen(stage, 'pointerleave', () => stage.style.setProperty('--parallax', '0px'));
    update(35);
  }

  if (index === 3) {
    stage.innerHTML = '<div class="demo-record"><div class="record-artwork">'+records.map((_, i) => `<div class="record-layer${i === 0 ? ' is-selected' : ''}" data-cover="${i}">${recordArtwork(i)}</div>`).join('')+'</div><span class="record-kicker">GOOD NOISE / INDEPENDENT CULTURE</span><div class="record-copy">FEEL<br>THE<br><em>FREQUENCY.</em></div><div class="record-turntable"><div class="record-vinyl"><span>GN<span>01</span></span></div><div class="record-needle"></div></div><div class="record-bars" aria-hidden="true">'+Array.from({ length: 28 }, (_, i) => `<i style="--i:${i}"></i>`).join('')+'</div><span class="record-caption" role="status">01 — AFTER HOURS</span></div>';
    controls.innerHTML = '<button class="motion-toggle"></button><div class="record-tracks" role="group" aria-label="Visual record selection"><button data-track="0" aria-pressed="true">01</button><button data-track="1" aria-pressed="false">02</button><button data-track="2" aria-pressed="false">03</button></div><button class="sound-toggle" aria-pressed="false">Enable sound</button><span class="visual-only" role="status">SOUND OFF</span>';
    listen(document,'visibilitychange',()=>{sound?.setEnabled(soundEnabled&&!document.hidden).catch(()=>{});});
    stage.dataset.track = '0';
    controls.querySelectorAll('[data-track]').forEach(button => listen(button, 'click', () => {
      const n = Number(button.dataset.track); selectedTrack = n; sound?.setTrack(n); stage.dataset.track = String(n);
      stage.querySelectorAll('.record-layer').forEach((layer, i) => layer.classList.toggle('is-selected', i === n));
      stage.querySelector('.record-copy').innerHTML = records[n].copy;
      stage.querySelector('.record-caption').textContent = `0${n + 1} — ${records[n].name}`;
      stage.querySelector('.record-vinyl>span>span').textContent = `0${n + 1}`;
      controls.querySelectorAll('[data-track]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      clock.invalidate();
    }));
    listen(controls.querySelector('.sound-toggle'),'click',async()=>{
      const button=controls.querySelector('.sound-toggle');button.disabled=true;
      try {
        if(!sound){const module=await import('./record-audio.js');if(disposed)return;sound=module.createRecordAudio();sound.setTrack(selectedTrack);}
        soundEnabled=!soundEnabled;await sound.setEnabled(soundEnabled);
        if(disposed)return;
        button.textContent=soundEnabled?'Mute sound':'Enable sound';button.setAttribute('aria-pressed',String(soundEnabled));
        controls.querySelector('.visual-only').textContent=soundEnabled?'GENERATIVE AUDIO / ON':'SOUND OFF';
      } catch {soundEnabled=false;controls.querySelector('.visual-only').textContent='Audio unavailable';}
      finally {button.disabled=false;}
    });
    listen(stage,'pointermove',event=>{if(reduced.matches)return;const r=stage.getBoundingClientRect();stage.style.setProperty('--cover-x',`${((event.clientX-r.left)/r.width-.5)*12}px`);});
    listen(stage, 'pointerleave', () => stage.style.setProperty('--cover-x', '0px'));
    bindPause(controls.querySelector('.motion-toggle'));
    let recordAngle = 0;
    animate((t, delta) => {
      const record = records[selectedTrack];
      recordAngle += delta * record.speed;
      stage.style.setProperty('--record-angle', `${recordAngle}deg`);
      stage.style.setProperty('--beat', String((Math.sin(t * record.rhythm * 3) + 1) / 2));
      stage.style.setProperty('--cover-angle', `${t * 3}deg`);
      stage.style.setProperty('--cover-sway', `${Math.sin(t * record.rhythm) * 9}px`);
      stage.style.setProperty('--cover-scale', String(1 + Math.sin(t * .65) * .035));
    });
  }
  if (index < 2 && !navigator.connection?.saveData) {
    import('./sculpture.js').then(module => {
      if (disposed) return;
      sculpture = module.mountProjectSculpture(stage, index, { onFallback: () => { sculpture = null; clock.invalidate(); syncMotion(); } });
      syncMotion();
      if (index === 0) { sculpture?.setTempo(controls.querySelector('input').value);sculpture?.setMode(orbitMode); }
      else { sculpture?.setFinish(stage.dataset.finish); sculpture?.setTurn(controls.querySelector('input').value); }
    }).catch(() => {});
  }
  return () => { disposed = true; sound?.dispose();sculpture?.dispose(); controller.abort(); clock.dispose(); cleanups.forEach(fn => fn()); };
}

export function observePreviews() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('preview-live', entry.isIntersecting));
  });
  document.querySelectorAll('.project-preview').forEach(el => observer.observe(el));
}
