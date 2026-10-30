// Englisch ab null: 26-Wochen-Plan in 3 Phasen (elite-language-coach + militaer-englisch.md).
// Chunks statt Einzelwörter, Hören vor Sprechen, Alltag und Einsatz abwechselnd.
// Chunk: [Englisch, Deutsch, ...weitere akzeptierte englische Varianten]
export const PHASES_EN = [
  { n: 1, name: 'Fundament', weeks: '1–8', level: 'Level 0 → A1', goal: 'Vorstellen, Zahlen, Uhrzeit, Nachfragen, NATO-Alphabet, Funkzahlen' },
  { n: 2, name: 'Einsatz-Grundlagen', weeks: '9–17', level: 'A1 → A2', goal: 'Funkverfahren, Befehle, Körper, Sport, Ausbildung, Wege' },
  { n: 3, name: 'Einsatz', weeks: '18–26', level: 'A2 → B1', goal: 'Karte, Erste Hilfe, Lagemeldung, Checkpoint, erzählen' },
];

export const UNITS_EN = [
  { id: 'u1', phase: 1, week: 1, title: 'Begrüßen & Vorstellen', lessons: [
    [['Hello, my name is Ben.', 'Hallo, ich heiße Ben.', 'Hi, my name is Ben.'], ['Nice to meet you.', 'Freut mich, dich kennenzulernen.', 'Pleased to meet you.'], ['I am from Germany.', 'Ich komme aus Deutschland.', "I'm from Germany."], ['How are you?', 'Wie geht es dir?'], ['I am fine, thank you.', 'Mir geht es gut, danke.', "I'm fine, thanks.", "I'm good, thank you."]],
    [['I am an apprentice.', 'Ich bin Auszubildender.', "I'm an apprentice.", 'I am a trainee.'], ['I work in refrigeration.', 'Ich arbeite in der Kältetechnik.'], ['I want to join the special forces.', 'Ich will zu den Spezialkräften.', 'I want to join special forces.'], ['What is your name?', 'Wie heißt du?', "What's your name?"], ['See you tomorrow.', 'Bis morgen.']],
  ] },
  { id: 'u2', phase: 1, week: 2, title: 'Zahlen & Uhrzeit', lessons: [
    [['one, two, three, four, five', 'eins, zwei, drei, vier, fünf'], ['six, seven, eight, nine, ten', 'sechs, sieben, acht, neun, zehn'], ['twenty, thirty, forty, fifty', 'zwanzig, dreißig, vierzig, fünfzig'], ['one hundred', 'hundert', 'a hundred'], ['How many?', 'Wie viele?']],
    [['What time is it?', 'Wie spät ist es?', "What's the time?"], ['It is seven o’clock.', 'Es ist sieben Uhr.', "It's seven o'clock.", 'It is seven o clock'], ['It is half past four.', 'Es ist halb fünf.', "It's half past four."], ['in ten minutes', 'in zehn Minuten'], ['We start at six.', 'Wir fangen um sechs an.', 'We start at six o’clock.']],
  ] },
  { id: 'u3', phase: 1, week: 3, title: 'Nachfragen', lessons: [
    [['Sorry, again please?', 'Entschuldigung, nochmal bitte?', 'Sorry, again, please?'], ['Can you say that again?', 'Kannst du das wiederholen?', 'Could you say that again?'], ['Please speak slowly.', 'Bitte sprich langsam.', 'Speak slowly, please.'], ['I don’t understand.', 'Ich verstehe nicht.', "I don't understand.", 'I do not understand.'], ['What does that mean?', 'Was bedeutet das?']],
    [['How do you say that in English?', 'Wie sagt man das auf Englisch?'], ['Can you spell that?', 'Kannst du das buchstabieren?', 'Could you spell that?'], ['Is that correct?', 'Ist das richtig?', 'Is that right?'], ['I have a question.', 'Ich habe eine Frage.'], ['Understood.', 'Verstanden.', 'I understand.']],
  ] },
  { id: 'u4', phase: 1, week: 4, title: 'NATO-Alphabet', nato: true, lessons: [
    [['Alfa, Bravo, Charlie, Delta', 'A, B, C, D', 'Alpha, Bravo, Charlie, Delta'], ['Echo, Foxtrot, Golf, Hotel', 'E, F, G, H'], ['India, Juliett, Kilo, Lima', 'I, J, K, L', 'India, Juliet, Kilo, Lima'], ['Mike, November, Oscar, Papa', 'M, N, O, P'], ['Quebec, Romeo, Sierra, Tango', 'Q, R, S, T']],
    [['Uniform, Victor, Whiskey', 'U, V, W', 'Uniform, Victor, Whisky'], ['X-ray, Yankee, Zulu', 'X, Y, Z', 'Xray, Yankee, Zulu'], ['My name is Bravo, Echo, November.', 'Mein Name ist B-E-N.'], ['I spell: Kilo, Sierra, Kilo.', 'Ich buchstabiere: K-S-K.'], ['Say again your call sign.', 'Wiederhole dein Rufzeichen.', 'Say again your callsign.']],
  ] },
  { id: 'u5', phase: 1, week: 5, title: 'Zahlen im Funk', lessons: [
    [['niner', '9 im Funk (niner)', 'nine'], ['tree', '3 im Funk (tree)', 'three'], ['fife', '5 im Funk (fife)', 'five'], ['one-five-zero-zero', '1500 (Ziffern einzeln)', 'one five zero zero'], ['time now one-four-three-zero', 'Uhrzeit jetzt 14:30', 'time now one four three zero']],
    [['grid one-two-tree, four-fife-six', 'Planquadrat 123 456', 'grid one two three four five six'], ['distance two hundred meters', 'Entfernung zweihundert Meter', 'distance two hundred metres'], ['heading niner-zero', 'Kurs 90', 'heading nine zero'], ['two klicks north', 'zwei Kilometer nördlich', 'two clicks north'], ['figures', 'Zahlen folgen (figures)']],
  ] },
  { id: 'u6', phase: 1, week: 7, title: 'Wege & Orte', lessons: [
    [['Where is the station?', 'Wo ist der Bahnhof?', 'Where is the train station?'], ['Go straight ahead.', 'Geh geradeaus.', 'Go straight on.'], ['Turn left.', 'Bieg links ab.'], ['Turn right at the bridge.', 'An der Brücke rechts abbiegen.'], ['It is near the river.', 'Es ist in der Nähe des Flusses.', "It's near the river."]],
    [['How far is it?', 'Wie weit ist es?'], ['About two kilometers.', 'Ungefähr zwei Kilometer.', 'About two kilometres.'], ['behind the building', 'hinter dem Gebäude'], ['in front of the gate', 'vor dem Tor'], ['Follow me.', 'Folge mir.']],
  ] },
  { id: 'u7', phase: 2, week: 9, title: 'Funkverfahren', lessons: [
    [['Radio check, over.', 'Funkprobe, kommen.'], ['Loud and clear, over.', 'Laut und klar, kommen.', 'Loud and clear.'], ['Roger.', 'Verstanden (Roger).', 'Roger that.'], ['Wilco.', 'Verstanden, wird ausgeführt.'], ['Say again, over.', 'Wiederholen, kommen.', 'Say again.']],
    [['Bravo two, this is Alfa one, over.', 'Bravo zwo, hier Alfa eins, kommen.', 'Bravo two this is Alpha one over'], ['Wait, out.', 'Warten, Ende.', 'Wait out.'], ['Affirmative.', 'Ja (bestätigt).'], ['Negative.', 'Nein (negativ).'], ['Copy, out.', 'Verstanden, Ende.', 'Copy that, out.']],
  ] },
  { id: 'u8', phase: 2, week: 10, title: 'Befehle & Bewegung', lessons: [
    [['Move!', 'Los, bewegen!', 'Move'], ['Get down!', 'Runter!', 'Get down'], ['Take cover!', 'In Deckung!', 'Cover!'], ['Contact front!', 'Feindkontakt vorne!', 'Contact front'], ['Hold position.', 'Position halten.']],
    [['Fall back!', 'Zurückziehen!'], ['On me!', 'Zu mir!', 'On me'], ['Contact left, at your nine o’clock!', 'Kontakt links, auf neun Uhr!', "Contact left, nine o'clock"], ['Advance to the tree line.', 'Vorrücken bis zur Baumgrenze.'], ['Clear!', 'Gesichert / Frei!', 'Clear']],
  ] },
  { id: 'u9', phase: 2, week: 11, title: 'Körper & Gesundheit', lessons: [
    [['My knee hurts.', 'Mein Knie tut weh.'], ['I have a blister.', 'Ich habe eine Blase.'], ['I need water.', 'Ich brauche Wasser.'], ['I am tired.', 'Ich bin müde.', "I'm tired."], ['I feel good.', 'Ich fühle mich gut.']],
    [['head, shoulder, arm, hand', 'Kopf, Schulter, Arm, Hand'], ['leg, knee, foot, back', 'Bein, Knie, Fuß, Rücken'], ['I need a doctor.', 'Ich brauche einen Arzt.'], ['Where does it hurt?', 'Wo tut es weh?'], ['Take a break.', 'Mach eine Pause.']],
  ] },
  { id: 'u10', phase: 2, week: 12, title: 'Sport & Training', lessons: [
    [['ten push-ups', 'zehn Liegestütze', '10 push-ups', 'ten pushups'], ['pull-ups', 'Klimmzüge', 'pullups'], ['sit-ups', 'Sit-ups', 'situps'], ['ruck march', 'Marsch mit Gepäck'], ['Keep the pace!', 'Halte das Tempo!', 'Keep the pace']],
    [['Three sets of twenty.', 'Drei Sätze à zwanzig.', '3 sets of 20'], ['Rest one minute.', 'Eine Minute Pause.'], ['Last one!', 'Letzte!', 'Last one'], ['Again!', 'Nochmal!', 'Again'], ['Run faster!', 'Schneller laufen!', 'Run faster']],
  ] },
  { id: 'u11', phase: 2, week: 14, title: 'Arbeit & Ausbildung', lessons: [
    [['I start work at seven fifteen.', 'Ich fange um 7:15 an zu arbeiten.', 'I start work at 7:15.'], ['I finish at four fifteen.', 'Ich bin um 16:15 fertig.', 'I finish at 4:15.'], ['I go to vocational school.', 'Ich gehe zur Berufsschule.'], ['I repair cooling systems.', 'Ich repariere Kühlanlagen.'], ['My job is hard work.', 'Meine Arbeit ist harte Arbeit.']],
    [['I train every evening.', 'Ich trainiere jeden Abend.'], ['I go to the gym on weekdays.', 'Unter der Woche gehe ich ins Fitnessstudio.'], ['On Saturday I march.', 'Am Samstag marschiere ich.'], ['Sunday is my rest day.', 'Sonntag ist mein Ruhetag.'], ['I have a plan.', 'Ich habe einen Plan.']],
  ] },
  { id: 'u12', phase: 2, week: 16, title: 'Essen & Einkaufen', lessons: [
    [['How much is it?', 'Wie viel kostet das?', 'How much is this?'], ['I would like a coffee.', 'Ich hätte gern einen Kaffee.', "I'd like a coffee."], ['The bill, please.', 'Die Rechnung, bitte.', 'Can I have the bill, please?'], ['Do you have water?', 'Haben Sie Wasser?'], ['Can I pay by card?', 'Kann ich mit Karte zahlen?']],
    [['I am hungry.', 'Ich habe Hunger.', "I'm hungry."], ['That is enough.', 'Das reicht.', "That's enough."], ['Where can I buy food?', 'Wo kann ich Essen kaufen?'], ['It is closed.', 'Es ist geschlossen.', "It's closed."], ['Thank you very much.', 'Vielen Dank.', 'Thanks a lot.']],
  ] },
  { id: 'u13', phase: 3, week: 18, title: 'Orientierung & Karte', lessons: [
    [['What is your position?', 'Was ist deine Position?', "What's your position?"], ['My position is grid four-five-six, seven-eight-niner.', 'Meine Position ist Planquadrat 456 789.'], ['bearing two-seven-zero', 'Marschrichtung 270 Grad', 'bearing two seven zero'], ['We are at the checkpoint.', 'Wir sind am Kontrollpunkt.'], ['Rally point is the bridge.', 'Sammelpunkt ist die Brücke.']],
    [['ridge, hill, valley', 'Bergrücken, Hügel, Tal'], ['Follow the road north.', 'Folge der Straße nach Norden.'], ['We cross the river here.', 'Wir überqueren hier den Fluss.'], ['landing zone', 'Landezone'], ['We are lost. Check the map.', 'Wir haben uns verlaufen. Karte prüfen.']],
  ] },
  { id: 'u14', phase: 3, week: 19, title: 'Erste Hilfe im Einsatz', lessons: [
    [['Man down!', 'Mann am Boden!', 'Man down'], ['Medic!', 'Sanitäter!', 'Medic'], ['Where are you hit?', 'Wo bist du getroffen?'], ['Stay with me.', 'Bleib bei mir.'], ['Apply pressure.', 'Druck ausüben.', 'Apply pressure here.']],
    [['He is bleeding from the leg.', 'Er blutet am Bein.', "He's bleeding from the leg."], ['Tourniquet on, time one-two-zero-zero.', 'Tourniquet angelegt, Zeit 12:00.'], ['He is conscious and breathing.', 'Er ist bei Bewusstsein und atmet.', "He's conscious and breathing."], ['We need evacuation.', 'Wir brauchen eine Evakuierung.', 'We need a medevac.'], ['One casualty, urgent.', 'Ein Verwundeter, dringend.']],
  ] },
  { id: 'u15', phase: 3, week: 21, title: 'Lagemeldung & Briefing', lessons: [
    [['This is the mission.', 'Das ist der Auftrag.'], ['Our objective is the bridge.', 'Unser Ziel ist die Brücke.'], ['Timeline: we move at zero-four-hundred.', 'Zeitplan: Abmarsch um 04:00.', 'We move at zero four hundred.'], ['Any questions?', 'Noch Fragen?'], ['Threat: enemy patrol in the north.', 'Bedrohung: Feindpatrouille im Norden.']],
    [['Report: two vehicles moving south.', 'Meldung: zwei Fahrzeuge fahren nach Süden.'], ['Time now one-six-hundred.', 'Uhrzeit jetzt 16:00.'], ['We need more ammunition.', 'Wir brauchen mehr Munition.'], ['Weather: rain, low visibility.', 'Wetter: Regen, schlechte Sicht.'], ['Mission complete.', 'Auftrag erfüllt.', 'Mission accomplished.']],
  ] },
  { id: 'u16', phase: 3, week: 22, title: 'Checkpoint & Zivilisten', lessons: [
    [['Stop!', 'Halt!', 'Stop'], ['Hands up!', 'Hände hoch!', 'Hands up'], ['Show me your ID.', 'Zeigen Sie mir Ihren Ausweis.', 'Show me your ID, please.'], ['Where are you going?', 'Wohin gehen Sie?'], ['Do you speak English?', 'Sprechen Sie Englisch?']],
    [['Stay calm.', 'Bleiben Sie ruhig.', 'Stay calm, please.'], ['We are here to help.', 'Wir sind hier, um zu helfen.', "We're here to help."], ['Do you need help?', 'Brauchen Sie Hilfe?'], ['Wait here, please.', 'Bitte hier warten.', 'Please wait here.'], ['You can go.', 'Sie können gehen.']],
  ] },
  { id: 'u17', phase: 3, week: 24, title: 'Wetter & Natur', lessons: [
    [['It is raining.', 'Es regnet.', "It's raining."], ['It is very cold tonight.', 'Heute Nacht ist es sehr kalt.', "It's very cold tonight."], ['The wind is strong.', 'Der Wind ist stark.'], ['fog in the valley', 'Nebel im Tal'], ['The sun rises at six.', 'Die Sonne geht um sechs auf.']],
    [['forest, field, river', 'Wald, Feld, Fluss'], ['The ground is wet.', 'Der Boden ist nass.'], ['We sleep outside.', 'Wir schlafen draußen.'], ['It will be dark soon.', 'Es wird bald dunkel.'], ['Check the weather.', 'Prüf das Wetter.']],
  ] },
  { id: 'u18', phase: 3, week: 25, title: 'Pläne & Vergangenheit', lessons: [
    [['Yesterday I ran ten kilometers.', 'Gestern bin ich zehn Kilometer gelaufen.', 'Yesterday I ran 10 kilometers.'], ['Last week I was tired.', 'Letzte Woche war ich müde.'], ['I did my best.', 'Ich habe mein Bestes gegeben.'], ['We marched for five hours.', 'Wir sind fünf Stunden marschiert.'], ['I passed the test.', 'Ich habe den Test bestanden.']],
    [['Tomorrow I will swim.', 'Morgen werde ich schwimmen.', "Tomorrow I'll swim."], ['Next year I will apply.', 'Nächstes Jahr bewerbe ich mich.', "Next year I'll apply."], ['My goal is the selection course.', 'Mein Ziel ist das Auswahlverfahren.'], ['I am going to train harder.', 'Ich werde härter trainieren.', "I'm going to train harder."], ['I will never quit.', 'Ich werde niemals aufgeben.', "I'll never quit."]],
  ] },
];

