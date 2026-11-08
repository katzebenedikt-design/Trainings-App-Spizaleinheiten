// Kognitivtraining – WOCHENPLAN (Konfiguration, hier anpassen). Index 0 = Montag.
// typ 'spiel' = Minispiel aus Mental, typ 'cat' = CAT-Training (Übungsaufgaben mit Lösungsweg).
// cat: 'schwaechster' = schwächster Bereich der letzten CAT-Simulation, sonst ROTATION nach Kalenderwoche.
// belastung: true = direkt nach dem Training spielen (Kopf unter Ermüdung, wie im Auswahlverfahren).
export const KOGNITIV_WOCHE = [
  { typ: 'spiel', key: 'rechnen', titel: 'Kopfrechnen unter Zeitdruck', min: 5, warum: 'Rechnen unter Zeitdruck ist fester Teil der Eignungstests.' },
  { typ: 'spiel', key: 'merken', titel: 'Merkfähigkeit', min: 5, warum: 'Befehle, Koordinaten und Namen behalten – auch wenn es hektisch wird.' },
  { typ: 'cat', key: 'logik', titel: 'Logik: Zahlenreihen, Matrizen, Figuren', min: 10, warum: 'Logisches Denken hat im CAT viel Gewicht.' },
  { typ: 'cat', key: 'konzentration', titel: 'Konzentration (Durchstreichtest)', min: 5, warum: 'Genau bleiben über Minuten – nach dem Kickboxen besonders ehrlich.' },
  { typ: 'spiel', key: 'muster', titel: 'Muster erkennen', min: 5, optional: true, warum: 'Ruhetag: kurz und leicht, z. B. im Zug.' },
  { typ: 'spiel', key: 'stress', titel: 'Entscheiden unter Stress – nach dem Marsch', min: 5, belastung: true, warum: 'Im Auswahlverfahren denkst du müde. Genau das trainierst du hier.' },
  { typ: 'cat', key: 'schwaechster', titel: 'CAT-Training: schwächster Bereich', min: 10, warum: 'Die größte Lücke schließen bringt die meisten Punkte.' },
];
// Sonntag der Entlastungswoche: monatlicher Kopf-Test statt Training
export const KOPFTEST_TAG = { typ: 'kopftest', key: 'kopftest', titel: 'Kopf-Test (monatlich, alle 8 CAT-Bereiche)', min: 17, warum: 'Feste Schwierigkeit – zeigt ehrlich deinen Fortschritt für den CAT.' };
export const ROTATION = ['raum', 'mathe', 'sprache', 'technik', 'allgemein', 'merken'];
