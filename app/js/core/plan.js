// Trainingsplanung bis zum Auswahlverfahren.
// Grundlagen: KSK-Trainingshandbuch (Leistungsgruppen C/B/A, 7D-Test, TB/K/MT-Bereiche, Erholung 48 h),
// EGB-Report (Periodisierung Adaptiv → Aufbau → Peaking), NSW Physical Training Guide (26-Wochen-Progression,
// Calisthenics-Tabelle, Intervalle), SFAS-Handbuch (Zone 2, Ruck-Aufbau, Erholungswochen, Zirkel).
// Leitregeln (elite-selection-coach): Umfang max. ca. 10 % pro Woche steigern, alle 3–4 Wochen Entlastung,
// mindestens 1 Ruhetag, kein Training durch Schmerz.
import { addDays, daysBetween, mondayOf, weekday, isoWeekKey, clamp, fmtTime, sortByDate, last, iso } from './util.js';
import { KICKBOX, WOCHEN_REGELN } from '../data/requirements.js';

// Zielwerte kommen aus der zentralen Konfiguration (data/requirements.js).
export { getNorms } from '../data/requirements.js';
import { getNorms } from '../data/requirements.js';

export const TEST_FIELDS = [
  { key: 'run3000', label: '3000 m (Zeit)', unit: 'zeit', core: true },
  { key: 'pullups', label: 'Klimmzüge max. (Ristgriff, ausgehängt)', unit: 'wdh', core: true },
  { key: 'pushups', label: 'Liegestütze max.', unit: 'wdh', core: true },
  { key: 'situps', label: 'Sit-ups max.', unit: 'wdh', core: true },
  { key: 'swim100', label: '100 m Brust (Zeit)', unit: 'zeit', core: true },
  { key: 'ruck7', label: '7 km Eilmarsch 20 kg (Zeit, optional)', unit: 'zeit' },
  { key: 'run12', label: '12-Min-Lauf (m, 7D)', unit: 'm' },
  { key: 'pendel', label: '4×9 m Pendellauf (s, 7D)', unit: 's' },
  { key: 'weitsprung', label: 'Standweitsprung (cm, 7D)', unit: 'cm' },
  { key: 'bank75', label: 'Bankdrücken 75 % KG (Wdh., 7D)', unit: 'wdh' },
  { key: 'pull90', label: 'Klimmzüge in 90 s (7D)', unit: 'wdh' },
  { key: 'burpee90', label: 'Jump-Over-Burpees 90 s (7D)', unit: 'wdh' },
  { key: 'kleider100', label: '100 m Kleiderschwimmen (Zeit, 7D)', unit: 'zeit' },
];

// 7D-Test Punkte (KSK-Trainingshandbuch 4.2–4.7): 1 = gut, 3 = mittel, 5 = schwach
export function score7D(t) {
  const pts = {}; let est = false;
  const p = (v, a, b, lower) => (lower ? (v < a ? 1 : v < b ? 3 : 5) : v > a ? 1 : v >= b ? 3 : 5);
  pts.pendel = t.pendel != null ? p(t.pendel, 9, 10, true) : null;
  pts.weitsprung = t.weitsprung != null ? p(t.weitsprung, 245, 215) : null;
  pts.bank75 = t.bank75 != null ? p(t.bank75, 20, 10) : null;
  const pull = t.pull90 ?? t.pullups;
  pts.pull90 = pull != null ? p(pull, 12, 5) : null;
  pts.burpee90 = t.burpee90 != null ? p(t.burpee90, 20, 12) : null;
  let run12 = t.run12;
  if (run12 == null && t.run3000) { run12 = (3000 / t.run3000) * 720 * 0.97; est = true; }
  pts.run12 = run12 != null ? p(run12, 2900, 2400) : null;
  let k = t.kleider100;
  if (k == null && t.swim100) { k = t.swim100 * 1.3; est = true; }
  pts.kleider100 = k != null ? (k < 150 ? 1 : k <= 210 ? 3 : 5) : null;
  let sum = 0, missing = 0;
  for (const v of Object.values(pts)) { if (v == null) { sum += 3; missing++; } else sum += v; }
  const group = sum <= 14 ? 'A' : sum <= 25 ? 'B' : 'C';
  return { pts, sum, group, missing, estimated: est || missing > 0 };
}

export function currentBest(state) {
  const s = state.profile.start || {};
  const b = { run3000: s.run3000, pullups: s.pullups, pushups: s.pushups, situps: s.situps, swim100: s.swim100, ruck7: null };
  for (const t of sortByDate(state.tests)) for (const k of Object.keys(b)) if (t[k] != null) b[k] = t[k];
  return b;
}

// Sortierte Gewichtsliste zwischenspeichern (wird pro Kraft-Eintrag abgefragt)
const bwCache = new WeakMap();
function sortedBw(list) {
  const c = bwCache.get(list);
  const sig = list.length + ':' + (list[list.length - 1]?.date || '') + ':' + (list[list.length - 1]?.kg ?? '');
  if (c && c.sig === sig) return c.sorted;
  const sorted = sortByDate(list);
  bwCache.set(list, { sig, sorted });
  return sorted;
}
export function bodyweightOn(state, date) {
  const list = state.bodyweight || [];
  if (!list.length) return null;
  const s = sortedBw(list);
  let lo = 0, hi = s.length - 1, found = -1; // letzter Eintrag mit date <= Datum
  while (lo <= hi) { const m = (lo + hi) >> 1; if (s[m].date <= date) { found = m; lo = m + 1; } else hi = m - 1; }
  return found >= 0 ? s[found].kg : s[0].kg;
}

