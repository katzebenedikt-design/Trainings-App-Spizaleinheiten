// Aufgaben-Generatoren für die Minispiele. Schwierigkeit passt sich an:
// Trefferquote ≥ 85 % → Level hoch, < 70 % → Level runter (Ziel 70–85 %, elite-cognitive-coach).
import { rand, pick, shuffle } from './util.js';

export function nextLevel(level, accuracy) {
  if (accuracy >= 0.85) return Math.min(30, level + 1);
  if (accuracy < 0.7) return Math.max(1, level - 1);
  return level;
}

export function mathTask(level) {
  const L = level;
  const kinds = ['add', 'sub'];
  if (L >= 3) kinds.push('mul');
  if (L >= 6) kinds.push('div', 'mul2');
  if (L >= 9) kinds.push('pct', 'chain');
  if (L >= 12) kinds.push('dreisatz');
  const k = pick(kinds);
  const max = 10 + L * 8;
  switch (k) {
    case 'add': { const a = rand(2, max), b = rand(2, max); return { q: `${a} + ${b}`, a: a + b }; }
    case 'sub': { const a = rand(10, max + 10), b = rand(2, a); return { q: `${a} − ${b}`, a: a - b }; }
    case 'mul': { const a = rand(2, Math.min(12, 3 + L)), b = rand(2, 10); return { q: `${a} × ${b}`, a: a * b }; }
    case 'mul2': { const a = rand(11, 30 + L * 3), b = rand(2, 9); return { q: `${a} × ${b}`, a: a * b }; }
    case 'div': { const b = rand(2, 12), a = b * rand(2, 12); return { q: `${a} ÷ ${b}`, a: a / b }; }
    case 'pct': { const p = pick([10, 20, 25, 50, 75]), base = pick([40, 80, 120, 160, 200, 240, 360, 400]); return { q: `${p} % von ${base}`, a: (p * base) / 100 }; }
    case 'chain': { const a = rand(2, 15), b = rand(2, 15), c = rand(2, 6); return { q: `(${a} + ${b}) × ${c}`, a: (a + b) * c }; }
    case 'dreisatz': { const n = rand(2, 6), per = rand(3, 12), m = rand(2, 9); return { q: `${n} km = ${n * per} min. ${m} km = ? min`, a: m * per }; }
    default: return { q: '1 + 1', a: 2 };
  }
}

const NATO = 'ALFA BRAVO CHARLIE DELTA ECHO FOXTROT GOLF HOTEL INDIA JULIETT KILO LIMA MIKE NOVEMBER OSCAR PAPA QUEBEC ROMEO SIERRA TANGO UNIFORM VICTOR WHISKEY XRAY YANKEE ZULU'.split(' ');
export function memoryTask(level) {
  const len = Math.min(12, 3 + Math.ceil(level / 1.5));
  const useLetters = level >= 5;
  const items = Array.from({ length: len }, () => (useLetters && Math.random() < 0.4 ? pick('ABCDEFGHKLMNPRSTUVWXZ'.split('')) : String(rand(0, 9))));
  return { items, show: items.map((x) => (/[A-Z]/.test(x) ? `${x} · ${NATO['ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(x)]}` : x)), answer: items.join(''), ms: Math.max(600, 1100 - level * 30) };
}

export function reactionConfig(level) {
  return { trials: 12, nogo: level >= 3 ? Math.min(0.4, 0.2 + level * 0.02) : 0, window: Math.max(380, 1000 - level * 40), minWait: 1200, maxWait: 3500 };
}

export function patternTask(level) {
  const gens = [
    () => { const a = rand(1, 20), d = rand(2, 5 + level); return { seq: [0, 1, 2, 3, 4].map((i) => a + d * i), why: `immer +${d}` }; },
    () => { const a = rand(1, 5), r = level > 6 ? pick([2, 3]) : 2; return { seq: [0, 1, 2, 3, 4].map((i) => a * r ** i), why: `immer ×${r}` }; },
  ];
  if (level >= 3) gens.push(() => { const a = rand(1, 10), x = rand(2, 6), y = rand(1, 4); const s = [a]; for (let i = 0; i < 4; i++) s.push(s[i] + (i % 2 ? y : x)); return { seq: s, why: `abwechselnd +${x} und +${y}` }; });
  if (level >= 4) gens.push(() => { const a = rand(1, 10); const s = [a]; for (let i = 1; i < 5; i++) s.push(s[i - 1] + i); return { seq: s, why: 'Abstand wächst: +1, +2, +3, +4' }; });
  if (level >= 6) gens.push(() => { const o = rand(1, 5); return { seq: [0, 1, 2, 3, 4].map((i) => (i + o) ** 2), why: 'Quadratzahlen' }; });
  if (level >= 7) gens.push(() => { const a = rand(1, 5), b = rand(1, 5); const s = [a, b]; for (let i = 2; i < 5; i++) s.push(s[i - 1] + s[i - 2]); return { seq: s, why: 'Summe der beiden vorherigen' }; });
  if (level >= 9) gens.push(() => { const a = rand(2, 9), m = rand(2, 3), d = rand(1, 5); const s = [a]; for (let i = 1; i < 5; i++) s.push(i % 2 ? s[i - 1] * m : s[i - 1] - d); return { seq: s, why: `abwechselnd ×${m} und −${d}` }; });
  if (level >= 11) gens.push(() => { const a = rand(1, 9), b = rand(20, 40); const s = []; for (let i = 0; i < 5; i++) s.push(i % 2 ? b - i : a + i * 3); return { seq: s, why: 'zwei verschränkte Reihen' }; });
  const g = pick(gens)();
  const shown = g.seq.slice(0, 4), ans = g.seq[4];
  const wrong = new Set();
  while (wrong.size < 3) { const w = ans + pick([-1, 1]) * rand(1, Math.max(3, Math.round(Math.abs(ans) * 0.2))); if (w !== ans) wrong.add(w); }
  return { shown, answer: ans, options: shuffle([ans, ...wrong]), why: g.why };
}

export function switchConfig(level) {
  return { items: 20, time: Math.max(900, 2600 - level * 110), switchP: Math.min(0.6, 0.2 + level * 0.03), distract: level >= 5 };
}

// Regeln: FARBE → Sand links, Oliv rechts. FORM → Quadrat links, Kreis rechts.
export function switchItem(prevRule, p) {
  const rule = prevRule && Math.random() > p ? prevRule : pick(['FARBE', 'FORM']);
  const color = pick(['sand', 'oliv']), shape = pick(['quadrat', 'kreis']);
  const correct = rule === 'FARBE' ? (color === 'sand' ? 'L' : 'R') : (shape === 'quadrat' ? 'L' : 'R');
  return { rule, color, shape, correct };
}
