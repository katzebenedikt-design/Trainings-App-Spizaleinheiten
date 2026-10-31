// Automatischer Schonmodus nach festen, nachvollziehbaren Regeln. Keine Diagnosen.
// Check-in-Skala: Schlaf, Energie, Stimmung 1 = schlecht … 5 = sehr gut; Muskelkater, Schmerzen 1 = keine … 5 = stark.
import { addDays, median, sortByDate } from './util.js';

export const CHECK_ITEMS = [
  { key: 'schlaf', label: 'Schlaf', lo: 'schlecht', hi: 'sehr gut' },
  { key: 'energie', label: 'Energie', lo: 'leer', hi: 'voll' },
  { key: 'kater', label: 'Muskelkater', lo: 'keiner', hi: 'stark', inv: true },
  { key: 'schmerz', label: 'Schmerzen', lo: 'keine', hi: 'stark', inv: true },
  { key: 'stimmung', label: 'Stimmung', lo: 'mies', hi: 'top' },
];

export function restHRBaseline(state, date) {
  const vals = [];
  for (let i = 1; i <= 21; i++) {
    const d = addDays(date, -i);
    const c = state.checkins.find((x) => x.date === d && x.ruhepuls);
    const g = state.daily.find((x) => x.date === d && x.restHR);
    const v = c?.ruhepuls || g?.restHR;
    if (v) vals.push(v);
  }
  return vals.length >= 4 ? median(vals) : null;
}

export function readiness(state, date) {
  const c = state.checkins.find((x) => x.date === date);
  const g = state.daily.find((x) => x.date === date);
  const reasons = [];
  let mode = 'normal', doctor = false, score = null;
  const up = (m) => { const order = ['normal', 'leicht', 'pause']; if (order.indexOf(m) > order.indexOf(mode)) mode = m; };
  // Ohne Check-in zählen nur die Garmin-Werte des Tages
  if (!c) {
    if (g) garminRules(state, date, g, up, reasons);
    if (mode === 'normal') return { mode: 'offen', score: null, percent: null, reasons: ['Check-in noch offen'], doctor: false };
    reasons.push('Check-in noch offen');
    return { mode, score: null, percent: null, reasons, doctor: false };
  }
  score = c.schlaf + c.energie + c.stimmung + (6 - c.kater) + (6 - c.schmerz); // 5..25
  const percent = Math.round(((score - 5) / 20) * 100);

  if (c.schmerz >= 4) { up('pause'); doctor = true; reasons.push('Starke Schmerzen: heute Pause. Bei anhaltenden Schmerzen ärztlich abklären lassen.'); }
  else if (c.schmerz === 3) { up('leicht'); reasons.push('Schmerzen: betroffene Region schonen, nur leichte Belastung.'); }
  if (c.schmerz >= 3) {
    const streak = [1, 2].every((i) => (state.checkins.find((x) => x.date === addDays(date, -i))?.schmerz || 0) >= 3);
    if (streak) { doctor = true; reasons.push('Schmerzen seit 3 Tagen: bitte ärztlich abklären lassen.'); }
  }
  const hr = c.ruhepuls || g?.restHR;
  const hrBase = restHRBaseline(state, date);
  if (hr && hrBase) {
    if (hr >= hrBase + 10) { up('pause'); reasons.push(`Ruhepuls ${hr} deutlich über deinem Schnitt (${Math.round(hrBase)}): Pause.`); }
    else if (hr >= hrBase + 7) { up('leicht'); reasons.push(`Ruhepuls ${hr} erhöht (Schnitt ${Math.round(hrBase)}): leichter trainieren.`); }
  }
  if (score <= 11) { up('pause'); reasons.push('Check-in sehr schlecht: aktive Erholung statt Training.'); }
  else if (score <= 15) { up('leicht'); reasons.push('Check-in mäßig: Umfang und Intensität runter.'); }
  if (c.schlaf === 1) { up('leicht'); reasons.push('Kaum geschlafen: keine harte Einheit.'); }
  else if (c.schlaf <= 2 && c.energie <= 2 && score > 15) { up('leicht'); reasons.push('Wenig Schlaf und wenig Energie: heute leichter.'); }
  if (c.kater >= 4) { up('leicht'); reasons.push('Starker Muskelkater: betroffene Muskeln heute nicht belasten.'); }
  if (g) garminRules(state, date, g, up, reasons);

  // Stimmung über mehrere Tage sehr schlecht → Hinweis auf Hilfe (elite-mind-supplement-coach)
  const lowMood = [0, 1, 2, 3, 4].map((i) => state.checkins.find((x) => x.date === addDays(date, -i))).filter(Boolean).filter((x) => x.stimmung <= 1).length;
  const moodHelp = lowMood >= 3;

  // Mehrere leichte Tage in Folge → Entlastungswoche vorschlagen
  const recent = sortByDate(state.checkins).filter((x) => x.date < date).slice(-3);
  const deloadHint = mode !== 'normal' && recent.length === 3 && recent.every((x) => x.schlaf + x.energie + x.stimmung + (6 - x.kater) + (6 - x.schmerz) <= 15);
  if (deloadHint) reasons.push('Mehrere schwache Tage in Folge: Entlastungswoche einlegen.');
  if (mode === 'normal' && !reasons.length) reasons.push('Alles im grünen Bereich.');
  return { mode, score, percent, reasons, doctor, moodHelp, deloadHint };
}