// ---------- Phasen ----------
export const PHASE_INFO = {
  grundlage: { name: 'Grundlage', lg: 'C', desc: 'Fundament: lange ruhige Läufe (Zone 2), Kraftausdauer mit Körpergewicht und an Geräten, Schwimmtechnik, leichte Märsche. Umfang vor Intensität.', ziele: ['3000 m unter 13:00', '15 Klimmzüge', 'Schwimmen 1000 m Brust am Stück', 'Marsch 15 km mit 10 kg'] },
  aufbau: { name: 'Aufbau', lg: 'B', desc: 'Intervall- und Schwellentraining zusätzlich zur Grundlage, Kraftaufbau-Wochen (8–12 Wdh.), Märsche mit 10–15 kg, schwache 7D-Disziplinen gezielt.', ziele: ['3000 m unter 12:15', '18 Klimmzüge', '20 km Marsch 15 kg', 'VO2max über 50'] },
  leistung: { name: 'Leistung', lg: 'A', desc: '3 Trainingsblöcke à 6 Wochen (KSK Leistungsgruppe A): Maximalkraft-Wochen, intensive Intervalle, schwere Märsche 15–20 kg, Kleiderschwimmen.', ziele: ['3000 m unter 11:30', '20 Klimmzüge', '7 km Eilmarsch 20 kg unter 45 min', '200 m Kleiderschwimmen deutlich unter 7:30'] },
  spezifik: { name: 'Spezifik', lg: 'A', desc: 'Wettkampfnah: Eilmarsch, Marschfestigkeit, Zirkel unter Ermüdung, Denken unter Belastung, Testsimulationen.', ziele: ['Alle Disziplinen deutlich über Norm', 'Kopfrechnen nach harter Einheit sicher'] },
  erholung: { name: 'Erholung nach dem AV', lg: '–', desc: '2 Wochen bewusst locker: Körper und Kopf erholen, kleine Verletzungen ausheilen lassen (EGB-Report: nach der Peaking-Phase gezielt zurückfahren).', ziele: ['Ausgeheilt', 'Schlaf normalisiert', 'Gewicht stabil'] },
  nachav: { name: 'Nach dem AV: Ausbildung & Spezialisierung', lg: 'A+', desc: '4-Wochen-Blöcke: Tragen schwerer Ausrüstung (bis 35 kg, max. +2 kg/Woche), Maximalkraft (Ziel 1,5–2× KG), Griffkraft, Belastbarkeit, dazu Spezialisierungsblock Breacher/Waffenspezialist. Laufen und Schwimmen werden gehalten.', ziele: ['Kreuzheben 2× Körpergewicht', '20 km Marsch mit 30 kg', 'Farmer’s Carry 2× 30 kg 100 m', 'Laufen/Schwimmen auf AV-Niveau halten'] },
  taper: { name: 'Tapering', lg: 'A', desc: 'Umfang runter (ca. 40–50 %), Intensität kurz halten, viel Schlaf. Gesund und frisch an den Start.', ziele: ['Ausgeruht', 'Ausrüstung geprüft', 'Ablauf visualisiert'] },
};

export function phasesFor(startDate, targetDate) {
  const start = mondayOf(startDate);
  const target = mondayOf(targetDate);
  const totalW = Math.max(8, Math.round(daysBetween(start, target) / 7));
  let rest = totalW;
  const take = (w) => { const x = Math.min(w, Math.max(0, rest)); rest -= x; return x; };
  // Rückwärts vom Termin planen
  const taper = take(2), spezifik = take(10), leistung = take(18), aufbau = take(24), grundlage = rest;
  const order = [['grundlage', grundlage], ['aufbau', aufbau], ['leistung', leistung], ['spezifik', spezifik], ['taper', taper]];
  const out = []; let cur = start;
  for (const [key, w] of order) {
    if (w <= 0) continue;
    const to = addDays(cur, w * 7 - 1);
    out.push({ key, ...PHASE_INFO[key], from: cur, to, weeks: w });
    cur = addDays(to, 1);
  }
  return out;
}

// Phase „Nach dem AV“ beginnt am ersten Montag nach mindestens 14 Tagen Erholung
export function nachAvStart(av) { const d = addDays(av, 14); return weekday(d) === 0 ? d : addDays(mondayOf(d), 7); }

export function planStart(state) { return (state.created || iso()).slice(0, 10); }

export function phaseAt(state, date) {
  const phases = phasesFor(planStart(state), state.profile.targetDate);
  // Schalter „AV bestanden“: ab diesem Datum 2 Wochen Erholung, danach Phase „Nach dem AV“
  const av = state.profile.av?.bestanden;
  if (av && date >= av) {
    const from = nachAvStart(av);
    const weekTotal = Math.floor(daysBetween(phases[0].from, date) / 7) + 1;
    if (date < from) return { phase: { key: 'erholung', ...PHASE_INFO.erholung, from: av, to: addDays(from, -1), weeks: Math.ceil(daysBetween(av, from) / 7) }, phases, weekInPhase: Math.floor(daysBetween(av, date) / 7) + 1, weekTotal };
    return { phase: { key: 'nachav', ...PHASE_INFO.nachav, from, to: state.profile.av.ausbildungStart || addDays(from, 7 * 52 - 1), weeks: 52 }, phases, weekInPhase: Math.floor(daysBetween(from, date) / 7) + 1, weekTotal };
  }
  let ph = phases.find((p) => date >= p.from && date <= p.to);
  if (!ph) ph = date < phases[0].from ? phases[0] : last(phases);
  const weekInPhase = clamp(Math.floor(daysBetween(ph.from, date) / 7) + 1, 1, ph.weeks);
  const weekTotal = Math.floor(daysBetween(phases[0].from, date) / 7) + 1;
  return { phase: ph, phases, weekInPhase, weekTotal: Math.max(1, weekTotal) };
}

// Zyklus nach KSK-Trainingshandbuch S. 14–16: 5 Belastungswochen + 1 Regenerationswoche (6 Wochen),
// in jeder Regenerationswoche der Leistungstest. Phase „Nach dem AV“ behält 4-Wochen-Blöcke.
export const ZYKLUS = 6;
export function cycleWeek(weekTotal, len = ZYKLUS) { return ((weekTotal - 1) % len) + 1; }
export const isRegWeek = (cw, len = ZYKLUS) => cw === len;

export function weekMode(state, date) {
  return state.week.overrides[isoWeekKey(date)] || state.week.mode || 'arbeit';
}

// ---------- Sessions ----------
// Nach „Trainingsgestaltung Fortgeschritten“ (GK mit Schwerpunkt), Isolationsübungen (Bizeps/Trizeps)
// ersetzt durch Tragen – Griff und Rumpf unter Last bringen im Auswahlverfahren mehr.
const K1_SETS = {
  beine: ['ausfallschritt', 'kniebeuge', 'bankdruecken', 'klimmzug', 'schulterdruecken', 'hyperextension'],
  brust: ['kniebeuge', 'bankdruecken', 'butterfly', 'rudern', 'schulterdruecken', 'hyperextension'],
  ruecken: ['ausfallschritt', 'bankdruecken', 'klimmzug', 'rudern', 'schulterdruecken', 'hyperextension'],
};
const K2_SETS = {
  oben: ['bankdruecken', 'klimmzug', 'schulterdruecken', 'rudern', 'dips'],
  unten: ['kniebeuge', 'kreuzheben', 'ausfallschritt', 'wadendruecken', 'hyperextension'],
};
const KMAX_U = ['kreuzheben', 'kniebeuge', 'ausfallschritt'];
const KMAX_O = ['bankdruecken', 'klimmzug', 'schulterdruecken', 'rudern'];

