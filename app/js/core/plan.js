// Trainingsplanung bis zum Auswahlverfahren.
// Grundlagen: KSK-Trainingshandbuch (Leistungsgruppen C/B/A, 7D-Test, TB/K/MT-Bereiche, Erholung 48 h),
// EGB-Report (Periodisierung Adaptiv → Aufbau → Peaking), NSW Physical Training Guide (26-Wochen-Progression,
// Calisthenics-Tabelle, Intervalle), SFAS-Handbuch (Zone 2, Ruck-Aufbau, Erholungswochen, Zirkel).
// Leitregeln (elite-selection-coach): Umfang max. ca. 10 % pro Woche steigern, alle 3–4 Wochen Entlastung,
// mindestens 1 Ruhetag, kein Training durch Schmerz.
import { addDays, daysBetween, mondayOf, weekday, isoWeekKey, clamp, fmtTime, sortByDate, last, iso } from './util.js';

export const NORMS = {
  run3000: { label: '3000-m-Lauf', unit: 'zeit', lower: true, min: 780, goal: 720, top: 645, src: 'KSK-Richtwert < 12:00' },
  pullups: { label: 'Klimmzüge', unit: 'wdh', min: 7, goal: 14, top: 20, src: 'KSK PFV min. 7 · SFAS-Ziel 14' },
  pushups: { label: 'Liegestütze', unit: 'wdh', min: 40, goal: 60, top: 75, src: 'Max. am Stück, immer gleich messen' },
  situps: { label: 'Sit-ups', unit: 'wdh', min: 40, goal: 60, top: 75, src: 'Immer gleich messen' },
  swim100: { label: '100 m Brust', unit: 'zeit', lower: true, min: 150, goal: 120, top: 100, src: 'KSK 7D: 100 m Kleiderschw. < 2:30' },
  ruck7: { label: '7 km Eilmarsch 20 kg', unit: 'zeit', lower: true, min: 3120, goal: 2700, top: 2400, src: 'KSK/EGB: unter 45 min' },
};

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

export function bodyweightOn(state, date) {
  const list = sortByDate(state.bodyweight).filter((w) => w.date <= date);
  return list.length ? last(list).kg : state.bodyweight.length ? sortByDate(state.bodyweight)[0].kg : null;
}

