// CAT-Test: Aufgaben-Generatoren (Übungsaufgaben) mit Schwierigkeit 1–10 und Lösungsweg,
// adaptive Schwierigkeit, Auswertung. Reine Logik ohne Oberfläche (testbar).
import { CAT_MODULES, CAT_PROFILES, RECHTSCHREIBUNG, DASDASS, SYNONYME, ANALOGIEN, TECHNIK, WISSEN, MEMO } from '../data/cat.js';

export const MAXL = 10;
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pickR = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuf = (r, arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const de = (n) => (Math.round(n * 100) / 100).toString().replace('.', ',');
const tier = (lv) => (lv <= 3 ? 1 : lv <= 6 ? 2 : 3);
// Banken: Aufgaben bis zur Stufe des Levels, bevorzugt die passende Stufe
const fromBank = (r, bank, lv) => { const t = tier(lv); const exact = bank.filter((x) => x[0] === t); const ok = bank.filter((x) => x[0] <= t); return pickR(r, exact.length && r() < 0.7 ? exact : ok); };

// Multiple Choice: Optionen mischen, Lösungsindex merken
function mc(r, q, right, wrong, explain, extra = {}) {
  const opts = shuf(r, [right, ...wrong.slice(0, 3)]);
  return { kind: 'mc', q, options: opts.map((o) => (typeof o === 'object' ? o : { t: String(o) })), answer: opts.indexOf(right), explain, ...extra };
}
// Bis zu 3 eindeutige falsche Antworten (nie gleich der richtigen)
const uniq3 = (right, cands) => [...new Set(cands.map(String))].filter((c) => c !== String(right)).slice(0, 3);
// Zahlen-Distraktoren: nah an der Lösung, eindeutig, nie gleich
function numWrong(r, ans, spread = 0) {
  const s = new Set(); const step = spread || Math.max(1, Math.round(Math.abs(ans) * 0.1));
  const cands = [ans + step, ans - step, ans + 2 * step, ans - 2 * step, ans + 10, ans - 10, ans * 2, Math.round(ans / 2), ans + 1, ans - 1];
  for (const c of shuf(r, cands)) { if (c !== ans && Number.isFinite(c) && !s.has(c)) s.add(c); if (s.size === 3) break; }
  return [...s];
}

// ---------- Sprache ----------
const GEN = {
  rechtschreibung(r, lv) { const [, ok, ...bad] = fromBank(r, RECHTSCHREIBUNG, lv); return mc(r, 'Welches Wort ist richtig geschrieben?', ok, bad, `Richtig: „${ok}“.`, { sub: 'Rechtschreibung' }); },
  dasdass(r) {
    const [satz, ok, why] = pickR(r, DASDASS);
    const opts = ok.includes('…') ? ['das … das', 'dass … das', 'das … dass', 'dass … dass'] : ok === 'Das' ? ['Das', 'Dass'] : ['das', 'dass'];
    const o = shuf(r, opts);
    return { kind: 'mc', sub: 'das oder dass', q: `Was gehört in die Lücke?\n${satz}`, options: o.map((t) => ({ t })), answer: o.indexOf(ok), explain: why };
  },
  synonym(r, lv) { const [, w, ok, ...bad] = fromBank(r, SYNONYME, lv); return mc(r, `Was bedeutet „${w}“?`, ok, bad, `„${w}“ bedeutet: ${ok}.`, { sub: 'Wortbedeutung' }); },
  analogie(r, lv) { const [, q, ok, bad, why] = fromBank(r, ANALOGIEN, lv); return mc(r, q, ok, bad, why, { sub: 'Analogie' }); },

  // ---------- Mathe ----------
  kopf(r, lv) {
    let a, b, op, ans;
    if (lv <= 2) { a = ri(r, 12, 89); b = ri(r, 11, 59); op = r() < 0.5 ? '+' : '−'; if (op === '−' && b > a) [a, b] = [b, a]; ans = op === '+' ? a + b : a - b; }
    else if (lv <= 5) { if (r() < 0.5) { a = ri(r, 12, 49); b = ri(r, 3, 9); op = '·'; ans = a * b; } else { b = ri(r, 3, 12); ans = ri(r, 6, 25); a = ans * b; op = ':'; } }
    else if (lv <= 8) { a = ri(r, 12, 39); b = ri(r, 11, 29); op = '·'; ans = a * b; }
    else { a = ri(r, 251, 499); b = ri(r, 101, 249); const c = ri(r, 3, 9); ans = (a - b) * c; return mc(r, `(${a} − ${b}) · ${c} = ?`, ans, numWrong(r, ans, c), `Erst die Klammer: ${a} − ${b} = ${a - b}. Dann · ${c} = ${ans}.`, { sub: 'Kopfrechnen' }); }
    const how = op === '·' ? `Zerlegen: ${a} · ${b} = ${Math.floor(a / 10) * 10} · ${b} + ${a % 10} · ${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b} = ${ans}.` : op === ':' ? `${b} · ${ans} = ${a}, also ${a} : ${b} = ${ans}.` : `${a} ${op} ${b} = ${ans}. Tipp: erst Zehner, dann Einer.`;
    return mc(r, `${a} ${op} ${b} = ?`, ans, numWrong(r, ans, op === '·' ? b : 0), how, { sub: 'Kopfrechnen' });
  },
  prozent(r, lv) {
    const ps = lv <= 4 ? [10, 20, 25, 50] : lv <= 7 ? [5, 15, 30, 40, 75] : [12.5, 35, 45, 65, 120];
    const p = pickR(r, ps); const base = pickR(r, [40, 80, 120, 160, 200, 240, 360, 480, 640, 800]);
    const ans = (base * p) / 100;
    return mc(r, `Wie viel sind ${de(p)} % von ${base}?`, de(ans), numWrong(r, ans, Math.max(1, ans * 0.2)).map(de), `${de(p)} % = ${de(p)}/100. ${base} · ${de(p)} : 100 = ${de(ans)}.`, { sub: 'Prozent' });
  },
  dreisatz(r, lv) {
    if (lv <= 5 || r() < 0.5) {
      const kg = ri(r, 2, 6), preis = kg * ri(r, 2, 9), ziel = ri(r, 7, 15); const ans = (preis / kg) * ziel;
      return mc(r, `${kg} kg kosten ${preis} €. Was kosten ${ziel} kg?`, `${de(ans)} €`, numWrong(r, ans, preis / kg).map((x) => `${de(x)} €`), `Erst auf 1 kg: ${preis} : ${kg} = ${de(preis / kg)} €. Dann · ${ziel} = ${de(ans)} €.`, { sub: 'Dreisatz' });
    }
    const n1 = pickR(r, [2, 3, 4, 6]), tage = pickR(r, [6, 8, 12, 24]), n2 = pickR(r, [1, 2, 3, 4, 6, 8, 12].filter((x) => x !== n1 && (n1 * tage) % x === 0));
    const ans = (n1 * tage) / n2;
    return mc(r, `${n1} Soldaten brauchen ${tage} Stunden, um einen Graben auszuheben. Wie lange brauchen ${n2} Soldaten (gleiches Tempo)?`, `${ans} h`, uniq3(`${ans} h`, [(tage * n2) / n1, ...numWrong(r, ans, 2), ans + 3, ans + 5].filter((x) => x > 0).map((x) => `${de(x)} h`)), `Umgekehrt proportional: Gesamtarbeit ${n1} · ${tage} = ${n1 * tage} Soldatenstunden. ${n1 * tage} : ${n2} = ${ans} h.`, { sub: 'Dreisatz' });
  },
  tempo(r, lv) {
    const v = pickR(r, lv <= 6 ? [30, 60, 90, 120] : [40, 45, 75, 80]);
    const t = pickR(r, [10, 15, 20, 30, 40, 45, 50, 60, 90].filter((m) => (v * m) % 60 === 0));
    const d = (v * t) / 60;
    return mc(r, `Ein Fahrzeug fährt konstant ${v} km/h. Wie viele Minuten braucht es für ${d} km?`, `${t} min`, numWrong(r, t, 5).filter((x) => x > 0).map((x) => `${x} min`), `Zeit = Strecke : Geschwindigkeit = ${d} : ${v} h = ${de(d / v)} h = ${t} min.`, { sub: 'Geschwindigkeit' });
  },
  gleichung(r, lv) {
    const a = ri(r, 2, lv >= 8 ? 12 : 6), x = ri(r, 2, 15), b = ri(r, 1, 30); const c = a * x + b;
    return mc(r, `${a}x + ${b} = ${c}. Wie groß ist x?`, x, numWrong(r, x, 1), `${a}x = ${c} − ${b} = ${c - b}. x = ${c - b} : ${a} = ${x}.`, { sub: 'Gleichung' });
  },

  // ---------- Logik ----------
  zahlenreihe(r, lv) {
    const t = tier(lv) + (lv >= 9 ? 1 : 0); let seq, rule, next;
    const kinds = t === 1 ? ['add', 'mul'] : t === 2 ? ['grow', 'alt', 'mul'] : t === 3 ? ['interleave', 'muladd', 'grow2'] : ['fib', 'square', 'muladd'];
    const k = pickR(r, kinds);
    if (k === 'add') { const s = ri(r, 1, 30), d = ri(r, 2, 9) * (r() < 0.25 ? -1 : 1); seq = Array.from({ length: 6 }, (_, i) => s + i * d); next = s + 6 * d; rule = `Jeweils ${d > 0 ? '+' : '−'}${Math.abs(d)}.`; }
    else if (k === 'mul') { const s = ri(r, 1, 4), f = ri(r, 2, 3); seq = Array.from({ length: 6 }, (_, i) => s * f ** i); next = s * f ** 6; rule = `Jeweils · ${f}.`; }
    else if (k === 'grow') { const s = ri(r, 1, 10), d0 = ri(r, 1, 3); seq = [s]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + d0 + i - 1); next = seq[5] + d0 + 5; rule = `Die Abstände wachsen um 1: +${d0}, +${d0 + 1}, +${d0 + 2} …`; }
    else if (k === 'alt') { const s = ri(r, 10, 30), a = ri(r, 3, 9), b = ri(r, 1, a - 1); seq = [s]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? a : -b)); next = seq[5] + a; rule = `Abwechselnd +${a} und −${b}.`; }
    else if (k === 'interleave') { const a0 = ri(r, 1, 9), da = ri(r, 2, 5), b0 = ri(r, 20, 40), db = ri(r, 2, 6); seq = [a0, b0, a0 + da, b0 - db, a0 + 2 * da, b0 - 2 * db]; next = a0 + 3 * da; rule = `Zwei Reihen ineinander: ${a0}, ${a0 + da}, ${a0 + 2 * da} (+${da}) und ${b0}, ${b0 - db}, ${b0 - 2 * db} (−${db}).`; }
    else if (k === 'muladd') { const f = ri(r, 2, 3), d = ri(r, 1, 4) * (r() < 0.5 ? -1 : 1), s = ri(r, 1, 5); seq = [s]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * f + d); next = seq[5] * f + d; rule = `Jeweils · ${f}, dann ${d > 0 ? '+' : '−'}${Math.abs(d)}.`; }
    else if (k === 'grow2') { const s = ri(r, 1, 5); seq = [s]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + i * i); next = seq[5] + 36; rule = 'Es kommen die Quadratzahlen dazu: +1, +4, +9, +16, +25, +36.'; }
    else if (k === 'fib') { const a = ri(r, 1, 5), b = ri(r, 2, 7); seq = [a, b]; for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]); next = seq[4] + seq[5]; rule = 'Jede Zahl ist die Summe der beiden vorherigen.'; }
    else { const s = ri(r, 1, 6); seq = Array.from({ length: 6 }, (_, i) => (s + i) ** 2); next = (s + 6) ** 2; rule = `Quadratzahlen: ${s}², ${s + 1}², … also ${s + 6}² = ${next}.`; }
    return mc(r, `Wie geht die Reihe weiter?\n${seq.join('   ')}   ?`, next, numWrong(r, next, Math.max(1, Math.abs(next - seq[5]) >> 1)), rule, { sub: 'Zahlenreihe' });
  },
  matrix(r, lv) {
    const SH = shuf(r, ['kreis', 'quadrat', 'dreieck']), FI = shuf(r, ['leer', 'voll', 'halb']);
    const t = tier(lv);
    const cell = (row, col) => ({
      shape: t >= 2 ? SH[(row + col) % 3] : SH[row],
      count: col + 1,
      fill: t >= 3 ? FI[(row + 2 * col) % 3] : FI[row],
    });
    const ans = cell(2, 2);
    const alt = (k) => { const c = { ...ans }; if (k === 'count') c.count = ans.count === 3 ? 2 : 3; if (k === 'shape') c.shape = SH.find((s) => s !== ans.shape); if (k === 'fill') c.fill = FI.find((f) => f !== ans.fill); return c; };
    const wrong = [alt('count'), alt('shape'), alt('fill')];
    const key = (c) => `${c.shape}${c.count}${c.fill}`;
    const opts = shuf(r, [ans, ...wrong]);
    const grid = []; for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) grid.push(row === 2 && col === 2 ? null : cell(row, col));
    const rules = ['In jeder Zeile steigt die Anzahl von links nach rechts (1, 2, 3).', t >= 2 ? 'Jede Form kommt in jeder Zeile und Spalte genau einmal vor.' : 'Jede Zeile hat ihre eigene Form.', t >= 3 ? 'Auch die Füllung wechselt so, dass jede Füllung pro Zeile einmal vorkommt.' : 'Die Füllung bleibt innerhalb einer Zeile gleich.'];
    return { kind: 'mc', sub: 'Matrix', q: 'Welches Feld ergänzt die Matrix?', matrix: grid, options: opts.map((c) => ({ fig: c })), answer: opts.findIndex((c) => key(c) === key(ans)), explain: rules.join(' ') };
  },
  figurenreihe(r, lv) {
    const t = tier(lv); const s0 = ri(r, 0, 7) * 45;
    const steps = t === 1 ? [45, 45, 45, 45, 45] : t === 2 ? [90, 45, 90, 45, 90] : [45, 90, 135, 180, 225];
    const step = t === 1 ? pickR(r, [45, 90]) : 0;
    const seq = [s0]; for (let i = 0; i < 4; i++) seq.push((seq[i] + (t === 1 ? step : steps[i])) % 360);
    const ans = (seq[4] + (t === 1 ? step : steps[4])) % 360;
    const wrong = shuf(r, [0, 45, 90, 135, 180, 225, 270, 315].filter((a) => a !== ans)).slice(0, 3);
    const opts = shuf(r, [ans, ...wrong]);
    const rule = t === 1 ? `Der Pfeil dreht sich jedes Mal um ${step}° im Uhrzeigersinn.` : t === 2 ? 'Abwechselnd 90° und 45° im Uhrzeigersinn.' : 'Die Drehung wächst jedes Mal um 45°: 45°, 90°, 135°, 180°, dann 225°.';
    return { kind: 'mc', sub: 'Figurenreihe', q: 'Welcher Pfeil kommt als Nächstes?', arrows: seq, options: opts.map((a) => ({ arrow: a })), answer: opts.indexOf(ans), explain: rule };
  },

  // ---------- Raum ----------
  drehen(r, lv) {
    const n = lv <= 3 ? 5 : lv <= 6 ? 6 : 7;
    let shape;
    for (let k = 0; k < 200; k++) { shape = polyomino(r, n); if (isChiral(shape) && new Set([0, 1, 2, 3].map((q) => keyOf(rotN(shape, q)))).size === 4) break; }
    const rot = pickR(r, lv <= 3 ? [1, 3] : [1, 2, 3]);
    const ans = norm(rotN(shape, rot));
    const mir = mirror(shape);
    const wrong = shuf(r, [0, 1, 2, 3]).slice(0, 3).map((k) => norm(rotN(mir, k)));
    const opts = shuf(r, [ans, ...wrong]);
    return { kind: 'mc', sub: 'Figur drehen', q: 'Welche Figur ist nur gedreht (nicht gespiegelt)?', poly: norm(shape), options: opts.map((p) => ({ poly: p })), answer: opts.indexOf(ans), explain: `Die richtige Figur ist um ${rot * 90}° gedreht. Die anderen sind gespiegelt – sie lassen sich durch Drehen nicht zur Deckung bringen.` };
  },
  netz(r) {
    const ok = cubeNet(r, true); const bad = []; const seen = new Set();
    for (let k = 0; k < 60 && bad.length < 3; k++) { const b = cubeNet(r, false); if (!seen.has(keyOf(b))) { seen.add(keyOf(b)); bad.push(b); } }
    const opts = shuf(r, [ok, ...bad]);
    return { kind: 'mc', sub: 'Würfelnetz', q: 'Aus welchem Netz lässt sich ein Würfel falten?', options: opts.map((p) => ({ poly: p })), answer: opts.indexOf(ok), explain: 'Ein Würfelnetz braucht 4 Seitenflächen im Ring und genau je eine Fläche oben und unten. Liegen zwei Flächen auf derselben Seite, überlappen sie beim Falten; 5 in einer Reihe oder ein 2×3-Block gehen nie.' };
  },

  // ---------- Technik ----------
  zahnrad(r, lv) {
    const n = Math.min(8, 2 + Math.floor(lv / 2) + ri(r, 0, 1)); const same = n % 2 === 1;
    const opts = ['im Uhrzeigersinn', 'gegen den Uhrzeigersinn'];
    return { kind: 'mc', sub: 'Zahnräder', q: `${n} Zahnräder greifen in einer Reihe ineinander. Rad 1 dreht im Uhrzeigersinn. Wie dreht Rad ${n}?`, gears: n, options: opts.map((t) => ({ t })), answer: same ? 0 : 1, explain: `Jedes Rad dreht entgegengesetzt zum vorherigen. Ungerade Nummern drehen wie Rad 1, gerade umgekehrt. Rad ${n} ist ${same ? 'ungerade' : 'gerade'}.` };
  },
  hebel(r, lv) {
    const a2 = pickR(r, [1, 2, 3, 4, 5]); const f2 = pickR(r, [20, 30, 40, 50, 60, 80, 100]) * (lv >= 6 ? 2 : 1); const a1 = pickR(r, [1, 2, 4, 5, 8, 10].filter((x) => (f2 * a2) % x === 0 && x !== a2)); const f1 = (f2 * a2) / a1;
    return mc(r, `Hebel im Gleichgewicht: Links hängen ${f2} N im Abstand ${a2} m vom Drehpunkt. Welche Kraft braucht man rechts im Abstand ${a1} m?`, `${de(f1)} N`, numWrong(r, f1, Math.max(5, f1 * 0.25)).filter((x) => x > 0).map((x) => `${de(x)} N`), `Hebelgesetz: F1 · a1 = F2 · a2 → F = ${f2} · ${a2} : ${a1} = ${de(f1)} N.`, { sub: 'Hebel' });
  },
  flaschenzug(r, lv) {
    const n = lv <= 4 ? pickR(r, [2, 4]) : pickR(r, [3, 4, 5, 6]); const g = n * pickR(r, [50, 100, 150, 200]); const f = g / n;
    return mc(r, `Ein Flaschenzug hat ${n} tragende Seilstränge. Die Last wiegt ${g} N. Welche Zugkraft ist nötig (ohne Reibung)?`, `${f} N`, uniq3(`${f} N`, [g, g / 2, f * 2, f / 2, g / 4, f + 50].map((x) => `${de(x)} N`)), `Die Last verteilt sich auf ${n} Stränge: ${g} N : ${n} = ${f} N. Dafür muss man ${n}-mal so viel Seil ziehen.`, { sub: 'Flaschenzug' });
  },
  technikwissen(r, lv) { const [, q, ok, a, b, c, why] = fromBank(r, TECHNIK, lv); return mc(r, q, ok, [a, b, c], why, { sub: 'Technikwissen' }); },

  // ---------- Allgemeinwissen ----------
  wissen(r, lv) { const [, q, ok, ...bad] = fromBank(r, WISSEN, lv); return mc(r, q, ok, bad, `Richtig: ${ok}.`, { sub: 'Allgemeinwissen' }); },

  // ---------- Merken ----------
  memo(r, lv) {
    const k = Math.min(7, 3 + Math.floor(lv / 2));
    const namen = shuf(r, MEMO.namen).slice(0, k), orte = shuf(r, MEMO.orte).slice(0, k), berufe = shuf(r, MEMO.berufe).slice(0, k);
    const recs = namen.map((n, i) => ({ name: n, ort: orte[i], beruf: berufe[i], zahl: ri(r, 10, lv >= 6 ? 999 : 99) }));
    const qs = shuf(r, recs).slice(0, 4).map((rec, i) => {
      const what = ['ort', 'beruf', 'zahl', 'ort'][i];
      const right = String(rec[what]); const pool = recs.filter((x) => x !== rec).map((x) => String(x[what]));
      const wrong = shuf(r, pool).slice(0, 3);
      while (wrong.length < 3) wrong.push(what === 'zahl' ? String(ri(r, 10, 99)) : pickR(r, what === 'ort' ? MEMO.orte : MEMO.berufe));
      const label = { ort: 'Wohnort', beruf: 'Beruf', zahl: 'Kennzahl' }[what];
      return mc(r, `${label} von ${rec.name}?`, right, [...new Set(wrong)].filter((w) => w !== right), `${rec.name}: ${rec.ort}, ${rec.beruf}, ${rec.zahl}.`);
    });
    return { kind: 'memo', sub: 'Datensätze merken', q: 'Präg dir die Datensätze ein.', recs, show: 20 + k * 6, qs, explain: 'Tipp: Bilder verknüpfen (Becker backt in Kiel …) und Zahlen in Gruppen sprechen.' };
  },

  // ---------- Konzentration (Durchstreichtest wie d2) ----------
  d2(r, lv) {
    const n = Math.min(64, 36 + lv * 3); const sec = Math.max(25, 50 - lv * 2);
    const items = Array.from({ length: n }, () => { const letter = r() < 0.55 ? 'd' : 'p'; const up = ri(r, 0, 2), down = ri(r, 0, 2); return { letter, up, down }; });
    for (let i = 0; i < Math.round(n / 4); i++) { const k = ri(r, 0, n - 1); items[k] = { letter: 'd', up: [0, 1, 2][i % 3], down: 2 - [0, 1, 2][i % 3] }; }
    items.forEach((it) => { it.target = it.letter === 'd' && it.up + it.down === 2; });
    return { kind: 'd2', sub: 'Durchstreichtest', q: 'Tippe jedes „d“ mit genau zwei Strichen an (oben und unten zusammen).', items, sec, explain: 'Gesucht: d mit genau 2 Strichen. Nicht: p, d mit 1, 3 oder 4 Strichen. Zeile für Zeile, gleichmäßiges Tempo.' };
  },
};

