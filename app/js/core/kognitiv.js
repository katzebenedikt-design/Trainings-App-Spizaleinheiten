// Kognitivtraining: welches Training an welchem Tag (aus dem Wochenplan in data/kognitiv.js).
import { KOGNITIV_WOCHE, ROTATION, KOPFTEST_TAG } from '../data/kognitiv.js';
import { phaseAt, cycleWeek } from './plan.js';
import { CAT_MODULES } from '../data/cat.js';
import { evaluate } from './cat.js';
import { weekday, isoWeekKey } from './util.js';

export function kognitivFuer(state, date) {
  if (weekday(date) === 6) {
    const { phase, weekTotal } = phaseAt(state, date);
    if (cycleWeek(weekTotal) === 4 && !['taper', 'erholung', 'nachav'].includes(phase.key)) return { ...KOPFTEST_TAG };
  }
  const p = { ...KOGNITIV_WOCHE[weekday(date)] };
  if (p.typ === 'cat' && p.key === 'schwaechster') {
    // Neuestes Ergebnis aus Simulation oder Kopf-Test
    const last = [...(state.cat?.sims || []), ...(state.cat?.tests || [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).pop();
    if (last) { p.key = evaluate(last.mods).schwaechen[0]; p.grund = 'schwächster Bereich der letzten Simulation bzw. des letzten Kopf-Tests'; }
    else { p.key = ROTATION[Number(isoWeekKey(date).split('-W')[1]) % ROTATION.length]; p.grund = 'wechselt wöchentlich, bis eine CAT-Simulation gemacht ist'; }
    p.titel = `CAT-Training: ${CAT_MODULES[p.key].name}`;
  }
  return p;
}
