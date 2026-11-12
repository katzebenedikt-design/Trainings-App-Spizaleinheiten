// Reiter „Garmin“: Morgenbericht, Kennzahlen, Verläufe, Aktivitäten. Quellen: automatische Abholung
// (verschlüsselte Datei), Datei-Import (CSV/FIT/ZIP) und manuelle Eingabe. Die Werte steuern Schonmodus und Wochen-Update.
import { h, card, modal, field, micFor, lineChart, toast, seg, celebrate } from '../ui.js';
import { iso, addDays, fmtDate, fmtTime, fmtPace, parseTime, num, fmtNum, sortByDate, isoWeekKey, mondayOf } from '../core/util.js';
import { mergeDaily } from '../core/garmin.js';
import { HRV_LABEL, STATUS_LABEL, sportOf } from '../core/garmin-map.js';
import { SOURCES } from '../core/garmin-source.js';
import { readiness } from '../core/readiness.js';
import { syncGarmin } from '../core/garmin-sync.js';
import { GARMIN_START } from '../data/garmin-start.js';
import { uid } from '../core/store.js';
import { giveBadge } from '../core/rewards.js';
import { doImport } from './ausdauer.js';

const f1 = (v) => fmtNum(v, 1), r0 = (v) => String(Math.round(v));
// Morgenbericht-Felder (Reihenfolge wie auf der Uhr) und weitere Tageswerte
const MORGEN = [
  { k: 'sleepH', label: 'Schlaf', unit: 'h', fmt: f1, hint: 'z. B. 7,5' },
  { k: 'sleepScore', label: 'Schlafscore', unit: '', fmt: r0, hint: '0–100' },
  { k: 'hrv', label: 'HRV letzte Nacht', unit: 'ms', fmt: r0, hint: 'z. B. 52' },
  { k: 'bodyBattery', label: 'Body Battery (nach dem Aufwachen)', unit: '', fmt: r0, hint: '0–100' },
  { k: 'readiness', label: 'Trainingsbereitschaft', unit: '', fmt: r0, hint: '0–100' },
  { k: 'recoveryH', label: 'Erholungszeit', unit: 'h', fmt: r0, hint: 'Stunden' },
  { k: 'restHR', label: 'Ruhepuls', unit: 'bpm', fmt: r0, hint: 'z. B. 52' },
];
const WEITERE = [
  { k: 'hrv7', label: 'HRV 7-Tage-Schnitt', unit: 'ms', fmt: r0, hint: 'z. B. 52' },
  { k: 'sleepDeep', label: 'Tiefschlaf', unit: 'h', fmt: f1, hint: 'h' }, { k: 'sleepLight', label: 'Leichtschlaf', unit: 'h', fmt: f1, hint: 'h' },
  { k: 'sleepRem', label: 'REM-Schlaf', unit: 'h', fmt: f1, hint: 'h' }, { k: 'sleepAwake', label: 'Wach', unit: 'h', fmt: f1, hint: 'h' },
  { k: 'acuteLoad', label: 'Akute Belastung', unit: '', fmt: r0, hint: 'z. B. 341' }, { k: 'chronicLoad', label: 'Chronische Belastung', unit: '', fmt: r0, hint: 'z. B. 312' },
  { k: 'vo2max', label: 'VO2max', unit: '', fmt: f1, hint: 'z. B. 46,1' },
];
const latest = (st, k, upTo = iso()) => sortByDate(st.daily).filter((d) => d.date <= upTo && d[k] != null).pop() || null;
const avgOf = (rows, k) => { const v = rows.map((d) => d[k]).filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

// ---------- Morgenbericht als Tageskarte (auch auf der Startseite) ----------
export function morningCard(app, date = iso(), { compact = false } = {}) {
  const st = app.state;
  const g = st.daily.find((d) => d.date === date);
  const r = readiness(st, date);
  const has = g && (g.report || MORGEN.some((m) => g[m.k] != null && g.source !== 'startwert'));
  if (!has) {
    const sync = st.settings.garminKeys ? 'Die automatische Abholung läuft jeden Morgen gegen 7:15 Uhr.' : 'Automatische Abholung einrichten: Einstellungen → Garmin → Verbindungscode.';
    return card(h('div', { class: 'k' }, `[ GARMIN-MORGENBERICHT · ${fmtDate(date)} ]`), h('p', { class: 'small dim' }, `Noch kein Bericht für heute. ${sync}`),
      h('button', { class: 'btn s', onclick: () => dailyModal(app, date) }, 'Von Hand eintragen'));
  }
  const voll = r.mode === 'normal' || r.mode === 'offen';
  const tile = (label, val, cls = '') => h('div', { class: 'tile' }, h('i', {}, label), h('b', { class: cls, style: { fontSize: '19px' } }, val));
  const hrvTxt = g.hrv != null ? `${g.hrv} ms` : '—';
  const verdict = voll ? h('div', { class: 'verdict ok' }, h('b', {}, '▶ Volle Einheit'), h('div', { class: 'small' }, 'Die Werte sind gut genug. Heute wie geplant trainieren.'))
    : r.mode === 'pause' ? h('div', { class: 'verdict bad' }, h('b', {}, '■ Pause'), h('div', { class: 'small' }, 'Heute Erholung statt Training. Spaziergang und Mobilität sind gut.'))
      : h('div', { class: 'verdict warn' }, h('b', {}, '▼ Leichtere Ersatz-Einheit'), h('div', { class: 'small' }, 'Die App hat die heutige Einheit automatisch abgeschwächt (siehe Tagesbefehl).'));
  return card(h('div', { class: 'row between' }, h('div', { class: 'k' }, `[ GARMIN-MORGENBERICHT · ${fmtDate(date)} ]`), h('span', { class: 'm' }, g.reportTime ? g.reportTime.slice(11, 16) + ' UHR' : g.source === 'manuell' ? 'VON HAND' : '')),
    h('div', { class: 'grid3 mt' },
      tile('Schlaf', g.sleepH != null ? `${f1(g.sleepH)} h${g.sleepScore != null ? ' · ' + g.sleepScore : ''}` : '—'),
      tile('HRV', `${hrvTxt}`, ['niedrig', 'schwach'].includes(g.hrvStatus) ? 'warn' : ''),
      tile('Body Battery', g.bodyBattery != null ? String(g.bodyBattery) : '—', g.bodyBattery != null && g.bodyBattery < 25 ? 'warn' : ''),
      tile('Bereitschaft', g.readiness != null ? String(g.readiness) : '—', g.readiness != null && g.readiness < 50 ? 'warn' : ''),
      tile('Erholung', g.recoveryH != null ? `${Math.round(g.recoveryH)} h` : '—'),
      tile('Ruhepuls', g.restHR != null ? `${g.restHR}` : '—')),
    g.hrvStatus ? h('div', { class: 'm' }, `HRV-STATUS: ${(HRV_LABEL[g.hrvStatus] || '').toUpperCase()}${g.hrv7 ? ` · 7 TAGE Ø ${g.hrv7} MS` : ''}${g.trainingStatus ? ` · ZUSTAND: ${(STATUS_LABEL[g.trainingStatus] || '').toUpperCase()}` : ''}`) : null,
    verdict,
    compact ? null : h('ul', { class: 'plain small dim' }, r.reasons.map((x) => h('li', {}, x))));
}

// ---------- Reiter ----------
export function renderGarmin(el, app) {
  const st = app.state; const today = iso();
  el.append(h('div', { class: 'row between mt' }, h('div', { class: 'k' }, '[ GARMIN ]'), h('button', { class: 'btn s f', onclick: () => dailyModal(app) }, '+ Werte heute')));
  el.append(morningCard(app, today));

  // Kennzahlen
  const week7 = sortByDate(st.daily).filter((d) => d.date > addDays(today, -7) && d.date <= today && d.source !== 'startwert');
  const vo2 = latest(st, 'vo2max'), hrv7 = latest(st, 'hrv7'), rest = latest(st, 'restHR'), stat = latest(st, 'trainingStatus'), load = latest(st, 'acuteLoad'), chron = latest(st, 'chronicLoad'), rd = latest(st, 'readiness');
  const wk = st.garminWeeks?.[isoWeekKey(today)];
  const tile = (label, val, sub, cls = '') => h('div', { class: 'tile' }, h('i', {}, label), h('b', { class: cls, style: { fontSize: '19px' } }, val), sub ? h('span', { class: 'm' }, sub) : null);
  const sl = avgOf(week7, 'sleepH'), sls = avgOf(week7, 'sleepScore');
  el.append(card(h('div', { class: 'k' }, '[ KENNZAHLEN ]'), h('div', { class: 'grid3 mt' },
    tile('VO2max', vo2 ? f1(vo2.vo2max) : '—', vo2 ? fmtDate(vo2.date) : ''),
    tile('HRV 7 Tage', hrv7 ? `${hrv7.hrv7} ms` : '—', hrv7?.hrvStatus ? HRV_LABEL[hrv7.hrvStatus] : '', ['niedrig', 'schwach'].includes(hrv7?.hrvStatus) ? 'warn' : ''),
    tile('Ruhepuls', rest ? `${rest.restHR}` : '—', 'BPM'),
    sl ? tile('Schlaf Ø', `${f1(sl)} h`, sls ? `SCORE Ø ${Math.round(sls)}` : '') : tile('Schlaf Ø', `${f1(GARMIN_START.werte.sleepAvgH)} h`, `STARTWERT · SCORE Ø ${GARMIN_START.werte.sleepScoreAvg}`),
    tile('Bereitschaft', rd ? `${rd.readiness}` : '—', rd ? fmtDate(rd.date) : '', rd && rd.readiness < 50 ? 'warn' : ''),
    tile('Zustand', stat ? STATUS_LABEL[stat.trainingStatus] || '—' : '—', '', ['ueberlastet', 'ueberfordert'].includes(stat?.trainingStatus) ? 'warn' : ''),
    tile('Belastung', load ? `${load.acuteLoad}${chron ? ' / ' + chron.chronicLoad : ''}` : '—', 'AKUT / CHRONISCH', load && chron && load.acuteLoad > chron.chronicLoad * 1.3 ? 'warn' : ''),
    tile('Intensität', wk ? `${wk.total}` : '—', wk ? `MIN · ZIEL ${wk.goal}` : 'MIN DIESE WOCHE'),
    tile('Aktivitäten', String((st.activities || []).filter((a) => a.date > addDays(today, -7)).length), 'LETZTE 7 TAGE')),
  h('p', { class: 'm' }, `STARTWERTE ${fmtDate(GARMIN_START.stand)}: VO2MAX ${f1(GARMIN_START.werte.vo2max)} · HRV Ø ${GARMIN_START.werte.hrv7} MS · BEREITSCHAFT ${GARMIN_START.werte.readiness} · SCHLAF Ø ${f1(GARMIN_START.werte.sleepAvgH)} H / ${GARMIN_START.werte.sleepScoreAvg}`)));

  el.append(h('div', { class: 'grid2 mt' },
    h('button', { class: 'btn', style: { margin: 0 }, onclick: () => activityModal(app) }, '+ Aktivität'),
    h('button', { class: 'btn', style: { margin: 0 }, onclick: () => doImport(app) }, 'Datei importieren')));

  // Verläufe
  let range = Number(el.dataset.range || 60);
  el.append(h('div', { class: 'm mt2' }, 'ZEITRAUM'), seg([[30, '30 Tage'], [60, '60 Tage'], [180, '6 Monate'], [365, '1 Jahr']], range, (v) => { el.dataset.range = v; el.replaceChildren(); renderGarmin(el, app); }));
  const daily = sortByDate(st.daily).filter((d) => d.date > addDays(today, -range));
  const pts = (k) => daily.filter((d) => d[k] != null).map((d) => ({ date: d.date, v: d[k] }));
  const charts = [
    // Ohne Nachtwerte (z. B. nur Startwerte) den 7-Tage-Schnitt als Hauptlinie zeigen
    pts('hrv').length ? ['HRV (ms)', pts('hrv'), { second: { points: pts('hrv7'), label: '7-Tage-Schnitt' }, label: 'Nacht', fmt: r0 }] : ['HRV (ms)', pts('hrv7'), { label: '7-Tage-Schnitt', fmt: r0 }],
    ['Schlaf (h)', pts('sleepH'), { refs: [{ v: 7, label: 'Min' }], fmt: f1 }],
    ['Schlafscore', pts('sleepScore'), { refs: [{ v: 70, label: 'gut' }], fmt: r0 }],
    ['VO2max', pts('vo2max'), { refs: [{ v: 50, label: 'KSK-Ziel' }], fmt: f1 }],
    ['Trainingsbereitschaft', pts('readiness'), { refs: [{ v: 50, label: 'voll ab' }], fmt: r0 }],
    ['Belastung', pts('acuteLoad'), { second: { points: pts('chronicLoad'), label: 'chronisch' }, label: 'akut', fmt: r0 }],
    ['Ruhepuls (bpm)', pts('restHR'), { fmt: r0, lowerBetter: true }],
  ];
  for (const [title, p, o] of charts) el.append(card(lineChart(p, { title, ...o })));
  const weeks = Object.entries(st.garminWeeks || {}).sort(([a], [b]) => (a < b ? -1 : 1)).slice(-Math.ceil(range / 7)).map(([, w]) => ({ date: w.start, v: w.total }));
  el.append(card(lineChart(weeks, { title: 'Intensitätsminuten pro Woche', refs: [{ v: 150, label: 'WHO-Minimum' }], fmt: r0, label: 'Minuten (stark ×2)' })));
  el.append(card(sleepPhases(daily.filter((d) => d.sleepDeep != null).slice(-7))));

  // Aktivitäten
  const acts = [...(st.activities || []), ...st.runs.filter((x) => x.source === 'garmin' && !x.garminId).map((x) => ({ ...x, typeLabel: x.type === 'marsch' ? 'Marsch/Gehen' : 'Laufen' })), ...st.swims.filter((x) => x.source === 'garmin' && !x.garminId).map((x) => ({ ...x, typeLabel: 'Schwimmen', sport: 'schwimmen' }))]
    .sort((a, b) => (a.date + (a.time || '') < b.date + (b.time || '') ? 1 : -1)).slice(0, 15);
  el.append(card(h('div', { class: 'k' }, '[ LETZTE AKTIVITÄTEN ]'), acts.length ? h('ul', { class: 'list' }, acts.map((a) => h('li', {}, h('div', { class: 'grow' },
    h('b', { class: 'mono' }, `${fmtDate(a.date)}${a.time ? ' ' + a.time : ''} · ${a.typeLabel || 'Aktivität'}`),
    h('div', { class: 'm' }, [fmtTime(a.durSec), a.distM ? (a.sport === 'schwimmen' ? a.distM + ' m' : fmtNum(a.distM / 1000, 2) + ' km') : '', a.distM && a.sport === 'lauf' ? fmtPace(a.durSec / (a.distM / 1000)) : '', a.avgHR ? 'Ø ' + a.avgHR : '', a.maxHR ? 'MAX ' + a.maxHR : ''].filter(Boolean).join(' · ')))))) : h('p', { class: 'm' }, 'Noch keine Aktivitäten.')));

  // Quellen + Abholung
  const sy = st.settings.garminSync;
  el.append(card(h('div', { class: 'k' }, '[ DATENQUELLEN ]'),
    h('ul', { class: 'plain small' }, SOURCES.map((s) => h('li', { class: s.active ? '' : 'dim' }, `${s.active ? '✓' : '○'} ${s.name}${s.active ? '' : ' – vorbereitet, nicht aktiv'}`))),
    h('p', { class: 'small' }, st.settings.garminKeys ? `Automatische Abholung: ${sy ? `zuletzt aktualisiert ${fmtDate(sy.created.slice(0, 10))}, ${sy.created.slice(11, 16)} Uhr` : 'noch keine Daten empfangen'}.` : 'Automatische Abholung: aus. Einrichten unter Einstellungen → Garmin → Verbindungscode.'),
    st.settings.garminKeys ? h('button', { class: 'btn s', onclick: async () => { try { const r = await syncGarmin(st); app.save(); toast(r.status === 'neu' ? `Neue Garmin-Daten: ${r.days} Tage, ${r.acts} Aktivitäten.` : r.status === 'aktuell' ? 'Schon aktuell.' : 'Keine Daten gefunden.'); app.refresh(); } catch (e) { toast(e.message, 4000); } } }, 'Jetzt abholen') : null,
    h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer' } }, 'WIE KOMMEN DIE DATEN IN DIE APP?'),
      h('p', { class: 'small dim' }, 'Jeden Morgen holt eine geplante Aufgabe deinen Garmin-Morgenbericht und die Tageswerte ab und legt sie verschlüsselt neben die App (ECDH P-256 + AES-256). Nur dieses Handy hat den geheimen Schlüssel und kann sie lesen. Die App selbst braucht keinen Garmin-Zugang und keinen Server. Ohne Schlüssel: Datei-Import oder von Hand eintragen.')),
    h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '6px' } }, 'SO EXPORTIERST DU AUS GARMIN CONNECT'),
      h('ul', { class: 'plain small' },
        h('li', {}, 'Einzelaktivität: Garmin Connect im Browser → Aktivität → Zahnrad → „Original exportieren“ (FIT) oder „Exportieren nach GPX/TCX“.'),
        h('li', {}, 'Aktivitätenliste: Aktivitäten → „Alle Aktivitäten“ → „CSV exportieren“.'),
        h('li', {}, 'Tageswerte als Tabelle: CSV mit Spalten wie Datum, Ruhepuls, HRV, HRV 7 Tage, Schlaf, Schlafscore, Body Battery, Trainingsbereitschaft, Trainingszustand, VO2max, akute/chronische Belastung, Intensitätsminuten.'),
        h('li', {}, 'Alles: garmin.com → Konto → Datenverwaltung → „Daten exportieren“ (ZIP).')))));
}

