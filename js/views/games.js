// Minispiele: Kopfrechnen, Merkfähigkeit, Reaktion, Muster, Entscheiden unter Stress.
import { h, modal, toast } from '../ui.js';
import { mathTask, memoryTask, reactionConfig, patternTask, switchConfig, switchItem, nextLevel } from '../core/games.js';
import { iso, rand } from '../core/util.js';
import { beep, vibrate } from '../core/speech.js';

export const GAMES = {
  rechnen: { name: 'Kopfrechnen unter Zeitdruck', desc: '60 Sekunden, so viele richtig wie möglich' },
  merken: { name: 'Merkfähigkeit', desc: 'Zahlen- und Buchstabenfolgen merken' },
  reaktion: { name: 'Reaktion', desc: 'Nur bei Sand tippen, nie bei Oliv' },
  muster: { name: 'Muster erkennen', desc: 'Zahlenreihen fortsetzen' },
  stress: { name: 'Entscheiden unter Stress', desc: 'Regelwechsel FARBE/FORM unter Zeitdruck' },
};

export function runGame(app, key, load = false) {
  const st = app.state;
  const g = st.mental.games[key] || (st.mental.games[key] = { level: 1, best: 0, history: [] });
  let alive = true; const timers = [];
  const later = (fn, ms) => { const t = setTimeout(() => alive && fn(), ms); timers.push(t); return t; };
  const m = modal(({ close }) => {
    const area = h('div', { class: 'game-area' });
    const head = h('div', { class: 'row between' }, h('div', { class: 'k' }, `[ ${GAMES[key].name.toUpperCase()} ]`), h('div', { class: 'm' }, `LEVEL ${g.level}${load ? ' · BELASTUNG' : ''}`));
    const wrap = h('div', {}, head, area);
    const finish = (correct, total, extra = {}) => {
      if (!alive) return;
      const acc = total ? correct / total : 0;
      const before = g.level; g.level = nextLevel(g.level, acc);
      const score = extra.score ?? correct;
      g.best = Math.max(g.best || 0, score);
      g.history.push({ date: iso(), level: g.level, acc: Math.round(acc * 100), score, load });
      if (g.history.length > 200) g.history.shift();
      const pts = Math.min(15, 5 + Math.floor(before / 2));
      area.replaceChildren(h('div', {}, h('h2', {}, 'Auswertung'),
        h('div', { class: 'big' }, Math.round(acc * 100) + '%'), h('div', { class: 'm' }, `${correct} VON ${total} RICHTIG${extra.label ? ' · ' + extra.label : ''}`),
        h('p', {}, g.level > before ? `Level hoch auf ${g.level}.` : g.level < before ? `Level runter auf ${g.level}. Ziel sind 70–85 %.` : `Level ${g.level} bleibt. Ziel: über 85 % für das nächste Level.`),
        extra.note ? h('p', { class: 'dim small' }, extra.note) : null,
        h('button', { class: 'btn f', onclick: () => { close(); runGame(app, key, load); } }, 'Nochmal'),
        h('button', { class: 'btn', onclick: close }, 'Fertig')));
      app.award(pts, 'mental', false);
      if (key === 'rechnen' || key === 'merken') app.badges();
    };
    const intro = (text, start) => area.replaceChildren(h('div', {}, h('p', {}, text), h('button', { class: 'btn f', onclick: start }, '> Start')));
    ({ rechnen, merken, reaktion, muster, stress })[key](area, g.level, finish, later, intro);
    return wrap;
  }, { full: true });
  m.onClose(() => { alive = false; timers.forEach(clearTimeout); });
}

function keypad(onKey) {
  return h('div', { class: 'keypad' }, ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '⌫'].map((k) => h('button', { onclick: () => onKey(k) }, k)));
}

function rechnen(area, level, finish, later, intro) {
  intro('60 Sekunden Kopfrechnen. Antwort eintippen, dann OK. Falsche Antwort: nächste Aufgabe.', () => {
    let correct = 0, total = 0, task = mathTask(level), input = '';
    const end = Date.now() + 60000;
    const q = h('div', { style: { font: '34px var(--mono)', color: 'var(--sand2)' } }), a = h('div', { class: 'big' }), clock = h('div', { class: 'm' });
    const show = () => { q.textContent = task.q; a.textContent = input || '_'; };
    const ok = () => { if (!input) return; total++; if (Number(input.replace('−', '-')) === task.a) { correct++; beep(880, 60); } else { vibrate(80); beep(220, 120); } task = mathTask(level); input = ''; show(); };
    area.replaceChildren(h('div', { style: { width: '100%' } }, clock, q, a, keypad((k) => { if (k === '⌫') input = input.slice(0, -1); else if (k === '−') input = input ? input : '−'; else input += k; show(); }), h('button', { class: 'btn f', onclick: ok }, 'OK')));
    show();
    const tick = () => { const left = Math.ceil((end - Date.now()) / 1000); clock.textContent = `NOCH ${left} S · ${correct} RICHTIG`; if (left <= 0) return finish(correct, Math.max(total, 1), { score: correct, label: `${correct} in 60 s` }); later(tick, 250); };
    tick();
  });
}

