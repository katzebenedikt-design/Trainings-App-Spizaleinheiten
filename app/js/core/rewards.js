// Punkte, Serie, Ränge und Abzeichen.
import { iso, addDays } from './util.js';

export const RANKS = [
  [0, 'Rekrut'], [300, 'Gefreiter'], [800, 'Obergefreiter'], [1500, 'Hauptgefreiter'], [2500, 'Stabsgefreiter'],
  [4000, 'Unteroffizier'], [6000, 'Stabsunteroffizier'], [8500, 'Feldwebel'], [11500, 'Oberfeldwebel'],
  [15000, 'Hauptfeldwebel'], [20000, 'Stabsfeldwebel'], [26000, 'Oberstabsfeldwebel'],
];

export function rankFor(points) {
  let i = 0; for (let j = 0; j < RANKS.length; j++) if (points >= RANKS[j][0]) i = j;
  const next = RANKS[i + 1];
  return { index: i, name: RANKS[i][1], next: next ? next[1] : null, from: RANKS[i][0], to: next ? next[0] : RANKS[i][0], chevrons: Math.min(3, Math.floor(i / 2) + 1) };
}

export const BADGES = {
  erster_checkin: { name: 'Erster Check-in', icon: '✓', desc: 'Den ersten Morgen-Check-in gemacht' },
  serie7: { name: '7-Tage-Serie', icon: '7', desc: '7 Tage in Folge aktiv' },
  serie30: { name: '30-Tage-Serie', icon: '30', desc: '30 Tage in Folge aktiv' },
  serie100: { name: '100-Tage-Serie', icon: '100', desc: '100 Tage in Folge aktiv' },
  erstes_training: { name: 'Erste Einheit', icon: '▲', desc: 'Erste Trainingseinheit abgeschlossen' },
  zehn_einheiten: { name: '10 Einheiten', icon: '10', desc: '10 Trainingseinheiten abgeschlossen' },
  fuenfzig_einheiten: { name: '50 Einheiten', icon: '50', desc: '50 Trainingseinheiten abgeschlossen' },
  erster_test: { name: 'Erster Test', icon: 'T', desc: 'Ersten Monatstest eingetragen' },
  lauf13: { name: '3000 m < 13:00', icon: '13', desc: '3000 m unter 13 Minuten' },
  lauf12: { name: '3000 m < 12:00', icon: '12', desc: '3000 m unter 12 Minuten (KSK-Richtwert)' },
  lauf11: { name: '3000 m < 11:00', icon: '11', desc: '3000 m unter 11 Minuten' },
  klimm15: { name: '15 Klimmzüge', icon: '15', desc: '15 saubere Klimmzüge' },
  klimm20: { name: '20 Klimmzüge', icon: '20', desc: '20 saubere Klimmzüge' },
  erster_marsch: { name: 'Erster Marsch', icon: 'M', desc: 'Ersten Marsch mit Gepäck eingetragen' },
  marsch20: { name: '20 km Marsch', icon: '20K', desc: 'Marsch über 20 km' },
  schwimmer: { name: 'Schwimmer', icon: 'S', desc: 'Erste Schwimmeinheit eingetragen' },
  atem10: { name: 'Ruhige Hand', icon: '□', desc: '10 Box-Atmungen' },
  warum: { name: 'Mein Warum', icon: '!', desc: 'Dein Warum aufgeschrieben' },
  nato: { name: 'NATO-Alphabet', icon: 'A–Z', desc: 'NATO-Alphabet-Lektion gemeistert' },
  englisch_p1: { name: 'Englisch Phase 1', icon: 'EN1', desc: 'Englisch Phase 1 abgeschlossen' },
  englisch_p2: { name: 'Englisch Phase 2', icon: 'EN2', desc: 'Englisch Phase 2 abgeschlossen' },
  englisch_p3: { name: 'Englisch Phase 3', icon: 'EN3', desc: 'Englisch Phase 3 abgeschlossen' },
  funker: { name: 'Funker', icon: '((·))', desc: '5 Gespräche fehlerfrei geführt' },
  kurs1: { name: 'Erster Kurs', icon: 'K', desc: 'Ersten Grundlagenkurs bestanden' },
  alle_kurse: { name: 'Grundausbildung', icon: 'GA', desc: 'Alle Grundlagenkurse bestanden' },
  kopf: { name: 'Kopfrechner', icon: '÷', desc: 'Kopfrechnen Level 5 erreicht' },
  gedaechtnis: { name: 'Gedächtnis', icon: 'M7', desc: 'Merkfähigkeit Level 5 erreicht' },
  garmin: { name: 'Datenlage', icon: 'G', desc: 'Garmin-Daten importiert' },
  backup: { name: 'Gesichert', icon: '⇩', desc: 'Erste Sicherung erstellt' },
};

