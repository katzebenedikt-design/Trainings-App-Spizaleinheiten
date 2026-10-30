// Krafttracker-Logik: effektive Last, Bestwerte, Vorschlag fürs nächste Training (Doppel-Progression).
import { sortByDate, last } from './util.js';
import { bodyweightOn } from './plan.js';

// Effektive Last eines Satzes in kg
export function effLoad(ex, set, bw) {
  if (ex.typ === 'last') return set.kg || 0;
  if (ex.typ === 'kgplus') return (bw || 0) + (set.kg || 0);
  if (ex.typ === 'kg') return bw || 0;
  return 0;
}

export const e1rm = (kg, reps) => (kg && reps ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0); // Epley

export function sessionStats(state, ex, s) {
  const bw = bodyweightOn(state, s.date);
  let best1rm = 0, maxKg = 0, maxReps = 0, vol = 0, maxSec = 0;
  for (const set of s.sets) {
    const load = effLoad(ex, set, bw);
    if (ex.typ === 'zeit') { maxSec = Math.max(maxSec, set.sec || 0); continue; }
    maxReps = Math.max(maxReps, set.reps || 0);
    maxKg = Math.max(maxKg, ex.typ === 'kg' ? 0 : set.kg || 0);
    vol += load * (set.reps || 0);
    best1rm = Math.max(best1rm, e1rm(load, set.reps));
  }
  return { bw, best1rm, maxKg, maxReps, vol, maxSec };
}

export function history(state, exId) {
  return sortByDate(state.strength.filter((s) => s.exId === exId));
}

export function bests(state, ex) {
  const h = history(state, ex.id);
  const r = { maxKg: null, maxReps: null, best1rm: null, maxVol: null, maxSec: null };
  for (const s of h) {
    const st = sessionStats(state, ex, s);
    const up = (k, v) => { if (v && (r[k] == null || v > r[k].v)) r[k] = { v, date: s.date }; };
    up('maxKg', st.maxKg); up('maxReps', st.maxReps); up('best1rm', st.best1rm); up('maxVol', st.vol); up('maxSec', st.maxSec);
  }
  return r;
}

// Wiederholungsbereich aus Text "20–25" oder "8-12" oder "5"
export function parseRange(txt) {
  const m = String(txt || '').match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2])];
  const n = parseInt(txt, 10);
  return isNaN(n) ? [8, 12] : [n, n];
}

// Doppel-Progression: erst Wiederholungen bis zum oberen Ende, dann Gewicht erhöhen.
export function suggestNext(state, ex, range = null) {
  const h = history(state, ex.id);
  if (!h.length) return { text: 'Erstes Training: Gewicht vorsichtig wählen, Technik zuerst.', sets: null };
  const lastS = last(h);
  const [lo, hi] = range || lastS.range || (ex.typ === 'kg' || ex.typ === 'kgplus' ? [6, 15] : [8, 12]);
  const sets = lastS.sets;
  if (ex.typ === 'zeit') {
    const best = Math.max(...sets.map((s) => s.sec || 0));
    return { text: `Nächstes Mal: ${sets.length}× ${best + 5} s halten.`, sets: sets.map(() => ({ sec: best + 5 })) };
  }
  const allTop = sets.every((s) => (s.reps || 0) >= hi);
  const missed = sets.filter((s) => (s.reps || 0) < lo).length;
  const kg = Math.max(...sets.map((s) => s.kg || 0));
  const step = ex.typ === 'last' ? (['kniebeuge', 'kreuzheben', 'ausfallschritt', 'wadendruecken'].includes(ex.id) ? 5 : 2.5) : 2.5;
  if (ex.typ === 'kg') {
    if (allTop) return { text: `Alle Sätze am oberen Ende. Nächstes Mal: Variante erschweren oder ${sets.length + 1} Sätze.`, sets: [...sets, { reps: lo }].map((s) => ({ reps: s.reps })) };
    return { text: 'Nächstes Mal: pro Satz 1 Wiederholung mehr.', sets: sets.map((s) => ({ reps: (s.reps || 0) + 1 })) };
  }
  if (allTop) return { text: `Ziel erreicht. Nächstes Mal +${step} kg, Wiederholungen wieder bei ${lo}.`, sets: sets.map(() => ({ reps: lo, kg: kg + step })) };
  if (missed >= 2) {
    const nk = Math.max(0, Math.round((kg * 0.95) / 2.5) * 2.5);
    return { text: `Mehrere Sätze unter ${lo} Wdh. Nächstes Mal ${nk} kg und sauber im Bereich bleiben.`, sets: sets.map(() => ({ reps: lo, kg: nk })) };
  }
  return { text: `Gleiches Gewicht (${kg} kg), pro Satz 1 Wiederholung mehr, bis ${hi} Wdh.`, sets: sets.map((s) => ({ reps: Math.min(hi, (s.reps || 0) + 1), kg: s.kg })) };
}