// ---------- Phasen ----------
export const PHASE_INFO = {
  grundlage: { name: 'Grundlage', lg: 'C', desc: 'Fundament: lange ruhige Läufe (Zone 2), Kraftausdauer mit Körpergewicht und an Geräten, Schwimmtechnik, leichte Märsche. Umfang vor Intensität.', ziele: ['3000 m unter 13:00', '15 Klimmzüge', 'Schwimmen 1000 m Brust am Stück', 'Marsch 15 km mit 10 kg'] },
  aufbau: { name: 'Aufbau', lg: 'B', desc: 'Intervall- und Schwellentraining zusätzlich zur Grundlage, Kraftaufbau-Wochen (8–12 Wdh.), Märsche mit 10–15 kg, schwache 7D-Disziplinen gezielt.', ziele: ['3000 m unter 12:15', '18 Klimmzüge', '20 km Marsch 15 kg', 'VO2max über 50'] },
  leistung: { name: 'Leistung', lg: 'A', desc: '3 Trainingsblöcke à 6 Wochen (KSK Leistungsgruppe A): Maximalkraft-Wochen, intensive Intervalle, schwere Märsche 15–20 kg, Kleiderschwimmen.', ziele: ['3000 m unter 11:30', '20 Klimmzüge', '7 km Eilmarsch 20 kg unter 45 min', '200 m Kleiderschwimmen deutlich unter 7:30'] },
  spezifik: { name: 'Spezifik', lg: 'A', desc: 'Wettkampfnah: Eilmarsch, Marschfestigkeit, Zirkel unter Ermüdung, Denken unter Belastung, Testsimulationen.', ziele: ['Alle Disziplinen deutlich über Norm', 'Kopfrechnen nach harter Einheit sicher'] },
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

export function planStart(state) { return (state.created || iso()).slice(0, 10); }

export function phaseAt(state, date) {
  const phases = phasesFor(planStart(state), state.profile.targetDate);
  let ph = phases.find((p) => date >= p.from && date <= p.to);
  if (!ph) ph = date < phases[0].from ? phases[0] : last(phases);
  const weekInPhase = clamp(Math.floor(daysBetween(ph.from, date) / 7) + 1, 1, ph.weeks);
  const weekTotal = Math.floor(daysBetween(phases[0].from, date) / 7) + 1;
  return { phase: ph, phases, weekInPhase, weekTotal: Math.max(1, weekTotal) };
}

// 4-Wochen-Zyklus: 3 Belastungswochen + 1 Entlastungswoche mit Monatstest (Samstag)
export function cycleWeek(weekTotal) { return ((weekTotal - 1) % 4) + 1; }

export function weekMode(state, date) {
  return state.week.overrides[isoWeekKey(date)] || state.week.mode || 'arbeit';
}

// ---------- Sessions ----------
const K1_SETS = {
  beine: ['ausfallschritt', 'kniebeuge', 'bankdruecken', 'klimmzug', 'schulterdruecken', 'hyperextension', 'bizeps', 'trizeps'],
  brust: ['kniebeuge', 'bankdruecken', 'butterfly', 'rudern', 'schulterdruecken', 'hyperextension', 'bizeps', 'trizeps'],
  ruecken: ['ausfallschritt', 'bankdruecken', 'klimmzug', 'rudern', 'schulterdruecken', 'hyperextension', 'bizeps', 'trizeps'],
};
const K2_SETS = {
  oben: ['bankdruecken', 'klimmzug', 'schulterdruecken', 'rudern', 'dips'],
  unten: ['kniebeuge', 'kreuzheben', 'ausfallschritt', 'wadendruecken', 'hyperextension'],
};
const K4_SET = ['kniebeuge', 'kreuzheben', 'bankdruecken', 'klimmzug'];

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
      return { code, title: `Kraftausdauer · GK ${v === 'beine' ? 'Beine' : v === 'brust' ? 'Brust' : 'Rücken'}`, sub: 'K1 · 20–25 Wdh. · Pause 60–90 s', min: Math.round(60 * Math.min(f, 1.2)), gym: true,
        blocks: [warm(), { kind: 'main', title: 'Kraftausdauer (Gerät/Hantel)', ex: strengthEx(K1_SETS[v], 4, '20–25', 75), lines: ['Gewicht so wählen, dass 25 Wdh. gerade sauber gehen.', 'Langsam und kontrolliert ausführen.'] },
          { kind: 'main', title: 'Rumpf', lines: ['Unterarmstütz 3× 45–90 s'] }, cool] };
    }
    case 'K2': {
      const v = ctx.variant || 'oben';
      return { code, title: `Muskelaufbau · ${v === 'oben' ? 'Oberkörper' : 'Unterkörper'}`, sub: 'K2 · 8–12 Wdh. · Pause 90–120 s', min: 60, gym: true,
        blocks: [warm(), { kind: 'main', title: 'Muskelaufbau', ex: strengthEx(K2_SETS[v], 4, '8–12', 105) }, { kind: 'main', title: 'Rumpf', lines: coreRoutine(week) }, cool] };
    }
    case 'K4':
      return { code, title: 'Maximalkraft 5×5', sub: 'K4 · 1–5 Wdh. · Pause 2–4 min', min: 60, gym: true,
        blocks: [warm(12), { kind: 'main', title: 'Langhantel 5×5', ex: strengthEx(K4_SET, 5, '5', 180), lines: ['Nur mit sauberer Technik. Steigernde Sätze möglich.'] }, cool] };
    case 'ZIRKEL':
      return { code, title: 'Zirkel AMRAP', sub: 'SFAS-Zirkel · 2× 12 min', min: 50, gym: true,
        blocks: [warm(), { kind: 'main', title: 'AMRAP A · 12 min', lines: ['10 Rudern', '10 Goblet-Squats', '1-Arm-Tragen 30 s je Seite', 'Isometrischer Split-Squat 30 s je Seite'], timer: 'amrap12' },
          { kind: 'main', title: 'AMRAP B · 12 min', lines: ['10 Schulterdrücken', '10 Burpees', '6 Glute-Bridge-Walkouts', '10 Klimmzüge oder Latzug'], timer: 'amrap12' }, cool] };
    case 'CAL':
      return { code, title: 'Calisthenics', sub: 'Liegestütz · Sit-ups · Klimmzüge', min: 25,
        blocks: [{ kind: 'main', title: 'Sätze nach deinem Maximalwert (NSW-Tabelle)', lines: [`Liegestütze ${cal.push[0]}× ${cal.push[1]}`, `Sit-ups ${cal.push[0]}× ${cal.push[1]}`, `Klimmzüge ${cal.pull[0]}× ${cal.pull[1]}`, 'Pause 1–2 min. Ablassen doppelt so langsam wie hochdrücken.', 'Einmal pro Woche ein Maximal-Satz zur Kontrolle.'] }] };
    case 'TB1': {
      const min = Math.round(clamp((30 + week * 1.5) * f * (sat ? 1.35 : 1), 25, sat ? 110 : 75));
      return { code, title: sat ? 'Langer Dauerlauf' : 'Grundlagenlauf', sub: `TB1 · ${min} min · Zone 2 · Puls 135–150`, min, run: true,
        blocks: [{ kind: 'main', title: 'Dauermethode', lines: [`${min} min gleichmäßig locker`, `Tempo ca. ${fmtTime(p.easy[0])}–${fmtTime(p.easy[1])} /km, entscheidend ist der Puls (135–150)`, 'Du musst durch die Nase atmen oder in ganzen Sätzen reden können.', 'Zone 2 fühlt sich langsam an. Das ist richtig.'] }, { kind: 'cool', title: 'Danach', lines: ['Dehnen, Mobilität 10 min'] }] };
    }
    case 'TB2':
      return { code, title: 'Tempodauerlauf', sub: 'TB2 · mittleres Tempo', min: Math.round(45 * f), run: true,
        blocks: [warm(), { kind: 'main', title: 'Tempo', lines: [`${Math.round(20 * f)}–${Math.round(30 * f)} min bei ca. ${fmtTime(p.tempo)} /km (Zone 3, nur wenige Worte möglich)`] }, cool] };
    case 'TB3': {
      const reps = clamp(Math.round(3 + week / 6), 3, 6);
      return { code, title: 'Schwellen-Intervalle', sub: `TB3 · ${reps}× 1000 m`, min: 55, run: true,
        blocks: [warm(15), { kind: 'main', title: 'Extensive Intervalle', lines: [`${reps}× 1000 m in ca. ${fmtTime(p.schwelle)}`, 'Pause 3 min Trab (wie im PFV: 5×1000 m, 3 min Pause)', 'Puls vor dem nächsten Intervall unter 140'], timer: 'k1000' }, cool] };
    }
    case 'TB4': {
      const reps = clamp(4 + Math.floor(week / 2), 4, 10);
      return { code, title: 'Intensive Intervalle', sub: `TB4 · ${reps}× 400 m`, min: 50, run: true,
        blocks: [warm(15), { kind: 'main', title: 'Intervallmethode', lines: [`${reps}× 400 m in ca. ${fmtTime(p.int400)}`, `Pause aktiv, 2–2,5× so lang wie die Belastung (ca. ${fmtTime(p.int400 * 2.2)})`, 'Gleichmäßig laufen, das letzte Intervall ist das schnellste. Max. 10 Intervalle.'], timer: 'int400' }, cool] };
    }
    case 'TBR':
      return { code, title: 'Regeneration', sub: 'TB-R · locker', min: 30, run: true,
        blocks: [{ kind: 'main', title: 'Aktive Erholung', lines: ['20–30 min sehr lockerer Trab, Rad oder Schwimmen (Puls unter 125)', 'Danach Mobilität: Hüfte, Sprunggelenk, Brustwirbelsäule'] }] };
    case 'ST': {
      const m = Math.round(clamp((600 + week * 60) * f, 400, 2200) / 50) * 50;
      return { code, title: 'Schwimmen Brust', sub: `ST · ca. ${m} m`, min: 45, swim: true,
        blocks: [{ kind: 'main', title: 'Schwimmtraining', lines: ['200 m einschwimmen locker', week < 8 ? 'Technik: 4× 50 m Brust, Gleitphase betonen' : `${clamp(4 + Math.floor(week / 4), 4, 10)}× 100 m Brust zügig, Pause halb so lang`, `Rest als ruhige Strecke bis ca. ${m} m gesamt`, 'Streckentauchen nur mit Aufsicht, nie allein, nie vorher hyperventilieren.'] }] };
    }
    case 'MT1': case 'MT2': case 'MT3': {
      const lvl = Number(code[2]);
      const kg = clamp(Math.round((lvl === 1 ? 5 + week * 0.5 : lvl === 2 ? 10 + week * 0.3 : 15 + week * 0.2) * (deload ? 0.7 : 1)), 5, lvl === 3 ? 20 : lvl === 2 ? 15 : 10);
      const km = clamp(Math.round((lvl === 1 ? 8 + week * 0.4 : lvl === 2 ? 15 + week * 0.2 : 20 + week * 0.15) * (deload ? 0.6 : 1)), 6, lvl === 3 ? 25 : lvl === 2 ? 20 : 15);
      return { code, title: `Marsch ${['', 'leicht', 'mittel', 'schwer'][lvl]}`, sub: `MT${lvl} · ${km} km · ${kg} kg`, min: Math.round((km / 5.5) * 60), ruck: true,
        blocks: [{ kind: 'main', title: 'Marschtraining in Stiefeln', lines: [`${km} km mit ${kg} kg Gepäck, Tempo 4–7 km/h (${lvl === 1 ? 'flach' : 'mittleres Profil'})`, 'Nicht rennen mit Gepäck. Strecke vorher mit Karte planen.', 'Füße vorher und nachher kontrollieren. Socken wechseln.', 'Gute Gelegenheit für Kompass-Übung.'] }] };
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
    case 'REST':
    default:
      return { code: 'REST', title: 'Ruhetag', sub: 'Erholung · Superkompensation', min: 0, rest: true,
        blocks: [{ kind: 'main', title: 'Erholung ist Training', lines: ['Kein Sport. Spazieren erlaubt.', '7–9 Stunden Schlaf.', ctx.sunday ? 'Sonntag: „Mein Warum“ lesen und überarbeiten.' : 'Kurze Box-Atmung am Abend.'] }] };
  }
}

