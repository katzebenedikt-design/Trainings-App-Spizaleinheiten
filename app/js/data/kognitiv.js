// Kopftraining – WOCHENPLAN (Konfiguration, hier anpassen). Index 0 = Montag.
// cat-kurz  = CAT-Kurzeinheit (10–15 min, Schwächen öfter, Zeitdruck wie im Test)
// probetest = voller CAT-Probetest des gewählten Profils (einmal pro Woche)
// kopftest  = Kopf-Test mit fester Schwierigkeit (Sonntag der Regenerationswoche, ersetzt den Probetest)
// Dazu jeden Tag die Psychologen-Kurzeinheit (siehe PSYCH_WOCHE in data/psych.js).
export const KOGNITIV_WOCHE = [
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit', min: 12, warum: 'Täglich kurz unter Zeitdruck – so wird Tempo zur Gewohnheit.' },
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit nach dem Kickboxen', min: 12, warum: 'Denken nach Belastung, wie im Auswahlverfahren (EGB-Report S. 8).' },
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit', min: 12, warum: 'Schwache Bereiche kommen öfter dran, bis sie aufholen.' },
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit nach dem Kickboxen', min: 12, warum: 'Konzentriert bleiben, wenn der Kopf müde ist.' },
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit (Ruhetag)', min: 12, optional: true, warum: 'Ruhetag: kurz und locker, z. B. im Zug.' },
  { typ: 'cat-kurz', titel: 'CAT-Kurzeinheit direkt nach dem Marsch', min: 12, belastung: true, warum: 'Kognitive Aufgaben nach intensiven Einheiten (EGB-Report S. 8).' },
  { typ: 'probetest', titel: 'CAT-Probetest (voll)', min: 55, warum: 'Einmal pro Woche der komplette Ablauf mit allen Zeitlimits.' },
];
// Sonntag der Regenerationswoche: Kopf-Test mit fester Schwierigkeit statt Probetest
export const KOPFTEST_TAG = { typ: 'kopftest', key: 'kopftest', titel: 'Kopf-Test (feste Schwierigkeit, alle CAT-Bereiche)', min: 20, warum: 'Feste Schwierigkeit – zeigt ehrlich deinen Fortschritt für den CAT.' };
