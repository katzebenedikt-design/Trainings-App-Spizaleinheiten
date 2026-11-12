// CAT-Test (computergestützter Eignungstest) – KONFIGURATION. Nur Daten, hier anpassen.
// Alle Aufgaben sind selbst erstellte Übungsaufgaben im Stil typischer Eignungstests,
// KEINE offiziellen Originalaufgaben. Zeiten und Aufgabenzahlen sind Richtwerte für das Training.

export const CAT_MODULES = {
  sprache: { name: 'Sprachverständnis & Rechtschreibung', kurz: 'Sprache', typen: ['rechtschreibung', 'dasdass', 'synonym', 'analogie'] },
  mathe: { name: 'Mathe & Kopfrechnen', kurz: 'Mathe', typen: ['kopf', 'prozent', 'dreisatz', 'tempo', 'gleichung'] },
  logik: { name: 'Logisches Denken', kurz: 'Logik', typen: ['zahlenreihe', 'matrix', 'figurenreihe'] },
  raum: { name: 'Räumliches Vorstellungsvermögen', kurz: 'Raum', typen: ['drehen', 'netz'] },
  technik: { name: 'Technisches Verständnis', kurz: 'Technik', typen: ['zahnrad', 'hebel', 'flaschenzug', 'technikwissen'] },
  merken: { name: 'Merkfähigkeit', kurz: 'Merken', typen: ['memo'] },
  konzentration: { name: 'Konzentration', kurz: 'Konzentr.', typen: ['d2'] },
  allgemein: { name: 'Allgemeinwissen', kurz: 'Wissen', typen: ['wissen'] },
  reaktion: { name: 'Reaktion', kurz: 'Reaktion', typen: ['reaktion'] },
  diktat: { name: 'Diktat (Rechtschreibung nach Gehör)', kurz: 'Diktat', typen: ['diktat'] },
};

// Testprofile. module: Reihenfolge, Aufgabenzahl (n) und Zeit in Minuten (min) für die Simulation.
// typen: optionale Gewichtung der Aufgabentypen innerhalb eines Moduls.
export const CAT_PROFILES = {
  bw: {
    name: 'Bundeswehr – Karrierecenter',
    fuer: 'KSK, Kampfschwimmer (Laufbahnen der Bundeswehr)',
    hinweis: 'Laut Bundeswehr: computergestützt und adaptiv (die nächste Aufgabe richtet sich nach der vorigen Antwort); geprüft werden u. a. Sprachbeherrschung, mathematische Kompetenz, logisches Denken sowie Reaktions- und Konzentrationsfähigkeit. Raum und Technik nennen Vorbereitungsanbieter. Zeitlimits je nach Laufbahn und Abschnitt; eine feste Reihenfolge gibt das Karrierecenter nicht an.',
    quelle: { titel: 'bundeswehrkarriere.de', url: 'https://www.bundeswehrkarriere.de/' },
    module: [
      { id: 'sprache', n: 12, min: 8 },
      { id: 'mathe', n: 12, min: 10 },
      { id: 'logik', n: 12, min: 10 },
      { id: 'raum', n: 8, min: 6 },
      { id: 'technik', n: 8, min: 6 },
      { id: 'merken', n: 2, min: 5 },
      { id: 'konzentration', n: 2, min: 2 },
      { id: 'reaktion', n: 1, min: 1.5 },
      { id: 'allgemein', n: 8, min: 4 },
    ],
  },
  bpol: {
    name: 'Bundespolizei – Einstellungstest',
    fuer: 'GSG 9 (Weg über den Polizeivollzugsdienst der Bundespolizei)',
    hinweis: 'Laut Vorbereitungsliteratur beginnt der schriftliche Teil (mittlerer Dienst) mit einem Diktat, danach computergestützt Sprachverständnis, Allgemeinwissen und Intelligenztest (Zahlenreihen, Matrizen, Würfel). Eine offizielle Ablaufbeschreibung der Bundespolizei gibt es dazu nicht öffentlich. Für die GSG 9 bewirbt man sich als Polizeivollzugsbeamter.',
    quelle: { titel: 'komm-zur-bundespolizei.de', url: 'https://www.komm-zur-bundespolizei.de/' },
    module: [
      { id: 'diktat', n: 5, min: 6 },
      { id: 'sprache', n: 15, min: 10, typen: { rechtschreibung: 3, dasdass: 2, synonym: 1, analogie: 1 } },
      { id: 'mathe', n: 12, min: 10 },
      { id: 'logik', n: 12, min: 10 },
      { id: 'raum', n: 8, min: 6 },
      { id: 'merken', n: 2, min: 5 },
      { id: 'konzentration', n: 2, min: 2 },
      { id: 'allgemein', n: 12, min: 6 },
      { id: 'technik', n: 6, min: 4 },
    ],
  },
};

