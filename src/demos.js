import { recordArtwork } from './record-artwork.js';
import { artwork } from './artwork.js';
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
  let animationId, previousTime = 0, elapsed = 0;
  function loop(time) {
    if (active && inView && !document.hidden && !paused) {
      const delta = Math.min((time - previousTime) / 1000 || 0, .05);
      elapsed += delta;
      if (!sculpture) drawFrame(elapsed, delta);
    }
    previousTime = time;
    animationId = requestAnimationFrame(loop);
  }
  function animate(draw) {
    active = true; drawFrame = draw; draw(0, 0); animationId = requestAnimationFrame(loop);
  }
  function bindPause(button) {
    function sync() {
      button.textContent = paused ? 'Play motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(!paused));
      stage.classList.toggle('motion-playing', !paused);
      sculpture?.setPaused(paused);
    }
    listen(button, 'click', () => { paused = !paused; sync(); });
    const onPreference = () => { paused = reduced.matches; sync(); };
    reduced.addEventListener('change', onPreference);
    cleanups.push(() => reduced.removeEventListener('change', onPreference));
    sync();
  }
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
  observer.observe(stage);
  cleanups.push(() => observer.disconnect());

  if (index === 0) {
    stage.innerHTML = '<canvas aria-hidden="true"></canvas><div class="orbit-demo-title">ORBIT<span>SOUND, REIMAGINED.</span></div>';
    controls.innerHTML = '<div class="orbit-modes" role="group" aria-label="Signal mode"><button data-mode="wave" aria-pressed="false">Wave</button><button data-mode="orbit" aria-pressed="true">Orbit</button><button data-mode="interference" aria-pressed="false">Interference</button></div><label>Tempo <input aria-label="Orbit tempo" type="range" min="0.3" max="2" step="0.1" value="1"></label><button class="burst">Remix shape</button><button class="motion-toggle"></button>';
    const canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    let width = 1, height = 1, x = 0, y = 0, remix = 0;
    const tempo = controls.querySelector('input');
    controls.querySelectorAll('[data-mode]').forEach(button=>listen(button,'click',()=>{
      orbitMode=button.dataset.mode;stage.dataset.mode=orbitMode;sculpture?.setMode(orbitMode);
      controls.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      stage.querySelector('.orbit-demo-title span').textContent={wave:'FOLLOW THE FREQUENCY.',orbit:'SOUND, REIMAGINED.',interference:'FIND YOUR OWN SIGNAL.'}[orbitMode];
      draw(elapsed);
    }));
    stage.dataset.mode='orbit';
    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      ctx.save(); ctx.translate(width / 2 + x * 22, height / 2 + y * 20);
      const size = Math.min(width * .32, height * .39);
      const time = t * Number(tempo.value) * .36 + remix;
      for (let i = 0; i < 34; i++) {
        const angle = i / 34 * Math.PI;
        const wobble = Math.sin(time + i * .13);
        ctx.save(); ctx.rotate(angle + time * .12 + x * .1);
        ctx.beginPath();
        if(orbitMode==='wave') { for(let j=0;j<=70;j++){const xx=(j/70-.5)*size*2.5;const yy=Math.sin(j*.12+time+i*.08)*size*.18+(i-17)*4;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);} }
        else ctx.ellipse(0, 0, size * (1 + wobble * .13), size * (.25 + .25 * Math.sin(angle + time) ** 2), (orbitMode==='interference'?angle*.7:y*.2), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${180 + i * 2 + Math.sin(time) * 30},85%,${60 + i * .5}%,${.3 + i / 80})`;
        ctx.lineWidth = 1.1; ctx.stroke(); ctx.restore();
      }
      ctx.restore();
    }
    const resize = new ResizeObserver(() => {
      const box = stage.getBoundingClientRect(); width = box.width; height = box.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(elapsed);
    });
    resize.observe(stage); cleanups.push(() => resize.disconnect());
    listen(stage, 'pointermove', event => { const r = stage.getBoundingClientRect(); x = (event.clientX - r.left) / r.width - .5; y = (event.clientY - r.top) / r.height - .5; if (paused) draw(elapsed); });
    listen(tempo, 'input', () => { draw(elapsed); sculpture?.setTempo(tempo.value); });
    listen(controls.querySelector('.burst'), 'click', () => { remix += .9; draw(elapsed); sculpture?.remix(); });
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
    stage.innerHTML = '<div class="demo-record"><div class="record-artwork">'+recordArtwork(0)+'</div><span class="record-kicker">GOOD NOISE / INDEPENDENT CULTURE</span><div class="record-copy">FEEL<br>THE<br><em>FREQUENCY.</em></div><div class="record-turntable"><div class="record-vinyl"><span>GN<span>01</span></span></div><div class="record-needle"></div></div><div class="record-bars" aria-hidden="true">'+Array.from({ length: 28 }, (_, i) => `<i style="--i:${i}"></i>`).join('')+'</div><span class="record-caption">01 — AFTER HOURS</span></div>';
    controls.innerHTML = '<button class="motion-toggle"></button><div class="record-tracks" role="group" aria-label="Visual record selection"><button data-track="0" aria-pressed="true">01</button><button data-track="1" aria-pressed="false">02</button><button data-track="2" aria-pressed="false">03</button></div><button class="sound-toggle" aria-pressed="false">Enable sound</button><span class="visual-only" role="status">SOUND OFF</span>';
    listen(document,'visibilitychange',()=>{sound?.setEnabled(soundEnabled&&!document.hidden).catch(()=>{});});
    const tracks = ['AFTER HOURS', 'SOFT SIGNAL', 'ELECTRIC FEEL'];
    controls.querySelectorAll('[data-track]').forEach(button => listen(button, 'click', () => {
      const n = Number(button.dataset.track); selectedTrack=n;sound?.setTrack(n);stage.dataset.track = String(n);
      stage.querySelector('.record-artwork').innerHTML=recordArtwork(n);
      stage.querySelector('.record-copy').innerHTML=['FEEL<br>THE<br><em>FREQUENCY.</em>','soft<br>signal.<br><em>STAY AWHILE.</em>','ELECTRIC<br>FEEL.<br><em>PLAY IT AGAIN.</em>'][n];
      stage.querySelector('.record-caption').textContent = `0${n + 1} — ${tracks[n]}`;
      stage.querySelector('.record-vinyl>span>span').textContent = `0${n + 1}`;
      controls.querySelectorAll('[data-track]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
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
    bindPause(controls.querySelector('.motion-toggle'));
    animate(t => { stage.style.setProperty('--record-angle', `${t * 48}deg`); stage.style.setProperty('--beat', String((Math.sin(t * 5) + 1) / 2)); });
  }
  if (index < 2 && !navigator.connection?.saveData) {
    import('./sculpture.js').then(module => {
      if (disposed) return;
      sculpture = module.mountProjectSculpture(stage, index, { onFallback: () => { sculpture = null; } });
      sculpture?.setPaused(paused);
      if (index === 0) { sculpture?.setTempo(controls.querySelector('input').value);sculpture?.setMode(orbitMode); }
      else { sculpture?.setFinish(stage.dataset.finish); sculpture?.setTurn(controls.querySelector('input').value); }
    }).catch(() => {});
  }
  return () => { disposed = true; sound?.dispose();sculpture?.dispose(); controller.abort(); cancelAnimationFrame(animationId); cleanups.forEach(fn => fn()); };
}

export function observePreviews() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('preview-live', entry.isIntersecting));
  });
  document.querySelectorAll('.project-preview').forEach(el => observer.observe(el));
}
