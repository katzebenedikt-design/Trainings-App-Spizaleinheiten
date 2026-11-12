// Garmin: Abbildung der Rohdaten, Verschlüsselung, Sync-Werkzeug, Übernahme in die App, Morgenbericht-Regeln, CSV.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { mapGarmin, mergePayload } from '../app/js/core/garmin-map.js';
import { generateAppKeys, encryptFor, decryptWith, validPublicKey } from '../app/js/core/crypt.js';
import { applyGarminPayload, syncGarmin } from '../app/js/core/garmin-sync.js';
import { applyGarminStart, GARMIN_START } from '../app/js/data/garmin-start.js';
import { readiness } from '../app/js/core/readiness.js';
import { parseCSV } from '../app/js/core/garmin.js';
import { defaultState } from '../app/js/core/store.js';

const FIX = new URL('./fixtures/garmin/', import.meta.url).pathname;
const raw = Object.fromEntries(['readiness', 'status', 'hrv', 'sleep', 'stats', 'vo2', 'intensity', 'activities'].map((k) => [k, JSON.parse(readFileSync(FIX + k + '.json', 'utf8'))]));

test('Rohdaten → App-Format: alle geforderten Werte', () => {
  const p = mapGarmin(raw);
  const d = p.daily.find((x) => x.date === '2030-01-10');
  assert.deepEqual({ sleepH: d.sleepH, sleepScore: d.sleepScore, hrv: d.hrv, hrv7: d.hrv7, hrvStatus: d.hrvStatus, restHR: d.restHR }, { sleepH: 6, sleepScore: 58, hrv: 45, hrv7: 50, hrvStatus: 'niedrig', restHR: 55 });
  assert.equal(d.sleepDeep, 1); assert.equal(d.sleepRem, 1); assert.equal(d.sleepAwake, 0.33);
  assert.equal(d.readiness, 31); assert.equal(d.recoveryH, 12); assert.ok(d.report);
  assert.equal(d.trainingStatus, 'ueberlastet'); assert.equal(d.acuteLoad, 330); assert.equal(d.chronicLoad, 300); assert.equal(d.load, 330);
  assert.equal(d.vo2max, 47.2); assert.equal(d.bodyBattery, 48); assert.equal(d.intensMin, 80);
  assert.equal(p.daily.find((x) => x.date === '2030-01-05').vo2max, 47);
  assert.ok(!p.daily.find((x) => x.date === '2030-01-06'), 'fortgeschriebene VO2max-Werte werden nicht gespeichert');
  assert.deepEqual(p.weeks['2030-W02'], { start: '2030-01-07', moderate: 60, vigorous: 50, total: 160, goal: 150 });
  const run = p.activities.find((a) => a.type === 'running');
  assert.deepEqual({ dur: run.durSec, dist: run.distM, avg: run.avgHR, max: run.maxHR, label: run.typeLabel, sport: run.sport }, { dur: 2700, dist: 8000, avg: 150, max: 172, label: 'Laufen', sport: 'lauf' });
  assert.equal(p.activities.find((a) => a.sport === 'kraft').name, 'Krafttraining');
});

test('Verschlüsselung: nur das Handy mit dem geheimen Schlüssel kann lesen', async () => {
  const app = await generateAppKeys(), other = await generateAppKeys();
  assert.ok(await validPublicKey(app.publicKey)); assert.ok(!(await validPublicKey('abc')));
  assert.equal(app.privateJwk.kty, 'EC'); assert.ok(app.privateJwk.d, 'geheimer Teil bleibt in der App');
  const env = await encryptFor({ a: 1, t: 'Grüße' }, app.publicKey);
  assert.ok(!JSON.stringify(env).includes('Grüße'));
  assert.deepEqual(await decryptWith(env, app.privateJwk), { a: 1, t: 'Grüße' });
  await assert.rejects(() => decryptWith(env, other.privateJwk), /anderer Verbindungscode/);
  const env2 = await encryptFor({ a: 1 }, app.publicKey);
  assert.notEqual(env2.epk, env.epk, 'jede Datei mit eigenem Einmal-Schlüssel');
});

test('Sync-Werkzeug: braucht nur den öffentlichen Code, schreibt unlesbar', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gsync-')); const out = join(dir, 'daten.enc.json');
  const app = await generateAppKeys();
  const env = { ...process.env, GARMIN_APP_PUBKEY: app.publicKey, GARMIN_OUT: out };
  execFileSync('node', ['tools/garmin-sync.mjs', FIX], { env });
  assert.ok(existsSync(out));
  assert.ok(!readFileSync(out, 'utf8').includes('2030-01-10'), 'Datei enthält keine lesbaren Daten');
  const p = await decryptWith(JSON.parse(readFileSync(out, 'utf8')), app.privateJwk);
  assert.equal(p.activities.length, 2); assert.ok(p.daily.find((d) => d.date === '2030-01-10').report);
  assert.throws(() => execFileSync('node', ['tools/garmin-sync.mjs', FIX], { env: { ...env, GARMIN_APP_PUBKEY: 'kaputt', GARMIN_PUBFILE: join(dir, 'fehlt.json') }, stdio: 'pipe' }));
});

