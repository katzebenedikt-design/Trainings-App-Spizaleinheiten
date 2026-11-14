// Garmin-Rohdaten (Antworten der Garmin-Connect-Abfragen) → App-Format. Reine Logik, läuft in Node und im Browser.
// Eingang raw = { readiness, status, hrv, sleep, stats, vo2, intensity, activities, sets } – jedes Feld optional,
// einzeln oder als Liste. Ausgang = { daily: [...], weeks: { 'JJJJ-Www': {...} }, activities: [...] }.
import { isoWeekKey } from './util.js';

export const HRV_STATUS = { BALANCED: 'ausgeglichen', UNBALANCED: 'unausgeglichen', LOW: 'niedrig', POOR: 'schwach' };
export const STATUS_DE = {
  PEAKING: 'spitzenform', PRODUCTIVE: 'produktiv', MAINTAINING: 'erhaltend', RECOVERY: 'erholung', UNPRODUCTIVE: 'unproduktiv',
  DETRAINING: 'abbau', OVERREACHING: 'ueberfordert', STRAINED: 'ueberlastet', NO_STATUS: 'kein_status', PAUSED: 'pausiert',
};
export const STATUS_LABEL = { spitzenform: 'Spitzenform', produktiv: 'Produktiv', erhaltend: 'Erhaltend', erholung: 'Erholung', unproduktiv: 'Unproduktiv', abbau: 'Leistungsabbau', ueberfordert: 'Überfordert', ueberlastet: 'Überlastet', kein_status: 'Kein Status', pausiert: 'Pausiert' };
export const HRV_LABEL = { ausgeglichen: 'Ausgeglichen', unausgeglichen: 'Unausgeglichen', niedrig: 'Niedrig', schwach: 'Schwach' };
const TYPE_DE = { running: 'Laufen', trail_running: 'Trailrun', treadmill_running: 'Laufband', strength_training: 'Krafttraining', walking: 'Gehen', hiking: 'Wandern', cycling: 'Radfahren', indoor_cycling: 'Indoor-Rad', lap_swimming: 'Schwimmen (Bahn)', open_water_swimming: 'Freiwasser', swimming: 'Schwimmen', boxing: 'Boxen', kickboxing: 'Kickboxen', mixed_martial_arts: 'Kampfsport', martial_arts: 'Kampfsport', hiit: 'HIIT', cardio: 'Cardio', yoga: 'Yoga', other: 'Sonstiges' };
export const typeLabel = (t) => TYPE_DE[t] || (t ? t.replace(/_/g, ' ') : 'Aktivität');
export const sportOf = (t = '') => (/swim/.test(t) ? 'schwimmen' : /run/.test(t) ? 'lauf' : /walk|hik|ruck/.test(t) ? 'gehen' : /cycl|bik/.test(t) ? 'rad' : /strength/.test(t) ? 'kraft' : /box|martial|kick/.test(t) ? 'kampf' : /hiit|cardio|row|elliptic|stair/.test(t) ? 'cardio' : 'sonstiges');

const list = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const r1 = (v) => (v == null ? null : Math.round(v * 10) / 10);
const r2 = (v) => (v == null ? null : Math.round(v * 100) / 100);
const statusKey = (fb) => { const k = Object.keys(STATUS_DE).find((s) => String(fb || '').toUpperCase().startsWith(s)); return k ? STATUS_DE[k] : null; };

