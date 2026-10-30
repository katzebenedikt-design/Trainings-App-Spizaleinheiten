// Rang, Punkte, Abzeichen.
import { h, card, modal, badgeSVG, chevronSVG, progressBar } from '../ui.js';
import { BADGES, RANKS, rankFor, streak } from '../core/rewards.js';
import { fmtDate } from '../core/util.js';

export function openProfile(app) {
  const st = app.state;
  const r = rankFor(st.rewards.points);
  modal(() => h('div', {}, h('div', { class: 'k' }, '[ DIENSTGRAD ]'),
    h('div', { class: 'center' }, chevronSVG(r.chevrons), h('h1', {}, r.name), h('div', { class: 'm' }, `${st.rewards.points} PUNKTE · SERIE ${streak(st)} TAGE`)),
    r.next ? h('div', { class: 'mt' }, h('div', { class: 'm' }, `NÄCHSTER RANG: ${r.next.toUpperCase()} BEI ${r.to} P`), progressBar((st.rewards.points - r.from) / (r.to - r.from))) : h('p', { class: 'center sand' }, 'Höchster Rang erreicht.'),
    card(h('div', { class: 'k' }, `[ ABZEICHEN ${Object.keys(st.rewards.badges).length}/${Object.keys(BADGES).length} ]`),
      h('div', { class: 'badges' }, Object.entries(BADGES).map(([id, b]) => h('div', { class: 'b ' + (st.rewards.badges[id] ? '' : 'off') }, badgeSVG(id, 70), h('div', {}, b.name), st.rewards.badges[id] ? h('div', { class: 'olive' }, fmtDate(st.rewards.badges[id])) : h('div', {}, b.desc))))),
    card(h('div', { class: 'k' }, '[ PUNKTE ]'), h('p', { class: 'small dim' }, 'Check-in 10 · Einheit 40 (Schonmodus 25) · Kraft-Eintrag 5 (Bestwert 15) · Lauf/Schwimmen 10 · Marsch 15 · Test 100 · Lektion 15–30 · Spiel 5–15 · Atmung 10 · Kurs 30'),
      h('div', { class: 'm' }, 'RÄNGE: ' + RANKS.map((x) => `${x[1]} ${x[0]}`).join(' · ')))), { full: true });
}