// Monatlicher Kopf-Test: feste Schwierigkeit, damit Ergebnisse über die Monate vergleichbar sind.
// Termin: Sonntag der Entlastungswoche (zusammen mit dem Sport-Monatstest).
export const CAT_KOPFTEST = {
  name: 'Kopf-Test (monatlich)',
  stufe: 5,
  module: [
    { id: 'sprache', n: 5, min: 2.5 }, { id: 'mathe', n: 5, min: 3 }, { id: 'logik', n: 5, min: 3 }, { id: 'raum', n: 4, min: 2 },
    { id: 'technik', n: 4, min: 2 }, { id: 'merken', n: 1, min: 2 }, { id: 'konzentration', n: 1, min: 1 }, { id: 'reaktion', n: 1, min: 1 }, { id: 'diktat', n: 2, min: 2 }, { id: 'allgemein', n: 4, min: 1.5 },
  ],
};

// ---------- Aufgabenbanken ----------
// Rechtschreibung: [richtig, falsch, falsch, falsch], Stufe 1–3
export const RECHTSCHREIBUNG = [
  [1, 'Rhythmus', 'Rythmus', 'Rhytmus', 'Rhythmuss'], [1, 'Standard', 'Standart', 'Standardt', 'Schtandard'], [1, 'Maschine', 'Maschiene', 'Maschinne', 'Mashine'],
  [1, 'Entschuldigung', 'Entschuldiegung', 'Endschuldigung', 'Entschultigung'], [1, 'nämlich', 'nähmlich', 'nemlich', 'nämmlich'], [1, 'Gebühr', 'Gebür', 'Gebüer', 'Gebürh'],
  [1, 'Paket', 'Packet', 'Pakket', 'Pakeht'], [1, 'Adresse', 'Addresse', 'Adrese', 'Addrese'], [1, 'tödlich', 'tötlich', 'tödtlich', 'tötdlich'],
  [2, 'Reparatur', 'Reperatur', 'Reparattur', 'Repperatur'], [2, 'Ingenieur', 'Ingeneur', 'Ingenieuer', 'Inschenieur'], [2, 'Libyen', 'Lybien', 'Lybyen', 'Libien'],
  [2, 'Satellit', 'Sattelit', 'Satelit', 'Sattellit'], [2, 'Hygiene', 'Hygene', 'Hügiene', 'Hygienne'], [2, 'Kommission', 'Komission', 'Kommision', 'Komision'],
  [2, 'Akkumulator', 'Akumulator', 'Akkumolator', 'Akkummulator'], [2, 'Terrasse', 'Terasse', 'Terrase', 'Teraße'], [2, 'Karosserie', 'Karoserie', 'Karrosserie', 'Karroserie'],
  [3, 'Rhododendron', 'Rododendron', 'Rhododentron', 'Rhodendron'], [3, 'Konnotation', 'Konotation', 'Konnotazion', 'Konnotatiohn'], [3, 'Renaissance', 'Renaisance', 'Renessance', 'Renaissanse'],
  [3, 'Dilettant', 'Dilletant', 'Dilettand', 'Dilletand'], [3, 'Reminiszenz', 'Reminizenz', 'Remeniszenz', 'Reminiszens'], [3, 'Akquisition', 'Aquisition', 'Akquisizion', 'Akkquisition'],
  [3, 'Pharmazeut', 'Pharmazäut', 'Farmazeut', 'Pharmazoit'], [3, 'Lizenz', 'Lizens', 'Litzenz', 'Lizzenz'], [3, 'Physiotherapeut', 'Physiotherapeuth', 'Phisiotherapeut', 'Physioterapeut'],
];

