// Psychologengespräch – KONFIGURATION (nur Daten). Typische Themen eines Eignungsgesprächs laut
// öffentlich zugänglicher Vorbereitungsliteratur. Keine offiziellen Fragen, keine Musterantworten:
// Ziel ist, ehrlich und klar über sich zu sprechen – nicht auswendig Gelerntes aufzusagen.

export const THEMEN = {
  motivation: { name: 'Motivation', worum: 'Ein realistisches Bild statt Actionfilm. Eigene Gründe, die auch an schlechten Tagen tragen.', fragen: [
    'Warum wollen Sie zu dieser Einheit?',
    'Seit wann haben Sie diesen Wunsch, und was hat ihn ausgelöst?',
    'Was wissen Sie über den Alltag in der Einheit – abseits von Einsätzen?',
    'Was reizt Sie an dieser Aufgabe am meisten, und was am wenigsten?',
    'Was haben Sie konkret getan, um sich vorzubereiten?',
    'Woran würden Sie merken, dass die Entscheidung falsch war?',
  ] },
  lebenslauf: { name: 'Lebenslauf', worum: 'Jede Station erklären können: Warum so entschieden? Was gelernt? Lücken ehrlich benennen.', fragen: [
    'Erzählen Sie mir Ihren Lebenslauf in drei Minuten.',
    'Warum haben Sie sich für Ihre Ausbildung entschieden?',
    'Welche Station in Ihrem Leben hat Sie am meisten geprägt?',
    'Gibt es Lücken oder Brüche in Ihrem Lebenslauf? Wie kam es dazu?',
    'Worauf sind Sie in Ihrem bisherigen Leben besonders stolz?',
    'Was würden Sie rückblickend anders machen?',
  ] },
  familie: { name: 'Familie & Umfeld', worum: 'Wie stabil ist dein Rückhalt? Wie gehst du mit Trennung und Entfernung um?', fragen: [
    'Beschreiben Sie Ihre Familie.',
    'Wie würden Ihre Eltern oder Geschwister Sie beschreiben?',
    'Wer ist Ihnen am wichtigsten, und wie reagiert diese Person auf Ihre Pläne?',
    'Wie gehen Sie damit um, wenn Sie lange von zu Hause weg sind?',
    'Wie sieht Ihr Freundeskreis aus? Was machen Sie gemeinsam?',
    'Gab es in Ihrer Familie schwierige Zeiten? Wie sind Sie damit umgegangen?',
  ] },
  staerken: { name: 'Stärken & Schwächen', worum: 'Selbstkenntnis: Stärken mit Beleg, Schwächen ehrlich – und was du dagegen tust.', fragen: [
    'Was sind Ihre drei größten Stärken? Nennen Sie zu jeder ein Beispiel.',
    'Was ist Ihre größte Schwäche – und was tun Sie dagegen?',
    'Was würde ein guter Freund sagen, was an Ihnen nervt?',
    'In welcher Situation hat Ihnen eine Schwäche geschadet?',
    'Wofür bekommen Sie oft Lob, wofür Kritik?',
  ] },
  stress: { name: 'Umgang mit Stress', worum: 'Kennst du deine Warnsignale? Was tust du konkret, um handlungsfähig zu bleiben?', fragen: [
    'Woran merken Sie, dass Sie gestresst sind?',
    'Beschreiben Sie die stressigste Situation Ihres Lebens. Wie haben Sie reagiert?',
    'Was tun Sie, um runterzukommen?',
    'Wie verhalten Sie sich, wenn Sie völlig erschöpft sind und trotzdem weitermüssen?',
    'Wie schlafen Sie vor wichtigen Ereignissen?',
  ] },
  fehler: { name: 'Fehler & Rückschläge', worum: 'Verantwortung übernehmen statt Ausreden. Was hast du daraus gemacht?', fragen: [
    'Erzählen Sie von Ihrem größten Fehler.',
    'Wann sind Sie zuletzt gescheitert? Was haben Sie daraus gemacht?',
    'Wie reagieren Sie, wenn Sie kritisiert werden?',
    'Wie gehen Sie mit einer Verletzung um, die Ihren Plan gefährdet?',
    'Wann haben Sie zuletzt einen Fehler zugegeben, obwohl es niemand gemerkt hätte?',
  ] },
  team: { name: 'Teamarbeit', worum: 'Welche Rolle übernimmst du wirklich? Stellst du die Gruppe über dich?', fragen: [
    'Welche Rolle übernehmen Sie normalerweise in einer Gruppe?',
    'Beschreiben Sie eine Situation, in der Ihr Beitrag für das Team entscheidend war.',
    'Was tun Sie, wenn ein Kamerad nicht mithält?',
    'Arbeiten Sie lieber allein oder im Team? Warum?',
    'Wann mussten Sie eigene Interessen für die Gruppe zurückstellen?',
  ] },
  konflikt: { name: 'Konflikte', worum: 'Klar bleiben ohne Eskalation. Widersprechen können – mit Respekt.', fragen: [
    'Erzählen Sie von Ihrem letzten Streit. Wie wurde er gelöst?',
    'Was tun Sie, wenn Sie eine Anweisung für falsch halten?',
    'Wie reagieren Sie, wenn jemand Sie provoziert?',
    'Wann haben Sie zuletzt jemandem deutlich widersprochen?',
    'Wie gehen Sie mit Menschen um, die Sie nicht mögen?',
  ] },
  werte: { name: 'Werte', worum: 'Was ist dir wichtig, und wo liegen deine Grenzen? Passen deine Werte zum Auftrag?', fragen: [
    'Was ist Ihnen im Leben wirklich wichtig?',
    'Wo liegt für Sie eine Grenze, die Sie nie überschreiten würden?',
    'Was bedeutet für Sie Loyalität?',
    'Würden Sie einen Kameraden melden, der gegen Regeln verstößt? Warum?',
    'Wer ist ein Vorbild für Sie, und warum?',
    'Was bedeutet es für Sie, im Auftrag des Staates notfalls Gewalt anzuwenden?',
  ] },
  belastung: { name: 'Belastung', worum: 'Hast du schon echte Belastung erlebt? Wie verarbeitest du Belastendes – und mit wem?', fragen: [
    'Was war die größte körperliche Belastung, die Sie je durchgestanden haben?',
    'Was motiviert Sie, wenn nichts mehr geht?',
    'Wie gehen Sie mit Schlafentzug, Kälte und Hunger um?',
    'Wie würden Sie reagieren, wenn ein Kamerad schwer verletzt wird?',
    'Wie verarbeiten Sie belastende Erlebnisse? Mit wem sprechen Sie darüber?',
  ] },
  planb: { name: 'Plan B', worum: 'Ein Scheitern darf dich nicht umwerfen. Wer einen Plan B hat, wirkt nicht weniger motiviert, sondern stabiler.', fragen: [
    'Was machen Sie, wenn Sie nicht genommen werden?',
    'Würden Sie es noch einmal versuchen? Was würden Sie anders machen?',
    'Wie würden Sie Ihren Angehörigen ein Scheitern erklären?',
    'Wo sehen Sie sich beruflich in zehn Jahren – mit und ohne die Einheit?',
    'Was wäre für Sie die zweitbeste berufliche Alternative?',
  ] },
};

