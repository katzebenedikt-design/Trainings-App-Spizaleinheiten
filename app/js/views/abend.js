// Abend-Check-in: 1 Minute. Gefühltes (Belastung, Müdigkeit, Stimmung) vom Nutzer, Gemessenes von der Garmin-Uhr.
import { h, card, modal, scale, field, toast } from '../ui.js';
import { abendGarmin, abendHinweis } from '../core/garmin-checkin.js';
import { fmtDateLong, fmtDate, fmtNum, addDays, iso } from '../core/util.js';

const FRAGEN = [
  { key: 'belastung', label: 'Wie anstrengend war der Tag?', lo: 'locker', hi: 'sehr hart', hinweis: 'Arbeit, Schule und Training zusammen' },
  { key: 'muede', label: 'Wie müde bist du?', lo: 'wach', hi: 'platt' },
  { key: 'stimmung', label: 'Stimmung', lo: 'mies', hi: 'top' },
];

const isDone = (st, date) => (st.done[date] || []).includes('abend');

export function abendItem(st, date) {
  const e = (st.abend || []).find((x) => x.date === date);
  return { id: 'abend', t: 'Abend-Check-in', sub: e ? `BELASTUNG ${e.belastung}/5 · MÜDE ${e.muede}/5` : 'ABENDS · 1 MINUTE · GARMIN-WERTE KOMMEN DAZU' };
}

// Gemessene Tageswerte als Kacheln
export function garminTag(w, { leer = 'Noch keine Garmin-Werte für diesen Tag. Sie kommen mit dem nächsten Garmin-Update (spätestens am nächsten Morgen).' } = {}) {
  const t = (l, v, sub) => h('div', { class: 'tile' }, h('i', {}, l), h('b', { style: { fontSize: '18px' } }, v), sub ? h('span', { class: 'm' }, sub) : null);
  const tiles = [
    w.steps != null && t('Schritte', fmtNum(w.steps, 0), w.distKm != null ? fmtNum(w.distKm) + ' KM' : ''),
    w.stress != null && t('Stress Ø', String(w.stress), w.stressMax != null ? 'MAX ' + w.stressMax : ''),
    (w.bbLow != null || w.bbHigh != null) && (w.bbLow != null && w.bbHigh != null ? t('Body Battery', `${w.bbHigh} → ${w.bbLow}`, 'HÖCHST → TIEFST') : t('Body Battery', String(w.bbHigh ?? w.bbLow), w.bbHigh != null ? 'HÖCHST' : 'TIEFST')),
    w.kcalActive != null && t('Aktiv-kcal', fmtNum(w.kcalActive, 0), w.kcal != null ? 'GESAMT ' + fmtNum(w.kcal, 0) : ''),
    w.intensMin != null && t('Intensität', String(w.intensMin), 'MIN (STARK ×2)'),
    w.trainMin != null && t('Training', w.trainMin + ' min', w.trainings.join(', ').toUpperCase()),
  ].filter(Boolean);
  return tiles.length ? h('div', { class: 'grid3 mt' }, ...tiles) : h('p', { class: 'small dim' }, leer);
}

export function openAbend(app, date = iso()) {
  const st = app.state; st.abend = st.abend || [];
  const prev = st.abend.find((x) => x.date === date);
  const v = prev ? { ...prev } : { date, belastung: 0, muede: 0, stimmung: 0, bett: '', note: '' };
  modal(({ close }) => {
    const w = abendGarmin(st, date);
    const bett = h('input', { type: 'time', value: v.bett || '' });
    const note = h('input', { type: 'text', placeholder: 'Was lief gut? Was morgen besser?', value: v.note || '' });
    const gestern = addDays(date, -1), wg = abendGarmin(st, gestern), eg = st.abend.find((x) => x.date === gestern);
    return h('div', {}, h('div', { class: 'k' }, '[ ABEND-CHECK-IN ]'), h('h2', {}, fmtDateLong(date)),
      card(h('div', { class: 'k' }, '[ ⌚ HEUTE VON DER GARMIN-UHR ]'), garminTag(w, { leer: 'Noch keine Garmin-Werte für heute. Sie kommen mit dem nächsten Garmin-Update und werden hier automatisch ergänzt.' })),
      ...FRAGEN.map((f) => h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('b', {}, f.label), h('span', { class: 'm' }, `1 = ${f.lo} · 5 = ${f.hi}`)),
        f.hinweis ? h('div', { class: 'm' }, f.hinweis.toUpperCase()) : null, scale(v[f.key] || 0, (x) => { v[f.key] = x; }))),
      field('Ins Bett um (geplant)', bett), field('Notiz (optional)', note),
      h('button', { class: 'btn f mt2', onclick: () => {
        if (FRAGEN.some((f) => !v[f.key])) return toast('Bitte alle 3 Werte antippen.');
        v.bett = bett.value; v.note = note.value.trim(); v.ts = new Date().toISOString().slice(11, 16);
        const i = st.abend.findIndex((x) => x.date === date);
        if (i >= 0) st.abend[i] = v; else st.abend.push(v);
        if (st.abend.length > 400) st.abend.shift();
        close();
        const hw = abendHinweis(v, w);
        if (!isDone(st, date)) app.award(5, 'abend', hw[0] || 'Abend-Check-in gespeichert. Gute Nacht.'); else { app.save(); toast(hw[0] || 'Abend-Check-in aktualisiert.'); }
        app.refresh();
      } }, '> Speichern'),
      // Gestern: jetzt mit vollständigen Garmin-Werten (kommen mit dem Morgen-Update)
      (eg || Object.keys(wg).length) ? h('details', { class: 'card mt' }, h('summary', { class: 'k', style: { cursor: 'pointer' } }, `[ GESTERN · ${fmtDate(gestern)} ]`),
        eg ? h('p', { class: 'small' }, `Belastung ${eg.belastung}/5 · Müde ${eg.muede}/5 · Stimmung ${eg.stimmung}/5${eg.note ? ' · „' + eg.note + '“' : ''}`) : null, garminTag(wg)) : null);
  }, { full: true });
}