function merken(area, level, finish, later, intro) {
  intro('Eine Folge erscheint Zeichen für Zeichen. Danach eintippen. 5 Durchgänge. Buchstaben werden mit NATO-Alphabet angezeigt und als Buchstabe eingegeben.', () => {
    let round = 0, correct = 0;
    const next = () => {
      if (round >= 5) return finish(correct, 5, { note: 'Tipp: Gruppen bilden (3er-Blöcke) und leise mitsprechen.' });
      round++;
      const t = memoryTask(level); let i = 0;
      const disp = h('div', { style: { font: '44px var(--mono)', color: 'var(--sand2)' } });
      area.replaceChildren(h('div', {}, h('div', { class: 'm' }, `DURCHGANG ${round}/5 · ${t.items.length} ZEICHEN`), disp));
      const step = () => {
        if (i < t.show.length) { disp.textContent = t.show[i]; i++; later(() => { disp.textContent = ''; later(step, 200); }, t.ms); return; }
        let input = '';
        const a = h('div', { class: 'big' }, '_');
        const letters = level >= 5 ? h('div', { class: 'row wrap', style: { justifyContent: 'center', marginTop: '6px' } }, ...'ABCDEFGHKLMNPRSTUVWXZ'.split('').map((c) => h('button', { class: 'chip', onclick: () => { input += c; a.textContent = input; } }, c))) : null;
        area.replaceChildren(h('div', { style: { width: '100%' } }, h('div', { class: 'm' }, 'EINGEBEN'), a, letters, keypad((k) => { if (k === '⌫') input = input.slice(0, -1); else if (k !== '−') input += k; a.textContent = input || '_'; }),
          h('button', { class: 'btn f', onclick: () => { const ok = input === t.answer; if (ok) { correct++; beep(880, 80); } else vibrate(100); toast(ok ? 'Richtig.' : `Falsch. Richtig: ${t.answer}`); later(next, 700); } }, 'OK')));
      };
      later(step, 600);
    };
    next();
  });
}

function reaktion(area, level, finish, later, intro) {
  const cfg = reactionConfig(level);
  intro(`Warte auf das Signal. SAND: so schnell wie möglich tippen. ${cfg.nogo ? 'OLIV: NICHT tippen!' : ''} Zu früh tippen zählt als Fehler. ${cfg.trials} Durchgänge.`, () => {
    let trial = 0, correct = 0; const times = [];
    const box = h('div', { style: { width: '100%', height: '240px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)', font: '24px var(--mono)' } });
    area.replaceChildren(box);
    let state = 'wait', shownAt = 0, nogo = false, timeout = null;
    box.onpointerdown = () => {
      if (state === 'wait') { vibrate(150); toast('Zu früh!'); state = 'done'; clearTimeout(timeout); later(next, 800); return; }
      if (state === 'go') {
        state = 'done'; clearTimeout(timeout);
        if (nogo) { vibrate(150); box.textContent = 'FALSCH – OLIV!'; } else { const rt = Date.now() - shownAt; times.push(rt); correct++; box.textContent = rt + ' ms'; }
        box.style.background = ''; later(next, 700);
      }
    };
    const next = () => {
      if (trial >= cfg.trials) { const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0; return finish(correct, cfg.trials, { score: avg ? Math.max(0, 1000 - avg) : 0, label: avg ? `Ø ${avg} ms` : '', note: 'Gute Reaktionszeiten liegen bei 250–350 ms.' }); }
      trial++; state = 'wait'; box.textContent = `${trial}/${cfg.trials} · WARTEN …`; box.style.background = '';
      later(() => {
        if (state !== 'wait') return;
        nogo = Math.random() < cfg.nogo; state = 'go'; shownAt = Date.now();
        box.style.background = nogo ? 'var(--olive2)' : 'var(--sand)'; box.textContent = '';
        timeout = later(() => { if (state !== 'go') return; state = 'done'; box.style.background = ''; if (nogo) { correct++; box.textContent = 'RICHTIG GEWARTET'; } else box.textContent = 'ZU LANGSAM'; later(next, 700); }, nogo ? 1100 : cfg.window);
      }, rand(cfg.minWait, cfg.maxWait));
    };
    next();
  });
}