// Schlafphasen der letzten Nächte als gestapelte Balken
function sleepPhases(rows) {
  const wrap = h('div', {}, h('div', { class: 'k' }, 'Schlafphasen (letzte Nächte)'));
  if (!rows.length) { wrap.append(h('div', { class: 'm', style: { padding: '14px 0' } }, 'Noch keine Daten.')); return wrap; }
  const max = Math.max(...rows.map((d) => (d.sleepDeep || 0) + (d.sleepLight || 0) + (d.sleepRem || 0) + (d.sleepAwake || 0)), 1);
  const C = { sleepDeep: ['Tief', '#4f5d2c'], sleepLight: ['Leicht', '#8a9a4a'], sleepRem: ['REM', '#c9b47e'], sleepAwake: ['Wach', '#6b3a2a'] };
  for (const d of rows) {
    wrap.append(h('div', { class: 'phase-row' }, h('span', { class: 'm' }, fmtDate(d.date).slice(0, 5)),
      h('div', { class: 'phase-bar' }, ...Object.entries(C).map(([k, [lbl, col]]) => (d[k] ? h('i', { title: `${lbl} ${f1(d[k])} h`, style: { width: (d[k] / max) * 100 + '%', background: col } }) : null))),
      h('span', { class: 'm' }, f1((d.sleepDeep || 0) + (d.sleepLight || 0) + (d.sleepRem || 0)) + ' h')));
  }
  wrap.append(h('div', { class: 'm' }, ...Object.values(C).map(([lbl, col]) => h('span', { style: { marginRight: '10px' } }, h('span', { style: { color: col } }, '■ '), lbl))));
  return wrap;
}

