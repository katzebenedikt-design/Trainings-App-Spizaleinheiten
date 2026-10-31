// Laufen, Marsch, Schwimmen (Brust), Körpergewicht und Garmin-Import.
import { h, card, modal, field, micFor, lineChart, toast, seg, confirmBox, iconBtn, pickFile } from '../ui.js';
import { iso, fmtDate, fmtTime, fmtPace, parseTime, num, fmtNum, sortByDate } from '../core/util.js';
import { uid } from '../core/store.js';
import { importFile, toIso, mergeDaily } from '../core/garmin.js';
import { giveBadge } from '../core/rewards.js';
import { celebrate } from '../ui.js';

const TYPES = { lauf: [['dauerlauf', 'Dauerlauf'], ['intervall', 'Intervall'], ['tempo', 'Tempo'], ['test', 'Test/Wettkampf']], marsch: [['marsch', 'Marsch']], schwimmen: [['brust', 'Brust'], ['kleider', 'Kleiderschwimmen']] };

export function renderAusdauer(el, app) {
  const st = app.state;
  let mode = el.dataset.mode || 'lauf';
  el.append(seg([['lauf', 'Laufen'], ['marsch', 'Marsch'], ['schwimmen', 'Schwimmen']], mode, (m) => { el.dataset.mode = m; el.replaceChildren(); renderAusdauer(el, app); }));
  el.append(h('button', { class: 'btn f', onclick: () => logRunModal(app, mode) }, `+ ${mode === 'schwimmen' ? 'Schwimmen' : mode === 'marsch' ? 'Marsch' : 'Lauf'} eintragen`));
  const list = mode === 'schwimmen' ? sortByDate(st.swims) : sortByDate(st.runs.filter((r) => (mode === 'marsch' ? r.type === 'marsch' : r.type !== 'marsch')));
  if (mode === 'schwimmen') {
    el.append(card(lineChart(list.filter((s) => s.distM && s.durSec).map((s) => ({ date: s.date, v: (s.durSec / s.distM) * 100 })), { title: 'Tempo pro 100 m', fmt: (v) => fmtTime(v), lowerBetter: true, refs: [{ v: 120, label: 'Ziel' }] })));
    el.append(card(lineChart(list.map((s) => ({ date: s.date, v: s.distM })), { title: 'Strecke (m)', fmt: (v) => fmtNum(v, 0) })));
  } else if (mode === 'lauf') {
    const r3 = list.filter((r) => r.distM >= 2900 && r.distM <= 3200 && r.durSec).map((r) => ({ date: r.date, v: (r.durSec * 3000) / r.distM }));
    el.append(card(lineChart(r3, { title: '3000-m-Zeit (Läufe 2,9–3,2 km)', fmt: fmtTime, lowerBetter: true, refs: [{ v: 720, label: 'KSK' }, { v: 645, label: 'Top', dash: '2 3' }] })));
    el.append(card(lineChart(list.filter((r) => r.distM && r.durSec).map((r) => ({ date: r.date, v: r.durSec / (r.distM / 1000) })), { title: 'Pace pro km (alle Läufe)', fmt: fmtTime, lowerBetter: true })));
  } else {
    el.append(card(lineChart(list.map((r) => ({ date: r.date, v: r.distM / 1000, note: r.kg ? r.kg + ' kg' : '' })), { title: 'Marschstrecke (km)', fmt: (v) => fmtNum(v, 1), refs: [{ v: 20, label: 'PFV' }] })));
  }
  const ul = h('ul', { class: 'list' });
  for (const r of [...list].reverse().slice(0, 60)) {
    const pace = r.distM && r.durSec ? (mode === 'schwimmen' ? fmtTime((r.durSec / r.distM) * 100) + ' /100 m' : fmtPace(r.durSec / (r.distM / 1000))) : '';
    ul.append(h('li', {}, h('div', { class: 'grow' }, h('b', { class: 'mono' }, `${fmtDate(r.date)} · ${r.distM ? (mode === 'schwimmen' ? r.distM + ' m' : fmtNum(r.distM / 1000, 2) + ' km') : ''} · ${fmtTime(r.durSec)}`),
      h('div', { class: 'm' }, [r.typeLabel || r.type, pace, r.avgHR ? 'HF ' + r.avgHR : '', r.kg ? r.kg + ' kg' : '', r.source === 'garmin' ? 'GARMIN' : '', r.note].filter(Boolean).join(' · '))),
      iconBtn('trash', async () => { if (await confirmBox('Eintrag löschen?', 'Löschen')) { if (mode === 'schwimmen') st.swims = st.swims.filter((x) => x.id !== r.id); else st.runs = st.runs.filter((x) => x.id !== r.id); app.save(); app.refresh(); } }, 'Löschen')));
  }
  el.append(card(h('div', { class: 'k' }, '[ EINTRÄGE ]'), list.length ? ul : h('p', { class: 'm' }, 'Noch nichts eingetragen.')));
}

