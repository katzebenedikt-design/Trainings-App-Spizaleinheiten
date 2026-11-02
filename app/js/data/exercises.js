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
  { id: 'butterfly', name: 'Butterfly / Brustpresse', typ: 'last', gruppe: 'Brust', fig: 'butterfly',
    cue: 'Leicht gebeugte Ellbogen, Arme vor der Brust zusammenführen, langsam öffnen.' },
  { id: 'dips', name: 'Dips', typ: 'kgplus', gruppe: 'Arme', fig: 'dips',
    cue: 'Schultern tief, absenken bis Ellbogen ca. 90°, dann strecken.' },
  { id: 'plank', name: 'Unterarmstütz (Plank)', typ: 'zeit', gruppe: 'Rumpf', fig: 'plank',
    cue: 'Ellbogen unter den Schultern, Linie von Ferse bis Schulter. Bauch fest, nicht durchhängen.' },
  { id: 'burpee', name: 'Burpees', typ: 'kg', gruppe: 'Ganzkörper', fig: 'burpee',
    cue: 'Aus dem Stand in die Hocke, Beine zurück in den Stütz, Liegestütz, zurück in die Hocke, Strecksprung.' },
  { id: 'wadendruecken', name: 'Wadendrücken', typ: 'last', gruppe: 'Beine', fig: 'wade',
    cue: 'Fußspitzen auf Erhöhung, auf die Zehenspitzen drücken, Fersen kontrolliert absenken.' },
  { id: 'farmers', name: 'Farmer’s Carry', typ: 'last', gruppe: 'Ganzkörper', fig: 'farmers',
    cue: 'Schwere Kurzhanteln seitlich, aufrecht und zügig gehen, Schultern nicht hochziehen. Beim Eintragen: Feld „Wdh.“ = Meter.' },
  // Alternativen ohne Studio (Rucksack oder nur Körpergewicht)
  { id: 'rucksack_kniebeuge', name: 'Kniebeuge mit Rucksack', typ: 'last', gruppe: 'Beine', fig: 'kniebeuge_rucksack', alt: true,
    cue: 'Rucksack eng auf beiden Schultern oder vor der Brust. Wie Langhantel-Kniebeuge: Oberschenkel waagerecht, Fersen am Boden.' },
  { id: 'bulgarian', name: 'Split Squat, vorderer Fuß erhöht', typ: 'kgplus', gruppe: 'Beine', fig: 'splitsquat', alt: true,
    cue: 'Vorderer Fuß auf einer niedrigen Stufe, hinteres Knie Richtung Boden. Oberkörper aufrecht, Knie über dem Fuß. Kanister oder Rucksack in den Händen macht es schwerer.' },
  { id: 'rucksack_kreuzheben', name: 'Kreuzheben mit Rucksack', typ: 'last', gruppe: 'Beine', fig: 'kreuzheben_rucksack', alt: true,
    cue: 'Rucksack an den Griffen vor den Schienbeinen. Rücken gerade, aus der Hüfte aufrichten.' },
  { id: 'glute_bridge', name: 'Einbeinige Hüftbrücke', typ: 'kg', gruppe: 'Beine', fig: 'bridge', alt: true,
    cue: 'Rückenlage, ein Bein gestreckt. Hüfte hochdrücken bis Linie Knie–Schulter, 2 s halten.' },
  { id: 'tischrudern', name: 'Rudern am Tisch / Ringe', typ: 'kg', gruppe: 'Rücken', fig: 'tischrudern', alt: true,
    cue: 'Unter einen stabilen Tisch legen, Kante greifen, Körper gerade zur Kante ziehen. Füße weiter vorn = schwerer.' },
  { id: 'rucksack_rudern', name: 'Rudern mit Rucksack', typ: 'last', gruppe: 'Rücken', fig: 'rudern_rucksack', alt: true,
    cue: '45° vorgebeugt, Rücken gerade, Rucksack zum Bauchnabel ziehen.' },
  { id: 'pike', name: 'Schulterdrücken mit Rucksack', typ: 'last', gruppe: 'Schulter', fig: 'schulter_rucksack', alt: true,
    cue: 'Rucksack an den Trageschlaufen oder am Boden fassen, vor die Schultern bringen und über Kopf strecken. Rumpf fest, kein Hohlkreuz.' },
  { id: 'diamant', name: 'Enge Liegestütze', typ: 'kg', gruppe: 'Arme', fig: 'liegestuetz_eng', alt: true,
    cue: 'Hände enger als schulterbreit, Ellbogen beim Absenken eng am Körper. Körper bleibt gerade.' },
  { id: 'rucksack_curl', name: 'Curls mit Rucksack/Wasserkanister', typ: 'last', gruppe: 'Arme', fig: 'curl_rucksack', alt: true,
    cue: 'Ellbogen am Körper, ohne Schwung beugen.' },
  { id: 'liegestuetz_erhoeht', name: 'Liegestütze Füße erhöht', typ: 'kg', gruppe: 'Brust', fig: 'liegestuetz_erhoeht', alt: true,
    cue: 'Füße auf Stuhl oder Bank. Körper gerade, Brust zum Boden.' },
];

import { enrichExercise } from './exercise-info.js';
EXERCISES.forEach(enrichExercise);

export const exById = (id, custom = []) => EXERCISES.find((e) => e.id === id) || custom.find((e) => e.id === id);

export const TYP_LABEL = {
  last: 'Zusatzgewicht (Hantel/Maschine)',
  kg: 'Nur Körpergewicht',
  kgplus: 'Körpergewicht + Zusatzgewicht',
  zeit: 'Halten (Sekunden)',
};

export const videoLink = (name) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' richtige Ausführung');
