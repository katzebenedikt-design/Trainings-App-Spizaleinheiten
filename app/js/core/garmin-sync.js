// App-Seite: verschlüsselte Garmin-Datei laden und in den Datenbestand übernehmen.
import { decryptJSON, normKey } from './crypt.js';
import { mergeDaily } from './garmin.js';

export const GARMIN_FILE = './garmin/daten.enc.json';

// Payload in den App-Zustand übernehmen (Tageswerte, Wochen-Intensitätsminuten, Aktivitäten)
export function applyGarminPayload(st, p) {
  const days = mergeDaily(st, (p.daily || []).map((d) => ({ ...d, source: 'garmin-sync' })));
  st.garminWeeks = { ...(st.garminWeeks || {}), ...(p.weeks || {}) };
  st.activities = st.activities || [];
  const have = new Set(st.activities.map((a) => a.garminId));
  let acts = 0;
  for (const a of p.activities || []) {
    if (have.has(a.garminId)) continue;
    st.activities.push({ ...a, source: 'garmin' }); acts++;
    // Laufen/Gehen/Schwimmen zusätzlich in Lauf- bzw. Schwimmprotokoll (für Fortschritt und Wochen-Update)
    const dup = (arr) => arr.some((x) => x.garminId === a.garminId || (x.date === a.date && Math.abs((x.durSec || 0) - a.durSec) < 60));
    if (a.sport === 'schwimmen' && !dup(st.swims)) st.swims.push({ id: 'g' + a.garminId, garminId: a.garminId, date: a.date, distM: a.distM || 0, durSec: a.durSec, stroke: 'brust', avgHR: a.avgHR, source: 'garmin' });
    else if ((a.sport === 'lauf' || a.sport === 'gehen') && a.distM && !dup(st.runs)) st.runs.push({ id: 'g' + a.garminId, garminId: a.garminId, date: a.date, distM: a.distM, durSec: a.durSec, avgHR: a.avgHR, maxHR: a.maxHR, type: a.sport === 'lauf' ? 'dauerlauf' : 'marsch', typeLabel: a.sport === 'lauf' ? 'Lauf' : 'Gehen/Marsch', source: 'garmin' });
  }
  st.activities.sort((a, b) => (a.date + (a.time || '') < b.date + (b.time || '') ? 1 : -1));
  if (st.activities.length > 400) st.activities.length = 400;
  return { days, acts };
}

// Beim App-Start: Datei holen (Netz zuerst), entschlüsseln, übernehmen. Leise bei fehlendem Schlüssel/Datei.
export async function syncGarmin(st, { fetcher = (u) => fetch(u, { cache: 'no-store' }) } = {}) {
  const key = st.settings?.garminKey;
  if (!normKey(key)) return { status: 'kein-schluessel' };
  let env;
  try { const r = await fetcher(GARMIN_FILE + '?t=' + Date.now()); if (!r.ok) return { status: 'keine-datei' }; env = await r.json(); } catch { return { status: 'offline' }; }
  const p = await decryptJSON(env, key); // wirft bei falschem Schlüssel
  if (st.settings.garminSync?.created === p.created) return { status: 'aktuell', created: p.created };
  const res = applyGarminPayload(st, p);
  st.settings.garminSync = { created: p.created, at: new Date().toISOString(), ...res };
  return { status: 'neu', created: p.created, ...res };
}
