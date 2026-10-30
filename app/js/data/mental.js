// Vorgelesene Texte: Zahlen sind Pausen in Sekunden.
// Werkzeuge nach elite-mind-supplement-coach: Atmung, Selbstgespräch, Segmentieren, Visualisierung, Routinen.
export const TEXTE = [
  { id: 'pmr', cat: 'Entspannung', title: 'Kurze Muskelentspannung', min: 6, parts: [
    'Setz oder leg dich bequem hin.', 3, 'Schließ die Augen, wenn du willst.', 3, 'Atme ruhig durch die Nase ein.', 4, 'Und langsam durch den Mund aus.', 5,
    'Balle jetzt beide Hände zu Fäusten.', 2, 'Fest. Halten.', 5, 'Und loslassen.', 2, 'Spür, wie die Spannung aus den Händen fließt.', 8,
    'Zieh jetzt die Schultern hoch zu den Ohren.', 2, 'Halten.', 5, 'Und fallen lassen.', 8,
    'Spann den Bauch an, als ob gleich ein Schlag kommt.', 2, 'Halten.', 5, 'Und locker.', 8,
    'Drück die Fersen in den Boden und spann die Beine an.', 2, 'Halten.', 5, 'Und loslassen.', 8,
    'Jetzt der ganze Körper. Alles anspannen.', 2, 'Halten.', 5, 'Und komplett loslassen.', 10,
    'Atme noch dreimal ruhig ein und aus.', 15, 'Du bist ruhig. Du bist bereit.', 3, 'Ende der Übung.'] },
  { id: 'schlaf', cat: 'Entspannung', title: 'Einschlafen: Zwerchfellatmung', min: 5, parts: [
    'Handy weglegen. Licht aus.', 3, 'Leg eine Hand auf den Bauch.', 3, 'Wir atmen fünf Sekunden ein und fünf Sekunden aus. So wie im SFAS-Handbuch empfohlen.', 3,
    'Einatmen. Der Bauch hebt sich.', 5, 'Ausatmen.', 5, 'Einatmen.', 5, 'Ausatmen.', 5, 'Einatmen.', 5, 'Ausatmen. Lass den Tag los.', 5,
    'Was heute war, ist erledigt. Morgen ist ein neuer Auftrag.', 4, 'Einatmen.', 5, 'Ausatmen.', 5, 'Einatmen.', 5, 'Ausatmen.', 5,
    'Mach jetzt allein weiter. Fünf ein. Fünf aus.', 3, 'Gute Nacht.'] },
  { id: 'scan', cat: 'Entspannung', title: 'Body-Scan nach dem Training', min: 5, parts: [
    'Leg dich auf den Rücken.', 3, 'Spür den Boden unter dir.', 5, 'Geh mit der Aufmerksamkeit zu deinen Füßen.', 4, 'Wie fühlen sie sich an? Warm, müde, schwer?', 6,
    'Weiter zu den Waden und Knien.', 6, 'Zu den Oberschenkeln.', 6, 'Zur Hüfte und zum unteren Rücken.', 6, 'Gibt es irgendwo Schmerz, der anders ist als normale Müdigkeit? Merk ihn dir für den Check-in.', 6,
    'Weiter zum Bauch. Zur Brust.', 6, 'Zu den Schultern, Armen, Händen.', 6, 'Zum Nacken und zum Gesicht. Kiefer locker.', 8,
    'Dein Körper hat heute gearbeitet. Jetzt baut er auf.', 4, 'Erholung ist Teil des Trainings.', 3, 'Ende.'] },
  { id: 'testtag', cat: 'Entspannung', title: 'Visualisierung: Testtag', min: 5, parts: [
    'Schließ die Augen. Atme ruhig.', 5, 'Stell dir den Morgen des Tests vor.', 3, 'Du wachst auf. Du hast gut geschlafen.', 4, 'Deine Ausrüstung liegt bereit. Du hast sie gestern Abend geprüft.', 5,
    'Du frühstückst wie immer. Keine Experimente.', 4, 'Am Platz: Du siehst die anderen Bewerber. Manche wirken stärker. Egal. Du machst deinen Auftrag.', 6,
    'Erste Disziplin: Klimmzüge. Du hängst dich ruhig an die Stange. Arme gestreckt.', 4, 'Jede Wiederholung sauber. Kinn über die Stange.', 6,
    'Dann der Lauf. Die ersten Runden kontrolliert. Du kennst dein Tempo.', 5, 'In der Mitte wird es schwer. Du sagst dir: nur bis zur nächsten Kurve.', 5, 'Letzte Runde. Du ziehst an.', 5,
    'Du läufst durchs Ziel. Du hast alles gegeben.', 5, 'Öffne die Augen. Genau so wirst du es machen.'] },
  { id: 'marsch', cat: 'Szenario', title: 'Marsch, Kilometer 17', min: 4, parts: [
    'Stell dir vor: 20 Kilometer Marsch mit 20 Kilo Gepäck. Du bist bei Kilometer 17.', 4,
    'Deine Schultern brennen. An der linken Ferse spürst du eine Blase.', 4, 'Es regnet seit einer Stunde.', 4,
    'Dein Kopf sagt: Das schaffst du nicht. Noch drei Kilometer, das ist zu weit.', 4,
    'Atme. Vier Sekunden ein. Vier Sekunden halten. Vier aus. Vier halten.', 16,
    'Jetzt teil die Strecke. Nicht drei Kilometer. Nur bis zum nächsten Baum.', 5, 'Geschafft. Nächster Baum.', 5,
    'Langer Schritt. Rhythmus. Links, rechts.', 5, 'Sag dir einen Satz, der dich trägt. Zum Beispiel: Ich bin gebaut für das hier.', 6,
    'Die Blase ist ein Problem für die Pause, nicht für jetzt. In der nächsten Pause: Socke wechseln, abkleben.', 5,
    'Nur bis zum nächsten Baum.', 4, 'Genau so kommst du ins Ziel.'] },
  { id: 'wasser', cat: 'Szenario', title: 'Kaltes Wasser', min: 4, parts: [
    'Du stehst im Kampfanzug am Beckenrand. 200 Meter Kleiderschwimmen.', 4,
    'Du springst. Das Wasser ist kalt. Dein Atem wird schnell und flach.', 4,
    'Das ist der Kälteschock. Er geht vorbei. Du musst nichts tun außer atmen.', 4,
    'Lang ausatmen. Länger als einatmen.', 6, 'Noch einmal. Lang aus.', 6,
    'Jetzt der erste Zug. Ruhig. Brust. Gleitphase.', 5, 'Die Kleidung zieht. Das ist normal. Du kämpfst nicht gegen das Wasser.', 5,
    'Zähl die Züge. Eins. Zwei. Drei.', 6, 'Am Ende: Entkleiden im Wasser. Ruhig. Erst Stiefel, dann Hose. Ein Schritt nach dem anderen.', 5,
    'Ruhe im Wasser ist Training. Du wirst sie haben.'] },
  { id: 'nacht', cat: 'Szenario', title: 'Nacht, Tag drei, kaum Schlaf', min: 4, parts: [
    'Tag drei. Du hast in drei Nächten vielleicht sechs Stunden geschlafen.', 4, 'Du bekommst eine Karte, einen Kompass und einen Zielpunkt. Es ist dunkel.', 4,
    'Müdigkeit macht Fehler. Deshalb: langsamer denken, nicht schneller.', 4,
    'Erster Schritt: Wo bin ich? Karte einnorden. Standort bestimmen.', 5, 'Zweiter Schritt: Marschzahl nehmen. Laut wiederholen.', 5,
    'Dritter Schritt: Auffanglinie festlegen. Wenn ich den Bach erreiche, bin ich zu weit.', 5,
    'Schrittzählen. Hundert Meter. Kontrolle.', 5, 'Wenn du unsicher bist: anhalten, prüfen, dann weiter. Das kostet eine Minute. Verlaufen kostet eine Stunde.', 5,
    'Ruhig. Methodisch. Genau so.'] },
  { id: 'fehler', cat: 'Szenario', title: 'Der Fehler', min: 3, parts: [
    'Du hast einen Fehler gemacht. Vor allen. Der Ausbilder hat es gesehen.', 4, 'Dein Gesicht wird heiß. Du willst dich rechtfertigen.', 4,
    'Stopp. Atme einmal tief.', 5, 'Melde den Fehler klar und kurz. Ohne Ausrede.', 3, 'Zum Beispiel: Fehler erkannt. Ich korrigiere.', 4,
    'Dann: nächste Aufgabe. Volle Konzentration.', 4, 'Im Auswahlverfahren zählt nicht, ob du Fehler machst. Es zählt, wie du danach handelst.', 4,
    'Analysieren kannst du am Abend. Jetzt: weiter.'] },
  { id: 'kamerad', cat: 'Szenario', title: 'Kamerad am Limit', min: 3, parts: [
    'Ihr tragt zu viert eine Trage. Einer im Team wird langsamer. Er ist am Ende.', 4, 'Du bist selbst müde. Der Gedanke kommt: Das ist nicht mein Problem.', 4,
    'Doch. Es ist dein Problem. Ihr seid ein Team.', 4, 'Sprich ihn an. Kurz und klar: Bleib bei mir. Noch zweihundert Meter.', 4,
    'Übernimm einen Teil seiner Last, wenn es erlaubt ist.', 4, 'Ausbilder achten genau darauf, wer an andere denkt, wenn es weh tut.', 4,
    'Kameradschaft ist keine Zugabe. Sie ist der Auftrag.'] },
  { id: 'abbruch', cat: 'Szenario', title: 'Der Abbruch-Gedanke', min: 3, parts: [
    'Irgendwann kommt der Gedanke: Ich höre auf.', 4, 'Das ist normal. Fast jeder hat ihn.', 3,
    'Regel eins: Du entscheidest nie im schlimmsten Moment.', 4, 'Sag dir: Ich entscheide in der nächsten Pause. Bis dahin mache ich weiter.', 5,
    'Regel zwei: Erinnere dich an dein Warum.', 3, 'Sag es dir einmal laut oder im Kopf.', 8,
    'Regel drei: Die nächste kleine Aufgabe. Nur die.', 4, 'Meistens ist der Gedanke in der nächsten Pause schon kleiner.', 4,
    'Der Wille entscheidet.'] },
  { id: 'interview', cat: 'Szenario', title: 'Gespräch mit dem Psychologen', min: 3, parts: [
    'Du sitzt im Gespräch beim psychologischen Dienst.', 3, 'Die Frage: Warum wollen Sie das?', 4,
    'Du musst keine perfekte Antwort auswendig können. Du musst ehrlich sein.', 4, 'Sprich ruhig. Kurze Sätze. Schau dein Gegenüber an.', 4,
    'Wenn du etwas nicht weißt, sag es.', 3, 'Wenn du über Schwächen gefragt wirst: nenne eine echte und was du dagegen tust.', 5,
    'Dein Warum hast du jeden Sonntag gelesen. Es ist deins. Du kannst es erklären.', 4, 'Atme. Antworte.'] },
];

export const CHECKLISTE = [
  'Ärztliche Untersuchung mit Belastungs-EKG (KSK-Handbuch 3.2)',
  'Pulsuhr mit Brustgurt',
  'Zwei Paar Laufschuhe mit unterschiedlichem Profil',
  'Schlingentrainer (z. B. TRX)',
  'Faszienrolle',
  'Medizinball (ca. 5 kg)',
  'Schwimmbrille',
  'Marschstiefel eingelaufen',
  'Rucksack für Marschtraining (bis 20 kg)',
  'Karte 1:50.000 und Marschkompass besorgen',
  'Erste-Hilfe-Kurs besucht',
  'Rettungsschwimmabzeichen (DLRG) – optional, hilft beim Kleiderschwimmen',
  'Beratung Karrierecenter Bundeswehr / Bundespolizei',
  'Bewerbungsfristen und aktuelle Normen geprüft',
  'Urlaub/Freistellung vor dem Auswahlverfahren geklärt (EGB-Tipp)',
];
