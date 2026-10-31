// Monatlicher Leistungstest mit Diagrammen; danach passt sich der Plan an.
import { h, card, modal, field, micFor, lineChart, toast, confirmBox, iconBtn, seg } from '../ui.js';
import { TEST_FIELDS, getNorms, score7D, adaptAfterTest, currentBest } from '../core/plan.js';
import { iso, fmtDate, fmtTime, parseTime, num, sortByDate } from '../core/util.js';
import { uid } from '../core/store.js';

const fmtV = (unit, v) => (v == null ? '—' : unit === 'zeit' ? fmtTime(v) : String(v));

export function renderTest(el, app) {
  const st = app.state;
  const tests = sortByDate(st.tests);
  el.append(h('div', { class: 'k mt' }, '[ MONATLICHER LEISTUNGSTEST ]'),
    h('p', { class: 'small dim' }, 'Jede 4. Woche in der Entlastungswoche: Mittwoch Kraft & Schwimmen, Samstag 3000 m. Ausgeruht, gleiche Bedingungen, gleiche Reihenfolge. Danach passt sich der Plan automatisch an.'),
    h('button', { class: 'btn f', onclick: () => testModal(app) }, '+ Test eintragen'));

  if (tests.length) {
    const lastT = tests[tests.length - 1];
    const s7 = score7D(lastT);
    el.append(card(h('div', { class: 'k' }, `[ LETZTER TEST · ${fmtDate(lastT.date)} ]`),
      h('div', { class: 'grid3 mt' }, h('div', { class: 'tile' }, h('i', {}, '7D-Punkte'), h('b', {}, s7.sum)), h('div', { class: 'tile' }, h('i', {}, 'Gruppe'), h('b', {}, s7.group)), h('div', { class: 'tile' }, h('i', {}, 'Umfang'), h('b', {}, Math.round(st.plan.volFactor * 100) + '%'))),
      h('p', { class: 'm' }, `7D-Test nach KSK-Handbuch: 7–14 = A, 15–25 = B, 26–35 = C. ${s7.estimated ? 'Teilweise geschätzt (fehlende Disziplinen = 3 Punkte, 12-Min-Lauf aus 3000 m, Kleiderschwimmen aus Brust).' : ''}`),
      st.plan.notes.length ? h('ul', { class: 'plain small' }, st.plan.notes.map((n) => h('li', {}, n))) : null));
  }

  const start = st.profile.start;
  const NORMS = getNorms(st.profile);
  for (const k of ['run3000', 'pullups', 'pushups', 'situps', 'swim100', 'ruck7']) {
    const n = NORMS[k];
    const pts = [];
    if (start[k] != null) pts.push({ date: (st.created || iso()).slice(0, 10), v: start[k], note: 'Start' });
    for (const t of tests) if (t[k] != null) pts.push({ date: t.date, v: t[k] });
    if (!pts.length && k === 'ruck7') continue;
    el.append(card(lineChart(pts, { title: n.label, fmt: (v) => fmtV(n.unit, Math.round(v)), lowerBetter: n.lower, refs: [{ v: n.goal, label: 'Ziel' }, { v: n.top, label: 'Top', dash: '2 3' }] }), h('div', { class: 'm' }, n.src)));
  }

  if (tests.length) {
    const ul = h('ul', { class: 'list' });
    for (const t of [...tests].reverse()) ul.append(h('li', {}, h('div', { class: 'grow' }, h('b', { class: 'mono' }, fmtDate(t.date)),
      h('div', { class: 'm' }, TEST_FIELDS.filter((f) => t[f.key] != null).map((f) => `${f.label.split(' (')[0]}: ${fmtV(f.unit, t[f.key])}`).join(' · '))),
      iconBtn('trash', async () => { if (await confirmBox('Test löschen?', 'Löschen')) { st.tests = st.tests.filter((x) => x.id !== t.id); app.save(); app.refresh(); } }, 'Löschen')));
    el.append(card(h('div', { class: 'k' }, '[ ALLE TESTS ]'), ul));
  }
}

export function testModal(app, pre = {}) {
  const st = app.state;
  modal(({ close }) => {
    const d = h('input', { type: 'date', value: iso() });
    const inputs = {};
    const mk = (f) => {
      const i = h('input', { inputmode: f.unit === 'zeit' ? 'text' : 'decimal', placeholder: f.unit === 'zeit' ? 'mm:ss' : '', value: pre[f.key] != null ? fmtV(f.unit, pre[f.key]) : '' });
      inputs[f.key] = i; return field(f.label, i, micFor(i));
    };
    const best = currentBest(st);
    return h('div', {}, h('div', { class: 'k' }, '[ TEST EINTRAGEN ]'), h('h2', {}, 'Leistungstest'), field('Datum', d),
      h('p', { class: 'm' }, `Bisher: 3000 m ${fmtTime(best.run3000)} · Klimmz. ${best.pullups ?? '—'} · Liegest. ${best.pushups ?? '—'} · Sit-ups ${best.situps ?? '—'}`),
      ...TEST_FIELDS.filter((f) => f.core).map(mk),
      h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '12px' } }, '+ WEITERE DISZIPLINEN (7D-TEST, EILMARSCH)'), ...TEST_FIELDS.filter((f) => !f.core).map(mk)),
      h('button', { class: 'btn f mt2', onclick: () => {
        const t = { id: uid(), date: d.value || iso() };
        for (const f of TEST_FIELDS) { const v = inputs[f.key].value.trim(); if (!v) continue; t[f.key] = f.unit === 'zeit' ? parseTime(v) : num(v); }
        if (Object.keys(t).length <= 2) return toast('Mindestens einen Wert eintragen.');
        st.tests.push(t);
        st.plan = { ...st.plan, ...adaptAfterTest(st, t) };
        close();
        app.award(100, 'test', 'Test gespeichert. Plan angepasst.');
        app.refresh();
      } }, '> Speichern & Plan anpassen'));
  }, { full: true });
}