// das/dass: [Satz mit ___, Lösung, Begründung]
export const DASDASS = [
  ['Ich hoffe, ___ du pünktlich kommst.', 'dass', 'Konjunktion: leitet einen Nebensatz ein, lässt sich nicht durch „welches“ ersetzen.'],
  ['Das Fahrzeug, ___ dort steht, ist neu.', 'das', 'Relativpronomen: lässt sich durch „welches“ ersetzen.'],
  ['Er meldet, ___ die Straße frei ist.', 'dass', 'Konjunktion nach „meldet“ – kein „welches“ möglich.'],
  ['___ ist mein Rucksack.', 'Das', 'Demonstrativpronomen: „Dieses ist mein Rucksack.“'],
  ['Ich weiß, ___ das stimmt.', 'dass', 'Konjunktion. Das zweite „das“ ist ein Pronomen.'],
  ['Das Training, ___ morgen stattfindet, ist hart.', 'das', 'Relativpronomen: „welches morgen stattfindet“.'],
  ['Es ist wichtig, ___ jeder seine Ausrüstung prüft.', 'dass', 'Konjunktion nach „Es ist wichtig“.'],
  ['Kennst du ___ Buch, ___ ich dir empfohlen habe?', 'das … das', 'Erst Artikel, dann Relativpronomen („welches ich empfohlen habe“).'],
];

// Wortbedeutung: [Stufe, Wort, richtig, falsch, falsch, falsch]
export const SYNONYME = [
  [1, 'zügig', 'schnell', 'langsam', 'zögerlich', 'vorsichtig'], [1, 'beharrlich', 'ausdauernd', 'wechselhaft', 'faul', 'laut'], [1, 'Konflikt', 'Streit', 'Einigung', 'Vertrag', 'Feier'],
  [1, 'präzise', 'genau', 'ungefähr', 'schnell', 'grob'], [1, 'vage', 'unbestimmt', 'klar', 'genau', 'stark'], [1, 'rasten', 'pausieren', 'rennen', 'arbeiten', 'reisen'],
  [2, 'akribisch', 'sehr sorgfältig', 'oberflächlich', 'aggressiv', 'spontan'], [2, 'pragmatisch', 'praktisch, sachbezogen', 'theoretisch', 'verträumt', 'umständlich'],
  [2, 'ambivalent', 'zwiespältig', 'eindeutig', 'gleichgültig', 'begeistert'], [2, 'Resilienz', 'Widerstandskraft', 'Schwäche', 'Rücksicht', 'Ausdauer'],
  [2, 'obsolet', 'veraltet', 'modern', 'notwendig', 'teuer'], [2, 'konsequent', 'folgerichtig', 'sprunghaft', 'willkürlich', 'zufällig'], [2, 'autark', 'unabhängig', 'abhängig', 'autoritär', 'automatisch'],
  [3, 'lakonisch', 'kurz und treffend', 'weitschweifig', 'traurig', 'übertrieben'], [3, 'ubiquitär', 'überall verbreitet', 'selten', 'einzigartig', 'unsichtbar'],
  [3, 'Diskrepanz', 'Widerspruch', 'Übereinstimmung', 'Verschwiegenheit', 'Unterhaltung'], [3, 'subtil', 'fein, unterschwellig', 'grob', 'offensichtlich', 'laut'],
  [3, 'kolportieren', 'Gerüchte verbreiten', 'verschweigen', 'transportieren', 'beweisen'], [3, 'Prämisse', 'Voraussetzung', 'Ergebnis', 'Belohnung', 'Vorwurf'],
];

