// Körperbild bei Schmerzen – KONFIGURATION. Keine Diagnosen: Die App nimmt belastende Übungen vorübergehend
// heraus und schiebt sanfte Übungen ein. Warnzeichen → nicht weitertrainieren, ärztlich/physiotherapeutisch abklären.
//
// Regionen-Typen: welche Übungen (IDs aus data/exercises.js) und Einheiten-Arten belasten die Stelle,
// und welche sanften Übungen (Mobilisation, Dehnen, Kräftigen) passen – jeweils nur schmerzfrei ausführen.
export const REGIONEN = {
  nacken: { name: 'Nacken', uebungen: ['schulterdruecken', 'pike', 'kreuzheben', 'rucksack_kreuzheben', 'farmers'], ohne: { marsch: true, kickbox: 'technik' },
    reha: { mobil: ['Kinn sanft einziehen (Doppelkinn), 10× 5 s halten', 'Schulterkreisen rückwärts 2× 10'], dehnen: ['Nacken seitlich: Ohr Richtung Schulter, 2× 30 s je Seite, ohne Zug'], kraeftigen: ['Schulterblätter zusammenziehen im Stehen, 2× 12'] } },
  schulter: { name: 'Schulter', uebungen: ['schulterdruecken', 'pike', 'bankdruecken', 'dips', 'butterfly', 'klimmzug', 'latzug', 'liegestuetz_erhoeht'], ohne: { kickbox: 'technik', schwimmen: 'locker' },
    reha: { mobil: ['Pendeln: Oberkörper vorgebeugt, Arm locker kreisen lassen, 2× 30 s', 'Wandrutschen (Unterarme an der Wand hochschieben), 2× 8'], dehnen: ['Brustdehnung im Türrahmen, 2× 30 s'], kraeftigen: ['Außenrotation mit leichtem Band, Ellbogen am Körper, 2× 15'] } },
  brust: { name: 'Brust', uebungen: ['bankdruecken', 'butterfly', 'dips', 'liegestuetz', 'liegestuetz_erhoeht', 'diamant'], ohne: { kickbox: 'technik' },
    reha: { mobil: ['Arme locker vor und zurück schwingen, 2× 15'], dehnen: ['Brustdehnung im Türrahmen, 2× 30 s, sanft'], kraeftigen: ['Schulterblätter zusammenziehen, 2× 12'] } },
  oberarm: { name: 'Oberarm', uebungen: ['bizeps', 'trizeps', 'rucksack_curl', 'dips', 'klimmzug', 'diamant'], ohne: {},
    reha: { mobil: ['Arm locker beugen und strecken, 2× 15'], dehnen: ['Trizeps-Dehnung über Kopf, 2× 30 s (nur wenn schmerzfrei)'], kraeftigen: ['Isometrisch: Ellbogen 90°, gegen die andere Hand drücken, 5× 10 s leicht'] } },
  ellbogen: { name: 'Ellbogen', uebungen: ['bizeps', 'trizeps', 'rucksack_curl', 'klimmzug', 'latzug', 'dips', 'farmers', 'diamant'], ohne: { kickbox: 'technik' },
    reha: { mobil: ['Unterarm drehen (Handfläche hoch/runter), 2× 15'], dehnen: ['Unterarm-Strecker dehnen: Arm gestreckt, Hand sanft nach unten, 2× 30 s'], kraeftigen: ['Handgelenk mit 1 kg langsam absenken (exzentrisch), 2× 12, schmerzfrei'] } },
  handgelenk: { name: 'Unterarm / Handgelenk', uebungen: ['liegestuetz', 'liegestuetz_erhoeht', 'diamant', 'burpee', 'plank', 'farmers', 'bankdruecken', 'klimmzug'], ohne: { kickbox: 'technik' },
    reha: { mobil: ['Handgelenk kreisen, 2× 10 je Richtung'], dehnen: ['Handfläche an die Wand, Finger nach unten, 2× 20 s'], kraeftigen: ['Faust öffnen und schließen gegen Gummiband, 2× 20'] } },
  bauch: { name: 'Bauch', uebungen: ['situp', 'plank', 'burpee'], ohne: {},
    reha: { mobil: ['Bauchatmung im Liegen, 10 ruhige Atemzüge'], dehnen: ['Kobra sanft (nur wenn schmerzfrei), 2× 20 s'], kraeftigen: ['Dead Bug langsam, 2× 6 je Seite'] } },
  oberer_ruecken: { name: 'Oberer Rücken', uebungen: ['rudern', 'rucksack_rudern', 'tischrudern', 'kreuzheben', 'rucksack_kreuzheben', 'klimmzug'], ohne: { marsch: 'leicht' },
    reha: { mobil: ['Open Books in Seitlage, 8 je Seite', 'Katze-Kuh im Vierfüßlerstand, 10×'], dehnen: ['Kindhaltung mit Armen nach vorn, 2× 30 s'], kraeftigen: ['Band ziehen zum Gesicht (leicht), 2× 15'] } },
  unterer_ruecken: { name: 'Unterer Rücken', uebungen: ['kreuzheben', 'rucksack_kreuzheben', 'kniebeuge', 'rucksack_kniebeuge', 'hyperextension', 'situp', 'rudern', 'rucksack_rudern', 'farmers', 'burpee'], ohne: { marsch: true, kickbox: 'technik' },
    reha: { mobil: ['Katze-Kuh, 10× langsam', 'Knie zur Brust im Liegen, 2× 30 s'], dehnen: ['Hüftbeuger im Halbkniestand, 2× 30 s je Seite'], kraeftigen: ['Hüftbrücke beidbeinig, 2× 12', 'Vierfüßler: Arm/Bein strecken (Bird Dog), 2× 6 je Seite'] } },
  huefte: { name: 'Hüfte / Leiste', uebungen: ['ausfallschritt', 'bulgarian', 'kniebeuge', 'rucksack_kniebeuge', 'burpee'], ohne: { laufen: 'locker', sprung: true },
    reha: { mobil: ['Beinpendel vor/zurück, 10 je Seite'], dehnen: ['Hüftbeuger im Halbkniestand, 2× 30 s je Seite'], kraeftigen: ['Clamshell in Seitlage, 2× 15 je Seite', 'Hüftbrücke, 2× 12'] } },
  gesaess: { name: 'Gesäß', uebungen: ['kreuzheben', 'rucksack_kreuzheben', 'ausfallschritt', 'bulgarian', 'glute_bridge'], ohne: { sprung: true },
    reha: { mobil: ['Hüftkreisen im Stehen, 10 je Richtung'], dehnen: ['Gesäßdehnung im Liegen (Bein über Knie), 2× 30 s'], kraeftigen: ['Hüftbrücke beidbeinig, 2× 10, schmerzfrei'] } },
  oberschenkel_vorn: { name: 'Oberschenkel vorn', uebungen: ['kniebeuge', 'rucksack_kniebeuge', 'ausfallschritt', 'bulgarian', 'burpee'], ohne: { laufen: 'locker', sprung: true },
    reha: { mobil: ['Radfahren locker (Ergometer) 5 min'], dehnen: ['Oberschenkel vorn im Stand (Ferse zum Gesäß), 2× 30 s'], kraeftigen: ['Oberschenkel anspannen im Sitzen (Knie strecken), 10× 5 s'] } },
  oberschenkel_hinten: { name: 'Oberschenkel hinten', uebungen: ['kreuzheben', 'rucksack_kreuzheben', 'hyperextension', 'glute_bridge'], ohne: { laufen: 'locker', sprint: true, sprung: true },
    reha: { mobil: ['Beinpendel locker, 10 je Seite'], dehnen: ['Rückseite sanft: Bein auf Stufe, Oberkörper aufrecht vorneigen, 2× 30 s'], kraeftigen: ['Hüftbrücke beidbeinig, 2× 10'] } },
  knie: { name: 'Knie', uebungen: ['kniebeuge', 'rucksack_kniebeuge', 'ausfallschritt', 'bulgarian', 'burpee', 'wadendruecken'], ohne: { laufen: true, marsch: true, sprung: true, kickbox: 'technik' },
    reha: { mobil: ['Knie im Sitzen locker beugen und strecken, 2× 15'], dehnen: ['Oberschenkel vorn und hinten sanft dehnen, je 2× 30 s'], kraeftigen: ['Bein gestreckt im Liegen anheben, 2× 12', 'Oberschenkel anspannen, 10× 5 s'] } },
  schienbein: { name: 'Schienbein', uebungen: ['burpee', 'wadendruecken'], ohne: { laufen: true, marsch: true, sprung: true },
    reha: { mobil: ['Fußkreisen, 10 je Richtung'], dehnen: ['Wade an der Wand dehnen, 2× 30 s'], kraeftigen: ['Zehen anziehen gegen leichten Widerstand, 2× 15'] } },
  wade: { name: 'Wade / Achillessehne', uebungen: ['wadendruecken', 'burpee'], ohne: { laufen: true, marsch: true, sprung: true },
    reha: { mobil: ['Fußkreisen, 10 je Richtung'], dehnen: ['Wade an der Wand, Bein gestreckt und gebeugt, je 2× 30 s'], kraeftigen: ['Wadenheben beidbeinig, langsam absenken, 2× 10 – nur schmerzfrei'] } },
  fuss: { name: 'Sprunggelenk / Fuß', uebungen: ['burpee', 'wadendruecken', 'ausfallschritt', 'bulgarian'], ohne: { laufen: true, marsch: true, sprung: true, kickbox: 'technik' },
    reha: { mobil: ['Fußkreisen und Alphabet mit dem Fuß schreiben, 1×'], dehnen: ['Wade an der Wand, 2× 30 s'], kraeftigen: ['Handtuch mit den Zehen greifen, 2× 10', 'Einbeinstand (nur schmerzfrei), 2× 20 s'] } },
};