export const NACHFRAGEN = [
  'Können Sie dafür ein konkretes Beispiel nennen?',
  'Was haben Sie daraus gelernt?',
  'Wie haben andere Beteiligte das damals gesehen?',
  'Was würden Sie heute anders machen?',
  'Wie haben Sie sich dabei gefühlt?',
  'Woran genau haben Sie das gemerkt?',
];

// Selbstbewertung nach jeder Antwort: 0 = nein, 1 = teils, 2 = ja
export const CHECK = [
  { id: 'ehrlich', t: 'Ehrlich', d: 'So ist es wirklich – nicht, was gut klingt.' },
  { id: 'konkret', t: 'Konkret mit Beispiel', d: 'Eine echte Situation: was war, was ich getan habe, was dabei herauskam.' },
  { id: 'ruhig', t: 'Ruhig', d: 'Normales Tempo, Pausen erlaubt, wenig „äh“.' },
  { id: 'haltung', t: 'Blickkontakt und Haltung', d: 'Aufrecht, offen, Blick halten. Üben mit Spiegel oder Frontkamera.' },
];

// ---------- Schriftlich ----------
export const LEBENSLAUF = [
  { id: 'stationen', titel: 'Stationen', fragen: ['Welche Schulen, Abschlüsse und Ausbildungen – mit Monat und Jahr?', 'Warum hast du dich jeweils so entschieden?', 'Was hast du in jeder Station gelernt, das dir heute hilft?'] },
  { id: 'luecken', titel: 'Lücken & Wechsel', fragen: ['Gibt es Zeiten, die nicht lückenlos sind? Was hast du da gemacht?', 'Gab es Abbrüche oder Wechsel? Was war der ehrliche Grund?'] },
  { id: 'verantwortung', titel: 'Verantwortung & Führung', fragen: ['Wo hattest du Verantwortung für andere (Verein, Arbeit, Familie)?', 'Wann hast du etwas organisiert oder andere angeleitet?'] },
  { id: 'sport', titel: 'Sport & Engagement', fragen: ['Welchen Sport machst du seit wann, mit welchen Ergebnissen?', 'Ehrenamt, Feuerwehr, Rettungsschwimmer, Verein – was und seit wann?'] },
  { id: 'besonderes', titel: 'Besondere Erlebnisse', fragen: ['Welches Erlebnis hat dich verändert?', 'Was steht in keinem Zeugnis, sagt aber viel über dich?'] },
];

