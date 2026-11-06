// CAT-Test: Simulation (Zeitlimit, Ablauf wie im Test, Auswertung am Ende) und Training
// (einzelne Bereiche, Lösungsweg nach jeder Aufgabe). Alles Übungsaufgaben.
import { h, card, modal, seg, toast, progressBar, lineChart } from '../ui.js';
import { CAT_MODULES, CAT_PROFILES } from '../data/cat.js';
import { makeItem, adaptStep, adaptTraining, moduleScore, evaluate, profileOf } from '../core/cat.js';
import { iso, fmtDate } from '../core/util.js';
import { beep, vibrate } from '../core/speech.js';

const catState = (st) => { st.cat = st.cat || {}; const c = st.cat; c.profile = c.profile || 'bw'; c.levels = c.levels || {}; c.sims = c.sims || []; c.train = c.train || []; return c; };
const modName = (id) => CAT_MODULES[id]?.name || id;
const fmtClock = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

// Für die Startseite: Training im schwächsten Bereich der letzten Simulation
export function catHome(st) {
  const c = catState(st); const last = c.sims[c.sims.length - 1];
  if (!last) return null;
  const weak = evaluate(last.mods).schwaechen[0];
  return { t: `CAT-Training: ${CAT_MODULES[weak].kurz}`, sub: 'OPTIONAL · CA. 10 MIN · SCHWÄCHSTER BEREICH', mod: weak };
}