export function mapGarmin(raw = {}) {
  const days = {};
  const day = (d) => days[d] || (days[d] = { date: d });

  // Schlaf (Bereich oder einzelne Nacht mit date)
  for (const s of list(raw.sleep).flatMap((x) => x?.nights || [x])) {
    if (!s?.date || !s.sleep_seconds) continue;
    Object.assign(day(s.date), {
      sleepH: r2(s.sleep_seconds / 3600), sleepScore: s.sleep_score ?? undefined,
      sleepDeep: r2((s.deep_sleep_seconds || 0) / 3600), sleepLight: r2((s.light_sleep_seconds || 0) / 3600), sleepRem: r2((s.rem_sleep_seconds || 0) / 3600), sleepAwake: r2((s.awake_seconds || 0) / 3600),
      restHR: s.resting_heart_rate_bpm ?? undefined, hrv: s.avg_overnight_hrv ? Math.round(s.avg_overnight_hrv) : undefined,
    });
  }
  // HRV (Verlauf oder einzelner Tag)
  for (const h of list(raw.hrv).flatMap((x) => x?.trend || [x])) {
    if (!h?.date) continue;
    Object.assign(day(h.date), { hrv: h.last_night_avg_hrv_ms ?? day(h.date).hrv, hrv7: h.weekly_avg_hrv_ms ?? undefined, hrvStatus: HRV_STATUS[h.status] || undefined });
  }
  // Morgendliche Trainingsbereitschaft = Morgenbericht
  for (const t of list(raw.readiness)) {
    if (!t?.date || t.score == null) continue;
    Object.assign(day(t.date), { readiness: t.score, readinessLevel: t.level, recoveryH: r1(t.recovery_time_hours), acuteLoad: t.acute_load ?? undefined, report: true, reportTime: t.timestamp || undefined, sleepScore: day(t.date).sleepScore ?? t.sleep_score ?? undefined, hrv7: day(t.date).hrv7 ?? t.hrv_weekly_avg ?? undefined });
  }
  // Trainingszustand, Belastung, VO2max
  for (const s of list(raw.status)) {
    if (!s?.date) continue;
    Object.assign(day(s.date), { trainingStatus: statusKey(s.training_status_feedback) || undefined, acuteLoad: s.acute_load ?? undefined, chronicLoad: s.chronic_load ?? undefined, loadRatio: s.load_ratio ?? undefined, vo2max: s.vo2_max_precise ?? s.vo2_max ?? undefined });
  }
  // VO2max-Verlauf: nur Tage mit echter Neuberechnung
  for (const v of list(raw.vo2).flatMap((x) => x?.trend || [])) if (v?.date && v.vo2_max && !v.carried_forward) day(v.date).vo2max = v.vo2_max;
  // Tageswerte: Body Battery (Höchstwert nach dem Aufwachen), Ruhepuls, Intensitätsminuten
  for (const s of list(raw.stats)) {
    if (!s?.date) continue;
    Object.assign(day(s.date), { bodyBattery: s.body_battery_highest ?? undefined, restHR: day(s.date).restHR ?? s.resting_heart_rate_bpm ?? undefined, steps: s.total_steps ?? undefined, stress: s.avg_stress_level ?? undefined, stressMax: s.max_stress_level ?? undefined, bbLow: s.body_battery_lowest ?? undefined, bbCharged: s.body_battery_charged ?? undefined, bbDrained: s.body_battery_drained ?? undefined, kcalActive: s.active_calories ?? undefined, kcal: s.total_calories ?? undefined, distDayM: s.distance_meters ?? undefined, floors: s.floors_ascended != null ? Math.round(s.floors_ascended) : undefined, intensMin: s.moderate_intensity_minutes != null ? s.moderate_intensity_minutes + 2 * (s.vigorous_intensity_minutes || 0) : undefined });
  }
  // Rückwärtskompatibel: „load“ = akute Belastung (wird von Schonmodus und alten Diagrammen gelesen)
  for (const d of Object.values(days)) { if (d.acuteLoad != null) d.load = d.acuteLoad; for (const k of Object.keys(d)) if (d[k] === undefined) delete d[k]; }

  const weeks = {};
  for (const w of list(raw.intensity).flatMap((x) => x?.weekly_data || [])) {
    if (!w?.week_start) continue;
    weeks[isoWeekKey(w.week_start)] = { start: w.week_start, moderate: w.moderate_minutes || 0, vigorous: w.vigorous_minutes || 0, total: w.total_minutes ?? (w.moderate_minutes || 0) + 2 * (w.vigorous_minutes || 0), goal: w.weekly_goal || 150 };
  }

  // Kraft-Sätze (get_activity_exercise_sets) je Aktivität
  const setsBy = new Map();
  for (const x of list(raw.sets)) if (x?.activityId != null) setsBy.set(String(x.activityId), mapSets(x.exerciseSets));

  const activities = list(raw.activities).flatMap((x) => x?.activities || [x]).filter((a) => a?.id && a.start_time).map((a) => ({
    garminId: String(a.id), date: a.start_time.slice(0, 10), time: a.start_time.slice(11, 16), type: a.type, typeLabel: typeLabel(a.type), sport: sportOf(a.type), name: String(a.name || '').replace(/\u200b/g, ''),
    durSec: Math.round(a.duration_seconds || 0), distM: a.distance_meters ? Math.round(a.distance_meters) : null, avgHR: a.avg_hr_bpm ? Math.round(a.avg_hr_bpm) : null, maxHR: a.max_hr_bpm ? Math.round(a.max_hr_bpm) : null,
    ...(setsBy.has(String(a.id)) ? { sets: setsBy.get(String(a.id)) } : {}),
  }));

  return { daily: Object.values(days).sort((a, b) => (a.date < b.date ? -1 : 1)), weeks, activities };
}

