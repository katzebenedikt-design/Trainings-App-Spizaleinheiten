// Psychologengespräch: Fragenauswahl, Selbstbewertung, Übungsfragebogen, Tagebuch-Leitfragen.
import { THEMEN, FRAGEBOGEN, MOTIVATION, TAGEBUCH, TAGEBUCH_WOCHE, CHECK } from '../data/psych.js';
import { weekday, daysBetween } from './util.js';

// Zufällige Fragen aus den gewählten Themen; zuletzt geübte Fragen kommen später dran
export function pickQuestions(topics, n, answers = [], r = Math.random) {
  const keys = (topics?.length ? topics : Object.keys(THEMEN)).filter((k) => THEMEN[k]);
  const last = new Map(); answers.forEach((a, i) => last.set(a.q, i));
  const pool = keys.flatMap((k) => THEMEN[k].fragen.map((q) => ({ topic: k, q, seen: last.has(q) ? last.get(q) : -1, rnd: r() })));
  pool.sort((a, b) => a.seen - b.seen || a.rnd - b.rnd);
  // Themen mischen: nicht zwei Fragen desselben Themas hintereinander, wenn vermeidbar
  const out = [];
  while (out.length < n && pool.length) {
    const prev = out[out.length - 1]?.topic;
    const i = pool.findIndex((x) => x.topic !== prev);
    out.push(pool.splice(i >= 0 ? i : 0, 1)[0]);
  }
  return out.map(({ topic, q }) => ({ topic, q }));
}

// 0–100 % aus der Checkliste (0 nein, 1 teils, 2 ja)
export const checkPct = (check = {}) => Math.round((CHECK.reduce((a, c) => a + (check[c.id] ?? 0), 0) / (CHECK.length * 2)) * 100);

// Schwächstes Kriterium über die letzten Antworten
export function weakestCriterion(answers) {
  const last = answers.filter((a) => a.check).slice(-10);
  if (!last.length) return null;
  const avg = CHECK.map((c) => ({ ...c, v: last.reduce((s, a) => s + (a.check[c.id] ?? 0), 0) / last.length }));
  return avg.sort((a, b) => a.v - b.v)[0];
}

// Übungsfragebogen: Reihenfolge mischen, Paare auseinanderziehen
export function fragebogenItems(r = Math.random) {
  const items = [];
  FRAGEBOGEN.paare.forEach(([a, b, rev], i) => { items.push({ id: `p${i}a`, t: a }); items.push({ id: `p${i}b`, t: b, rev }); });
  FRAGEBOGEN.kontrolle.forEach((t, i) => items.push({ id: `k${i}`, t, kontrolle: true }));
  const pairKey = (it) => (it.id[0] === 'p' ? it.id.slice(0, -1) : it.id);
  // Mischen, bis kein Paarpartner direkt auf den anderen folgt
  for (let tries = 0; tries < 100; tries++) {
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    if (items.every((it, i) => i === 0 || pairKey(it) !== pairKey(items[i - 1]))) break;
  }
  return items;
}

// Antworten 1–5. Paar stimmig, wenn die (ggf. umgedrehte) Antwort höchstens 1 Stufe abweicht.
export function fragebogenAuswerten(ans) {
  const paare = FRAGEBOGEN.paare.map(([a, b, rev], i) => {
    const x = ans[`p${i}a`], y = ans[`p${i}b`];
    if (x == null || y == null) return null;
    const y2 = rev ? 6 - y : y;
    const diff = Math.abs(x - y2);
    return { a, b, x, y, rev, diff, ok: diff <= 1, unklar: diff === 2 };
  }).filter(Boolean);
  const kontrolle = FRAGEBOGEN.kontrolle.map((t, i) => ({ t, v: ans[`k${i}`] })).filter((k) => k.v != null);
  const geschoent = kontrolle.filter((k) => k.v >= 4);
  return { paare, stimmig: paare.filter((p) => p.ok).length, widerspruch: paare.filter((p) => !p.ok && !p.unklar), unklar: paare.filter((p) => p.unklar), kontrolle, geschoent };
}

// Motivationsschreiben: Entwurf nur aus den eigenen Antworten (keine KI, keine Vorlage)
export function buildLetter(letter) {
  return MOTIVATION.map((m) => (letter[m.id] || '').trim()).filter(Boolean).join('\n\n');
}

// Zwei Leitfragen pro Tag (fest je Datum), sonntags zusätzlich der Wochenrückblick
export function dailyPrompts(date) {
  const n = daysBetween('2026-01-01', date);
  const i = ((n % TAGEBUCH.length) + TAGEBUCH.length) % TAGEBUCH.length;
  const out = [TAGEBUCH[i], TAGEBUCH[(i + 5) % TAGEBUCH.length]];
  if (weekday(date) === 6) out.push(TAGEBUCH_WOCHE);
  return out;
}
