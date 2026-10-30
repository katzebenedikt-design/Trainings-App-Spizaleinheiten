// Intervall-Timer mit deutscher Sprachansage.
import { h, card, modal, field, toast } from '../ui.js';
import { speak, beep, vibrate, stopSpeaking } from '../core/speech.js';
import { fmtTime, parseTime } from '../core/util.js';

export const PRESETS = {
  zirkel3030: { name: 'Zirkel 30/30 (KSK)', prep: 10, work: 30, rest: 30, rounds: 12 },
  zirkel4020: { name: 'Zirkel 40/20', prep: 10, work: 40, rest: 20, rounds: 10 },
  vier4: { name: '4 × 4 Minuten', prep: 10, work: 240, rest: 150, rounds: 4 },
  int400: { name: 'Intervalle 400 m', prep: 10, work: 100, rest: 220, rounds: 8 },
  k1000: { name: '5 × 1000 m (PFV)', prep: 10, work: 250, rest: 180, rounds: 5 },
  amrap12: { name: 'AMRAP 12 min', prep: 10, work: 720, rest: 0, rounds: 1 },
  plank: { name: 'Rumpf 45/15', prep: 10, work: 45, rest: 15, rounds: 6 },
  tabata: { name: 'Tabata 20/10', prep: 10, work: 20, rest: 10, rounds: 8 },
};

export function renderTimer(el, app) {
  el.append(h('div', { class: 'k mt' }, '[ INTERVALL-TIMER ]'), h('p', { class: 'small dim' }, 'Mit Sprachansage auf Deutsch. Bildschirm bleibt an. Ton laut stellen.'));
  for (const [k, p] of Object.entries(PRESETS)) {
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => openTimer(app, k) },
      h('div', { class: 'row between' }, h('b', {}, p.name), h('span', { class: 'm' }, `${p.rounds}× ${fmtTime(p.work)}${p.rest ? ' / ' + fmtTime(p.rest) : ''}`))));
  }
  el.append(h('button', { class: 'btn f', onclick: () => customTimer(app) }, '+ Eigener Timer'));
}

function customTimer(app) {
  modal(({ close }) => {
    const w = h('input', { value: '0:45', inputmode: 'text' }), r = h('input', { value: '0:15', inputmode: 'text' }), n = h('input', { value: '8', inputmode: 'numeric' }), p = h('input', { value: '0:10', inputmode: 'text' });
    return h('div', {}, h('h2', {}, 'Eigener Timer'), field('Belastung (m:ss)', w), field('Pause (m:ss)', r), field('Runden', n), field('Vorbereitung (m:ss)', p),
      h('button', { class: 'btn f mt2', onclick: () => { const cfg = { name: 'Eigener Timer', work: parseTime(w.value), rest: parseTime(r.value) || 0, rounds: Number(n.value) || 1, prep: parseTime(p.value) || 0 }; if (!cfg.work) return toast('Belastung fehlt.'); close(); openTimer(app, cfg); } }, '> Start'));
  });
}

export function buildSchedule(cfg) {
  const out = [];
  if (cfg.prep) out.push({ kind: 'prep', dur: cfg.prep, round: 0 });
  for (let i = 1; i <= cfg.rounds; i++) {
    out.push({ kind: 'work', dur: cfg.work, round: i });
    if (cfg.rest && i < cfg.rounds) out.push({ kind: 'rest', dur: cfg.rest, round: i });
  }
  return out;
}

export function openTimer(app, preset) {
  const cfg = typeof preset === 'string' ? PRESETS[preset] : preset;
  const sched = buildSchedule(cfg);
  let idx = 0, phaseEnd = 0, paused = false, pauseLeft = 0, iv = null, lock = null, said = {};
  const say = (t) => { if (app.state.settings.voice !== false) speak(t); };
  const m = modal(({ close }) => {
    const face = h('div', { class: 'timer-face' });
    const phase = h('div', { class: 'phase' }), clock = h('div', { class: 'clock' }), info = h('div', { class: 'm' });
    const pauseBtn = h('button', { class: 'btn', onclick: () => togglePause() }, 'Pause');
    face.append(h('div', { class: 'k' }, `[ ${cfg.name.toUpperCase()} ]`), phase, clock, info);
    const startPhase = () => {
      const p = sched[idx]; said = {};
      phaseEnd = Date.now() + p.dur * 1000;
      face.className = 'timer-face ' + (p.kind === 'work' ? 'work' : 'rest');
      phase.textContent = p.kind === 'prep' ? 'Fertig machen' : p.kind === 'work' ? 'Belastung' : 'Pause';
      info.textContent = p.round ? `RUNDE ${p.round} / ${cfg.rounds}` : '';
      vibrate(p.kind === 'work' ? [300] : [120, 80, 120]);
      beep(p.kind === 'work' ? 990 : 550, 350);
      if (p.kind === 'prep') say(`${cfg.name}. Mach dich bereit.`);
      else if (p.kind === 'work') say(cfg.rounds > 1 ? `Los. Runde ${p.round} von ${cfg.rounds}.` : 'Los.');
      else say(`Pause. ${p.dur >= 60 ? String(Math.round((p.dur / 60) * 10) / 10).replace('.', ',') + ' Minuten' : p.dur + ' Sekunden'}.`);
    };
    const tick = () => {
      if (paused) return;
      const left = Math.ceil((phaseEnd - Date.now()) / 1000);
      const p = sched[idx];
      clock.textContent = fmtTime(Math.max(0, left));
      if (p.kind === 'work' && p.dur >= 60 && left === Math.floor(p.dur / 2) && !said.half) { said.half = 1; say('Halbzeit.'); }
      if (p.dur >= 30 && left === 10 && !said.ten) { said.ten = 1; say('Noch zehn Sekunden.'); }
      if (left <= 3 && left >= 1 && !said['b' + left]) { said['b' + left] = 1; beep(660, 120); }
      if (left <= 0) {
        idx++;
        if (idx >= sched.length) { clearInterval(iv); phase.textContent = 'Geschafft'; clock.textContent = '0:00'; info.textContent = 'AUFTRAG ERFÜLLT'; beep(990, 600); vibrate([300, 100, 300]); say('Geschafft. Gute Arbeit.'); pauseBtn.remove(); releaseLock(); return; }
        startPhase();
      }
    };
    const togglePause = () => {
      if (!paused) { paused = true; pauseLeft = phaseEnd - Date.now(); pauseBtn.textContent = 'Weiter'; stopSpeaking(); }
      else { paused = false; phaseEnd = Date.now() + pauseLeft; pauseBtn.textContent = 'Pause'; }
    };
    face.append(pauseBtn, h('button', { class: 'btn danger', onclick: close }, 'Beenden'));
    startPhase(); tick();
    iv = setInterval(tick, 200);
    return face;
  }, { full: true });
  const releaseLock = () => { try { lock?.release(); } catch { /* egal */ } lock = null; };
  navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
  m.onClose(() => { clearInterval(iv); stopSpeaking(); releaseLock(); });
}