// Neue Daten in bestehende einmischen (gleiches Datum: Felder ergänzen/überschreiben). Begrenzung: 400 Tage, 400 Aktivitäten.
export function mergePayload(base = {}, add = {}) {
  const byDate = new Map((base.daily || []).map((d) => [d.date, { ...d }]));
  for (const d of add.daily || []) byDate.set(d.date, { ...(byDate.get(d.date) || {}), ...d });
  const acts = new Map((base.activities || []).map((a) => [a.garminId, a]));
  for (const a of add.activities || []) acts.set(a.garminId, a);
  const daily = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-400);
  const activities = [...acts.values()].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)).slice(0, 400);
  return { v: 1, created: add.created || base.created || new Date().toISOString(), daily, weeks: { ...(base.weeks || {}), ...(add.weeks || {}) }, activities };
}

// Garmin-Sätze → [{ cat, name, reps, kg, sec, rest }]. Übung = wahrscheinlichste Kategorie außer UNKNOWN.
// Unsichere Sätze (UNKNOWN vorn) erben die Übung des vorigen Satzes, wenn sie kurz danach kamen.
export function mapSets(sets = []) {
  const out = [];
  let prev = null, prevEnd = 0;
  const arr = list(sets);
  arr.forEach((x, i) => {
    if (x?.setType !== 'ACTIVE') return;
    const t = Date.parse(x.startTime) || 0;
    const reps = x.repetitionCount || 0;
    const ex = (x.exercises || []).filter((e) => e.category && e.category !== 'UNKNOWN').sort((a, b) => (b.probability || 0) - (a.probability || 0))[0];
    const unk = (x.exercises || []).find((e) => e.category === 'UNKNOWN')?.probability || 0;
    let cat = ex && (ex.probability || 0) >= Math.min(50, unk) ? ex.category : null, name = cat ? ex.name || null : null;
    if (!cat && prev && t && t - prevEnd < 5 * 60e3) { cat = prev.cat; name = prev.name; }
    const sec = Math.round(x.duration || 0);
    if (!cat || (!reps && !/PLANK/.test(cat))) return;
    const next = arr[i + 1];
    const rest = next?.setType === 'REST' ? Math.round(next.duration || 0) : null;
    const s = { cat, name, reps, kg: x.weight ? Math.round(x.weight / 100) / 10 : 0, sec, rest };
    out.push(s); prev = s; prevEnd = t + sec * 1000;
  });
  return out;
}