// ---------- Eingabe von Hand ----------
const STATUS_OPTS = [['', '—'], ...Object.entries(STATUS_LABEL)];
const HRV_OPTS = [['', '—'], ...Object.entries(HRV_LABEL)];
export function dailyModal(app, date = iso()) {
  const st = app.state;
  const cur = st.daily.find((d) => d.date === date) || {};
  modal(({ close }) => {
    const d = h('input', { type: 'date', value: date });
    const inputs = {};
    const mk = (m) => { const i = h('input', { inputmode: 'decimal', placeholder: m.hint, value: cur[m.k] != null ? String(cur[m.k]).replace('.', ',') : '' }); inputs[m.k] = i; return field(m.label + (m.unit ? ` (${m.unit})` : ''), i, micFor(i)); };
    const sel = (opts, v) => h('select', {}, ...opts.map(([k, l]) => h('option', { value: k, selected: k === (v || '') }, l)));
    const hrvS = sel(HRV_OPTS, cur.hrvStatus), statS = sel(STATUS_OPTS, cur.trainingStatus);
    const wkKey = isoWeekKey(date); const intens = h('input', { inputmode: 'numeric', placeholder: 'Minuten diese Woche', value: st.garminWeeks?.[wkKey]?.total ?? '' });
    return h('div', {}, h('div', { class: 'k' }, '[ GARMIN-WERTE ]'), h('h2', {}, 'Morgenbericht eintragen'), field('Datum', d),
      h('p', { class: 'small dim' }, 'Auf der Uhr nach dem Aufwachen: Morgenbericht. Leere Felder bleiben unverändert.'),
      ...MORGEN.map(mk), field('HRV-Status', hrvS),
      h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', margin: '10px 0' } }, 'WEITERE WERTE (BELASTUNG, SCHLAFPHASEN, VO2MAX …)'),
        ...WEITERE.map(mk), field('Trainingszustand', statS), field('Intensitätsminuten (Woche)', intens)),
      h('p', { class: 'm' }, 'Niedrige Trainingsbereitschaft, niedrige HRV, schlechter Schlaf oder „überlastet“ machen die heutige Einheit automatisch leichter.'),
      h('button', { class: 'btn f mt2', onclick: () => {
        const day = d.value || date;
        const row = { date: day };
        for (const m of [...MORGEN, ...WEITERE]) { const v = num(inputs[m.k].value); if (v != null) row[m.k] = v; }
        if (hrvS.value) row.hrvStatus = hrvS.value;
        if (statS.value) row.trainingStatus = statS.value;
        if (row.acuteLoad != null) row.load = row.acuteLoad;
        const im = num(intens.value);
        if (im != null) { const k = isoWeekKey(day); st.garminWeeks = { ...(st.garminWeeks || {}), [k]: { ...(st.garminWeeks?.[k] || { goal: 150, start: mondayOf(day) }), total: im } }; }
        if (Object.keys(row).length < 2 && im == null) return toast('Mindestens einen Wert eintragen.');
        if (MORGEN.some((m) => row[m.k] != null)) row.report = true;
        mergeDaily(st, [{ ...row, source: 'manuell' }]);
        const ev = giveBadge(st, 'garmin');
        app.save(); close(); toast('Gespeichert. Die heutige Einheit richtet sich danach.'); if (ev) celebrate([ev]); app.refresh();
      } }, '> Speichern'));
  }, { full: true });
}

