// Garmin-Werte → Check-in. Gemessenes (Schlaf, Energie, Ruhepuls; Schritte, Stress, Body Battery …) kommt von der Uhr,
// Gefühltes (Muskelkater, Schmerzen, Stimmung, Belastung) bleibt beim Nutzer – das misst keine Uhr.

const stufe = (v, grenzen) => (v == null ? null : grenzen.findIndex((g) => v >= g) === -1 ? 1 : 5 - grenzen.findIndex((g) => v >= g));

// Schlafscore 85+ → 5, 72+ → 4, 58+ → 3, 45+ → 2, darunter 1. Ohne Score: Schlafdauer.
export function schlafStufe(g) {
  if (!g) return null;
  if (g.sleepScore != null) return stufe(g.sleepScore, [85, 72, 58, 45]);
  if (g.sleepH != null) return stufe(g.sleepH, [8, 7, 6, 5]);
  return null;
}

// Body Battery nach dem Aufwachen 80+ → 5, 60+ → 4, 40+ → 3, 25+ → 2, darunter 1. Sonst Trainingsbereitschaft.
export function energieStufe(g) {
  if (!g) return null;
  if (g.bodyBattery != null) return stufe(g.bodyBattery, [80, 60, 40, 25]);
  if (g.readiness != null) return stufe(g.readiness, [75, 55, 35, 20]);
  return null;
}

// Vorschlag für den Früh-Check-in eines Tages aus den Garmin-Tageswerten
export function fruehVorschlag(st, date) {
  const g = (st.daily || []).find((d) => d.date === date);
  if (!g) return null;
  const v = { schlaf: schlafStufe(g), energie: energieStufe(g), ruhepuls: g.restHR ?? null };
  const felder = Object.keys(v).filter((k) => v[k] != null);
  if (!felder.length) return null;
  const quelle = {
    schlaf: g.sleepScore != null ? `Schlafscore ${g.sleepScore}${g.sleepH != null ? `, ${String(g.sleepH).replace('.', ',')} h` : ''}` : g.sleepH != null ? `${String(g.sleepH).replace('.', ',')} h Schlaf` : null,
    energie: g.bodyBattery != null ? `Body Battery ${g.bodyBattery}` : g.readiness != null ? `Bereitschaft ${g.readiness}` : null,
    ruhepuls: g.restHR != null ? `${g.restHR} bpm` : null,
  };
  return { werte: v, felder, quelle };
}

// Garmin-Teil des Abend-Check-ins: Werte des ganzen Tages (vollständig spätestens mit dem Update am nächsten Morgen)
export function abendGarmin(st, date) {
  const g = (st.daily || []).find((d) => d.date === date) || {};
  const acts = (st.activities || []).filter((a) => a.date === date);
  const w = {
    steps: g.steps, stress: g.stress, stressMax: g.stressMax, bbLow: g.bbLow, bbHigh: g.bodyBattery, bbCharged: g.bbCharged, bbDrained: g.bbDrained,
    kcalActive: g.kcalActive, kcal: g.kcal, distKm: g.distDayM != null ? Math.round(g.distDayM / 100) / 10 : undefined, floors: g.floors, intensMin: g.intensMin,
    trainMin: acts.length ? Math.round(acts.reduce((a, x) => a + (x.durSec || 0), 0) / 60) : undefined, trainings: acts.map((a) => a.typeLabel || 'Aktivität'),
  };
  for (const k of Object.keys(w)) if (w[k] == null || (Array.isArray(w[k]) && !w[k].length)) delete w[k];
  return w;
}

// Gefühlte Belastung (1–5) gegen gemessene Werte: kurzer, ehrlicher Hinweis, keine Diagnose
export function abendHinweis(eintrag, w) {
  const h = [];
  if (w.bbLow != null && w.bbLow <= 15) h.push('Body Battery ist sehr tief gefallen: früh schlafen gehen, morgen eher leicht.');
  if (w.stress != null && w.stress >= 45) h.push('Hoher Stress über den Tag: 5 Minuten Box-Atmung vor dem Schlafen.');
  if (eintrag?.belastung >= 4 && (w.trainMin || 0) < 20) h.push('Der Tag war anstrengend, auch ohne viel Training (Arbeit zählt mit). Morgen auf Schlaf achten.');
  if (eintrag?.muede >= 4) h.push('Sehr müde: 7–9 Stunden Schlaf einplanen.');
  return h;
}
