// Kognitivtraining: jeden Tag ein Training, Sonntag schwächster CAT-Bereich, Freitag optional.
import test from 'node:test';
import assert from 'node:assert/strict';
import { kognitivFuer } from '../app/js/core/kognitiv.js';
import { KOGNITIV_WOCHE } from '../app/js/data/kognitiv.js';
import { defaultState } from '../app/js/core/store.js';
import { addDays } from '../app/js/core/util.js';

test('Wochenplan: Mo–Sa CAT-Kurzeinheit, Sonntag voller Probetest, Freitag optional', () => {
  assert.equal(KOGNITIV_WOCHE.length, 7);
  const st = defaultState();
  const days = Array.from({ length: 7 }, (_, i) => kognitivFuer(st, addDays('2026-11-09', i)));
  assert.deepEqual(days.slice(0, 6).map((p) => p.typ), Array(6).fill('cat-kurz'));
  assert.ok(days[4].optional); assert.ok(days[5].belastung);
  assert.ok(['probetest', 'kopftest'].includes(days[6].typ));
  assert.ok(days[0].grund.includes('heute sicher dabei'));
});

test('Sonntag: in der Regenerationswoche Kopf-Test statt Probetest', () => {
  const st = defaultState();
  const sundays = Array.from({ length: 12 }, (_, i) => kognitivFuer(st, addDays('2026-11-15', i * 7)).typ);
  assert.ok(sundays.includes('kopftest') && sundays.includes('probetest'));
});