// Griff & Tragen (SFAS: Farmer's Carry, Bar Hang) – fester Bestandteil jedes Kraft-Montags
const griff = (week, deload) => ({ kind: 'main', title: 'Griff & Tragen', ex: [{ id: 'farmers', sets: deload ? 2 : 3, reps: '40 m', rest: 60 }], lines: [`Hängen an der Stange ${deload ? 2 : 3}× max. (Griff), Pause 60 s`, `Farmer’s Carry: schwer, aufrecht, zügig – Ziel SFAS: 2× 22 kg über 200 m`] });

// NSW Table 2: Push-up/Sit-up/Pull-up Progression nach Maximalwert
export function calisthenics(maxPush, maxPull) {
  const push = maxPush < 40 ? [6, '10–15'] : maxPush < 60 ? [5, '15–20'] : maxPush < 80 ? [5, '20–25'] : maxPush < 100 ? [4, '30–40'] : [4, '40–50'];
  const pull = maxPull < 6 ? [6, '2–3'] : maxPull < 10 ? [5, '4–5'] : maxPull < 13 ? [5, '5–6'] : maxPull <= 15 ? [4, '8–10'] : [4, '10–12'];
  return { push, pull };
}

// NSW Table 3: Rumpf-Progression nach Woche
export function coreRoutine(week) {
  const i = week <= 6 ? 0 : week <= 11 ? 1 : week <= 16 ? 2 : week <= 21 ? 3 : 4;
  const t = [['2×30 s', '2×30 s', '2×20', '2×10'], ['2×45 s', '2×40 s', '2×25', '3×8'], ['3×40 s', '2×45 s', '3×20', '2×12'], ['3×50 s', '2×50 s', '3×25', '3×10'], ['3×60 s', '2×60 s', '3×30', '3×12']][i];
  return [`Unterarmstütz ${t[0]}`, `Seitstütz je Seite ${t[1]}`, `Bird Dog ${t[2]} (abwechselnd)`, `Superman ${t[3]}`, `Brücke einbeinig ${t[2]}`];
}

function paces(best) {
  const t = best.run3000 || 900;
  const base = t / 3; // s/km
  return {
    easy: [base * 1.3, base * 1.45], tempo: base * 1.15, schwelle: base * 1.06,
    int400: (t / 7.5) - 4, // NSW: 4 s schneller als Basis-400-m-Zeit
  };
}

const warm = (min = 10) => ({ kind: 'warm', title: 'Aufwärmen', lines: [`${min} min lockeres Einlaufen oder Ergometer`, 'Lauf-ABC: Anfersen, Kniehebelauf, Hopserlauf je 20 m', 'Dynamisch dehnen 10–20 s je Übung'] });
// Agilität und Hindernis-Technik vor Intervallen ab Aufbau (EGB-Report S. 9: HiBa-Training im Aufbau, Agilität im Peaking)
const agil = (ctx) => (['aufbau', 'leistung', 'spezifik'].includes(ctx.phaseKey) ? { kind: 'main', title: 'Agilität & Hindernis-Technik · 10 min', lines: ['Nach dem Einlaufen: 4× 10 m Start aus der Bauchlage', '2× 10 m Robben (Tiefkriechen), 2× 10 m Hochkriechen', '3× Überklettern (Mauer, Tisch oder Bank) sauber und kontrolliert', 'Hürdensprünge: 3× 5 beidbeinig über niedrige Hindernisse', 'Technik vor Tempo – erst dann die Intervalle.'] } : null);
const cool = { kind: 'cool', title: 'Abwärmen', lines: ['10–15 min locker auslaufen oder radeln', 'Faszienrolle 30–60 s je Muskel (nicht auf Knochen)'] };