// Funkvokabular für Karteikarten (immer verfügbar)
export const FUNK_DECK = [
  ['Alfa', 'A'], ['Bravo', 'B'], ['Charlie', 'C'], ['Delta', 'D'], ['Echo', 'E'], ['Foxtrot', 'F'], ['Golf', 'G'], ['Hotel', 'H'], ['India', 'I'], ['Juliett', 'J'], ['Kilo', 'K'], ['Lima', 'L'], ['Mike', 'M'],
  ['November', 'N'], ['Oscar', 'O'], ['Papa', 'P'], ['Quebec', 'Q'], ['Romeo', 'R'], ['Sierra', 'S'], ['Tango', 'T'], ['Uniform', 'U'], ['Victor', 'V'], ['Whiskey', 'W'], ['X-ray', 'X'], ['Yankee', 'Y'], ['Zulu', 'Z'],
  ['Roger', 'Verstanden'], ['Wilco', 'Verstanden, wird ausgeführt'], ['Over', 'Kommen (ich warte auf Antwort)'], ['Out', 'Ende (Gespräch beendet)'], ['Say again', 'Wiederholen'], ['Radio check', 'Funkprobe'],
  ['Loud and clear', 'Laut und klar'], ['Wait out', 'Warten, Ende'], ['Affirmative', 'Ja'], ['Negative', 'Nein'], ['Copy', 'Verstanden / mitgeschrieben'], ['Break', 'Trennung (Pause im Spruch)'],
  ['niner', '9'], ['tree', '3'], ['fife', '5'], ['Contact', 'Feindkontakt'], ['Casualty', 'Verwundeter'], ['Rally point', 'Sammelpunkt'], ['Checkpoint', 'Kontrollpunkt'], ['Grid', 'Planquadrat / Koordinate'],
  ['Bearing', 'Marschrichtung (Grad)'], ['Heading', 'Kurs'], ['Klick', 'Kilometer'], ['ETA', 'Voraussichtliche Ankunftszeit'], ['Medevac', 'Verwundetentransport'], ['Hold position', 'Position halten'],
];

