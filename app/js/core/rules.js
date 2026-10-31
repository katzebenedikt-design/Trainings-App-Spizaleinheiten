// Feste Wochenregeln prüfen und durchsetzen. Läuft als letzter Schritt jeder Planung,
// damit weder Schwächen-Anpassung noch Verfügbarkeit noch Schonmodus eine Regel verletzen.
import { WEEK_RULES } from '../data/requirements.js';
import { weekday } from './util.js';

const KRAFT = new Set(['K1', 'K2', 'K4', 'ZIRKEL', 'CAL', 'OBENLEICHT', 'TESTKRAFT', 'KRAFTPLUS']);
const SCHWIMMEN = new Set(['ST', 'STTECH', 'STPLUS']);
const SCHWERE_BEINE = (s) => s.code === 'K4' || s.code === 'ZIRKEL' || s.code === 'EILMARSCH' || ((s.code === 'K1' || s.code === 'K2') && (s.variant === 'beine' || s.variant === 'unten'));
const RUHE_OK = new Set(['REST']); // Freitag: kompletter Ruhetag (Heimfahrt)

export const isKraft = (s) => KRAFT.has(s.code);
export const isSchwimmen = (s) => SCHWIMMEN.has(s.code) || !!s.swim;

export function violations(date, sessions, { schonPause = false } = {}) {
  const r = WEEK_RULES[weekday(date)]; const out = [];
  for (const s of sessions) {
    if (r.ruhetag && !RUHE_OK.has(s.code)) out.push(`${s.title}: Freitag ist Ruhetag`);
    if (r.kraft === false && isKraft(s)) out.push(`${s.title}: am Wochenende kein Krafttraining`);
    if (r.schwimmen === false && isSchwimmen(s)) out.push(`${s.title}: am Wochenende kein Schwimmen`);
    if (r.keineSchwerenBeine && SCHWERE_BEINE(s)) out.push(`${s.title}: kein schweres Beintraining vor dem Kickboxen`);
  }
  if (r.fest && !schonPause && !sessions.some((s) => s.code === r.fest)) out.push(`Fester Termin ${r.fest} fehlt`);
  return out;
}

// Ersetzt regelwidrige Einheiten durch erlaubte Alternativen. build(code) erzeugt eine Einheit.
export function enforce(date, sessions, build, { schonPause = false } = {}) {
  const r = WEEK_RULES[weekday(date)];
  let out = [];
  for (const s of sessions) {
    if (r.ruhetag) { if (RUHE_OK.has(s.code)) out.push(s); continue; }
    if ((r.kraft === false && isKraft(s)) || (r.schwimmen === false && isSchwimmen(s))) { out.push(build('TB1')); continue; }
    if (r.keineSchwerenBeine && SCHWERE_BEINE(s)) { out.push(build('OBENLEICHT')); continue; }
    out.push(s);
  }
  if (r.ruhetag && !out.length) out.push(build('REST'));
  if (r.fest && !schonPause && !out.some((s) => s.code === r.fest)) out.push(build(r.fest));
  // Doppelte Codes entfernen (z. B. zweimal TB1 nach Ersatz)
  const seen = new Set(); out = out.filter((s) => (seen.has(s.code) ? false : seen.add(s.code)));
  return out;
}