export function buildSession(code, ctx) {
  const { best, vol, week, deload, mode, sat } = ctx;
  const f = vol * (deload ? 0.6 : 1) * (mode === 'schule' ? 1.1 : 1);
  const p = paces(best);
  const cal = calisthenics(best.pushups || 30, best.pullups || 5);
  const strengthEx = (ids, sets, reps, rest) => ids.map((id) => ({ id, sets: Math.max(2, Math.round(sets * (deload ? 0.67 : 1))), reps, rest }));
  switch (code) {
    case 'K1': {
      const v = ctx.variant || 'beine';
      return { code, title: `Kraftausdauer · GK ${v === 'beine' ? 'Beine' : v === 'brust' ? 'Brust' : 'Rücken'}`, sub: 'K1 · 20–25 Wdh. · Pause 60–90 s', min: Math.round(50 * Math.min(f, 1.2)), gym: true,
        blocks: [warm(), { kind: 'main', title: 'Kraftausdauer (Gerät/Hantel)', ex: strengthEx(K1_SETS[v], 4, '20–25', 75), lines: ['Gewicht so wählen, dass 25 Wdh. gerade sauber gehen.', 'Langsam und kontrolliert ausführen. Erst 1–2 Gewöhnungssätze ohne Gewicht (Trainingsgestaltung).'] },
          griff(week, deload), { kind: 'main', title: 'Rumpf', lines: ['Unterarmstütz 3× 45–90 s'] }] };
    }
    case 'K2': {
      const v = ctx.variant || 'oben';
      return { code, title: `Muskelaufbau · ${v === 'oben' ? 'Oberkörper' : 'Unterkörper'}`, sub: 'K2 · 8–12 Wdh. · Pause 90–120 s', min: 55, gym: true,
        blocks: [warm(), { kind: 'main', title: 'Muskelaufbau', ex: strengthEx(K2_SETS[v], 4, '8–12', 105), lines: ['Letzte Wiederholung schwer, aber sauber. Keine Ausweichbewegung.'] }, griff(week, deload), { kind: 'main', title: 'Rumpf', lines: coreRoutine(week).slice(0, 3) }] };
    }
    case 'K4':
      return { code, title: 'Maximalkraft 5×5', sub: 'K4 · 1–5 Wdh. · Pause 2–4 min', min: 60, gym: true,
        blocks: [warm(12), { kind: 'main', title: 'Langhantel 5×5', ex: strengthEx(['kniebeuge', 'kreuzheben', 'bankdruecken'], 5, '5', 180), lines: ['Nur mit sauberer Technik. Steigernde Sätze, letzter Satz ca. 85 %.', 'Ziel EGB-Report: relative Maximalkraft 1,5–2× Körpergewicht in den Grundübungen.'] }, griff(week, deload)] };
    case 'ZIRKEL':
      return { code, title: 'Zirkel AMRAP', sub: 'SFAS-Zirkel · 2× 12 min', min: 50, gym: true,
        blocks: [warm(), { kind: 'main', title: 'AMRAP A · 12 min', lines: ['10 Rudern', '10 Goblet-Squats', '1-Arm-Tragen 30 s je Seite', 'Isometrischer Split-Squat 30 s je Seite'], timer: 'amrap12' },
          { kind: 'main', title: 'AMRAP B · 12 min', lines: ['10 Schulterdrücken', '10 Burpees', '6 Glute-Bridge-Walkouts', '10 Klimmzüge oder Latzug'], timer: 'amrap12' },
          { kind: 'main', title: 'Verwundetentransport (PFV-Disziplin)', lines: ['Partner oder Sandsack (ca. Körpergewicht) über die Schultern: 3× 50 m, Ziel SFAS 100 m', 'Danach 2× 20 m Ziehen an der Weste/Schlaufe rückwärts', 'Rücken gerade aufnehmen, aus den Beinen heben.'] }] };
    case 'CAL':
      return { code, title: 'Calisthenics', sub: 'Liegestütz · Sit-ups · Klimmzüge', min: 25,
        blocks: [{ kind: 'main', title: 'Sätze nach deinem Maximalwert (NSW-Tabelle)', lines: [`Liegestütze ${cal.push[0]}× ${cal.push[1]}`, `Sit-ups ${cal.push[0]}× ${cal.push[1]}`, `Klimmzüge ${cal.pull[0]}× ${cal.pull[1]}`, 'Pause 1–2 min. Ablassen doppelt so langsam wie hochdrücken.', 'Einmal pro Woche ein Maximal-Satz zur Kontrolle.'] }] };
    case 'TB1': {
      const lang = (sat || ctx.sunday) && !ctx.kurz;
      // Langer Lauf max. 90 min (NSW: LSD bis ca. 9 Meilen); nach einem Marsch am Vortag nur locker bis 50 min
      const min = ctx.kurz ? Math.round(clamp((22 + week * 0.4) * f, 20, 35)) : ctx.nachMarsch ? Math.round(clamp(35 * f, 30, 50)) : Math.round(clamp((30 + week * 1.5) * f * (lang ? 1.35 : 1), 25, lang ? 90 : 75));
      return { code, title: ctx.kurz ? 'Lauf nach dem Krafttraining' : ctx.nachMarsch ? 'Lockerer Lauf nach dem Marsch' : lang ? 'Langer Dauerlauf' : 'Grundlagenlauf', sub: `TB1 · ${min} min · Zone 2 · Puls 135–150`, min, run: true,
        blocks: [{ kind: 'main', title: 'Dauermethode', lines: [`${min} min gleichmäßig locker`, `Tempo ca. ${fmtTime(p.easy[0])}–${fmtTime(p.easy[1])} /km, entscheidend ist der Puls (135–150)`, 'Du musst durch die Nase atmen oder in ganzen Sätzen reden können.', 'Zone 2 fühlt sich langsam an. Das ist richtig.'] }, { kind: 'cool', title: 'Danach', lines: ['Dehnen, Mobilität 10 min'] }] };
    }
    case 'TB2':
      if (ctx.kurz) return { code, title: 'Tempolauf nach dem Krafttraining', sub: 'TB2 · 25–30 min', min: 30, run: true,
        blocks: [{ kind: 'main', title: 'Erst Kraft, dann Ausdauer (KSK 5.1.3)', lines: ['8 min einlaufen', `${Math.round(12 * Math.min(f, 1.3))} min bei ca. ${fmtTime(p.tempo)} /km (Zone 3)`, '5 min auslaufen', 'Nach schweren Beinen: Tempo um 10 s/km langsamer.'] }] };
      return { code, title: 'Tempodauerlauf', sub: 'TB2 · mittleres Tempo', min: Math.round(45 * f), run: true,
        blocks: [warm(), { kind: 'main', title: 'Tempo', lines: [`${Math.round(20 * f)}–${Math.round(30 * f)} min bei ca. ${fmtTime(p.tempo)} /km (Zone 3, nur wenige Worte möglich)`] }, cool] };
    case 'TB3': {
      const reps = clamp(Math.round(3 + week / 6), 3, 6);
      return { code, title: 'Schwellen-Intervalle', sub: `TB3 · ${reps}× 1000 m`, min: 55, run: true,
        blocks: [warm(15), agil(ctx), { kind: 'main', title: 'Extensive Intervalle', lines: [`${reps}× 1000 m in ca. ${fmtTime(p.schwelle)}`, 'Pause 3 min Trab (wie im PFV: 5×1000 m, 3 min Pause)', 'Puls vor dem nächsten Intervall unter 140'], timer: 'k1000' }, cool] };
    }
    case 'TB4': {
      // 4. Woche des Blocks: kürzere, häufigere Intervalle (NSW Guide S. 4: „every 4th or 5th week“)
      if (ctx.cw === 4) return { code, title: 'Kurze Intervalle', sub: 'TB4 · 16× 200 m', min: 50, run: true,
        blocks: [warm(15), agil(ctx), { kind: 'main', title: 'Kurz und häufig (NSW Guide S. 4)', lines: [`16× 200 m in ca. ${fmtTime(p.int400 / 2 - 2)}`, 'Pause 200 m locker traben', 'Sauber und gleichmäßig – nicht sprinten bis zum Umfallen.'] }, cool] };
      const reps = clamp(4 + Math.floor(week / 2), 4, 10);
      return { code, title: 'Intensive Intervalle', sub: `TB4 · ${reps}× 400 m`, min: 50, run: true,
        blocks: [warm(15), agil(ctx), { kind: 'main', title: 'Intervallmethode', lines: [`${reps}× 400 m in ca. ${fmtTime(p.int400)}`, `Pause aktiv, 2–2,5× so lang wie die Belastung (ca. ${fmtTime(p.int400 * 2.2)})`, 'Gleichmäßig laufen, das letzte Intervall ist das schnellste. Max. 10 Intervalle.'], timer: 'int400' }, cool] };
    }
    case 'TBR':
      return { code, title: 'Regeneration', sub: 'TB-R · locker', min: 30, run: true,
        blocks: [{ kind: 'main', title: 'Aktive Erholung', lines: ['20–30 min sehr lockerer Trab, Rad oder Schwimmen (Puls unter 125)', 'Danach Mobilität: Hüfte, Sprunggelenk, Brustwirbelsäule'] }] };
    case 'ST': {
      const m = Math.round(clamp((600 + week * 60) * f, 400, 2200) / 50) * 50;
      return { code, title: 'Schwimmen Brust', sub: `ST · ca. ${m} m`, min: 45, swim: true,
        blocks: [{ kind: 'main', title: 'Schwimmtraining (einziger Schwimmtag – voll nutzen)', lines: ['200 m einschwimmen locker', week < 8 ? 'Technik: 6× 50 m Brust, Gleitphase betonen, Züge zählen' : `${clamp(4 + Math.floor(week / 4), 4, 10)}× 100 m Brust zügig, Pause halb so lang (NSW-Intervall)`, `Rest als ruhige Strecke bis ca. ${m} m gesamt`,
          ...(ctx.kleider ? ['Kleiderschwimmen (wenn das Bad es erlaubt): 2× 100 m in langer Hose + Shirt, danach Entkleiden im Wasser üben – PFV: 200 m im Kampfanzug max. 7:30 (KSK S. 7), EGB: deutlich darunter (EGB-Report S. 8)', 'Apnoe-Gewöhnung (EGB-Report S. 8): 4–6× 15–25 m Streckentauchen ruhig, 1–2 min Pause dazwischen – NUR mit Aufsicht am Beckenrand.'] : []),
          'Streckentauchen nur mit Aufsicht, nie allein, nie vorher hyperventilieren.'] }] };
    }
    case 'MT1': case 'MT2': case 'MT3': {
      const lvl = Number(code[2]);
      const kg = clamp(Math.round((lvl === 1 ? 5 + week * 0.5 : lvl === 2 ? 10 + week * 0.3 : 15 + week * 0.2) * (deload ? 0.7 : 1)), 5, lvl === 3 ? 20 : lvl === 2 ? 15 : 10);
      const km = clamp(Math.round((lvl === 1 ? 8 + week * 0.4 : lvl === 2 ? 15 + week * 0.2 : 20 + week * 0.15) * (deload ? 0.6 : 1)), 6, lvl === 3 ? 25 : lvl === 2 ? 20 : 15);
      return { code, title: `Marsch ${['', 'leicht', 'mittel', 'schwer'][lvl]}`, sub: `MT${lvl} · ${km} km · ${kg} kg`, min: Math.round((km / 5.5) * 60), ruck: true,
        blocks: [{ kind: 'main', title: 'Marschtraining in Stiefeln', lines: [`${km} km mit ${kg} kg Gepäck, Tempo 4–7 km/h (${lvl === 1 ? 'flach' : 'mittleres Profil'})`, 'Nicht rennen mit Gepäck. Strecke vorher mit Karte planen.', 'Füße vorher und nachher kontrollieren. Socken wechseln.', 'Gute Gelegenheit für Kompass-Übung.'] }] };
    }
    case 'ALTCARDIO':
      return { code, title: 'Schonende Ausdauer', sub: 'Rad · Ergometer · Crosstrainer', min: 30,
        blocks: [{ kind: 'main', title: 'Ohne Stoßbelastung', lines: ['Rad, Ergometer oder Crosstrainer in Zone 2 (Puls 135–150), gleiche Dauer wie geplant', 'Nur wenn es schmerzfrei ist – sonst Oberkörper-Ergometer oder Spaziergang', 'Danach den Reha-Block nicht vergessen.'] }] };
    case 'MTLANG': {
      // Spezifik: +5 km pro 6-Wochen-Block, 30 → 40 km, 15–20 kg (KSK-Trainingshandbuch S. 8)
      const block = Math.floor(((ctx.weekInPhase || 1) - 1) / 6);
      const km = clamp(30 + block * 5, 30, 40), kg = clamp(15 + block * 2, 15, 20);
      return { code, title: 'Langer Marsch', sub: `${km} km · ${kg} kg · 5 km/h`, min: Math.round((km / 5) * 60), ruck: true,
        blocks: [{ kind: 'main', title: 'Marschhärte für Phase 2', lines: [`${km} km mit ${kg} kg, gleichmäßig 5 km/h, alle 60 min 5–10 min Pause`, 'KSK: Ein 40-km-Marsch soll in Phase 2 keine Herausforderung sein (Handbuch S. 8).', 'Füße abkleben, Ersatzsocken, 0,5 l Wasser pro Stunde, Essen dabei.', 'Bei Blasen oder Schmerzen im Sprunggelenk/Knie: abbrechen, nicht durchziehen.'] }, cool] };
    }
    case 'EILMARSCH':
      return { code, title: 'Eilmarsch-Training', sub: '5–7 km · 15–20 kg · zügig', min: 50, ruck: true,
        blocks: [warm(), { kind: 'main', title: 'Eilmarsch', lines: ['5–7 km mit 15–20 kg so zügig wie sauber möglich', 'Ziel PFV: 7 km mit 20 kg unter 45 min', 'Jogging nur wenn nötig, langer Schritt'] }, cool] };
    case 'KT':
      return { code, title: 'Koordination', sub: 'KT · Lauf-ABC · Gleichgewicht', min: 30,
        blocks: [{ kind: 'main', title: 'Gewandtheit', lines: ['Lauf-ABC 2 Runden: Anfersen, Kniehebelauf, Seitwärts, Hopserlauf je 20 m', 'Steigerungsläufe 3× 80 m', 'Einbeinstand mit geschlossenen Augen 3× 30 s je Seite', 'Danach: 5 min Kopfrechnen im Mental-Bereich (Denken unter Belastung)'] }] };
    case 'MOB':
      return { code, title: 'Mobilität & Rumpf', sub: 'Faszienrolle · Mobilität', min: 25,
        blocks: [{ kind: 'main', title: 'Mobilität (SFAS)', lines: ['Faszienrolle: Brust, Lat, Gesäß, Oberschenkel hinten/vorn, Außenseite, Waden je 30–60 s', 'Hüfte: Halbkniestand mit Band 15–20×', 'Brustwirbelsäule: Open Books 8–10× je Seite', 'Dead Bugs 3× 10–12'] }, { kind: 'main', title: 'Rumpf', lines: coreRoutine(week) }] };
    case 'TEST':
      return { code, title: 'Monatlicher Leistungstest', sub: '3000 m · Klimmzüge · Liegestütze · Sit-ups · Schwimmen', min: 75, test: true,
        blocks: [warm(15), { kind: 'main', title: 'Testablauf (ausgeruht!)', lines: ['1. Klimmzüge max. (Ristgriff, ausgehängt)', '2. Liegestütze max.', '3. Sit-ups max.', '4. 3000 m auf Zeit (Bahn oder flache Strecke)', 'Schwimmen 100 m Brust: am nächsten Schwimmtag', 'Ergebnisse unter Sport → Test eintragen. Der Plan passt sich danach an.'] }] };
    case 'PROPHYLAXE':
      return { code, title: 'Verletzungsprophylaxe & Rumpf', sub: 'Vor dem Kickboxen · 25 min · ruhig', min: 25, light: true,
        blocks: [{ kind: 'main', title: 'Füße & Sprunggelenke (Marschhärte)', lines: ['Wadenheben einbeinig, 3 s ablassen: 2× 12 je Seite', 'Einbeinstand mit geschlossenen Augen: 2× 30 s je Seite', 'Fußgymnastik: Handtuch mit den Zehen greifen 2× 20'] },
          { kind: 'main', title: 'Hüfte & Schulter (SFAS)', lines: ['Hüftmobilisation im Halbkniestand 15× je Seite', 'Scapular Slides an der Wand 2× 10', 'Außenrotation mit Band 2× 15 je Seite (Schulter für Schwimmen und Kickboxen)'] },
          { kind: 'main', title: 'Rumpf & Griff', lines: coreRoutine(week).slice(0, 3).concat(['Hängen an der Stange 2× max.']) }] };
    case 'KRAFTO':
      return { code, title: 'Oberkörper-Kraft (moderat)', sub: 'Vor dem Kickboxen · 35–40 min · keine Beine', min: 40,
        blocks: [{ kind: 'main', title: 'Zug & Druck – 1–2 Wdh. im Tank lassen', ex: [{ id: 'klimmzug', sets: cal.pull[0] - (deload ? 2 : 0), reps: cal.pull[1], rest: 90 }, { id: 'liegestuetz', sets: Math.min(4, cal.push[0]) - (deload ? 1 : 0), reps: cal.push[1], rest: 75 }, { id: 'rudern', sets: deload ? 2 : 3, reps: '10–12', rest: 75 }, { id: 'schulterdruecken', sets: deload ? 2 : 3, reps: '8–10', rest: 90 }],
          lines: ['Klimmzug und Liegestütz nach NSW-Tabelle (dein Maximum). Ablassen doppelt so langsam wie hochziehen.', 'Alle 6 Wochen stattdessen Maximaltest (Montag der Entlastungswoche).'] },
          { kind: 'main', title: 'Rumpf', lines: [`Sit-ups ${Math.min(4, cal.push[0])}× ${cal.push[1]}`, 'Unterarmstütz 2× 60 s'] }] };
    case 'TROCKEN':
      return { code, title: 'Schwimm-Trockentraining', sub: 'Schwäche Schwimmen · 15 min', min: 15,
        blocks: [{ kind: 'main', title: 'Ersetzt kein Wasser – hilft aber', lines: ['Brustzug mit Band im Stand (vorgebeugt): 3× 20', 'Außenrotation mit Band 2× 15', 'Superman 3× 10 (Rumpfspannung in Wasserlage)', 'Wenn möglich: zweiten Badtag über „Verfügbar“ eintragen.'] }] };
    case 'TESTSCHWIMMEN':
      return { code, title: 'Leistungstest: 100 m Brust', sub: 'Schwimmen auf Zeit · ausgeruht', min: 40, swim: true, test: true,
        blocks: [{ kind: 'main', title: 'Test', lines: ['300 m einschwimmen, 2× 25 m Steigerung', '100 m Brust auf Zeit (Startsprung oder Abstoß – immer gleich)', '200 m locker aus', 'Zeit unter Sport → Test eintragen.'] }] };
    case 'KMAXU':
      return { code, title: 'Maximalkraft Unterkörper & Tragen', sub: 'Nach dem AV · 3–5 Wdh. · Pause 2–4 min', min: 60, gym: true,
        blocks: [warm(12), { kind: 'main', title: 'Grundübungen', ex: strengthEx(KMAX_U, 5, ctx.weekInPhase % 2 ? '5' : '3', 180), lines: ['Steigernde Sätze, Arbeitssätze bei 80–88 %. Ziel: Kreuzheben 2× Körpergewicht, Kniebeuge 1,5×.'] },
          { kind: 'main', title: 'Schwer tragen', ex: [{ id: 'farmers', sets: 4, reps: '50 m', rest: 90 }], lines: ['Sandsack auf der Schulter 3× 50 m je Seite', 'Ausrüstung kommt in der Ausbildung oft über 30 kg: Rumpf fest, kurze schnelle Schritte.'] }] };
    case 'KMAXO':
      return { code, title: 'Maximalkraft Oberkörper & Griff', sub: 'Nach dem AV · vor dem Kickboxen moderat', min: 45, gym: true,
        blocks: [{ kind: 'main', title: 'Grundübungen (nicht bis zum Versagen)', ex: strengthEx(KMAX_O, 4, '4–6', 150), lines: ['Klimmzug mit Zusatzgewicht. 1–2 Wdh. Reserve – abends ist Kickboxen.'] },
          { kind: 'main', title: 'Griff', lines: ['Hängen an Handtüchern 3× max.', 'Hantelscheiben-Kneifgriff 3× 20 s', 'Unterarm-Rollen oder Reisrolle 2× 60 s'] }] };
    case 'SPEZ': {
      const sp = ctx.spez || 'beide';
      const br = ['Vorschlaghammer auf Reifen: 3× 10 je Seite (Rotationskraft, Rumpf)', 'Medizinball-Rotationswurf an die Wand: 3× 8 je Seite', 'Schweres Werkzeug tragen (z. B. 15-kg-Sandsack einarmig): 3× 30 m je Seite', 'Schulterstabilität: Turkish Get-up leicht 2× 3 je Seite'];
      const wa = ['Anschlagpositionen halten (kniend, liegend) mit Gewicht/Rucksack: 3× 60 s je Position', 'Griff- und Unterarmausdauer: Hantel halten 3× 45 s', 'Puls hoch (20 Burpees), dann 60 s ruhig atmen und Ruhe herstellen – Grundlage für präzises Arbeiten unter Belastung', 'Brustwirbelsäule mobil: Open Books 2× 10 je Seite (Liegendanschlag)'];
      return { code, title: `Spezialisierung: ${sp === 'breacher' ? 'Breacher' : sp === 'waffen' ? 'Waffenspezialist' : 'Breacher & Waffen'}`, sub: 'Leicht vor dem Kickboxen · 20 min', min: 20, light: true,
        blocks: [{ kind: 'main', title: 'Spezifisch, nicht erschöpfend', lines: sp === 'breacher' ? br : sp === 'waffen' ? wa : [br[0], br[2], wa[0], wa[2]] }] };
    }
    case 'MTSCHWER': {
      // +2 kg nur in Belastungswochen; die Entlastungswoche zählt nicht als Steigerung
      const w0 = (ctx.weekInPhase || 1) - 1, belastet = w0 - Math.floor(w0 / 4);
      const kg = deload ? 20 : clamp(20 + 2 * belastet, 20, 35);
      const km = Math.round(clamp((12 + (ctx.weekInPhase || 1) * 0.7) * (deload ? 0.6 : 1), 8, 20));
      return { code, title: 'Schwerer Marsch', sub: `${km} km · ${kg} kg · 5–6 km/h`, min: Math.round((km / 5.5) * 60), ruck: true,
        blocks: [{ kind: 'main', title: 'Tragen schwerer Ausrüstung', lines: [`${km} km mit ${kg} kg (höchstens +2 kg pro Woche)`, 'Füße vorher abkleben, nach der Hälfte Socken wechseln.', 'Rucksack eng am Rücken, Hüftgurt trägt. Bei Knie- oder Fußschmerz abbrechen – nichts durchziehen.'] }] };
    }
    case 'KICKBOX':
      return { code, title: 'Kickboxen', sub: `Fester Termin · ${KICKBOX.zeit}`, min: KICKBOX.min, fixed: true,
        blocks: [{ kind: 'main', title: 'Training im Verein', lines: ['Fester Termin – der restliche Tag ist darauf abgestimmt.', 'Genug trinken, vorher leicht essen.', 'Sparring zählt fürs PFV (2 min Nahkampf). Danach kurz notieren, wie es lief.'] }] };
    // Ältere Codes (vor Version 3) bleiben für gespeicherte Pläne lesbar
    case 'OBENLEICHT': {
      return { code, title: 'Oberkörper-Zug & Rumpf (leicht)', sub: 'Vor dem Kickboxen · 30–35 min · keine Beine', min: 35, gym: false, light: true,
        blocks: [{ kind: 'main', title: 'Leicht, nicht bis zum Versagen', ex: [{ id: 'klimmzug', sets: cal.pull[0] - 1, reps: cal.pull[1], rest: 90 }, { id: 'rudern', sets: 3, reps: '12–15', rest: 60 }], lines: ['Etwa 2 Wiederholungen „im Tank“ lassen – das Kickboxen kommt noch.'] },
          { kind: 'main', title: 'Rumpf', lines: coreRoutine(week).slice(0, 3) }] };
    }
    case 'STTECH':
      return { code, title: 'Schwimmen Technik (leicht)', sub: 'Vor dem Kickboxen · 30 min · ruhig', min: 30, swim: true, light: true,
        blocks: [{ kind: 'main', title: 'Technik Brust', lines: ['200 m locker einschwimmen', '6× 50 m Brust, lange Gleitphase, Züge zählen', '100 m locker aus', 'Kein Sprint – abends ist Kickboxen.'] }] };
    case 'TESTKRAFT':
      return { code, title: 'Leistungstest: Kraft', sub: 'Klimmzüge · Liegestütze · Sit-ups', min: 60, test: true,
        blocks: [warm(12), { kind: 'main', title: 'Testablauf (ausgeruht!)', lines: ['1. Klimmzüge max. (Ristgriff, ausgehängt)', '2. Liegestütze max.', '3. Sit-ups max.', 'Schwimmen folgt am Mittwoch, der 3000-m-Lauf am Samstag.', 'Ergebnisse unter Sport → Test eintragen.'] }] };
    case 'TESTLAUF':
      return { code, title: 'Leistungstest: 3000 m', sub: 'Lauf auf Zeit · flache Strecke', min: 45, test: true, run: true,
        blocks: [warm(15), { kind: 'main', title: 'Testlauf', lines: ['3000 m auf Zeit, gleichmäßig anlaufen, letzte Runde ziehen.', 'Zeit unter Sport → Test eintragen. Danach passt sich der Plan an.'] }, cool] };
    case 'KOPF':
      return { code, title: 'Kopftraining', sub: 'Kognitiv · 10–15 min', min: 15, mental: true,
        blocks: [{ kind: 'main', title: 'Denken unter Belastung', lines: ['Direkt nach dem Lauf: Mental → Spiele mit „Belastungsmodus an“', 'Kopfrechnen + Merkfähigkeit je eine Runde', 'Danach 5 min Box-Atmung'] }] };
    case 'REST':
    default:
      if (ctx.friday) return { code: 'REST', title: 'Ruhetag · Heimfahrt', sub: 'Kein Training', min: 0, rest: true,
        blocks: [{ kind: 'main', title: 'Heute nur ankommen', lines: ['Kein Training, auch keine Mobility – heute ist Heimfahrt.', 'Unterwegs genug trinken, zwischendurch aufstehen und bewegen.', 'Optional im Zug: Englisch-Karteikarten oder ein Abendtext.', '7–9 Stunden Schlaf.'] }] };
      return { code: 'REST', title: 'Ruhetag', sub: 'Erholung · Superkompensation', min: 0, rest: true,
        blocks: [{ kind: 'main', title: 'Erholung ist Training', lines: ['Kein Sport. Spazieren erlaubt.', '7–9 Stunden Schlaf.', ctx.sunday ? 'Sonntag: „Mein Warum“ lesen und überarbeiten.' : 'Kurze Box-Atmung am Abend.'] }] };
  }
}

