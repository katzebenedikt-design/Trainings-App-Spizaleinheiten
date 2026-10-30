// Bereich Sport: Startseite (Countdown + Tagesbefehl), Plan, Kraft, Ausdauer, Test, Daten, Timer.
import { h, card, iconBtn, modal, scale, field, micFor, ring, countUp, progressBar, toast, seg } from '../ui.js';
import { iso, addDays, daysBetween, fmtDateLong, fmtDate, fmtMonth, fmtTime, TAGE_LANG, mondayOf, isoWeekKey, num, weekday } from '../core/util.js';
import { plannedDay, weekPlan, phaseAt, NORMS, currentBest, normProgress } from '../core/plan.js';
import { readiness, applyReadiness, CHECK_ITEMS } from '../core/readiness.js';
import { rankFor, streak } from '../core/rewards.js';
import { exById, videoLink } from '../data/exercises.js';
import { figure, FIGS } from './figures.js';
import { renderKraft, logStrengthModal } from './kraft.js';
import { renderAusdauer, logRunModal, renderDaten } from './ausdauer.js';
import { renderTest } from './test.js';
import { renderTimer, openTimer } from './timer.js';
import { voiceCommand } from './voice.js';
import { nextLesson } from './sprache.js';

export const sportTabs = [
  { key: 'heute', label: 'Heute', render: renderHeute },
  { key: 'plan', label: 'Plan', render: renderPlan },
  { key: 'kraft', label: 'Kraft', render: renderKraft },
  { key: 'ausdauer', label: 'Ausdauer', render: renderAusdauer },
  { key: 'test', label: 'Test', render: renderTest },
  { key: 'daten', label: 'Daten', render: renderDaten },
  { key: 'timer', label: 'Timer', render: renderTimer },
];

const isDone = (state, date, id) => (state.done[date] || []).includes(id);
function markDone(state, date, id) { const l = state.done[date] || (state.done[date] = []); if (!l.includes(id)) l.push(id); }

export function todaySessions(state, date = iso()) {
  const day = plannedDay(state, date);
  const r = readiness(state, date);
  return { day, r, sessions: applyReadiness(day.sessions, r) };
}

