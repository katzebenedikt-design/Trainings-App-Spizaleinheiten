// Der Morgen-Befehl an Claude: kurzer Text mit dem öffentlichen Verbindungscode.
// Claude holt damit die Garmin-Daten, verschlüsselt sie für genau dieses Handy und legt sie neben die App
// (Ablauf: docs/garmin-abholung.md, Skill .claude/skills/garmin-update). Der Code ist nicht geheim.

export const BEFEHL_WORT = 'Garmin-Update';

export function garminBefehl(publicKey) {
  return `${BEFEHL_WORT}\nVerbindungscode: ${publicKey}\n(Trainings-App: Garmin-Daten von gestern und heute holen, verschlüsselt ablegen – Anleitung docs/garmin-abholung.md)`;
}

// Gegenstück für Claude/Werkzeug: Code aus einer Nachricht lesen (null, wenn kein Befehl)
export function befehlLesen(text = '') {
  if (!new RegExp(BEFEHL_WORT, 'i').test(text)) return null;
  const m = String(text).match(/Verbindungscode:\s*([A-Za-z0-9+/=]{80,})/);
  return { publicKey: m ? m[1] : null };
}