// Garmin-Werte: Body Battery, HRV (gegen eigenen 28-Tage-Schnitt), Schlaf, Trainingsbelastung
function garminRules(state, date, g, up, reasons) {
  const avg = (k) => { const v = []; for (let i = 1; i <= 28; i++) { const x = state.daily.find((d) => d.date === addDays(date, -i))?.[k]; if (x) v.push(x); } return v.length >= 5 ? median(v) : null; };
  if (g.bodyBattery != null && g.bodyBattery < 25) { up('leicht'); reasons.push(`Body Battery ${g.bodyBattery}: leicht trainieren.`); }
  if (g.hrv) {
    const b = avg('hrv');
    if (b && g.hrv < b * 0.75) { up('pause'); reasons.push(`HRV ${g.hrv} ms deutlich unter deinem Schnitt (${Math.round(b)} ms): Pause, nur Spaziergang.`); }
    else if (b && g.hrv < b * 0.88) { up('leicht'); reasons.push(`HRV ${g.hrv} ms unter deinem Schnitt (${Math.round(b)} ms): Intensität runter.`); }
  }
  if (g.sleepH != null && g.sleepH < 5) { up('leicht'); reasons.push(`Nur ${g.sleepH} h Schlaf (Garmin): heute keine harte Einheit.`); }
  if (g.load) { const b = avg('load'); if (b && g.load > b * 1.5) { up('leicht'); reasons.push(`Trainingsbelastung ${g.load} deutlich über deinem Schnitt (${Math.round(b)}): Belastung reduzieren.`); } }
}

// Session an den Schonmodus anpassen
export function applyReadiness(sessions, r) {
  if (!r || r.mode === 'normal' || r.mode === 'offen') return sessions;
  if (r.mode === 'pause') {
    return [{ code: 'REST', title: 'Schonmodus: Pause', sub: 'Erholung statt Training', min: 0, rest: true, schon: true,
      blocks: [{ kind: 'main', title: 'Heute', lines: ['Kein Training. Spazierengehen ist ok.', 'Box-Atmung 5 Minuten (Mental).', 'Früh schlafen.', r.doctor ? 'Bei Schmerzen: Arzt oder Ärztin aufsuchen. Die App stellt keine Diagnose.' : 'Morgen neu einchecken.'] }] }];
  }
  return sessions.map((s) => {
    if (s.rest) return s;
    if (s.fixed) return { ...s, title: s.title + ' (nur Technik)', sub: 'Schonmodus · kein Sparring, keine harten Runden', schon: true,
      blocks: [{ kind: 'main', title: 'Schonmodus', lines: ['Hingehen, aber nur Technik und Pratzen locker.', 'Kein Sparring. Dem Trainer kurz Bescheid sagen.'] }] };
    if (s.run || s.ruck || s.test || ['TB3', 'TB4', 'K4', 'ZIRKEL', 'EILMARSCH'].includes(s.code)) {
      return { ...s, code: 'TBR', title: 'Schonmodus: lockere Einheit', sub: 'statt ' + s.title, min: 30, schon: true,
        blocks: [{ kind: 'main', title: 'Leicht statt hart', lines: ['20–30 min sehr locker (Puls unter 125) oder Rad/Schwimmen locker', 'Mobilität und Faszienrolle 10 min', 'Geplante Einheit nicht nachholen, der Plan läuft weiter.'] }] };
    }
    return { ...s, title: 'Schonmodus: ' + s.title, sub: 'Ein Satz weniger · ca. 70 % Wdh./Gewicht', schon: true,
      blocks: s.blocks.map((b) => b.ex ? { ...b, ex: b.ex.map((e) => ({ ...e, sets: Math.max(1, e.sets - 1) })), lines: [...(b.lines || []), 'Schonmodus: nur ca. 70 % der üblichen Last, nichts bis zum Versagen.'] } : b) };
  });
}
