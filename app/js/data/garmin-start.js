// Garmin-Startwerte (Stand 12.11.2026, vom Nutzer angegeben). Werden einmalig übernommen und als
// Vergleichsbasis im Garmin-Bereich und im Wochen-Update gezeigt. Echte Tageswerte aus Garmin haben Vorrang.
export const GARMIN_START = {
  stand: '2026-11-12',
  werte: { vo2max: 46.1, hrv7: 52, hrvStatus: 'niedrig', readiness: 22, trainingStatus: 'ueberlastet', acuteLoad: 341, chronicLoad: 312, restHR: 52, sleepAvgH: 8.1, sleepScoreAvg: 71 },
  // Frühere Werte für den Verlauf
  frueher: [
    { date: '2026-08-15', vo2max: 49.0, note: 'Mitte August' },
    { date: '2026-10-15', hrv7: 68, note: 'Mitte Oktober' },
  ],
};

export function applyGarminStart(st) {
  if (st.settings.garminStartDone) return false;
  const w = GARMIN_START.werte;
  const rows = [
    ...GARMIN_START.frueher.map(({ note, ...r }) => ({ ...r, source: 'startwert' })),
    { date: GARMIN_START.stand, vo2max: w.vo2max, hrv7: w.hrv7, hrvStatus: w.hrvStatus, readiness: w.readiness, trainingStatus: w.trainingStatus, acuteLoad: w.acuteLoad, load: w.acuteLoad, chronicLoad: w.chronicLoad, restHR: w.restHR, source: 'startwert' },
  ];
  for (const r of rows) {
    const i = st.daily.findIndex((d) => d.date === r.date);
    // Vorhandene (echte) Werte nicht überschreiben
    if (i >= 0) st.daily[i] = { ...r, ...st.daily[i] }; else st.daily.push(r);
  }
  st.settings.garminStartDone = true;
  return true;
}
