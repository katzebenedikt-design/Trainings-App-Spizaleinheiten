# Auswahl 0,1 % – Trainings-App

Installierbare Web-App (PWA) auf Deutsch zur Vorbereitung auf das Auswahlverfahren von Spezialeinheiten (KSK, GSG 9, EGB, Kampfschwimmer).
Alle Daten bleiben auf dem Handy (IndexedDB), Sichern/Wiederherstellen als Datei.

**App öffnen:** https://katzebenedikt-design.github.io/Trainings-App-Spizaleinheiten/

## Auf den Startbildschirm (Pixel 7, Chrome)
1. Link oben in Chrome öffnen.
2. Menü ⋮ oben rechts → **„App installieren“** (oder „Zum Startbildschirm hinzufügen“).
3. Bestätigen. Die App startet danach im Vollbild ohne Browserleiste und funktioniert offline.

## Bereiche
- **Sport:** Startseite mit Countdown, Bereitschafts-Ring und Tagesbefehl · Morgen-Check-in · Phasenplan bis 2028 · Wochenplan (Arbeits-/Berufsschulwoche) · Krafttracker · Laufen/Marsch/Schwimmen · Körpergewicht · Monatstest mit automatischer Plananpassung · Schonmodus · Garmin-Import · Intervall-Timer mit Sprachansage · Übungsfiguren
- **Mental:** Box-Atmung mit Stimme · vorgelesene Entspannungstexte und Szenarien · 5 Minispiele mit Levels · Mein Warum · Checkliste
- **Sprache:** Englisch ab null (26 Wochen, 3 Phasen, 18 Einheiten) · Karteikarten inkl. Funkvokabular · Gespräche per Mikrofon · Überlebens-Sets für 5 weitere Sprachen
- **Kurse:** Kompass & Karte, Rucksack, Waffenkunde, NATO-Alphabet, Dienstgrade, Sprechfunk, Erste Hilfe, Tarnen, Verhalten im Auswahlverfahren

## Planung (Stand Version 2)
- **Feste Wochenregeln:** Mo Kraft + Lauf · Di Prophylaxe + Kickboxen · Mi Schwimmen · Do Oberkörper moderat + Kickboxen · Fr Ruhetag (Heimfahrt) · Sa Marsch/Intervalle · So langer Lauf. Kraft und Schwimmen nie am selben Tag, an Kickbox-Tagen kein Laufen/Schwimmen, am Wochenende kein Kraft/Schwimmen. Jeder Tag wird nach allen Anpassungen gegen diese Regeln geprüft.
- **Nach dem AV:** Bereich mit 5. Symbol unten. Schalter „AV bestanden“ startet 2 Wochen Erholung, danach Maximalkraft, Griff, schweres Tragen und Spezialisierungsblock (Breacher/Waffenspezialist). 7 Wissenskurse mit Mini-Animationen, Quiz je Lektion und Abschlussprüfung (nur Grundlagen aus öffentlichen Quellen).
- **Anforderungen zentral:** `app/js/data/requirements.js` (Zielwerte je Einheit, Wochenregeln). Eigene Werte in der App unter Einstellungen → Zielwerte.
- **Schwächen:** aktuelle Werte (Tests, Läufe, Schwimmen, Marsch, Kraft, Garmin-VO2max) gegen Zielwerte; die größten Lücken bekommen Zusatzvolumen. Begründung im Plan unter „Warum so?“.
- **Verfügbarkeit pro Woche:** Plan → „Verfügbar in KW …“. Übungen werden ersetzt, Einheiten auf die verfügbare Zeit gekürzt.
- **Garmin:** Reiter Sport → Garmin. Manuelle Eingabe, Datei-Import, Verläufe. HRV, Schlaf und Belastung senken bei Bedarf die Intensität. Automatische Anbindung: siehe `docs/garmin-anbindung.md`.

## Übungen: Erklärung, Quelle, Animation
- Jede Kraftübung hat „Warum ist die Übung drin?“, „Wofür ist sie gut?“, Praxisbeispiele und ihre Fundstellen in den PDFs (`app/js/data/exercise-info.js`). Die Fundstellen werden von `tests/sources.test.mjs` gegen den PDF-Text geprüft.
- PDF-Seiten als Bilder: `node tools/render-pdf-pages.mjs` (braucht `pdftoppm`) schreibt nach `app/pdfseiten/`. In der App antippen = Vollbild mit Zoom.
- Animationen: `app/js/views/figures.js` – Blickwinkel je Übung (z. B. Klimmzug von hinten), Equipment, gemeinsame Animationsschleife.

## Entwicklung
- App liegt in `app/` (reines HTML/CSS/JS, kein Build nötig). Nach Änderungen `node tools/build-sw.mjs` ausführen (Offline-Cache).
- Tests: `node --test tests/*.test.mjs` (Logik) und `node tests/e2e.cjs http://localhost:8765/` (Browser, App vorher mit `cd app && python3 -m http.server 8765` starten).
- Grundlagen: PDFs im Repo (KSK-Trainingshandbuch, SFAS-Handbuch, NSW Guide, EGB-Report, Trainingsgestaltung) und Skills in `skills/`.
- Schriften: Barlow Condensed und Share Tech Mono (SIL Open Font License).

Keine medizinische Beratung. Normen ändern sich – offizielle Seiten von Bundeswehr und Bundespolizei prüfen.
