// Grundlagenkurse, orientiert an Inhalten der allgemeinen Grundausbildung. Vorwissen, kein Ersatz für Ausbildung.
export const COURSES = [
  { id: 'kompass', title: 'Kompass & Karte', lessons: [
    { title: 'Der Marschkompass', visual: 'kompass', cards: [
      'Der Marschkompass besteht aus Deckel mit Visier (Kimme und Visierfaden), Kompassdose mit Magnetnadel, drehbarem Teilring, Leuchtmarken, Spiegel und Anlegekante mit Maßstab.',
      'Der Teilring ist beim Militär meist in Strich geteilt: 6400 Strich = 360 Grad. 1 Grad ≈ 17,8 Strich. Viele zivile Kompasse zeigen Grad.',
      'Metall und Elektronik lenken die Nadel ab: Abstand halten zu Fahrzeugen, Waffe, Handy, Stromleitungen.'] },
    { title: 'Karte lesen', cards: [
      'Maßstab 1:50.000 → 1 cm auf der Karte = 500 m im Gelände. Maßstab 1:25.000 → 1 cm = 250 m.',
      'Das UTM-Gitter teilt die Karte in Quadrate von 1 km × 1 km. Koordinaten: erst nach rechts lesen (Rechtswert), dann nach oben (Hochwert). Merksatz: „Erst durch die Tür, dann die Treppe hoch.“',
      'Eine 6-stellige Gitterangabe (z. B. 123 456) ist auf 100 m genau, eine 8-stellige auf 10 m.',
      'Höhenlinien verbinden Punkte gleicher Höhe. Eng beieinander = steil, weit auseinander = flach. Geländeformen: Kuppe, Rücken, Sattel, Mulde, Tal.'] },
    { title: 'Einnorden & Marschzahl', cards: [
      'Karte einnorden: Kompass mit der Anlegekante an eine senkrechte Gitterlinie legen und die Karte drehen, bis die Nadel nach Norden zeigt. Jetzt liegt die Karte wie das Gelände.',
      'Marschzahl nehmen: Anlegekante vom Standort zum Ziel legen, Teilring drehen, bis seine Nordlinien parallel zu den Gitterlinien stehen (Nord oben). Marschzahl an der Ablesemarke ablesen.',
      'Marschieren: Kompass waagerecht halten, sich drehen, bis die Nadel auf die Nordmarke einspielt. Über das Visier einen markanten Punkt anpeilen und hingehen. Dort wiederholen.',
      'Die Nadelabweichung (Unterschied Gitter- zu Magnetisch-Nord) steht am Kartenrand. In Deutschland ist sie derzeit klein.'] },
    { title: 'Entfernung & Sicherheit', cards: [
      'Schrittmaß: Zähle deine Doppelschritte auf 100 m (meist 60–70, im Gelände und mit Gepäck mehr). So schätzt du Strecken ohne GPS.',
      'Auffanglinie: Ein Weg, Bach oder Waldrand hinter dem Ziel zeigt dir, dass du zu weit bist.',
      'Bei Unsicherheit anhalten, Standort bestimmen, dann weiter. Verlaufen kostet mehr Zeit als Prüfen.'] },
  ], quiz: [
    { q: 'Maßstab 1:50.000. 4 cm auf der Karte sind im Gelände …', a: ['200 m', '2 km', '20 km', '500 m'], ok: 1, why: '4 × 500 m = 2.000 m.' },
    { q: 'Wie viele Strich hat ein Vollkreis beim militärischen Kompass?', a: ['360', '400', '6400', '1000'], ok: 2, why: '6400 Strich = 360°.' },
    { q: 'Gitterangabe lesen: zuerst …', a: ['Hochwert (nach oben)', 'Rechtswert (nach rechts)', 'egal', 'die Höhe'], ok: 1, why: 'Erst durch die Tür (rechts), dann die Treppe hoch.' },
    { q: 'Höhenlinien liegen sehr eng beieinander. Das Gelände ist …', a: ['flach', 'steil', 'sumpfig', 'bewaldet'], ok: 1, why: 'Enge Höhenlinien = steiles Gelände.' },
    { q: 'Was ist eine Auffanglinie?', a: ['Die Linie zum Ziel', 'Ein markantes Geländemerkmal hinter dem Ziel', 'Der Kartenrand', 'Die Nordrichtung'], ok: 1, why: 'Sie zeigt dir, dass du übers Ziel hinaus bist.' },
    { q: 'Eine 6-stellige Gitterangabe ist genau auf …', a: ['1 km', '100 m', '10 m', '1 m'], ok: 1, why: '6 Stellen = 100 m, 8 Stellen = 10 m.' },
  ] },
  { id: 'rucksack', title: 'Rucksack packen', lessons: [
    { title: 'Packprinzip', cards: [
      'Schweres nah an den Rücken und etwa zwischen die Schulterblätter. So zieht der Rucksack nicht nach hinten.',
      'Leichtes und Volumiges nach unten (z. B. Schlafsack). Häufig Gebrauchtes oben oder in die Deckeltasche.',
      'Wasser griffbereit. Alles gegen Nässe schützen: Packsäcke oder Müllbeutel als Innenhülle.',
      'Gewicht links und rechts ausbalancieren. Nichts darf klappern oder schlagen.'] },
    { title: 'Einstellen & Füße', cards: [
      'Hüftgurt auf den Beckenkamm: Er trägt den Großteil der Last. Dann Schultergurte, dann Lageverstellriemen, zuletzt Brustgurt.',
      'Unterwegs nachstellen: Last zwischendurch zwischen Hüfte und Schultern verlagern.',
      'Füße: Socken ohne Falten, eingelaufene Stiefel. Druckstellen sofort abkleben, nicht erst wenn die Blase da ist. In Pausen Socken wechseln.'] },
    { title: 'Checkliste Marsch', cards: [
      'Wasser (mind. 2 Liter), Verpflegung, Wechselsocken, Blasenpflaster/Tape, Regenschutz, Wärmeschicht.',
      'Stirnlampe mit Ersatzbatterien, Karte und Kompass, Erste-Hilfe-Set, Handy und Powerbank.',
      'Steigerung im Training: nach KSK-Handbuch mit 10 kg beginnen, bis 20–25 kg steigern, 4–7 km/h.'] },
  ], quiz: [
    { q: 'Wohin gehört das schwerste Gepäckstück?', a: ['Ganz nach unten', 'Nah an den Rücken, Höhe Schulterblätter', 'In die Deckeltasche', 'Außen an den Rucksack'], ok: 1, why: 'Nah am Körperschwerpunkt trägt es sich am leichtesten.' },
    { q: 'Welcher Gurt trägt den Großteil der Last?', a: ['Brustgurt', 'Schultergurte', 'Hüftgurt', 'Kompressionsriemen'], ok: 2, why: 'Der Hüftgurt bringt die Last auf das Becken.' },
    { q: 'Wann klebst du eine Druckstelle ab?', a: ['Wenn die Blase offen ist', 'Sofort beim ersten Brennen', 'Nach dem Marsch', 'Nie'], ok: 1, why: 'Früh abkleben verhindert die Blase.' },
    { q: 'Womit schützt du den Inhalt vor Nässe?', a: ['Gar nicht', 'Packsäcke oder Müllbeutel innen', 'Nur Regenhülle', 'Imprägnierspray'], ok: 1, why: 'Eine Innenhülle hält auch bei Starkregen dicht.' },
  ] },
  { id: 'waffen', title: 'Waffenkunde (Grundlagen)', lessons: [
    { title: 'Sicherheitsregeln', cards: [
      'Diese Lektion ist Vorwissen. Umgang mit Waffen nur in der Ausbildung unter Aufsicht und nach den dort geltenden Vorschriften.',
      'Regel 1: Jede Waffe wird behandelt, als wäre sie geladen.',
      'Regel 2: Die Mündung zeigt nie auf etwas, das nicht getroffen werden darf.',
      'Regel 3: Der Finger bleibt außerhalb des Abzugsbügels, bis der Entschluss zum Schuss gefasst ist.',
      'Regel 4: Ziel und Umfeld (dahinter und daneben) eindeutig erkennen.',
      'Übernahme oder Übergabe einer Waffe: immer Sicherheitsüberprüfung nach Vorschrift, so wie in der Ausbildung gelernt.'] },
    { title: 'Hauptteile', visual: 'waffe', cards: [
      'Lauf mit Mündung, Verschluss mit Patronenlager, Magazin, Abzugseinrichtung mit Sicherung, Visier oder Optik, Schaft, Griffstück und Handschutz.',
      'Tippe im Bild auf „Rundgang“: Die Teile werden nacheinander hervorgehoben.'] },
    { title: 'Begriffe', cards: [
      'Patrone = Hülse, Treibladung, Zündhütchen und Geschoss. Kaliber = Innendurchmesser des Laufs bzw. Geschossdurchmesser.',
      'Gasdrucklader: Ein Teil der Pulvergase bewegt den Verschluss zurück. Dabei wird die Hülse ausgeworfen und beim Vorlauf die nächste Patrone zugeführt.',
      'Störung: Ablauf nur nach Vorschrift beheben, Mündung bleibt in sicherer Richtung.'] },
  ], links: [['Bundeswehr auf YouTube', 'https://www.youtube.com/@bundeswehr'], ['Videos: Sicherheitsbestimmungen Bundeswehr', 'https://www.youtube.com/results?search_query=Bundeswehr+Sicherheitsbestimmungen+Waffe']],
  quiz: [
    { q: 'Wie behandelst du jede Waffe?', a: ['Als ungeladen, wenn sie gesichert ist', 'Als wäre sie geladen', 'Je nach Ausbilder', 'Als Übungswaffe'], ok: 1, why: 'Grundregel Nummer eins.' },
    { q: 'Wo ist der Finger, solange kein Schussentschluss gefasst ist?', a: ['Am Abzug', 'Außerhalb des Abzugsbügels', 'Am Sicherungshebel', 'Egal'], ok: 1, why: 'So wird ein unbeabsichtigter Schuss verhindert.' },
    { q: 'Was gehört NICHT zur Patrone?', a: ['Hülse', 'Zündhütchen', 'Verschluss', 'Geschoss'], ok: 2, why: 'Der Verschluss ist Teil der Waffe.' },
    { q: 'Wohin zeigt die Mündung?', a: ['Nach oben', 'Nie auf etwas, das nicht getroffen werden darf', 'Zum Boden vor den Füßen', 'Zum Ausbilder'], ok: 1, why: 'Sichere Richtung immer beachten.' },
    { q: 'Was bewegt beim Gasdrucklader den Verschluss zurück?', a: ['Eine Feder', 'Pulvergase', 'Der Schütze', 'Der Abzug'], ok: 1, why: 'Ein Teil der Gase treibt den Verschluss zurück.' },
  ] },
  { id: 'nato', title: 'NATO-Alphabet', lessons: [
    { title: 'Das Alphabet', visual: 'nato', cards: [
      'Das NATO-Alphabet macht Buchstaben im Funk eindeutig. Es wird international gleich gesprochen.',
      'Ziffern im Funk einzeln sprechen. Englisch: „niner“ (9), „tree“ (3), „fife“ (5).',
      'Tippe einen Buchstaben im Raster an, um ihn zu hören.'] },
  ], quiz: [
    { q: 'K = ?', a: ['Kilo', 'King', 'Kevin', 'Kappa'], ok: 0, why: 'Kilo.' },
    { q: 'Q = ?', a: ['Queen', 'Quebec', 'Quick', 'Quarter'], ok: 1, why: 'Quebec.' },
    { q: 'Y = ?', a: ['Yellow', 'Yoga', 'Yankee', 'Yard'], ok: 2, why: 'Yankee.' },
    { q: 'J = ?', a: ['Juliett', 'Jack', 'James', 'Joker'], ok: 0, why: 'Juliett.' },
    { q: '„GSG“ buchstabiert:', a: ['Golf Sierra Golf', 'George Sugar George', 'Gustav Siegfried Gustav', 'Golf Sam Golf'], ok: 0, why: 'Golf – Sierra – Golf.' },
    { q: 'Wie spricht man die 9 im englischen Funk?', a: ['nine', 'niner', 'nein', 'nane'], ok: 1, why: '„Niner“ – damit es nicht mit „nein“ verwechselt wird.' },
  ] },
  { id: 'dienstgrade', title: 'Dienstgrade', lessons: [
    { title: 'Heer & Luftwaffe (KSK, EGB)', cards: [
      'Mannschaften: Schütze/Soldat → Gefreiter → Obergefreiter → Hauptgefreiter → Stabsgefreiter → Oberstabsgefreiter.',
      'Unteroffiziere ohne Portepee: Unteroffizier → Stabsunteroffizier (Laufbahn Offizier: Fahnenjunker).',
      'Unteroffiziere mit Portepee: Feldwebel → Oberfeldwebel → Hauptfeldwebel → Stabsfeldwebel → Oberstabsfeldwebel (Offiziersanwärter: Fähnrich, Oberfähnrich).',
      'Offiziere: Leutnant → Oberleutnant → Hauptmann → (Stabshauptmann) → Major → Oberstleutnant → Oberst → Brigadegeneral → Generalmajor → Generalleutnant → General.'] },
    { title: 'Marine (Kampfschwimmer)', cards: [
      'Mannschaften: Matrose → Gefreiter → Obergefreiter → Hauptgefreiter → Stabsgefreiter → Oberstabsgefreiter.',
      'Unteroffiziere: Maat → Obermaat; mit Portepee: Bootsmann → Oberbootsmann → Hauptbootsmann → Stabsbootsmann → Oberstabsbootsmann.',
      'Offiziere: Leutnant zur See → Oberleutnant zur See → Kapitänleutnant → Korvettenkapitän → Fregattenkapitän → Kapitän zur See → Flottillenadmiral …'] },
    { title: 'Bundespolizei (GSG 9)', cards: [
      'Die GSG 9 gehört zur Bundespolizei. Mittlerer Dienst: Polizeimeister → Polizeiobermeister → Polizeihauptmeister.',
      'Gehobener Dienst: Polizeikommissar → Polizeioberkommissar → Polizeihauptkommissar → Erster Polizeihauptkommissar.',
      'Höherer Dienst: Polizeirat → Polizeioberrat → Polizeidirektor … (Bezeichnungen können je nach Laufbahn variieren – aktuelle Angaben bei der Bundespolizei prüfen.)'] },
  ], quiz: [
    { q: 'Welcher Dienstgrad ist höher?', a: ['Obergefreiter', 'Hauptgefreiter'], ok: 1, why: 'Gefreiter → Obergefreiter → Hauptgefreiter.' },
    { q: 'Erster Dienstgrad mit Portepee im Heer:', a: ['Unteroffizier', 'Feldwebel', 'Stabsunteroffizier', 'Hauptfeldwebel'], ok: 1, why: 'Ab Feldwebel trägt man das Portepee.' },
    { q: 'Marine-Gegenstück zum Feldwebel:', a: ['Maat', 'Bootsmann', 'Kapitänleutnant', 'Obermaat'], ok: 1, why: 'Feldwebel = Bootsmann.' },
    { q: 'Hauptmann entspricht bei der Marine:', a: ['Kapitänleutnant', 'Korvettenkapitän', 'Leutnant zur See', 'Fregattenkapitän'], ok: 0, why: 'Hauptmann = Kapitänleutnant.' },
    { q: 'Die GSG 9 gehört zur …', a: ['Bundeswehr', 'Landespolizei', 'Bundespolizei', 'Marine'], ok: 2, why: 'GSG 9 der Bundespolizei.' },
  ] },
  { id: 'funk', title: 'Sprechfunk', lessons: [
    { title: 'Grundregeln', cards: [
      'Erst denken, dann sprechen. Spruch im Kopf (oder auf Papier) fertig machen.',
      'Sprechtaste drücken, kurz warten, dann sprechen. Kurz, klar, langsam, gleichmäßig.',
      'Funkdisziplin: Keine Klarnamen, keine unnötigen Sprüche, Kanal nicht blockieren.',
      'Aufbau: Gerufener – „hier“ – Rufer – Inhalt – „kommen“. Beispiel: „Bravo zwo, hier Alfa eins, kommen.“'] },
    { title: 'Betriebsworte', cards: [
      '„Kommen“ = ich warte auf Antwort (Englisch: over). „Ende“ = Gespräch beendet (out). Nie „over and out“.',
      '„Verstanden“ (roger), „Wird ausgeführt“ (wilco), „Wiederholen“ (say again), „Warten“ (wait), „Funkprobe“ (radio check).',
      'Zahlen und Namen buchstabieren: NATO-Alphabet, Ziffern einzeln.'] },
    { title: 'Meldung', cards: [
      'Eine gute Meldung beantwortet kurz: Wer meldet? Was ist los? Wo? Wann? Wie viele/wie stark? Was wird gebraucht?',
      'Beispiel: „Alfa eins, hier Charlie drei. Zwei Fahrzeuge, Richtung Süd, Planquadrat 123 456, Zeit 14:30. Beobachte weiter, kommen.“'] },
  ], quiz: [
    { q: 'Was bedeutet „kommen“ / „over“?', a: ['Gespräch beendet', 'Ich warte auf Antwort', 'Verstanden', 'Wiederholen'], ok: 1, why: 'Over = ich übergebe, du bist dran.' },
    { q: 'Falsch ist:', a: ['„Ende“', '„over and out“', '„kommen“', '„verstanden“'], ok: 1, why: 'Over (Antwort erwartet) und Out (beendet) widersprechen sich.' },
    { q: 'Richtiger Aufbau eines Anrufs:', a: ['Rufer – Gerufener', 'Gerufener – hier – Rufer – kommen', 'Name – Dienstgrad', 'Inhalt – Rufzeichen'], ok: 1, why: 'Erst wer gerufen wird, dann wer ruft.' },
    { q: '„Wilco“ heißt:', a: ['Verstanden und wird ausgeführt', 'Warten', 'Nein', 'Wiederholen'], ok: 0, why: 'Will comply.' },
  ] },
  { id: 'erstehilfe', title: 'Erste Hilfe', lessons: [
    { title: 'Ablauf', cards: [
      'Eigenschutz zuerst: Gefahr erkennen, Unfallstelle sichern. Ein zweites Opfer hilft niemandem.',
      'Notruf 112: Wo ist es passiert? Was ist passiert? Wie viele Verletzte? Welche Verletzungen? Warten auf Rückfragen.',
      'Ansprechen, anfassen. Reagiert die Person nicht: Atemwege frei machen (Kopf überstrecken), Atmung prüfen – höchstens 10 Sekunden.'] },
    { title: 'Bewusstlos', cards: [
      'Keine normale Atmung → Herz-Lungen-Wiederbelebung: 30 × drücken, 2 × beatmen. Mitte des Brustkorbs, 5–6 cm tief, 100–120 pro Minute. AED holen lassen und einsetzen.',
      'Bewusstlos, aber normale Atmung → stabile Seitenlage, Atmung regelmäßig kontrollieren, zudecken.'] },
    { title: 'Blutung & Schock', cards: [
      'Starke Blutung: sofort Druck auf die Wunde, Druckverband. Bei lebensbedrohlicher Blutung an Arm oder Bein: Abbinden (Tourniquet) oberhalb der Wunde, Uhrzeit notieren.',
      'Im Einsatz gilt oft <C>ABCDE: zuerst kritische Blutung stoppen, dann Atemwege, Atmung, Kreislauf, Neurologie, Erhalt der Körperwärme.',
      'Schock: hinlegen, Beine hoch (wenn keine Verletzung dagegen spricht), wärmen, beruhigen, nicht allein lassen.',
      'Diese App ersetzt keinen Erste-Hilfe-Kurs. Mach einen Kurs (z. B. DRK, Johanniter, Malteser).'] },
  ], quiz: [
    { q: 'Was kommt zuerst?', a: ['Notruf', 'Eigenschutz', 'Herzdruckmassage', 'Stabile Seitenlage'], ok: 1, why: 'Eigenschutz geht vor.' },
    { q: 'Verhältnis bei der Wiederbelebung (Erwachsene):', a: ['15:2', '30:2', '5:1', '50:5'], ok: 1, why: '30 Kompressionen, 2 Beatmungen.' },
    { q: 'Bewusstlos mit normaler Atmung:', a: ['Herzdruckmassage', 'Stabile Seitenlage', 'Hinsetzen', 'Wasser geben'], ok: 1, why: 'Stabile Seitenlage hält die Atemwege frei.' },
    { q: 'Lebensbedrohliche Blutung am Bein, Druck reicht nicht:', a: ['Abwarten', 'Tourniquet oberhalb der Wunde, Uhrzeit notieren', 'Bein hochlegen', 'Wunde auswaschen'], ok: 1, why: 'Abbinden stoppt die Blutung, die Zeit ist für den Arzt wichtig.' },
    { q: 'Wie lange prüfst du die Atmung höchstens?', a: ['3 Sekunden', '10 Sekunden', '1 Minute', '30 Sekunden'], ok: 1, why: 'Maximal 10 Sekunden.' },
  ] },
  { id: 'tarnen', title: 'Tarnen', lessons: [
    { title: 'Was verrät dich?', cards: [
      'Form: Die typische Umrisslinie von Kopf, Schultern, Ausrüstung. Silhouette brechen.',
      'Oberfläche & Farbe: Glatte, einfarbige Flächen fallen auf. Tarnmittel an die Umgebung anpassen.',
      'Schatten: Eigenen Schatten beachten, Schattenzonen nutzen.',
      'Glanz: Gesicht, Hände, Brillen, Uhren, Metall. Mattieren und tarnen.',
      'Bewegung: Das Auge sieht Bewegung zuerst. Langsam bewegen, Pausen.',
      'Geräusch, Licht und Geruch: Lärm- und Lichtdisziplin, kein Rauchen, keine starken Gerüche.'] },
    { title: 'Praxis', cards: [
      'Natürliches Material aus der direkten Umgebung verwenden und regelmäßig erneuern, wenn es welkt.',
      'Nie auf Kuppen oder Kanten gegen den Himmel stehen. Am Hang unterhalb der Kammlinie bewegen.',
      'Gesicht und Hände tarnen: helle Stellen (Stirn, Nase, Wangen) dunkler, dunkle Stellen heller.',
      'Nachts: Lichtquellen abdecken. Rotlicht oder gar kein Licht.'] },
  ], quiz: [
    { q: 'Was nimmt das Auge zuerst wahr?', a: ['Farbe', 'Bewegung', 'Form', 'Geruch'], ok: 1, why: 'Bewegung fällt am schnellsten auf.' },
    { q: 'Wo bewegst du dich am Hang?', a: ['Auf dem Kamm', 'Unterhalb der Kammlinie', 'Egal', 'Im Tal auf der Straße'], ok: 1, why: 'Sonst zeichnet sich die Silhouette gegen den Himmel ab.' },
    { q: 'Welches Tarnmaterial ist am besten?', a: ['Material aus der direkten Umgebung', 'Grüne Folie', 'Zweige aus einem anderen Wald', 'Nichts'], ok: 0, why: 'Es passt zu Farbe und Struktur vor Ort.' },
    { q: 'Gesicht tarnen:', a: ['Alles schwarz', 'Helle Stellen dunkler, dunkle heller', 'Nur die Stirn', 'Gar nicht'], ok: 1, why: 'So verschwindet die typische Gesichtsform.' },
  ] },
  { id: 'verhalten', title: 'Verhalten im Auswahlverfahren', lessons: [
    { title: 'Einstellung', cards: [
      'Kameradschaftlich auftreten. Nicht vorlaut, nicht besserwisserisch. Tun, was gesagt wird (EGB-Report, Tipps der Coaches).',
      'Jede Disziplin ernst nehmen. Es zählt nicht das Minimum, sondern deutlich darüber.',
      'Gesund an den Start: Die Vorbereitung entscheidet, nicht der Testtag. Eine Verletzung kurz vorher beendet alles.',
      'Urlaub und Freistellung vor dem Auswahlverfahren früh planen, um Erholung zu kontrollieren.'] },
    { title: 'Werte', cards: [
      'Die US Army Special Forces nennen acht Eigenschaften: Integrität, Mut, Durchhaltevermögen, Eigenverantwortung, Professionalität, Anpassungsfähigkeit, Teamfähigkeit, Können.',
      'KSK-Motto: „Facit omnia voluntas“ – der Wille entscheidet.',
      'SOF-Wahrheit: Menschen sind wichtiger als Material. Qualität ist wichtiger als Quantität.'] },
  ], quiz: [
    { q: 'Wie verhältst du dich in der Vorbereitungsphase?', a: ['Vorlaut, um aufzufallen', 'Kameradschaftlich und diszipliniert', 'Möglichst unsichtbar', 'Ich korrigiere die Ausbilder'], ok: 1, why: 'Teamfähigkeit wird beobachtet.' },
    { q: 'KSK-Motto:', a: ['Semper fidelis', 'Facit omnia voluntas', 'Who dares wins', 'De oppresso liber'], ok: 1, why: 'Der Wille entscheidet.' },
    { q: 'Kurz vor dem Verfahren tut das Knie weh. Richtig ist:', a: ['Durchziehen', 'Abklären lassen und Belastung anpassen', 'Schmerzmittel und weiter', 'Ignorieren'], ok: 1, why: 'Gesund am Start schlägt alles.' },
  ] },
];