function renderHeute(el, app) {
  const st = app.state; const today = iso();
  const { day, r, sessions } = todaySessions(st, today);
  const daysLeft = daysBetween(today, st.profile.targetDate);
  const rank = rankFor(st.rewards.points);
  const unit = st.profile.unit === 'offen' ? 'EINHEIT OFFEN' : st.profile.unit.toUpperCase();
  const anrede = st.profile.anrede === 'name' && st.profile.name ? st.profile.name : st.profile.anrede === 'rang' ? rank.name : '';

  el.append(h('div', { class: 'top mt' },
    h('div', {}, h('div', { class: 'm' }, `// ZIEL: AUSWAHLVERFAHREN ${fmtMonth(st.profile.targetDate).toUpperCase()} · ${unit}`),
      h('h1', { class: 'typein' }, r.mode === 'pause' ? 'Lage: Pause' : r.mode === 'leicht' ? 'Lage: Schonen' : r.mode === 'offen' ? (anrede ? anrede + ', melden!' : 'Lage: Melden') : 'Lage: Bereit')),
    h('div', { class: 'row' }, iconBtn('mic', () => voiceCommand(app), 'Werte per Sprache eintragen'), iconBtn('gear', () => app.settings(), 'Einstellungen'))));

  // Countdown + Bereitschaft
  const dnum = h('div', { class: 'big', style: { fontSize: '46px' } }, '0');
  countUp(dnum, Math.max(0, daysLeft));
  el.append(h('div', { class: 'row', style: { gap: '14px', marginTop: '6px' } },
    h('div', { onclick: () => openCheckin(app), style: { cursor: 'pointer' } }, ring(r.percent, r.mode === 'offen' ? 'CHECK-IN' : 'BEREIT')),
    h('div', {}, h('div', { class: 'm' }, 'NOCH'), dnum, h('div', { class: 'm' }, `TAGE · ${Math.max(0, Math.ceil(daysLeft / 7))} WOCHEN`),
      h('div', { class: 'm', style: { marginTop: '4px' } }, `PHASE ${day.phase.name.toUpperCase()} · WO ${day.weekTotal}`),
      h('div', { class: 'm' }, day.deload ? 'ENTLASTUNGSWOCHE + TEST' : `ZYKLUS ${day.cycleWeek}/4`, ' · ', h('span', { class: 'sand', style: { cursor: 'pointer', textDecoration: 'underline' }, onclick: () => toggleWeek(app, today) }, day.mode === 'schule' ? 'BERUFSSCHULE' : 'ARBEITSWOCHE')))));

  // Schonmodus-Hinweise
  if (r.mode === 'leicht' || r.mode === 'pause') {
    el.append(h('div', { class: 'card ' + (r.mode === 'pause' ? 'badc' : 'warnc') }, h('div', { class: 'k' }, `[ SCHONMODUS: ${r.mode === 'pause' ? 'PAUSE' : 'LEICHT'} ]`),
      h('ul', { class: 'plain' }, r.reasons.map((x) => h('li', {}, x))),
      r.doctor ? h('p', { class: 'warn' }, 'Die App stellt keine Diagnose. Bei Schmerzen bitte Arzt oder Ärztin fragen.') : null));
  }
  if (r.moodHelp) {
    el.append(h('div', { class: 'card warnc' }, h('div', { class: 'k' }, '[ WICHTIGER ALS TRAINING ]'),
      h('p', {}, 'Deine Stimmung ist seit Tagen sehr schlecht. Sprich mit einer Vertrauensperson, deinem Hausarzt oder rufe die Telefonseelsorge an (kostenlos, rund um die Uhr):'),
      h('a', { class: 'btn', href: 'tel:08001110111' }, 'Telefonseelsorge 0800 111 0 111')));
  }

  // Tagesbefehl
  const items = [];
  items.push({ id: 'checkin', t: 'Morgen-Check-in', sub: isDone(st, today, 'checkin') ? `BEREITSCHAFT ${r.percent}%` : '30 SEKUNDEN', act: () => openCheckin(app) });
  sessions.forEach((s, i) => items.push({ id: 'train:' + i, t: s.title, sub: `${s.sub}${s.min ? ' · ca. ' + s.min + ' min' : ''}`.toUpperCase(), act: () => openSession(app, s, today, i), rest: s.rest }));
  const nl = nextLesson(st);
  if (nl) items.push({ id: 'sprache', t: `Englisch · ${nl.title}`, sub: '5–10 MIN · LAUT SPRECHEN', act: () => app.go('#/sprache') });
  items.push({ id: 'mental', t: weekday(today) === 6 ? 'Mein Warum lesen + überarbeiten' : 'Box-Atmung oder Abendtext', sub: 'ABENDS · 5 MIN', act: () => app.go(weekday(today) === 6 ? '#/mental/warum' : '#/mental') });
  const lb = st.settings.lastBackup;
  if (!lb || daysBetween(lb.slice(0, 10), today) > 14) items.push({ id: 'backup', t: 'Daten sichern', sub: lb ? 'LETZTE SICHERUNG ' + fmtDate(lb.slice(0, 10)) : 'NOCH NIE GESICHERT', act: () => app.settings() });

  const done = (it) => it.rest ? true : isDone(st, today, it.id);
  const firstOpen = items.find((it) => !done(it));
  const tl = h('div', { class: 'tl' }, items.map((it) => h('div', { class: 'it ' + (done(it) ? 'done' : it === firstOpen ? 'now' : ''), onclick: it.act },
    h('div', { class: 't' }, it.t), h('small', {}, it.sub))));
  el.append(card(h('div', { class: 'k' }, `[ TAGESBEFEHL · ${fmtDateLong(today).toUpperCase()} ]`), tl,
    firstOpen ? h('button', { class: 'btn f', onclick: firstOpen.act }, '> Nächster Punkt') : h('div', { class: 'center sand mt' }, 'TAGESBEFEHL ERFÜLLT.')));

  // Kennzahlen
  const pts = h('b', {}, '0'); countUp(pts, st.rewards.points);
  el.append(h('div', { class: 'grid3 mt', onclick: () => openProfile(app), style: { cursor: 'pointer' } },
    h('div', { class: 'tile' }, h('i', {}, 'Serie'), h('b', {}, String(streak(st)).padStart(3, '0'))),
    h('div', { class: 'tile' }, h('i', {}, 'Punkte'), pts),
    h('div', { class: 'tile' }, h('i', {}, 'Rang'), h('b', { style: { fontSize: '17px', paddingTop: '6px' } }, rank.name.toUpperCase()))));

  // Abstand zur Top-Norm
  const best = currentBest(st);
  const norms = ['run3000', 'pullups', 'pushups', 'situps', 'swim100'];
  el.append(card(h('div', { class: 'k' }, '[ ABSTAND ZUR TOP-NORM ]'),
    ...norms.map((k) => {
      const n = NORMS[k], v = best[k]; const f = (x) => (n.unit === 'zeit' ? fmtTime(x) : x);
      return h('div', {}, h('div', { class: 'm' }, `${n.label.toUpperCase()}  ${v != null ? f(v) : '—'} → ${f(n.top)}`), progressBar(normProgress(k, v) || 0, normProgress(k, n.goal)));
    }),
    h('div', { class: 'm' }, 'Strich = Richtwert aus den Handbüchern. Aktuelle offizielle Normen bei Bundeswehr/Bundespolizei prüfen.')));
}

