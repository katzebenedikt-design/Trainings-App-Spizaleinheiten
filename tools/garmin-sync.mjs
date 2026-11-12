// Garmin → App: Rohdaten aus einem Ordner lesen, mit der bestehenden (verschlüsselten) Datei zusammenführen,
// neu verschlüsseln und nach app/garmin/daten.enc.json schreiben.
//
//   GARMIN_APP_KEY=XXXX-XXXX-… node tools/garmin-sync.mjs <ordner-mit-rohdaten>
//
// Dateien im Ordner (je optional, Name beginnt mit dem Schlüsselwort, Inhalt = Antwort der Garmin-Abfrage):
//   readiness*.json  get_morning_training_readiness     status*.json     get_training_status
//   hrv*.json        get_hrv_trend / get_hrv_data         sleep*.json      get_sleep_summary_range / get_sleep_summary (+ "date")
//   stats*.json      get_stats                            vo2*.json        get_vo2max_trend
//   intensity*.json  get_weekly_intensity_minutes         activities*.json get_activities_by_date
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { mapGarmin, mergePayload } from '../app/js/core/garmin-map.js';
import { encryptJSON, decryptJSON } from '../app/js/core/crypt.js';

const dir = process.argv[2];
const key = process.env.GARMIN_APP_KEY;
if (!dir || !key) { console.error('Aufruf: GARMIN_APP_KEY=… node tools/garmin-sync.mjs <ordner>'); process.exit(2); }
const out = process.env.GARMIN_OUT || new URL('../app/garmin/daten.enc.json', import.meta.url).pathname;

const KINDS = ['readiness', 'status', 'hrv', 'sleep', 'stats', 'vo2', 'intensity', 'activities'];
const raw = Object.fromEntries(KINDS.map((k) => [k, []]));
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const kind = KINDS.find((k) => f.toLowerCase().startsWith(k));
  if (!kind) { console.warn('übersprungen:', f); continue; }
  try { raw[kind].push(JSON.parse(readFileSync(join(dir, f), 'utf8'))); } catch (e) { console.warn('nicht lesbar:', f, e.message); }
}
const add = { ...mapGarmin(raw), created: new Date().toISOString() };
let base = {};
if (existsSync(out)) {
  try { base = await decryptJSON(JSON.parse(readFileSync(out, 'utf8')), key); } catch (e) { console.error('Bestehende Datei nicht entschlüsselbar:', e.message); process.exit(3); }
}
const merged = mergePayload(base, add);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(await encryptJSON(merged, key)));
const reports = merged.daily.filter((d) => d.report).length;
console.log(`OK: ${add.daily.length} Tage neu/aktualisiert, ${merged.daily.length} Tage gesamt (${reports} Morgenberichte), ${merged.activities.length} Aktivitäten, ${Object.keys(merged.weeks).length} Wochen.`);
