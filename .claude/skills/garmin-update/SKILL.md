---
name: garmin-update
description: Garmin-Daten in die Trainings-App eintragen. Immer nutzen, wenn der Nutzer „Garmin-Update“ schickt (meist mit „Verbindungscode: …“), oder sagt, Claude soll seine Garmin-Daten, den Morgenbericht oder die Check-in-Werte in die App eintragen.
---

# Garmin-Update

Der Nutzer kopiert diesen Befehl morgens aus seiner App und schickt ihn. Die App kann Garmin nicht selbst abfragen; Claude
holt die Daten mit dem Garmin-Connector, verschlüsselt sie mit dem öffentlichen Verbindungscode der App und legt sie auf `main`
neben die App (GitHub Pages). Die App holt sie beim Öffnen selbst und trägt sie ein.

**Ablauf: genau nach `docs/garmin-abholung.md`.** Kurz:

1. `main` auschecken (Zweig `garmin-sync` von `origin/main`).
2. Verbindungscode aus der Nachricht → `app/garmin/verbindung.json`, falls neu oder anders.
3. Garmin-Connector abfragen (Tabelle in der Anleitung; auch `stats-gestern.json` und `sets-<id>.json` je Krafttraining),
   Antworten unverändert als JSON nach `/tmp/garmin-raw/` (nie ins Repository).
4. `node tools/garmin-sync.mjs /tmp/garmin-raw` → `app/garmin/daten.enc.json`.
5. Nur `app/garmin/daten.enc.json` (und ggf. `verbindung.json`) mit `git add -f` committen, auf `main` pushen.
   Meldet das Werkzeug `UNVERÄNDERT`: nichts committen.
6. `/tmp/garmin-raw` löschen. Antwort an den Nutzer: kurz, ohne Gesundheitswerte („Erledigt – App in 1–3 Minuten öffnen“).

Regeln:
- Gesundheitsdaten niemals unverschlüsselt ins Repository, in Commit-Nachrichten oder Logs.
- Der Verbindungscode ist öffentlich (nur zum Verschlüsseln). Einen geheimen Schlüssel gibt es auf dieser Seite nicht.
- Ist der Garmin-Connector nicht verbunden: dem Nutzer sagen, dass er ihn in den Einstellungen verbinden muss.
