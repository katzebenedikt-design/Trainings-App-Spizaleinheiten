// Krafttracker: Übungsart, Sätze, Wiederholungen, Pausen, Bestwerte, Verlauf, Diagramm, Vorschlag.
import { h, card, modal, field, micFor, lineChart, toast, seg, scale, confirmBox, iconBtn } from '../ui.js';
import { EXERCISES, TYP_LABEL, exById } from '../data/exercises.js';
import { bests, history, sessionStats, suggestNext, parseRange, effLoad } from '../core/strength.js';
import { bodyweightOn } from '../core/plan.js';
import { iso, fmtDate, fmtNum, num } from '../core/util.js';
import { uid } from '../core/store.js';
import { showExercise } from './sport.js';
import { figure } from './figures.js';
import { speak, beep, vibrate } from '../core/speech.js';

export function renderKraft(el, app) {
  const st = app.state;
  const all = [...EXERCISES, ...st.customExercises];
  const bw = bodyweightOn(st, iso());
  el.append(h('div', { class: 'row between mt' }, h('div', {}, h('div', { class: 'k' }, '[ KRAFTTRACKER ]'), h('div', { class: 'm' }, bw ? `KÖRPERGEWICHT ${fmtNum(bw)} KG (WIRD EINGERECHNET)` : 'KÖRPERGEWICHT UNTER „DATEN“ EINTRAGEN')),
    h('button', { class: 'btn s', onclick: () => customExercise(app) }, '+ Übung')));
  const groups = [...new Set(all.map((e) => e.gruppe))];
  for (const g of groups) {
    const c = card(h('div', { class: 'k' }, `[ ${g.toUpperCase()} ]`));
    const ul = h('ul', { class: 'list' });
    for (const ex of all.filter((e) => e.gruppe === g)) {
      const b = bests(st, ex); const n = history(st, ex.id).length;
      const bestTxt = ex.typ === 'zeit' ? (b.maxSec ? `${b.maxSec.v} s` : '') : ex.typ === 'kg' ? (b.maxReps ? `${b.maxReps.v} Wdh.` : '') : b.best1rm ? `1RM ≈ ${fmtNum(b.best1rm.v, 0)} kg` : '';
      ul.append(h('li', { onclick: () => exerciseDetail(app, ex), style: { cursor: 'pointer' } },
        figure(ex.fig, { thumb: true }),
        h('div', { class: 'grow' }, h('b', {}, ex.name), h('div', { class: 'm' }, `${TYP_LABEL[ex.typ]}${n ? ' · ' + n + '× trainiert' : ''}`)),
        h('div', { class: 'mono sand small' }, bestTxt)));
    }
    c.append(ul); el.append(c);
  }
}

