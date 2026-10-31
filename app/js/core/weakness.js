// Schwächen-Analyse: aktuelle Leistungen gegen die Zielwerte (data/requirements.js).
// Quellen: Monatstests, eingetragene Läufe/Märsche/Schwimmeinheiten, Kraft-Einträge, Garmin-VO2max.
import { getNorms } from '../data/requirements.js';
import { normProgress } from './plan.js';
import { addDays, sortByDate, last, fmtTime, fmtDate } from './util.js';

const WINDOW = 90; // Tage, in denen Werte als aktuell gelten

function pick(list, better) {
  // bester Wert aus Liste [{v, date, src}]
  if (!list.length) return null;
  return list.reduce((a, b) => (better(b.v, a.v) ? b : a));
}

export function currentValues(state, date) {
  const from = addDays(date, -WINDOW);
  const recent = (arr) => arr.filter((x) => x.date >= from && x.date <= date);
  const lower = (a, b) => a < b, higher = (a, b) => a > b;
  const tests = recent(state.tests);
  const fromTests = (k) => tests.filter((t) => t[k] != null).map((t) => ({ v: t[k], date: t.date, src: 'Test' }));
  const vals = {};
  const runs = recent(state.runs).filter((r) => r.distM && r.durSec);
  vals.run3000 = pick([...fromTests('run3000'), ...runs.filter((r) => r.type !== 'marsch' && r.distM >= 2900 && r.distM <= 3300).map((r) => ({ v: (r.durSec * 3000) / r.distM, date: r.date, src: 'Lauf' }))], lower);
  vals.run5000 = pick(runs.filter((r) => r.type !== 'marsch' && r.distM >= 4800 && r.distM <= 5500).map((r) => ({ v: (r.durSec * 5000) / r.distM, date: r.date, src: 'Lauf' })), lower);
  const marsch = runs.filter((r) => r.type === 'marsch' && (r.kg || 0) >= 15);
  vals.ruck7 = pick([...fromTests('ruck7'), ...marsch.filter((r) => r.distM >= 5000 && r.distM <= 9000).map((r) => ({ v: (r.durSec * 7000) / r.distM, date: r.date, src: `Marsch ${r.kg} kg` }))], lower);
  vals.march20 = pick(marsch.filter((r) => r.distM >= 15000).map((r) => ({ v: (r.durSec * 20000) / r.distM, date: r.date, src: `Marsch ${r.kg} kg` })), lower);
  const repsFrom = (exId) => recent(state.strength).filter((s) => s.exId === exId).map((s) => ({ v: Math.max(...s.sets.map((x) => (x.kg ? 0 : x.reps || 0))), date: s.date, src: 'Kraft-Eintrag' })).filter((x) => x.v > 0);
  vals.pullups = pick([...fromTests('pullups'), ...repsFrom('klimmzug')], higher);
  vals.pushups = pick([...fromTests('pushups'), ...repsFrom('liegestuetz')], higher);
  vals.situps = pick([...fromTests('situps'), ...repsFrom('situp')], higher);
  vals.swim100 = pick([...fromTests('swim100'), ...recent(state.swims).filter((s) => s.distM >= 100 && s.durSec && s.stroke !== 'kleider').map((s) => ({ v: (s.durSec / s.distM) * 100 * (s.distM > 400 ? 0.9 : 1), date: s.date, src: 'Schwimmen (Pace)' }))], lower);
  const vo2 = sortByDate(recent(state.daily).filter((d) => d.vo2max));
  vals.vo2max = vo2.length ? { v: last(vo2).vo2max, date: last(vo2).date, src: 'Garmin' } : null;
  // Startwerte, falls noch nichts Aktuelles da ist
  const st = state.profile.start || {};
  for (const k of ['run3000', 'pullups', 'pushups', 'situps', 'swim100']) if (!vals[k] && st[k] != null) vals[k] = { v: st[k], date: (state.created || date).slice(0, 10), src: 'Startwert' };
  return vals;
}

// Liefert alle Disziplinen sortiert nach Lücke (größte zuerst). gap: 0 = Top erreicht, 1 = weit weg.
export function assessWeaknesses(state, date) {
  const norms = getNorms(state.profile);
  const vals = currentValues(state, date);
  const list = [];
  for (const [k, n] of Object.entries(norms)) {
    const cur = vals[k];
    if (!cur) { list.push({ key: k, label: n.label, gap: null, norm: n }); continue; }
    const prog = normProgress(n, cur.v);
    list.push({ key: k, label: n.label, value: cur.v, date: cur.date, src: cur.src, gap: 1 - prog, norm: n, reachedGoal: n.lower ? cur.v <= n.goal : cur.v >= n.goal });
  }
  return list.sort((a, b) => (b.gap ?? -1) - (a.gap ?? -1));
}

export const fmtVal = (n, v) => (v == null ? '—' : n.unit === 'zeit' ? fmtTime(v) : String(Math.round(v * 10) / 10));

// Zusatzblöcke je Schwäche. tage = erlaubte Wochentage (0 = Mo); die Wochenregeln prüft rules.js danach erneut.
export const BOOSTS = {
  pullups: { tage: [0, 2], code: 'KRAFTPLUS', text: 'Klimmzug-Block: 5× Negativ-Klimmzüge (5 s ablassen) + 3× max. −2', block: 'Zug-Kraft' },
  pushups: { tage: [0, 2], code: 'KRAFTPLUS', text: 'Liegestütz-Block: 4× 60 % deines Maximums, 60 s Pause', block: 'Druck-Kraftausdauer' },
  situps: { tage: [0, 2], code: 'KRAFTPLUS', text: 'Sit-up-Block: 4× 60 % deines Maximums + Unterarmstütz 2× 60 s', block: 'Rumpf' },
  swim100: { tage: [0], code: 'STPLUS', text: 'Zusätzliche Schwimmeinheit: 8× 50 m Brust zügig, 30 s Pause', block: 'Schwimmen' },
  run3000: { tage: [6], code: 'LAUFPLUS', text: 'Nach dem Lauf: 6× 20 s Steigerung + Sonntagslauf +10 min', block: 'Laufen' },
  run5000: { tage: [6], code: 'LAUFPLUS', text: 'Sonntagslauf +10 min, letzte 10 min im Tempo', block: 'Laufen' },
  vo2max: { tage: [6], code: 'LAUFPLUS', text: '4× 4 min zügig (Zone 4) im Sonntagslauf, 3 min Trab', block: 'Ausdauer' },
  ruck7: { tage: [5], code: 'MARSCHPLUS', text: 'Samstag immer Marsch statt Wechsel; letzte 3 km zügig', block: 'Marsch' },
  march20: { tage: [5], code: 'MARSCHPLUS', text: 'Samstag immer Marsch, Strecke +2 km', block: 'Marsch' },
};

// Wählt die 1–2 größten Schwächen mit nennenswerter Lücke
export function focusAreas(weak) {
  return weak.filter((w) => w.gap != null && w.gap > 0.25 && BOOSTS[w.key]).slice(0, 2);
}