function toggleWeek(app, date) {
  const st = app.state; const key = isoWeekKey(date);
  const cur = st.week.overrides[key] || st.week.mode;
  st.week.overrides[key] = cur === 'schule' ? 'arbeit' : 'schule';
  app.save(); toast(st.week.overrides[key] === 'schule' ? 'Diese Woche: Berufsschule' : 'Diese Woche: Arbeitswoche'); app.refresh();
}

export function openCheckin(app, date = iso()) {
  const st = app.state;
  const prev = st.checkins.find((c) => c.date === date);
  const v = prev ? { ...prev } : { date, schlaf: 0, energie: 0, kater: 0, schmerz: 0, stimmung: 0, ruhepuls: null, ort: '' };
  modal(({ close }) => {
    const hr = h('input', { type: 'number', inputmode: 'numeric', placeholder: 'z. B. 54', value: v.ruhepuls || '' });
    const ort = h('input', { type: 'text', placeholder: 'z. B. linkes Knie', value: v.ort || '' });
    const ortWrap = field('Wo tut es weh?', ort); if (!(v.schmerz >= 3)) ortWrap.classList.add('hidden');
    return h('div', {}, h('div', { class: 'k' }, '[ MORGEN-CHECK-IN ]'), h('h2', {}, fmtDateLong(date)),
      ...CHECK_ITEMS.map((it) => h('div', { class: 'mt' }, h('div', { class: 'row between' }, h('b', {}, it.label), h('span', { class: 'm' }, `1 = ${it.lo} · 5 = ${it.hi}`)),
        scale(v[it.key] || 0, (x) => { v[it.key] = x; if (it.key === 'schmerz') ortWrap.classList.toggle('hidden', x < 3); }))),
      ortWrap,
      field('Ruhepuls (optional, morgens im Liegen)', hr, micFor(hr)),
      h('button', { class: 'btn f mt2', onclick: () => {
        if (CHECK_ITEMS.some((it) => !v[it.key])) { toast('Bitte alle 5 Werte antippen.'); return; }
        v.ruhepuls = num(hr.value); v.ort = ort.value.trim();
        const i = st.checkins.findIndex((c) => c.date === date);
        if (i >= 0) st.checkins[i] = v; else st.checkins.push(v);
        close();
        if (!isDone(st, date, 'checkin')) app.award(10, 'checkin', 'Check-in gespeichert.'); else { app.save(); toast('Check-in aktualisiert.'); }
        app.refresh();
      } }, '> Speichern'));
  });
}

