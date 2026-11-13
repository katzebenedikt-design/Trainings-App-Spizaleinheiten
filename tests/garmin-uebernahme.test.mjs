// Garmin-Trainings → Trainingstracker: Kraftsätze übernehmen, geplante Einheit abhaken, keine Doppelungen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { mapGarmin, mapSets, mergePayload } from '../app/js/core/garmin-map.js';
import { applyGarminPayload } from '../app/js/core/garmin-sync.js';
import { einheitAbhaken, passt, exIdFor } from '../app/js/core/garmin-uebernahme.js';
import { plannedDay } from '../app/js/core/planner.js';
import { generateAppKeys } from '../app/js/core/crypt.js';
import { defaultState } from '../app/js/core/store.js';
import { addDays, weekday } from '../app/js/core/util.js';

const FIX = new URL('./fixtures/garmin/', import.meta.url).pathname;
const json = (f) => JSON.parse(readFileSync(FIX + f, 'utf8'));

test('Sätze: Übung erkennen, unsichere Sätze erben, Gewicht in kg, Pausen', () => {
  const s = mapSets(json('sets-900002.json').exerciseSets);
  assert.deepEqual(s.map((x) => x.cat), ['PULL_UP', 'PULL_UP', 'PUSH_UP', 'PUSH_UP', 'BENCH_PRESS', 'LATERAL_RAISE']);
  assert.deepEqual(s.map((x) => x.kg), [5, 10, 0, 0, 60, 8]);
  assert.equal(s[0].rest, 90); assert.equal(s[3].reps, 18);
});

test('Kategorie → App-Übung, Unbekanntes als eigene Übung', () => {
  const st = defaultState();
  assert.equal(exIdFor('PULL_UP', null, st), 'klimmzug');
  assert.equal(exIdFor('PULL_UP', 'LAT_PULLDOWN', st), 'latzug');
  assert.equal(exIdFor('TRICEPS_EXTENSION', 'BENCH_DIP', st), 'dips');
  assert.equal(exIdFor('LATERAL_RAISE', null, st), 'g_lateral_raise');
  exIdFor('LATERAL_RAISE', null, st);
  assert.equal(st.customExercises.filter((e) => e.id === 'g_lateral_raise').length, 1);
  assert.equal(st.customExercises[0].name, 'Seitheben (Garmin)');
});

// Nächster Montag mit Kraft- und Laufeinheit im Plan
function montagMitKraftUndLauf(st) {
  let d = '2026-11-16';
  for (let i = 0; i < 20; i++, d = addDays(d, 7)) {
    const ss = plannedDay(st, d, { withReadiness: false }).sessions;
    if (weekday(d) === 0 && ss.some((s) => passt('kraft', s)) && ss.some((s) => passt('lauf', s))) return d;
  }
  throw new Error('kein passender Montag');
}

