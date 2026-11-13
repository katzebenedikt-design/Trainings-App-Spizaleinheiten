// Garmin-Aktivität → Trainingstracker: Kraft-Sätze ins Kraftprotokoll, passende geplante Einheit als erledigt markieren.
import { plannedDay } from './planner.js';
import { daysBetween, iso } from './util.js';

// Garmin-Übungskategorie (FIT) → Übung der App. Name (z. B. LAT_PULLDOWN) hat Vorrang vor der Kategorie.
const NAME_MAP = [[/LAT_PULLDOWN/, 'latzug'], [/BENCH_DIP|(^|_)DIP/, 'dips'], [/DIAMOND|CLOSE_GRIP/, 'diamant'], [/BULGARIAN|SPLIT_SQUAT/, 'bulgarian'], [/BURPEE/, 'burpee'], [/FARMER/, 'farmers'], [/GLUTE_BRIDGE|HIP_RAISE/, 'glute_bridge'], [/INVERTED_ROW|RING_ROW/, 'tischrudern']];
export const KATEGORIE = {
  PULL_UP: 'klimmzug', PUSH_UP: 'liegestuetz', SIT_UP: 'situp', CRUNCH: 'situp', SQUAT: 'kniebeuge', LUNGE: 'ausfallschritt',
  DEADLIFT: 'kreuzheben', BENCH_PRESS: 'bankdruecken', ROW: 'rudern', SHOULDER_PRESS: 'schulterdruecken', HYPEREXTENSION: 'hyperextension',
  CURL: 'bizeps', TRICEPS_EXTENSION: 'trizeps', FLYE: 'butterfly', PLANK: 'plank', CALF_RAISE: 'wadendruecken', CARRY: 'farmers',
  HIP_RAISE: 'glute_bridge', TOTAL_BODY: 'burpee',
};
// Deutsche Namen für Kategorien ohne eigene App-Übung (werden als eigene Übung angelegt)
const KAT_DE = { LATERAL_RAISE: 'Seitheben', SHRUG: 'Shrugs', LEG_CURL: 'Beinbeuger', LEG_RAISE: 'Beinheben', CORE: 'Rumpf', CHOP: 'Holzhacker', HIP_STABILITY: 'Hüftstabilität', HIP_SWING: 'Kettlebell Swing', OLYMPIC_LIFT: 'Olympisches Heben', CARDIO: 'Cardio', BANDED_EXERCISES: 'Band-Übung', BATTLE_ROPE: 'Battle Rope', SLED: 'Schlitten', SANDBAG: 'Sandsack', MOVE: 'Bewegung', RUN: 'Laufen', BIKE: 'Rad' };

export function exIdFor(cat, name, st) {
  for (const [re, id] of NAME_MAP) if (name && re.test(name)) return id;
  if (KATEGORIE[cat]) return KATEGORIE[cat];
  // Eigene Übung „… (Garmin)“ einmalig anlegen
  const cid = 'g_' + cat.toLowerCase();
  st.customExercises = st.customExercises || [];
  if (!st.customExercises.some((e) => e.id === cid)) st.customExercises.push({ id: cid, name: (KAT_DE[cat] || cat.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())) + ' (Garmin)', typ: 'last', gruppe: 'Von Garmin', custom: true, cue: '' });
  return cid;
}

// Sätze nach Übung gruppieren und als Kraft-Einträge anlegen (je Übung ein Eintrag wie bei Handeingabe)
export function kraftAusGarmin(st, a) {
  if (!a.sets?.length) return [];
  if (st.strength.some((x) => x.garminId === a.garminId)) return [];
  const by = new Map();
  for (const s of a.sets) {
    const exId = exIdFor(s.cat, s.name, st);
    if (!by.has(exId)) by.set(exId, []);
    by.get(exId).push({ reps: s.reps || 0, kg: s.kg || 0, sec: /PLANK/.test(s.cat) ? s.sec : undefined, rest: s.rest ?? undefined });
  }
  const out = [];
  for (const [exId, sets] of by) {
    const e = { id: `g${a.garminId}_${exId}`, garminId: a.garminId, date: a.date, exId, sets, grade: null, note: `Von Garmin übernommen (${a.time || ''} Uhr)`.replace(' ( Uhr)', ''), source: 'garmin' };
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
  const kraft = a.sport === 'kraft' ? kraftAusGarmin(st, a) : [];
  const einheit = einheitAbhaken(st, a, today);
  return { kraft, einheit };
}