// Wochenvorlagen: Index 0 = Montag. Fitnessstudio nur Mo–Fr. Abends nach der Arbeit (ab ca. 17:00).
const TEMPLATES = {
  grundlage: {
    arbeit: [['K1', 'beine'], ['TB1'], ['K1', 'brust', 'CAL'], ['ST'], ['K1', 'ruecken'], ['SAT'], ['REST']],
    schule: [['K1', 'beine'], ['TB1', null, 'KT'], ['K1', 'brust', 'CAL'], ['ST', null, 'MOB'], ['K1', 'ruecken'], ['SAT'], ['REST']],
  },
  aufbau: {
    arbeit: [['K2', 'oben'], ['TB3'], ['K1', 'beine', 'CAL'], ['ST'], ['K2', 'unten'], ['SAT'], ['REST']],
    schule: [['K2', 'oben'], ['TB3', null, 'KT'], ['K1', 'beine', 'CAL'], ['ST', null, 'MOB'], ['K2', 'unten', 'TB2'], ['SAT'], ['REST']],
  },
  leistung: {
    arbeit: [['KX', 'oben'], ['TB4'], ['K1', 'ruecken', 'CAL'], ['ST'], ['K2', 'unten', 'KT'], ['SAT'], ['REST']],
    schule: [['KX', 'oben'], ['TB4', null, 'CAL'], ['K1', 'ruecken', 'TB1'], ['ST', null, 'MOB'], ['K2', 'unten', 'KT'], ['SAT'], ['REST']],
  },
  spezifik: {
    arbeit: [['ZIRKEL'], ['TB3', null, 'CAL'], ['ST'], ['EILMARSCH'], ['KT', null, 'MOB'], ['SAT'], ['REST']],
    schule: [['ZIRKEL'], ['TB4', null, 'CAL'], ['ST', null, 'KT'], ['EILMARSCH'], ['K1', 'beine', 'MOB'], ['SAT'], ['REST']],
  },
  taper: {
    arbeit: [['CAL'], ['TB2'], ['ST'], ['TBR'], ['MOB'], ['TB1'], ['REST']],
    schule: [['CAL'], ['TB2'], ['ST'], ['TBR'], ['MOB'], ['TB1'], ['REST']],
  },
};

