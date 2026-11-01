// Wissenskurse „Nach dem Auswahlverfahren“: Grundlagen-Niveau, nur öffentlich zugängliches Wissen.
// Sicherheit steht in jeder Lektion zuerst. Kein Ersatz für Ausbildung, Vorschriften oder Ausbilder.
// Bewusst NICHT enthalten: Bau oder Mengen von Sprengladungen, Bedienanleitungen für bestimmte Waffen.

export const SAFETY = 'Sicherheit zuerst: Jede Waffe gilt als geladen · Mündung nur in sichere Richtung · Finger gerade am Abzugsbügel, bis der Schussentschluss gefasst ist · Ziel, Hinter- und Umfeld eindeutig erkennen. Umgang nur in der Ausbildung unter Aufsicht.';

export const QUELLEN = {
  bw: ['Bundeswehr', 'https://www.bundeswehr.de'],
  bwk: ['Bundeswehr Karriere', 'https://www.bundeswehrkarriere.de'],
  bwyt: ['Bundeswehr auf YouTube', 'https://www.youtube.com/@bundeswehr'],
  bpol: ['Bundespolizei', 'https://www.bundespolizei.de'],
  bpolk: ['Bundespolizei Karriere', 'https://www.komm-zur-bundespolizei.de'],
  armypubs: ['US Army Publishing (TC 3-22.9 Gewehr, TC 3-22.10 Scharfschützen – öffentlich freigegeben)', 'https://armypubs.army.mil'],
  dguv: ['DGUV: Gehörschutz und Augenschutz', 'https://www.dguv.de'],
};

