// Planänderungen aus den PDFs: 6-Wochen-Rhythmus, langer Marsch, Apnoe, Agilität, kurze Intervalle – feste Regeln bleiben.
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../app/js/core/store.js';
import { baseDay, cycleWeek, phaseAt } from '../app/js/core/plan.js';
import { plannedDay } from '../app/js/core/planner.js';
import { violations } from '../app/js/core/rules.js';
import { addDays, mondayOf } from '../app/js/core/util.js';
import { getNorms } from '../app/js/data/requirements.js';
import { PLAN_AENDERUNGEN } from '../app/js/data/plan-quellen.js';

const st = () => { const s = defaultState(); s.created = '2026-11-02T08:00:00Z'; s.profile.targetDate = '2028-06-05'; return s; };
const days = (s, from, n) => Array.from({ length: n }, (_, i) => baseDay(s, addDays(from, i)));

test('6-Wochen-Rhythmus: Woche 6 ist Regeneration mit Leistungstest (KSK S. 14–16)', () => {
  assert.deepEqual([1, 5, 6, 7, 12].map((w) => cycleWeek(w)), [1, 5, 6, 1, 6]);
  const s = st(); const mon = mondayOf('2026-11-02');
  const reg = []; for (let w = 0; w < 12; w++) reg.push(baseDay(s, addDays(mon, w * 7)).deload);
  assert.deepEqual(reg.map((x, i) => (x ? i + 1 : 0)).filter(Boolean), [6, 12]);
  const testWeek = days(s, addDays(mon, 5 * 7), 7);
  assert.equal(testWeek[0].sessions[0].code, 'TESTKRAFT'); assert.equal(testWeek[2].sessions[0].code, 'TESTSCHWIMMEN'); assert.equal(testWeek[5].sessions[0].code, 'TESTLAUF');
});

test('Spezifik: langer Marsch 30–40 km (KSK S. 8); Leistung: K4 in Woche 1 und 4', () => {
  const s = st();
  let lang = [], k4 = 0, k2 = 0;
  for (let d = '2026-11-02'; d < '2028-05-20'; d = addDays(d, 7)) {
    for (let i = 0; i < 7; i++) {
      const day = baseDay(s, addDays(d, i));
      for (const x of day.sessions) { if (x.code === 'MTLANG') lang.push(Number(x.sub.split(' ')[0])); if (day.phase.key === 'leistung' && x.code === 'K4') k4++; if (day.phase.key === 'leistung' && x.code === 'K2') k2++; }
    }
  }
  assert.ok(lang.length >= 1); assert.ok(lang.every((km) => km >= 30 && km <= 40)); assert.equal(Math.max(...lang), Math.min(40, Math.max(...lang)));
  assert.ok(k4 > 0 && k2 > 0);
});

test('Apnoe nur mit Aufsicht, Agilität vor Intervallen, kurze Intervalle in Woche 4', () => {
  const s = st(); let apnoe = false, agil = false, kurz = false;
  for (let d = '2026-11-02'; d < '2028-05-20'; d = addDays(d, 1)) {
    const day = baseDay(s, d);
    for (const x of day.sessions) {
      const txt = JSON.stringify(x.blocks);
      if (x.code === 'ST' && txt.includes('Apnoe')) { apnoe = true; assert.ok(txt.includes('NUR mit Aufsicht')); assert.notEqual(day.phase.key, 'grundlage'); }
      if (['TB3', 'TB4'].includes(x.code) && txt.includes('Agilität')) agil = true;
      if (x.code === 'TB4' && x.sub.includes('16× 200 m')) { kurz = true; assert.equal(day.cycleWeek, 4); }
    }
  }
  assert.ok(apnoe && agil && kurz);
});

test('Feste Wochenregeln gelten weiter (kein Lauf/Schwimmen an Kickbox-Tagen, Freitag frei)', () => {
  const s = st();
  for (let d = '2026-11-02'; d < '2028-05-30'; d = addDays(d, 1)) {
    const day = plannedDay(s, d, { withReadiness: false });
    assert.deepEqual(violations(d, day.sessions), [], d);
  }
});

test('Zielwert 200 m Kleiderschwimmen und Quellenliste', () => {
  const n = getNorms({ unit: 'offen' }).kleider200;
  assert.equal(n.min, 450); assert.ok(n.lower);
  for (const x of PLAN_AENDERUNGEN) { assert.ok(['ksk', 'egb', 'nsw'].includes(x.quelle)); assert.ok(x.seite && x.was && x.warum); }
  assert.ok(phaseAt(st(), '2028-04-01').phase.key);
});