// Vorgefertigte Gespräche: App spricht, du antwortest. Mehrere richtige Antworten.
export const DIALOGS = [
  { id: 'd1', title: 'Vorstellen beim Ausbilder', level: 1, turns: [
    { say: 'Hello. What is your name?', de: 'Hallo. Wie heißt du?', expect: ['my name is *', 'i am *', "i'm *", '*'], hint: 'My name is …' },
    { say: 'Where are you from?', de: 'Woher kommst du?', expect: ['i am from germany', "i'm from germany", 'from germany', 'germany'], hint: 'I am from Germany.' },
    { say: 'What do you do?', de: 'Was machst du beruflich?', expect: ['i am an apprentice', "i'm an apprentice", 'i am a trainee', 'i work in refrigeration', 'apprentice'], hint: 'I am an apprentice.' },
    { say: 'Why are you here?', de: 'Warum bist du hier?', expect: ['i want to join the special forces', 'i want to join special forces', 'special forces'], hint: 'I want to join the special forces.' },
  ] },
  { id: 'd2', title: 'Nachfragen', level: 1, turns: [
    { say: 'The briefing starts at fourteen thirty in building niner.', de: 'Das Briefing beginnt um 14:30 in Gebäude 9.', expect: ['sorry again please', 'can you say that again', 'say again', 'could you say that again', 'please speak slowly'], hint: 'Sorry, again please? / Can you say that again?' },
    { say: 'The briefing starts at two thirty in building nine.', de: 'Das Briefing beginnt um halb drei in Gebäude 9.', expect: ['understood', 'thank you', 'thanks', 'okay thank you', 'roger'], hint: 'Understood. Thank you.' },
  ] },
  { id: 'd3', title: 'Funkprobe', level: 2, turns: [
    { say: 'Bravo two, this is Alfa one, radio check, over.', de: 'Bravo zwo, hier Alfa eins, Funkprobe, kommen.', expect: ['alfa one this is bravo two loud and clear over', 'alpha one this is bravo two loud and clear over', 'loud and clear over', 'loud and clear'], hint: 'Alfa one, this is Bravo two, loud and clear, over.' },
    { say: 'Bravo two, roger, out.', de: 'Bravo zwo, verstanden, Ende.', expect: ['*'], hint: '(Gespräch beendet – keine Antwort nötig. Sag z. B. „out“.)' },
  ] },
  { id: 'd4', title: 'Positionsmeldung', level: 2, turns: [
    { say: 'Charlie three, this is Alfa one, send your position, over.', de: 'Charlie drei, hier Alfa eins, melde deine Position, kommen.', expect: ['alfa one this is charlie three my position is grid * over', 'my position is grid *', 'position grid *', 'grid *'], hint: 'Alfa one, this is Charlie three, my position is grid one-two-tree, four-fife-six, over.' },
    { say: 'Roger. Move to the rally point at the bridge, over.', de: 'Verstanden. Zum Sammelpunkt an der Brücke, kommen.', expect: ['wilco over', 'wilco', 'roger moving to the rally point over', 'roger over', 'roger'], hint: 'Wilco, over.' },
  ] },
  { id: 'd5', title: 'Schlechte Verbindung', level: 2, turns: [
    { say: 'Delta four, this is … krrr … rally point … krrr … over.', de: 'Delta vier, hier … (Rauschen) … Sammelpunkt … kommen.', expect: ['say again over', 'say again', 'say again all after rally point over', 'say again your last over'], hint: 'Say again, over.' },
    { say: 'I say again: move to rally point bravo, over.', de: 'Ich wiederhole: zum Sammelpunkt Bravo, kommen.', expect: ['wilco over', 'wilco', 'roger over', 'roger moving to rally point bravo over', 'copy over'], hint: 'Wilco, over.' },
  ] },
  { id: 'd6', title: 'Verwundeter', level: 3, turns: [
    { say: 'Man down! Where are you hit?', de: 'Mann am Boden! Wo bist du getroffen?', expect: ['my leg', 'in my leg', 'my left leg', 'my right leg', 'my arm', 'leg', 'arm'], hint: 'My leg.' },
    { say: 'Stay with me. Are you bleeding?', de: 'Bleib bei mir. Blutest du?', expect: ['yes', 'yes i am bleeding', 'yes my leg is bleeding', 'yes a lot', 'affirmative'], hint: 'Yes, I am bleeding.' },
    { say: 'Medic is coming. What do you need?', de: 'Der Sanitäter kommt. Was brauchst du?', expect: ['i need a tourniquet', 'tourniquet', 'apply pressure', 'i need water', 'i need a medic', 'pressure'], hint: 'I need a tourniquet. / Apply pressure.' },
  ] },
  { id: 'd7', title: 'Checkpoint', level: 3, turns: [
    { say: '(Ein Fahrzeug nähert sich deinem Kontrollpunkt.) Was sagst du?', de: 'Halte das Fahrzeug an.', speakDe: true, expect: ['stop', 'stop the car', 'stop please', 'stop stay in the car'], hint: 'Stop!' },
    { say: 'Hello? I do not understand.', de: 'Hallo? Ich verstehe nicht.', expect: ['do you speak english', 'show me your id', 'show me your id please', 'stay calm', 'stay calm we are here to help'], hint: 'Do you speak English? / Show me your ID, please.' },
    { say: 'Yes, a little. Here is my ID.', de: 'Ja, ein bisschen. Hier ist mein Ausweis.', expect: ['where are you going', 'thank you where are you going', 'thank you', 'wait here please'], hint: 'Thank you. Where are you going?' },
    { say: 'To the market in the village.', de: 'Zum Markt im Dorf.', expect: ['you can go', 'okay you can go', 'thank you you can go', 'wait here please'], hint: 'Okay, you can go.' },
  ] },
  { id: 'd8', title: 'Briefing zusammenfassen', level: 3, turns: [
    { say: 'Listen. Mission: we secure the bridge. We move at zero-four-hundred. Threat: enemy patrol in the north. Weather: rain. Any questions?', de: 'Auftrag: Brücke sichern. Abmarsch 04:00. Bedrohung: Patrouille im Norden. Wetter: Regen.', expect: ['we secure the bridge', 'secure the bridge', 'we move at zero four hundred', 'the bridge', 'no questions', 'no questions sir'], hint: 'Fass zusammen: We secure the bridge, we move at zero-four-hundred.' },
    { say: 'Good. What is the threat?', de: 'Gut. Was ist die Bedrohung?', expect: ['enemy patrol in the north', 'an enemy patrol in the north', 'enemy patrol', 'patrol in the north'], hint: 'Enemy patrol in the north.' },
  ] },
];