// Klickbereiche auf dem Körperbild (Ansicht 200 × 440). seite: l/r aus Sicht der Person (vorne gespiegelt).
const R = (id, typ, seite, shape) => ({ id, typ, seite, shape });
export const KOERPER = {
  vorne: [
    R('nacken_v', 'nacken', null, { e: [100, 72, 14, 9] }),
    R('schulter_r_v', 'schulter', 'r', { e: [64, 92, 16, 13] }), R('schulter_l_v', 'schulter', 'l', { e: [136, 92, 16, 13] }),
    R('brust_v', 'brust', null, { r: [74, 96, 52, 40] }),
    R('oberarm_r_v', 'oberarm', 'r', { r: [44, 106, 18, 46] }), R('oberarm_l_v', 'oberarm', 'l', { r: [138, 106, 18, 46] }),
    R('ellbogen_r_v', 'ellbogen', 'r', { e: [50, 158, 10, 9] }), R('ellbogen_l_v', 'ellbogen', 'l', { e: [150, 158, 10, 9] }),
    R('hand_r_v', 'handgelenk', 'r', { r: [36, 168, 18, 52] }), R('hand_l_v', 'handgelenk', 'l', { r: [146, 168, 18, 52] }),
    R('bauch_v', 'bauch', null, { r: [76, 138, 48, 54] }),
    R('huefte_r_v', 'huefte', 'r', { r: [70, 194, 28, 26] }), R('huefte_l_v', 'huefte', 'l', { r: [102, 194, 28, 26] }),
    R('ov_r_v', 'oberschenkel_vorn', 'r', { r: [70, 222, 26, 70] }), R('ov_l_v', 'oberschenkel_vorn', 'l', { r: [104, 222, 26, 70] }),
    R('knie_r_v', 'knie', 'r', { e: [83, 302, 13, 12] }), R('knie_l_v', 'knie', 'l', { e: [117, 302, 13, 12] }),
    R('schien_r_v', 'schienbein', 'r', { r: [74, 318, 20, 76] }), R('schien_l_v', 'schienbein', 'l', { r: [106, 318, 20, 76] }),
    R('fuss_r_v', 'fuss', 'r', { e: [82, 410, 15, 12] }), R('fuss_l_v', 'fuss', 'l', { e: [118, 410, 15, 12] }),
  ],
  hinten: [
    R('nacken_h', 'nacken', null, { e: [100, 72, 14, 9] }),
    R('schulter_l_h', 'schulter', 'l', { e: [64, 92, 16, 13] }), R('schulter_r_h', 'schulter', 'r', { e: [136, 92, 16, 13] }),
    R('or_h', 'oberer_ruecken', null, { r: [74, 96, 52, 46] }),
    R('oberarm_l_h', 'oberarm', 'l', { r: [44, 106, 18, 46] }), R('oberarm_r_h', 'oberarm', 'r', { r: [138, 106, 18, 46] }),
    R('ellbogen_l_h', 'ellbogen', 'l', { e: [50, 158, 10, 9] }), R('ellbogen_r_h', 'ellbogen', 'r', { e: [150, 158, 10, 9] }),
    R('hand_l_h', 'handgelenk', 'l', { r: [36, 168, 18, 52] }), R('hand_r_h', 'handgelenk', 'r', { r: [146, 168, 18, 52] }),
    R('ur_h', 'unterer_ruecken', null, { r: [76, 144, 48, 48] }),
    R('gesaess_l_h', 'gesaess', 'l', { r: [70, 194, 28, 30] }), R('gesaess_r_h', 'gesaess', 'r', { r: [102, 194, 28, 30] }),
    R('oh_l_h', 'oberschenkel_hinten', 'l', { r: [70, 226, 26, 66] }), R('oh_r_h', 'oberschenkel_hinten', 'r', { r: [104, 226, 26, 66] }),
    R('knie_l_h', 'knie', 'l', { e: [83, 302, 13, 12] }), R('knie_r_h', 'knie', 'r', { e: [117, 302, 13, 12] }),
    R('wade_l_h', 'wade', 'l', { r: [74, 318, 20, 76] }), R('wade_r_h', 'wade', 'r', { r: [106, 318, 20, 76] }),
    R('fuss_l_h', 'fuss', 'l', { e: [82, 410, 15, 12] }), R('fuss_r_h', 'fuss', 'r', { e: [118, 410, 15, 12] }),
  ],
};

export const ARTEN = ['stechend', 'dumpf', 'ziehend'];

// Warnzeichen: nicht weitertrainieren, sondern zum Arzt oder Physio
export const WARNUNG = {
  staerkeAb: 7, arten: ['stechend'], laengerAlsTage: 7,
  text: 'Bitte nicht weitertrainieren, sondern zum Arzt oder Physiotherapeuten: bei starken oder stechenden Schmerzen, Schwellung, Taubheit oder Kribbeln, oder wenn Schmerzen länger als eine Woche anhalten. Die App stellt keine Diagnose.',
};
