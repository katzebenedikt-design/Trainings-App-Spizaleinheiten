# Garmin-Abholung (Befehl „Garmin-Update“ oder geplante Aufgabe)

Diese Anleitung befolgt Claude, wenn der Nutzer den **Befehl „Garmin-Update“** schickt (kopiert in der App: Heute → Garmin-Morgenbericht
oder Einstellungen → Garmin → „Garmin-Befehl für Claude kopieren“). Dieselbe Anleitung gilt für eine geplante Aufgabe
(morgens 7:15 Uhr, tagsüber alle 2 Stunden). Ergebnis in der App: Morgenbericht, Früh-Check-in vorausgefüllt (Schlaf, Energie, Ruhepuls),
Garmin-Werte im Abend-Check-in (gestern vollständig, heute bis jetzt), Trainings im Trainingstracker.
Sie braucht den Garmin-Connector und Schreibzugriff auf das Repository. Es wird **kein Geheimnis** benötigt:
verschlüsselt wird mit dem öffentlichen Verbindungscode der App (`app/garmin/verbindung.json` auf `main`).

## Ablauf

1. Repository holen und `main` auschecken:
   `git fetch origin main && git checkout -B garmin-sync origin/main`
2. Verbindungscode: Steht in der Nachricht `Verbindungscode: <code>`, diesen nehmen. Weicht er von `app/garmin/verbindung.json` ab
   (oder die Datei fehlt), die Datei mit `{ "publicKey": "<code>" }` schreiben und im selben Commit mitschicken
   (`git add -f app/garmin/verbindung.json`). Ohne Code in der Nachricht und ohne Datei: nichts tun, den Nutzer bitten,
   in der App „Garmin-Befehl für Claude kopieren“ zu nutzen.
3. Werkzeug bereitstellen: `tools/garmin-sync.mjs` auf `main` verwenden. Falls es dort fehlt, aus dem Entwicklungszweig holen:
   `git fetch origin claude/fitness-training-pwa-app-weqfcx && git checkout origin/claude/fitness-training-pwa-app-weqfcx -- tools/garmin-sync.mjs app/js/core/garmin-map.js app/js/core/crypt.js app/js/core/util.js`
   (diese Dateien danach NICHT committen, nur benutzen).
4. Ordner anlegen: `mkdir -p /tmp/garmin-raw` (nie ins Repository).
5. Mit dem Garmin-Connector abfragen (heute = aktuelles Datum in Europe/Berlin, START = heute − 20 Tage) und jede Antwort
   **unverändert als JSON** in den Ordner schreiben:
   | Datei | Abfrage |
   |---|---|
   | `readiness.json` | `get_morning_training_readiness(date=heute)` |
   | `status.json` | `get_training_status(date=heute)` |
   | `stats.json` | `get_stats(date=heute)` (bis jetzt) |
   | `stats-gestern.json` | `get_stats(date=gestern)` (ganzer Tag → Abend-Check-in von gestern) |
   | `hrv.json` | `get_hrv_trend(start_date=START, end_date=heute)` |
   | `sleep.json` | `get_sleep_summary_range(start_date=START, end_date=heute)` |
   | `vo2.json` | `get_vo2max_trend(start_date=heute − 60 Tage, end_date=heute)` |
   | `intensity.json` | `get_weekly_intensity_minutes(end_date=heute, weeks=4)` |
   | `activities.json` | `get_activities_by_date(start_date=START, end_date=heute, page_size=100)` |
   Danach für **jede** Aktivität aus `activities.json` mit `type` = `strength_training`:
   `get_activity_exercise_sets(activity_id=<id>)` → `sets-<id>.json` (Kraftsätze für den Krafttracker).
   Schlägt eine Abfrage fehl, die Datei weglassen und mit den anderen weitermachen.
6. Verschlüsseln: `node tools/garmin-sync.mjs /tmp/garmin-raw` (schreibt `app/garmin/daten.enc.json`).
7. Meldet das Werkzeug `UNVERÄNDERT`, nichts committen und bei Schritt 8 weitermachen. Sonst nur diese eine Datei committen und auf `main` pushen:
   `git add -f app/garmin/daten.enc.json && git commit -m "Garmin-Daten (verschlüsselt) <Datum>" && git push origin HEAD:main`
8. `/tmp/garmin-raw` löschen. Keine Gesundheitswerte in Commit-Nachrichten, Logs oder Antworten wiederholen.
9. Beim Befehl: dem Nutzer kurz antworten, z. B. „Erledigt – öffne die App in 1–3 Minuten.“ (GitHub Pages braucht etwa eine Minute).
   Die Werte selbst nicht in den Chat schreiben, außer der Nutzer fragt danach.

## Datenschutz

- Im Repository liegt nur die verschlüsselte Datei. Ohne den geheimen Schlüssel auf dem Handy ist sie unlesbar.
- Der Verbindungscode ist öffentlich und darf im Repository stehen. Er kann nur verschlüsseln, nicht entschlüsseln.
- Neuer Verbindungscode (App → Einstellungen → Garmin → „Neuen Code erzeugen“): Code in `app/garmin/verbindung.json` ersetzen.

## Was die App mit den Aktivitäten macht

- Laufen/Gehen/Schwimmen → Lauf- bzw. Schwimmprotokoll.
- Krafttraining → Sätze je Übung in den Krafttracker (Garmin-Kategorie → App-Übung, z. B. PULL_UP → Klimmzüge; Gewicht = Zusatzgewicht).
  Unbekannte Kategorien werden als eigene Übung „… (Garmin)“ angelegt.
- Die passende geplante Einheit desselben Tages wird abgehakt (Lauf → Lauf-Einheit, Kraft → Kraft-Einheit, Boxen/Kampfsport → Kickboxen,
  Schwimmen → Schwimmen, Gehen/Wandern → Marsch). Aufzeichnungen unter 10 Minuten zählen nicht. Punkte nur für die letzten 3 Tage.
