// Sprachlogik: Antworten prüfen (ohne KI), Übungen erzeugen, Karteikarten (Leitner).
import { shuffle, pick, addDays, iso } from './util.js';

const NUMW = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 20: 'twenty', 100: 'hundred' };

export function norm(s) {
  return String(s).toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/\b(\d+)\b/g, (m) => (NUMW[m] ? NUMW[m] : m.split('').map((d) => NUMW[d]).join(' ')))
    .replace(/\bniner\b/g, 'nine').replace(/\btree\b/g, 'three').replace(/\bfife\b/g, 'five')
    .replace(/\balpha\b/g, 'alfa').replace(/\bjuliet\b/g, 'juliett').replace(/\bwhisky\b/g, 'whiskey').replace(/\bx-?ray\b/g, 'xray').replace(/\bclicks?\b/g, 'klicks').replace(/\bmetres?\b/g, 'meters')
    .replace(/\bi'm\b/g, 'i am').replace(/\bdon't\b/g, 'do not').replace(/\bit's\b/g, 'it is').replace(/\bhe's\b/g, 'he is').replace(/\bwe're\b/g, 'we are').replace(/\bthat's\b/g, 'that is').replace(/\bi'll\b/g, 'i will').replace(/\bi'd\b/g, 'i would').replace(/\bwhat's\b/g, 'what is').replace(/\bo'clock\b/g, 'oclock').replace(/\bo clock\b/g, 'oclock')
    .replace(/[-]/g, ' ')
    .replace(/[^a-z0-9äöüßàâçéèêëîïôûùüÿñæœąćęłńóśźżа-яё' ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// Ähnlichkeit 0..1 auf Wortebene, kleine Tippfehler in Wörtern werden toleriert
export function similarity(said, target) {
  const A = norm(said).split(' ').filter(Boolean), B = norm(target).split(' ').filter(Boolean);
  if (!A.length || !B.length) return 0;
  const eq = (x, y) => x === y || (y.length > 3 && lev(x, y) <= 1);
  // Wort-Levenshtein mit tolerantem Vergleich
  const m = A.length, n = B.length; let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (eq(A[i - 1], B[j - 1]) ? 0 : 1)); prev = cur; }
  return 1 - prev[n] / Math.max(m, n);
}

// Muster mit * = beliebiger Rest
function matchWild(said, pattern) {
  if (pattern === '*') return norm(said).length > 0 ? 1 : 0;
  if (!pattern.includes('*')) return similarity(said, pattern);
  const pre = pattern.split('*')[0].trim();
  const s = norm(said), p = norm(pre);
  if (!p) return s ? 1 : 0;
  if (s.startsWith(p)) return 1;
  const words = s.split(' ').slice(0, p.split(' ').length).join(' ');
  return similarity(words, p) * 0.95;
}

export function checkAnswer(alternatives, expect) {
  let best = { score: 0, said: alternatives[0] || '', target: expect[0] };
  for (const a of alternatives) for (const e of expect) {
    const sc = matchWild(a, e);
    if (sc > best.score) best = { score: sc, said: a, target: e };
  }
  return { ...best, verdict: best.score >= 0.8 ? 'richtig' : best.score >= 0.55 ? 'fast' : 'falsch' };
}

// ---------- Lektion ----------
export function buildExercises(chunks, pool) {
  const ex = [];
  const objs = chunks.map(([en, de, ...alt]) => ({ en, de, alt }));
  const poolObjs = pool.map(([en, de]) => ({ en, de }));
  for (const c of objs) ex.push({ type: 'learn', c });
  for (const c of shuffle(objs)) {
    ex.push({ type: 'listen', c, options: shuffle([c.de, ...shuffle(poolObjs.filter((p) => p.de !== c.de)).slice(0, 3).map((p) => p.de)]) });
  }
  for (const c of shuffle(objs)) {
    const words = c.en.replace(/[.,!?]/g, '').split(/\s+/);
    if (words.length >= 3 && words.length <= 9 && !/[()…]/.test(c.en)) ex.push({ type: 'build', c, words: shuffle(words) });
    else ex.push({ type: 'translate', c, options: shuffle([c.en, ...shuffle(poolObjs.filter((p) => p.en !== c.en)).slice(0, 3).map((p) => p.en)]) });
  }
  for (const c of shuffle(objs).slice(0, 3)) ex.push({ type: 'speak', c });
  return ex;
}

// Gesamtpool aller Chunks
export const flatChunks = (units) => units.flatMap((u) => u.lessons.flat());

export function levelLabel(done, total) {
  const f = total ? done / total : 0;
  return f < 0.05 ? 'Level 0' : f < 0.4 ? 'A1' : f < 0.75 ? 'A2' : f < 1 ? 'B1 (im Aufbau)' : 'B1';
}

// ---------- Karteikarten (Leitner: 1, 3, 7, 14, 30 Tage) ----------
export const INTERVALS = [0, 1, 3, 7, 14, 30];
export function review(card, known, today = iso()) {
  const box = known ? Math.min(INTERVALS.length - 1, (card?.box || 0) + 1) : 1;
  return { box, due: addDays(today, INTERVALS[box]) };
}
export const isDue = (card, today = iso()) => !card || !card.due || card.due <= today;
export { pick };