export function openSession(app, s, date, idx) {
  const st = app.state;
  modal(({ close }) => {
    const wrap = h('div', {}, h('div', { class: 'k' }, `[ ${s.code} · ${fmtDate(date)} ]`), h('h1', {}, s.title), h('div', { class: 'm' }, s.sub + (s.min ? ` · ca. ${s.min} min` : '')));
    for (const b of s.blocks) {
      const c = card(h('div', { class: 'k' }, `[ ${b.title.toUpperCase()} ]`));
      if (b.lines) c.append(h('ul', { class: 'plain' }, b.lines.map((l) => h('li', {}, l))));
      if (b.ex) for (const e of b.ex) {
        const ex = exById(e.id, st.customExercises);
        if (!ex) continue;
        c.append(h('div', { class: 'row between mt', style: { borderTop: '1px solid var(--line2)', paddingTop: '8px' } },
          h('div', { class: 'grow' }, h('b', {}, ex.name), h('div', { class: 'm' }, `${e.sets} × ${e.reps} · Pause ${e.rest} s`)),
          h('button', { class: 'btn s', onclick: () => showExercise(ex) }, 'Ablauf'),
          h('button', { class: 'btn s', onclick: () => logStrengthModal(app, ex, { date, range: e.reps, sets: e.sets, rest: e.rest }) }, 'Eintragen')));
      }
      if (b.timer) c.append(h('button', { class: 'btn o', onclick: () => openTimer(app, b.timer) }, '> Intervall-Timer starten'));
      wrap.append(c);
    }
    if (s.run || s.ruck || s.swim) wrap.append(h('button', { class: 'btn', onclick: () => logRunModal(app, s.swim ? 'schwimmen' : s.ruck ? 'marsch' : 'lauf', date) }, s.swim ? 'Schwimmen eintragen' : s.ruck ? 'Marsch eintragen' : 'Lauf eintragen'));
    if (s.test) wrap.append(h('button', { class: 'btn', onclick: () => { close(); app.go('#/sport/test'); } }, 'Testergebnisse eintragen'));
    const id = 'train:' + idx;
    if (!s.rest) wrap.append(isDone(st, date, id) ? h('div', { class: 'center olive mt2' }, '✓ ABGESCHLOSSEN')
      : h('button', { class: 'btn f mt2', onclick: () => { markDone(st, date, id); close(); app.award(s.schon ? 25 : 40, 'train'); app.refresh(); } }, '> Einheit abgeschlossen'));
    return wrap;
  }, { full: true });
}

export function showExercise(ex) {
  modal(() => h('div', {}, h('div', { class: 'k' }, '[ AUSFÜHRUNG ]'), h('h2', {}, ex.name),
    FIGS[ex.fig] ? figure(ex.fig) : h('div', { class: 'm' }, 'Keine Animation für diese Übung.'),
    h('p', {}, ex.cue || ''),
    h('a', { class: 'btn', href: videoLink(ex.name), target: '_blank', rel: 'noopener' }, 'Videos ansehen (YouTube)'),
    h('p', { class: 'm' }, 'Hinweis: Videos stammen von Dritten. Im Zweifel einen Trainer im Studio fragen.')));
}