const TYPES = [['lauf', 'Lauf', 'running'], ['marsch', 'Marsch', 'walking'], ['schwimmen', 'Schwimmen', 'lap_swimming'], ['kraft', 'Kraft', 'strength_training'], ['rad', 'Rad', 'cycling'], ['sonstiges', 'Sonstiges', 'other']];
function activityModal(app) {
  const st = app.state;
  modal(({ close }) => {
    let sport = 'lauf';
    const d = h('input', { type: 'date', value: iso() });
    const dist = h('input', { inputmode: 'decimal', placeholder: 'km (Schwimmen: m)' });
    const dur = h('input', { placeholder: 'mm:ss oder h:mm:ss' });
    const hr = h('input', { inputmode: 'numeric', placeholder: 'Ø HF' }), hrMax = h('input', { inputmode: 'numeric', placeholder: 'max. HF' });
    const kg = h('input', { inputmode: 'decimal', placeholder: 'nur bei Marsch' });
    const out = h('div', { class: 'm mt' });
    const upd = () => { const ds = num(dist.value), t = parseTime(dur.value); if (!ds || !t) { out.textContent = ''; return; } out.textContent = sport === 'schwimmen' ? `= ${fmtTime((t / ds) * 100)} /100 m` : `= Pace ${fmtPace(t / ds)}`; };
    dist.oninput = upd; dur.oninput = upd;
    return h('div', {}, h('div', { class: 'k' }, '[ GARMIN-AKTIVITÄT ]'), h('h2', {}, 'Aktivität eintragen'),
      seg(TYPES.map(([k, l]) => [k, l]), sport, (v) => { sport = v; upd(); }),
      field('Datum', d), field('Distanz (leer bei Kraft)', dist, micFor(dist)), field('Zeit', dur, micFor(dur)), out, h('div', { class: 'grid2' }, field('Ø Herzfrequenz', hr), field('Max. Herzfrequenz', hrMax)), field('Gepäck (kg)', kg),
      h('button', { class: 'btn f mt2', onclick: () => {
        const ds = num(dist.value), t = parseTime(dur.value);
        if (!t) return toast('Zeit eintragen.');
        if (['lauf', 'marsch', 'schwimmen'].includes(sport) && !ds) return toast('Distanz eintragen.');
        const date = d.value || iso(); const id = uid();
        const [, label, type] = TYPES.find((x) => x[0] === sport);
        const distM = ds ? (sport === 'schwimmen' ? ds : ds * 1000) : null;
        st.activities = st.activities || [];
        st.activities.unshift({ garminId: 'm' + id, date, time: '', type, typeLabel: label, sport: sportOf(type), durSec: t, distM, avgHR: num(hr.value), maxHR: num(hrMax.value), source: 'manuell' });
        const base = { id, garminId: 'm' + id, date, durSec: t, avgHR: num(hr.value), maxHR: num(hrMax.value), source: 'garmin' };
        if (sport === 'schwimmen') st.swims.push({ ...base, distM: ds, stroke: 'brust' });
        else if (sport === 'lauf' || sport === 'marsch') st.runs.push({ ...base, distM: ds * 1000, type: sport === 'marsch' ? 'marsch' : 'dauerlauf', typeLabel: sport === 'marsch' ? 'Marsch' : 'Lauf', kg: sport === 'marsch' ? num(kg.value) : null });
        close(); app.award(10, 'ausdauer', 'Aktivität gespeichert.'); app.refresh();
      } }, '> Speichern'));
  }, { full: true });
}
