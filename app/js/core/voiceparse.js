// Gesprochene Werte verstehen: "Gewicht 72,5", "Klimmzüge zwölf", "Ruhepuls 54",
// "Lauf 5 Kilometer 28 Minuten", "3000 Meter 13 Minuten 40", "Schwimmen 800 Meter 22 Minuten".
const ONES = { null: 0, ein: 1, eins: 1, eine: 1, einen: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12, dreizehn: 13, vierzehn: 14, fünfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 };
const TENS = { zwanzig: 20, dreißig: 30, dreissig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90 };

export function wordToNum(w) {
  w = w.toLowerCase();
  if (w in ONES) return ONES[w];
  if (w in TENS) return TENS[w];
  if (w === 'hundert' || w === 'einhundert') return 100;
  const m = w.match(/^(ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun)und(zwanzig|dreißig|dreissig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig)$/);
  if (m) return ONES[m[1]] + TENS[m[2]];
  const h = w.match(/^(ein|zwei|drei)?hundert(.+)?$/);
  if (h) { const r = h[2] ? wordToNum(h[2]) : 0; return r == null ? null : (h[1] ? ONES[h[1]] : 1) * 100 + r; }
  return null;
}

export function normalizeSpoken(text) {
  return text.toLowerCase()
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/(\d+) komma (\d+)/g, '$1.$2')
    .split(/\s+/).map((w) => { const n = wordToNum(w.replace(/[.,!?]$/, '')); return n != null ? String(n) : w; }).join(' ')
    .replace(/(\d+) komma (\d+)/g, '$1.$2')
    .replace(/(\d+):(\d+)/g, '$1 minuten $2');
}

const nums = (s) => (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);

export function parseVoice(text) {
  const t = normalizeSpoken(text);
  const has = (re) => re.test(t);
  if (has(/gewicht|wiege|kilo(?!meter)/) && !has(/marsch|gepäck/)) { const n = nums(t)[0]; if (n) return { kind: 'gewicht', kg: n }; }
  if (has(/ruhepuls|puls/)) { const n = nums(t)[0]; if (n) return { kind: 'ruhepuls', bpm: n }; }
  if (has(/klimmz/)) { const n = nums(t)[0]; if (n != null) return { kind: 'wdh', key: 'pullups', value: n }; }
  if (has(/liegest/)) { const n = nums(t)[0]; if (n != null) return { kind: 'wdh', key: 'pushups', value: n }; }
  if (has(/sit ?ups?|situps|bauch/)) { const n = nums(t)[0]; if (n != null) return { kind: 'wdh', key: 'situps', value: n }; }
  const isSwim = has(/schwimm/), isRuck = has(/marsch/), isRun = has(/lauf|gelaufen|joggen|meter|kilometer/);
  if (isSwim || isRuck || isRun) {
    let dist = null;
    const km = t.match(/(\d+(?:\.\d+)?)\s*(kilometer|km)/); const m = t.match(/(\d+(?:\.\d+)?)\s*(meter|m\b)/);
    if (km) dist = Number(km[1]) * 1000; else if (m) dist = Number(m[1]);
    let sec = null;
    const h = t.match(/(\d+)\s*stunden?/); const min = t.match(/(\d+)\s*minuten?(?:\s*(?:und\s*)?(\d+)(?:\s*sekunden?)?)?/);
    if (h || min) sec = (h ? Number(h[1]) * 3600 : 0) + (min ? Number(min[1]) * 60 + (min[2] ? Number(min[2]) : 0) : 0);
    const kg = t.match(/(\d+)\s*(kilo|kg)(?!meter)/);
    if (dist || sec) return { kind: isSwim ? 'schwimmen' : isRuck ? 'marsch' : 'lauf', distM: dist, durSec: sec, kg: kg ? Number(kg[1]) : null };
  }
  return null;
}