export function plannedDay(state, date) {
  const { phase, weekInPhase, weekTotal } = phaseAt(state, date);
  const cw = cycleWeek(weekTotal);
  const deload = cw === 4 && phase.key !== 'taper';
  const mode = weekMode(state, date);
  const wd = weekday(date);
  const best = currentBest(state);
  const vol = state.plan.volFactor || 1;
  let [code, variant, extra] = TEMPLATES[phase.key][mode][wd];
  const ctx = { best, vol, week: weekTotal, deload, mode, sat: wd === 5, sunday: wd === 6, variant };
  if (code === 'SAT') {
    if (deload) code = 'TEST';
    else if (phase.key === 'grundlage') code = weekTotal % 2 ? 'MT1' : 'TB1';
    else if (phase.key === 'aufbau') code = weekTotal % 2 ? 'MT2' : 'TB1';
    else code = weekTotal % 2 ? 'MT3' : 'TB1';
  }
  if (code === 'KX') code = cw === 1 ? 'K4' : 'K2';
  if (deload && wd === 4) { code = 'TBR'; extra = 'MOB'; } // Freitag vor dem Test locker
  // Fokus aus dem letzten Test: schwächste Disziplin bekommt eine Zusatzaufgabe
  const sessions = [buildSession(code, ctx)];
  if (extra) sessions.push(buildSession(extra, ctx));
  const focus = state.plan.focus || [];
  if (!deload && focus.length && [1, 3].includes(wd)) {
    const add = { pullups: 'Zusatz Klimmzüge: 5× Negativ-Klimmzüge (5 s ablassen)', pushups: 'Zusatz: 3× Liegestütze 30 s', situps: 'Zusatz: 3× Sit-ups 30 s', run3000: 'Zusatz: 6× 20 s Steigerungslauf nach dem Lauf', swim100: 'Zusatz: nächster Schwimmtag 4× 50 m schnell' }[focus[0]];
    if (add) sessions[0].blocks.push({ kind: 'main', title: 'Fokus aus deinem Test', lines: [add] });
  }
  return { date, phase, weekInPhase, weekTotal, cycleWeek: cw, deload, mode, sessions };
}

