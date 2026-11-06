// Sprachen: Pakete gültig, SM-2, Einstufung, Stunden-Richtwerte, Bestandsdaten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadPacks, validatePack, langState, lessonsOf, nextLessonOf, placementStep, hoursEstimate, logStudy, applyLevel, workLevel, LEVELS } from '../app/js/core/langpacks.js';
import { sm2, checkAnswer, norm } from '../app/js/core/lang.js';
import { defaultState, normalize } from '../app/js/core/store.js';

const dir = new URL('../app/sprachen/', import.meta.url);
const readJSON = (p) => Promise.resolve(JSON.parse(readFileSync(new URL(p.replace('./sprachen/', ''), dir), 'utf8')));
const packs = await loadPacks(readJSON);

test('Alle Sprachpakete laden und sind gültig', () => {
  const idx = JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'));
  assert.deepEqual(Object.keys(packs).sort(), [...idx.pakete].sort());
  for (const p of Object.values(packs)) {
    assert.deepEqual(validatePack(p), [], p.code);
    for (const lv of Object.keys(p.stufen)) assert.ok(LEVELS.includes(lv));
    // Jede Lektion hat genug Chunks, Antworten der Tests sind eindeutig
    for (const l of lessonsOf(p)) assert.ok(l.chunks.length >= 4, `${p.code} ${l.id}`);
    for (const s of Object.values(p.stufen)) for (const t of s.test || []) assert.equal(new Set(t.optionen).size, t.optionen.length, t.frage);
    for (const s of Object.values(p.stufen)) for (const q of s.quellen || []) assert.match(q.url, /^https:\/\//);
  }
  // Gewünschte Sprachen sind da, Englisch geht bis C2
  for (const c of ['en', 'es', 'fr', 'ru', 'ar']) assert.ok(packs[c], c);
  assert.deepEqual(Object.keys(packs.en.stufen), LEVELS);
  for (const lv of LEVELS) assert.ok(packs.en.stufen[lv].test.length >= 6, 'Englisch Test ' + lv);
});

test('Validierung meldet Fehler verständlich', () => {
  assert.ok(validatePack({}).length);
  const e = validatePack({ code: 'it', name: 'Italienisch', tts: 'it-IT', stufen: { X1: {}, A1: { einheiten: [{ id: 'a', titel: 'b', lektionen: [[['nur eins']]] }], test: [{ frage: 'f', optionen: ['a'], loesung: 3 }] } } });
  assert.ok(e.some((x) => x.includes('X1')));
  assert.ok(e.some((x) => x.includes('Paare')));
  assert.ok(e.some((x) => x.includes('Testfrage')));
});

test('SM-2: Abstände wachsen, Fehler setzt zurück, EF mind. 1,3', () => {
  let c = null; const iv = [];
  for (let i = 0; i < 4; i++) { c = sm2(c, 4, '2026-11-01'); iv.push(c.interval); }
  assert.deepEqual(iv.slice(0, 2), [1, 6]);
  assert.ok(iv[2] > iv[1] && iv[3] > iv[2]);
  const r = sm2(c, 1, '2026-11-01'); assert.equal(r.interval, 1); assert.equal(r.n, 0); assert.equal(r.ef, c.ef);
  let d = null; for (let i = 0; i < 20; i++) d = sm2(d, 3, '2026-11-01');
  assert.ok(d.ef >= 1.3);
});

test('Aussprache-Prüfung: Lautschrift und arabische Vokalzeichen stören nicht', () => {
  assert.equal(checkAnswer(['где болит'], ['Где болит? (gdje balit)']).verdict, 'richtig');
  assert.equal(norm('أَيْنَ الأَلَمُ؟'), norm('أين الألم؟ (ayna al-alam)'));
  assert.equal(checkAnswer(['está herido'], ['¿Está herido?']).verdict, 'richtig');
});

test('Einstufung: adaptiv nach oben und unten', () => {
  const p = packs.en;
  assert.equal(placementStep(p, []).next, 'A2');
  const pass = (level) => ({ level, correct: 4, total: 4 }), fail = (level) => ({ level, correct: 1, total: 4 });
  assert.equal(placementStep(p, [pass('A2')]).next, 'B1');
  assert.deepEqual(placementStep(p, [pass('A2'), fail('B1')]), { done: true, level: 'A2' });
  assert.equal(placementStep(p, [fail('A2')]).next, 'A1');
  assert.deepEqual(placementStep(p, [fail('A2'), pass('A1')]), { done: true, level: 'A1' });
  assert.deepEqual(placementStep(p, [fail('A2'), fail('A1')]), { done: true, level: null });
  assert.deepEqual(placementStep(p, ['A2', 'B1', 'B2', 'C1', 'C2'].map(pass)), { done: true, level: 'C2' });
});

test('Stunden-Richtwert: ehrlich, sinkt mit Lernzeit, schwere Sprachen dauern länger', () => {
  const st = defaultState();
  const L = langState(st, 'en');
  const e0 = hoursEstimate(packs.en, L, '2026-11-06');
  assert.equal(e0.target, 'A1'); assert.equal(e0.toNext, 100);
  logStudy(L, 600, 'lektion', '2026-11-06');
  assert.equal(hoursEstimate(packs.en, L, '2026-11-06').toNext, 90);
  applyLevel(L, 'B1', 'einstufung');
  const e1 = hoursEstimate(packs.en, L, '2026-11-06');
  assert.equal(e1.target, 'B2'); assert.equal(e1.toNext, 200); assert.equal(workLevel(L), 'B2');
  const A = langState(st, 'ar'); applyLevel(A, 'A1', 'test');
  assert.ok(hoursEstimate(packs.ar, A).toNext > hoursEstimate(packs.es, langState(st, 'es')).toNext);
});

test('Bestandsdaten: alter Englisch-Fortschritt bleibt erhalten', () => {
  const old = normalize({ profile: { name: 'X' }, lang: { active: 'en', langs: { en: { start: '2026-10-01', lessons: { 'u1-0': { score: 90, date: '2026-10-01' }, 'u1-1': { score: 80, date: '2026-10-02' } }, xp: 40, dialogs: { d1: 100 }, perfectDialogs: 1 } } }, cards: { 'en:Nice to meet you.': { box: 2, due: '2026-10-05' } } });
  assert.deepEqual(old.lang.custom, {});
  const L = langState(old, 'en');
  assert.equal(L.xp, 40); assert.equal(L.min, 16); assert.equal(L.dialogs.d1, 100);
  assert.equal(nextLessonOf(packs.en, L).id, 'u2-0');
  assert.ok(old.cards['en:Nice to meet you.']);
  // Nach Einstufung B1 geht es mit B2 weiter
  applyLevel(L, 'B1', 'einstufung');
  assert.equal(nextLessonOf(packs.en, L).level, 'B2');
});
