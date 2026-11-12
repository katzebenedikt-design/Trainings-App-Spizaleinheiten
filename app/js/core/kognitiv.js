// Kognitivtraining: welches Training an welchem Tag (aus dem Wochenplan in data/kognitiv.js).
import { KOGNITIV_WOCHE, KOPFTEST_TAG } from '../data/kognitiv.js';
import { phaseAt, cycleWeek } from './plan.js';
import { CAT_MODULES, CAT_PROFILES } from '../data/cat.js';
import { moduleStand } from './cat.js';
import { weekday } from './util.js';

export function kognitivFuer(state, date) {
  if (weekday(date) === 6) {
    const { phase, weekTotal } = phaseAt(state, date);
    if (cycleWeek(weekTotal) === 4 && !['taper', 'erholung', 'nachav'].includes(phase.key)) return { ...KOPFTEST_TAG };
  }
  const p = { ...KOGNITIV_WOCHE[weekday(date)] };
  if (p.typ === 'cat-kurz') {
    const c = state.cat || {};
    const prof = CAT_PROFILES[c.profile] || CAT_PROFILES.bw;
    const stand = moduleStand(c, prof.module.map((m) => m.id));
    const weak = Object.entries(stand).sort((x, y) => x[1] - y[1])[0];
    if (weak) p.grund = `heute sicher dabei: ${CAT_MODULES[weak[0]].kurz} (Stand ${weak[1]})`;
  }
  return p;
}
