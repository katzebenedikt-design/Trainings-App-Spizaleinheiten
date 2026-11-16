// Garmin-Aktivität → Trainingstracker: Kraft-Sätze ins Kraftprotokoll, passende geplante Einheit als erledigt markieren.
import { plannedDay } from './planner.js';
import { daysBetween, iso } from './util.js';
import { EXERCISES } from '../data/exercises.js';

const TYPEN = Object.fromEntries(EXERCISES.map((e) => [e.id, e.typ]));

// Garmin-Übungskategorie (FIT) → Übung der App. Name (z. B. LAT_PULLDOWN) hat Vorrang vor der Kategorie.
const NAME_MAP = [[/LAT_PULLDOWN/, 'latzug'], [/BENCH_DIP|(^|_)DIP/, 'dips'], [/DIAMOND|CLOSE_GRIP/, 'diamant'], [/BULGARIAN|SPLIT_SQUAT/, 'bulgarian'], [/BURPEE/, 'burpee'], [/FARMER/, 'farmers'], [/GLUTE_BRIDGE|HIP_RAISE/, 'glute_bridge'], [/INVERTED_ROW|RING_ROW/, 'tischrudern']];
export const KATEGORIE = {
  PULL_UP: 'klimmzug', PUSH_UP: 'liegestuetz', SIT_UP: 'situp', CRUNCH: 'situp', SQUAT: 'kniebeuge', LUNGE: 'ausfallschritt',
  DEADLIFT: 'kreuzheben', BENCH_PRESS: 'bankdruecken', ROW: 'rudern', SHOULDER_PRESS: 'schulterdruecken', HYPEREXTENSION: 'hyperextension',
  CURL: 'bizeps', TRICEPS_EXTENSION: 'trizeps', FLYE: 'butterfly', PLANK: 'plank', CALF_RAISE: 'wadendruecken', CARRY: 'farmers',
  HIP_RAISE: 'glute_bridge', TOTAL_BODY: 'burpee',
};
// Deutsche Namen für Kategorien ohne eigene App-Übung (werden als eigene Übung angelegt)
const KAT_DE = { UNKNOWN: 'Nicht erkannt', LATERAL_RAISE: 'Seitheben', SHRUG: 'Shrugs', LEG_CURL: 'Beinbeuger', LEG_RAISE: 'Beinheben', CORE: 'Rumpf', CHOP: 'Holzhacker', HIP_STABILITY: 'Hüftstabilität', HIP_SWING: 'Kettlebell Swing', OLYMPIC_LIFT: 'Olympisches Heben', CARDIO: 'Cardio', BANDED_EXERCISES: 'Band-Übung', BATTLE_ROPE: 'Battle Rope', SLED: 'Schlitten', SANDBAG: 'Sandsack', MOVE: 'Bewegung', RUN: 'Laufen', BIKE: 'Rad' };

export function exIdFor(cat, name, st) {
  for (const [re, id] of NAME_MAP) if (name && re.test(name)) return id;
  if (KATEGORIE[cat]) return KATEGORIE[cat];
  // Eigene Übung „… (Garmin)“ einmalig anlegen
  const cid = 'g_' + cat.toLowerCase();
  st.customExercises = st.customExercises || [];
  if (!st.customExercises.some((e) => e.id === cid)) st.customExercises.push({ id: cid, name: (KAT_DE[cat] || cat.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())) + ' (Garmin)', typ: 'last', gruppe: 'Von Garmin', custom: true, cue: '' });
  return cid;
}

// Übungsfamilien: Die Uhr verwechselt innerhalb einer Familie oft (Ausfallschritt ↔ Kniebeuge, Bank- ↔ Schulterdrücken)
const FAMILIE = [
  ['kniebeuge', 'ausfallschritt', 'bulgarian', 'rucksack_kniebeuge'],
  ['bankdruecken', 'schulterdruecken', 'pike', 'butterfly'],
  ['klimmzug', 'latzug'],
  ['rudern', 'tischrudern', 'rucksack_rudern'],
  ['liegestuetz', 'dips', 'diamant', 'liegestuetz_erhoeht', 'trizeps'],
  ['bizeps', 'rucksack_curl'],
  ['hyperextension', 'kreuzheben', 'rucksack_kreuzheben', 'glute_bridge'],
];
const KAT_ID = (cat, name) => { for (const [re, id] of NAME_MAP) if (name && re.test(name)) return id; return KATEGORIE[cat] || null; };
const familie = (id) => FAMILIE.find((f) => f.includes(id)) || [id];