export const MOTIVATION = [
  { id: 'warum', frage: 'Warum genau diese Einheit – und nicht eine andere?' },
  { id: 'wann', frage: 'Wann und wodurch ist der Wunsch entstanden?' },
  { id: 'getan', frage: 'Was hast du bisher konkret dafür getan (Training, Ausbildung, Verzicht)?' },
  { id: 'mitbringen', frage: 'Was bringst du mit – und woran kann man das sehen?' },
  { id: 'erwartung', frage: 'Was erwartest du von Ausbildung und Alltag – realistisch?' },
  { id: 'arbeit', frage: 'Woran musst du noch arbeiten?' },
  { id: 'umfeld', frage: 'Wie steht dein Umfeld dazu?' },
];

// Übungsfragebogen (KEIN echter Test, keine Diagnose): Paare messen dieselbe Eigenschaft,
// teils umgekehrt formuliert; Kontrollaussagen zeigen geschöntes Antworten.
export const FRAGEBOGEN = {
  paare: [
    ['Ich bleibe in Stresssituationen ruhig.', 'In Stresssituationen werde ich schnell nervös.', true],
    ['Ich plane meine Aufgaben gern im Voraus.', 'Ich lasse Dinge oft auf mich zukommen, ohne zu planen.', true],
    ['Ich gehe gern auf fremde Menschen zu.', 'In neuen Gruppen halte ich mich eher zurück.', true],
    ['Kritik nehme ich mir schnell zu Herzen.', 'Kritik lässt mich meistens kalt.', true],
    ['Ich halte mich an Regeln, auch wenn niemand kontrolliert.', 'Regeln, die niemand kontrolliert, nehme ich nicht so ernst.', true],
    ['Ich bringe Dinge zu Ende, die ich angefangen habe.', 'Ich gebe Aufgaben auf, wenn sie mir zu lange dauern.', true],
    ['Ich ärgere mich lange über eigene Fehler.', 'Nach einem Fehler kann ich schnell abschließen.', true],
    ['Ich arbeite gern im Team.', 'Gemeinsam mit anderen erreiche ich mehr als allein.', false],
  ],
  kontrolle: ['Ich habe noch nie gelogen.', 'Ich war noch nie auf jemanden neidisch.', 'Ich bin immer pünktlich, ohne jede Ausnahme.', 'Ich habe noch nie schlecht über jemanden geredet.'],
  skala: ['trifft gar nicht zu', 'trifft eher nicht zu', 'teils, teils', 'trifft eher zu', 'trifft voll zu'],
};

export const FRAGEBOGEN_INFO = [
  ['Wie sind sie aufgebaut?', 'Viele kurze Aussagen über dich, dazu eine Skala von „trifft gar nicht zu“ bis „trifft voll zu“. Erfasst werden Eigenschaften wie Belastbarkeit, Gewissenhaftigkeit, Kontaktfreude oder Umgang mit anderen – oft angelehnt an das Fünf-Faktoren-Modell („Big Five“).'],
  ['Warum dieselbe Frage mehrmals?', 'Jede Eigenschaft wird mehrfach abgefragt, teils umgekehrt formuliert. So zeigt sich, ob jemand gleichbleibend antwortet. Widersprüche fallen auf – und werden im Gespräch nachgefragt.'],
  ['Was sind Kontrollfragen?', 'Aussagen wie „Ich habe noch nie gelogen“ treffen auf fast niemanden voll zu. Wer sie trotzdem bejaht, stellt sich wahrscheinlich besser dar, als er ist. Das senkt die Glaubwürdigkeit des ganzen Bogens.'],
  ['Warum ehrlich antworten?', 'Ein „perfektes“ Profil wirkt unglaubwürdig. Im Gespräch musst du zu jeder Antwort stehen. Und es geht um Passung: Eine gespielte Persönlichkeit hilft weder dir noch dem Team, wenn es ernst wird.'],
  ['Wie antworten?', 'Zügig, erster Impuls. An dein typisches Verhalten denken, nicht an dein Wunschbild. Extremwerte nur, wenn sie wirklich zutreffen. Nicht nach der „richtigen“ Antwort suchen – es gibt sie nicht.'],
];

// ---------- Reflexionstagebuch ----------
export const TAGEBUCH = [
  'Was ist heute gut gelaufen – und was war mein Anteil daran?',
  'Wann war ich heute ungeduldig oder gereizt? Was war der Auslöser?',
  'Welche Entscheidung habe ich heute getroffen, und warum genau so?',
  'Was habe ich heute vermieden? Warum?',
  'Wofür bin ich heute dankbar?',
  'Was hat mich heute Kraft gekostet, was hat mir Kraft gegeben?',
  'Wo habe ich heute anderen geholfen – oder hätte es tun können?',
  'Welche Rückmeldung habe ich heute bekommen, und was ist dran?',
  'Wie waren Schlaf, Stimmung und Energie – und woran lag das?',
  'Was würde mir ein guter Freund heute raten?',
  'Welche Situation würde ich gern noch einmal erleben, um es besser zu machen?',
  'Was habe ich heute über mich gelernt?',
];
export const TAGEBUCH_WOCHE = 'Wochenrückblick: Was waren die drei wichtigsten Momente der Woche? Welches Muster erkenne ich bei mir?';
