// CAT-Test: Simulation (Zeitlimit, Ablauf wie im Test, Auswertung am Ende) und Training
// (einzelne Bereiche, Lösungsweg nach jeder Aufgabe). Alles Übungsaufgaben.
import { h, card, modal, seg, toast, progressBar, lineChart } from '../ui.js';
import { CAT_MODULES, CAT_PROFILES, CAT_KOPFTEST } from '../data/cat.js';
import { makeItem, adaptStep, adaptTraining, moduleScore, evaluate, profileOf, diktatScore, pickDaily, moduleStand } from '../core/cat.js';
import { iso, fmtDate } from '../core/util.js';
import { beep, vibrate, speak, stopSpeaking } from '../core/speech.js';
import { mondayOf } from '../core/util.js';

const catState = (st) => { st.cat = st.cat || {}; const c = st.cat; c.profile = c.profile || 'bw'; c.levels = c.levels || {}; c.sims = c.sims || []; c.train = c.train || []; c.tests = c.tests || []; c.daily = c.daily || []; return c; };
const modName = (id) => CAT_MODULES[id]?.name || id;
const fmtClock = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

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
      } else { ev.currentTarget.classList.add('sel'); setTimeout(() => done([{ score: ok ? 1 : 0, level: item.level, review: ok ? null : { q: item.q, a: item.options[item.answer].t || 'Antwort ' + 'ABCD'[item.answer] + ' (Figur)', explain: item.explain } }]), 180); }
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
  if (item.kind === 'diktat') {
    let plays = 0, done_ = false;
    const play = () => { if (plays >= 2) return toast('Höchstens 2× – wie im Test.'); plays++; speak(item.text, { lang: 'de-DE', rate: 0.82 }); };
    const ta = h('textarea', { placeholder: 'Hier schreiben …', autocapitalize: 'sentences', spellcheck: 'false', autocorrect: 'off', style: { minHeight: '90px', fontSize: '18px' } });
    setTimeout(play, 300);
    const check = () => {
      if (done_) return; done_ = true; stopSpeaking();
      const r = diktatScore(item.text, ta.value);
      if (feedback) wrap.append(h('h2', { class: r.errors ? 'warn' : 'olive' }, r.errors ? `${r.errors} Fehler` : 'Fehlerfrei.'), h('p', {}, 'Richtig: ', h('b', {}, item.text)), r.wrong.length ? h('p', { class: 'small dim' }, 'Prüfen: ' + r.wrong.join(', ')) : null, h('button', { class: 'btn f', onclick: () => done([{ score: r.score, level: item.level }]) }, 'Weiter'));
      else done([{ score: r.score, level: item.level, review: r.errors ? { q: 'Diktat', a: item.text, du: ta.value } : null }]);
    };
    wrap.append(h('div', { class: 'm' }, 'DIKTAT'), h('p', { class: 'catq' }, item.q), h('button', { class: 'btn s', onclick: play }, '🔊 Anhören'), ta, h('button', { class: 'btn f', onclick: check }, 'Fertig'));
    return wrap;
  }
  if (item.kind === 'react') {
    const box = h('div', { class: 'reactbox' }, h('span', { class: 'm' }, 'BEREIT …'));
    let i = 0, shownAt = 0, cur = null, hits = 0, fa = 0, miss = 0, started = false; const rts = []; let tmr = null, over = false;
    const finish = () => {
      over = true; clearTimeout(tmr);
      const targets = item.trials.filter((t) => t.target).length;
      const score = Math.max(0, Math.min(1, (hits - fa) / Math.max(1, targets)));
      const rt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
      const summary = h('div', {}, h('h2', {}, `${hits}/${targets} Treffer · ${fa} Fehlalarme`), h('p', { class: 'm' }, `${rt ? `Ø REAKTIONSZEIT ${rt} MS · ` : ''}${miss} VERPASST`));
      if (feedback) wrap.append(summary, h('p', {}, item.explain), h('button', { class: 'btn f', onclick: () => done([{ score, level: item.level }]) }, 'Weiter'));
      else done([{ score, level: item.level }]);
    };
    const next = () => {
      if (over || !wrap.isConnected) return;
      if (i >= item.trials.length) return finish();
      const t = item.trials[i];
      box.className = 'reactbox'; box.replaceChildren(h('span', { class: 'm' }, '+')); cur = null;
      tmr = setTimeout(() => {
        if (!wrap.isConnected) return;
        cur = t; shownAt = performance.now(); box.className = 'reactbox ' + (t.target ? 'tgt' : 'dis'); box.replaceChildren();
        tmr = setTimeout(() => { if (cur && cur.target) miss++; cur = null; i++; next(); }, item.windowMs);
      }, t.waitMs);
    };
    box.onpointerdown = () => {
      if (over) return;
      if (!cur) { fa++; return; }
      clearTimeout(tmr);
      if (cur.target) { hits++; rts.push(Math.round(performance.now() - shownAt)); } else fa++;
      cur = null; i++; box.className = 'reactbox'; next();
    };
    wrap.append(h('div', { class: 'm' }, 'REAKTION'), h('p', { class: 'catq' }, item.q), box, h('button', { class: 'btn', onclick: (ev) => { if (over || started) return; started = true; ev.currentTarget.remove(); next(); } }, '> Start'));
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
  // Täglich + wöchentlich
  const today = iso(); const doneToday = c.daily.some((d) => d.date === today);
  const mon = mondayOf(today); const probe = c.sims.find((s) => s.date >= mon && !s.kurz);
  const stand = moduleStand(c, P.module.map((m) => m.id));
  const weakest = Object.entries(stand).sort((a, b) => a[1] - b[1]).slice(0, 3);
  el.append(card(h('div', { class: 'k' }, '[ TÄGLICH: KURZEINHEIT · 10–15 MIN ]'),
    h('p', { class: 'small dim' }, 'Drei Bereiche in Test-Reihenfolge, mit Zeitdruck. Dein schwächster Bereich ist immer dabei, schwache Bereiche kommen öfter. Lösungswege am Ende.'),
    h('div', { class: 'm' }, 'SCHWÄCHSTE BEREICHE: ' + weakest.map(([id, v]) => `${CAT_MODULES[id].kurz.toUpperCase()} ${v}`).join(' · ')),
    h('button', { class: 'btn ' + (doneToday ? '' : 'f'), onclick: () => runSimulation(app, false, { daily: true }) }, doneToday ? 'Heute erledigt ✓ – nochmal' : '> Kurzeinheit starten')));
  el.append(card(h('div', { class: 'k' }, '[ WÖCHENTLICH: VOLLER PROBETEST ]'),
    h('p', { class: 'small dim' }, `Einmal pro Woche (Sonntag im Kopf-Plan) der komplette Ablauf deines Profils mit allen Zeitlimits – ca. ${Math.round(totalMin)} min.`),
    h('div', { class: 'm' }, probe ? `DIESE WOCHE ERLEDIGT (${fmtDate(probe.date)}): ${probe.total} PUNKTE` : 'DIESE WOCHE NOCH OFFEN'),
    h('button', { class: 'btn ' + (probe ? '' : 'f'), onclick: () => runSimulation(app, false) }, `> Probetest starten (ca. ${Math.round(totalMin)} min)`)));

  el.append(card(h('b', {}, P.name), h('div', { class: 'm' }, `FÜR: ${P.fuer.toUpperCase()}`), h('p', { class: 'small dim' }, P.hinweis),
    h('a', { class: 'small', href: P.quelle.url, target: '_blank', rel: 'noopener' }, `Offizielle Infos: ${P.quelle.titel} ↗`),
    h('ul', { class: 'plain small mt' }, P.module.map((m) => h('li', {}, `${modName(m.id)} · ${m.id === 'merken' ? m.n + ' Durchgänge' : m.id === 'konzentration' ? m.n + ' Blöcke' : m.n + ' Aufgaben'} · ${m.min} min`))),
    h('button', { class: 'btn f', onclick: () => runSimulation(app, false) }, `> Simulation starten (ca. ${totalMin} min)`),
    h('button', { class: 'btn', onclick: () => runSimulation(app, true) }, `Kurz-Simulation (ca. ${Math.round(totalMin / 2)} min)`)));

  // Monatlicher Kopf-Test (feste Schwierigkeit, vergleichbar)
  const kt = c.tests; const ktMin = Math.round(CAT_KOPFTEST.module.reduce((a, x) => a + x.min, 0));
  const lastT = kt[kt.length - 1], firstT = kt[0];
  el.append(card(h('div', { class: 'k' }, '[ KOPF-TEST · ALLE 6 WOCHEN ]'),
    h('p', { class: 'small dim' }, `Alle 8 Bereiche, feste Stufe ${CAT_KOPFTEST.stufe}, ca. ${ktMin} min mit Zeitlimit. Weil die Schwierigkeit immer gleich ist, zeigt der Verlauf ehrlich, ob du besser wirst. Termin: Sonntag der Entlastungswoche (steht im Kopf-Wochenplan).`),
    lastT ? h('div', { class: 'm' }, `LETZTER TEST ${fmtDate(lastT.date)}: ${lastT.total} %${kt.length > 1 ? ` · ERSTER ${firstT.total} % (${lastT.total - firstT.total >= 0 ? '+' : ''}${lastT.total - firstT.total})` : ''}`) : null,
    kt.length > 1 ? lineChart(kt.map((t) => ({ date: t.date, v: t.total })), { fmt: (v) => v + ' %', height: 120 }) : null,
    lastT ? h('div', {}, ...Object.entries(lastT.mods).map(([id, m]) => { const d = kt.length > 1 && firstT.mods[id] ? m.score - firstT.mods[id].score : null; return h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('span', { class: 'small' }, CAT_MODULES[id].kurz), h('span', { class: 'm' }, `${m.score} %${d != null ? (d >= 0 ? ' ▲' : ' ▼') + Math.abs(d) : ''}`)), progressBar(m.score / 100)); })) : null,
    h('button', { class: 'btn f', onclick: () => runSimulation(app, false, { kopftest: true }) }, `> Kopf-Test starten (ca. ${ktMin} min)`)));

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
export function runSimulation(app, kurz, { kopftest = false, daily = false, onDone } = {}) {
  const st = app.state; const c = catState(st); const P = kopftest ? CAT_KOPFTEST : profileOf(c.profile);
  const label = kopftest ? 'KOPF-TEST' : daily ? 'KURZEINHEIT' : 'SIMULATION';
  const base = daily ? pickDaily(c, P) : P.module;
  const plan = base.map((m) => ({ ...m, n: kurz ? Math.max(1, Math.ceil(m.n / 2)) : m.n, sec: Math.round((kurz ? m.min / 2 : m.min) * 60) }));
  const review = [];
  const results = {}; let mi = 0, iv = null, aborted = false;
  const m = modal(({ close }) => {
    const head = h('div', {}); const body = h('div', {});
    const intro = () => {
      if (mi >= plan.length) return finish();
      const mod = plan[mi];
      head.replaceChildren(h('div', { class: 'k' }, `[ ${label} · TEIL ${mi + 1}/${plan.length} ]`), progressBar(mi / plan.length));
      body.replaceChildren(h('h2', {}, modName(mod.id)), h('p', { class: 'm' }, `${mod.n} ${mod.id === 'merken' ? 'DURCHGÄNGE' : mod.id === 'konzentration' ? 'BLÖCKE' : 'AUFGABEN'} · ZEIT ${fmtClock(mod.sec)}`),
        mod.weak ? h('p', { class: 'warn small' }, `Dein schwächster Bereich (Stand ${mod.stand}). Darum ist er heute dabei.`) : null,
        h('p', { class: 'small dim' }, daily ? 'Mit Zeitdruck wie im Test. Die Lösungswege kommen am Ende.' : 'Keine Lösungen während der Simulation. Unbeantwortete Aufgaben zählen als falsch. Lieber zügig entscheiden als hängen bleiben.'),
        h('button', { class: 'btn f', onclick: () => runModule(mod) }, '> Start'));
    };
    const runModule = (mod) => {
      let level = kopftest ? CAT_KOPFTEST.stufe : Math.max(1, Math.min(8, c.levels[mod.id] || 3)), done = 0, left = mod.sec;
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
          for (const x of r) if (x.review) review.push({ ...x.review, mod: mod.id });
          const avg = r.reduce((a, x) => a + x.score, 0) / r.length;
          if (!kopftest) level = adaptStep(level, avg >= 0.6);
          next();
        }));
      };
      next();
    };
    const finish = () => {
      clearInterval(iv);
      const mods = {}; for (const [id, r] of Object.entries(results)) { mods[id] = moduleScore(r); if (kopftest) mods[id].score = Math.round((mods[id].correct / Math.max(1, mods[id].total)) * 100); }
      const ev = evaluate(mods);
      if (daily) {
        c.daily.push({ date: iso(), profile: c.profile, total: ev.total, mods });
        if (c.daily.length > 120) c.daily.splice(0, c.daily.length - 120);
        for (const [id, m] of Object.entries(mods)) { c.train.push({ date: iso(), mod: id, correct: m.correct, total: m.total, level: m.level, daily: true }); c.levels[id] = Math.max(1, Math.round(m.level)); }
        if (c.train.length > 300) c.train.splice(0, c.train.length - 300);
        onDone?.();
        head.replaceChildren(h('div', { class: 'k' }, '[ KURZEINHEIT · AUSWERTUNG ]'));
        body.replaceChildren(card(...ev.sorted.map((id) => h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('span', { class: 'small' }, modName(id)), h('span', { class: 'm' }, `${String(mods[id].correct).replace('.', ',')}/${mods[id].total} · ST. ${String(mods[id].level).replace('.', ',')}`)), progressBar(mods[id].score / 100)))),
          review.length ? card(h('div', { class: 'k' }, '[ LÖSUNGSWEGE DEINER FEHLER ]'), ...review.slice(0, 10).map((x) => h('div', { class: 'mt small' }, h('b', { style: { whiteSpace: 'pre-line' } }, x.q), h('div', { class: 'olive' }, '→ ' + x.a), x.du != null ? h('div', { class: 'dim' }, 'Du: ' + (x.du || '–')) : null, x.explain ? h('div', { class: 'dim' }, x.explain) : null))) : card(h('p', {}, 'Keine Fehler. Die Schwierigkeit steigt beim nächsten Mal.')),
          h('p', { class: 'small dim' }, 'Schwache Bereiche kommen öfter dran, bis sie aufholen. Jeden Sonntag: voller Probetest.'),
          h('button', { class: 'btn f', onclick: close }, 'Fertig'));
        app.award(15, 'cat', 'CAT-Kurzeinheit erledigt.');
        return;
      }
      if (kopftest) { c.tests.push({ date: iso(), total: ev.total, mods }); onDone?.(); } else {
        c.sims.push({ date: iso(), profile: c.profile, kurz, total: ev.total, mods }); onDone?.();
        for (const [id, s] of Object.entries(mods)) c.levels[id] = Math.max(1, Math.round(s.level));
      }
      const prevT = kopftest ? c.tests[c.tests.length - 2] : null;
      head.replaceChildren(h('div', { class: 'k' }, '[ AUSWERTUNG ]'));
      body.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'big' }, ev.total), h('div', { class: 'm' }, kopftest ? `TREFFERQUOTE IN % · FESTE STUFE ${CAT_KOPFTEST.stufe}${prevT ? ` · LETZTER TEST ${prevT.total}` : ''}` : 'GESAMTWERT (0–100) · ÜBUNGSWERT, KEIN OFFIZIELLES ERGEBNIS')),
        card(...ev.sorted.map((id) => h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('span', { class: 'small' }, modName(id)), h('span', { class: 'm' }, `${String(mods[id].correct).replace('.', ',')}/${mods[id].total} · ST. ${String(mods[id].level).replace('.', ',')} · ${mods[id].score}`)), progressBar(mods[id].score / 100)))),
        card(h('div', { class: 'k' }, '[ STÄRKEN ]'), h('p', {}, ev.staerken.map(modName).join(', ')), h('div', { class: 'k' }, '[ SCHWÄCHEN ]'), h('p', {}, ev.schwaechen.map(modName).join(', ')),
          h('p', { class: 'small dim' }, kopftest ? 'Immer gleiche Schwierigkeit – so siehst du von Monat zu Monat ehrlich, ob du besser wirst. Der schwächste Bereich kommt sonntags ins Kopftraining.' : 'Wert = 70 % Trefferquote + 30 % erreichte Schwierigkeit. Der schwächste Bereich kommt sonntags ins Kopftraining (Tagesbefehl).')),
        ...ev.schwaechen.map((id) => h('button', { class: 'btn f', onclick: () => { close(); setTimeout(() => runTraining(app, id), 350); } }, `> Training: ${modName(id)}`)),
        h('button', { class: 'btn', onclick: close }, 'Fertig'));
      app.award(kopftest ? 30 : kurz ? 20 : 40, 'cat', kopftest ? 'Kopf-Test abgeschlossen.' : 'Simulation abgeschlossen.');
    };
    intro();
    return h('div', {}, head, body);
  }, { full: true });
  m.onClose(() => { clearInterval(iv); if (mi < plan.length && !aborted) { aborted = true; toast(`${kopftest ? 'Kopf-Test' : 'Simulation'} abgebrochen – nichts gespeichert.`); } app.refresh(); });
}

// ---------- Training ----------
export function runTraining(app, mod, n = ({ merken: 3, konzentration: 3, reaktion: 2, diktat: 5 })[mod] || 10, onDone) {
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
      onDone?.();
      head.replaceChildren(h('div', { class: 'k' }, `[ TRAINING ${CAT_MODULES[mod].kurz.toUpperCase()} ABGESCHLOSSEN ]`));
      body.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'big' }, `${Math.round((correct / Math.max(1, all.length)) * 100)} %`), h('div', { class: 'm' }, `${String(correct).replace('.', ',')} VON ${all.length} RICHTIG · NEUE STUFE ${level}`)), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      app.award(15, 'cat', 'CAT-Training erledigt.');
    };
    next();
    return h('div', {}, h('p', { class: 'small dim' }, `${modName(mod)} · Übungsaufgaben mit Lösungsweg`), head, body);
  }, { full: true });
  m.onClose(() => app.refresh());
}

