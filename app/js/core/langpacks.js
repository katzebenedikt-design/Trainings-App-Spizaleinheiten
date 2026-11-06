// Sprachpakete (Konfiguration in app/sprachen/*.json oder per Datei importiert), GER-Stufen,
// Lernstunden-Richtwerte, Einstufungstest und Stufentests.
import { iso, addDays, daysBetween } from './util.js';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Begleitete Lernstunden bis zum Abschluss der Stufe (kumuliert, Richtwerte von Cambridge English
// für Englisch: A2 ca. 180–200 h, B1 350–400 h, B2 500–600 h, C1 700–800 h, C2 1000–1200 h).
export const GLH = { A1: 100, A2: 200, B1: 400, B2: 600, C1: 800, C2: 1100 };
// FSI-Kategorien (Foreign Service Institute): Kat. I ca. 600–750 Unterrichtsstunden bis zur
// Berufssprache, Kat. III ca. 1100, Kat. IV ca. 2200. Faktor relativ zu Kategorie I.
export const FSI_FACTOR = { 1: 1, 2: 1.3, 3: 1.6, 4: 3.1 };
export const FSI_TEXT = { 1: 'FSI-Kategorie I (nah verwandt, schnell)', 2: 'FSI-Kategorie II', 3: 'FSI-Kategorie III (schwer)', 4: 'FSI-Kategorie IV (sehr schwer)' };

// ---------- Laden & Prüfen ----------
const BUILTIN = {};
export async function loadPacks(fetcher = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p + ': ' + r.status); return r.json(); }), base = './sprachen/') {
  const idx = await fetcher(base + 'index.json');
  for (const code of idx.pakete || []) {
    try { const p = await fetcher(`${base}${code}.json`); const err = validatePack(p); if (err.length) console.warn(code, err); else BUILTIN[p.code] = p; } catch (e) { console.warn('Sprachpaket', code, e); }
  }
  return BUILTIN;
}
export const builtinPacks = () => BUILTIN;
export function allPacks(st) { return { ...BUILTIN, ...(st.lang.custom || {}) }; }
export function packFor(st, code = st.lang.active) { const all = allPacks(st); return all[code] || all.en || Object.values(all)[0] || null; }