// Analogien: [Stufe, Aufgabe, Lösung, [Falsche], Begründung]
export const ANALOGIEN = [
  [1, 'Kopf : Mütze = Hand : ?', 'Handschuh', ['Finger', 'Ring', 'Arm'], 'Kleidungsstück für das Körperteil.'],
  [1, 'Vogel : Nest = Bär : ?', 'Höhle', ['Wald', 'Honig', 'Pelz'], 'Wo das Tier schläft bzw. wohnt.'],
  [1, 'heiß : kalt = hell : ?', 'dunkel', ['warm', 'Licht', 'Sonne'], 'Gegenteil.'],
  [1, 'Auto : Straße = Schiff : ?', 'Wasser', ['Hafen', 'Kapitän', 'Anker'], 'Worauf es sich fortbewegt.'],
  [2, 'Uhr : Zeit = Waage : ?', 'Gewicht', ['Länge', 'Küche', 'Zeiger'], 'Was das Gerät misst.'],
  [2, 'Arzt : Krankenhaus = Lehrer : ?', 'Schule', ['Schüler', 'Tafel', 'Ferien'], 'Arbeitsort.'],
  [2, 'Kompass : Richtung = Thermometer : ?', 'Temperatur', ['Wetter', 'Fieber', 'Quecksilber'], 'Was angezeigt wird.'],
  [2, 'Same : Pflanze = Ei : ?', 'Küken', ['Huhn', 'Nest', 'Schale'], 'Was daraus entsteht.'],
  [3, 'Gesetz : Legislative = Urteil : ?', 'Judikative', ['Exekutive', 'Parlament', 'Polizei'], 'Gewaltenteilung: welche Gewalt es hervorbringt.'],
  [3, 'Hypothese : Experiment = Anklage : ?', 'Gerichtsverfahren', ['Urteil', 'Richter', 'Strafe'], 'Wodurch sie geprüft wird.'],
  [3, 'Kilogramm : Masse = Ampere : ?', 'Stromstärke', ['Spannung', 'Widerstand', 'Leistung'], 'SI-Einheit und ihre Größe.'],
  [3, 'Quelle : Mündung = Geburt : ?', 'Tod', ['Kindheit', 'Leben', 'Alter'], 'Anfang und Ende.'],
];