// Weitere Sprachen: Überlebens-Set (references/neue-sprache.md). Fremde Schrift: Lautschrift.
export const OTHER_LANGS = {
  fr: { name: 'Französisch', tts: 'fr-FR', chunks: [['Bonjour', 'Hallo / Guten Tag'], ['Merci', 'Danke'], ["S'il vous plaît", 'Bitte'], ['Oui / Non', 'Ja / Nein'], ['Pardon', 'Entschuldigung'], ['Je ne comprends pas', 'Ich verstehe nicht'], ['Plus lentement, s’il vous plaît', 'Langsamer bitte'], ['Vous parlez anglais ?', 'Sprechen Sie Englisch?'], ['Où est … ?', 'Wo ist …?'], ['Combien ?', 'Wie viel?'], ['Au secours !', 'Hilfe!'], ["J'ai besoin d'un médecin", 'Ich brauche einen Arzt'], ['un, deux, trois, quatre, cinq', '1, 2, 3, 4, 5'], ['six, sept, huit, neuf, dix', '6, 7, 8, 9, 10']] },
  es: { name: 'Spanisch', tts: 'es-ES', chunks: [['Hola', 'Hallo'], ['Gracias', 'Danke'], ['Por favor', 'Bitte'], ['Sí / No', 'Ja / Nein'], ['Perdón', 'Entschuldigung'], ['No entiendo', 'Ich verstehe nicht'], ['Más despacio, por favor', 'Langsamer bitte'], ['¿Habla inglés?', 'Sprechen Sie Englisch?'], ['¿Dónde está …?', 'Wo ist …?'], ['¿Cuánto cuesta?', 'Wie viel kostet das?'], ['¡Ayuda!', 'Hilfe!'], ['Necesito un médico', 'Ich brauche einen Arzt'], ['uno, dos, tres, cuatro, cinco', '1, 2, 3, 4, 5'], ['seis, siete, ocho, nueve, diez', '6, 7, 8, 9, 10']] },
  nl: { name: 'Niederländisch', tts: 'nl-NL', chunks: [['Hallo', 'Hallo'], ['Dank je wel', 'Danke'], ['Alsjeblieft', 'Bitte'], ['Ja / Nee', 'Ja / Nein'], ['Sorry', 'Entschuldigung'], ['Ik begrijp het niet', 'Ich verstehe nicht'], ['Langzamer, alstublieft', 'Langsamer bitte'], ['Spreekt u Engels?', 'Sprechen Sie Englisch?'], ['Waar is …?', 'Wo ist …?'], ['Hoeveel?', 'Wie viel?'], ['Help!', 'Hilfe!'], ['Ik heb een dokter nodig', 'Ich brauche einen Arzt'], ['een, twee, drie, vier, vijf', '1, 2, 3, 4, 5'], ['zes, zeven, acht, negen, tien', '6, 7, 8, 9, 10']] },
  pl: { name: 'Polnisch', tts: 'pl-PL', chunks: [['Dzień dobry', 'Guten Tag'], ['Dziękuję', 'Danke'], ['Proszę', 'Bitte'], ['Tak / Nie', 'Ja / Nein'], ['Przepraszam', 'Entschuldigung'], ['Nie rozumiem', 'Ich verstehe nicht'], ['Wolniej, proszę', 'Langsamer bitte'], ['Czy mówi pan po angielsku?', 'Sprechen Sie Englisch?'], ['Gdzie jest …?', 'Wo ist …?'], ['Ile?', 'Wie viel?'], ['Pomocy!', 'Hilfe!'], ['Potrzebuję lekarza', 'Ich brauche einen Arzt'], ['jeden, dwa, trzy, cztery, pięć', '1, 2, 3, 4, 5'], ['sześć, siedem, osiem, dziewięć, dziesięć', '6, 7, 8, 9, 10']] },
  ru: { name: 'Russisch (Lautschrift)', tts: 'ru-RU', chunks: [['Здравствуйте (sdrastwujtje)', 'Guten Tag'], ['Спасибо (spassiba)', 'Danke'], ['Пожалуйста (paschalsta)', 'Bitte'], ['Да / Нет (da / njet)', 'Ja / Nein'], ['Извините (iswinitje)', 'Entschuldigung'], ['Я не понимаю (ja nje panimaju)', 'Ich verstehe nicht'], ['Медленнее, пожалуйста (medlennjeje, paschalsta)', 'Langsamer bitte'], ['Вы говорите по-английски? (wy gawaritje pa-anglijski)', 'Sprechen Sie Englisch?'], ['Где …? (gdje)', 'Wo ist …?'], ['Сколько? (skolka)', 'Wie viel?'], ['Помогите! (pamagitje)', 'Hilfe!'], ['Мне нужен врач (mnje nushen wratsch)', 'Ich brauche einen Arzt'], ['один, два, три (adin, dwa, tri)', '1, 2, 3'], ['четыре, пять (tschetyrje, pjat)', '4, 5']] },
};
