// Kognitivtraining im Tagesbefehl und als Wochenplan.
import { h, card } from '../ui.js';
import { kognitivFuer } from '../core/kognitiv.js';
import { runGame } from './games.js';
import { runTraining, runSimulation } from './cat.js';
import { iso, addDays, mondayOf, weekday, TAGE_LANG } from '../core/util.js';

// Markiert den Punkt im Tagesbefehl als erledigt (Punkte gibt es schon im Spiel bzw. Training)
function markDone(app, date) {
  const st = app.state; const list = st.done[date] || (st.done[date] = []);
  if (!list.includes('kognitiv')) { list.push('kognitiv'); app.save(); }
}

export function startKognitiv(app, date = iso()) {
  const p = kognitivFuer(app.state, date);
  const done = () => markDone(app, date);
  if (p.typ === 'kopftest') runSimulation(app, false, { kopftest: true, onDone: done });
  else if (p.typ === 'spiel') runGame(app, p.key, !!p.belastung, done);
  else runTraining(app, p.key, undefined, done);
}

export function kognitivItem(st, date) {
  const p = kognitivFuer(st, date);
  return { id: 'kognitiv', t: `Kopf: ${p.titel}`, sub: `${p.optional ? 'OPTIONAL · ' : ''}CA. ${p.min} MIN${p.belastung ? ' · DIREKT NACH DEM TRAINING' : ''}`, optional: !!p.optional };
}

export function kognitivWeekCard(app, ref = iso()) {
  const st = app.state; const today = iso(); const mon = mondayOf(ref);
  return card(h('div', { class: 'k' }, '[ KOGNITIVTRAINING · WOCHENPLAN ]'),
    h('p', { class: 'small dim' }, 'Jeden Tag ein kurzes Kopftraining. Schwierigkeit passt sich automatisch an (Ziel 70–85 % Treffer). Antippen startet das Training.'),
    ...Array.from({ length: 7 }, (_, i) => {
      const d = addDays(mon, i); const p = kognitivFuer(st, d);
      const ok = (st.done[d] || []).includes('kognitiv');
      return h('div', { style: { padding: '7px 0', borderBottom: '1px solid var(--line2)', cursor: 'pointer' }, onclick: () => startKognitiv(app, d) },
        h('div', { class: 'm ' + (d === today ? 'sand' : '') }, `${TAGE_LANG[weekday(d)].toUpperCase()}${d === today ? ' · HEUTE' : ''}${ok ? ' · ✓' : ''} · ${p.min} MIN${p.optional ? ' · OPTIONAL' : ''}`),
        h('b', {}, p.titel), h('div', { class: 'small dim' }, p.grund ? `${p.warum} (${p.grund})` : p.warum));
    }));
}