function muster(area, level, finish, later, intro) {
  intro('Wie geht die Reihe weiter? 8 Aufgaben, je 15 Sekunden.', () => {
    let n = 0, correct = 0; const whys = [];
    const next = () => {
      if (n >= 8) return finish(correct, 8, { note: whys.length ? 'Gesucht war z. B.: ' + whys.slice(-3).join(' · ') : '' });
      n++;
      const t = patternTask(level); let answered = false;
      const clock = h('div', { class: 'm' });
      const btns = t.options.map((o) => h('button', { onclick: () => answer(o, btn(o)) }, String(o)));
      const btn = (o) => btns[t.options.indexOf(o)];
      const answer = (o, b) => {
        if (answered) return; answered = true;
        const ok = o === t.answer; if (ok) correct++; else whys.push(t.why);
        if (b) b.classList.add(ok ? 'ok' : 'no'); btn(t.answer).classList.add('ok');
        later(next, ok ? 500 : 1400);
      };
      area.replaceChildren(h('div', { style: { width: '100%' } }, h('div', { class: 'm' }, `AUFGABE ${n}/8`), clock, h('div', { style: { font: '30px var(--mono)', color: 'var(--sand2)', margin: '14px 0' } }, t.shown.join('  ') + '  ?'), h('div', { class: 'choice' }, ...btns)));
      const end = Date.now() + 15000;
      const tick = () => { if (answered) return; const l = Math.ceil((end - Date.now()) / 1000); clock.textContent = `${l} S`; if (l <= 0) answer(null, null); else later(tick, 250); };
      tick();
    };
    next();
  });
}

function stress(area, level, finish, later, intro) {
  const cfg = switchConfig(level);
  intro('Oben steht die Regel. FARBE: Sand = LINKS, Oliv = RECHTS. FORM: Quadrat = LINKS, Kreis = RECHTS. Die Regel wechselt. Die Zeit ist knapp.' + (cfg.distract ? ' Ab jetzt mit Störgeräuschen.' : ''), () => {
    let n = 0, correct = 0, rule = null, answered = false;
    const ruleEl = h('div', { style: { font: '800 32px var(--head)', letterSpacing: '.2em' } });
    const shape = h('div', { style: { width: '90px', height: '90px', margin: '18px auto' } });
    const bar = h('div', { class: 'bar' }, h('i', { style: { width: '100%', transition: 'none' } }));
    const respond = (side) => {
      if (answered) return; answered = true;
      const ok = side === cur.correct; if (ok) { correct++; beep(880, 50); } else { vibrate(120); beep(200, 150); }
      later(next, 250);
    };
    let cur = null;
    area.replaceChildren(h('div', { style: { width: '100%' } }, ruleEl, bar, shape, h('div', { class: 'choice' }, h('button', { onclick: () => respond('L') }, '◀ LINKS'), h('button', { onclick: () => respond('R') }, 'RECHTS ▶'))));
    const next = () => {
      if (n >= cfg.items) return finish(correct, cfg.items, { note: 'Regelwechsel trainieren die geistige Flexibilität – wichtig, wenn sich die Lage ändert.' });
      n++; answered = false;
      cur = switchItem(rule, cfg.switchP);
      if (rule && cur.rule !== rule) beep(440, 80);
      rule = cur.rule;
      ruleEl.textContent = rule; ruleEl.style.color = rule === 'FARBE' ? 'var(--sand)' : 'var(--sand2)';
      shape.style.background = cur.color === 'sand' ? 'var(--sand)' : 'var(--olive)';
      shape.style.borderRadius = cur.shape === 'kreis' ? '50%' : '0';
      if (cfg.distract && Math.random() < 0.3) later(() => beep(rand(300, 1200), 90, 0.15), rand(100, 500));
      const fill = bar.firstChild; fill.style.transition = 'none'; fill.style.width = '100%';
      requestAnimationFrame(() => { fill.style.transition = `width ${cfg.time}ms linear`; fill.style.width = '0%'; });
      later(() => { if (!answered) { answered = true; vibrate(80); later(next, 200); } }, cfg.time);
    };
    next();
  });
}