const isChunk = (c) => Array.isArray(c) && c.length >= 2 && c.every((x) => typeof x === 'string' && x.trim());
export function validatePack(p) {
  const e = [];
  if (!p || typeof p !== 'object') return ['Keine gültige Datei.'];
  if (!/^[a-z]{2,3}(-[a-z0-9]+)?$/i.test(p.code || '')) e.push('„code“ fehlt oder ist ungültig (z. B. „it“).');
  if (!p.name) e.push('„name“ fehlt.');
  if (!p.tts) e.push('„tts“ fehlt (z. B. „it-IT“).');
  if (p.fsi && !FSI_FACTOR[p.fsi]) e.push('„fsi“ muss 1, 2, 3 oder 4 sein.');
  if (!p.stufen || typeof p.stufen !== 'object') { e.push('„stufen“ fehlt.'); return e; }
  const ids = new Set();
  for (const [lv, s] of Object.entries(p.stufen)) {
    if (!LEVELS.includes(lv)) { e.push(`Unbekannte Stufe „${lv}“ (erlaubt: ${LEVELS.join(', ')}).`); continue; }
    for (const u of s.einheiten || []) {
      if (!u.id || !u.titel) e.push(`${lv}: Einheit ohne „id“ oder „titel“.`);
      if (ids.has(u.id)) e.push(`${lv}: Einheit „${u.id}“ doppelt.`); ids.add(u.id);
      if (!Array.isArray(u.lektionen) || !u.lektionen.length) e.push(`${lv}/${u.id}: „lektionen“ fehlt.`);
      else u.lektionen.forEach((l, i) => { if (!Array.isArray(l) || !l.length || !l.every(isChunk)) e.push(`${lv}/${u.id}: Lektion ${i + 1} braucht Paare ["Fremdsprache", "Deutsch"].`); });
    }
    for (const t of s.test || []) {
      if (!t.frage || !Array.isArray(t.optionen) || t.optionen.length < 2 || !(t.loesung >= 0 && t.loesung < t.optionen.length)) e.push(`${lv}: Testfrage unvollständig („${t.frage || '?'}“).`);
      if (t.typ === 'hoeren' && !t.text) e.push(`${lv}: Hörfrage ohne „text“.`);
    }
    for (const sh of s.shadowing || []) if (!sh.id || !Array.isArray(sh.saetze) || !sh.saetze.every(isChunk)) e.push(`${lv}: Shadowing-Text „${sh.titel || '?'}“ unvollständig.`);
    for (const q of s.quellen || []) if (!q.titel || !/^https:\/\//.test(q.url || '')) e.push(`${lv}: Quelle braucht „titel“ und „url“ (https).`);
  }
  for (const d of p.decks || []) if (!d.id || !Array.isArray(d.karten) || !d.karten.every(isChunk)) e.push(`Kartendeck „${d.titel || '?'}“ unvollständig.`);
  return e;
}

// ---------- Lernstand je Sprache ----------
export function langState(st, code) {
  const L = st.lang.langs[code] || (st.lang.langs[code] = {});
  const def = { start: iso(), lessons: {}, xp: 0, dialogs: {}, perfectDialogs: 0, level: null, minAtLevel: 0, placement: null, tests: {}, min: null, log: [], own: [], today: null, shadow: {} };
  for (const [k, v] of Object.entries(def)) if (L[k] === undefined) L[k] = v;
  // Bestand: Lernzeit aus abgeschlossenen Lektionen schätzen (je ca. 8 Minuten)
  if (L.min == null) L.min = Object.keys(L.lessons).length * 8;
  return L;
}

export const levelIdx = (lv) => (lv ? LEVELS.indexOf(lv) : -1);
export const nextLevel = (lv) => LEVELS[Math.min(LEVELS.length - 1, levelIdx(lv) + 1)];
export const workLevel = (L) => (levelIdx(L.level) >= LEVELS.length - 1 ? 'C2' : nextLevel(L.level));
export const packLevels = (p) => LEVELS.filter((lv) => p.stufen[lv]);

export function lessonsOf(p) {
  const out = [];
  for (const lv of LEVELS) for (const u of p.stufen[lv]?.einheiten || []) u.lektionen.forEach((chunks, li) => out.push({ id: `${u.id}-${li}`, level: lv, unit: u, li, chunks, title: `${u.titel} ${li + 1}` }));
  return out;
}

// Nächste offene Lektion ab der aktuellen Arbeitsstufe (erreichte Stufen gelten als erledigt)
export function nextLessonOf(p, L) {
  const done = levelIdx(L.level);
  return lessonsOf(p).find((x) => levelIdx(x.level) > done && !L.lessons[x.id]) || null;
}

export function logStudy(L, min, kind, date = iso()) {
  const m = Math.max(0, Math.round(min * 10) / 10);
  if (!m) return 0;
  L.min = (L.min || 0) + m;
  const last = L.log[L.log.length - 1];
  if (last && last.date === date) { last.min = Math.round((last.min + m) * 10) / 10; last.kinds = [...new Set([...(last.kinds || []), kind])]; } else L.log.push({ date, min: m, kinds: [kind] });
  if (L.log.length > 400) L.log.splice(0, L.log.length - 400);
  return m;
}

// Ø Minuten pro Tag der letzten 14 Tage
export function pace(L, today = iso()) {
  const from = addDays(today, -13);
  const sum = L.log.filter((x) => x.date >= from && x.date <= today).reduce((a, b) => a + b.min, 0);
  const days = Math.min(14, Math.max(1, daysBetween(L.start || today, today) + 1));
  return sum / days;
}

// Ehrlicher Richtwert: Stunden bis zur nächsten Stufe und bis zum Ziel
export function hoursEstimate(p, L, today = iso()) {
  const f = FSI_FACTOR[p.fsi || 1] || 1;
  const reached = L.level;
  const target = reached === 'C2' ? null : nextLevel(reached);
  const baseH = reached ? GLH[reached] * f : 0;
  const since = Math.max(0, ((L.min || 0) - (L.minAtLevel || 0)) / 60);
  const pos = baseH + since;
  const rest = (lv) => Math.max(0, GLH[lv] * f - pos);
  const minDay = pace(L, today);
  const days = (h) => (minDay > 0.5 ? Math.ceil((h * 60) / minDay) : null);
  const goal = p.ziel || 'B2';
  return {
    reached, target, studiedH: Math.round((L.min || 0) / 6) / 10, factor: f,
    toNext: target ? rest(target) : 0, range: target ? [Math.round(rest(target) * 0.8), Math.round(rest(target) * 1.25)] : [0, 0],
    toGoal: levelIdx(goal) > levelIdx(reached) ? rest(goal) : 0, goal, minDay: Math.round(minDay), daysNext: target ? days(rest(target)) : null, daysGoal: days(rest(goal)),
  };
}

// ---------- Tests ----------
export const testItems = (p, lv) => p.stufen[lv]?.test || [];

// Einstufung: je Stufe bis zu 4 Fragen, mind. 3 richtig → bestanden → nächste Stufe.
// Start bei A2 (falls vorhanden). Fällt A2 durch, wird A1 geprüft.
export function placementPlan(p) { return LEVELS.filter((lv) => testItems(p, lv).length); }
export function placementStep(p, history) {
  // history: [{level, correct, total}] in Reihenfolge; liefert {next} oder {done, level}
  const lvls = placementPlan(p);
  if (!lvls.length) return { done: true, level: null };
  if (!history.length) return { next: lvls.includes('A2') ? 'A2' : lvls[0] };
  const passed = (h) => h.correct >= Math.ceil(h.total * 0.75);
  const last = history[history.length - 1];
  const tried = new Set(history.map((h) => h.level));
  const best = history.filter(passed).map((h) => h.level).sort((a, b) => levelIdx(b) - levelIdx(a))[0] || null;
  if (passed(last)) {
    if (history.some((x) => !passed(x) && levelIdx(x.level) > levelIdx(last.level))) return { done: true, level: best };
    const nxt = lvls.find((lv) => levelIdx(lv) > levelIdx(last.level) && !tried.has(lv));
    return nxt ? { next: nxt } : { done: true, level: best };
  }
  const lower = [...lvls].reverse().find((lv) => levelIdx(lv) < levelIdx(last.level) && !tried.has(lv));
  if (lower && !best) return { next: lower };
  return { done: true, level: best };
}

export const PASS = 0.8;
export function applyLevel(L, lv, kind, date = iso()) {
  if (levelIdx(lv) > levelIdx(L.level)) { L.level = lv; L.minAtLevel = L.min || 0; L.levelDate = date; L.levelBy = kind; return true; }
  return false;
}
