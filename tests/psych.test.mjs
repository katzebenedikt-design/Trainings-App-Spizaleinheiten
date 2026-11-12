// Psychologengespräch: Fragenauswahl, Fragebogen-Auswertung, Tagebuch, Aufnahmen begrenzen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMEN, CHECK, FRAGEBOGEN, LEBENSLAUF, MOTIVATION } from '../app/js/data/psych.js';
import { pickQuestions, checkPct, weakestCriterion, fragebogenItems, fragebogenAuswerten, buildLetter, dailyPrompts } from '../app/js/core/psych.js';
import { pruneIds } from '../app/js/core/recorder.js';
import { defaultState, normalize } from '../app/js/core/store.js';

test('Fragenkatalog: alle geforderten Themen', () => {
  const names = Object.values(THEMEN).map((t) => t.name);
  for (const n of ['Motivation', 'Lebenslauf', 'Familie & Umfeld', 'Stärken & Schwächen', 'Umgang mit Stress', 'Fehler & Rückschläge', 'Teamarbeit', 'Konflikte', 'Werte', 'Belastung', 'Plan B']) assert.ok(names.includes(n), n);
  for (const t of Object.values(THEMEN)) { assert.ok(t.fragen.length >= 5); assert.ok(t.worum); }
  assert.equal(CHECK.length, 4);
  assert.ok(LEBENSLAUF.length >= 4 && MOTIVATION.length >= 5);
});

test('Fragen: zufällig, ohne Wiederholung, Themen wechseln, Geübtes zuletzt', () => {
  const qs = pickQuestions([], 10);
  assert.equal(qs.length, 10); assert.equal(new Set(qs.map((q) => q.q)).size, 10);
  for (let i = 1; i < qs.length; i++) assert.notEqual(qs[i].topic, qs[i - 1].topic);
  const only = pickQuestions(['planb'], 3); assert.ok(only.every((q) => q.topic === 'planb'));
  const seen = THEMEN.planb.fragen.slice(0, 4).map((q) => ({ q }));
  assert.deepEqual(pickQuestions(['planb'], 1, seen).map((x) => x.q), [THEMEN.planb.fragen[4]]);
});

test('Selbstbewertung', () => {
  assert.equal(checkPct({ ehrlich: 2, konkret: 2, ruhig: 2, haltung: 2 }), 100);
  assert.equal(checkPct({ ehrlich: 2, konkret: 0, ruhig: 1, haltung: 1 }), 50);
  assert.equal(weakestCriterion([{ check: { ehrlich: 2, konkret: 0, ruhig: 2, haltung: 1 } }]).id, 'konkret');
  assert.equal(weakestCriterion([]), null);
});

test('Übungsfragebogen: Widersprüche und geschönte Antworten werden erkannt', () => {
  const items = fragebogenItems();
  assert.equal(items.length, FRAGEBOGEN.paare.length * 2 + FRAGEBOGEN.kontrolle.length);
  for (let i = 1; i < items.length; i++) if (items[i].id[0] === 'p') assert.notEqual(items[i].id.slice(0, -1), items[i - 1].id.slice(0, -1));
  const ans = {}; FRAGEBOGEN.paare.forEach(([, , rev], i) => { ans[`p${i}a`] = 4; ans[`p${i}b`] = rev ? 2 : 4; }); FRAGEBOGEN.kontrolle.forEach((_, i) => { ans[`k${i}`] = 2; });
  let r = fragebogenAuswerten(ans);
  assert.equal(r.stimmig, FRAGEBOGEN.paare.length); assert.equal(r.geschoent.length, 0);
  ans.p0a = 5; ans.p0b = 5; ans.k0 = 5; // ruhig UND schnell nervös; „nie gelogen“
  r = fragebogenAuswerten(ans);
  assert.equal(r.widerspruch.length, 1); assert.equal(r.geschoent.length, 1);
});

test('Motivationsschreiben nur aus eigenen Antworten, Tagebuch-Leitfragen', () => {
  assert.equal(buildLetter({ warum: ' Weil … ', getan: 'Training.', fremd: 'x' }), 'Weil …\n\nTraining.');
  const p = dailyPrompts('2026-11-04'); assert.equal(p.length, 2); assert.notEqual(p[0], p[1]);
  assert.equal(dailyPrompts('2026-11-08').length, 3); // Sonntag: Wochenrückblick
  assert.deepEqual(dailyPrompts('2026-11-04'), dailyPrompts('2026-11-04'));
});

test('Aufnahmen: nur die letzten 30 bleiben, Daten in der Sicherung', () => {
  const entries = Array.from({ length: 35 }, (_, i) => ({ id: 'a' + i, ts: i, audio: i % 7 !== 0 }));
  const drop = pruneIds(entries, 30);
  const withAudio = entries.filter((e) => e.audio).length;
  assert.equal(drop.length, Math.max(0, withAudio - 30));
  assert.ok(drop.every((id) => Number(id.slice(1)) < 10));
  const st = normalize({ profile: { name: 'X' } });
  assert.deepEqual(st.psych.answers, []); assert.deepEqual(defaultState().cat.sims, []);
});

test('Tägliche Kurzeinheit: 7 Tage, 5–10 min, verbunden mit Kopftraining, geforderte Themen', async () => {
  const { PSYCH_WOCHE, MEHRTEILIG, BEISPIEL_THEMEN, AUFSATZ, STAR } = await import('../app/js/data/psych.js');
  const { psychFuer, wortzahl, bogenStabilitaet } = await import('../app/js/core/psych.js');
  assert.equal(PSYCH_WOCHE.length, 7);
  for (const p of PSYCH_WOCHE) { assert.ok(p.min >= 4 && p.min <= 10, p.titel); assert.ok(p.kopf); for (const t of p.topics || []) assert.ok(THEMEN[t], t); }
  const topics = new Set(PSYCH_WOCHE.flatMap((p) => p.topics || []));
  for (const t of ['motivation', 'stress', 'fehler']) assert.ok(topics.has(t));
  assert.ok(MEHRTEILIG.some((q) => q.topic === 'lebenslauf') && MEHRTEILIG.some((q) => q.topic === 'team'));
  for (const q of MEHRTEILIG) { assert.ok(THEMEN[q.topic]); assert.equal(q.teile.length, 3); }
  for (const t of BEISPIEL_THEMEN) assert.ok(THEMEN[t], t);
  assert.equal(STAR.length, 5); assert.ok(AUFSATZ.length >= 5);
  assert.equal(psychFuer('2026-11-09').art, 'gespraech'); assert.ok(psychFuer('2026-11-13').optional);
  assert.equal(wortzahl('  Ich will   das. Wirklich '), 4); assert.equal(wortzahl(''), 0);
  assert.equal(bogenStabilitaet([{ ans: { a: 1 } }]), null);
  const s = bogenStabilitaet([{ ans: { a: 1, b: 5, c: 3 } }, { ans: { a: 2, b: 1, c: 3 } }]);
  assert.deepEqual(s, { stabil: 2, gesamt: 3, wechsel: ['b'] });
});