export function activeDays(state) {
  return new Set(Object.entries(state.done).filter(([, v]) => v && v.length).map(([d]) => d));
}

export function streak(state, today = iso()) {
  const days = activeDays(state);
  let d = days.has(today) ? today : addDays(today, -1), n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

// Liefert Ereignisse (Abzeichen, Beförderung) für die Animationen
export function award(state, pts, tag, date = iso()) {
  const events = [];
  const before = rankFor(state.rewards.points);
  state.rewards.points += pts;
  state.rewards.log.push({ date, pts, tag });
  if (state.rewards.log.length > 400) state.rewards.log.splice(0, state.rewards.log.length - 400);
  if (tag) { const list = state.done[date] || (state.done[date] = []); if (!list.includes(tag)) list.push(tag); }
  const after = rankFor(state.rewards.points);
  if (after.index > before.index) events.push({ type: 'rank', rank: after });
  events.push(...checkBadges(state, date));
  return events;
}

export function giveBadge(state, id, date = iso()) {
  if (state.rewards.badges[id] || !BADGES[id]) return null;
  state.rewards.badges[id] = date;
  return { type: 'badge', id, badge: BADGES[id] };
}

export function checkBadges(state, date = iso()) {
  const ev = [];
  const g = (id, cond) => { if (cond) { const e = giveBadge(state, id, date); if (e) ev.push(e); } };
  const s = streak(state, date);
  g('erster_checkin', state.checkins.length > 0);
  g('serie7', s >= 7); g('serie30', s >= 30); g('serie100', s >= 100);
  const trainings = Object.values(state.done).filter((v) => v.includes('train')).length;
  g('erstes_training', trainings >= 1); g('zehn_einheiten', trainings >= 10); g('fuenfzig_einheiten', trainings >= 50);
  g('erster_test', state.tests.length > 0);
  const runs3k = [...state.tests.map((t) => t.run3000), ...state.runs.filter((r) => r.distM >= 2990 && r.distM <= 3100).map((r) => (r.durSec * 3000) / r.distM)].filter(Boolean);
  const bestRun = runs3k.length ? Math.min(...runs3k) : null;
  g('lauf13', bestRun && bestRun < 780); g('lauf12', bestRun && bestRun < 720); g('lauf11', bestRun && bestRun < 660);
  const bestPull = Math.max(0, ...state.tests.map((t) => t.pullups || 0));
  g('klimm15', bestPull >= 15); g('klimm20', bestPull >= 20);
  g('erster_marsch', state.runs.some((r) => r.type === 'marsch'));
  g('marsch20', state.runs.some((r) => r.type === 'marsch' && r.distM >= 20000));
  g('schwimmer', state.swims.length > 0);
  g('atem10', state.mental.breath.length >= 10);
  g('warum', !!state.mental.why.text?.trim());
  g('garmin', state.daily.length > 0 || state.runs.some((r) => r.source === 'garmin'));
  g('backup', !!state.settings.lastBackup);
  g('kopf', (state.mental.games.rechnen?.level || 1) >= 5);
  g('gedaechtnis', (state.mental.games.merken?.level || 1) >= 5);
  return ev;
}

// Ton: meist sachlich, ab und zu klare Ansage
const SACHLICH = ['Auftrag erfüllt.', 'Eingetragen.', 'Sauber.', 'Gute Arbeit.', 'Erledigt. Weiter.'];
const ANSAGE = ['Genau so. Morgen wieder.', 'Disziplin schlägt Motivation.', 'Der Wille entscheidet.', 'Keiner schenkt dir die 0,1 %. Du holst sie dir.', 'Das war Pflicht. Die Kür kommt noch.'];
export const praise = () => { const a = Math.random() < 0.25 ? ANSAGE : SACHLICH; return a[Math.floor(Math.random() * a.length)]; };
