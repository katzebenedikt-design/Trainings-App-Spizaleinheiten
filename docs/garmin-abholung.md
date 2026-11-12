# Tägliche Garmin-Abholung (geplante Aufgabe)

Diese Anleitung befolgt die geplante Aufgabe jeden Morgen gegen 7:15 Uhr (Europe/Berlin).
Sie braucht den Garmin-Connector und Schreibzugriff auf das Repository. Es wird **kein Geheimnis** benötigt:
verschlüsselt wird mit dem öffentlichen Verbindungscode der App (`app/garmin/verbindung.json` auf `main`).

## Ablauf

1. Repository holen und `main` auschecken:
   `git fetch origin main && git checkout -B garmin-sync origin/main`
2. Prüfen, dass `app/garmin/verbindung.json` existiert. Wenn nicht: nichts tun und beenden.
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
   | `stats.json` | `get_stats(date=heute)` |
   | `hrv.json` | `get_hrv_trend(start_date=START, end_date=heute)` |
   | `sleep.json` | `get_sleep_summary_range(start_date=START, end_date=heute)` |
   | `vo2.json` | `get_vo2max_trend(start_date=heute − 60 Tage, end_date=heute)` |
   | `intensity.json` | `get_weekly_intensity_minutes(end_date=heute, weeks=4)` |
   | `activities.json` | `get_activities_by_date(start_date=START, end_date=heute, page_size=100)` |
   Schlägt eine Abfrage fehl, die Datei weglassen und mit den anderen weitermachen.
6. Verschlüsseln: `node tools/garmin-sync.mjs /tmp/garmin-raw` (schreibt `app/garmin/daten.enc.json`).
7. Nur diese eine Datei committen und auf `main` pushen:
   `git add -f app/garmin/daten.enc.json && git commit -m "Garmin-Daten (verschlüsselt) <Datum>" && git push origin HEAD:main`
8. `/tmp/garmin-raw` löschen. Keine Gesundheitswerte in Commit-Nachrichten, Logs oder Antworten wiederholen.

## Datenschutz

- Im Repository liegt nur die verschlüsselte Datei. Ohne den geheimen Schlüssel auf dem Handy ist sie unlesbar.
- Der Verbindungscode ist öffentlich und darf im Repository stehen. Er kann nur verschlüsseln, nicht entschlüsseln.
- Neuer Verbindungscode (App → Einstellungen → Garmin → „Neuen Code erzeugen“): Code in `app/garmin/verbindung.json` ersetzen.
