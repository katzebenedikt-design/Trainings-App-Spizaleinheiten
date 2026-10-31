// Reiter „Garmin“: manuelle Eingabe, Datei-Import, Verläufe. Die Werte fließen in Schonmodus und Planung ein.
import { h, card, modal, field, micFor, lineChart, toast, seg, celebrate } from '../ui.js';
import { iso, addDays, fmtDate, fmtTime, fmtPace, parseTime, num, fmtNum, sortByDate } from '../core/util.js';
import { mergeDaily } from '../core/garmin.js';
import { SOURCES } from '../core/garmin-source.js';
import { readiness } from '../core/readiness.js';
import { uid } from '../core/store.js';
import { giveBadge } from '../core/rewards.js';
import { doImport } from './ausdauer.js';

const METRICS = [
  { k: 'restHR', label: 'Ruhepuls', unit: 'bpm', fmt: (v) => Math.round(v), hint: 'Morgens, laut Uhr' },
  { k: 'hrv', label: 'HRV (Nacht-Ø)', unit: 'ms', fmt: (v) => Math.round(v), hint: 'Garmin: HRV-Status → letzte Nacht' },
  { k: 'sleepH', label: 'Schlaf', unit: 'h', fmt: (v) => fmtNum(v, 1), refs: [{ v: 7, label: 'Min' }], hint: 'z. B. 7,5' },
  { k: 'bodyBattery', label: 'Body Battery (morgens)', unit: '', fmt: (v) => Math.round(v), hint: '0–100' },
  { k: 'vo2max', label: 'VO2max', unit: '', fmt: (v) => fmtNum(v, 1), refs: [{ v: 50, label: 'KSK' }], hint: 'Leistungsstatus' },
  { k: 'load', label: 'Trainingsbelastung (akut)', unit: '', fmt: (v) => Math.round(v), hint: 'Trainingsstatus → Akute Belastung' },
];

export function renderGarmin(el, app) {
  const st = app.state; const today = iso();
  const g = st.daily.find((d) => d.date === today);
  const r = readiness(st, today);
  el.append(h('div', { class: 'row between mt' }, h('div', { class: 'k' }, '[ GARMIN ]'), h('button', { class: 'btn s f', onclick: () => dailyModal(app) }, '+ Werte heute')));
  el.append(card(h('div', { class: 'k' }, `[ HEUTE · ${fmtDate(today)} ]`),
    h('div', { class: 'grid3 mt' }, ...METRICS.map((m) => h('div', { class: 'tile' }, h('i', {}, m.label), h('b', { style: { fontSize: '20px' } }, g?.[m.k] != null ? m.fmt(g[m.k]) + (m.unit ? ' ' + m.unit : '') : '—')))),
    h('p', { class: 'small ' + (r.mode === 'pause' ? 'bad' : r.mode === 'leicht' ? 'warn' : 'dim') }, 'Auswirkung auf den Plan: ' + (r.mode === 'leicht' ? 'Schonmodus leicht' : r.mode === 'pause' ? 'Pause' : 'keine Einschränkung') + ' – ' + r.reasons.join(' '))));

  el.append(h('div', { class: 'grid2 mt' },
    h('button', { class: 'btn', style: { margin: 0 }, onclick: () => activityModal(app) }, '+ Aktivität'),
    h('button', { class: 'btn', style: { margin: 0 }, onclick: () => doImport(app) }, 'Datei importieren')));

  let range = Number(el.dataset.range || 60);
  el.append(h('div', { class: 'm mt2' }, 'ZEITRAUM'), seg([[30, '30 Tage'], [60, '60 Tage'], [180, '6 Monate'], [365, '1 Jahr']], range, (v) => { el.dataset.range = v; el.replaceChildren(); renderGarmin(el, app); }));
  const daily = sortByDate(st.daily).filter((d) => d.date > addDays(today, -range));
  for (const m of METRICS) {
    const pts = daily.filter((d) => d[m.k] != null).map((d) => ({ date: d.date, v: d[m.k] }));
    el.append(card(lineChart(pts, { title: `${m.label}${m.unit ? ' (' + m.unit + ')' : ''}`, fmt: m.fmt, refs: m.refs, lowerBetter: m.k === 'restHR' })));
  }

  const acts = [...st.runs.filter((x) => x.source === 'garmin').map((x) => ({ ...x, kind: x.type === 'marsch' ? 'Marsch/Gehen' : 'Lauf' })), ...st.swims.filter((x) => x.source === 'garmin').map((x) => ({ ...x, kind: 'Schwimmen' }))].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20);
  el.append(card(h('div', { class: 'k' }, '[ LETZTE GARMIN-AKTIVITÄTEN ]'), acts.length ? h('ul', { class: 'list' }, acts.map((a) => h('li', {}, h('div', { class: 'grow' }, h('b', { class: 'mono' }, `${fmtDate(a.date)} · ${a.kind}`),
    h('div', { class: 'm' }, [a.distM ? (a.kind === 'Schwimmen' ? a.distM + ' m' : fmtNum(a.distM / 1000, 2) + ' km') : '', fmtTime(a.durSec), a.distM && a.kind !== 'Schwimmen' ? fmtPace(a.durSec / (a.distM / 1000)) : '', a.avgHR ? 'HF ' + a.avgHR : ''].filter(Boolean).join(' · ')))))) : h('p', { class: 'm' }, 'Noch keine. Über „+ Aktivität“ oder Datei-Import eintragen.')));

  el.append(card(h('div', { class: 'k' }, '[ DATENQUELLEN ]'),
    h('ul', { class: 'plain small' }, SOURCES.map((s) => h('li', { class: s.active ? '' : 'dim' }, `${s.active ? '✓' : '○'} ${s.name}${s.active ? '' : ' – vorbereitet, nicht aktiv'}`))),
    h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer' } }, 'WARUM KEINE AUTOMATISCHE VERBINDUNG?'),
      h('p', { class: 'small dim' }, 'Garmin gibt seine offizielle Schnittstelle nur nach Antrag und Freigabe als Entwickler frei, und die Daten werden an einen eigenen Server geschickt. Diese App läuft nur auf deinem Handy, ohne Server. Deshalb: Datei-Export oder manuelle Eingabe. Die Anbindung ist im Code vorbereitet und kann später ergänzt werden.')),
    h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '6px' } }, 'SO EXPORTIERST DU AUS GARMIN CONNECT'),
      h('ul', { class: 'plain small' },
        h('li', {}, 'Einzelaktivität: Garmin Connect im Browser → Aktivität → Zahnrad → „Original exportieren“ (FIT) oder „Exportieren nach GPX/TCX“.'),
        h('li', {}, 'Aktivitätenliste: Aktivitäten → „Alle Aktivitäten“ → „CSV exportieren“.'),
        h('li', {}, 'Tageswerte als Tabelle: CSV mit Spalten wie Datum, Ruhepuls, HRV, Schlaf, Body Battery, VO2max, Trainingsbelastung.'),
        h('li', {}, 'Alles: garmin.com → Konto → Datenverwaltung → „Daten exportieren“ (ZIP).')))));
}