// Passt Satz s zur geplanten Übung exId? Sicher erkannt: genau +3, gleiche Familie +2, andere Übung −3. Unsicher: als Möglichkeit genannt +1.
function passung(s, exId) {
  const alt = s.alt || (s.cat && s.cat !== 'UNKNOWN' ? [{ cat: s.cat, name: s.name, p: 100 }] : []);
  const top = alt.length ? Math.max(...alt.map((x) => x.p)) : 0;
  const topIds = alt.filter((x) => x.p === top).map((x) => KAT_ID(x.cat, x.name)).filter(Boolean);
  const alleIds = alt.map((x) => KAT_ID(x.cat, x.name)).filter(Boolean);
  if (s.conf) return topIds.includes(exId) ? 3 : topIds.some((i) => familie(i).includes(exId)) ? 2 : -3;
  return alleIds.includes(exId) || alleIds.some((i) => familie(i).includes(exId)) ? 1 : 0;
}
// Zwei Sätze sehen nach derselben Übung aus (Wiederholungen und Gewicht ähnlich)?
function aehnlich(a, b, typ) {
  const r = Math.max(a.reps, b.reps) / Math.max(1, Math.min(a.reps, b.reps));
  const kg = typ === 'last' && Math.max(a.kg, b.kg) > 0 ? Math.abs(a.kg - b.kg) / Math.max(a.kg, b.kg) : 0;
  return r <= 1.5 && kg <= 0.35;
}

// Sätze der Reihe nach den geplanten Übungen zuordnen (dynamische Programmierung). null, wenn es nicht passt.
export function abgleichMitPlan(sets, plan, typOf = () => 'last') {
  const n = sets.length, m = plan.length;
  if (!n || !m) return null;
  const NEG = -1e9;
  const seg = (j, i, k) => {
    let sc = -1 * Math.abs(k - i - plan[j].sets);
    for (let t = i; t < k; t++) { sc += passung(sets[t], plan[j].id); if (t > i && !aehnlich(sets[t - 1], sets[t], typOf(plan[j].id))) sc -= 1.5; }
    return sc;
  };
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(NEG)), von = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(-1));
  dp[0][0] = 0;
  for (let j = 0; j < m; j++) for (let i = 0; i <= n; i++) {
    if (dp[j][i] === NEG) continue;
    for (let k = i; k <= n; k++) { const v = dp[j][i] + seg(j, i, k); if (v > dp[j + 1][k]) { dp[j + 1][k] = v; von[j + 1][k] = i; } }
  }
  if (dp[m][n] === NEG) return null;
  const zu = new Array(n);
  for (let j = m, k = n; j > 0; j--) { const i = von[j][k]; for (let t = i; t < k; t++) zu[t] = plan[j - 1].id; k = i; }
  // Plausibilität: sicher erkannte Sätze müssen überwiegend (≥ 70 %) zur Zuordnung passen, Satzzahl grob wie geplant
  const sicher = sets.map((s, t) => [s, zu[t]]).filter(([s]) => s.conf);
  const ok = sicher.filter(([s, id]) => passung(s, id) > 0).length;
  const soll = plan.reduce((a, p) => a + p.sets, 0);
  if ((sicher.length && ok / sicher.length < 0.7) || n < soll * 0.5 || n > soll * 1.5) return null;
  return zu;
}

// Geplante Krafteinheit des Tages als Vorlage (Reihenfolge und Satzzahl der Übungen)
function planVorlage(st, a) {
  try {
    const sessions = plannedDay(st, a.date, { withReadiness: false }).sessions;
    const s = a.linked ? sessions[a.linked.idx] : sessions.find((x) => KRAFT.has(x.code));
    if (!s || !KRAFT.has(s.code)) return null;
    // Nur Übungen mit Wiederholungen: Tragen (Meter) oder Halten (Sekunden) zeichnet die Uhr nicht als Satz auf
    const ex = s.blocks.flatMap((b) => b.ex || []).filter((e) => e.id !== 'farmers' && !/\d\s*(m|s)\b/.test(String(e.reps))).map((e) => ({ id: e.id, sets: e.sets || 3 }));
    return ex.length >= 2 ? ex : null;
  } catch { return null; }
}

