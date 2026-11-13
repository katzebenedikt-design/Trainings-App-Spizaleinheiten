// App-Seite: verschlüsselte Garmin-Datei laden und in den Datenbestand übernehmen.
import { decryptWith } from './crypt.js';
import { mergeDaily } from './garmin.js';
import { uebernehme } from './garmin-uebernahme.js';
import { iso } from './util.js';

export const GARMIN_FILE = './garmin/daten.enc.json';

// Payload in den App-Zustand übernehmen (Tageswerte, Wochen-Intensitätsminuten, Aktivitäten)
export function applyGarminPayload(st, p, today = iso()) {
  const days = mergeDaily(st, (p.daily || []).map((d) => ({ ...d, source: 'garmin-sync' })));
  st.garminWeeks = { ...(st.garminWeeks || {}), ...(p.weeks || {}) };
  st.activities = st.activities || [];
  const have = new Map(st.activities.map((a) => [a.garminId, a]));
  let acts = 0;
  const einheiten = [], kraft = [];
  // Ältere Aktivitäten zuerst, damit Einheiten in der richtigen Reihenfolge abgehakt werden
  for (const a of [...(p.activities || [])].sort((x, y) => (x.date + (x.time || '') < y.date + (y.time || '') ? -1 : 1))) {
    const alt = have.get(a.garminId);
    if (alt) {
      // Schon bekannt: Sätze nachreichen, falls sie jetzt erst mitkommen
      if (a.sets?.length && !alt.sets?.length) { alt.sets = a.sets; const r = uebernehme(st, alt, today); kraft.push(...r.kraft); if (r.einheit) einheiten.push(r.einheit); }
      continue;
    }
    const neu = { ...a, source: 'garmin' };
    st.activities.push(neu); acts++;
    const r = uebernehme(st, neu, today); kraft.push(...r.kraft); if (r.einheit) einheiten.push(r.einheit);
    // Laufen/Gehen/Schwimmen zusätzlich in Lauf- bzw. Schwimmprotokoll (für Fortschritt und Wochen-Update)
    const dup = (arr) => arr.some((x) => x.garminId === a.garminId || (x.date === a.date && Math.abs((x.durSec || 0) - a.durSec) < 60));
    if (a.sport === 'schwimmen' && !dup(st.swims)) st.swims.push({ id: 'g' + a.garminId, garminId: a.garminId, date: a.date, distM: a.distM || 0, durSec: a.durSec, stroke: 'brust', avgHR: a.avgHR, source: 'garmin' });
    else if ((a.sport === 'lauf' || a.sport === 'gehen') && a.distM && !dup(st.runs)) st.runs.push({ id: 'g' + a.garminId, garminId: a.garminId, date: a.date, distM: a.distM, durSec: a.durSec, avgHR: a.avgHR, maxHR: a.maxHR, type: a.sport === 'lauf' ? 'dauerlauf' : 'marsch', typeLabel: a.sport === 'lauf' ? 'Lauf' : 'Gehen/Marsch', source: 'garmin' });
  }
  st.activities.sort((a, b) => (a.date + (a.time || '') < b.date + (b.time || '') ? 1 : -1));
  if (st.activities.length > 400) st.activities.length = 400;
  return { days, acts, einheiten, kraft: kraft.length };
}

// Beim App-Start: Datei holen (Netz zuerst), entschlüsseln, übernehmen. Leise bei fehlendem Schlüssel/Datei.
export async function syncGarmin(st, { fetcher = (u) => fetch(u, { cache: 'no-store' }) } = {}) {
  const keys = st.settings?.garminKeys;
  if (!keys?.privateJwk) return { status: 'kein-schluessel' };
  let env;
  try { const r = await fetcher(GARMIN_FILE + '?t=' + Date.now()); if (!r.ok) return { status: 'keine-datei' }; env = await r.json(); } catch { return { status: 'offline' }; }
  const p = await decryptWith(env, keys.privateJwk); // wirft, wenn die Datei für einen anderen Verbindungscode ist
  if (st.settings.garminSync?.created === p.created) return { status: 'aktuell', created: p.created };
  const res = applyGarminPayload(st, p);
  st.settings.garminSync = { created: p.created, at: new Date().toISOString(), days: res.days, acts: res.acts };
  return { status: 'neu', created: p.created, ...res };
}
