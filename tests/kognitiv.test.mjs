// Kognitivtraining: jeden Tag ein Training, Sonntag schwächster CAT-Bereich, Freitag optional.
import test from 'node:test';
import assert from 'node:assert/strict';
import { kognitivFuer } from '../app/js/core/kognitiv.js';
import { KOGNITIV_WOCHE } from '../app/js/data/kognitiv.js';
import { CAT_MODULES } from '../app/js/data/cat.js';
const GAMES = { rechnen: 1, merken: 1, reaktion: 1, muster: 1, stress: 1 }; // Spiele aus views/games.js
import { defaultState } from '../app/js/core/store.js';
import { addDays } from '../app/js/core/util.js';

test('Wochenplan: 7 Tage, gültige Spiele und CAT-Bereiche', () => {
  assert.equal(KOGNITIV_WOCHE.length, 7);
  const st = defaultState();
  for (let i = 0; i < 14; i++) {
    const p = kognitivFuer(st, addDays('2026-11-09', i)); // Montag
    assert.ok(p.titel && p.min > 0);
    if (p.typ === 'spiel') assert.ok(GAMES[p.key], p.key); else assert.ok(CAT_MODULES[p.key], p.key);
  }
  assert.ok(kognitivFuer(st, '2026-11-13').optional, 'Freitag optional');
  assert.ok(kognitivFuer(st, '2026-11-14').belastung, 'Samstag unter Belastung');
});

test('Sonntag: alle 4 Wochen Kopf-Test, sonst schwächster Bereich oder Rotation', () => {
  const st = defaultState();
  const sundays = Array.from({ length: 8 }, (_, i) => addDays('2026-11-15', i * 7));
  const kinds = sundays.map((d) => kognitivFuer(st, d));
  assert.equal(kinds.filter((p) => p.typ === 'kopftest').length, 2);
  const normal = sundays.filter((d, i) => kinds[i].typ !== 'kopftest');
  assert.ok(new Set(normal.map((d) => kognitivFuer(st, d).key)).size > 1, 'Rotation');
  st.cat.sims.push({ date: '2026-11-10', mods: { mathe: { score: 80 }, raum: { score: 30 }, logik: { score: 60 } } });
  assert.equal(kognitivFuer(st, normal[0]).key, 'raum');
  // Neuerer Kopf-Test zählt
  st.cat.tests.push({ date: '2026-11-12', mods: { mathe: { score: 20 }, raum: { score: 70 }, logik: { score: 60 } } });
  assert.equal(kognitivFuer(st, normal[0]).key, 'mathe');
});
