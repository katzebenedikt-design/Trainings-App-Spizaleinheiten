// Garmin → App: Rohdaten aus einem Ordner lesen, für das Handy verschlüsseln und nach app/garmin/daten.enc.json schreiben.
// Der öffentliche Verbindungscode der App liegt in app/garmin/verbindung.json ({ "publicKey": "…" }) oder in GARMIN_APP_PUBKEY.
// Die Datei enthält jeweils das aktuelle Fenster (z. B. 21 Tage); die App sammelt die Tage dauerhaft bei sich.
//
//   node tools/garmin-sync.mjs <ordner-mit-rohdaten>
//
// Dateien im Ordner (je optional, Name beginnt mit dem Schlüsselwort, Inhalt = Antwort der Garmin-Abfrage):
//   readiness*.json  get_morning_training_readiness     status*.json     get_training_status
//   hrv*.json        get_hrv_trend / get_hrv_data         sleep*.json      get_sleep_summary_range
//   stats*.json      get_stats                            vo2*.json        get_vo2max_trend
//   intensity*.json  get_weekly_intensity_minutes         activities*.json get_activities_by_date
//   sets*.json       get_activity_exercise_sets (eine Datei je Krafttraining, z. B. sets-<id>.json)
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { mapGarmin, mergePayload } from '../app/js/core/garmin-map.js';
import { encryptFor, validPublicKey } from '../app/js/core/crypt.js';

const dir = process.argv[2];
const out = process.env.GARMIN_OUT || new URL('../app/garmin/daten.enc.json', import.meta.url).pathname;
const pubFile = process.env.GARMIN_PUBFILE || new URL('../app/garmin/verbindung.json', import.meta.url).pathname;
const pub = process.env.GARMIN_APP_PUBKEY || (existsSync(pubFile) ? JSON.parse(readFileSync(pubFile, 'utf8')).publicKey : null);
if (!dir) { console.error('Aufruf: node tools/garmin-sync.mjs <ordner>'); process.exit(2); }
if (!pub || !(await validPublicKey(pub))) { console.error('Kein gültiger Verbindungscode (app/garmin/verbindung.json oder GARMIN_APP_PUBKEY).'); process.exit(3); }

const KINDS = ['readiness', 'status', 'hrv', 'sleep', 'stats', 'vo2', 'intensity', 'activities', 'sets'];
const raw = Object.fromEntries(KINDS.map((k) => [k, []]));
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const kind = KINDS.find((k) => f.toLowerCase().startsWith(k));
  if (!kind) { console.warn('übersprungen:', f); continue; }
  try { raw[kind].push(JSON.parse(readFileSync(join(dir, f), 'utf8'))); } catch (e) { console.warn('nicht lesbar:', f, e.message); }
}
const payload = mergePayload({}, { ...mapGarmin(raw), created: new Date().toISOString() });
// Prüfwert über den Inhalt (ohne Zeitstempel): bei unveränderten Daten nichts schreiben → kein Commit nötig
const hash = createHash('sha256').update(pub + JSON.stringify({ ...payload, created: null })).digest('hex'); // neuer Verbindungscode → neue Datei
let alt = null; try { alt = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')).hash : null; } catch { alt = null; }
if (alt === hash && !process.env.GARMIN_FORCE) { console.log('UNVERÄNDERT: keine neuen Garmin-Daten, nichts geschrieben.'); process.exit(0); }
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ ...(await encryptFor(payload, pub)), hash }));
console.log(`OK: ${payload.daily.length} Tage (${payload.daily.filter((d) => d.report).length} Morgenberichte), ${payload.activities.length} Aktivitäten (${payload.activities.filter((a) => a.sets).length} mit Kraftsätzen), ${Object.keys(payload.weeks).length} Wochen verschlüsselt.`);
