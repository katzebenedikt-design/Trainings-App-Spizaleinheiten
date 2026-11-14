// Garmin → Früh-/Abend-Check-in und der Morgen-Befehl an Claude.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { schlafStufe, energieStufe, fruehVorschlag, abendGarmin, abendHinweis } from '../app/js/core/garmin-checkin.js';
import { garminBefehl, befehlLesen } from '../app/js/core/garmin-befehl.js';
import { mapGarmin, mergePayload } from '../app/js/core/garmin-map.js';
import { applyGarminPayload } from '../app/js/core/garmin-sync.js';
import { generateAppKeys, decryptWith } from '../app/js/core/crypt.js';
import { readiness } from '../app/js/core/readiness.js';
import { defaultState } from '../app/js/core/store.js';

test('Stufen 1–5 aus Schlafscore / Body Battery, Ersatzwerte', () => {
  assert.deepEqual([90, 85, 72, 71, 58, 45, 44].map((x) => schlafStufe({ sleepScore: x })), [5, 5, 4, 3, 3, 2, 1]);
  assert.equal(schlafStufe({ sleepH: 7.2 }), 4);
  assert.deepEqual([95, 63, 40, 25, 10].map((x) => energieStufe({ bodyBattery: x })), [5, 4, 3, 2, 1]);
  assert.equal(energieStufe({ readiness: 22 }), 2);
  assert.equal(schlafStufe({}), null); assert.equal(energieStufe(null), null);
});

test('Früh-Check-in: nur Gemessenes, Gefühltes bleibt offen; Bereitschaft unverändert ohne Check-in', () => {
  const st = defaultState();
  st.daily.push({ date: '2030-01-10', sleepScore: 71, sleepH: 8.1, bodyBattery: 63, restHR: 53 });
  const v = fruehVorschlag(st, '2030-01-10');
  assert.deepEqual(v.werte, { schlaf: 3, energie: 4, ruhepuls: 53 });
  assert.deepEqual(v.felder, ['schlaf', 'energie', 'ruhepuls']);
  assert.match(v.quelle.schlaf, /Schlafscore 71, 8,1 h/);
  assert.equal(fruehVorschlag(st, '2030-01-11'), null);
  assert.equal(st.checkins.length, 0, 'kein halber Check-in wird gespeichert');
  assert.equal(readiness(st, '2030-01-10').mode, 'offen');
});

test('Abend-Check-in: Tageswerte aus get_stats (gestern) und Trainings des Tages', () => {
  const raw = { stats: [
    { date: '2030-01-09', total_steps: 13177, distance_meters: 10274, avg_stress_level: 33, max_stress_level: 96, body_battery_highest: 63, body_battery_lowest: 12, body_battery_charged: 60, body_battery_drained: 51, active_calories: 502, total_calories: 2273, floors_ascended: 23.0, moderate_intensity_minutes: 10, vigorous_intensity_minutes: 5 },
    { date: '2030-01-10', total_steps: 900, body_battery_highest: 70 },
  ], activities: { activities: [{ id: 7, type: 'running', start_time: '2030-01-09 18:00:00', duration_seconds: 1800, distance_meters: 5000 }] } };
  const st = defaultState();
  applyGarminPayload(st, mergePayload({}, { ...mapGarmin(raw), created: 'x' }), '2030-01-10');
  const w = abendGarmin(st, '2030-01-09');
  assert.deepEqual({ steps: w.steps, distKm: w.distKm, stress: w.stress, bbLow: w.bbLow, bbHigh: w.bbHigh, kcalActive: w.kcalActive, floors: w.floors, intensMin: w.intensMin, trainMin: w.trainMin }, { steps: 13177, distKm: 10.3, stress: 33, bbLow: 12, bbHigh: 63, kcalActive: 502, floors: 23, intensMin: 20, trainMin: 30 });
  assert.deepEqual(w.trainings, ['Laufen']);
  assert.ok(abendHinweis({ belastung: 3 }, w)[0].includes('Body Battery'));
  assert.deepEqual(abendGarmin(st, '2030-02-01'), {});
  assert.equal(fruehVorschlag(st, '2030-01-10').werte.energie, 4, 'Body Battery von heute früh');
});

test('Befehl: Text enthält den Code, lässt sich wieder lesen', async () => {
  const k = await generateAppKeys();
  const t = garminBefehl(k.publicKey);
  assert.match(t, /^Garmin-Update\n/);
  assert.equal(befehlLesen(t).publicKey, k.publicKey);
  assert.equal(befehlLesen('Hallo'), null);
  assert.ok(!t.includes('"d"'), 'kein geheimer Schlüssel im Befehl');
});

test('Werkzeug: stats-gestern wird mitgelesen; neuer Verbindungscode → neue Datei trotz gleicher Daten', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gc-')), raw = join(dir, 'raw'); mkdirSync(raw);
  writeFileSync(join(raw, 'stats.json'), JSON.stringify({ date: '2030-01-10', total_steps: 500 }));
  writeFileSync(join(raw, 'stats-gestern.json'), JSON.stringify({ date: '2030-01-09', total_steps: 12000, body_battery_lowest: 20 }));
  const out = join(dir, 'd.enc.json');
  const a = await generateAppKeys(), b = await generateAppKeys();
  const run = (pub) => execFileSync('node', ['tools/garmin-sync.mjs', raw], { env: { ...process.env, GARMIN_APP_PUBKEY: pub, GARMIN_OUT: out } }).toString();
  run(a.publicKey);
  const p = await decryptWith(JSON.parse(readFileSync(out, 'utf8')), a.privateJwk);
  assert.equal(p.daily.find((d) => d.date === '2030-01-09').bbLow, 20);
  assert.match(run(a.publicKey), /UNVERÄNDERT/);
  assert.doesNotMatch(run(b.publicKey), /UNVERÄNDERT/);
  await decryptWith(JSON.parse(readFileSync(out, 'utf8')), b.privateJwk);
});
