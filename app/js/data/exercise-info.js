// Erklärungen und Quellen je Kraftübung.
// Felder: warum, wofuer, praxisbeispiele, quellePdf, quelleSeite, quelleBegruendung (Hauptfundstelle)
// und quellen (alle Fundstellen). Seite = Seite in der PDF-Datei. verwandt: true = Übung dort nicht identisch.
// Jede Fundstelle wurde im Text der PDF geprüft – keine erfundenen Quellen.

export const PDFS = {
  ksk: { datei: 'trainingshandbuch-fuer-bewerber-data.pdf', titel: 'Trainingshandbuch Bewerber KSK (Heer)', kurz: 'KSK-Handbuch' },
  tg: { datei: 'download-trainingsgestaltung-fuer-fortgeschrittene-data.pdf', titel: 'Trainingsgestaltung (Fortgeschritten)', kurz: 'Trainingsgestaltung' },
  nsw: { datei: 'naval-special-warfare-physical-training-guide.pdf', titel: 'Naval Special Warfare Physical Training Guide', kurz: 'NSW-Guide' },
  sf: { datei: 'sf-preparation-manual-2024.pdf', titel: 'SFAS Preparation Handbook 2024', kurz: 'SFAS-Handbuch', gedruckt: -11 },
};

// Seitenangabe für die Anzeige: PDF-Seite, bei abweichender Druck-Seitenzahl beides
export const seitenText = (pdf, seite) => (PDFS[pdf].gedruckt ? `PDF-Seite ${seite} (gedruckt S. ${seite + PDFS[pdf].gedruckt})` : `Seite ${seite}`);

// Bildpfad der gerenderten PDF-Seite (tools/render-pdf-pages.mjs)
export const seitenBild = (pdf, seite) => `pdfseiten/${pdf}-s${String(seite).padStart(2, '0')}.jpg`;

const Q = (pdf, seite, begruendung, verwandt = false) => ({ pdf, seite, begruendung, verwandt });

