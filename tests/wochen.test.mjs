// Wochen-Update: Auswertung, Entscheidung (runter/halten/hoch) und Wirkung auf den Plan der nächsten Woche.
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../app/js/core/store.js';
import { wochenAuswertung, wochenUpdateFaellig } from '../app/js/core/wochen.js';
import { plannedDay } from '../app/js/core/planner.js';
import { baseDay } from '../app/js/core/plan.js';
import { violations } from '../app/js/core/rules.js';
import { addDays, isoWeekKey } from '../app/js/core/util.js';

const st = () => { const s = defaultState(); s.created = '2026-11-02T08:00:00Z'; s.profile.targetDate = '2028-06-05'; return s; };
const MON = '2026-11-16';
const fillWeek = (s, row) => { for (let i = 0; i < 7; i++) s.daily.push({ date: addDays(MON, i), ...row }); };
const doAll = (s) => { for (let i = 0; i < 7; i++) { const d = addDays(MON, i); plannedDay(s, d, { withReadiness: false }).sessions.forEach((x, k) => { if (!x.rest) (s.done[d] = s.done[d] || []).push('train:' + k); }); } };

test('Schlechte Woche (HRV niedrig, überlastet) → Intensität runter', () => {
  const s = st(); fillWeek(s, { hrv7: 50, hrvStatus: 'niedrig', readiness: 30, trainingStatus: 'ueberlastet', sleepH: 7 });
  const w = wochenAuswertung(s, MON, addDays(MON, 7));
  assert.equal(w.stufe, 'runter'); assert.equal(w.faktor, 0.85);
  assert.ok(w.gruende.some((g) => g.includes('HRV-Status niedrig'))); assert.ok(w.gruende.some((g) => g.includes('überlastet')));
  assert.equal(w.training.erledigt, 0); assert.ok(w.training.ausgelassen.length > 3);
});

test('Gute Woche mit allem erledigt → leicht steigern', () => {
  const s = st(); fillWeek(s, { hrv7: 70, hrvStatus: 'ausgeglichen', readiness: 75, trainingStatus: 'produktiv' }); doAll(s);
  const w = wochenAuswertung(s, MON, addDays(MON, 7));
  assert.equal(w.stufe, 'hoch'); assert.equal(w.training.quote, 1);
});

test('Unklare Daten → halten; starke Schmerzen → runter', () => {
  const s = st();
  assert.equal(wochenAuswertung(s, MON, addDays(MON, 7)).stufe, 'halten');
  s.pain.push({ id: 'p1', date: addDays(MON, 2), typ: 'knie', seite: 'r', label: 'Knie rechts', staerke: 7, art: 'stechend' });
  const w = wochenAuswertung(s, MON, addDays(MON, 7));
  assert.equal(w.stufe, 'runter'); assert.equal(w.schmerzen.length, 1);
});

test('Montags fällig: wirkt auf die laufende Woche, harte Einheiten werden leichter, Regeln bleiben', () => {
  const s = st(); fillWeek(s, { hrv7: 48, hrvStatus: 'niedrig', readiness: 25 });
  const nextMon = addDays(MON, 7);
  const vorher = []; for (let i = 0; i < 7; i++) vorher.push(...baseDay(s, addDays(nextMon, i)).sessions.map((x) => x.code));
  const w = wochenUpdateFaellig(s, nextMon);
  assert.ok(w); assert.equal(wochenUpdateFaellig(s, nextMon), null, 'nur einmal pro Woche');
  assert.equal(s.weekAdj[isoWeekKey(nextMon)].stufe, 'runter');
  const nachher = []; for (let i = 0; i < 7; i++) { const d = addDays(nextMon, i); const day = plannedDay(s, d, { withReadiness: false }); nachher.push(...day.sessions.map((x) => x.code)); assert.deepEqual(violations(d, day.sessions), [], d); }
  for (const hart of ['TB3', 'TB4', 'K4', 'EILMARSCH']) assert.ok(!nachher.includes(hart), hart);
  assert.ok(baseDay(s, nextMon).ctx.vol < 1);
  assert.ok(vorher.length > 0);
});
