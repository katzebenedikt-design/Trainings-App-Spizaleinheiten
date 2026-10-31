// Formular: Trainingsmöglichkeiten einer Woche. Der Plan wird sofort neu berechnet.
import { h, card, toast } from '../ui.js';
import { AVAIL_FIELDS, availFor } from '../core/availability.js';
import { isoWeekKey, addDays, mondayOf, TAGE } from '../core/util.js';

export function renderAvailability(app, refDate, onChange) {
  const st = app.state;
  const key = isoWeekKey(refDate);
  const a = availFor(st, refDate);
  const own = !!st.week.avail?.[key];
  const save = (next, msg) => { st.week.avail = st.week.avail || {}; st.week.avail[key] = next; app.save(); toast(msg || 'Plan für diese Woche neu berechnet.'); onChange(); };
  const chips = h('div', { class: 'row wrap mt' }, ...AVAIL_FIELDS.map(([k, label]) => h('button', {
    class: 'chip ' + (a[k] ? 'on' : ''), style: { cursor: 'pointer', padding: '8px 10px' },
    onclick: () => { const n = { ...a, [k]: !a[k] }; if (k === 'bwOnly' && n.bwOnly) { n.gym = false; } if (k === 'gym' && n.gym) n.bwOnly = false; save(n); },
  }, (a[k] ? '✓ ' : '✗ ') + label)));
  const mins = h('div', { class: 'grid3 mt', style: { gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' } }, ...TAGE.map((t, i) => {
    const inp = h('input', { inputmode: 'numeric', placeholder: '–', value: a.minutes?.[i] ?? '', style: { padding: '6px 2px', textAlign: 'center', fontSize: '15px' }, 'aria-label': `Minuten ${t}` });
    inp.onchange = () => { const m = [...(a.minutes || [null, null, null, null, null, null, null])]; m[i] = inp.value.trim() === '' ? null : Math.max(0, Number(inp.value) || 0); save({ ...a, minutes: m }); };
    return h('label', { class: 'center' }, h('div', { class: 'm' }, t), inp);
  }));
  const prevKey = isoWeekKey(addDays(mondayOf(refDate), -7));
  return card(h('div', { class: 'k' }, `[ VERFÜGBAR IN KW ${key.split('-W')[1]} ]`),
    h('p', { class: 'small dim' }, own ? 'Für diese Woche eingetragen.' : 'Noch nichts eingetragen – es gilt der Standard. Antippen zum Ändern.'),
    chips,
    h('div', { class: 'm mt' }, 'MINUTEN PRO TAG (LEER = KEINE GRENZE)'), mins,
    h('div', { class: 'row wrap mt' },
      st.week.avail?.[prevKey] ? h('button', { class: 'btn s', onclick: () => save({ ...st.week.avail[prevKey] }, 'Wie letzte Woche übernommen.') }, 'Wie letzte Woche') : null,
      h('button', { class: 'btn s', onclick: () => { st.week.availDefault = { ...a }; app.save(); toast('Als Standard für Wochen ohne Eintrag gespeichert.'); onChange(); } }, 'Als Standard'),
      own ? h('button', { class: 'btn s', onclick: () => { delete st.week.avail[key]; app.save(); onChange(); } }, 'Zurücksetzen') : null));
}