export const EXERCISE_INFO = {
  klimmzug: {
    warum: 'Mindestens 7 saubere Klimmzüge sind Pflicht im KSK-PFV – für die Top 0,1 % brauchst du 20. Zugkraft entscheidet auch beim Überwinden von Hindernissen und Mauern.',
    wofuer: 'Breiter Rückenmuskel, Bizeps, Unterarme und Griff, Rumpfspannung. Relative Kraft im Verhältnis zum Körpergewicht.',
    praxisbeispiele: ['Über eine Mauer oder auf ein Hindernis ziehen', 'Am Seil oder an der Leiter hochziehen', 'Kamerad über eine Kante ziehen'],
    quellen: [
      Q('ksk', 12, 'Der 7D-Test (Disziplin 4) beschreibt genau die Testausführung: Ristgriff, ausgehängt, Kinn über die Stange, 90 Sekunden. Deshalb die Hauptquelle.'),
      Q('ksk', 7, 'Die PFV-Anforderung „mindestens 7 Klimmzüge im Ristgriff, ausgehängt“ steht hier.'),
      Q('nsw', 5, 'Ausführung für den PST und die Progressionstabelle (Sätze/Wiederholungen nach Maximalwert), die der Plan nutzt.'),
      Q('tg', 1, 'Teil des Ganzkörper-Plans („Latzug/Klimmzüge“).'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
    ],
  },
  liegestuetz: {
    warum: 'Im KSK-PFV sind mindestens 22 Liegestütze in 30 Sekunden gefordert. Druckkraft und Rumpfspannung brauchst du bei jedem Stellungswechsel.',
    wofuer: 'Brust, vordere Schulter, Trizeps und Rumpf. Kraftausdauer ohne Gerät – überall trainierbar.',
    praxisbeispiele: ['Schnell aus der Bauchlage aufspringen', 'Sich unter Gepäck vom Boden hochdrücken', 'Ausbilder-„Strafrunden“ ohne Einbruch durchstehen'],
    quellen: [
      Q('nsw', 4, 'Genaueste Beschreibung der sauberen Ausführung (Körper als Einheit, Ellbogen 90°) plus Varianten. Deshalb Hauptquelle.'),
      Q('ksk', 7, 'PFV-Anforderung: mindestens 22 Liegestütze in 30 Sekunden.'),
      Q('ksk', 23, '„Liegestütz mit Variationen“ als Trainingsmittel mit dem eigenen Körpergewicht.'),
      Q('ksk', 50, 'Liegestütz als Teil der Rumpfstabilisation im Übungskatalog.'),
    ],
  },
  situp: {
    warum: 'Im KSK-PFV mindestens 20 Sit-ups in 30 Sekunden. Ein starker Rumpf schützt den Rücken beim Marschieren mit Gepäck.',
    wofuer: 'Gerade und schräge Bauchmuskeln, Hüftbeuger, Rumpfstabilität.',
    praxisbeispiele: ['Aus der Rückenlage schnell in die Sitz- und Schussposition', 'Rucksack aufnehmen und schultern', 'Stabiler Rumpf beim Tragen eines Verwundeten'],
    quellen: [
      Q('nsw', 4, 'Beschreibt die Testausführung (Knie gebeugt, Arme vor der Brust, Ellbogen an die Oberschenkel). Deshalb Hauptquelle.'),
      Q('ksk', 7, 'PFV-Anforderung: mindestens 20 Bauchaufzüge (Sit-ups) in 30 Sekunden.'),
    ],
  },
  kniebeuge: {
    warum: 'Beinkraft trägt dich durch 20 km Marsch mit 20 kg und den Verwundetentransport. Der EGB-Report nennt 1,5–2× Körpergewicht in den Grundübungen als Ziel.',
    wofuer: 'Oberschenkel vorn und hinten, Gesäß, Rumpf. Grundkraft für Sprung, Sprint und Tragen.',
    praxisbeispiele: ['Mit schwerem Rucksack aus der Hocke aufstehen', 'Bergauf mit Gepäck marschieren', 'Kamerad zum Tragen über die Schultern nehmen'],
    quellen: [
      Q('ksk', 35, 'Ausführliche Technikbeschreibung im Übungskatalog (Langhantel, Fußstellung 30°, Oberschenkel waagerecht). Deshalb Hauptquelle.'),
      Q('tg', 1, '„Kniebeuge mit Gewicht“ im Ganzkörperplan mit Schwerpunkt Beine (4×25).'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
      Q('nsw', 6, 'Unter den empfohlenen Übungen für den Unterkörper („leg press or squats“).'),
    ],
  },
  ausfallschritt: {
    warum: 'Jeder Schritt im Gelände ist ein einbeiniger Kraftakt. Ausfallschritte machen Knie und Hüfte stabil für lange Märsche.',
    wofuer: 'Oberschenkel, Gesäß, Gleichgewicht und Stabilität der Kniegelenke – jede Seite einzeln.',
    praxisbeispiele: ['Steiler Abstieg mit Gepäck', 'Über Hindernisse steigen', 'Aus dem Knien schnell aufstehen'],
    quellen: [
      Q('tg', 1, 'Genau so benannt („Ausfallschritte mit Gewicht“) im Ganzkörperplan Beine. Deshalb Hauptquelle.'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
      Q('ksk', 52, 'Technikbeschreibung im Übungskatalog (hinteres Knie Richtung Boden).'),
      Q('nsw', 6, '„Lunges“ unter den Übungen für den Unterkörper.'),
    ],
  },
  kreuzheben: {
    warum: 'Schwere Lasten sicher vom Boden heben – Munitionskisten, Ausrüstung, Kameraden. Das SFAS-Handbuch setzt im Kreuzheben ein hohes Zielniveau.',
    wofuer: 'Gesamte Rückseite: Rückenstrecker, Gesäß, Beinbeuger, dazu Griff. Grundübung für Maximalkraft.',
    praxisbeispiele: ['Verwundeten vom Boden aufnehmen', 'Schwere Kisten verladen', 'Rucksack mit 30 kg sicher aufnehmen'],
    quellen: [
      Q('ksk', 34, 'Technikbeschreibung im Übungskatalog (Mittelfuß unter der Stange, Rücken gerade). Deshalb Hauptquelle.'),
      Q('nsw', 6, '„Dead lifts“ unter den Übungen für den Unterkörper.'),
      Q('sf', 13, 'Zielwert im Kreuzheben (ACFT, 90 Punkte) als Maßstab erfolgreicher Bewerber.'),
    ],
  },
  bankdruecken: {
    warum: 'Teil des KSK-7D-Tests (Bankdrücken mit 75 % des Körpergewichts). Druckkraft brauchst du im Nahkampf und beim Wegdrücken schwerer Lasten.',
    wofuer: 'Brust, vordere Schulter, Trizeps. Maximalkraft und Kraftausdauer im Oberkörper.',
    praxisbeispiele: ['Gegner im Nahkampf wegdrücken', 'Schwere Tür oder Trümmer wegstemmen', 'Sich aus der Bauchlage mit Gepäck hochdrücken'],
    quellen: [
      Q('ksk', 34, 'Technikbeschreibung im Übungskatalog (leichter Brustkontakt, Füße fest). Deshalb Hauptquelle.'),
      Q('ksk', 12, '7D-Test Disziplin 3: Bankdrücken mit 75 % Körpergewicht, Wertung nach Wiederholungen.'),
      Q('tg', 1, 'Fester Bestandteil des Ganzkörperplans.'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
      Q('nsw', 6, '„Bench press or incline press“ unter den Übungen für den Oberkörper.'),
    ],
  },
  latzug: {
    warum: 'Baut die Zugkraft für Klimmzüge auf, auch wenn du noch nicht viele schaffst – mit einstellbarem Gewicht.',
    wofuer: 'Breiter Rückenmuskel, hinterer Schultergürtel, Bizeps. Schulterblätter kontrolliert nach unten führen.',
    praxisbeispiele: ['Vorbereitung auf mehr Klimmzüge', 'Am Seil hochziehen', 'Schulterstabilität beim Schwimmen'],
    quellen: [
      Q('tg', 1, '„Latzug/Klimmzüge“ als Übung im Ganzkörperplan. Deshalb Hauptquelle.'),
      Q('nsw', 6, '„Lat pull-downs“ unter den Übungen für den Oberkörper.'),
    ],
  },
  rudern: {
    warum: 'Gegengewicht zu Bankdrücken und Liegestützen – schützt die Schultern und stärkt den oberen Rücken für das Tragen von Gepäck.',
    wofuer: 'Oberer Rücken, hintere Schulter, Bizeps, Rumpfspannung im vorgebeugten Stand.',
    praxisbeispiele: ['Boot oder Schlauchboot paddeln (Kampfschwimmer)', 'Last an sich heranziehen', 'Aufrechte Haltung unter dem Rucksack'],
    quellen: [
      Q('ksk', 35, 'Beschreibung „Langhantelrudern“ im Übungskatalog (45° vorgebeugt, Zug zum Bauchnabel). Deshalb Hauptquelle.'),
      Q('tg', 2, '„Rudern eng/breit“ im Ganzkörperplan Brust und Rücken.'),
      Q('nsw', 6, '„Seated row pull“ unter den Übungen für den Oberkörper.'),
    ],
  },
  schulterdruecken: {
    warum: 'Lasten über Kopf heben und halten – Ausrüstung verladen, Rucksack hochstemmen, Boot tragen. Starke Schultern verletzen sich seltener.',
    wofuer: 'Schultermuskulatur, Trizeps, oberer Rücken und Rumpf als Stütze.',
    praxisbeispiele: ['Ausrüstung auf einen Lkw heben', 'Boot oder Trage über Kopf tragen', 'Rucksack über eine Mauer reichen'],
    quellen: [
      Q('ksk', 36, 'Beschreibung „Schulterdrücken im Sitzen“ im Übungskatalog. Deshalb Hauptquelle.'),
      Q('tg', 1, 'Teil des Ganzkörperplans.'),
      Q('tg', 5, 'Abbildung „Schulterdrücken KH“ in der Übungsübersicht.'),
      Q('nsw', 6, '„Shoulder (military) press“ unter den Übungen für den Oberkörper.'),
    ],
  },
  hyperextension: {
    warum: 'Ein starker unterer Rücken ist die beste Versicherung gegen Rückenschmerzen beim Marschieren mit Gepäck.',
    wofuer: 'Rückenstrecker, Gesäß, Beinbeuger. Haltung und Stabilität der Lendenwirbelsäule.',
    praxisbeispiele: ['Stundenlang Rucksack tragen ohne Kreuzschmerzen', 'Sicheres Heben vom Boden', 'Aufrecht bleiben in der Liegendposition'],
    quellen: [
      Q('tg', 1, 'Fester Bestandteil aller drei Ganzkörperpläne. Deshalb Hauptquelle.'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
      Q('nsw', 6, '„Back hyperextension“ unter den Übungen für den Unterkörper.'),
    ],
  },
  bizeps: {
    warum: 'Ergänzung für Zugkraft und Ellbogengesundheit – kleiner Baustein, nicht Schwerpunkt.',
    wofuer: 'Bizeps und Unterarm, unterstützt Klimmzüge und Griff.',
    praxisbeispiele: ['Lasten mit gebeugten Armen tragen', 'Mehr Klimmzüge durch stärkere Arme', 'Kisten anheben und halten'],
    quellen: [
      Q('tg', 1, '„Bizeps Curls“ im Ganzkörperplan. Deshalb Hauptquelle.'),
      Q('tg', 5, 'Abbildung „Bizeps Curls Kabelzug“ in der Übungsübersicht.'),
      Q('nsw', 6, '„Biceps curl“ unter den Übungen für den Oberkörper.'),
    ],
  },
  trizeps: {
    warum: 'Kräftiger Trizeps bringt mehr Liegestütze und stabile Ellbogen beim Drücken.',
    wofuer: 'Trizeps (Armstrecker), Ellbogenstabilität.',
    praxisbeispiele: ['Mehr Liegestütze im Test', 'Sich aus dem Wasser auf einen Steg drücken', 'Lasten von sich wegdrücken'],
    quellen: [
      Q('tg', 1, 'Genau so benannt („Trizeps Kabelzug“) im Ganzkörperplan. Deshalb Hauptquelle.'),
      Q('tg', 5, 'Abbildung in der Übungsübersicht.'),
      Q('nsw', 6, '„Triceps extension“ unter den Übungen für den Oberkörper.'),
      Q('ksk', 38, 'Trizeps mit der Kurzhantel – andere Variante derselben Übungsgruppe.', true),
    ],
  },
  butterfly: {
    warum: 'Ergänzt das Bankdrücken mit kontrollierter Bewegung – gut für Brust und gesunde Schultern.',
    wofuer: 'Brustmuskulatur, vordere Schulter, Schulterstabilität.',
    praxisbeispiele: ['Arme vor dem Körper zusammenführen (Klammern im Nahkampf)', 'Schwere Gegenstände vor der Brust halten'],
    quellen: [
      Q('tg', 5, 'Genau so benannt („Butterfly/Brustpresse“) mit Abbildung. Deshalb Hauptquelle.'),
      Q('tg', 2, 'Teil des Ganzkörperplans mit Schwerpunkt Brust.'),
      Q('ksk', 40, '„Butterfly mit Kurzhantel“ – Hantel-Variante im Übungskatalog.', true),
    ],
  },
  dips: {
    warum: 'Sich aus dem Stütz hochdrücken – über Mauern, aus dem Wasser auf ein Boot oder einen Steg.',
    wofuer: 'Trizeps, Brust, vordere Schulter. Relative Kraft mit dem eigenen Körpergewicht.',
    praxisbeispiele: ['Über eine Mauer stemmen', 'Aus dem Wasser auf ein Boot oder einen Steg drücken (Kampfschwimmer)', 'Durch ein Fenster einsteigen'],
    quellen: [
      Q('ksk', 23, '„Dips“ als Trainingsmittel mit dem eigenen Körpergewicht. Deshalb Hauptquelle.'),
      Q('nsw', 6, '„Triceps extension or dips“ unter den Übungen für den Oberkörper.'),
    ],
  },
  plank: {
    warum: 'Rumpfstabilität schützt den Rücken unter Gepäck und überträgt Kraft in jeder Bewegung – im Plan als Unterarmstütz 45–90 s.',
    wofuer: 'Tiefe Bauch- und Rückenmuskeln, Schultergürtel, Spannung von Kopf bis Fuß.',
    praxisbeispiele: ['Stabiler Anschlag in der Liegendposition', 'Rucksack tragen ohne Hohlkreuz', 'Kriechen und Robben'],
    quellen: [
      Q('ksk', 51, 'Beschreibung „Plank“ im Übungskatalog (Unterarme schulterbreit, Körper gerade). Deshalb Hauptquelle.'),
      Q('tg', 1, '„Unterarmstütz 45–90 Sek. halten“ im Ganzkörperplan.'),
      Q('nsw', 6, 'Plank mit Ausführung und Varianten im Rumpfprogramm.'),
    ],
  },
  burpee: {
    warum: 'Jump-Over-Burpees sind Teil des KSK-7D-Tests. Runter auf den Boden und wieder hoch – das passiert im Gelände ständig.',
    wofuer: 'Ganzkörper-Kraftausdauer, Herz-Kreislauf, Explosivkraft und Koordination.',
    praxisbeispiele: ['Schnell in Deckung und wieder auf', 'Hindernisbahn mit vielen Bodenwechseln', 'Belastung unter Zeitdruck'],
    quellen: [
      Q('ksk', 53, 'Beschreibung „Burpee“ im Übungskatalog. Deshalb Hauptquelle.'),
      Q('ksk', 12, '7D-Test Disziplin 5: Jump-Over-Burpees in 90 Sekunden.'),
      Q('ksk', 42, '„Jump over Burpees“ mit kleinem Kasten im Übungskatalog.'),
    ],
  },
  wadendruecken: {
    warum: 'Starke Waden und Achillessehnen sind Verletzungsschutz für lange Märsche und Läufe.',
    wofuer: 'Wadenmuskulatur, Achillessehne, Sprunggelenkstabilität.',
    praxisbeispiele: ['Viele Kilometer in Stiefeln marschieren', 'Bergauf laufen', 'Schnelle Antritte'],
    quellen: [
      Q('ksk', 39, 'Beschreibung „Wadendrücken“ mit Kurzhanteln im Übungskatalog. Deshalb Hauptquelle.'),
      Q('nsw', 6, '„Heel raises“ unter den Übungen für den Unterkörper.'),
    ],
  },
  farmers: {
    warum: 'Das SFAS-Handbuch nennt Farmer’s Carry ausdrücklich als Standard: 50-lb-Hanteln über 100 m (Ziel 200 m). Tragen ist Kernarbeit in Auswahl und Ausbildung.',
    wofuer: 'Griffkraft, Trapez, Rumpf, Beine – Ganzkörper unter Last.',
    praxisbeispiele: ['Munitionskisten oder Kanister tragen', 'Trage mit Verwundetem tragen', 'Schweres Werkzeug zum Einsatzort bringen (Breacher)'],
    quellen: [
      Q('sf', 13, 'Standards: Farmer’s Carry mit 50-lb-Hanteln, Minimum 100 m, Ziel 200 m. Deshalb Hauptquelle.'),
      Q('sf', 25, 'Behelfsmäßige Durchführung mit zwei gefüllten Seesäcken oder Sandsäcken.'),
    ],
  },
  rucksack_kniebeuge: {
    warum: 'Wenn kein Studio da ist, wird der Rucksack zur Hantel – und du trainierst genau mit der Last, die du später trägst.',
    wofuer: 'Oberschenkel, Gesäß, Rumpf – wie die Langhantel-Kniebeuge.',
    praxisbeispiele: ['Training auf Montage oder im Feld', 'Mit Gepäck aus der Hocke hochkommen', 'Bergauf mit Rucksack'],
    quellen: [
      Q('sf', 25, 'Behelfsausrüstung: Kniebeuge mit gefülltem Seesack auf der Schulter. Deshalb Hauptquelle.'),
      Q('ksk', 35, 'Technik der Kniebeuge (gilt auch mit Rucksack).', true),
    ],
  },
  bulgarian: {
    warum: 'Einbeinige Beinkraft ohne Hantel – im SFAS-Plan fester Bestandteil der Zusatzzirkel.',
    wofuer: 'Oberschenkel, Gesäß, Knie- und Hüftstabilität, Gleichgewicht.',
    praxisbeispiele: ['Über Hindernisse steigen', 'Steile Hänge hoch', 'Einseitige Belastung beim Tragen ausgleichen'],
    quellen: [
      Q('sf', 27, '„FFE Split Squat“ (vorderer Fuß erhöht) mit zwei Kanistern als Gewicht in den Zusatzzirkeln. Deshalb Hauptquelle.'),
    ],
  },
  rucksack_kreuzheben: {
    warum: 'Heben vom Boden mit Behelfsgewicht – genau die Bewegung, mit der du später Rucksack und Ausrüstung aufnimmst.',
    wofuer: 'Rückseite des Körpers, Griff, Rumpf.',
    praxisbeispiele: ['Rucksack sicher vom Boden aufnehmen', 'Kisten heben ohne Rückenschmerzen', 'Training ohne Studio'],
    quellen: [
      Q('sf', 25, 'Behelfsausrüstung: Kreuzheben mit gefülltem Seesack am Boden. Deshalb Hauptquelle.'),
      Q('ksk', 34, 'Technik des Kreuzhebens (gilt auch mit Rucksack).', true),
    ],
  },
  glute_bridge: {
    warum: 'Starke Gesäßmuskeln entlasten Knie und Rücken beim Marschieren – Verletzungsprophylaxe aus dem SFAS-Handbuch.',
    wofuer: 'Gesäß, Beinbeuger, Rumpfstabilität, Beckenkontrolle.',
    praxisbeispiele: ['Stabile Hüfte unter Gepäck', 'Kraft beim Bergaufgehen', 'Weniger Knieprobleme auf langen Märschen'],
    quellen: [
      Q('sf', 22, '„Single Leg Bridge Hold“ als Korrekturübung für Hüfte und Gesäß. Deshalb Hauptquelle.'),
      Q('nsw', 6, '„Bridge“ mit abwechselndem Bein im Rumpfprogramm.'),
      Q('sf', 27, '„DB Glute bridge“ in den Zusatzzirkeln.'),
    ],
  },
  tischrudern: {
    warum: 'Zugtraining ohne Gerät – mit Tisch, Ast oder Schlingentrainer. So bleibt die Zugkraft für Klimmzüge auch auf Montage erhalten.',
    wofuer: 'Oberer Rücken, hintere Schulter, Bizeps, Körperspannung.',
    praxisbeispiele: ['Training im Feld an einem Ast', 'Vorbereitung auf Klimmzüge', 'Sich an einer Kante heranziehen'],
    quellen: [
      Q('sf', 25, '„TRX or inverted row“ mit Seil an einem starken Ast – behelfsmäßiges Rudern. Deshalb Hauptquelle.'),
      Q('ksk', 45, '„Rudern“ im Schlingentrainer mit Technikbeschreibung.'),
    ],
  },
  rucksack_rudern: {
    warum: 'Rudern ohne Hantel – mit Seesack oder Rucksack als Gewicht.',
    wofuer: 'Oberer Rücken, hintere Schulter, Bizeps.',
    praxisbeispiele: ['Training ohne Studio', 'Aufrechte Haltung unter Gepäck', 'Lasten heranziehen'],
    quellen: [
      Q('sf', 49, 'Behelfsausrüstung: „Row“ mit Kanistern oder Seesack. Deshalb Hauptquelle.'),
      Q('ksk', 35, 'Technik des Langhantelruderns (gilt auch mit Rucksack).', true),
    ],
  },
  pike: {
    warum: 'Über-Kopf-Drücken ohne Studio – das SFAS-Handbuch nutzt dafür Sandsack oder Seesack.',
    wofuer: 'Schultern, Trizeps, Rumpf als Stütze.',
    praxisbeispiele: ['Rucksack auf einen Lkw heben', 'Boot über Kopf tragen', 'Training auf Montage'],
    quellen: [
      Q('sf', 27, '„Overhead press choice“ mit Sandsack, Kanister oder Seesack. Deshalb Hauptquelle.'),
      Q('ksk', 36, 'Technik des Schulterdrückens (gilt auch mit Rucksack).', true),
    ],
  },
  diamant: {
    warum: 'Enge Liegestütze verschieben die Arbeit auf den Trizeps – bringt mehr Wiederholungen im Liegestütz-Test.',
    wofuer: 'Trizeps, innere Brust, vordere Schulter, Rumpf.',
    praxisbeispiele: ['Mehr Liegestütze im Test', 'Ersatz für Trizepsübungen ohne Studio', 'Sich aus engen Positionen hochdrücken'],
    quellen: [
      Q('nsw', 4, 'Als Variante genannt: „narrow (triceps)“ – enge Liegestütze. Deshalb Hauptquelle.'),
    ],
  },
  rucksack_curl: {
    warum: 'Bizeps-Training ohne Studio mit Rucksack oder Kanister – kleiner Ergänzungsbaustein.',
    wofuer: 'Bizeps, Unterarm, Griff.',
    praxisbeispiele: ['Kanister oder Kisten tragen', 'Training auf Montage'],
    quellen: [
      Q('tg', 1, 'Bizeps Curls stehen hier am Gerät – hier mit Rucksack als Ersatzgewicht.', true),
      Q('tg', 5, 'Abbildung „Bizeps Curls Kabelzug“ – gleiche Bewegung, anderes Gerät.', true),
    ],
  },
  liegestuetz_erhoeht: {
    warum: 'Erhöhte Füße machen Liegestütze schwerer – Fortschritt ohne Gewicht, wenn normale Liegestütze zu leicht werden.',
    wofuer: 'Obere Brust, Schultern, Trizeps, Rumpf.',
    praxisbeispiele: ['Ersatz für Bankdrücken ohne Studio', 'Mehr Druckkraft für den Test', 'Training im Feld'],
    quellen: [
      Q('nsw', 4, 'Als Variante genannt: Füße auf eine Erhöhung, etwas höher als die Hände. Deshalb Hauptquelle.'),
      Q('ksk', 44, '„Liegestütz: Füße in den Griffen“ im Schlingentrainer – verwandte, noch instabilere Variante.', true),
    ],
  },
};

// Erweitert die Übungsobjekte um die Felder des Datenmodells
export function enrichExercise(ex) {
  const info = EXERCISE_INFO[ex.id];
  if (!info) return ex;
  const main = info.quellen[0];
  return Object.assign(ex, {
    warum: info.warum, wofuer: info.wofuer, praxisbeispiele: info.praxisbeispiele,
    quellePdf: PDFS[main.pdf].datei, quelleSeite: main.seite, quelleBegruendung: main.begruendung,
    quellen: info.quellen.map((q) => ({ ...q, datei: PDFS[q.pdf].datei, titel: PDFS[q.pdf].titel, kurz: PDFS[q.pdf].kurz, seitenText: seitenText(q.pdf, q.seite), bild: seitenBild(q.pdf, q.seite) })),
  });
}