// Sätze nach Übung gruppieren und als Kraft-Einträge anlegen (je Übung ein Eintrag wie bei Handeingabe).
// Gibt es für den Tag eine geplante Krafteinheit, werden die Sätze der Reihe nach den geplanten Übungen zugeordnet
// (die Uhr erkennt viele Übungen nicht oder verwechselt sie); sonst nach Garmins Erkennung.
export function kraftAusGarmin(st, a, { typOf } = {}) {
  if (!a.sets?.length) return [];
  if (st.strength.some((x) => x.garminId === a.garminId)) return [];
  const vorlage = planVorlage(st, a);
  const typ = typOf || ((id) => (st.customExercises || []).find((e) => e.id === id)?.typ || TYPEN[id] || 'last');
  const zu = vorlage ? abgleichMitPlan(a.sets, vorlage, typ) : null;
  const by = new Map();
  a.sets.forEach((s, i) => {
    const exId = zu ? zu[i] : exIdFor(s.cat, s.name, st);
    if (!by.has(exId)) by.set(exId, []);
    by.get(exId).push({ reps: s.reps || 0, kg: s.kg || 0, sec: /PLANK/.test(s.cat) ? s.sec : undefined, rest: s.rest ?? undefined });
  });
  a.zuordnung = zu ? 'plan' : 'garmin';
  const out = [];
  for (const [exId, sets] of by) {
    const e = { id: `g${a.garminId}_${exId}`, garminId: a.garminId, date: a.date, exId, sets, grade: null, note: `Von Garmin übernommen (${a.time || ''} Uhr${zu ? ', nach Plan zugeordnet' : ''})`.replace(' ( Uhr)', '').replace('( Uhr, ', '('), source: 'garmin' };
    st.strength.push(e); out.push(e);
  }
  return out;
}

// Welche geplante Einheit passt zu welcher Garmin-Sportart?
const KRAFT = new Set(['K1', 'K2', 'K4', 'ZIRKEL', 'CAL', 'KRAFTO', 'KMAXU', 'KMAXO', 'OBENLEICHT', 'PROPHYLAXE', 'TESTKRAFT', 'KRAFTPLUS', 'SPEZ', 'TROCKEN', 'REHA']);
export function passt(sport, s) {
  if (!s || s.rest) return false;
  if (sport === 'lauf') return !!s.run || s.code === 'TESTLAUF' || s.code === 'EILMARSCH';
  if (sport === 'gehen' || sport === 'wandern') return !!s.ruck || s.code === 'EILMARSCH' || s.code === 'ALTCARDIO';
  if (sport === 'schwimmen') return !!s.swim || ['STTECH', 'TESTSCHWIMMEN'].includes(s.code);
  if (sport === 'kraft') return KRAFT.has(s.code);
  if (sport === 'kampf') return s.code === 'KICKBOX';
  if (sport === 'rad' || sport === 'cardio') return s.code === 'ALTCARDIO';
  return false;
}

export const MIN_DAUER = 10 * 60; // kürzere Aufzeichnungen (z. B. 40 s „Basis“) zählen nicht als Einheit

// Aktivität einer geplanten Einheit desselben Tages zuordnen und diese als erledigt markieren
export function einheitAbhaken(st, a, today = iso()) {
  if (a.linked || (a.durSec || 0) < MIN_DAUER) return null;
  const day = plannedDay(st, a.date, { withReadiness: a.date === today });
  const done = st.done[a.date] || (st.done[a.date] = []);
  const i = day.sessions.findIndex((s, k) => passt(a.sport, s) && !done.includes('train:' + k));
  if (i < 0) return null;
  const s = day.sessions[i];
  done.push('train:' + i);
  if (!done.includes('train')) done.push('train');
  // Punkte wie beim Antippen, aber nur für frische Aktivitäten (letzte 3 Tage), nicht für die Nachholung alter Wochen
  const pts = daysBetween(a.date, today) <= 3 ? 40 : 0;
  if (pts) { st.rewards.points += pts; st.rewards.log.push({ date: a.date, pts, tag: 'train' }); }
  a.linked = { idx: i, code: s.code, title: s.title };
  return { date: a.date, title: s.title, pts };
}

// Alles für eine (neue oder um Sätze ergänzte) Aktivität
export function uebernehme(st, a, today = iso()) {
  const einheit = einheitAbhaken(st, a, today);
  const kraft = a.sport === 'kraft' ? kraftAusGarmin(st, a) : [];
  return { kraft, einheit };
}