export function logRunModal(app, kind = 'lauf', date = iso(), pre = {}) {
  const st = app.state;
  modal(({ close }) => {
    const d = h('input', { type: 'date', value: date });
    const dist = h('input', { inputmode: 'decimal', placeholder: kind === 'schwimmen' ? 'Meter, z. B. 800' : 'km, z. B. 5,2', value: pre.distM ? (kind === 'schwimmen' ? pre.distM : String(pre.distM / 1000).replace('.', ',')) : '' });
    const dur = h('input', { inputmode: 'text', placeholder: 'mm:ss oder h:mm:ss', value: pre.durSec ? fmtTime(pre.durSec) : '' });
    const hr = h('input', { inputmode: 'numeric', placeholder: 'optional' });
    const kg = h('input', { inputmode: 'decimal', placeholder: 'Gepäck kg', value: pre.kg || '' });
    const note = h('input', { placeholder: 'optional' });
    let type = TYPES[kind][0][0];
    const out = h('div', { class: 'm mt' });
    const upd = () => { const ds = num(dist.value), t = parseTime(dur.value); if (ds && t) { const m = kind === 'schwimmen' ? ds : ds * 1000; out.textContent = kind === 'schwimmen' ? `= ${fmtTime((t / m) * 100)} pro 100 m` : `= ${fmtPace(t / (m / 1000))}${Math.abs(m - 3000) < 1 ? '' : ` · 3000 m hochgerechnet ≈ ${fmtTime((t * 3000) / m)}`}`; } else out.textContent = ''; };
    dist.oninput = upd; dur.oninput = upd; upd();
    return h('div', {}, h('div', { class: 'k' }, '[ EINTRAGEN ]'), h('h2', {}, kind === 'schwimmen' ? 'Schwimmen' : kind === 'marsch' ? 'Marsch' : 'Lauf'),
      TYPES[kind].length > 1 ? seg(TYPES[kind], type, (t) => { type = t; }) : null,
      field('Datum', d), field(kind === 'schwimmen' ? 'Strecke (m)' : 'Strecke (km)', dist, micFor(dist)), field('Zeit', dur, micFor(dur)), out,
      kind === 'marsch' ? field('Gepäck (kg)', kg, micFor(kg)) : null,
      kind !== 'schwimmen' ? field('Ø Herzfrequenz', hr) : null, field('Notiz', note),
      h('button', { class: 'btn f mt2', onclick: () => {
        const ds = num(dist.value), t = parseTime(dur.value);
        if (!ds || !t) return toast('Strecke und Zeit eintragen.');
        const e = { id: uid(), date: d.value || date, durSec: t, note: note.value.trim() };
        if (kind === 'schwimmen') { Object.assign(e, { distM: ds, stroke: type }); st.swims.push(e); }
        else { Object.assign(e, { distM: ds * 1000, type: kind === 'marsch' ? 'marsch' : type, typeLabel: (TYPES[kind].find((x) => x[0] === type) || [])[1], avgHR: num(hr.value), kg: kind === 'marsch' ? num(kg.value) : null }); st.runs.push(e); }
        close(); app.award(kind === 'marsch' ? 15 : 10, 'ausdauer', 'Eingetragen.'); app.refresh();
      } }, '> Speichern'));
  });
}