test('Abschluss auf der Uhr → passende Einheit abgehakt, Kraftsätze im Tracker, keine Doppelungen', () => {
  const st = defaultState();
  const d = montagMitKraftUndLauf(st);
  const sessions = plannedDay(st, d, { withReadiness: false }).sessions;
  const raw = { activities: { activities: [
    { id: 1, name: 'Kraft', type: 'strength_training', start_time: d + ' 18:00:00', duration_seconds: 3000, avg_hr_bpm: 120 },
    { id: 2, name: 'Laufen', type: 'running', start_time: d + ' 19:00:00', distance_meters: 6000, duration_seconds: 1900, avg_hr_bpm: 155 },
    { id: 3, name: 'Basis', type: 'running', start_time: d + ' 17:59:00', distance_meters: 90, duration_seconds: 40 },
  ] }, sets: { ...json('sets-900002.json'), activityId: 1 } };
  const p = mergePayload({}, { ...mapGarmin(raw), created: d + 'T20:00:00Z' });
  const r = applyGarminPayload(st, p, d);
  assert.equal(r.acts, 3);
  assert.equal(r.einheiten.length, 2, 'Kraft und Lauf abgehakt, 40-s-Aufzeichnung nicht');
  const iK = sessions.findIndex((s) => passt('kraft', s)), iL = sessions.findIndex((s) => passt('lauf', s));
  assert.ok(st.done[d].includes('train:' + iK) && st.done[d].includes('train:' + iL) && st.done[d].includes('train'));
  assert.equal(st.rewards.points, 80);
  const k = st.strength.filter((x) => x.garminId === '1');
  assert.deepEqual(k.map((x) => x.exId).sort(), ['bankdruecken', 'g_lateral_raise', 'klimmzug', 'liegestuetz']);
  assert.deepEqual(k.find((x) => x.exId === 'klimmzug').sets.map((s) => s.kg), [5, 10]);
  assert.equal(st.runs.filter((x) => x.garminId === '2').length, 1);
  // Gleiche Datei noch einmal: nichts doppelt
  const r2 = applyGarminPayload(st, p, d);
  assert.equal(r2.acts, 0); assert.equal(r2.einheiten.length, 0);
  assert.equal(st.strength.filter((x) => x.garminId === '1').length, 4); assert.equal(st.rewards.points, 80);
});

test('Sätze kommen später nach → werden nachgetragen; alte Aktivitäten ohne Punkte', () => {
  const st = defaultState();
  const d = montagMitKraftUndLauf(st);
  const act = { id: 5, name: 'Kraft', type: 'strength_training', start_time: d + ' 18:00:00', duration_seconds: 2400 };
  applyGarminPayload(st, mergePayload({}, { ...mapGarmin({ activities: [act] }), created: 'a' }), addDays(d, 10));
  assert.equal(st.strength.length, 0); assert.ok(st.done[d].includes('train')); assert.equal(st.rewards.points, 0, 'Nachholung alter Tage ohne Punkte');
  const r = applyGarminPayload(st, mergePayload({}, { ...mapGarmin({ activities: [act], sets: { ...json('sets-900002.json'), activityId: 5 } }), created: 'b' }), addDays(d, 10));
  assert.equal(r.kraft, 4); assert.equal(r.einheiten.length, 0, 'Einheit war schon abgehakt');
});

test('Kickboxen, Schwimmen und bereits von Hand abgehakte Einheiten', () => {
  const st = defaultState();
  let d = '2026-11-17'; // Dienstag: Kickboxen
  while (!plannedDay(st, d, { withReadiness: false }).sessions.some((s) => s.code === 'KICKBOX')) d = addDays(d, 7);
  const a = { garminId: 'x', date: d, sport: 'kampf', durSec: 3600 };
  assert.equal(einheitAbhaken(st, a, d).title, plannedDay(st, d, { withReadiness: false }).sessions.find((s) => s.code === 'KICKBOX').title);
  assert.equal(einheitAbhaken(st, { garminId: 'y', date: d, sport: 'kampf', durSec: 3600 }, d), null, 'nur einmal');
  assert.equal(einheitAbhaken(st, { garminId: 'z', date: d, sport: 'schwimmen', durSec: 3600 }, d), null, 'kein Schwimmen am Kickbox-Tag geplant');
});

test('Werkzeug: unveränderte Daten → keine neue Datei (kein Commit)', async () => {
  const app = await generateAppKeys();
  const dir = mkdtempSync(join(tmpdir(), 'gs-'));
  const out = join(dir, 'daten.enc.json');
  const env = { ...process.env, GARMIN_APP_PUBKEY: app.publicKey, GARMIN_OUT: out };
  const a = execFileSync('node', ['tools/garmin-sync.mjs', FIX], { env }).toString();
  assert.match(a, /mit Kraftsätzen/);
  const first = readFileSync(out, 'utf8');
  const b = execFileSync('node', ['tools/garmin-sync.mjs', FIX], { env }).toString();
  assert.match(b, /UNVERÄNDERT/);
  assert.equal(readFileSync(out, 'utf8'), first);
});