// Technikwissen: [Stufe, Frage, richtig, falsch, falsch, falsch, Erklärung]
export const TECHNIK = [
  [1, 'Welcher Stoff leitet Wärme am besten?', 'Kupfer', 'Holz', 'Glas', 'Kunststoff', 'Metalle leiten Wärme gut, Kupfer besonders gut.'],
  [1, 'Welche Einheit hat die elektrische Spannung?', 'Volt', 'Ampere', 'Ohm', 'Watt', 'Spannung U in Volt, Strom I in Ampere, Widerstand R in Ohm, Leistung P in Watt.'],
  [1, 'Warum hat ein Schraubenschlüssel einen langen Griff?', 'Längerer Hebelarm, weniger Kraft nötig', 'Er wird dadurch leichter', 'Er rostet weniger', 'Damit er nicht wegrutscht', 'Drehmoment = Kraft × Hebelarm.'],
  [1, 'Wärme fließt von selbst immer …', 'vom wärmeren zum kälteren Körper', 'vom kälteren zum wärmeren Körper', 'von oben nach unten', 'nur mit Strom', 'Zweiter Hauptsatz der Thermodynamik.'],
  [2, 'Ein Taucher geht von der Oberfläche auf 10 m Tiefe. Der Umgebungsdruck …', 'verdoppelt sich ungefähr (1 → 2 bar)', 'halbiert sich', 'bleibt gleich', 'verzehnfacht sich', 'Je 10 m Wasser kommt etwa 1 bar zum Luftdruck (1 bar) dazu.'],
  [2, 'U = R · I. Bei 12 V und 4 Ω fließt …', '3 A', '48 A', '0,33 A', '16 A', 'I = U / R = 12 V / 4 Ω = 3 A.'],
  [2, 'Zwei gleiche Widerstände in Reihe: Der Gesamtwiderstand ist …', 'doppelt so groß', 'halb so groß', 'gleich groß', 'null', 'In Reihe addieren sich Widerstände.'],
  [2, 'Ein Körper schwimmt im Wasser, wenn …', 'seine Dichte kleiner ist als die von Wasser', 'er leichter als 1 kg ist', 'er aus Metall ist', 'er glatt ist', 'Auftrieb größer als Gewichtskraft – bei geringerer Dichte.'],
  [2, 'Beim Verdampfen nimmt ein Kältemittel Wärme …', 'auf', 'ab', 'weder auf noch ab', 'nur unter 0 °C auf', 'Verdampfen braucht Energie (Verdampfungswärme) – so kühlt der Verdampfer.'],
  [2, 'Leistung P = U · I. Ein Gerät an 230 V zieht 2 A. Die Leistung ist …', '460 W', '115 W', '232 W', '2,3 kW', '230 V × 2 A = 460 W.'],
  [2, 'Warum kippt ein Fahrzeug mit tiefem Schwerpunkt in Kurven weniger leicht?', 'Der Schwerpunkt bleibt länger über der Aufstandsfläche', 'Es ist schneller', 'Es verbraucht weniger', 'Die Reifen sind breiter', 'Kippen beginnt, wenn die Wirklinie der Kräfte außerhalb der Aufstandsfläche liegt.'],
  [3, 'Zwei gleiche Widerstände parallel: Der Gesamtwiderstand ist …', 'halb so groß', 'doppelt so groß', 'gleich groß', 'viermal so groß', 'Parallel: 1/R = 1/R1 + 1/R2 → R/2.'],
  [3, 'Ein Ballon wird aus 10 m Wassertiefe an die Oberfläche gebracht (gleiche Temperatur). Sein Volumen …', 'verdoppelt sich ungefähr', 'halbiert sich', 'bleibt gleich', 'vervierfacht sich', 'Boyle-Mariotte: p · V = konstant; der Druck halbiert sich von 2 auf 1 bar.'],
  [3, 'Fahrrad: vorne 40 Zähne, hinten 20 Zähne. Eine Kurbelumdrehung dreht das Hinterrad …', '2-mal', '0,5-mal', '1-mal', '4-mal', 'Übersetzung 40 : 20 = 2.'],
  [3, 'In welchem Stoff breitet sich Schall am schnellsten aus?', 'Stahl', 'Luft', 'Wasser', 'Vakuum', 'Schall ist in Festkörpern am schnellsten, im Vakuum gar nicht.'],
  [3, 'Was lässt einen Körper eine schiefe Ebene hinunterrutschen?', 'Die Hangabtriebskraft (Teil der Gewichtskraft)', 'Der Auftrieb', 'Die Fliehkraft', 'Die Reibung', 'Die Gewichtskraft zerlegt sich in Normalkraft und Hangabtriebskraft.'],
];

