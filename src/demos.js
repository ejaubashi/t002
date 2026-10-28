import { recordArtwork, records } from './record-artwork.js';
import { createProjectClock } from './project-clock.js';
import { createOrbitCanvas } from './orbit-canvas.js';
import { bindHorizontalDrag } from './project-gestures.js';
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
  let active = false, inView = true, paused = reduced.matches, manipulating = false;
  const clock = createProjectClock((t, delta) => drawFrame(t, delta));
  function syncMotion() {
    const artworkVisible = !stage.classList.contains('sleeve-flipped');
    const moving = !paused && !manipulating && artworkVisible && inView && !document.hidden;
    stage.classList.toggle('motion-playing', moving);
    clock.setVisible(inView);
    clock.setRunning(active && !paused && !sculpture && !manipulating && artworkVisible);
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
    controls.innerHTML = '<div class="orbit-modes" role="group" aria-label="Signal mode"><button data-mode="wave" aria-pressed="false">Wave</button><button data-mode="orbit" aria-pressed="true">Orbit</button><button data-mode="interference" aria-pressed="false">Interference</button></div><label>Tempo <input aria-label="Orbit tempo" type="range" min="0.3" max="2" step="0.1" value="1"></label><button class="burst">Remix shape</button><button class="signal-pulse">Pulse signal</button><button class="motion-toggle"></button>';
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
    stage.tabIndex = 0; stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', 'Orbit signal. Tap to pulse; arrow keys move the lens.');
    stage.insertAdjacentHTML('beforeend', '<span class="stage-gesture-hint" aria-hidden="true">TAP TO PULSE / MOVE TO BEND</span>');
    function pulse() { remix += .18; sculpture?.pulse(); draw(clock.elapsed); }
    listen(controls.querySelector('.signal-pulse'), 'click', pulse);
    listen(stage, 'click', pulse);
    listen(stage, 'keydown', event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Enter' || event.key === ' ') { pulse(); return; }
      x = Math.max(-.45, Math.min(.45, x + (event.key === 'ArrowLeft' ? -.1 : event.key === 'ArrowRight' ? .1 : 0)));
      y = Math.max(-.45, Math.min(.45, y + (event.key === 'ArrowUp' ? -.1 : event.key === 'ArrowDown' ? .1 : 0)));
      sculpture?.setPointer(x, y); draw(clock.elapsed);
    });
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
    controls.innerHTML = '<div class="finish-picker" role="group" aria-label="Ceramic finish"><span>Finish</span><button data-color="sand" aria-label="Sand finish" aria-pressed="true"></button><button data-color="sage" aria-label="Sage finish" aria-pressed="false"></button><button data-color="clay" aria-label="Clay finish" aria-pressed="false"></button><button data-color="ink" aria-label="Ink finish" aria-pressed="false"></button></div><label>Turn <input aria-label="Turn ceramics" type="range" min="-30" max="30" value="0"></label><output aria-live="polite">Sand / 01</output><button class="inspect-form" aria-pressed="false">Inspect form</button>';
    for (const button of controls.querySelectorAll('[data-color]')) listen(button, 'click', () => {
      stage.dataset.finish = button.dataset.color;
      sculpture?.setFinish(button.dataset.color);
      controls.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const name = button.dataset.color; controls.querySelector('output').textContent = `${name[0].toUpperCase() + name.slice(1)} / 01`;
    });
    listen(controls.querySelector('input'), 'input', event => { stage.style.setProperty('--turn', `${event.target.value}deg`); sculpture?.setTurn(event.target.value); });
    stage.insertAdjacentHTML('beforeend', '<span class="stage-gesture-hint" aria-hidden="true">DRAG TO TURN / EXPLORE THE FINISH</span>');
    const turnRange = controls.querySelector('input');
    let startTurn = 0;
    function setTurn(value) {
      const angle = Math.max(-30, Math.min(30, Math.round(value)));
      turnRange.value = String(angle); stage.style.setProperty('--turn', `${angle}deg`); sculpture?.setTurn(angle);
    }
    bindHorizontalDrag(stage, {
      onStart: () => { startTurn = Number(turnRange.value); },
      onMove: ({ dx }) => setTurn(startTurn + dx * .25),
    }, signal);
    listen(controls.querySelector('.inspect-form'), 'click', event => {
      const selected = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      event.currentTarget.setAttribute('aria-pressed', String(selected));
      event.currentTarget.textContent = selected ? 'View collection' : 'Inspect form';
      stage.classList.toggle('is-inspecting', selected); sculpture?.setInspection(selected);
    });
    stage.dataset.finish = 'sand';
    const onPreference = () => { paused = reduced.matches; syncMotion(); };
    reduced.addEventListener('change', onPreference);
    cleanups.push(() => reduced.removeEventListener('change', onPreference));
  }

  if (index === 2) {
    stage.innerHTML = '<div class="demo-landscape"><span class="landscape-note">LESS SIGNAL. MORE FEELING.</span><div class="landscape-stars"></div><div class="landscape-clouds" aria-hidden="true"><i></i><i></i><i></i></div><div class="landscape-moon" aria-hidden="true"></div><div class="landscape-sun"></div><div class="landscape-ridge ridge-far"></div><div class="landscape-ridge ridge-near"></div><div class="landscape-ridge ridge-front"></div><div class="landscape-word">offgrid.</div><span class="landscape-coordinate">46°35′ N / 12°18′ E</span><span class="landscape-hour">12:00 / DAYLIGHT</span></div>';
    controls.innerHTML = '<label class="time-picker">Time of day <input aria-label="Landscape time of day" type="range" min="0" max="100" value="35"></label><div class="time-presets" role="group" aria-label="Time presets"><button data-time="10">Dawn</button><button data-time="35">Day</button><button data-time="65">Dusk</button><button data-time="100">Night</button></div><button class="motion-toggle"></button>';
    const range = controls.querySelector('input');
    const atmospheres = [
      { time:10, colors:['#b9a7b7','#f5c9a1','#a697a0','#796f7b','#484c54'] },
      { time:35, colors:['#9bb9bf','#f0d6a3','#78928c','#3e645a','#203d35'] },
      { time:65, colors:['#877296','#e9ab86','#9b7f91','#6a617b','#3e485e'] },
      { time:100,colors:['#101d3b','#68607f','#555877','#363d5b','#202c44'] },
    ];
    function blendColor(a, b, amount) {
      const rgb = hex => [1,3,5].map(n => parseInt(hex.slice(n,n+2),16));
      const aa = rgb(a), bb = rgb(b);
      return `rgb(${aa.map((channel, i) => Math.round(channel + (bb[i]-channel)*amount)).join(',')})`;
    }
    function update(value) {
      const v = Math.max(0, Math.min(100, Math.round(Number(value)))); range.value = String(v);
      const right = atmospheres.findIndex(preset => preset.time >= v);
      const to = atmospheres[right < 0 ? atmospheres.length - 1 : right];
      const from = atmospheres[Math.max(0, right - 1)];
      const amount = to === from ? 0 : (v-from.time)/(to.time-from.time);
      ['--sky-top','--sky-bottom','--ridge-far','--ridge-near','--ridge-front'].forEach((name,i) => stage.style.setProperty(name,blendColor(from.colors[i],to.colors[i],amount)));
      stage.style.setProperty('--sun-left', `${12 + v * .68}%`);
      stage.style.setProperty('--sun-top', `${55 - Math.sin(v/100*Math.PI)*49}%`);
      stage.style.setProperty('--moon', String(Math.max(0, (v-65)/35)));
      stage.style.setProperty('--star-visibility', String(Math.max(0, (v-55)/45)));
      stage.style.setProperty('--night', String(v / 100));
      stage.style.setProperty('--sun-y', `${v * 1.5}px`);
      stage.style.setProperty('--sun-x', `${v * .8}px`);
      const period = v < 20 ? 'DAWN' : v < 55 ? 'DAYLIGHT' : v < 82 ? 'GOLDEN HOUR' : 'NIGHTFALL';
      stage.querySelector('.landscape-hour').textContent = `${String(Math.round(6 + v * .17)).padStart(2, '0')}:00 / ${period}`;
      controls.querySelectorAll('[data-time]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.time) === v)));
    }
    listen(range, 'input', event => update(event.target.value));
    listen(range, 'pointerdown', () => stage.classList.add('is-scrubbing'));
    listen(range, 'pointerup', () => stage.classList.remove('is-scrubbing'));
    listen(range, 'pointercancel', () => stage.classList.remove('is-scrubbing'));
    controls.querySelectorAll('[data-time]').forEach(button => listen(button, 'click', () => update(button.dataset.time)));
    listen(stage, 'pointermove', event => {
      if (reduced.matches || event.pointerType === 'touch') return;
      const box = stage.getBoundingClientRect(); stage.style.setProperty('--parallax', `${((event.clientX - box.left) / box.width - .5) * 25}px`);
    });
    listen(stage, 'pointerleave', () => stage.style.setProperty('--parallax', '0px'));
    let startTime = 35;
    bindHorizontalDrag(stage, {
      onStart: () => { startTime = Number(range.value); },
      onMove: ({ dx }) => update(startTime + dx / stage.clientWidth * 100),
    }, signal);
    stage.tabIndex = 0; stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', 'Offgrid landscape. Drag horizontally or use arrow keys to change the time of day.');
    stage.insertAdjacentHTML('beforeend', '<span class="stage-gesture-hint" aria-hidden="true">DRAG THE HORIZON / FIND YOUR HOUR</span>');
    listen(stage, 'keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      update(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Number(range.value) + (event.key === 'ArrowRight' ? 5 : -5));
    });
    bindPause(controls.querySelector('.motion-toggle'));
    animate(t => stage.style.setProperty('--wind', `${Math.sin(t * .12) * 30}px`));
    update(35);
  }

  if (index === 3) {
    stage.innerHTML = '<div class="demo-record"><div class="record-artwork">'+records.map((_, i) => `<div class="record-layer${i === 0 ? ' is-selected' : ''}" data-cover="${i}">${recordArtwork(i)}</div>`).join('')+'</div><span class="record-kicker">GOOD NOISE / INDEPENDENT CULTURE</span><div class="record-copy">FEEL<br>THE<br><em>FREQUENCY.</em></div><div class="record-turntable"><div class="record-vinyl"><span>GN<span>01</span></span></div><div class="record-needle"></div></div><div class="record-bars" aria-hidden="true">'+Array.from({ length: 28 }, (_, i) => `<i style="--i:${i}"></i>`).join('')+'</div><span class="record-caption" role="status">01 — AFTER HOURS</span></div>';
    controls.innerHTML = '<button class="motion-toggle"></button><div class="record-tracks" role="group" aria-label="Visual record selection"><button data-track="0" aria-pressed="true">01</button><button data-track="1" aria-pressed="false">02</button><button data-track="2" aria-pressed="false">03</button></div><button class="flip-sleeve" aria-pressed="false">Flip sleeve</button><button class="sound-toggle" aria-pressed="false">Enable sound</button><span class="visual-only" role="status">SOUND OFF</span>';
    const front = stage.querySelector('.demo-record');
    const sleeve = document.createElement('div'); sleeve.className = 'record-sleeve';
    stage.append(sleeve); sleeve.append(front);
    const back = document.createElement('div'); back.className = 'record-sleeve-back';
    back.innerHTML = '<span class="sleeve-edition">GOOD NOISE / SIDE B</span><h3>AFTER HOURS</h3><p class="sleeve-notes"></p><span class="sleeve-colophon">INDEPENDENT CULTURE.<br>TURN IT OVER. LOOK A LITTLE CLOSER.</span><div class="sleeve-mark" aria-hidden="true">GN</div>';
    sleeve.append(back); back.inert = true; back.setAttribute('aria-hidden', 'true');
    const notes = [
      'A late-night current. Flowing ribbons trace the rhythm, with bold condensed type and a warm rose sleeve.',
      'Room to breathe. A slow rosette opens and turns behind soft italic lettering and a quiet sage palette.',
      'An angular pulse. Stepped vectors cut across the sleeve, with tilted type and a bright lime center.',
    ];
    back.querySelector('.sleeve-notes').textContent = notes[0];
    stage.insertAdjacentHTML('beforeend', '<span class="stage-gesture-hint" aria-hidden="true">DRAG THE VINYL / FLIP THE SLEEVE</span>');
    listen(controls.querySelector('.flip-sleeve'), 'click', event => {
      const flipped = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      event.currentTarget.setAttribute('aria-pressed', String(flipped));
      event.currentTarget.textContent = flipped ? 'Back to artwork' : 'Flip sleeve';
      stage.classList.toggle('sleeve-flipped', flipped);
      front.inert = flipped; front.setAttribute('aria-hidden', String(flipped));
      back.inert = !flipped; back.setAttribute('aria-hidden', String(!flipped));
      syncMotion();
    });
    const vinyl = stage.querySelector('.record-vinyl');
    vinyl.tabIndex = 0; vinyl.setAttribute('role', 'slider'); vinyl.setAttribute('aria-label', 'Record rotation');
    vinyl.setAttribute('aria-valuemin', '0'); vinyl.setAttribute('aria-valuemax', '359');
    let recordAngle = 0, startAngle = 0, scratchVelocity = 0;
    function setRecordAngle(value) {
      recordAngle = value;
      stage.style.setProperty('--record-angle', `${recordAngle}deg`);
      vinyl.setAttribute('aria-valuenow', String(Math.round((value % 360 + 360) % 360) % 360));
    }
    setRecordAngle(0);
    bindHorizontalDrag(vinyl, {
      onStart: () => { startAngle = recordAngle; manipulating = true; scratchVelocity = 0; syncMotion(); },
      onMove: ({ dx }) => { const next = startAngle + dx * 1.15; scratchVelocity = Math.max(-180, Math.min(180, (next-recordAngle)*8)); setRecordAngle(next); },
      onEnd: () => { manipulating = vinyl.matches(':focus-visible'); syncMotion(); },
    }, signal);
    listen(vinyl, 'focus', () => { manipulating = vinyl.matches(':focus-visible'); syncMotion(); });
    listen(vinyl, 'blur', () => { manipulating = false; syncMotion(); });
    listen(vinyl, 'keydown', event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault(); scratchVelocity = 0; manipulating = true; syncMotion();
      setRecordAngle(event.key === 'Home' ? 0 : event.key === 'End' ? 359 : recordAngle + (event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -15 : 15));
    });
    listen(document,'visibilitychange',()=>{sound?.setEnabled(soundEnabled&&!document.hidden).catch(()=>{});});
    stage.dataset.track = '0';
    controls.querySelectorAll('[data-track]').forEach(button => listen(button, 'click', () => {
      const n = Number(button.dataset.track); selectedTrack = n; sound?.setTrack(n); stage.dataset.track = String(n);
      stage.querySelectorAll('.record-layer').forEach((layer, i) => layer.classList.toggle('is-selected', i === n));
      stage.querySelector('.record-copy').innerHTML = records[n].copy;
      back.querySelector('h3').textContent = records[n].name; back.querySelector('.sleeve-notes').textContent = notes[n];
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
    animate((t, delta) => {
      const record = records[selectedTrack];
      scratchVelocity *= Math.exp(-delta * 4);
      setRecordAngle(recordAngle + delta * (record.speed + scratchVelocity));
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
      else { sculpture?.setFinish(stage.dataset.finish); sculpture?.setTurn(controls.querySelector('input').value); sculpture?.setInspection(stage.classList.contains('is-inspecting')); }
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
