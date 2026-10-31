# Garmin: automatische Anbindung – Einschätzung

**Kurz:** Für diese App (läuft nur auf dem Handy, ohne eigenen Server) ist eine offizielle automatische Garmin-Anbindung derzeit nicht realistisch. Deshalb gibt es Datei-Import und manuelle Eingabe. Die Anbindung ist im Code vorbereitet (`app/js/core/garmin-source.js`).

## Warum nicht sofort
- Die offiziellen Schnittstellen (Garmin Connect Developer Program: Health API, Activity API) gibt es nur nach **Antrag und Freigabe** durch Garmin. Gedacht sind sie für Firmen und Organisationen.
- Garmin **schickt** die Daten per Push/Ping an einen **Server mit fester Adresse** (Webhook). Eine reine Web-App auf dem Handy kann das nicht empfangen.
- Der Login läuft über OAuth. Die geheimen Schlüssel dürfen nicht in einer öffentlichen Web-App stehen.
- Inoffizielle Wege (Login mit Benutzername/Passwort nachbauen) verstoßen gegen Garmins Nutzungsbedingungen und brechen regelmäßig – bewusst nicht eingebaut.

## Was später nötig wäre
1. Freigabe im Garmin Connect Developer Program beantragen.
2. Kleinen Server bereitstellen (z. B. Serverless-Funktion), der OAuth abwickelt, Garmins Push-Daten speichert und unter `GET /garmin/daily?from=&to=` als JSON ausgibt: `{ daily: [...], acts: [...] }`.
3. In `garmin-source.js` die Quelle `garmin-connect-api` auf `active: true` setzen und Adresse + Token in den Einstellungen hinterlegen. Die Daten laufen dann über dieselbe Funktion `mergeDaily()` wie der Datei-Import – Planung und Schonmodus funktionieren ohne weitere Änderungen.