// Allgemeinwissen (nur dauerhaft gültige Fakten): [Stufe, Frage, richtig, falsch, falsch, falsch]
export const WISSEN = [
  [1, 'Wie viele Bundesländer hat Deutschland?', '16', '15', '14', '12'],
  [1, 'Wer wählt den Bundeskanzler?', 'Der Bundestag', 'Das Volk direkt', 'Der Bundesrat', 'Die Bundesversammlung'],
  [1, 'Welcher Artikel des Grundgesetzes beginnt mit „Die Würde des Menschen ist unantastbar“?', 'Artikel 1', 'Artikel 20', 'Artikel 3', 'Artikel 5'],
  [1, 'In welchem Jahr fiel die Berliner Mauer?', '1989', '1990', '1961', '1991'],
  [1, 'Wie viele Stimmen hat man bei der Bundestagswahl?', 'Zwei', 'Eine', 'Drei', 'So viele wie Parteien'],
  [1, 'Wie lange dauert eine Wahlperiode des Bundestags?', '4 Jahre', '5 Jahre', '6 Jahre', '3 Jahre'],
  [1, 'Wann endete der Zweite Weltkrieg in Europa?', '1945', '1944', '1939', '1949'],
  [1, 'Wofür steht die Abkürzung UN?', 'Vereinte Nationen', 'Union der Nationen', 'Universelle Nationen', 'Unabhängige Nationen'],
  [1, 'Welcher Ozean ist der größte?', 'Pazifik', 'Atlantik', 'Indischer Ozean', 'Arktischer Ozean'],
  [1, 'Wie heißt der höchste Berg Deutschlands?', 'Zugspitze', 'Watzmann', 'Brocken', 'Feldberg'],
  [1, 'Welches Land ist flächenmäßig das größte der Welt?', 'Russland', 'Kanada', 'China', 'USA'],
  [1, 'Wofür steht NATO?', 'North Atlantic Treaty Organization', 'North American Trade Organization', 'National Atlantic Treaty Office', 'Northern Alliance Treaty Organization'],
  [2, 'Wer wählt den Bundespräsidenten?', 'Die Bundesversammlung', 'Der Bundestag', 'Das Volk direkt', 'Der Bundesrat'],
  [2, 'Wer hat in Friedenszeiten die Befehls- und Kommandogewalt über die Streitkräfte?', 'Der Bundesminister der Verteidigung', 'Der Bundespräsident', 'Der Bundeskanzler', 'Der Generalinspekteur'],
  [2, 'Seit wann ist die Bundesrepublik Mitglied der NATO?', '1955', '1949', '1990', '1961'],
  [2, 'In welchem Jahr wurde die Bundeswehr gegründet?', '1955', '1949', '1961', '1990'],
  [2, 'Wo hat die GSG 9 ihren Sitz?', 'Sankt Augustin', 'Calw', 'Eckernförde', 'Berlin'],
  [2, 'Wo ist das Kommando Spezialkräfte (KSK) stationiert?', 'Calw', 'Sankt Augustin', 'Eckernförde', 'Koblenz'],
  [2, 'Wo sind die Kampfschwimmer der Marine stationiert?', 'Eckernförde', 'Kiel', 'Wilhelmshaven', 'Calw'],
  [2, 'Welchem Ministerium untersteht die Bundespolizei?', 'Bundesministerium des Innern', 'Bundesministerium der Verteidigung', 'Bundesministerium der Justiz', 'Auswärtiges Amt'],
  [2, 'Was ist die Hauptstadt von Australien?', 'Canberra', 'Sydney', 'Melbourne', 'Perth'],
  [2, 'Was ist die Hauptstadt von Kanada?', 'Ottawa', 'Toronto', 'Montreal', 'Vancouver'],
  [2, 'Wann trat das Grundgesetz in Kraft?', '1949', '1945', '1955', '1990'],
  [2, 'Welches Verfassungsorgan vertritt die Länder auf Bundesebene?', 'Bundesrat', 'Bundestag', 'Bundesversammlung', 'Bundesverfassungsgericht'],
  [2, 'Wo hat das Bundesverfassungsgericht seinen Sitz?', 'Karlsruhe', 'Berlin', 'Leipzig', 'Bonn'],
  [2, 'Was bedeutet Inflation?', 'Allgemeiner Anstieg des Preisniveaus', 'Allgemeines Sinken der Preise', 'Steigende Arbeitslosigkeit', 'Starkes Wirtschaftswachstum'],
  [2, 'Wie viele Einwohner hat Deutschland ungefähr?', 'ca. 84 Millionen', 'ca. 60 Millionen', 'ca. 100 Millionen', 'ca. 120 Millionen'],
  [3, 'In welchem Jahr wurde die allgemeine Wehrpflicht in Deutschland ausgesetzt?', '2011', '2001', '1990', '2015'],
  [3, 'Wer legt den Leitzins im Euroraum fest?', 'Die Europäische Zentralbank', 'Die Deutsche Bundesbank', 'Die EU-Kommission', 'Die Bundesregierung'],
  [3, 'Welcher Grundsatz steht in Artikel 20 des Grundgesetzes?', 'Deutschland ist ein demokratischer und sozialer Bundesstaat', 'Die Würde des Menschen ist unantastbar', 'Alle Menschen sind vor dem Gesetz gleich', 'Die Freiheit der Person ist unverletzlich'],
  [3, 'Wie heißt das Prinzip, nach dem Gesetzgebung, Regierung und Gerichte getrennt sind?', 'Gewaltenteilung', 'Föderalismus', 'Subsidiarität', 'Rechtsstaatsprinzip'],
  [3, 'Welche Stadt war Hauptstadt der Bundesrepublik bis zur Wiedervereinigung?', 'Bonn', 'Frankfurt am Main', 'Köln', 'Berlin'],
];

