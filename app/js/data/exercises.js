// Übungskatalog. typ: 'last' = Zusatzgewicht (Hantel/Maschine), 'kg' = nur Körpergewicht,
// 'kgplus' = Körpergewicht + Zusatzgewicht (Körpergewicht wird automatisch eingerechnet), 'zeit' = Halten in Sekunden.
// Ausführungshinweise nach KSK-Trainingshandbuch (Übungskatalog) und NSW Physical Training Guide.
export const EXERCISES = [
  { id: 'klimmzug', name: 'Klimmzüge (Ristgriff)', typ: 'kgplus', gruppe: 'Rücken', fig: 'klimmzug',
    cue: 'Ausgehängt mit gestreckten Armen starten. Kinn klar über die Stange, ohne Schwung. Langsam bis zur vollen Streckung absenken.' },
  { id: 'liegestuetz', name: 'Liegestütze', typ: 'kg', gruppe: 'Brust', fig: 'liegestuetz',
    cue: 'Körper von Kopf bis Ferse gerade. Hände unter den Schultern. Absenken bis Ellbogen 90°, als Einheit hochdrücken. Ablassen doppelt so langsam wie hochdrücken.' },
  { id: 'situp', name: 'Sit-ups', typ: 'kg', gruppe: 'Rumpf', fig: 'situp',
    cue: 'Knie gebeugt, Arme vor der Brust gekreuzt. Hochrollen bis Ellbogen die Oberschenkel berühren, zurück bis Schulterblätter am Boden.' },
  { id: 'kniebeuge', name: 'Kniebeuge (Langhantel)', typ: 'last', gruppe: 'Beine', fig: 'kniebeuge',
    cue: 'Stange über den Schulterblättern, Rumpf fest, Fußspitzen ca. 30° nach außen. Beugen bis Oberschenkel waagerecht, Fersen bleiben am Boden.' },
  { id: 'ausfallschritt', name: 'Ausfallschritte mit Gewicht', typ: 'last', gruppe: 'Beine', fig: 'ausfallschritt',
    cue: 'Großer Schritt nach vorn, hinteres Knie Richtung Boden. Oberkörper aufrecht, vorderes Knie über dem Fuß.' },
  { id: 'kreuzheben', name: 'Kreuzheben', typ: 'last', gruppe: 'Beine', fig: 'kreuzheben',
    cue: 'Mittelfuß unter der Stange, Rücken gerade, Bauch fest. Stange nah an den Schienbeinen hochführen, oben Hüfte strecken.' },
  { id: 'bankdruecken', name: 'Bankdrücken', typ: 'last', gruppe: 'Brust', fig: 'bankdruecken',
    cue: 'Füße fest am Boden, Kopf, Schultern und Hüfte auf der Bank. Stange kontrolliert zur Brust, leichter Kontakt, dann strecken.' },
  { id: 'latzug', name: 'Latzug', typ: 'last', gruppe: 'Rücken', fig: 'latzug',
    cue: 'Brust raus, Stange zur oberen Brust ziehen, Schulterblätter nach unten. Langsam zurück.' },
  { id: 'rudern', name: 'Rudern (Langhantel/Kabel)', typ: 'last', gruppe: 'Rücken', fig: 'rudern',
    cue: 'Oberkörper ca. 45° vorgebeugt, Rücken gerade. Stange Richtung Bauchnabel ziehen.' },
  { id: 'schulterdruecken', name: 'Schulterdrücken', typ: 'last', gruppe: 'Schulter', fig: 'schulterdruecken',
    cue: 'Gerader Rücken, Rumpf fest. Gewicht über Kopf strecken, ohne ins Hohlkreuz zu gehen.' },
  { id: 'hyperextension', name: 'Hyperextension', typ: 'kgplus', gruppe: 'Rücken', fig: 'hyperextension',
    cue: 'Langsam ablassen und bis zur Verlängerung des Körpers aufrichten. Nicht überstrecken.' },
  { id: 'bizeps', name: 'Bizeps-Curls', typ: 'last', gruppe: 'Arme', fig: 'bizeps',
    cue: 'Ellbogen bleiben am Körper. Ohne Schwung beugen und kontrolliert strecken.' },
  { id: 'trizeps', name: 'Trizeps Kabelzug', typ: 'last', gruppe: 'Arme', fig: 'trizeps',
    cue: 'Oberarme fixiert am Körper, nur Unterarme bewegen bis zur vollen Streckung.' },
  { id: 'butterfly', name: 'Butterfly / Brustpresse', typ: 'last', gruppe: 'Brust', fig: 'bankdruecken',
    cue: 'Leicht gebeugte Ellbogen, Arme vor der Brust zusammenführen, langsam öffnen.' },
  { id: 'dips', name: 'Dips', typ: 'kgplus', gruppe: 'Arme', fig: 'dips',
    cue: 'Schultern tief, absenken bis Ellbogen ca. 90°, dann strecken.' },
  { id: 'plank', name: 'Unterarmstütz (Plank)', typ: 'zeit', gruppe: 'Rumpf', fig: 'plank',
    cue: 'Ellbogen unter den Schultern, Linie von Ferse bis Schulter. Bauch fest, nicht durchhängen.' },
  { id: 'burpee', name: 'Burpees', typ: 'kg', gruppe: 'Ganzkörper', fig: 'burpee',
    cue: 'Aus dem Stand in die Hocke, Beine zurück in den Stütz, Liegestütz, zurück in die Hocke, Strecksprung.' },
  { id: 'wadendruecken', name: 'Wadendrücken', typ: 'last', gruppe: 'Beine', fig: 'kniebeuge',
    cue: 'Fußspitzen auf Erhöhung, auf die Zehenspitzen drücken, Fersen kontrolliert absenken.' },
  { id: 'farmers', name: 'Farmer’s Carry', typ: 'last', gruppe: 'Ganzkörper', fig: 'kreuzheben',
    cue: 'Schwere Kurzhanteln seitlich, aufrecht und zügig gehen, Schultern nicht hochziehen.' },
];

export const exById = (id, custom = []) => EXERCISES.find((e) => e.id === id) || custom.find((e) => e.id === id);

export const TYP_LABEL = {
  last: 'Zusatzgewicht (Hantel/Maschine)',
  kg: 'Nur Körpergewicht',
  kgplus: 'Körpergewicht + Zusatzgewicht',
  zeit: 'Halten (Sekunden)',
};

export const videoLink = (name) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' richtige Ausführung');