// ---------- SVG-Darstellung ----------
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (vb, inner, w = 64) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('width', w); s.setAttribute('height', w); s.innerHTML = inner; return s; };
const FILL = { leer: 'none', voll: 'var(--sand)', halb: '#6c7058' };
function figSVG(c, w = 64) {
  const shape = (cx, cy, r) => c.shape === 'kreis' ? `<circle cx="${cx}" cy="${cy}" r="${r}"/>` : c.shape === 'quadrat' ? `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}"/>` : `<path d="M${cx} ${cy - r}L${cx + r} ${cy + r}L${cx - r} ${cy + r}Z"/>`;
  const xs = c.count === 1 ? [50] : c.count === 2 ? [32, 68] : [20, 50, 80];
  return svgEl('0 0 100 100', `<g fill="${FILL[c.fill]}" stroke="var(--txt)" stroke-width="4">${xs.map((x) => shape(x, 50, c.count === 3 ? 12 : 15)).join('')}</g>`, w);
}
const arrowSVG = (deg, w = 56) => svgEl('0 0 100 100', `<g transform="rotate(${deg} 50 50)" stroke="var(--txt)" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M50 82V20M28 40L50 18L72 40"/></g>`, w);
function polySVG(cells, w = 90) {
  const mx = Math.max(...cells.map((c) => c[0])) + 1, my = Math.max(...cells.map((c) => c[1])) + 1; const n = Math.max(mx, my, 3);
  const s = 100 / n; const ox = (100 - mx * s) / 2, oy = (100 - my * s) / 2;
  return svgEl('0 0 100 100', cells.map(([x, y]) => `<rect x="${ox + x * s + 1}" y="${oy + y * s + 1}" width="${s - 2}" height="${s - 2}" fill="var(--sand)" fill-opacity=".85" stroke="var(--bg)" stroke-width="2"/>`).join(''), w);
}
function gearsSVG(n) {
  const r = 12, step = 25; const W = n * step + 10;
  const gear = (x, y, i) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="var(--txt)" stroke-width="2.5" stroke-dasharray="4 2.3"/><text x="${x}" y="${y + 4}" font-size="11" text-anchor="middle" fill="var(--sand)" font-family="monospace">${i + 1}</text></g>`;
  const gs = Array.from({ length: n }, (_, i) => gear(15 + i * step, 22 + (i % 2) * 7, i)).join('');
  const s = svgEl(`0 0 ${W} 48`, gs + '<path d="M6 8a14 14 0 0 1 18 0l-3-3m3 3l-4 1" stroke="var(--olive)" stroke-width="2" fill="none"/>');
  s.setAttribute('width', '100%'); s.setAttribute('height', '70'); return s;
}
const optView = (o) => (o.fig ? figSVG(o.fig) : o.arrow != null ? arrowSVG(o.arrow) : o.poly ? polySVG(o.poly, 80) : h('span', {}, o.t));

// ---------- Aufgabe anzeigen ----------
// done(results) mit results = [{ score 0..1, level }]; feedback = Training (Lösung sofort zeigen)
function renderItem(item, done, { feedback = false } = {}) {
  const wrap = h('div', { class: 'catitem' });
  const exp = () => (feedback ? h('div', { class: 'card' }, h('div', { class: 'k' }, '[ LÖSUNGSWEG ]'), h('p', {}, item.explain)) : null);
  if (item.kind === 'mc') {
    const visual = item.matrix ? h('div', { class: 'catmatrix' }, ...item.matrix.map((c) => h('div', {}, c ? figSVG(c, 54) : h('b', { class: 'sand' }, '?'))))
      : item.arrows ? h('div', { class: 'catrow' }, ...item.arrows.map((a) => arrowSVG(a, 44)), h('b', { class: 'sand' }, '?'))
        : item.poly ? h('div', { class: 'center' }, polySVG(item.poly, 110)) : item.gears ? h('div', {}, gearsSVG(item.gears)) : null;
    const visualOpts = item.options.some((o) => !o.t);
    let answered = false;
    const btns = item.options.map((o, i) => h('button', { class: visualOpts ? 'vis' : '', onclick: (ev) => {
      if (answered) return; answered = true;
      const ok = i === item.answer;
      if (feedback) {
        ev.currentTarget.classList.add(ok ? 'ok' : 'no'); btns[item.answer].classList.add('ok');
        wrap.append(h('h2', { class: ok ? 'olive' : 'warn' }, ok ? 'Richtig.' : 'Falsch.'), exp(), h('button', { class: 'btn f', onclick: () => done([{ score: ok ? 1 : 0, level: item.level }]) }, 'Weiter'));
      } else { ev.currentTarget.classList.add('sel'); setTimeout(() => done([{ score: ok ? 1 : 0, level: item.level }]), 180); }
    } }, h('small', { class: 'm' }, 'ABCD'[i]), optView(o)));
    wrap.append(h('div', { class: 'm' }, (item.sub || '').toUpperCase()), h('p', { class: 'catq' }, item.q), visual, h('div', { class: 'choice catopts ' + (visualOpts ? 'v' : '') }, ...btns));
    return wrap;
  }
  if (item.kind === 'memo') {
    let left = item.show;
    const clock = h('div', { class: 'm' });
    const table = h('table', { class: 'memo' }, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Wohnort'), h('th', {}, 'Beruf'), h('th', {}, 'Kennzahl')), ...item.recs.map((x) => h('tr', {}, h('td', {}, x.name), h('td', {}, x.ort), h('td', {}, x.beruf), h('td', {}, String(x.zahl)))));
    const res = []; let qi = 0;
    const ask = () => {
      if (qi >= item.qs.length) {
        if (feedback) { wrap.replaceChildren(h('h2', {}, `${res.filter((x) => x.score).length}/${res.length} gewusst`), table, exp(), h('button', { class: 'btn f', onclick: () => done(res) }, 'Weiter')); return; }
        return done(res);
      }
      const q = { ...item.qs[qi], kind: 'mc', level: item.level, sub: `Frage ${qi + 1}/${item.qs.length}` };
      wrap.replaceChildren(renderItem(q, (r) => { res.push(...r); qi++; ask(); }, { feedback: false }));
    };
    const iv = setInterval(() => { left--; clock.textContent = `EINPRÄGEN: NOCH ${left} S`; if (left <= 0 || !wrap.isConnected) { clearInterval(iv); if (wrap.isConnected) ask(); } }, 1000);
    clock.textContent = `EINPRÄGEN: NOCH ${left} S`;
    wrap.append(h('div', { class: 'm' }, 'MERKFÄHIGKEIT'), h('p', { class: 'catq' }, item.q), clock, table, h('button', { class: 'btn', onclick: () => { left = 1; } }, 'Ich bin so weit'));
    return wrap;
  }
  // d2: Durchstreichtest
  let left = item.sec, finished = false;
  const sel = new Set();
  const clock = h('div', { class: 'big center', style: { fontSize: '30px' } }, fmtClock(left));
  const grid = h('div', { class: 'd2grid' }, ...item.items.map((it, i) => h('button', { class: 'd2', onclick: (ev) => { if (finished) return; if (sel.has(i)) sel.delete(i); else sel.add(i); ev.currentTarget.classList.toggle('on'); } },
    h('i', {}, '׀'.repeat(it.up) || ' '), h('b', {}, it.letter), h('i', {}, '׀'.repeat(it.down) || ' '))));
  const finish = () => {
    if (finished) return; finished = true; clearInterval(iv);
    const targets = item.items.filter((x) => x.target).length;
    const hits = [...sel].filter((i) => item.items[i].target).length, fa = sel.size - hits;
    const score = Math.max(0, Math.min(1, (hits - fa) / Math.max(1, targets)));
    if (feedback) {
      [...grid.children].forEach((b, i) => { if (item.items[i].target) b.classList.add(sel.has(i) ? 'hit' : 'miss'); else if (sel.has(i)) b.classList.add('fa'); });
      wrap.append(h('h2', {}, `${hits}/${targets} gefunden · ${fa} Fehler`), h('p', { class: 'm' }, 'GRÜN = GEFUNDEN · GELB = ÜBERSEHEN · ROT = FALSCH ANGETIPPT'), exp(), h('button', { class: 'btn f', onclick: () => done([{ score, level: item.level }]) }, 'Weiter'));
    } else done([{ score, level: item.level }]);
  };
  const iv = setInterval(() => { left--; clock.textContent = fmtClock(left); if (left <= 0 || !wrap.isConnected) finish(); }, 1000);
  wrap.append(h('div', { class: 'm' }, 'KONZENTRATION'), h('p', { class: 'catq' }, item.q), clock, grid, h('button', { class: 'btn f', onclick: finish }, 'Fertig'));
  return wrap;
}

// ---------- Tab ----------
export function renderCat(el, app) {
  const st = app.state; const c = catState(st);
  const P = profileOf(c.profile);
  const totalMin = P.module.reduce((a, m) => a + m.min, 0);
  el.append(h('div', { class: 'k mt' }, '[ CAT · COMPUTERGESTÜTZTER EIGNUNGSTEST ]'),
    h('div', { class: 'card warnc small' }, 'Alle Aufgaben sind selbst erstellte Übungsaufgaben im Stil typischer Eignungstests – keine offiziellen Originalaufgaben.'),
    h('div', { class: 'm mt' }, 'TESTPROFIL'), seg(Object.entries(CAT_PROFILES).map(([k, p]) => [k, p.name.split(' – ')[0]]), c.profile, (v) => { c.profile = v; app.save(); app.refresh(); }));
  el.append(card(h('b', {}, P.name), h('div', { class: 'm' }, `FÜR: ${P.fuer.toUpperCase()}`), h('p', { class: 'small dim' }, P.hinweis),
    h('a', { class: 'small', href: P.quelle.url, target: '_blank', rel: 'noopener' }, `Offizielle Infos: ${P.quelle.titel} ↗`),
    h('ul', { class: 'plain small mt' }, P.module.map((m) => h('li', {}, `${modName(m.id)} · ${m.id === 'merken' ? m.n + ' Durchgänge' : m.id === 'konzentration' ? m.n + ' Blöcke' : m.n + ' Aufgaben'} · ${m.min} min`))),
    h('button', { class: 'btn f', onclick: () => runSimulation(app, false) }, `> Simulation starten (ca. ${totalMin} min)`),
    h('button', { class: 'btn', onclick: () => runSimulation(app, true) }, `Kurz-Simulation (ca. ${Math.round(totalMin / 2)} min)`)));

  const last = c.sims[c.sims.length - 1];
  if (last) {
    const ev = evaluate(last.mods);
    el.append(card(h('div', { class: 'k' }, '[ EMPFOHLEN: SCHWÄCHSTE BEREICHE ]'), h('p', { class: 'small dim' }, `Aus der letzten Simulation (${fmtDate(last.date)}). Kurze Trainingseinheit mit Lösungsweg, die Schwierigkeit passt sich an.`),
      ...ev.schwaechen.map((id) => h('button', { class: 'btn', onclick: () => runTraining(app, id) }, `Training: ${modName(id)} (${last.mods[id].score} P.)`))));
  }

  el.append(h('div', { class: 'k mt2' }, '[ TRAINING NACH BEREICH ]'), h('p', { class: 'small dim' }, 'Ohne Zeitdruck. Nach jeder Aufgabe der Lösungsweg. Stufe 1–10 passt sich an deine Trefferquote an (Ziel 70–85 %).'));
  const grid = h('div', { class: 'grid2' });
  for (const [id, M] of Object.entries(CAT_MODULES)) {
    const tr = c.train.filter((x) => x.mod === id).slice(-5);
    const acc = tr.length ? Math.round((tr.reduce((a, x) => a + x.correct, 0) / tr.reduce((a, x) => a + x.total, 0)) * 100) : null;
    grid.append(h('div', { class: 'tile', style: { cursor: 'pointer' }, onclick: () => runTraining(app, id) }, h('i', {}, M.kurz), h('b', { style: { fontSize: '20px' } }, `St. ${c.levels[id] || 1}`), h('span', { class: 'm' }, acc != null ? `${acc} % ZULETZT` : 'NEU')));
  }
  el.append(grid);

  if (c.sims.length) {
    el.append(h('div', { class: 'k mt2' }, '[ VERLAUF ]'));
    if (c.sims.length > 1) el.append(card(h('div', { class: 'm' }, 'GESAMTWERT JE SIMULATION (0–100)'), lineChart(c.sims.map((s) => ({ date: s.date, v: s.total, note: (CAT_PROFILES[s.profile]?.name.split(' – ')[0] || '') + (s.kurz ? ' kurz' : '') })), { fmt: (v) => Math.round(v), height: 150 })));
    const prev = c.sims[c.sims.length - 2];
    el.append(card(h('div', { class: 'm' }, `LETZTE SIMULATION ${fmtDate(last.date)} · GESAMT ${last.total}`), ...Object.entries(last.mods).map(([id, m]) => {
      const d = prev?.mods[id] ? m.score - prev.mods[id].score : null;
      return h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('span', { class: 'small' }, CAT_MODULES[id].kurz), h('span', { class: 'm' }, `${m.score}${d != null ? (d >= 0 ? ' ▲' : ' ▼') + Math.abs(d) : ''}`)), progressBar(m.score / 100));
    })));
    const tr = c.train.slice(-30);
    if (tr.length > 1) el.append(card(h('div', { class: 'm' }, 'TRAINING: TREFFERQUOTE JE EINHEIT (%)'), lineChart(tr.map((x) => ({ date: x.date, v: Math.round((x.correct / x.total) * 100), note: CAT_MODULES[x.mod].kurz })), { fmt: (v) => v + ' %', height: 130 })));
  }
}

// ---------- Simulation ----------
export function runSimulation(app, kurz) {
  const st = app.state; const c = catState(st); const P = profileOf(c.profile);
  const plan = P.module.map((m) => ({ ...m, n: kurz ? Math.max(1, Math.ceil(m.n / 2)) : m.n, sec: Math.round((kurz ? m.min / 2 : m.min) * 60) }));
  const results = {}; let mi = 0, iv = null, aborted = false;
  const m = modal(({ close }) => {
    const head = h('div', {}); const body = h('div', {});
    const intro = () => {
      if (mi >= plan.length) return finish();
      const mod = plan[mi];
      head.replaceChildren(h('div', { class: 'k' }, `[ SIMULATION · TEIL ${mi + 1}/${plan.length} ]`), progressBar(mi / plan.length));
      body.replaceChildren(h('h2', {}, modName(mod.id)), h('p', { class: 'm' }, `${mod.n} ${mod.id === 'merken' ? 'DURCHGÄNGE' : mod.id === 'konzentration' ? 'BLÖCKE' : 'AUFGABEN'} · ZEIT ${fmtClock(mod.sec)}`),
        h('p', { class: 'small dim' }, 'Keine Lösungen während der Simulation. Unbeantwortete Aufgaben zählen als falsch. Lieber zügig entscheiden als hängen bleiben.'),
        h('button', { class: 'btn f', onclick: () => runModule(mod) }, '> Start'));
    };
    const runModule = (mod) => {
      let level = Math.max(1, Math.min(8, c.levels[mod.id] || 3)), done = 0, left = mod.sec;
      const res = results[mod.id] = [];
      const clock = h('span', { class: 'mono sand' });
      const tick = () => { clock.textContent = fmtClock(left); };
      tick(); clearInterval(iv);
      iv = setInterval(() => { left--; tick(); if (left === 30) beep(660, 120); if (left <= 0) timeUp(); }, 1000);
      const timeUp = () => {
        clearInterval(iv);
        for (let k = done; k < mod.n; k++) res.push({ score: 0, level, skipped: true });
        body.replaceChildren(h('h2', { class: 'warn' }, 'Zeit abgelaufen.'), h('button', { class: 'btn f', onclick: () => { mi++; intro(); } }, 'Weiter'));
        vibrate([200, 100, 200]);
      };
      const next = () => {
        if (done >= mod.n) { clearInterval(iv); mi++; return intro(); }
        const item = makeItem(mod.id, level, Math.random, mod.typen);
        head.replaceChildren(h('div', { class: 'row between' }, h('div', { class: 'k' }, `[ ${CAT_MODULES[mod.id].kurz.toUpperCase()} · ${done + 1}/${mod.n} ]`), clock), progressBar(done / mod.n));
        body.replaceChildren(renderItem(item, (r) => {
          if (left <= 0) return;
          res.push(...r); done++;
          const avg = r.reduce((a, x) => a + x.score, 0) / r.length;
          level = adaptStep(level, avg >= 0.6);
          next();
        }));
      };
      next();
    };
    const finish = () => {
      clearInterval(iv);
      const mods = {}; for (const [id, r] of Object.entries(results)) mods[id] = moduleScore(r);
      const ev = evaluate(mods);
      c.sims.push({ date: iso(), profile: c.profile, kurz, total: ev.total, mods });
      for (const [id, s] of Object.entries(mods)) c.levels[id] = Math.max(1, Math.round(s.level));
      head.replaceChildren(h('div', { class: 'k' }, '[ AUSWERTUNG ]'));
      body.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'big' }, ev.total), h('div', { class: 'm' }, 'GESAMTWERT (0–100) · ÜBUNGSWERT, KEIN OFFIZIELLES ERGEBNIS')),
        card(...ev.sorted.map((id) => h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('span', { class: 'small' }, modName(id)), h('span', { class: 'm' }, `${String(mods[id].correct).replace('.', ',')}/${mods[id].total} · ST. ${String(mods[id].level).replace('.', ',')} · ${mods[id].score}`)), progressBar(mods[id].score / 100)))),
        card(h('div', { class: 'k' }, '[ STÄRKEN ]'), h('p', {}, ev.staerken.map(modName).join(', ')), h('div', { class: 'k' }, '[ SCHWÄCHEN ]'), h('p', {}, ev.schwaechen.map(modName).join(', ')),
          h('p', { class: 'small dim' }, 'Wert = 70 % Trefferquote + 30 % erreichte Schwierigkeit. Die App schlägt dir ab jetzt Training für die schwächsten Bereiche vor (hier und im Tagesbefehl).')),
        ...ev.schwaechen.map((id) => h('button', { class: 'btn f', onclick: () => { close(); setTimeout(() => runTraining(app, id), 350); } }, `> Training: ${modName(id)}`)),
        h('button', { class: 'btn', onclick: close }, 'Fertig'));
      app.award(kurz ? 20 : 40, 'cat', 'Simulation abgeschlossen.');
    };
    intro();
    return h('div', {}, head, body);
  }, { full: true });
  m.onClose(() => { clearInterval(iv); if (mi < plan.length && !aborted) { aborted = true; toast('Simulation abgebrochen – nichts gespeichert.'); } app.refresh(); });
}

// ---------- Training ----------
export function runTraining(app, mod, n = mod === 'merken' || mod === 'konzentration' ? 3 : 10) {
  const st = app.state; const c = catState(st);
  let level = c.levels[mod] || 1, i = 0; const recent = [], all = [];
  const m = modal(({ close }) => {
    const head = h('div', {}); const body = h('div', {});
    const next = () => {
      if (i >= n) return finish();
      const item = makeItem(mod, level);
      head.replaceChildren(h('div', { class: 'row between' }, h('div', { class: 'k' }, `[ TRAINING · ${CAT_MODULES[mod].kurz.toUpperCase()} · ${i + 1}/${n} ]`), h('span', { class: 'mono sand' }, `ST. ${level}`)), progressBar(i / n));
      body.replaceChildren(renderItem(item, (r) => {
        for (const x of r) { all.push(x); recent.push(x.score); }
        level = adaptTraining(level, recent);
        i++; next();
      }, { feedback: true }));
    };
    const finish = () => {
      const correct = Math.round(all.reduce((a, x) => a + x.score, 0) * 10) / 10;
      c.train.push({ date: iso(), mod, correct, total: all.length, level });
      if (c.train.length > 300) c.train.splice(0, c.train.length - 300);
      c.levels[mod] = level;
      head.replaceChildren(h('div', { class: 'k' }, `[ TRAINING ${CAT_MODULES[mod].kurz.toUpperCase()} ABGESCHLOSSEN ]`));
      body.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'big' }, `${Math.round((correct / Math.max(1, all.length)) * 100)} %`), h('div', { class: 'm' }, `${String(correct).replace('.', ',')} VON ${all.length} RICHTIG · NEUE STUFE ${level}`)), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      app.award(15, 'cat', 'CAT-Training erledigt.');
    };
    next();
    return h('div', {}, h('p', { class: 'small dim' }, `${modName(mod)} · Übungsaufgaben mit Lösungsweg`), head, body);
  }, { full: true });
  m.onClose(() => app.refresh());
}