export const AV_COURSES = [
  {
    id: 'sicherheit', title: 'Sicherheit & Grundbegriffe', badge: 'av_sicherheit', links: ['bwyt', 'armypubs'],
    lessons: [
      { title: 'Die vier Grundregeln', visual: 'regeln', cards: [
        SAFETY,
        'Regel 1: Jede Waffe wird behandelt, als wäre sie geladen – auch wenn du sie gerade selbst entladen hast.',
        'Regel 2: Die Mündung zeigt nie auf etwas, das nicht getroffen werden darf. Das gilt auch beim Tragen, Übergeben und Reinigen.',
        'Regel 3: Der Finger liegt gestreckt außen am Abzugsbügel, bis der Entschluss zum Schuss gefasst ist.',
        'Regel 4: Ziel und Umfeld erkennen – was liegt dahinter und daneben? Geschosse können durchschlagen und abprallen.',
        'Die Regeln wirken zusammen: Wird eine verletzt, verhindern die anderen den Unfall. Deshalb gelten immer alle vier.'],
        quiz: [
          { q: 'Du hast die Waffe eben selbst entladen. Wie behandelst du sie?', a: ['Als ungeladen', 'Als wäre sie geladen', 'Je nach Lage'], ok: 1, why: 'Regel 1 gilt ausnahmslos.' },
          { q: 'Wo liegt der Finger, solange kein Schussentschluss gefasst ist?', a: ['Am Abzug', 'Gestreckt außen am Abzugsbügel', 'Am Magazinhalter'], ok: 1, why: 'So wird ein unbeabsichtigter Schuss verhindert.' },
          { q: 'Warum gelten immer alle vier Regeln gleichzeitig?', a: ['Weil es so in der Vorschrift steht', 'Weil die anderen einen Fehler bei einer Regel auffangen', 'Gilt nur auf der Schießbahn'], ok: 1, why: 'Mehrfache Sicherung: Ein Fehler allein führt so nicht zum Unfall.' },
        ] },
      { title: 'Begriffe: Patrone, Kaliber, Lauf', visual: 'patrone', cards: [
        SAFETY,
        'Patrone = Hülse + Treibladung (Pulver) + Zündhütchen + Geschoss. Das Geschoss verlässt den Lauf, die Hülse bleibt bzw. wird ausgeworfen.',
        'Kaliber beschreibt den Durchmesser von Lauf bzw. Geschoss, z. B. 5,56 mm oder 7,62 mm. Nur die für die Waffe vorgeschriebene Munition verwenden.',
        'Lauf mit Zügen und Feldern: Die Züge geben dem Geschoss Drall, dadurch fliegt es stabil.',
        'Patronenlager: hier liegt die Patrone beim Schuss. Verschluss: schließt das Patronenlager nach hinten ab.'],
        quiz: [
          { q: 'Was gehört NICHT zur Patrone?', a: ['Zündhütchen', 'Verschluss', 'Hülse', 'Geschoss'], ok: 1, why: 'Der Verschluss ist Teil der Waffe.' },
          { q: 'Wofür sorgen die Züge im Lauf?', a: ['Für mehr Pulver', 'Für den Drall und damit stabilen Flug', 'Für den Rückstoß'], ok: 1, why: 'Drall stabilisiert das Geschoss.' },
          { q: 'Welche Munition verwendest du?', a: ['Was passt', 'Nur die für die Waffe vorgeschriebene', 'Die mit dem größten Geschoss'], ok: 1, why: 'Falsche Munition kann Waffe und Schützen gefährden.' },
        ] },
    ],
    exam: [
      { q: 'Ein Kamerad übergibt dir eine Waffe und sagt „ist leer“. Was tust du?', a: ['Glauben', 'Trotzdem als geladen behandeln und nach Vorschrift selbst prüfen', 'Abzug testen'], ok: 1, why: 'Regel 1 und Sicherheitsüberprüfung nach Vorschrift.' },
    ],
  },
  {
    id: 'magazin', title: 'Magazin: Aufbau & Handhabung', badge: 'av_magazin', links: ['armypubs', 'bwyt'],
    lessons: [
      { title: 'Aufbau eines Kastenmagazins', visual: 'magazin', cards: [
        SAFETY,
        'Ein Kastenmagazin besteht aus: Magazingehäuse, Magazinlippen oben, Zubringer, Zubringerfeder und Magazinboden mit Bodenplatte.',
        'Die Lippen halten die oberste Patrone und führen sie dem Verschluss zu. Verbogene Lippen sind eine häufige Ursache für Zuführstörungen.',
        'Der Zubringer liegt unter der untersten Patrone. Die Feder drückt ihn und damit den ganzen Patronenstapel nach oben.',
        'Viele Magazine haben Sichtfenster oder sind durchscheinend – so lässt sich der Füllstand kontrollieren.'],
        quiz: [
          { q: 'Welches Teil führt die Patrone dem Verschluss zu?', a: ['Bodenplatte', 'Magazinlippen', 'Feder'], ok: 1, why: 'Die Lippen halten und führen die oberste Patrone.' },
          { q: 'Was drückt die Patronen nach oben?', a: ['Der Zubringer über die Zubringerfeder', 'Die Schwerkraft', 'Der Verschluss'], ok: 0, why: 'Feder → Zubringer → Patronenstapel.' },
          { q: 'Häufige Ursache für Zuführstörungen?', a: ['Zu sauberes Magazin', 'Verbogene Lippen oder Schmutz', 'Zu wenig Patronen'], ok: 1, why: 'Beschädigte Lippen führen die Patrone falsch.' },
        ] },
      { title: 'Füllen & Kontrolle', visual: 'magazinFill', cards: [
        SAFETY,
        'Gefüllt wird nur am dafür vorgesehenen Ort und nach Anweisung – Mündung jeder Waffe in sicherer Richtung.',
        'Prinzip: Patrone einzeln von oben auf den Stapel drücken und unter die Lippen nach hinten schieben. Der Patronenboden zeigt zur Rückseite des Magazins.',
        'Mit jeder Patrone wird die Feder stärker zusammengedrückt – die letzten gehen schwerer. Nie über die zulässige Kapazität füllen.',
        'Kontrolle: liegen alle Patronen gerade, Boden hinten? Füllstand über Sichtfenster prüfen. Beschädigte oder verschmutzte Patronen aussortieren.'],
        quiz: [
          { q: 'Wohin zeigt der Patronenboden beim Füllen?', a: ['Nach vorn', 'Zur Rückseite des Magazins', 'Egal'], ok: 1, why: 'Das Geschoss zeigt in Schussrichtung.' },
          { q: 'Warum gehen die letzten Patronen schwerer?', a: ['Die Feder ist stärker zusammengedrückt', 'Das Magazin ist defekt', 'Die Patronen sind größer'], ok: 0, why: 'Federkraft steigt mit dem Füllstand.' },
          { q: 'Darf man über die Kapazität füllen?', a: ['Ja, eine mehr geht', 'Nein, nie', 'Nur im Einsatz'], ok: 1, why: 'Überfüllen führt zu Störungen und Schäden.' },
        ] },
      { title: 'Einsetzen, Wechseln, Pflege', visual: 'magazinInsert', cards: [
        SAFETY,
        'Einsetzen: Magazin gerade in den Magazinschacht, bis es hörbar einrastet. Danach Zugprobe: kurz daran ziehen – sitzt es fest?',
        'Entnehmen: Magazinhalter betätigen, Magazin herausnehmen. Ob noch eine Patrone im Patronenlager ist, prüft man getrennt nach Vorschrift.',
        'Wechsel: Grundsätzlich wird unterschieden zwischen schnellem Wechsel (leeres Magazin fallen lassen) und einem Wechsel mit Aufbewahren des Teilmagazins. Wann was gilt, regelt die Ausbildung.',
        'Pflege: sauber und trocken halten, Lippen auf Dellen prüfen, beschädigte Magazine aussondern. Viele Störungen beginnen beim Magazin.'],
        quiz: [
          { q: 'Was folgt nach dem Einsetzen?', a: ['Sofort schießen', 'Zugprobe: sitzt es fest?', 'Nichts'], ok: 1, why: 'Ein nicht eingerastetes Magazin fällt heraus oder führt nicht zu.' },
          { q: 'Ist die Waffe nach dem Entnehmen des Magazins sicher entladen?', a: ['Ja', 'Nein – Patronenlager getrennt prüfen', 'Nur bei leerem Magazin'], ok: 1, why: 'Im Patronenlager kann noch eine Patrone sein.' },
          { q: 'Ein Magazin hat verbogene Lippen. Was tun?', a: ['Weiter benutzen', 'Aussondern und melden', 'Zurückbiegen'], ok: 1, why: 'Beschädigte Magazine verursachen Störungen.' },
        ] },
    ],
    exam: [
      { q: 'Reihenfolge der Teile von oben nach unten?', a: ['Lippen – Patronen – Zubringer – Feder – Boden', 'Feder – Lippen – Boden – Zubringer', 'Boden – Lippen – Feder'], ok: 0, why: 'So ist ein Kastenmagazin aufgebaut.' },
      { q: 'Woran erkennst du schnell den Füllstand?', a: ['Am Gewicht allein', 'Sichtfenster oder durchscheinendes Gehäuse', 'Gar nicht'], ok: 1, why: 'Viele Magazine haben dafür Sichtfenster.' },
    ],
  },
  {
    id: 'optik', title: 'Optik & Absehen richtig ablesen', badge: 'av_optik', links: ['armypubs'],
    lessons: [
      { title: 'Grundbegriffe: MRAD und MOA', visual: 'absehen', cards: [
        SAFETY,
        'Ein Absehen (Strichplatte) hat Markierungen in Winkelmaß. Es gibt zwei Systeme: MRAD (Milliradiant, „Mil“) und MOA (Winkelminute).',
        '1 MRAD entspricht 10 cm auf 100 m, 1 m auf 1000 m. Das macht Rechnen einfach.',
        '1 MOA entspricht ca. 2,9 cm auf 100 m. 1 MRAD ≈ 3,44 MOA. Absehen und Verstelltürme sollten im selben System sein.',
        'Gemessen wird immer an den Markierungen: Strich zu Strich oder Punkt zu Punkt – je nach Absehen.'],
        quiz: [
          { q: '1 MRAD auf 100 m sind …', a: ['1 cm', '10 cm', '1 m'], ok: 1, why: '1/1000 der Entfernung: 100 m → 10 cm.' },
          { q: '1 MRAD auf 400 m sind …', a: ['4 cm', '40 cm', '4 m'], ok: 1, why: '400 m / 1000 = 0,4 m.' },
          { q: 'Wie viel ist 1 MOA auf 100 m ungefähr?', a: ['2,9 cm', '10 cm', '29 cm'], ok: 0, why: '1 MOA ≈ 2,9 cm auf 100 m.' },
        ] },
      { title: 'Entfernung schätzen mit dem Absehen', visual: 'absehen', cards: [
        SAFETY,
        'Formel (MRAD): Entfernung in m = Zielgröße in m × 1000 ÷ gemessene MRAD.',
        'Beispiel: Eine Person (ca. 1,80 m) deckt 3,6 MRAD → 1,8 × 1000 ÷ 3,6 = 500 m.',
        'Je genauer die bekannte Zielgröße und je ruhiger die Messung, desto besser. Kleine Messfehler ergeben auf große Entfernung große Fehler.',
        'Im Bild oben: Tippe auf die Entfernungen – das Ziel wird kleiner, die MRAD-Zahl sinkt.'],
        quiz: [
          { q: 'Ziel 1,8 m deckt 6 MRAD. Entfernung?', a: ['300 m', '600 m', '108 m'], ok: 0, why: '1,8 × 1000 ÷ 6 = 300 m.' },
          { q: 'Ziel 0,5 m (Kopf/Schulter) deckt 1 MRAD. Entfernung?', a: ['50 m', '500 m', '5000 m'], ok: 1, why: '0,5 × 1000 ÷ 1 = 500 m.' },
          { q: 'Das Ziel wird kleiner im Absehen. Die Entfernung …', a: ['sinkt', 'steigt', 'bleibt gleich'], ok: 1, why: 'Weniger MRAD bei gleicher Größe = weiter weg.' },
        ] },
      { title: 'Erste und zweite Bildebene, Parallaxe', visual: 'ebene', cards: [
        SAFETY,
        'Erste Bildebene (FFP): Das Absehen wird mit der Vergrößerung größer und kleiner. Die Messwerte stimmen bei jeder Vergrößerung.',
        'Zweite Bildebene (SFP): Das Absehen bleibt immer gleich groß. Messen stimmt nur bei der vom Hersteller angegebenen Vergrößerung.',
        'Parallaxe: Liegen Ziel- und Absehenbild nicht in einer Ebene, „wandert“ das Absehen, wenn du den Kopf bewegst. Parallaxe-Ausgleich einstellen, bis es stillsteht.',
        'Gleichbleibende Kopfposition (Wangenauflage) verringert Fehler zusätzlich.'],
        quiz: [
          { q: 'Bei welcher Bildebene stimmen Messwerte bei jeder Vergrößerung?', a: ['Erste (FFP)', 'Zweite (SFP)', 'Bei beiden'], ok: 0, why: 'Bei FFP skaliert das Absehen mit.' },
          { q: 'Das Absehen wandert, wenn du den Kopf bewegst. Ursache?', a: ['Parallaxe', 'Falsche Munition', 'Wind'], ok: 0, why: 'Parallaxe – Ausgleich einstellen.' },
          { q: 'SFP-Absehen: Wann stimmt die Messung?', a: ['Immer', 'Nur bei der angegebenen Vergrößerung', 'Nie'], ok: 1, why: 'Das Absehen skaliert nicht mit.' },
        ] },
      { title: 'Haltepunkt und Klicks', visual: 'haltepunkt', cards: [
        SAFETY,
        'Das Geschoss fliegt im Bogen und fällt mit der Entfernung. Ist die Waffe auf eine Entfernung eingeschossen, muss bei größerer Entfernung höher gehalten oder verstellt werden.',
        'Zwei Wege: Haltepunkt im Absehen nutzen (z. B. 1,5 MRAD höher) oder am Turm verstellen. Die Werte kommen aus der Schusstafel der jeweiligen Waffe und Munition.',
        'Klicks: Bei vielen MRAD-Türmen ist 1 Klick = 0,1 MRAD = 1 cm auf 100 m. Bei MOA-Türmen oft 1/4 MOA ≈ 0,7 cm auf 100 m.',
        'Seitenwind verschiebt das Geschoss ebenfalls – auch das wird über Haltepunkt oder Turm ausgeglichen. Genaue Werte lernt man in der Ausbildung.'],
        quiz: [
          { q: 'Eingeschossen auf 300 m, Ziel auf 500 m. Ohne Korrektur trifft das Geschoss …', a: ['höher', 'tiefer', 'genau'], ok: 1, why: 'Das Geschoss fällt mit der Entfernung.' },
          { q: '1 Klick = 0,1 MRAD. Wie viel verschiebt das auf 300 m?', a: ['1 cm', '3 cm', '30 cm'], ok: 1, why: '0,1 MRAD = 1 cm/100 m → 3 cm auf 300 m.' },
          { q: 'Woher kommen die Korrekturwerte?', a: ['Aus der Schusstafel für Waffe und Munition', 'Geschätzt', 'Aus dem Internet'], ok: 0, why: 'Werte gelten nur für die jeweilige Kombination.' },
        ] },
    ],
    exam: [
      { q: 'Person 1,8 m deckt 2 MRAD. Entfernung?', a: ['900 m', '360 m', '90 m'], ok: 0, why: '1,8 × 1000 ÷ 2 = 900 m.' },
      { q: '20 cm Korrektur auf 200 m sind wie viele MRAD?', a: ['0,1', '1', '2'], ok: 1, why: '1 MRAD auf 200 m = 20 cm.' },
    ],
  },
  {
    id: 'schiessen', title: 'Schießgrundlagen', badge: 'av_schiessen', links: ['armypubs', 'bwyt'],
    lessons: [
      { title: 'Stabile Position & Visierbild', visual: 'visierbild', cards: [
        SAFETY,
        'Grundlage jedes Treffers ist eine stabile Position: Knochen stützen, Muskeln entspannt. Der natürliche Zielpunkt soll ohne Kraft auf dem Ziel liegen.',
        'Visierbild: Bei Kimme und Korn steht das Korn mittig in der Kimme bzw. Lochkimme, Oberkante bündig. Das Auge fokussiert das Korn – das Ziel darf leicht unscharf sein.',
        'Bei Optiken: gleichmäßiges Bild ohne Schattenrand – Augenabstand und Kopfposition jedes Mal gleich.',
        'Prüfe den natürlichen Zielpunkt: Augen schließen, atmen, öffnen. Liegt das Visier daneben, Position verschieben statt mit Kraft halten.'],
        quiz: [
          { q: 'Worauf fokussiert das Auge bei Kimme und Korn?', a: ['Auf das Ziel', 'Auf das Korn', 'Auf die Kimme'], ok: 1, why: 'Scharfes Korn = gleichmäßiges Visierbild.' },
          { q: 'Das Visier liegt nach Augenschließen neben dem Ziel. Was tun?', a: ['Mit Kraft halten', 'Position verschieben', 'Schneller schießen'], ok: 1, why: 'Natürlicher Zielpunkt statt Muskelarbeit.' },
          { q: 'Was trägt eine stabile Position?', a: ['Die Muskeln', 'Die Knochen', 'Die Waffe'], ok: 1, why: 'Knochenstütze ermüdet nicht.' },
        ] },
      { title: 'Atmung & Abzug', visual: 'atmung', cards: [
        SAFETY,
        'Atmung: In der natürlichen Atempause nach dem Ausatmen bewegt sich der Körper am wenigsten. Dort fällt idealerweise der Schuss – ohne lange die Luft anzuhalten.',
        'Abzug: gleichmäßig und gerade nach hinten durchziehen, ohne die Waffe zu verreißen. Der Schuss soll fast überraschend brechen.',
        'Nachhalten: Visierbild und Abzug kurz nach dem Schuss halten (Nachhalten). So siehst du, wo das Visier beim Schuss stand.',
        'Unter Belastung (hoher Puls): erst Atmung beruhigen, dann schießen. Das trainierst du im Spezialisierungsblock mit Burpees und Box-Atmung.'],
        quiz: [
          { q: 'Wann fällt der Schuss idealerweise?', a: ['Beim Einatmen', 'In der natürlichen Atempause', 'Mit voller Lunge'], ok: 1, why: 'Dort ist der Körper am ruhigsten.' },
          { q: 'Wie wird der Abzug betätigt?', a: ['Ruckartig', 'Gleichmäßig gerade nach hinten', 'Seitlich'], ok: 1, why: 'Ruckartiges Ziehen verreißt die Waffe.' },
          { q: 'Was ist Nachhalten?', a: ['Visierbild und Abzug kurz halten', 'Waffe sofort absetzen', 'Nachladen'], ok: 0, why: 'Zeigt, wo das Visier beim Schuss stand.' },
        ] },
    ],
    exam: [
      { q: 'Puls 170 nach einem Sprint. Was zuerst?', a: ['Sofort schießen', 'Atmung kontrolliert beruhigen', 'Waffe ablegen'], ok: 1, why: 'Ruhige Atmung vor Präzision.' },
    ],
  },
  {
    id: 'breacher', title: 'Breacher – Grundlagen', badge: 'av_breacher', links: ['bwyt', 'bpol', 'dguv'],
    lessons: [
      { title: 'Rolle & Sicherheit', visual: 'regeln', cards: [
        'Sicherheit zuerst: Zugangsöffnung ist Teamarbeit. Nichts ohne Absprache, nichts ohne Schutzausrüstung. Alle Verfahren werden ausschließlich in der Ausbildung gelernt.',
        'Der Breacher öffnet dem Team den Zugang – Türen, Fenster, Hindernisse. Ziel: schnell, aber mit so wenig Gewalt wie nötig und ohne das eigene Team zu gefährden.',
        'Man unterscheidet grob mechanische, ballistische, thermische und explosive Methoden. Ballistische und explosive Verfahren sind ausschließlich speziell ausgebildeten Kräften vorbehalten – die App behandelt sie bewusst nicht.',
        'Kommunikation: Der Breacher meldet „bereit“ erst, wenn er und das Team in Position sind. Kein Zugriff ohne Freigabe.'],
        quiz: [
          { q: 'Ziel des Breachers?', a: ['Maximaler Schaden', 'Schneller Zugang mit so wenig Gewalt wie nötig', 'Allein vorgehen'], ok: 1, why: 'Effektiv und sicher für das Team.' },
          { q: 'Wer darf explosive Verfahren anwenden?', a: ['Jeder mit Interesse', 'Nur speziell ausgebildete Kräfte', 'Jeder Soldat'], ok: 1, why: 'Ausschließlich nach spezieller Ausbildung.' },
          { q: 'Wann meldet der Breacher „bereit“?', a: ['Sofort', 'Wenn er und das Team in Position sind', 'Nach dem Öffnen'], ok: 1, why: 'Erst dann ist ein sicherer Ablauf möglich.' },
        ] },
      { title: 'Tür lesen & mechanische Werkzeuge', visual: 'tuer', cards: [
        'Sicherheit zuerst: Augenschutz, Handschuhe, Gehörschutz. Werkzeug nur nach Einweisung benutzen.',
        'Tür lesen: Öffnet sie nach innen oder außen? Sind die Bänder (Scharniere) sichtbar, öffnet sie meist zu dir hin. Wo sitzen Schloss und Riegel? Material: Holz, Metall, Glas?',
        'Ramme: wirkt bei nach innen öffnenden Türen. Angesetzt wird auf der Schlossseite nahe am Schloss bzw. Riegel – nicht in der Türmitte.',
        'Hebelwerkzeug (z. B. Halligan): nutzt Hebelkraft zwischen Tür und Zarge, oft an der Schlossseite. Bekannt aus der Feuerwehr-Ausbildung („gewaltsames Öffnen“).',
        'Das Bild zeigt die Schloss- und die Bandseite und den Ansatzpunkt der Ramme.'],
        quiz: [
          { q: 'Bänder sind von deiner Seite sichtbar. Die Tür öffnet meist …', a: ['von dir weg', 'zu dir hin', 'nach oben'], ok: 1, why: 'Sichtbare Bänder = Tür schwenkt zu dir.' },
          { q: 'Wo setzt man die Ramme an?', a: ['Türmitte', 'Schlossseite nahe Schloss/Riegel', 'Bandseite unten'], ok: 1, why: 'Dort hält die Tür – dort wird gelöst.' },
          { q: 'Was gehört immer dazu?', a: ['Augen-, Hand- und Gehörschutz', 'Nichts', 'Nur Handschuhe'], ok: 0, why: 'Splitter, Lärm und Werkzeug sind gefährlich.' },
        ] },
      { title: 'Körperliche Anforderungen', cards: [
        'Sicherheit zuerst: Wer erschöpft arbeitet, macht Fehler. Belastbarkeit ist Sicherheit.',
        'Breacher tragen schweres Werkzeug zusätzlich zur Ausrüstung und müssen nach Laufen, Treppen und Tragen sofort präzise und kraftvoll arbeiten.',
        'Wichtig sind: Griffkraft, Rumpfstabilität, Schulterstabilität, Rotations- und Schlagkraft – und Ausdauer, um danach weiter zu funktionieren.',
        'Genau das trainiert der Spezialisierungsblock dienstags (Hammer auf Reifen, Rotationswürfe, einarmiges Tragen) und der Maximalkraft-Montag.'],
        quiz: [
          { q: 'Welche Fähigkeit ist für Breacher besonders wichtig?', a: ['Griff- und Rumpfkraft', 'Nur Laufen', 'Beweglichkeit allein'], ok: 0, why: 'Werkzeug tragen und führen braucht Griff und Rumpf.' },
          { q: 'Warum ist Belastbarkeit Sicherheit?', a: ['Ist sie nicht', 'Erschöpfung führt zu Fehlern', 'Wegen der Punkte'], ok: 1, why: 'Präzision unter Ermüdung schützt das Team.' },
          { q: 'Welche Übung trainiert Rotations- und Schlagkraft?', a: ['Hammerschläge auf einen Reifen', 'Bizeps-Curls', 'Wadenheben'], ok: 0, why: 'Ganzkörper-Rotation unter Last.' },
        ] },
    ],
    exam: [
      { q: 'Nach innen öffnende Holztür, Schloss rechts. Wo setzt die Ramme an?', a: ['Links oben', 'Rechts nahe Schloss', 'Mitte'], ok: 1, why: 'Schlossseite nahe Schloss.' },
      { q: 'Welche Methoden behandelt diese App bewusst nicht?', a: ['Mechanische', 'Ballistische und explosive', 'Keine'], ok: 1, why: 'Nur in der Ausbildung.' },
    ],
  },
  {
    id: 'waffenspez', title: 'Waffenspezialist – Rolle', badge: 'av_waffen', links: ['bw', 'bwyt'],
    lessons: [
      { title: 'Aufgaben im Trupp', cards: [
        SAFETY,
        'In Kommandotrupps sind Spezialisierungen üblich, z. B. Waffen, Sanität, Fernmelde, Pionier/Zugang. Zuschnitt und Namen unterscheiden sich je Einheit.',
        'Ein Waffenspezialist ist typischerweise der Experte des Trupps für Waffen, Optiken und deren Einsatz: Einweisung der Kameraden, Pflege, Störungsbeseitigung, Einschießen, Ausbildung.',
        'Dazu gehört Verantwortung: Zustand, Vollzähligkeit und Dokumentation der Waffen und Optiken.',
        'Die genauen Aufgaben lernst du in der Spezialisierungsausbildung deiner Einheit.'],
        quiz: [
          { q: 'Was gehört typischerweise zu den Aufgaben?', a: ['Pflege, Störungsbeseitigung, Einweisung', 'Nur Schießen', 'Nur Funk'], ok: 0, why: 'Der Spezialist ist der Experte im Trupp.' },
          { q: 'Sind die Spezialisierungen überall gleich benannt?', a: ['Ja', 'Nein, je Einheit unterschiedlich', 'Es gibt keine'], ok: 1, why: 'Zuschnitt und Namen variieren.' },
          { q: 'Wofür ist der Spezialist zusätzlich verantwortlich?', a: ['Zustand und Vollzähligkeit', 'Verpflegung', 'Fahrzeuge'], ok: 0, why: 'Waffen und Optiken müssen stimmen.' },
        ] },
      { title: 'Pflege, Störung, Ruhe', visual: 'atmung', cards: [
        SAFETY,
        'Pflege nach Vorschrift: Waffe zuerst sicher entladen und prüfen, dann zerlegen, reinigen, prüfen, ölen, zusammensetzen, Funktionsprüfung.',
        'Störung: Mündung in sichere Richtung, ruhig bleiben, das in der Ausbildung gelernte Verfahren abarbeiten. Hektik macht aus einer Störung einen Unfall.',
        'Ruhe unter Druck ist trainierbar: Box-Atmung und die Szenarien im Mental-Bereich helfen dabei.'],
        quiz: [
          { q: 'Erster Schritt vor jeder Pflege?', a: ['Ölen', 'Sicher entladen und prüfen', 'Zerlegen'], ok: 1, why: 'Sicherheit vor Pflege.' },
          { q: 'Bei einer Störung zeigt die Mündung …', a: ['zum Boden vor die Füße', 'in sichere Richtung', 'egal'], ok: 1, why: 'Regel 2 gilt auch bei Störungen.' },
          { q: 'Was hilft gegen Hektik?', a: ['Trainierte Atmung und Routine', 'Schneller arbeiten', 'Nichts'], ok: 0, why: 'Ruhe ist trainierbar.' },
        ] },
    ],
    exam: [
      { q: 'Reihenfolge der Pflege?', a: ['Entladen/prüfen – zerlegen – reinigen – ölen – zusammensetzen – Funktionsprüfung', 'Ölen – entladen – reinigen', 'Zerlegen – schießen – reinigen'], ok: 0, why: 'Sicherheit zuerst, Funktionsprüfung zuletzt.' },
    ],
  },
  {
    id: 'ausbildung', title: 'Die Ausbildung nach dem AV', badge: 'av_ausbildung', links: ['bwk', 'bw', 'bpolk'],
    lessons: [
      { title: 'Was dich erwartet', cards: [
        'Sicherheit zuerst: In der Ausbildung gelten Sicherheitsbestimmungen für Waffen, Wasser, Höhe, Fahrzeuge und Gerät. Sie haben immer Vorrang vor Tempo und Ehrgeiz.',
        'Ehrlich vorweg: Genaue Abläufe, Dauer und Inhalte ändern sich und werden nicht alle öffentlich gemacht. Verlässliche Auskunft gibt es beim Karrierecenter bzw. bei der Bundespolizei.',
        'Gemeinsam ist allen Einheiten (KSK, Kampfschwimmer, EGB, GSG 9): eine mehrstufige Ausbildung über einen längeren Zeitraum, mit Grundlagen, Spezialisierung und laufender Überprüfung.',
        'Typische Belastungen: lange Tage, Schlafmangel, schweres Tragen, Wasser (besonders Kampfschwimmer), Schießen, Nahkampf, Lernen unter Müdigkeit.',
        'Auch nach dem bestandenen AV kann man in der Ausbildung ausscheiden – Verletzungen sind der häufigste vermeidbare Grund.'],
        quiz: [
          { q: 'Woher kommen verlässliche Infos zum Ausbildungsablauf?', a: ['Foren', 'Karrierecenter / Bundespolizei', 'Freunde'], ok: 1, why: 'Abläufe ändern sich.' },
          { q: 'Häufigster vermeidbarer Grund fürs Ausscheiden?', a: ['Verletzungen', 'Zu viel Talent', 'Wetter'], ok: 0, why: 'Deshalb Prophylaxe und Steigerung mit Maß.' },
          { q: 'Ist man nach dem AV „durch“?', a: ['Ja', 'Nein, die Ausbildung prüft weiter', 'Nur bei der GSG 9'], ok: 1, why: 'Leistung wird laufend überprüft.' },
        ] },
      { title: 'Wie du dich jetzt vorbereitest', cards: [
        'Sicherheit zuerst: In der Ausbildung gelten Sicherheitsbestimmungen für Waffen, Wasser, Höhe, Fahrzeuge und Gerät. Sie haben immer Vorrang vor Tempo und Ehrgeiz.',
        'Körper: Maximalkraft, Griff, schweres Tragen – ohne Laufen und Schwimmen zu verlieren. Genau das macht die Phase „Nach dem AV“.',
        'Wissen: Sicherheitsregeln, Begriffe, Kartenkunde, Funk, Erste Hilfe und Englisch sitzen vor Ausbildungsbeginn. Dann bleibt Kopf frei für das Neue.',
        'Kopf: Routinen für Schlaf, Atmung, Selbstgespräch. Dein Warum regelmäßig lesen.',
        'Haltung (EGB-Report, SOF Truths): kameradschaftlich, lernbereit, nicht besserwisserisch. Qualität vor Quantität.'],
        quiz: [
          { q: 'Was verlierst du in der Phase „Nach dem AV“ nicht aus den Augen?', a: ['Laufen und Schwimmen', 'Nichts', 'Kickboxen'], ok: 0, why: 'Ausdauer wird gehalten, Kraft aufgebaut.' },
          { q: 'Welche Haltung zählt?', a: ['Besserwisserisch', 'Kameradschaftlich und lernbereit', 'Einzelkämpfer'], ok: 1, why: 'Teamfähigkeit wird beobachtet.' },
          { q: 'Warum Grundlagenwissen vorher lernen?', a: ['Damit in der Ausbildung der Kopf frei ist', 'Für Punkte', 'Gar nicht nötig'], ok: 0, why: 'Weniger Ballast unter Müdigkeit.' },
        ] },
    ],
    exam: [
      { q: 'Was macht in der Ausbildung den Unterschied zur Top 0,1 %?', a: ['Nur Kraft', 'Gesund bleiben, konstant liefern, Team zuerst', 'Glück'], ok: 1, why: 'Konstanz und Teamfähigkeit über Monate.' },
    ],
  },
];

export const lessonId = (c, i) => `${c.id}:${i}`;
