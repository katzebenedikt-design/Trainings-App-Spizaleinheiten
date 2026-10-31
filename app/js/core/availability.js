// Wochen-Verfügbarkeit: was steht diese Woche zur Verfügung? Übungen werden durch passende
// Alternativen ersetzt und Einheiten auf die verfügbare Zeit gekürzt.
import { isoWeekKey, weekday } from './util.js';

export const AVAIL_DEFAULT = { gym: true, pool: true, track: true, ruck: true, bar: true, bwOnly: false, montage: false, minutes: [null, null, null, null, null, null, null] };

export const AVAIL_FIELDS = [
  ['gym', 'Fitnessstudio'], ['pool', 'Schwimmbad'], ['track', 'Laufstrecke/Bahn'], ['ruck', 'Rucksack/Gewichte'],
  ['bar', 'Klimmzugstange'], ['bwOnly', 'Nur Körpergewicht'], ['montage', 'Montage / wenig Zeit'],
];

export function availFor(state, date) {
  const w = state.week.avail?.[isoWeekKey(date)];
  return { ...AVAIL_DEFAULT, ...(state.week.availDefault || {}), ...(w || {}) };
}

// Ersatz pro Übung: erst mit Rucksack, dann nur Körpergewicht
const ALT = {
  kniebeuge: ['rucksack_kniebeuge', 'bulgarian'], ausfallschritt: ['ausfallschritt', 'bulgarian'], kreuzheben: ['rucksack_kreuzheben', 'glute_bridge'],
  bankdruecken: ['liegestuetz_erhoeht', 'liegestuetz_erhoeht'], butterfly: ['liegestuetz', 'liegestuetz'], latzug: ['klimmzug', 'tischrudern'],
  rudern: ['rucksack_rudern', 'tischrudern'], schulterdruecken: ['pike', 'pike'], bizeps: ['rucksack_curl', 'tischrudern'],
  trizeps: ['diamant', 'diamant'], wadendruecken: ['wadendruecken', 'wadendruecken'], hyperextension: ['hyperextension', 'hyperextension'],
  dips: ['dips', 'diamant'], farmers: ['farmers', 'plank'],
};
const NEEDS_GYM = new Set(['kniebeuge', 'kreuzheben', 'bankdruecken', 'butterfly', 'latzug', 'rudern', 'schulterdruecken', 'bizeps', 'trizeps', 'ausfallschritt', 'wadendruecken', 'farmers']);

export function substituteExercise(id, a) {
  const gym = a.gym && !a.bwOnly;
  if (id === 'klimmzug' && !a.bar && !gym) return 'tischrudern';
  if (gym || !NEEDS_GYM.has(id)) return id;
  const alt = ALT[id]; if (!alt) return id;
  const useRuck = a.ruck && !a.bwOnly;
  const r = useRuck ? alt[0] : alt[1];
  return r === 'klimmzug' && !a.bar ? 'tischrudern' : r;
}

// Wendet Verfügbarkeit auf die Einheiten eines Tages an. build(code) erzeugt Ersatz-Einheiten.
export function applyAvailability(date, sessions, a, build) {
  const notes = [];
  const gym = a.gym && !a.bwOnly;
  let out = sessions.map((s) => {
    if (s.fixed || s.rest) return s;
    if (s.swim && !a.pool) { const light = s.light; notes.push(`${s.title} → kein Schwimmbad, ersetzt durch ${light ? 'lockeren Lauf + Mobility' : 'Tempolauf'}`); return { ...build(light ? 'TBR' : 'TB2'), sub: `Ersatz für Schwimmen · ${light ? 'locker' : 'Tempolauf'}`, replaced: s.title }; }
    if (s.ruck && !a.ruck) { notes.push(`${s.title} → kein Rucksack, ersetzt durch langen Lauf/Wanderung`); return { ...build('TB1'), title: 'Langer Lauf / zügige Wanderung', replaced: s.title }; }
    if ((s.code === 'K4' || s.code === 'ZIRKEL') && !gym) { notes.push(`${s.title} → kein Studio, Kraftausdauer mit ${a.ruck && !a.bwOnly ? 'Rucksack' : 'Körpergewicht'}`); s = { ...build('K1', 'beine'), replaced: s.title }; }
    if (s.run && !a.track && /Intervall|400|1000/.test(s.title + s.sub)) {
      s = { ...s, blocks: [...s.blocks, { kind: 'main', title: 'Keine Bahn', lines: ['Intervalle nach Zeit statt Strecke: 400 m ≈ 90–100 s, 1000 m ≈ 4 min. Flaches Stück suchen.'] }] };
    }
    if (s.blocks.some((b) => b.ex)) {
      let changed = 0;
      const blocks = s.blocks.map((b) => (b.ex ? { ...b, ex: b.ex.map((e) => { const n = substituteExercise(e.id, a); if (n !== e.id) changed++; return n === e.id ? e : { ...e, id: n, orig: e.id }; }) } : b));
      if (changed) { notes.push(`${s.title}: ${changed} Übung(en) ersetzt (${gym ? '' : 'kein Studio'}${!a.bar ? ', keine Stange' : ''})`.replace('(, ', '(')); s = { ...s, blocks, title: gym ? s.title : s.title + ' (ohne Studio)' }; }
    }
    return s;
  });
  // Zeit: Montage begrenzt auf 45 min, sonst eingetragene Minuten
  const wd = weekday(date);
  const cap = a.minutes?.[wd] != null && a.minutes[wd] !== '' ? Number(a.minutes[wd]) : a.montage ? 45 : null;
  if (cap != null) {
    const total = () => out.reduce((t, s) => t + (s.min || 0), 0);
    // 1. Zusatz-Einheiten weglassen (nie feste Termine)
    while (total() > cap && out.filter((s) => !s.fixed && !s.rest).length > 1) {
      const idx = out.map((s, i) => [s, i]).reverse().find(([s]) => !s.fixed && !s.rest)?.[1];
      notes.push(`${out[idx].title} gestrichen (nur ${cap} min Zeit)`);
      out.splice(idx, 1);
    }
    // 2. Haupteinheit kürzen
    const fixedMin = out.filter((s) => s.fixed).reduce((t, s) => t + s.min, 0);
    out = out.map((s) => {
      if (s.fixed || s.rest || !s.min) return s;
      const room = Math.max(0, cap - fixedMin);
      if (s.min <= room) return s;
      if (room < 15) { notes.push(`${s.title} entfällt (keine Zeit neben festem Termin)`); return null; }
      const f = room / s.min;
      notes.push(`${s.title} auf ${room} min gekürzt`);
      return { ...s, min: room, sub: s.sub + ` · gekürzt auf ${room} min`,
        blocks: s.blocks.filter((b) => b.kind !== 'cool' || f > 0.8).map((b) => (b.ex ? { ...b, ex: b.ex.slice(0, Math.max(2, Math.round(b.ex.length * f))).map((e) => ({ ...e, sets: Math.max(2, Math.round(e.sets * Math.max(f, 0.6))) })) } : b)) };
    }).filter(Boolean);
    if (!out.length) out.push(build('MOB'));
  }
  return { sessions: out, notes };
}
