// Wöchentliches Update: Garmin-Daten, Trainingsfortschritt, erledigte und ausgelassene Einheiten, Schmerzen.
// Daraus folgt die Anpassung der nächsten Woche (WOCHEN_REGELN in data/requirements.js).
import { WOCHEN_REGELN } from '../data/requirements.js';
import { plannedDay } from './planner.js';
import { addDays, mondayOf, isoWeekKey, iso } from './util.js';

const avg = (rows, k) => { const v = rows.map((d) => d[k]).filter((x) => x != null); return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null; };
const lastVal = (rows, k) => [...rows].reverse().find((d) => d[k] != null)?.[k] ?? null;
const inWeek = (date, mon) => date >= mon && date <= addDays(mon, 6);

export function wochenAuswertung(st, anyDate, today = iso()) {
  const mon = mondayOf(anyDate); const sun = addDays(mon, 6); const key = isoWeekKey(mon);
  const days = st.daily.filter((d) => inWeek(d.date, mon)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const prev = st.daily.filter((d) => d.date >= addDays(mon, -28) && d.date < mon);
  const garmin = {
    tage: days.length, berichte: days.filter((d) => d.report).length,
    hrv: avg(days, 'hrv'), hrv7: lastVal(days, 'hrv7'), hrv7Vorher: avg(prev, 'hrv7'), hrvStatus: lastVal(days, 'hrvStatus'),
    bereitschaft: avg(days, 'readiness'), schlaf: avg(days, 'sleepH'), schlafScore: avg(days, 'sleepScore'), ruhepuls: avg(days, 'restHR'),
    status: lastVal(days, 'trainingStatus'), akut: lastVal(days, 'acuteLoad'), chronisch: lastVal(days, 'chronicLoad'), vo2max: lastVal(days, 'vo2max'),
    intensitaet: st.garminWeeks?.[key]?.total ?? null,
  };
  // Einheiten: geplant / erledigt / Ersatz / ausgelassen (nur Tage bis heute)
  const geplant = []; const ersatz = (st.ersatzLog || []).filter((x) => inWeek(x.date, mon));
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i); if (d > today) break;
    const day = plannedDay(st, d, { withReadiness: false });
    day.sessions.forEach((s, k) => {
      if (s.rest) return;
      const done = (st.done[d] || []).includes('train:' + k);
      geplant.push({ date: d, title: s.title, code: s.code, done, ersatz: done && ersatz.some((x) => x.date === d && x.code === s.code) });
    });
  }
  const erledigt = geplant.filter((x) => x.done).length;
  const training = { geplant: geplant.length, erledigt, ersatz: geplant.filter((x) => x.ersatz).length, ausgelassen: geplant.filter((x) => !x.done), quote: geplant.length ? erledigt / geplant.length : null };
  // Fortschritt
  const runs = st.runs.filter((r) => inWeek(r.date, mon));
  const fortschritt = {
    laufKm: Math.round(runs.filter((r) => r.type !== 'marsch').reduce((a, r) => a + (r.distM || 0), 0) / 100) / 10,
    marschKm: Math.round(runs.filter((r) => r.type === 'marsch').reduce((a, r) => a + (r.distM || 0), 0) / 100) / 10,
    schwimmM: st.swims.filter((r) => inWeek(r.date, mon)).reduce((a, r) => a + (r.distM || 0), 0),
    kraft: st.strength.filter((r) => inWeek(r.date, mon)).length,
    tests: st.tests.filter((t) => inWeek(t.date, mon)),
    cat: (st.cat?.daily || []).filter((x) => inWeek(x.date, mon)).length + (st.cat?.sims || []).filter((x) => inWeek(x.date, mon)).length,
    psych: Object.entries(st.done).filter(([d, l]) => inWeek(d, mon) && l.includes('psych-kurz')).length,
  };
  const schmerzen = (st.pain || []).filter((p) => inWeek(p.date, mon));
  const aktiv = (st.pain || []).filter((p) => !p.erledigt && p.date >= addDays(sun, -7));
  const e = entscheidung(st, garmin, training, aktiv);
  return { key, mon, sun, garmin, training, fortschritt, schmerzen, ...e };
}