export function logWeightModal(app, kgPre) {
  const st = app.state;
  modal(({ close }) => {
    const d = h('input', { type: 'date', value: iso() });
    const kg = h('input', { inputmode: 'decimal', placeholder: 'z. B. 72,5', value: kgPre ? String(kgPre).replace('.', ',') : '' });
    return h('div', {}, h('h2', {}, 'Körpergewicht'), field('Datum', d), field('Gewicht (kg)', kg, micFor(kg)),
      h('p', { class: 'm' }, 'Morgens nüchtern messen. Wird bei Klimmzügen, Dips usw. automatisch eingerechnet.'),
      h('button', { class: 'btn f', onclick: () => {
        const v = num(kg.value); if (!v || v < 30 || v > 200) return toast('Gewicht prüfen.');
        st.bodyweight = st.bodyweight.filter((w) => w.date !== d.value); st.bodyweight.push({ date: d.value, kg: v });
        close(); app.save(); toast('Gewicht gespeichert.'); app.refresh();
      } }, '> Speichern'));
  });
}

export function renderDaten(el, app) {
  const st = app.state;
  const bw = sortByDate(st.bodyweight);
  const bmi = bw.length ? bw[bw.length - 1].kg / ((st.profile.heightCm / 100) ** 2) : null;
  el.append(card(h('div', { class: 'row between' }, h('div', { class: 'k' }, '[ KÖRPERGEWICHT ]'), h('button', { class: 'btn s', onclick: () => logWeightModal(app) }, '+ Eintragen')),
    lineChart(bw.map((w) => ({ date: w.date, v: w.kg })), { fmt: (v) => fmtNum(v, 1) }),
    bmi ? h('div', { class: 'm' }, `${st.profile.heightCm} CM · BMI ${fmtNum(bmi, 1)} (bei Sportlern nur grob aussagekräftig)`) : null));

  el.append(h('p', { class: 'm mt' }, 'Garmin-Werte (Ruhepuls, HRV, Schlaf …) findest du im Reiter „Garmin“.'), h('button', { class: 'btn', onclick: () => app.go('#/sport/garmin') }, 'Zum Garmin-Reiter'));
}

export async function doImport(app) {
  const st = app.state;
  const file = await pickFile('.fit,.gpx,.tcx,.csv,.zip,.json');
  if (!file) return;
  toast('Lese ' + file.name + ' …', 4000);
  try {
    const res = await importFile(file, (i, n) => { if (i % 25 === 0) toast(`Verarbeite ${i}/${n} …`, 1500); });
    let added = 0, dup = 0;
    for (const a of res.acts) {
      if (!a.start || !(a.durSec > 0)) continue;
      const date = toIso(new Date(a.start));
      if (a.sport === 'schwimmen') {
        if (st.swims.some((x) => x.date === date && Math.abs((x.durSec || 0) - a.durSec) < 30)) { dup++; continue; }
        st.swims.push({ id: uid(), date, distM: Math.round(a.distM || 0), durSec: Math.round(a.durSec), stroke: 'brust', source: 'garmin' });
      } else if (['lauf', 'gehen', 'wandern'].includes(a.sport)) {
        if (st.runs.some((x) => x.date === date && Math.abs((x.durSec || 0) - a.durSec) < 30)) { dup++; continue; }
        st.runs.push({ id: uid(), date, distM: Math.round(a.distM || 0), durSec: Math.round(a.durSec), type: a.sport === 'lauf' ? 'dauerlauf' : 'marsch', typeLabel: a.sport === 'lauf' ? 'Lauf' : 'Gehen/Marsch', avgHR: a.avgHR, source: 'garmin' });
      } else continue;
      added++;
    }
    const days = mergeDaily(st, res.daily);
    const ev = giveBadge(st, 'garmin');
    app.save();
    toast(`Import: ${added} Aktivitäten${dup ? `, ${dup} doppelt übersprungen` : ''}, ${days} Tageswerte.`, 5000);
    if (ev) celebrate([ev]);
    app.refresh();
  } catch (e) { console.error(e); toast('Import fehlgeschlagen: ' + e.message, 5000); }
}