test('App: verschlüsselte Datei abholen und übernehmen (ohne Duplikate)', async () => {
  const app = await generateAppKeys();
  const env = await encryptFor(mergePayload({}, { ...mapGarmin(raw), created: '2030-01-10T07:15:00Z' }), app.publicKey);
  const fetcher = async () => ({ ok: true, json: async () => env });
  const st = defaultState();
  assert.equal((await syncGarmin(st, { fetcher })).status, 'kein-schluessel');
  st.settings.garminKeys = app;
  const r = await syncGarmin(st, { fetcher });
  assert.equal(r.status, 'neu'); assert.equal(r.acts, 2);
  assert.equal(st.runs.filter((x) => x.garminId === '900001').length, 1);
  assert.equal(st.garminWeeks['2030-W02'].total, 160);
  assert.equal((await syncGarmin(st, { fetcher })).status, 'aktuell');
  applyGarminPayload(st, mapGarmin(raw));
  assert.equal(st.activities.length, 2);
  st.settings.garminKeys = await generateAppKeys(); st.settings.garminSync = null;
  await assert.rejects(() => syncGarmin(st, { fetcher }), /anderer Verbindungscode/);
});

test('Morgenbericht steuert die Einheit: schlecht = leichter, gut = voll', () => {
  const st = defaultState(); const d = '2030-01-10';
  st.daily.push({ date: d, readiness: 31, hrvStatus: 'niedrig', hrv7: 50, trainingStatus: 'ueberlastet', sleepScore: 58, report: true });
  const r = readiness(st, d);
  assert.equal(r.mode, 'leicht');
  assert.ok(r.reasons.some((x) => x.includes('Trainingsbereitschaft 31')));
  assert.ok(r.reasons.some((x) => x.includes('Überlastet')));
  st.daily[0] = { date: d, readiness: 18, hrvStatus: 'schwach', sleepScore: 40, report: true };
  assert.equal(readiness(st, d).mode, 'pause');
  st.daily[0] = { date: d, readiness: 78, hrvStatus: 'ausgeglichen', sleepScore: 82, bodyBattery: 80, report: true };
  assert.equal(readiness(st, d).mode, 'offen'); // gut, Check-in noch offen → volle Einheit
  st.checkins.push({ date: d, schlaf: 4, energie: 4, kater: 1, schmerz: 1, stimmung: 4 });
  assert.equal(readiness(st, d).mode, 'normal');
});

test('Startwerte 12.11.2026 einmalig, echte Werte bleiben', () => {
  const st = defaultState();
  st.daily.push({ date: '2026-11-12', readiness: 30, source: 'garmin-sync' });
  assert.ok(applyGarminStart(st)); assert.ok(!applyGarminStart(st));
  const d = st.daily.find((x) => x.date === '2026-11-12');
  assert.equal(d.readiness, 30); assert.equal(d.vo2max, 46.1); assert.equal(d.trainingStatus, 'ueberlastet'); assert.equal(d.chronicLoad, 312);
  assert.equal(st.daily.find((x) => x.date === '2026-08-15').vo2max, 49);
  assert.equal(st.daily.find((x) => x.date === '2026-10-15').hrv7, 68);
  assert.equal(GARMIN_START.werte.sleepScoreAvg, 71);
});

test('CSV-Import: neue Spalten (Schlafscore vor Schlaf, HRV 7 Tage, Bereitschaft, Zustand)', () => {
  const csv = 'Datum;Schlafscore;Schlaf;HRV 7 Tage;HRV;HRV-Status;Trainingsbereitschaft;Trainingszustand;Akute Belastung;Chronische Belastung;Intensitätsminuten\n2030-02-01;70;7:30;55;52;Niedrig;40;Überlastet;320;300;45';
  const { daily } = parseCSV(csv);
  assert.deepEqual(daily[0], { date: '2030-02-01', restHR: null, sleepH: 7.5, bodyBattery: null, vo2max: null, hrv: 52, load: 320, sleepScore: 70, hrv7: 55, hrvStatus: 'niedrig', readiness: 40, trainingStatus: 'ueberlastet', chronicLoad: 300, intensMin: 45 });
});