export function entscheidung(st, g, t, aktiveSchmerzen = []) {
  const R = WOCHEN_REGELN; const gruende = [];
  if (R.runter.hrvStatus.includes(g.hrvStatus)) gruende.push(`HRV-Status ${g.hrvStatus}${g.hrv7 ? ` (7-Tage-Schnitt ${g.hrv7} ms)` : ''}`);
  if (g.hrv7 && g.hrv7Vorher && g.hrv7 < g.hrv7Vorher * 0.9) gruende.push(`HRV-Schnitt ${g.hrv7} ms deutlich unter den Wochen davor (${Math.round(g.hrv7Vorher)} ms)`);
  if (g.bereitschaft != null && g.bereitschaft < R.runter.bereitschaftUnter) gruende.push(`Trainingsbereitschaft im Schnitt ${g.bereitschaft}`);
  if (R.runter.status.includes(g.status)) gruende.push(`Trainingszustand „${g.status === 'ueberlastet' ? 'überlastet' : 'überfordert'}“`);
  if (g.akut && g.chronisch && g.akut / g.chronisch > R.runter.belastungsQuoteUeber) gruende.push(`Belastung akut/chronisch ${Math.round((g.akut / g.chronisch) * 100) / 100}`);
  const stark = aktiveSchmerzen.filter((p) => p.staerke >= R.runter.schmerzAb);
  if (stark.length) gruende.push(`Schmerzen: ${stark.map((p) => p.label).join(', ')}`);
  if (gruende.length) return { stufe: 'runter', faktor: R.runter.faktor, gruende, text: 'Nächste Woche: Intensität runter – Umfang −15 %, harte Intervalle, Maximalkraft und Eilmarsch werden abgeschwächt.' };
  const gut = [];
  if (g.bereitschaft != null && g.bereitschaft >= R.hoch.bereitschaftAb) gut.push(`Bereitschaft im Schnitt ${g.bereitschaft}`);
  if (t.quote != null && t.quote >= R.hoch.erledigtAb) gut.push(`${Math.round(t.quote * 100)} % der Einheiten erledigt`);
  if (!g.hrvStatus || g.hrvStatus === 'ausgeglichen') gut.push(g.hrvStatus ? 'HRV ausgeglichen' : 'keine HRV-Warnung');
  const gesamt = (st.plan.volFactor || 1) * R.hoch.faktor;
  if (gut.length >= 3 && gesamt <= R.hoch.maxFaktor) return { stufe: 'hoch', faktor: R.hoch.faktor, gruende: gut, text: 'Nächste Woche: leicht steigern – Umfang +5 %.' };
  return { stufe: 'halten', faktor: 1, gruende: gut.length ? gut : ['Zu wenige Daten für eine Änderung'], text: 'Nächste Woche: Belastung beibehalten.' };
}

// Montags (oder beim ersten Öffnen danach): vergangene Woche auswerten und die laufende Woche anpassen.
export function wochenUpdateFaellig(st, today = iso()) {
  const letzte = addDays(mondayOf(today), -7);
  const key = isoWeekKey(letzte);
  if (st.weekly?.[key]) return null;
  // Erst ab der ersten vollen App-Woche
  if ((st.created || today).slice(0, 10) > addDays(letzte, 6)) return null;
  const r = wochenAuswertung(st, letzte, today);
  st.weekly = { ...(st.weekly || {}), [key]: { ...r, ausgelassen: r.training.ausgelassen.map((x) => ({ date: x.date, title: x.title })), training: { ...r.training, ausgelassen: undefined } } };
  st.weekAdj = { ...(st.weekAdj || {}), [isoWeekKey(today)]: { stufe: r.stufe, faktor: r.faktor, gruende: r.gruende, von: key } };
  // Alte Einträge begrenzen
  const keys = Object.keys(st.weekly).sort(); if (keys.length > 60) for (const k of keys.slice(0, keys.length - 60)) delete st.weekly[k];
  return st.weekly[key];
}