// Diktat: [Stufe, Satz] – wird vorgelesen, Groß-/Kleinschreibung zählt
export const DIKTAT = [
  [1, 'Der Zug fährt um acht Uhr ab.'], [1, 'Wir treffen uns morgen früh am Bahnhof.'], [1, 'Bitte nimm deinen Rucksack mit.'],
  [1, 'Er hat die Prüfung bestanden.'], [1, 'Das Wetter ist heute sehr schlecht.'],
  [2, 'Ich hoffe, dass das Training heute nicht ausfällt.'], [2, 'Beim Laufen im Wald ist ihm etwas Merkwürdiges aufgefallen.'],
  [2, 'Die Kameraden haben das Gepäck gemeinsam getragen.'], [2, 'Wir müssen uns beeilen, damit wir pünktlich ankommen.'],
  [2, 'Er weiß, dass er sich auf seine Gruppe verlassen kann.'], [2, 'Im Großen und Ganzen verlief die Übung reibungslos.'],
  [3, 'Seit gestern liegt der Bericht dem Zugführer zur Überprüfung vor.'], [3, 'Der Einsatzleiter forderte, dass sämtliche Fahrzeuge unverzüglich zurückkehren.'],
  [3, 'Trotz des schlechten Wetters setzten die Bewerber ihren Marsch fort.'], [3, 'Das Dokument wurde im Voraus sorgfältig überprüft und anschließend abgezeichnet.'],
  [3, 'Die Kommission bemängelte die unzureichende Dokumentation des Vorfalls.'],
];

// Merkfähigkeit: Bausteine für Datensätze
export const MEMO = {
  namen: ['Becker', 'Schulz', 'Wagner', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Krüger', 'Hartmann', 'Lange', 'Werner', 'Krause'],
  orte: ['Kiel', 'Bremen', 'Dresden', 'Ulm', 'Trier', 'Passau', 'Rostock', 'Kassel', 'Erfurt', 'Bonn', 'Lübeck', 'Jena', 'Fulda', 'Gießen', 'Husum'],
  berufe: ['Elektriker', 'Pilot', 'Bäcker', 'Ärztin', 'Lehrer', 'Tischler', 'Polizistin', 'Koch', 'Mechaniker', 'Juristin', 'Gärtner', 'Maurer', 'Apothekerin', 'Förster', 'Fahrlehrer'],
};
