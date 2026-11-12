// Einheiten-Wissen (Konfiguration): Wofür ist die Einheit da, wofür ist sie gut, Praxisbeispiele –
// und Ersatz-Einheiten für Tage ohne Zeit (15/30 min, möglichst gleicher Trainingsreiz).
// Ersatz-Einheiten halten die festen Wochenregeln ein (an Kickbox-Tagen kein Laufen/Schwimmen).
const E = (min, titel, lines, reiz) => ({ min, titel, lines, reiz });

export const EINHEITEN = {
  K1: {
    zweck: 'Kraftausdauer am ganzen Körper: viele Wiederholungen mit mittlerem Gewicht (KSK-Schwerpunkt).',
    nutzen: 'Muskeln, Sehnen und Gelenke halten lange Belastungen aus, ohne einzubrechen.',
    beispiele: ['Rucksack stundenlang tragen, ohne dass Schultern und Rücken nachgeben', 'Hindernisbahn: zehnmal hintereinander hochziehen und überklettern', 'Kameraden bergen und ziehen, wenn die Arme schon brennen'],
    ersatz: [E(15, 'Kraftausdauer-Zirkel kompakt', ['3 Runden ohne Pause zwischen den Übungen: 20 Kniebeugen, 15 Liegestütze, 10 Klimmzüge oder 15 Rudern am Tisch, 30 s Unterarmstütz', '60 s Pause zwischen den Runden'], 'gleicher Reiz: hohe Wiederholungen, Ganzkörper'), E(30, 'Kraftausdauer verkürzt', ['Die drei wichtigsten Übungen des Plans (Kniebeuge/Ausfallschritt, Drücken, Ziehen) je 4× 20–25', 'Pause 60 s statt 75–90 s', 'Danach 1× Farmer’s Carry 40 m'], 'gleicher Reiz, weniger Übungen')],
  },
  K2: {
    zweck: 'Muskelaufbau mit 8–12 Wiederholungen: mehr Muskelquerschnitt als Basis für Kraft.',
    nutzen: 'Mehr Muskel = mehr Reserve für Maximalkraft und Verletzungsschutz.',
    beispiele: ['Schweres Gepäck auf den Rücken schwingen', 'Sich mit voller Ausrüstung über eine Mauer ziehen', 'Einen verletzten Kameraden anheben'],
    ersatz: [E(15, 'Muskelaufbau-Supersätze', ['3 Supersätze: Kniebeuge oder Bulgarian Split Squat 10–12 + Klimmzug/Rudern 8–10', 'Dann 2 Supersätze: Schulterdrücken 10 + Liegestütze eng bis kurz vor Versagen', 'Pause 60–90 s'], 'gleicher Reiz: 8–12 Wdh., schwer'), E(30, 'Muskelaufbau verkürzt', ['Die 3 Grundübungen des Plans je 4× 8–12, Pause 90 s', 'Letzte Wiederholung schwer, aber sauber'], 'gleicher Reiz, weniger Übungen')],
  },
  K4: {
    zweck: 'Maximalkraft mit 1–5 schweren Wiederholungen und langen Pausen.',
    nutzen: 'Hohe Kraft im Verhältnis zum Körpergewicht (Ziel 1,5–2× KG) macht jede Last relativ leichter.',
    beispiele: ['Kameraden im Feuerwehrgriff anheben', 'Schwere Munitionskisten heben und tragen', 'Ramme oder Werkzeug kontrolliert führen'],
    ersatz: [E(15, 'Maximalkraft: nur eine Grundübung', ['Kurz aufwärmen, dann eine Grundübung (Kniebeuge ODER Kreuzheben): 5× 3 bei ca. 85 %', 'Pause 2 min, nichts bis zum Versagen'], 'gleicher Reiz: schwer, wenige Wdh.'), E(30, 'Maximalkraft: zwei Grundübungen', ['Kniebeuge 4× 4 und Bankdrücken oder Klimmzug mit Gewicht 4× 4', 'Pause 2–3 min'], 'gleicher Reiz, eine Übung weniger')],
  },
  KRAFTO: {
    zweck: 'Moderate Oberkörperkraft vor dem Kickboxen – ohne Beine, nicht bis zur Erschöpfung.',
    nutzen: 'Zug- und Druckkraft wachsen weiter, ohne das Kickboxen am Abend zu gefährden.',
    beispiele: ['Klimmzüge im Sporttest', 'Am Seil oder Netz hochziehen', 'Sich aus dem Wasser auf einen Steg drücken'],
    ersatz: [E(15, 'Oberkörper-Kurzprogramm (keine Beine)', ['4 Runden: 5–8 Klimmzüge, 15 Liegestütze, 20 s Hängen', '60 s Pause, 1–2 Wiederholungen Reserve lassen'], 'gleicher Reiz: Zug und Druck, keine Beine'), E(30, 'Oberkörper verkürzt (keine Beine)', ['Klimmzüge 5× nach NSW-Tabelle, Liegestütze 4×, Rudern 3× 12', 'Kein Laufen, kein Schwimmen – heute ist Kickboxen'], 'gleicher Reiz, kürzer')],
  },
  ZIRKEL: {
    zweck: 'Zirkel nach SFAS-Vorbild: Kraft und Ausdauer gemischt, mit Tragen und Verwundetentransport.',
    nutzen: 'Trainiert genau die gemischte Belastung des Auswahlverfahrens: Kraft unter Atemnot.',
    beispiele: ['Kameraden bergen und 50 m tragen', 'Hindernisbahn mit Sandsack', 'Nach einem Sprint sofort präzise arbeiten'],
    ersatz: [E(15, 'AMRAP 12 min', ['So viele Runden wie möglich in 12 min: 10 Burpees, 10 Kniebeugen mit Rucksack, 10 Rudern, 20 m Rucksack tragen'], 'gleicher Reiz: gemischt, ohne Pause'), E(30, 'Zirkel halbiert', ['Ein AMRAP aus dem Plan (12 min)', 'Danach 3× 30 m Verwundetentransport mit Sandsack/Partner'], 'gleicher Reiz, ein Block weniger')],
  },
  CAL: {
    zweck: 'Calisthenics nach NSW-Tabelle: Liegestütze, Sit-ups und Klimmzüge nach deinem Maximum.',
    nutzen: 'Genau die Testübungen des Sporttests – mehr Wiederholungen durch Volumen.',
    beispiele: ['Liegestütz-Test im PFV', 'Sich mehrmals hintereinander über ein Hindernis ziehen', 'Rumpfspannung beim Robben'],
    ersatz: [E(15, 'Calisthenics-Leiter', ['Leiter 1–2–3–4–5–4–3–2–1: Klimmzüge, danach je doppelt so viele Liegestütze und Sit-ups', 'Pausen so kurz wie möglich'], 'gleicher Reiz'), E(30, 'Calisthenics verkürzt', ['Die Sätze aus dem Plan, aber nur 3/4 der Satzzahl'], 'gleicher Reiz, weniger Umfang')],
  },
  TB1: {
    zweck: 'Grundlagenausdauer in Zone 2: ruhig und lange, du kannst dich dabei unterhalten.',
    nutzen: 'Herz, Gefäße und Fettstoffwechsel – die Basis für alles andere und für schnelle Erholung.',
    beispiele: ['Ein 20-km-Gepäckmarsch ohne einzubrechen', 'Mehrere Tage Belastung mit wenig Schlaf durchstehen', 'Nach einer harten Einheit schneller wieder fit sein'],
    ersatz: [E(15, 'Kurzer Zone-2-Lauf', ['15 min locker, Puls 135–150', 'Lieber kurz als gar nicht – Hauptsache regelmäßig'], 'gleicher Reiz, weniger Umfang'), E(30, 'Zone-2-Lauf 30 min', ['30 min gleichmäßig locker, Puls 135–150, Nasenatmung'], 'gleicher Reiz')],
  },
  TB2: {
    zweck: 'Tempodauerlauf in Zone 3: zügig, nur noch wenige Worte möglich.',
    nutzen: 'Hebt das Tempo, das du lange halten kannst – wichtig für 3000 m und Eilmarsch.',
    beispiele: ['3000-m-Test unter 12 Minuten', 'Eilmarsch 7 km in unter 45 min', 'Mit Gepäck aufschließen, wenn die Gruppe Tempo macht'],
    ersatz: [E(15, 'Tempo-Kurzlauf', ['3 min einlaufen, 10 min Tempo (Zone 3), 2 min auslaufen'], 'gleicher Reiz, kürzer'), E(30, 'Tempo 30', ['8 min einlaufen, 2× 8 min Tempo mit 2 min Trab, 4 min auslaufen'], 'gleicher Reiz')],
  },
  TB3: {
    zweck: 'Schwellen-Intervalle über 1000 m – wie der 5× 1000-m-Test im PFV.',
    nutzen: 'Schiebt die Laktatschwelle nach oben: schneller laufen, ohne „sauer“ zu werden.',
    beispiele: ['PFV: 5× 1000 m mit 3 min Pause', 'Hindernisbahn im Laufschritt durchhalten', 'Nach einem Sprint sofort wieder handlungsfähig sein'],
    ersatz: [E(15, 'Schwelle kompakt', ['3 min einlaufen, 3× 3 min an der Schwelle mit 1 min Trab, 1 min aus'], 'gleicher Reiz, kürzer'), E(30, 'Schwelle verkürzt', ['8 min einlaufen, 3× 1000 m im Plantempo, 2 min Trabpause, 4 min aus'], 'gleicher Reiz, weniger Wiederholungen')],
  },
  TB4: {
    zweck: 'Intensive Intervalle über 400 m (bzw. 200 m) – nahe am Maximum.',
    nutzen: 'VO2max und Schnelligkeit: dein Motor wird größer.',
    beispiele: ['Sprint zur Deckung', 'Endspurt im 3000-m-Test', 'Schnelle Lagewechsel auf der Hindernisbahn'],
    ersatz: [E(15, 'Kurze Intervalle', ['4 min einlaufen, 8× 30 s schnell / 30 s Trab, 3 min aus'], 'gleicher Reiz: hohe Intensität'), E(30, 'Intervalle verkürzt', ['10 min einlaufen, 6× 400 m im Plantempo, Pause 2× Belastungsdauer, 5 min aus'], 'gleicher Reiz')],
  },
  TBR: {
    zweck: 'Regeneration: sehr locker bewegen, damit sich der Körper erholt.',
    nutzen: 'Durchblutung ohne neue Ermüdung – du bist morgen frischer.',
    beispiele: ['Nach einem langen Marsch die Beine lockern', 'Erholung zwischen zwei Testtagen', 'Aktiv bleiben, wenn die Uhr „überlastet“ meldet'],
    ersatz: [E(15, 'Lockere Bewegung', ['15 min Spazieren oder lockeres Rad, danach 5 min Mobilität'], 'gleicher Reiz')],
  },
  ST: {
    zweck: 'Schwimmtraining Brust – dein einziger Schwimmtag, mit Technik, Intervallen und Kleiderschwimmen.',
    nutzen: 'Schwimmtest und Kleiderschwimmen im PFV; Sicherheit im Wasser mit Ausrüstung.',
    beispiele: ['200 m im Kampfanzug unter 7:30 (KSK)', 'Mit Ausrüstung ins Wasser und sicher wieder heraus', 'Ruhig bleiben unter Wasser (Apnoe, nur mit Aufsicht)'],
    ersatz: [E(15, 'Schwimmen kompakt (im Bad)', ['100 m einschwimmen, 6× 50 m zügig Brust mit 20 s Pause, 100 m locker'], 'gleicher Reiz: Tempo im Wasser'), E(30, 'Schwimmen verkürzt (im Bad)', ['200 m einschwimmen, Hauptteil des Plans halbiert, 100 m Kleiderschwimmen falls erlaubt'], 'gleicher Reiz, weniger Umfang')],
  },
  STTECH: {
    zweck: 'Schwimmtechnik: Gleitphase, Atmung, Züge zählen.',
    nutzen: 'Gute Technik spart im Kleiderschwimmen am meisten Kraft.',
    beispiele: ['200 m im Kampfanzug ruhig durchziehen', 'Mit wenig Zügen weit kommen', 'Ruhig atmen trotz Kälte'],
    ersatz: [E(15, 'Technik kurz (im Bad)', ['6× 50 m mit Fokus Gleitphase, Züge zählen'], 'gleicher Reiz')],
  },
  MT1: {
    zweck: 'Leichter Marsch mit Gepäck: Füße, Gelenke und Rücken an die Last gewöhnen.',
    nutzen: 'Marschhärte entsteht nur durch Marschieren – Haut, Sehnen und Knochen brauchen Zeit.',
    beispiele: ['20 km mit 20 kg im PFV (max. 3,5 h)', 'Ohne Blasen über mehrere Tage laufen', 'Gepäck richtig packen und einstellen'],
    ersatz: [E(30, 'Kurzer Gepäckmarsch', ['30 min zügig mit 10 kg Rucksack, gleiche Stiefel wie im Plan'], 'gleicher Reiz: Last auf den Füßen'), E(15, 'Treppen mit Gepäck', ['15 min Treppen hoch und runter mit 10 kg, ruhiges Tempo'], 'ähnlicher Reiz: Beine und Rücken unter Last')],
  },
  MT2: {
    zweck: 'Mittlerer Marsch mit 10–15 kg und Profil.',
    nutzen: 'Baut die Marschhärte für 20 km mit 20 kg auf.',
    beispiele: ['PFV-Marsch 20 km', 'Nachtmarsch mit Orientierung', 'Gepäck über unebenes Gelände tragen'],
    ersatz: [E(30, 'Gepäckmarsch 30 min zügig', ['30 min mit dem Plangewicht, so zügig wie sauber möglich (6 km/h)'], 'gleicher Reiz: Last + Tempo'), E(15, 'Treppen mit Gepäck', ['15 min Treppen mit Plangewicht'], 'ähnlicher Reiz')],
  },
  MT3: {
    zweck: 'Schwerer Marsch mit 15–20 kg über 20–25 km.',
    nutzen: 'Direkte Vorbereitung auf den PFV-Marsch – Kopf und Körper lernen die Dauerbelastung.',
    beispiele: ['20 km mit 20 kg in unter 3,5 h', 'Nach Stunden mit Gepäck noch klar denken', 'Kameraden mit Blasen ermutigen und mitziehen'],
    ersatz: [E(30, 'Eilmarsch-Stück', ['30 min mit 20 kg so zügig wie möglich (Marsch, kein Rennen)'], 'gleicher Reiz: schwere Last'), E(15, 'Treppen schwer', ['15 min Treppen mit 20 kg, langsam und kontrolliert'], 'ähnlicher Reiz')],
  },
  MTLANG: {
    zweck: 'Langer Marsch 30–40 km für Phase 2 des PFV.',
    nutzen: 'KSK: Ein 40-km-Marsch soll in Phase 2 keine Herausforderung sein.',
    beispiele: ['40 km mit Gepäck ohne einzubrechen', 'Füße und Haut über viele Stunden schützen', 'Essen und Trinken unterwegs planen'],
    ersatz: [E(30, 'Kurzer schwerer Marsch', ['30 min mit 20 kg zügig – den langen Marsch am nächsten freien Wochenende nachholen'], 'nur Teilreiz – langer Marsch ist kaum ersetzbar')],
  },
  EILMARSCH: {
    zweck: 'Eilmarsch: 5–7 km mit 15–20 kg so schnell wie sauber möglich.',
    nutzen: 'Ziel EGB/KSK: 7 km mit 20 kg unter 45 min.',
    beispiele: ['7 km Eilmarsch im Auswahlverfahren', 'Schnell eine Stellung erreichen', 'Mit Gepäck Anschluss halten'],
    ersatz: [E(15, 'Eilmarsch-Intervalle', ['3 min einlaufen, 5× 2 min sehr zügig mit 15–20 kg, 1 min langsam'], 'gleicher Reiz: Tempo unter Last'), E(30, 'Eilmarsch 30 min', ['30 min mit 15–20 kg im Eilmarschtempo'], 'gleicher Reiz, kürzer')],
  },
  MTSCHWER: {
    zweck: 'Tragen schwerer Ausrüstung nach dem AV (bis 35 kg, langsam steigern).',
    nutzen: 'Für die Ausbildung: schwere Lasten über Distanz tragen.',
    beispiele: ['Volle Ausrüstung über lange Strecken', 'Material in Stellung bringen', 'Kameraden mit Gepäck bergen'],
    ersatz: [E(30, 'Schwer tragen kurz', ['30 min mit dem Plangewicht, flach, 5 km/h'], 'gleicher Reiz, kürzer')],
  },
  PROPHYLAXE: {
    zweck: 'Verletzungsprophylaxe: Füße, Sprunggelenke, Hüfte, Schultern und Rumpf.',
    nutzen: 'Die meisten Bewerber scheitern an Verletzungen, nicht an fehlender Kraft.',
    beispiele: ['Umknicken im Gelände vermeiden', 'Schultern für Klimmzüge und Kickboxen stabil halten', 'Rücken beim Tragen schützen'],
    ersatz: [E(15, 'Prophylaxe kompakt', ['Wadenheben einbeinig 2× 12 je Seite', 'Einbeinstand Augen zu 2× 30 s je Seite', 'Band-Außenrotation 2× 15', 'Seitstütz 2× 30 s je Seite'], 'gleicher Reiz')],
  },
  KICKBOX: {
    zweck: 'Kickboxen im Verein – fester Termin, deckt den Nahkampf im PFV ab (2 min Sparring).',
    nutzen: 'Durchsetzungsvermögen, Schlagkraft, Ausdauer in kurzen harten Intervallen.',
    beispiele: ['PFV-Nahkampf: 2 min Sparring', 'Unter Druck ruhig bleiben', 'Schnell reagieren, wenn es eng wird'],
    ersatz: [E(15, 'Schattenboxen (kein Laufen)', ['5 Runden à 2 min Schattenboxen mit Kombinationen, 1 min Pause', 'Fokus Deckung und Beinarbeit'], 'ähnlicher Reiz, ohne Partner'), E(30, 'Pratzen/Sandsack (kein Laufen)', ['8 Runden à 2 min Sandsack oder Pratzen, 1 min Pause', 'Danach 5 min Mobilität Hüfte und Schultern'], 'ähnlicher Reiz')],
  },
  MOB: {
    zweck: 'Mobilität und Faszienrolle.',
    nutzen: 'Beweglichkeit und schnellere Erholung, weniger Überlastungsschmerzen.',
    beispiele: ['Lange Märsche ohne Hüftschmerzen', 'Tief in die Hocke für Stellungen', 'Schultern frei für Überkopf-Lasten'],
    ersatz: [E(15, 'Mobilität kurz', ['Faszienrolle Waden, Oberschenkel, Gesäß je 45 s', 'Hüftbeuger-Dehnung 2× 30 s je Seite', 'Open Books 8 je Seite'], 'gleicher Reiz')],
  },
  OBENLEICHT: {
    zweck: 'Leichter Oberkörper ohne Beine.', nutzen: 'Bewegung, ohne die Beine zu belasten.',
    beispiele: ['Vor dem Kickboxen locker bleiben', 'Schultern pflegen', 'Rumpf stabil halten'],
    ersatz: [E(15, 'Oberkörper leicht', ['3 Runden: 10 Liegestütze, 10 Rudern, 30 s Unterarmstütz'], 'gleicher Reiz')],
  },
  KT: {
    zweck: 'Koordination: Gleichgewicht, Reaktion, Sprünge.', nutzen: 'Sicher auf unebenem Boden und an Hindernissen.',
    beispiele: ['Hindernisbahn', 'Gelände bei Nacht', 'Schnelle Richtungswechsel'],
    ersatz: [E(15, 'Koordination kurz', ['Einbeinsprünge, Seitsprünge, Koordinationsleiter oder Linienläufe: 15 min im Wechsel'], 'gleicher Reiz')],
  },
  SPEZ: {
    zweck: 'Spezialisierung nach dem AV (Breacher/Waffenspezialist).', nutzen: 'Die Kraft und Ruhe, die die Rolle verlangt.',
    beispiele: ['Schweres Werkzeug sicher führen', 'Ruhige Hände nach Belastung', 'Rotationskraft und Rumpf'],
    ersatz: [E(15, 'Spezialisierung kurz', ['Die ersten zwei Übungen des Plans, je 3 Sätze'], 'gleicher Reiz, kürzer')],
  },
  KMAXU: {
    zweck: 'Maximalkraft Unterkörper und Tragen nach dem AV.', nutzen: 'Basis für schweres Tragen in der Ausbildung.',
    beispiele: ['35 kg Ausrüstung', 'Kameraden bergen', 'Schwere Lasten heben'],
    ersatz: [E(30, 'Maximalkraft kurz', ['Kniebeuge 5× 3 schwer, danach Farmer’s Carry 3× 40 m'], 'gleicher Reiz')],
  },
  KMAXO: {
    zweck: 'Maximalkraft Oberkörper und Griff nach dem AV.', nutzen: 'Zugkraft und Griff für Seil, Leiter und Ausrüstung.',
    beispiele: ['Klimmzug mit Ausrüstung', 'An Leiter oder Seil hochziehen', 'Schweres Werkzeug halten'],
    ersatz: [E(15, 'Oberkörper schwer kurz', ['Klimmzug mit Gewicht 5× 3, Hängen 2× max.'], 'gleicher Reiz')],
  },
  TESTKRAFT: { zweck: 'Leistungstest Kraft (alle 6 Wochen).', nutzen: 'Zeigt den Fortschritt und steuert den Plan.', beispiele: ['Klimmzüge, Liegestütze, Sit-ups wie im PFV'], ersatz: [], ersatzHinweis: 'Test nicht abkürzen: auf den nächsten freien Tag dieser Woche verschieben (nicht Di/Do vor dem Kickboxen).' },
  TESTSCHWIMMEN: { zweck: 'Leistungstest 100 m Brust.', nutzen: 'Fortschritt im Wasser messen.', beispiele: ['Schwimmtest im PFV'], ersatz: [], ersatzHinweis: 'Test nicht abkürzen: auf den nächsten freien Tag dieser Woche verschieben (nicht an Kickbox- oder Krafttagen).' },
  TESTLAUF: { zweck: 'Leistungstest 3000 m.', nutzen: 'Wichtigster Ausdauerwert für den Plan.', beispiele: ['3000-m-Lauf im Sporttest'], ersatz: [], ersatzHinweis: 'Test nicht abkürzen: auf Sonntag verschieben.' },
  TEST: { zweck: 'Leistungstest.', nutzen: 'Fortschritt messen.', beispiele: ['Sporttest im PFV'], ersatz: [], ersatzHinweis: 'Test lieber verschieben als abkürzen.' },
  TROCKEN: { zweck: 'Trockenübungen statt Schwimmen.', nutzen: 'Rumpf und Schultern wie beim Schwimmen.', beispiele: ['Schwimmbewegung mit Band', 'Rumpfspannung', 'Atemkontrolle'], ersatz: [E(15, 'Trocken kurz', ['Band-Zugbewegungen 3× 20, Superman 3× 12, Unterarmstütz 3× 45 s'], 'gleicher Reiz')] },
  KRAFTPLUS: { zweck: 'Zusatzblock für deine größte Schwäche (aus Test und Zielwerten berechnet).', nutzen: 'Gezielt die Disziplin heben, die dich am weitesten vom Ziel trennt.', beispiele: ['Mehr Klimmzüge im Sporttest', 'Stärkerer Rumpf beim Tragen'], ersatz: [E(15, 'Zusatz kompakt', ['Nur den ersten Satz-Block des Zusatzes, dafür sauber', 'Bei echter Zeitnot: Zusatz weglassen, die Haupteinheit hat Vorrang'], 'gleicher Reiz, halber Umfang')] },
  LAUFPLUS: { zweck: 'Zusatz Laufen für deine Ausdauer-Schwäche.', nutzen: 'Mehr Umfang im Zielbereich.', beispiele: ['3000-m-Test', 'VO2max steigern'], ersatz: [E(15, 'Steigerungen', ['6× 20 s Steigerung nach dem Einlaufen'], 'gleicher Reiz')] },
  MARSCHPLUS: { zweck: 'Zusatz Marsch für deine Marsch-Schwäche.', nutzen: 'Mehr Marschhärte.', beispiele: ['20 km mit 20 kg'], ersatz: [E(30, 'Kurzmarsch', ['30 min mit Plangewicht zügig'], 'gleicher Reiz')] },
  REHA: { zweck: 'Sanfter Reha-Block für die schmerzende Stelle: mobilisieren, dehnen, kräftigen.', nutzen: 'Hilft, schneller wieder voll zu trainieren – ohne die Stelle zu überlasten.', beispiele: ['Nach Umknicken wieder sicher marschieren', 'Schulter für Klimmzüge stabil bekommen'], ersatz: [E(15, 'Reha kurz', ['Die erste Übung je Stelle, schmerzfrei'], 'gleicher Reiz')] },
  ALTCARDIO: { zweck: 'Ausdauer ohne Stoßbelastung (Rad, Ergometer, Crosstrainer), solange Laufen oder Marsch wehtun.', nutzen: 'Die Ausdauer bleibt, die schmerzende Stelle erholt sich.', beispiele: ['Trotz Knieproblem fit bleiben', 'Fitness halten, bis der Fuß wieder Gepäck trägt'], ersatz: [E(15, 'Rad kurz', ['15 min Rad/Ergometer in Zone 2'], 'gleicher Reiz, kürzer')] },
  REST: { zweck: 'Ruhetag: Erholung ist Teil des Trainings (KSK: mindestens ein Tag pro Woche komplett frei).', nutzen: 'Erst in der Pause wird der Körper stärker (Superkompensation).', beispiele: ['Frisch in die nächste harte Woche', 'Weniger Verletzungen', 'Schlaf nachholen'], ersatz: [] },
};

// Kurze Erklärung zur Woche (vor dem Wochenplan)
export function wochenErklaerung(phaseName, cw, deload, len = 6) {
  if (deload) return `Regenerationswoche (Woche ${len} von ${len}): weniger Umfang, dafür der Leistungstest. Ausgeruht testen zeigt deinen echten Stand – danach passt sich der Plan an.`;
  const steig = cw === 1 ? 'Neuer Block: Umfang und Gewichte starten etwas niedriger.' : cw >= len - 1 ? 'Letzte Belastungswoche vor der Regeneration – hier darf es fordernd sein.' : 'Die Belastung steigt von Woche zu Woche leicht an.';
  return `${phaseName}, Belastungswoche ${cw} von ${len - 1}. ${steig} Ziel: Grundlage, Kraftausdauer und Marschhärte für das Auswahlverfahren.`;
}