// ---------- Raum-Helfer ----------
function polyomino(r, n) {
  const cells = [[0, 0]]; const has = (x, y) => cells.some(([a, b]) => a === x && b === y);
  while (cells.length < n) { const [x, y] = pickR(r, cells); const [dx, dy] = pickR(r, [[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy)) cells.push([x + dx, y + dy]); }
  return norm(cells);
}
export function norm(cells) { const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); }
const rot1 = (cells) => norm(cells.map(([x, y]) => [-y, x]));
export const rotN = (cells, k) => { let c = cells; for (let i = 0; i < k; i++) c = rot1(c); return norm(c); };
export const mirror = (cells) => norm(cells.map(([x, y]) => [-x, y]));
export const keyOf = (cells) => norm(cells).map((c) => c.join(',')).join(';');
export function isChiral(cells) { const rots = [0, 1, 2, 3].map((k) => keyOf(rotN(cells, k))); return ![0, 1, 2, 3].some((k) => rots.includes(keyOf(rotN(mirror(cells), k)))); }
// Würfelnetze: gültig = 1-4-1 (Ring aus 4, je eine Fläche oben/unten). Ungültig: beide auf einer Seite, 5 in einer Reihe, 2×3-Block
export function cubeNet(r, valid) {
  const ring = [[0, 1], [1, 1], [2, 1], [3, 1]];
  if (valid) return norm([...ring, [ri(r, 0, 3), 0], [ri(r, 0, 3), 2]]);
  const k = ri(r, 0, 2);
  if (k === 0) { const a = ri(r, 0, 2); return norm([...ring, [a, 0], [a + 1, 0]]); }
  if (k === 1) return norm([[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [ri(r, 0, 4), r() < 0.5 ? 0 : 2]]);
  return norm([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]);
}

// ---------- Erzeugen, Adaptivität, Auswertung ----------
export function makeItem(mod, level, r = Math.random, weights = null) {
  const typen = CAT_MODULES[mod].typen;
  const lv = Math.max(1, Math.min(MAXL, level));
  // Manche Typen erst ab höheren Stufen
  const min = { prozent: 3, dreisatz: 3, tempo: 5, gleichung: 6, netz: 3, hebel: 2, flaschenzug: 3 };
  const avail = typen.filter((t) => (min[t] || 1) <= lv);
  let typ;
  if (weights) { const pool = avail.flatMap((t) => Array(weights[t] || 0).fill(t)); typ = pool.length ? pickR(r, pool) : pickR(r, avail); } else typ = pickR(r, avail);
  return { ...GEN[typ](r, lv), mod, typ, level: lv };
}

// Simulation: richtig → schwerer, falsch → leichter (wie bei computergestützten adaptiven Tests)
export const adaptStep = (level, correct) => Math.max(1, Math.min(MAXL, level + (correct ? 1 : -1)));
// Training: gleitend über die letzten 5 Antworten
export function adaptTraining(level, recent) {
  if (recent.length < 4) return level;
  const acc = recent.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recent.length);
  return acc >= 0.8 ? Math.min(MAXL, level + 1) : acc <= 0.4 ? Math.max(1, level - 1) : level;
}

// Modulwert 0–100: Treffer (70 %) und erreichte Schwierigkeit (30 %)
export function moduleScore(results) {
  if (!results.length) return { score: 0, correct: 0, total: 0, level: 0 };
  const correct = results.reduce((a, x) => a + x.score, 0);
  const acc = correct / results.length;
  const lvl = results.reduce((a, x) => a + x.level, 0) / results.length;
  return { score: Math.round(acc * 70 + (lvl / MAXL) * 30), correct: Math.round(correct * 10) / 10, total: results.length, level: Math.round(lvl * 10) / 10 };
}

export function evaluate(mods) {
  const ids = Object.keys(mods);
  const total = ids.length ? Math.round(ids.reduce((a, id) => a + mods[id].score, 0) / ids.length) : 0;
  const sorted = [...ids].sort((a, b) => mods[b].score - mods[a].score);
  return { total, staerken: sorted.slice(0, 2), schwaechen: sorted.slice(-2).reverse(), sorted };
}

export const profileOf = (key) => CAT_PROFILES[key] || CAT_PROFILES.bw;

// Seed-fähiger Zufall (für Tests)
export function seeded(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
