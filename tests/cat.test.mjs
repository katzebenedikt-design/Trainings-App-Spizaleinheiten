// CAT-Test: Profile, Aufgaben-Generatoren (Fuzz), Würfelnetze (Falt-Simulation), Adaptivität, Auswertung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CAT_MODULES, CAT_PROFILES, RECHTSCHREIBUNG, SYNONYME, WISSEN, TECHNIK, ANALOGIEN } from '../app/js/data/cat.js';
import { makeItem, seeded, adaptStep, adaptTraining, moduleScore, evaluate, cubeNet, rotN, mirror, keyOf, MAXL, diktatScore, pickDaily, moduleStand } from '../app/js/core/cat.js';
import { DIKTAT } from '../app/js/data/cat.js';

test('Profile: Bundespolizei beginnt mit Diktat, Bundeswehr prüft Reaktion', () => {
  assert.equal(CAT_PROFILES.bpol.module[0].id, 'diktat');
  assert.ok(CAT_PROFILES.bw.module.some((m) => m.id === 'reaktion'));
});

test('Profile: Bundeswehr und Bundespolizei, alle Module gültig', () => {
  assert.deepEqual(Object.keys(CAT_PROFILES).sort(), ['bpol', 'bw']);
  for (const P of Object.values(CAT_PROFILES)) {
    assert.ok(P.name && P.fuer && P.hinweis && /^https:\/\//.test(P.quelle.url));
    for (const m of P.module) { assert.ok(CAT_MODULES[m.id], m.id); assert.ok(m.n > 0 && m.min > 0); if (m.typen) for (const t of Object.keys(m.typen)) assert.ok(CAT_MODULES[m.id].typen.includes(t), t); }
    // Alle Grundbereiche sind enthalten, keine doppelt
    for (const id of ['sprache', 'mathe', 'logik', 'raum', 'technik', 'merken', 'konzentration', 'allgemein']) assert.ok(P.module.some((m) => m.id === id), id);
    assert.equal(new Set(P.module.map((m) => m.id)).size, P.module.length);
  }
});

test('Banken: keine doppelten Antworten, alle Stufen vorhanden', () => {
  for (const row of RECHTSCHREIBUNG) assert.equal(new Set(row.slice(1)).size, 4, row[1]);
  for (const row of SYNONYME) assert.equal(new Set(row.slice(2)).size, 4, row[1]);
  for (const row of WISSEN) assert.equal(new Set(row.slice(2)).size, 4, row[1]);
  for (const row of TECHNIK) assert.equal(new Set(row.slice(2, 6)).size, 4, row[1]);
  for (const row of ANALOGIEN) assert.ok(!row[3].includes(row[2]), row[1]);
  for (const bank of [RECHTSCHREIBUNG, SYNONYME, WISSEN, TECHNIK, ANALOGIEN]) assert.deepEqual([...new Set(bank.map((x) => x[0]))].sort(), [1, 2, 3]);
});

// Würfel abrollen: jede Zelle bekommt die Fläche, die unten liegt. Gültiges Netz = 6 verschiedene Flächen.
function folds(cells) {
  const has = new Map(cells.map((c) => [c.join(','), c]));
  const roll = { '1,0': (o) => ({ ...o, D: o.E, E: o.U, U: o.W, W: o.D }), '-1,0': (o) => ({ ...o, D: o.W, W: o.U, U: o.E, E: o.D }), '0,1': (o) => ({ ...o, D: o.S, S: o.U, U: o.N, N: o.D }), '0,-1': (o) => ({ ...o, D: o.N, N: o.U, U: o.S, S: o.D }) };
  const seen = new Map(); const q = [[cells[0], { U: 'U', D: 'D', N: 'N', S: 'S', E: 'E', W: 'W' }]];
  seen.set(cells[0].join(','), 'D');
  while (q.length) {
    const [[x, y], o] = q.shift();
    for (const d of Object.keys(roll)) { const [dx, dy] = d.split(',').map(Number); const k = `${x + dx},${y + dy}`; if (has.has(k) && !seen.has(k)) { const o2 = roll[d](o); seen.set(k, o2.D); q.push([has.get(k), o2]); } }
  }
  return new Set(seen.values()).size === 6 && seen.size === 6;
}

test('Würfelnetze: richtige Antwort faltbar, falsche nicht', () => {
  for (let s = 1; s < 300; s++) {
    const r = seeded(s);
    assert.ok(folds(cubeNet(r, true)));
    assert.ok(!folds(cubeNet(r, false)));
    const it = makeItem('raum', 5, seeded(s), { netz: 1 });
    it.options.forEach((o, i) => assert.equal(folds(o.poly), i === it.answer));
  }
});

test('Figur drehen: Lösung ist Drehung, Ablenker sind gespiegelt', () => {
  for (let s = 1; s < 300; s++) {
    const it = makeItem('raum', 1 + (s % 10), seeded(s), { drehen: 1 });
    const rots = [0, 1, 2, 3].map((k) => keyOf(rotN(it.poly, k)));
    it.options.forEach((o, i) => assert.equal(rots.includes(keyOf(o.poly)), i === it.answer, `seed ${s}`));
    assert.ok(it.options.every((o, i) => i === it.answer || [0, 1, 2, 3].some((k) => keyOf(rotN(mirror(it.poly), k)) === keyOf(o.poly))));
  }
});

test('Alle Generatoren: gültige, eindeutige Aufgaben auf allen Stufen', () => {
  for (let s = 1; s < 120; s++) for (const mod of Object.keys(CAT_MODULES)) for (let lv = 1; lv <= MAXL; lv++) {
    const it = makeItem(mod, lv, seeded(s * 31 + lv));
    assert.equal(it.mod, mod); assert.ok(it.explain, `${mod}/${it.typ}: Lösungsweg fehlt`);
    if (it.kind === 'mc') { assert.ok(it.options.length >= 2 && it.answer >= 0 && it.answer < it.options.length, `${mod}/${it.typ}`); assert.equal(new Set(it.options.map((o) => JSON.stringify(o))).size, it.options.length, `${mod}/${it.typ} ${it.q}`); }
    if (it.kind === 'memo') for (const q of it.qs) { assert.ok(q.answer >= 0); assert.equal(new Set(q.options.map((o) => o.t)).size, q.options.length); }
    if (it.kind === 'd2') { assert.ok(it.items.some((x) => x.target)); assert.ok(it.items.every((x) => x.target === (x.letter === 'd' && x.up + x.down === 2))); }
  }
});

test('Mathe: Lösungen rechnerisch richtig', () => {
  const num = (t) => Number(String(t).replace(/[^\d,-]/g, '').replace(',', '.'));
  for (let s = 1; s < 400; s++) {
    const it = makeItem('mathe', 1 + (s % 10), seeded(s));
    const a = num(it.options[it.answer].t);
    let m;
    if ((m = it.q.match(/^(\d+) ([+−·:]) (\d+) = \?$/))) { const [x, y] = [Number(m[1]), Number(m[3])]; assert.equal(a, { '+': x + y, '−': x - y, '·': x * y, ':': x / y }[m[2]], it.q); }
    else if ((m = it.q.match(/^\((\d+) − (\d+)\) · (\d+)/))) assert.equal(a, (m[1] - m[2]) * m[3]);
    else if ((m = it.q.match(/^(\d+)x \+ (\d+) = (\d+)/))) assert.equal(m[1] * a + Number(m[2]), Number(m[3]));
    else if ((m = it.q.match(/^Wie viel sind ([\d,]+) % von (\d+)/))) assert.equal(a, (num(m[1]) * m[2]) / 100);
    else if ((m = it.q.match(/fährt konstant (\d+) km\/h.*für (\d+) km/))) assert.equal(a, (m[2] / m[1]) * 60);
  }
});

test('Adaptivität und Auswertung', () => {
  assert.equal(adaptStep(5, true), 6); assert.equal(adaptStep(1, false), 1); assert.equal(adaptStep(10, true), 10);
  assert.equal(adaptTraining(4, [1, 1, 1, 1, 1]), 5); assert.equal(adaptTraining(4, [0, 0, 1, 0, 0]), 3); assert.equal(adaptTraining(4, [1, 0, 1, 1, 0]), 4); assert.equal(adaptTraining(4, [1, 1]), 4);
  const hi = moduleScore([{ score: 1, level: 8 }, { score: 1, level: 9 }]), lo = moduleScore([{ score: 0, level: 2 }, { score: 1, level: 1 }]);
  assert.ok(hi.score > 90 && lo.score < 45);
  const ev = evaluate({ sprache: { score: 80 }, mathe: { score: 40 }, raum: { score: 60 }, logik: { score: 20 } });
  assert.deepEqual(ev.schwaechen, ['logik', 'mathe']); assert.deepEqual(ev.staerken, ['sprache', 'raum']); assert.equal(ev.total, 50);
});

test('Diktat: Groß-/Kleinschreibung und das/dass zählen, Satzzeichen nicht', () => {
  const t = 'Ich hoffe, dass das Training heute nicht ausfällt.';
  assert.equal(diktatScore(t, 'Ich hoffe dass das Training heute nicht ausfällt').errors, 0);
  const r = diktatScore(t, 'ich hoffe das das training heute nicht ausfällt');
  assert.equal(r.errors, 3); assert.deepEqual(r.wrong, ['Ich', 'dass', 'Training']);
  assert.equal(diktatScore(t, '').score, 0);
  for (const [, s] of DIKTAT) { assert.match(s, /^[A-ZÄÖÜ].*[.!?]$/); assert.equal(diktatScore(s, s).score, 1); }
});

test('Reaktion: Ziele und Ablenker, Zeitfenster schrumpft mit der Stufe', () => {
  const a = makeItem('reaktion', 1, seeded(2)), b = makeItem('reaktion', 10, seeded(2));
  assert.equal(a.kind, 'react'); assert.ok(a.trials.some((t) => t.target)); assert.ok(a.trials.some((t) => !t.target));
  assert.ok(b.windowMs < a.windowMs && b.trials.length > a.trials.length);
});

test('Tägliche Kurzeinheit: schwächster Bereich immer dabei, Schwächen öfter, Reihenfolge wie im Test', () => {
  const c = { sims: [{ date: '2026-11-01', mods: { raum: { score: 20 }, mathe: { score: 90 }, sprache: { score: 85 }, logik: { score: 80 }, technik: { score: 85 }, merken: { score: 80 }, konzentration: { score: 85 }, reaktion: { score: 85 }, allgemein: { score: 90 } } }], train: [] };
  const order = CAT_PROFILES.bw.module.map((m) => m.id);
  let rare = 0, often = 0;
  for (let s = 1; s < 300; s++) {
    const p = pickDaily(c, CAT_PROFILES.bw, Math.random);
    assert.equal(p.length, 3); assert.ok(p.some((m) => m.id === 'raum' && m.weak));
    const idx = p.map((m) => order.indexOf(m.id)); assert.deepEqual(idx, [...idx].sort((x, y) => x - y));
    if (p.some((m) => m.id === 'mathe')) rare++; if (p.some((m) => m.id === 'logik')) often++;
  }
  assert.ok(often > rare, 'schwächerer Bereich (Logik 80) öfter als stärkerer (Mathe 90)');
  // Training fließt ein: schlechte Trainings senken den Stand
  c.train = [{ mod: 'mathe', correct: 2, total: 10 }];
  assert.equal(moduleStand(c, ['mathe']).mathe, 55);
  const sum = pickDaily(c, CAT_PROFILES.bw).reduce((a, m) => a + m.min, 0);
  assert.ok(sum >= 7 && sum <= 15, 'ca. 10–15 Minuten');
});