function exerciseDetail(app, ex) {
  const st = app.state;
  modal(({ close, body }) => {
    const wrap = h('div', {});
    const draw = () => {
      wrap.replaceChildren();
      const b = bests(st, ex); const hist = history(st, ex.id);
      const sug = suggestNext(st, ex);
      wrap.append(h('div', { class: 'k' }, `[ ${TYP_LABEL[ex.typ].toUpperCase()} ]`), h('h1', {}, ex.name), figure(ex.fig),
        h('div', { class: 'row' }, h('button', { class: 'btn s', onclick: () => showExercise(ex) }, 'Ablauf ansehen'), h('button', { class: 'btn s f', onclick: () => logStrengthModal(app, ex, { onSaved: draw }) }, '+ Training')),
        card(h('div', { class: 'k' }, '[ VORSCHLAG NÄCHSTES TRAINING ]'), h('p', {}, sug.text)),
        h('div', { class: 'grid3 mt' },
          ex.typ === 'zeit' ? tile('Längste', b.maxSec ? b.maxSec.v + ' s' : '—') : tile('Max. Wdh.', b.maxReps?.v ?? '—'),
          ex.typ === 'last' || ex.typ === 'kgplus' ? tile(ex.typ === 'kgplus' ? 'Max. Zusatz' : 'Max. kg', b.maxKg ? fmtNum(b.maxKg.v) : '—') : tile('Einheiten', hist.length),
          ex.typ === 'zeit' ? tile('Einheiten', hist.length) : tile('1RM geschätzt', b.best1rm ? fmtNum(b.best1rm.v, 0) : '—')));
      let metric = ex.typ === 'zeit' ? 'sec' : ex.typ === 'kg' ? 'reps' : '1rm';
      const chartBox = h('div', {});
      const drawChart = () => {
        const pts = hist.map((s) => { const x = sessionStats(st, ex, s); return { date: s.date, v: metric === 'sec' ? x.maxSec : metric === 'reps' ? x.maxReps : metric === 'vol' ? Math.round(x.vol) : Math.round(x.best1rm) }; }).filter((p) => p.v);
        chartBox.replaceChildren(lineChart(pts, { fmt: (v) => fmtNum(v, 0) }));
      };
      const opts = ex.typ === 'zeit' ? [['sec', 'Sekunden']] : ex.typ === 'kg' ? [['reps', 'Max. Wdh.'], ['vol', 'Volumen']] : [['1rm', '1RM'], ['reps', 'Max. Wdh.'], ['vol', 'Volumen']];
      wrap.append(card(h('div', { class: 'k' }, '[ VERLAUF ]'), seg(opts, metric, (m) => { metric = m; drawChart(); }), chartBox,
        ex.typ === 'kgplus' ? h('p', { class: 'm' }, 'Last = Körpergewicht am Trainingstag + Zusatzgewicht.') : null));
      drawChart();
      const list = h('ul', { class: 'list' });
      for (const s of [...hist].reverse()) {
        const x = sessionStats(st, ex, s);
        list.append(h('li', {}, h('div', { class: 'grow' }, h('b', { class: 'mono' }, fmtDate(s.date)),
          h('div', { class: 'm' }, s.sets.map((t) => ex.typ === 'zeit' ? `${t.sec}s` : ex.typ === 'kg' ? `${t.reps}` : `${t.reps}×${fmtNum(t.kg || 0)}`).join(' · ') + (s.note ? ` · ${s.note}` : '')),
          ex.typ === 'kgplus' && x.bw ? h('div', { class: 'm' }, `inkl. Körpergewicht ${fmtNum(x.bw)} kg`) : null,
          s.grade ? h('div', { class: 'm' }, `Gefühl: Note ${s.grade}`) : null),
          iconBtn('trash', async () => { if (await confirmBox('Diesen Eintrag löschen?', 'Löschen')) { st.strength = st.strength.filter((y) => y.id !== s.id); app.save(); draw(); } }, 'Löschen')));
      }
      wrap.append(card(h('div', { class: 'k' }, '[ EINTRÄGE ]'), hist.length ? list : h('p', { class: 'm' }, 'Noch keine Einträge.')));
      if (ex.custom) wrap.append(h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Eigene Übung und alle Einträge löschen?', 'Löschen')) { st.customExercises = st.customExercises.filter((e) => e.id !== ex.id); st.strength = st.strength.filter((y) => y.exId !== ex.id); app.save(); close(); app.refresh(); } } }, 'Übung löschen'));
    };
    draw();
    return wrap;
  }, { full: true });
}

const tile = (l, v) => h('div', { class: 'tile' }, h('i', {}, l), h('b', {}, String(v)));

function customExercise(app) {
  modal(({ close }) => {
    const name = h('input', { placeholder: 'z. B. Beinpresse' });
    let typ = 'last';
    const grp = h('select', {}, ...['Beine', 'Brust', 'Rücken', 'Schulter', 'Arme', 'Rumpf', 'Ganzkörper'].map((g) => h('option', {}, g)));
    return h('div', {}, h('h2', {}, 'Eigene Übung'), field('Name', name),
      h('div', { class: 'k mt' }, 'Übungsart'),
      seg([['last', 'Zusatzgewicht'], ['kg', 'Körpergewicht'], ['kgplus', 'KG + Zusatz'], ['zeit', 'Halten']], typ, (t) => { typ = t; }),
      field('Muskelgruppe', grp),
      h('button', { class: 'btn f mt2', onclick: () => {
        if (!name.value.trim()) return toast('Name fehlt.');
        app.state.customExercises.push({ id: 'c_' + uid(), name: name.value.trim(), typ, gruppe: grp.value, custom: true, cue: '' });
        app.save(); close(); app.refresh();
      } }, 'Anlegen'));
  });
}

// Eintragen eines Krafttrainings mit Satz-Editor und Pausen-Timer
export function logStrengthModal(app, ex, opts = {}) {
  const st = app.state;
  const date = opts.date || iso();
  const range = opts.range ? parseRange(opts.range) : null;
  const sug = suggestNext(st, ex, range);
  const nSets = opts.sets || sug.sets?.length || 3;
  const rest = opts.rest || 90;
  let sets = (sug.sets && sug.sets.length ? sug.sets : Array.from({ length: nSets }, () => ({}))).map((s) => ({ reps: s.reps ?? (range ? range[0] : null), kg: s.kg ?? null, sec: s.sec ?? null, rest }));
  while (sets.length < nSets) sets.push({ ...sets[sets.length - 1] });
  let grade = 0;
  modal(({ close }) => {
    const wrap = h('div', {});
    const bw = bodyweightOn(st, date);
    const rows = h('div', {});
    const dateIn = h('input', { type: 'date', value: date });
    const note = h('input', { placeholder: 'Notiz (optional)' });
    const draw = () => {
      rows.replaceChildren(...sets.map((s, i) => {
        const inputs = [];
        const mk = (key, ph, w) => { const inp = h('input', { type: 'text', inputmode: 'decimal', placeholder: ph, value: s[key] ?? '', style: { width: w } }); inp.oninput = () => { s[key] = num(inp.value); }; return inp; };
        if (ex.typ === 'zeit') inputs.push(mk('sec', 'Sek.', '90px'));
        else inputs.push(mk('reps', 'Wdh.', '80px'));
        if (ex.typ === 'last' || ex.typ === 'kgplus') inputs.push(mk('kg', ex.typ === 'kgplus' ? '+kg' : 'kg', '90px'));
        const restIn = mk('rest', 'Pause s', '84px');
        return h('div', { class: 'row', style: { marginTop: '8px' } }, h('span', { class: 'm', style: { width: '26px' } }, `S${i + 1}`), ...inputs, restIn,
          h('button', { class: 'icon-btn', title: 'Pause starten', onclick: () => restTimer(s.rest || rest) }, '⏱'));
      }));
    };
    draw();
    wrap.append(h('div', { class: 'k' }, '[ TRAINING EINTRAGEN ]'), h('h2', {}, ex.name),
      h('div', { class: 'm' }, ex.typ === 'kgplus' ? `Zusatzgewicht eintragen. Körpergewicht (${bw ? fmtNum(bw) + ' kg' : 'noch nicht eingetragen'}) wird automatisch addiert.` : TYP_LABEL[ex.typ]),
      card(h('div', { class: 'k' }, '[ VORSCHLAG ]'), h('p', { class: 'small' }, sug.text)),
      field('Datum', dateIn),
      h('div', { class: 'row m mt' }, h('span', { style: { width: '26px' } }, ''), h('span', { style: { width: '80px' } }, ex.typ === 'zeit' ? 'SEK' : 'WDH'), ex.typ === 'last' || ex.typ === 'kgplus' ? h('span', { style: { width: '90px' } }, 'KG') : null, h('span', {}, 'PAUSE')),
      rows,
      h('div', { class: 'row mt' }, h('button', { class: 'btn s', onclick: () => { sets.push({ ...sets[sets.length - 1] }); draw(); } }, '+ Satz'), h('button', { class: 'btn s', onclick: () => { if (sets.length > 1) { sets.pop(); draw(); } } }, '− Satz')),
      h('div', { class: 'mt' }, h('b', {}, 'Gefühl im Vergleich zum letzten Mal'), h('div', { class: 'm' }, 'Schulnote 1 = sehr leicht … 6 = sehr schwer (KSK-Trainingstagebuch)'), scale(grade, (g) => { grade = g; }, 6)),
      field('Notiz', note),
      h('button', { class: 'btn f mt2', onclick: () => {
        const clean = sets.filter((s) => (ex.typ === 'zeit' ? s.sec : s.reps)).map((s) => ({ reps: s.reps, kg: s.kg, sec: s.sec, rest: s.rest }));
        if (!clean.length) return toast('Mindestens einen Satz eintragen.');
        const before = bests(st, ex);
        const entry = { id: uid(), date: dateIn.value || date, exId: ex.id, sets: clean, grade: grade || null, note: note.value.trim(), range: range || undefined };
        st.strength.push(entry);
        const after = bests(st, ex);
        const pr = (after.best1rm?.v || 0) > (before.best1rm?.v || 0) + 0.1 || (after.maxReps?.v || 0) > (before.maxReps?.v || 0) || (after.maxSec?.v || 0) > (before.maxSec?.v || 0);
        close();
        app.award(pr && history(st, ex.id).length > 1 ? 15 : 5, 'kraft', pr && history(st, ex.id).length > 1 ? 'Neuer Bestwert!' : 'Satz-Protokoll gespeichert.');
        opts.onSaved?.();
      } }, '> Speichern'));
    return wrap;
  }, { full: true });
}

// Pausen-Timer zwischen den Sätzen (Signalton + Ansage)
export function restTimer(sec) {
  let left = sec; let alive = true;
  const m = modal(({ close }) => {
    const clock = h('div', { class: 'clock' }, String(left));
    const iv = setInterval(() => {
      if (!alive) return clearInterval(iv);
      left--; clock.textContent = String(Math.max(0, left));
      if (left === 3 || left === 2 || left === 1) beep(660, 100);
      if (left <= 0) { clearInterval(iv); beep(990, 400); vibrate([200, 100, 200]); speak('Nächster Satz.'); setTimeout(close, 800); }
    }, 1000);
    return h('div', { class: 'timer-face rest' }, h('div', { class: 'phase' }, 'Pause'), clock, h('button', { class: 'btn', onclick: () => { left = 1; } }, 'Überspringen'));
  });
  m.onClose(() => { alive = false; });
}
