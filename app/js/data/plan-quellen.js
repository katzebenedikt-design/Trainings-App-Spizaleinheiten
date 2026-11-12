// Planänderungen nach Auswertung der Trainings-PDFs (Priorität: 1. KSK, 2. EGB, 3. Navy SEAL nur bei Lücken).
// Seitenangaben = Seite in der PDF-Datei (in Klammern die gedruckte Seitenzahl, wenn abweichend).
export const PDF_DATEIEN = {
  ksk: 'trainingshandbuch-fuer-bewerber-data.pdf (KSK-Trainingshandbuch)',
  egb: 'EGB-Report PPF Germany.pdf (EGB-Report)',
  nsw: 'naval-special-warfare-physical-training-guide.pdf (Navy SEAL / NSW Guide)',
};
export const PLAN_AENDERUNGEN = [
  { was: 'Rhythmus 5 Belastungswochen + 1 Regenerationswoche (statt 3 + 1); Leistungstest in jeder Regenerationswoche, also alle 6 Wochen', quelle: 'ksk', seite: '14–16', warum: 'Trainingspläne der Leistungsgruppen C, B und A: jeweils 6. Woche Regeneration (TB-R), Test nach dem Block. Test alle 6 statt 12/18 Wochen auf deinen Wunsch.' },
  { was: 'Maximalkraft (K4) in Woche 1 und 4 jedes Blocks der Leistungsphase', quelle: 'ksk', seite: '16', warum: 'Leistungsgruppe A kombiniert K1/K2/K4 in allen Belastungswochen.' },
  { was: 'Spezifikphase: einmal pro Block langer Marsch, 30 → 35 → 40 km mit 15–20 kg', quelle: 'ksk', seite: '8', warum: 'PFV Phase 2: „Ein 40 km-Marsch sollte keine Herausforderung darstellen“.' },
  { was: 'Zielwert 200 m Kleiderschwimmen: max. 7:30, Ziel 7:00', quelle: 'ksk', seite: '7', warum: 'PFV Phase 1: 200 m im Kampfanzug in max. 7:30 und Entkleiden im Wasser; EGB-Report S. 8 (gedruckt 7): „deutlich unter 7:30“.' },
  { was: 'Apnoe-Gewöhnung im Schwimmtraining ab Aufbau (nur mit Aufsicht)', quelle: 'egb', seite: '8 (gedruckt 7)', warum: 'Checkliste: „frühzeitig auf längere Belastungsdauern vorbereiten (Marsch, Schwimmen, Apnoe)“. KSK nennt Apnoe nicht – Ergänzung aus der zweiten Priorität.' },
  { was: 'Agilität und Hindernis-Technik vor Intervallen ab Aufbau', quelle: 'egb', seite: '9 (gedruckt 8)', warum: 'Periodisierung: HiBa-Training im Aufbau, Agilität/Schnelligkeit/Explosivität im Peaking. Im KSK-Handbuch fehlt das – Lücke geschlossen.' },
  { was: 'Kopftraining direkt nach harten Einheiten (Kickboxen, Marsch)', quelle: 'egb', seite: '8 (gedruckt 7)', warum: 'Checkliste: „Kognitive Aufgaben nach intensiven Workouts integrieren (z. B. Kopfrechnen, Orientierung)“.' },
  { was: '4. Woche jedes Blocks: kurze, häufigere Intervalle (16× 200 m) statt 400 m', quelle: 'nsw', seite: '4', warum: '„Every 4th or 5th week … shorter, more frequent intervals“. KSK und EGB geben dazu nichts vor – Ergänzung aus der dritten Priorität.' },
  { was: 'Unverändert bestätigt: mindestens ein trainingsfreier Tag (Freitag), Umfang vor Intensität', quelle: 'ksk', seite: '9', warum: '„Mindestens ein Tag in der Woche ist komplett trainingsfrei.“ Bereits so im Plan.' },
  { was: 'Nicht übernommen: 2× Schwimmen pro Woche', quelle: 'nsw', seite: '2', warum: 'NSW empfiehlt je eine lange, eine intensive und eine Intervall-Einheit Schwimmen pro Woche. Du hast 1× Schwimmen pro Woche festgelegt; KSK/EGB fordern nicht mehr.' },
];