function renderPlan(el, app) {
  const st = app.state; const today = iso();
  let ref = el.dataset.ref || today;
  const { phase, phases, weekTotal } = phaseAt(st, ref);
  el.append(h('div', { class: 'k mt' }, '[ PHASENPLAN BIS ZUM AUSWAHLVERFAHREN ]'));
  const pc = card();
  for (const p of phases) {
    const cur = p.key === phaseAt(st, today).phase.key;
    pc.append(h('div', { style: { padding: '8px 0', borderBottom: '1px solid var(--line2)' } },
      h('div', { class: 'row between' }, h('b', { class: cur ? 'sand' : '' }, (cur ? '▶ ' : '') + p.name + ` (LG ${p.lg})`), h('span', { class: 'm' }, `${fmtDate(p.from)}–${fmtDate(p.to)} · ${p.weeks} WO`)),
      cur ? h('div', {}, h('p', { class: 'dim small' }, p.desc), h('div', { class: 'm' }, 'ZIELE: ' + p.ziele.join(' · '))) : null));
  }
  pc.append(h('p', { class: 'm' }, 'Rückwärts vom Termin geplant. Jede 4. Woche Entlastung mit Monatstest. Zieldatum unter Einstellungen.'));
  el.append(pc);

  // Arbeits-/Berufsschulwoche
  const key = isoWeekKey(ref);
  const mode = st.week.overrides[key] || st.week.mode;
  el.append(h('div', { class: 'k mt2' }, '[ WOCHENPLAN ]'),
    h('div', { class: 'row between mt' }, iconBtn('back', () => { el.dataset.ref = addDays(mondayOf(ref), -7); el.replaceChildren(); renderPlan(el, app); }, 'Vorige Woche'),
      h('div', { class: 'center' }, h('b', {}, `KW ${key.split('-W')[1]} · Woche ${weekTotal}`), h('div', { class: 'm' }, `${fmtDate(mondayOf(ref))} – ${fmtDate(addDays(mondayOf(ref), 6))}`)),
      h('button', { class: 'icon-btn', style: { transform: 'scaleX(-1)' }, onclick: () => { el.dataset.ref = addDays(mondayOf(ref), 7); el.replaceChildren(); renderPlan(el, app); } }, iconBtnIcon())),
    seg([['arbeit', 'Arbeitswoche'], ['schule', 'Berufsschulwoche']], mode, (m) => { st.week.overrides[key] = m; app.save(); el.replaceChildren(); renderPlan(el, app); }));
  const week = weekPlan(st, ref);
  const wc = card();
  week.forEach((d) => {
    const isToday = d.date === today;
    const r = d.date === today ? readiness(st, today) : null;
    const sess = r ? applyReadiness(d.sessions, r) : d.sessions;
    wc.append(h('div', { style: { padding: '8px 0', borderBottom: '1px solid var(--line2)' } },
      h('div', { class: 'm ' + (isToday ? 'sand' : '') }, `${TAGE_LANG[weekday(d.date)].toUpperCase()} ${fmtDate(d.date)}${isToday ? ' · HEUTE' : ''}${(st.done[d.date] || []).includes('train') ? ' · ✓' : ''}`),
      ...sess.map((s, i) => h('div', { style: { cursor: 'pointer' }, onclick: () => openSession(app, s, d.date, i) }, h('b', {}, s.title), h('span', { class: 'm' }, ' ' + s.sub)))));
  });
  el.append(wc);
  el.append(h('div', { class: 'row mt' }, h('span', { class: 'm' }, 'Standard für neue Wochen:'), seg([['arbeit', 'Arbeit'], ['schule', 'Schule']], st.week.mode, (m) => { st.week.mode = m; app.save(); el.replaceChildren(); renderPlan(el, app); })));

  // Anpassung
  const pl = st.plan;
  el.append(card(h('div', { class: 'k' }, '[ AUTOMATISCHE ANPASSUNG ]'),
    h('div', { class: 'grid3 mt' }, h('div', { class: 'tile' }, h('i', {}, 'Umfang'), h('b', {}, Math.round(pl.volFactor * 100) + '%')), h('div', { class: 'tile' }, h('i', {}, 'Leistungsgr.'), h('b', {}, pl.group)), h('div', { class: 'tile' }, h('i', {}, 'Fokus'), h('b', { style: { fontSize: '15px' } }, pl.focus.length ? pl.focus.map((k) => NORMS[k].label).join(', ') : '—'))),
    pl.notes.length ? h('ul', { class: 'plain' }, pl.notes.map((n) => h('li', { class: 'small' }, n))) : h('p', { class: 'm' }, 'Nach jedem Monatstest passt sich der Plan an: Umfang, Fokus-Disziplin, Leistungsgruppe.')));
  el.append(card(h('div', { class: 'k' }, '[ ABKÜRZUNGEN (KSK-HANDBUCH) ]'), h('div', { class: 'small dim' },
    'TB1 Grundlage · TB2 Tempo · TB3 Schwelle · TB4 anaerob · TB-R Regeneration · K1 Kraftausdauer · K2 Muskelaufbau · K4 Maximalkraft · MT1–3 Marsch leicht–schwer · ST Schwimmen · KT Koordination · CAL Liegestütz/Sit-up/Klimmzug')));
}
const iconBtnIcon = () => { const b = iconBtn('back', null); return b.firstChild; };

export function openProfile(app) {
  import('./profile.js').then((m) => m.openProfile(app));
}
