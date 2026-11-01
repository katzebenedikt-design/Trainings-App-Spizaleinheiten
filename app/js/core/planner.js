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

function boostSession(key, build) {
  const b = BOOSTS[key];
  if (b.code === 'TROCKEN') return { ...build('TROCKEN'), boost: key };
  return { code: 'KRAFTPLUS', title: 'Zusatz: ' + b.block, sub: 'Schwäche · 15 min', min: 15, boost: key, blocks: [{ kind: 'main', title: 'Gezielter Zusatz', lines: [b.text, 'Nur wenn der Rest der Einheit sauber war. Nicht bis zum Versagen.'] }] };
}

export function plannedDay(state, date, { withReadiness = date === iso() } = {}) {
  const day = baseDay(state, date);
  const build = (code, variant) => ({ ...buildSession(code, { ...day.ctx, variant }), variant });
  // Mittwochs-Schwimmen länger, wenn Schwimmen eine Schwäche ist
  const wd = weekday(date);
  let sessions = day.sessions;
  const why = [];

  // 2. Schwächen
  const { weak, focus } = weaknessFor(state, date);
  if (!day.deload && !['taper', 'erholung'].includes(day.phase.key)) {
    let extraToday = false;
    for (const f of focus) {
      const b = BOOSTS[f.key];
      if (!b.tage.includes(wd)) continue;
      if (b.code === 'LAUFPLUS' && focus.some((x) => BOOSTS[x.key].code === 'MARSCHPLUS')) continue; // Wochenende nicht doppelt hochfahren
      if (b.code === 'LAUFPLUS') {
        sessions = sessions.map((s) => (s.run && !s.boosted ? { ...s, boosted: true, min: (s.min || 0) + 10, sub: s.sub + ' · +10 min (Schwäche)', blocks: [...s.blocks, { kind: 'main', title: 'Schwäche: ' + f.label, lines: [b.text] }] } : s));
      } else if (b.code === 'MARSCHPLUS') {
        sessions = sessions.map((s) => (s.run && !s.test && !s.ruck ? { ...build(day.phase.key === 'nachav' ? 'MTSCHWER' : day.phase.key === 'grundlage' ? 'MT1' : day.phase.key === 'aufbau' ? 'MT2' : 'MT3'), boosted: true, sub: 'Marsch statt Lauf (Schwäche ' + f.label + ')' } : s));
      } else if (!extraToday) {
        if (b.code === 'TROCKEN' && sessions.some((x) => x.swim)) continue;
        sessions = [...sessions, boostSession(f.key, build)]; extraToday = true;
      }
    }
  }
  if (wd === 6 && !day.deload && !['taper', 'erholung'].includes(day.phase.key) && focus.some((x) => BOOSTS[x.key].code === 'MARSCHPLUS')) sessions = sessions.map((s) => (s.code === 'TB1' && !s.title.includes('Marsch') ? buildSession('TB1', { ...day.ctx, nachMarsch: true }) : s));
  for (const f of focus) why.push(`${f.label}: aktuell ${fmtVal(f.norm, f.value)} (${f.src}), Ziel ${fmtVal(f.norm, f.norm.goal)}, Top ${fmtVal(f.norm, f.norm.top)} → ${BOOSTS[f.key].block} bekommt mehr Volumen (${BOOSTS[f.key].tage.map((t) => ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][t]).join('/')}).`);
  if (wd === 2 && !['taper', 'erholung'].includes(day.phase.key) && focus.some((f) => f.key === 'swim100')) sessions = sessions.map((s) => (s.code === 'ST' ? { ...s, min: s.min + 15, sub: s.sub + ' · +15 min (Schwäche)', blocks: [...s.blocks, { kind: 'main', title: 'Schwäche Schwimmen', lines: ['Zusätzlich 6× 50 m Brust zügig, 30 s Pause'] }] } : s));
  if (day.deload) why.push('Entlastungswoche: keine Zusatzblöcke, Monatstest (Mo Kraft, Mi 100 m Brust, Sa 3000 m).');
  if (day.phase.key === 'erholung') why.push('Erholung nach dem AV: 2 Wochen bewusst locker, danach startet die Phase „Nach dem AV“.');

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