export function dailyModal(app, date = iso()) {
  const st = app.state;
  const cur = st.daily.find((d) => d.date === date) || {};
  modal(({ close }) => {
    const d = h('input', { type: 'date', value: date });
    const inputs = {};
    const fields = METRICS.map((m) => { const i = h('input', { inputmode: 'decimal', placeholder: m.hint, value: cur[m.k] != null ? String(cur[m.k]).replace('.', ',') : '' }); inputs[m.k] = i; return field(m.label + (m.unit ? ` (${m.unit})` : ''), i, micFor(i)); });
    return h('div', {}, h('div', { class: 'k' }, '[ GARMIN-WERTE ]'), h('h2', {}, 'Tageswerte eintragen'), field('Datum', d), ...fields,
      h('p', { class: 'm' }, 'Leere Felder bleiben unverändert. Niedrige HRV, wenig Schlaf oder hohe Belastung senken automatisch die Intensität des Tages.'),
      h('button', { class: 'btn f mt2', onclick: () => {
        const row = { date: d.value || date };
        for (const m of METRICS) { const v = num(inputs[m.k].value); if (v != null) row[m.k] = v; }
        if (Object.keys(row).length < 2) return toast('Mindestens einen Wert eintragen.');
        mergeDaily(st, [{ ...row, source: 'manuell' }]);
        const ev = giveBadge(st, 'garmin');
        app.save(); close(); toast('Gespeichert. Plan berücksichtigt die Werte.'); if (ev) celebrate([ev]); app.refresh();
      } }, '> Speichern'));
  }, { full: true });
}

function activityModal(app) {
  const st = app.state;
  modal(({ close }) => {
    let sport = 'lauf';
    const d = h('input', { type: 'date', value: iso() });
    const dist = h('input', { inputmode: 'decimal', placeholder: 'km (Schwimmen: m)' });
    const dur = h('input', { placeholder: 'mm:ss oder h:mm:ss' });
    const hr = h('input', { inputmode: 'numeric', placeholder: 'Ø HF' });
    const kg = h('input', { inputmode: 'decimal', placeholder: 'nur bei Marsch' });
    const out = h('div', { class: 'm mt' });
    const upd = () => { const ds = num(dist.value), t = parseTime(dur.value); if (!ds || !t) { out.textContent = ''; return; } out.textContent = sport === 'schwimmen' ? `= ${fmtTime((t / ds) * 100)} /100 m` : `= Pace ${fmtPace(t / ds)}`; };
    dist.oninput = upd; dur.oninput = upd;
    return h('div', {}, h('div', { class: 'k' }, '[ GARMIN-AKTIVITÄT ]'), h('h2', {}, 'Aktivität eintragen'),
      seg([['lauf', 'Lauf'], ['marsch', 'Marsch'], ['schwimmen', 'Schwimmen']], sport, (v) => { sport = v; upd(); }),
      field('Datum', d), field('Distanz', dist, micFor(dist)), field('Zeit', dur, micFor(dur)), out, field('Ø Herzfrequenz', hr), field('Gepäck (kg)', kg),
      h('button', { class: 'btn f mt2', onclick: () => {
        const ds = num(dist.value), t = parseTime(dur.value);
        if (!ds || !t) return toast('Distanz und Zeit eintragen.');
        const base = { id: uid(), date: d.value || iso(), durSec: t, avgHR: num(hr.value), source: 'garmin' };
        if (sport === 'schwimmen') st.swims.push({ ...base, distM: ds, stroke: 'brust' });
        else st.runs.push({ ...base, distM: ds * 1000, type: sport === 'marsch' ? 'marsch' : 'dauerlauf', typeLabel: sport === 'marsch' ? 'Marsch' : 'Lauf', kg: sport === 'marsch' ? num(kg.value) : null });
        close(); app.award(10, 'ausdauer', 'Aktivität gespeichert.'); app.refresh();
      } }, '> Speichern'));
  }, { full: true });
}