export function weekPlan(state, anyDate) {
  const mon = mondayOf(anyDate);
  return Array.from({ length: 7 }, (_, i) => plannedDay(state, addDays(mon, i)));
}

// ---------- Anpassung nach dem Monatstest ----------
export function adaptAfterTest(state, test) {
  const tests = sortByDate(state.tests).filter((t) => t.id !== test.id && t.date <= test.date);
  const prev = tests.length ? last(tests) : { ...state.profile.start, date: null };
  const notes = []; let better = 0, worse = 0;
  const gaps = [];
  for (const [k, n] of Object.entries(NORMS)) {
    const v = test[k]; if (v == null) continue;
    const pv = prev[k];
    if (pv != null) {
      const imp = n.lower ? pv - v : v - pv;
      const rel = imp / Math.max(1, Math.abs(pv));
      if (rel > 0.01) better++; else if (rel < -0.02) worse++;
    }
    const range = n.lower ? n.min - n.top : n.top - n.min;
    const pos = n.lower ? (n.min - v) / range : (v - n.min) / range;
    gaps.push([k, pos]);
  }
  gaps.sort((a, b) => a[1] - b[1]);
  const focus = gaps.slice(0, 2).map((g) => g[0]);
  let vol = state.plan.volFactor || 1;
  if (worse > better) { vol = Math.max(0.8, vol * 0.9); notes.push('Leistung gesunken: Umfang 10 % runter. Schlaf und Erholung prüfen.'); }
  else if (better >= 2) { vol = Math.min(1.4, vol * 1.05); notes.push('Fortschritt: Umfang +5 %.'); }
  else { vol = Math.min(1.4, vol * 1.02); notes.push('Stagnation: gleicher Plan mit leicht höherer Intensität (KSK-Regel).'); }
  const s7 = score7D(test);
  if (focus.length) notes.push('Fokus nächster Monat: ' + focus.map((k) => NORMS[k].label).join(', '));
  return { volFactor: Math.round(vol * 100) / 100, focus, group: s7.group, lastAdapt: test.date, notes };
}

// Abstand zur Top-Norm 0..1 (1 = Top erreicht)
export function normProgress(key, value) {
  const n = NORMS[key]; if (value == null || !n) return null;
  const startV = n.lower ? n.min * 1.15 : n.min * 0.6;
  const p = n.lower ? (startV - value) / (startV - n.top) : (value - startV) / (n.top - startV);
  return clamp(p, 0, 1);
}
