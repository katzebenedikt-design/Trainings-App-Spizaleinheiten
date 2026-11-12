// Kognitivtraining im Tagesbefehl und als Wochenplan.
import { h, card } from '../ui.js';
import { kognitivFuer } from '../core/kognitiv.js';
import { runGame } from './games.js';
import { runTraining, runSimulation } from './cat.js';
import { startPsychKurz } from './psych.js';
import { psychFuer } from '../core/psych.js';
import { iso, addDays, mondayOf, weekday, TAGE_LANG } from '../core/util.js';

// Markiert den Punkt im Tagesbefehl als erledigt (Punkte gibt es schon im Spiel bzw. Training)
function markDone(app, date, id = 'kognitiv') {
  const st = app.state; const list = st.done[date] || (st.done[date] = []);
  if (!list.includes(id)) { list.push(id); app.save(); }
}

// Psychologen-Kurzeinheit (5–10 min), verbunden mit dem Kopftraining
export function startPsych(app, date = iso()) { startPsychKurz(app, date, () => markDone(app, date, 'psych-kurz')); }
export function psychItem(st, date) {
  const p = psychFuer(date);
  return { id: 'psych-kurz', t: `Psychologe: ${p.titel}`, sub: `${p.optional ? 'OPTIONAL · ' : ''}CA. ${p.min} MIN · ${p.kopf.toUpperCase()}`, optional: !!p.optional };
}

export function startKognitiv(app, date = iso()) {
  const p = kognitivFuer(app.state, date);
  const done = () => markDone(app, date);
  if (p.typ === 'kopftest') runSimulation(app, false, { kopftest: true, onDone: done });
  else if (p.typ === 'probetest') runSimulation(app, false, { onDone: done });
  else if (p.typ === 'cat-kurz') runSimulation(app, false, { daily: true, onDone: done });
  else if (p.typ === 'spiel') runGame(app, p.key, !!p.belastung, done);
  else runTraining(app, p.key, undefined, done);
}

export function kognitivItem(st, date) {
  const p = kognitivFuer(st, date);
  return { id: 'kognitiv', t: `Kopf: ${p.titel}`, sub: `${p.optional ? 'OPTIONAL · ' : ''}CA. ${p.min} MIN${p.belastung ? ' · DIREKT NACH DEM TRAINING' : ''}`, optional: !!p.optional };
}

export function kognitivWeekCard(app, ref = iso()) {
  const st = app.state; const today = iso(); const mon = mondayOf(ref);
  return card(h('div', { class: 'k' }, '[ KOPF · WOCHENPLAN ]'),
    h('p', { class: 'small dim' }, 'Jeden Tag CAT-Kurzeinheit (10–15 min) und Psychologen-Kurzeinheit (5–10 min), sonntags der volle Probetest. Schwierigkeit passt sich an, Schwächen kommen öfter. Antippen startet.'),
    ...Array.from({ length: 7 }, (_, i) => {
      const d = addDays(mon, i); const p = kognitivFuer(st, d); const q = psychFuer(d);
      const ok = (st.done[d] || []).includes('kognitiv'), ok2 = (st.done[d] || []).includes('psych-kurz');
      return h('div', { style: { padding: '7px 0', borderBottom: '1px solid var(--line2)' } },
        h('div', { class: 'm ' + (d === today ? 'sand' : '') }, `${TAGE_LANG[weekday(d)].toUpperCase()}${d === today ? ' · HEUTE' : ''}${p.optional ? ' · OPTIONAL' : ''}`),
        h('div', { style: { cursor: 'pointer' }, onclick: () => startKognitiv(app, d) }, h('b', {}, `${ok ? '✓ ' : ''}${p.titel}`), h('span', { class: 'm' }, ` ${p.min} MIN`), h('div', { class: 'small dim' }, p.grund ? `${p.warum} (${p.grund})` : p.warum)),
        h('div', { style: { cursor: 'pointer', marginTop: '4px' }, onclick: () => startPsych(app, d) }, h('b', {}, `${ok2 ? '✓ ' : ''}Psychologe: ${q.titel}`), h('span', { class: 'm' }, ` ${q.min} MIN`), h('div', { class: 'small dim' }, q.kopf)));
    }));
}
