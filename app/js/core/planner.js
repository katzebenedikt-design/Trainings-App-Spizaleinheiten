// Planung eines Tages in festen Schritten:
// 1. Grundplan (Phase, Wochenvorlage) → 2. Schwächen-Zusatz → 3. Verfügbarkeit der Woche
// → 4. Schonmodus (nur heute) → 5. Wochenregeln erzwingen (immer zuletzt).
import { baseDay, buildSession } from './plan.js';
import { assessWeaknesses, focusAreas, BOOSTS, fmtVal } from './weakness.js';
import { availFor, applyAvailability } from './availability.js';
import { readiness, applyReadiness } from './readiness.js';
import { enforce, violations } from './rules.js';
import { addDays, mondayOf, weekday, iso } from './util.js';

const cache = new Map(); // Schwächen nur einmal pro Tag/Datenstand berechnen
function weaknessFor(state, date) {
  const key = date + ':' + state.tests.length + ':' + state.runs.length + ':' + state.swims.length + ':' + state.strength.length + ':' + state.daily.length + ':' + JSON.stringify(state.profile.targets || {}) + state.profile.unit;
  if (!cache.has(key)) { if (cache.size > 50) cache.clear(); const weak = assessWeaknesses(state, date); cache.set(key, { weak, focus: focusAreas(weak) }); }
  return cache.get(key);
}

function boostSession(key) {
  const b = BOOSTS[key];
  if (b.code === 'STPLUS') return { code: 'STPLUS', title: 'Zusatz: Schwimmen', sub: 'Schwäche Schwimmen · 30 min', min: 30, swim: true, boost: key, blocks: [{ kind: 'main', title: 'Warum zusätzlich?', lines: [b.text] }] };
  return { code: 'KRAFTPLUS', title: 'Zusatz: ' + b.block, sub: 'Schwäche · 15 min', min: 15, boost: key, blocks: [{ kind: 'main', title: 'Gezielter Zusatz', lines: [b.text, 'Nur wenn der Rest der Einheit sauber war. Nicht bis zum Versagen.'] }] };
}

export function plannedDay(state, date, { withReadiness = date === iso() } = {}) {
  const day = baseDay(state, date);
  const build = (code, variant) => ({ ...buildSession(code, { ...day.ctx, variant }), variant });
  const wd = weekday(date);
  let sessions = day.sessions;
  const why = [];

  // 2. Schwächen
  const { weak, focus } = weaknessFor(state, date);
  if (!day.deload && day.phase.key !== 'taper') {
    let extraToday = false;
    for (const f of focus) {
      const b = BOOSTS[f.key];
      if (!b.tage.includes(wd)) continue;
      if (b.code === 'LAUFPLUS') {
        sessions = sessions.map((s) => (s.run && !s.boosted ? { ...s, boosted: true, min: (s.min || 0) + 10, sub: s.sub + ' · +10 min (Schwäche)', blocks: [...s.blocks, { kind: 'main', title: 'Schwäche: ' + f.label, lines: [b.text] }] } : s));
      } else if (b.code === 'MARSCHPLUS') {
        sessions = sessions.map((s) => (s.run && !s.test && !s.ruck ? { ...build(day.phase.key === 'grundlage' ? 'MT1' : day.phase.key === 'aufbau' ? 'MT2' : 'MT3'), boosted: true, sub: 'Marsch statt Lauf (Schwäche ' + f.label + ')' } : s));
      } else if (!extraToday) {
        sessions = [...sessions, boostSession(f.key)]; extraToday = true;
      }
    }
  }
  for (const f of focus) why.push(`${f.label}: aktuell ${fmtVal(f.norm, f.value)} (${f.src}), Ziel ${fmtVal(f.norm, f.norm.goal)}, Top ${fmtVal(f.norm, f.norm.top)} → ${BOOSTS[f.key].block} bekommt mehr Volumen (${BOOSTS[f.key].tage.map((t) => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][t]).join('/')}).`);
  if (day.deload) why.push('Entlastungswoche: keine Zusatzblöcke, Monatstest (Mi Kraft/Schwimmen, Sa 3000 m).');

  // 3. Verfügbarkeit
  const a = availFor(state, date);
  const av = applyAvailability(date, sessions, a, build);
  sessions = av.sessions;

  // 4. Schonmodus
  let r = null;
  if (withReadiness) { r = readiness(state, date); sessions = applyReadiness(sessions, r); }
  const schonPause = r?.mode === 'pause';

  // 5. Wochenregeln
  sessions = enforce(date, sessions, build, { schonPause });
  return { ...day, sessions, why, availNotes: av.notes, weak, focus, readiness: r, violations: violations(date, sessions, { schonPause }) };
}

export function weekPlan(state, anyDate) {
  const mon = mondayOf(anyDate);
  return Array.from({ length: 7 }, (_, i) => plannedDay(state, addDays(mon, i)));
}