// Wochenvorlagen nach den festen Wochenregeln (data/requirements.js → WEEK_RULES):
// Mo Kraft + Lauf · Di Prophylaxe + Kickboxen · Mi Schwimmen (eigener Tag) · Do Oberkörper moderat + Kickboxen
// Fr Ruhetag (Heimfahrt) · Sa Marsch oder Intervalle · So langer Lauf (Kopftraining täglich, siehe data/kognitiv.js). [Code, Variante] je Tag, mehrere Einheiten möglich.
const TEMPLATES = {
  grundlage: [[['K1', 'beine'], ['TB1', 'kurz']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KRAFTO'], ['KICKBOX']], [['REST']], [['SAT']], [['TB1']]],
  aufbau: [[['K2', 'unten'], ['TB2', 'kurz']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KRAFTO'], ['KICKBOX']], [['REST']], [['SAT']], [['TB1']]],
  leistung: [[['KX', 'unten'], ['TB2', 'kurz']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KRAFTO'], ['KICKBOX']], [['REST']], [['SAT']], [['TB1']]],
  spezifik: [[['ZIRKEL'], ['TB1', 'kurz']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KRAFTO'], ['KICKBOX']], [['REST']], [['SAT']], [['TB1']]],
  taper: [[['CAL'], ['TB1', 'kurz']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KICKBOX']], [['REST']], [['TB2']], [['TBR']]],
  // Nach dem Auswahlverfahren
  erholung: [[['TBR'], ['MOB']], [['PROPHYLAXE'], ['KICKBOX']], [['ST']], [['KICKBOX']], [['REST']], [['TBR']], [['MOB']]],
  nachav: [[['KMAXU'], ['TB1', 'kurz']], [['PROPHYLAXE'], ['SPEZ'], ['KICKBOX']], [['ST']], [['KMAXO'], ['KICKBOX']], [['REST']], [['MTSCHWER']], [['TB1']]],
};

// Grundplan eines Tages (ohne Schwächen, Verfügbarkeit und Schonmodus – das macht core/planner.js)
export function baseDay(state, date) {
  const { phase, weekInPhase, weekTotal } = phaseAt(state, date);
  const len = phase.key === 'nachav' ? 4 : ZYKLUS;
  const cw = cycleWeek(phase.key === 'nachav' ? weekInPhase : weekTotal, len);
  const deload = isRegWeek(cw, len) && !['taper', 'erholung'].includes(phase.key);
  const mode = weekMode(state, date);
  const wd = weekday(date);
  const best = currentBest(state);
  const adj = state.weekAdj?.[isoWeekKey(date)];
  const vol = (state.plan.volFactor || 1) * (adj?.faktor || 1);
  const kleider = ['aufbau', 'leistung', 'spezifik', 'nachav'].includes(phase.key);
  const ctx0 = { best, vol, week: weekTotal, weekInPhase, deload, mode, sat: wd === 5, sunday: wd === 6, friday: wd === 4, kleider, spez: state.profile.av?.spez || 'beide', cw, phaseKey: phase.key };
  let plan = TEMPLATES[phase.key][wd].map(([c, v]) => [c, v]);
  plan = plan.map(([code, variant]) => {
    if (code === 'SAT') {
      if (deload) return ['TESTLAUF'];
      const marsch = weekTotal % 2 === 1;
      if (phase.key === 'grundlage') return [marsch ? 'MT1' : 'TB2']; // LG C: nur TB1/TB2 (KSK-Handbuch)
      if (phase.key === 'aufbau') return [marsch ? 'MT2' : 'TB3'];
      if (phase.key === 'leistung') return [marsch ? 'MT3' : 'TB4'];
      // Spezifik: einmal pro Block langer Marsch bis 40 km (KSK S. 8: „40 km sollte keine Herausforderung sein“)
      if (cw === 4) return ['MTLANG'];
      return [marsch ? 'EILMARSCH' : 'MT3'];
    }
    // Leistung: Maximalkraft-Wochen 1 und 4 des 6-Wochen-Blocks (KSK S. 16: K1/K2/K4)
    if (code === 'KX') return [cw === 1 || cw === 4 ? 'K4' : 'K2', variant];
    return [code, variant];
  });
  // Wochen-Update: in einer „runter“-Woche harte Einheiten abschwächen (WOCHEN_REGELN.abschwaechen)
  if (adj?.stufe === 'runter' && !deload) plan = plan.map(([code, variant]) => [WOCHEN_REGELN.abschwaechen[code] || code, variant]);
  // Regenerationswoche: Montag Kraft-Test (Klimmzüge, Liegestütze, Sit-ups), Mittwoch 100 m Brust, Samstag 3000 m
  if (deload && wd === 0) plan = [['TESTKRAFT']];
  if (deload && wd === 2) plan = [['TESTSCHWIMMEN']];
  // Sonntag nach einem Marsch am Samstag: kein langer Lauf obendrauf
  const marschSa = !deload && (phase.key === 'nachav' || (phase.key === 'spezifik' && cw === 4) || (['grundlage', 'aufbau', 'leistung', 'spezifik'].includes(phase.key) && weekTotal % 2 === 1));
  const sessions = plan.map(([code, variant]) => {
    const kurz = variant === 'kurz';
    const nachMarsch = wd === 6 && code === 'TB1' && marschSa;
    return { ...buildSession(code, { ...ctx0, variant: kurz ? undefined : variant, kurz, nachMarsch }), variant: kurz ? undefined : variant };
  });
  // Berufsschulwoche: etwas mehr Energie am Abend → 10 min Mobility am Sonntag
  if (mode === 'schule' && wd === 6 && !deload) sessions.push(buildSession('MOB', ctx0));
  return { date, phase, weekInPhase, weekTotal, cycleWeek: cw, deload, mode, sessions, ctx: ctx0, notes: [] };
}

// ---------- Anpassung nach dem Leistungstest (alle 6 Wochen) ----------
export function adaptAfterTest(state, test) {
  const NORMS = getNorms(state.profile);
  const tests = sortByDate(state.tests).filter((t) => t.id !== test.id && t.date <= test.date);
  const prev = tests.length ? last(tests) : { ...state.profile.start, date: null };
  const notes = []; let better = 0, worse = 0;
  for (const [k, n] of Object.entries(NORMS)) {
    const v = test[k]; if (v == null) continue;
    const pv = prev[k];
    if (pv != null) {
      const imp = n.lower ? pv - v : v - pv;
      const rel = imp / Math.max(1, Math.abs(pv));
      if (rel > 0.01) better++; else if (rel < -0.02) worse++;
    }
  }
  let vol = state.plan.volFactor || 1;
  if (worse > better) { vol = Math.max(0.8, vol * 0.9); notes.push('Leistung gesunken: Umfang 10 % runter. Schlaf und Erholung prüfen.'); }
  else if (better >= 2) { vol = Math.min(1.4, vol * 1.05); notes.push('Fortschritt: Umfang +5 %.'); }
  else { vol = Math.min(1.4, vol * 1.02); notes.push('Stagnation: gleicher Plan mit leicht höherer Intensität (KSK-Regel).'); }
  const s7 = score7D(test);
  notes.push('Schwerpunkte stellt die Schwächen-Analyse automatisch ein (Plan → „Warum so?“).');
  return { volFactor: Math.round(vol * 100) / 100, focus: [], group: s7.group, lastAdapt: test.date, notes };
}

// Fortschritt Richtung Top-Wert 0..1 (1 = Top erreicht). n = Eintrag aus getNorms()
export function normProgress(n, value) {
  if (value == null || !n) return null;
  const startV = n.lower ? n.min * 1.15 : n.min * 0.6;
  const p = n.lower ? (startV - value) / (startV - n.top) : (value - startV) / (n.top - startV);
  return clamp(p, 0, 1);
}
