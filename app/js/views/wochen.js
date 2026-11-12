// Wochen-Update: Auswertung der Woche und Anpassung der nächsten Woche.
import { h, card, modal, progressBar } from '../ui.js';
import { wochenAuswertung } from '../core/wochen.js';
import { iso, fmtDate, isoWeekKey, fmtNum } from '../core/util.js';
import { HRV_LABEL, STATUS_LABEL } from '../core/garmin-map.js';

const STUFE = { runter: ['▼ Intensität runter', 'warn'], halten: ['= Belastung halten', ''], hoch: ['▲ Leicht steigern', 'olive'] };

export function wochenCard(app, { kompakt = false } = {}) {
  const st = app.state; const today = iso();
  const adj = st.weekAdj?.[isoWeekKey(today)];
  const w = adj ? st.weekly?.[adj.von] : null;
  if (!w) {
    if (kompakt) return null;
    return card(h('div', { class: 'k' }, '[ WOCHEN-UPDATE ]'), h('p', { class: 'small dim' }, 'Jeden Montag wertet die App die vergangene Woche aus (Garmin, erledigte und ausgelassene Einheiten, Fortschritt, Schmerzen) und passt diese Woche an.'),
      h('button', { class: 'btn', onclick: () => detailModal(app, wochenAuswertung(st, today), true) }, 'Vorschau: laufende Woche'));
  }
  const [lbl, cls] = STUFE[w.stufe];
  return card(h('div', { class: 'k' }, `[ WOCHEN-UPDATE · KW ${w.key.split('-W')[1]} ]`),
    h('div', { class: 'row between' }, h('b', { class: cls }, lbl), h('span', { class: 'm' }, w.training.quote != null ? `${Math.round(w.training.quote * 100)} % ERLEDIGT` : '')),
    h('p', { class: 'small' }, w.text), kompakt ? null : h('ul', { class: 'plain small dim' }, w.gruende.map((g) => h('li', {}, g))),
    h('div', { class: 'row' }, h('button', { class: 'btn s', style: { margin: 0 }, onclick: () => detailModal(app, w) }, 'Details'), kompakt ? null : h('button', { class: 'btn s', style: { margin: 0 }, onclick: () => detailModal(app, wochenAuswertung(st, today), true) }, 'Vorschau laufende Woche')));
}

function detailModal(app, w, vorschau = false) {
  const g = w.garmin, t = w.training, f = w.fortschritt;
  const tile = (l, v, sub) => h('div', { class: 'tile' }, h('i', {}, l), h('b', { style: { fontSize: '18px' } }, v ?? '—'), sub ? h('span', { class: 'm' }, sub) : null);
  const [lbl, cls] = STUFE[w.stufe];
  modal(() => h('div', {}, h('div', { class: 'k' }, `[ ${vorschau ? 'VORSCHAU ' : ''}WOCHEN-UPDATE · ${fmtDate(w.mon)}–${fmtDate(w.sun)} ]`),
    card(h('div', { class: 'k' }, '[ GARMIN ]'), h('div', { class: 'grid3' },
      tile('HRV 7 T', g.hrv7 ? `${g.hrv7} ms` : null, g.hrvStatus ? HRV_LABEL[g.hrvStatus] : ''), tile('Bereitschaft', g.bereitschaft, 'Ø'), tile('Schlaf', g.schlaf ? `${fmtNum(g.schlaf, 1)} h` : null, g.schlafScore ? `SCORE Ø ${Math.round(g.schlafScore)}` : ''),
      tile('Ruhepuls', g.ruhepuls ? Math.round(g.ruhepuls) : null, 'Ø'), tile('Zustand', g.status ? STATUS_LABEL[g.status] : null), tile('Intensität', g.intensitaet, 'MIN')),
      h('p', { class: 'm' }, `${g.berichte} MORGENBERICHTE · BELASTUNG ${g.akut ?? '—'} / ${g.chronisch ?? '—'} · VO2MAX ${g.vo2max ? fmtNum(g.vo2max, 1) : '—'}`)),
    card(h('div', { class: 'k' }, '[ TRAINING ]'), h('div', { class: 'm' }, `${t.erledigt} VON ${t.geplant} EINHEITEN ERLEDIGT${t.ersatz ? ` · DAVON ${t.ersatz} ALS ERSATZ („KEINE ZEIT“)` : ''}`), progressBar(t.quote || 0),
      (w.ausgelassen || t.ausgelassen || []).length ? h('div', {}, h('div', { class: 'm mt' }, 'AUSGELASSEN'), h('ul', { class: 'plain small' }, (w.ausgelassen || t.ausgelassen).map((x) => h('li', {}, `${fmtDate(x.date)} · ${x.title}`)))) : h('p', { class: 'small olive' }, 'Nichts ausgelassen.')),
    card(h('div', { class: 'k' }, '[ FORTSCHRITT ]'), h('ul', { class: 'plain small' }, h('li', {}, `Laufen ${fmtNum(f.laufKm, 1)} km · Marsch ${fmtNum(f.marschKm, 1)} km · Schwimmen ${f.schwimmM} m · ${f.kraft} Kraft-Einträge`),
      h('li', {}, `Kopf: ${f.cat} CAT-Einheiten · ${f.psych} Psychologen-Einheiten`), f.tests.length ? h('li', {}, `Leistungstest: ${f.tests.map((x) => [x.pullups && x.pullups + ' Klimmzüge', x.run3000 && Math.floor(x.run3000 / 60) + ':' + String(x.run3000 % 60).padStart(2, '0') + ' (3000 m)'].filter(Boolean).join(', ')).join('; ')}`) : null)),
    w.schmerzen?.length ? card(h('div', { class: 'k' }, '[ SCHMERZEN ]'), h('ul', { class: 'plain small' }, w.schmerzen.map((p) => h('li', {}, `${fmtDate(p.date)} · ${p.label} · Stärke ${p.staerke} · ${p.art}${p.erledigt ? ' · abgeklungen' : ''}`)))) : null,
    card(h('div', { class: 'k' }, '[ ENTSCHEIDUNG FÜR DIE NÄCHSTE WOCHE ]'), h('b', { class: cls }, lbl), h('p', {}, w.text), h('ul', { class: 'plain small dim' }, w.gruende.map((x) => h('li', {}, x))),
      h('p', { class: 'small dim' }, 'Regeln (änderbar in app/js/data/requirements.js → WOCHEN_REGELN): niedrige HRV, Bereitschaft unter 40, „überlastet“, Belastungsquote über 1,5 oder starke Schmerzen → runter. Gute Werte und mindestens 85 % erledigt → +5 %. Feste Wochenregeln (z. B. Kickbox-Tage) gelten immer.'))));
}

export function wochenHistorie(app) {
  const st = app.state; const keys = Object.keys(st.weekly || {}).sort().reverse().slice(0, 12);
  if (!keys.length) return null;
  return h('details', { class: 'card' }, h('summary', { class: 'k', style: { cursor: 'pointer' } }, `[ FRÜHERE WOCHEN-UPDATES (${keys.length}) ]`),
    ...keys.map((k) => { const w = st.weekly[k]; return h('div', { class: 'row between mt', style: { cursor: 'pointer' }, onclick: () => detailModal(app, w) }, h('span', { class: 'small' }, `KW ${k.split('-W')[1]} · ${fmtDate(w.mon)}`), h('span', { class: 'm ' + STUFE[w.stufe][1] }, STUFE[w.stufe][0])); }));
}
