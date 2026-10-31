// Datenquellen für Garmin-Werte. Heute: Datei-Export und manuelle Eingabe.
// Eine automatische Anbindung ist vorbereitet, aber nicht aktiv – siehe docs/garmin-anbindung.md.
//
// Jede Quelle liefert dieselbe Form, die mergeDaily()/Aktivitäts-Import verstehen:
//   { daily: [{ date: 'YYYY-MM-DD', restHR, hrv, sleepH, bodyBattery, vo2max, load, steps, stress }],
//     acts:  [{ start: Date, sport: 'lauf'|'schwimmen'|'gehen'|..., distM, durSec, avgHR }] }
import { importFile } from './garmin.js';

export const SOURCES = [
  { id: 'datei', name: 'Datei-Export (CSV, FIT, GPX, TCX, ZIP)', active: true, fetch: (file, onProgress) => importFile(file, onProgress) },
  { id: 'manuell', name: 'Manuelle Eingabe', active: true },
  {
    id: 'garmin-connect-api', name: 'Garmin Connect (automatisch)', active: false,
    // Voraussetzung: Freigabe im Garmin Connect Developer Program (Health/Activity API) und ein kleiner
    // eigener Server, der Garmins Push-Benachrichtigungen empfängt und per OAuth abruft.
    // Die App müsste dann nur noch diese Funktion mit der Server-Adresse füllen:
    async fetch({ serverUrl, token, from, to }) {
      const res = await fetch(`${serverUrl}/garmin/daily?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Garmin-Server nicht erreichbar');
      return res.json(); // { daily: [...], acts: [...] }
    },
  },
];
