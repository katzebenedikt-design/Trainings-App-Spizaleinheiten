// Bereich „Nach dem AV“: Phase für Ausbildung & Spezialisierung, Wissenskurse mit Quiz und Abschlussprüfung.
import { h, card, modal, seg, field, toast, progressBar, celebrate, confirmBox } from '../ui.js';
import { AV_COURSES, QUELLEN, lessonId } from '../data/nachav.js';
import { avVisual } from './avvisuals.js';
import { giveBadge } from '../core/rewards.js';
import { speak, stopSpeaking } from '../core/speech.js';
import { iso, fmtDate, shuffle, addDays } from '../core/util.js';
import { weekPlan } from '../core/planner.js';
import { PHASE_INFO, nachAvStart } from '../core/plan.js';
import { whyCard, openSession } from './sport.js';

export const nachavTabs = [
  { key: 'phase', label: 'Phase', render: renderPhase },
  { key: 'kurse', label: 'Wissen', render: renderKurse },
  { key: 'spez', label: 'Spezialisierung', render: renderSpez },
];

const avState = (st) => st.av || (st.av = { lessons: {}, exams: {} });

function renderPhase(el, app) {
  const st = app.state; const p = st.profile; const av = p.av || (p.av = { bestanden: null, ausbildungStart: null, spez: 'beide' });
  el.append(h('div', { class: 'k mt' }, '[ NACH DEM AUSWAHLVERFAHREN ]'),
    h('p', { class: 'small dim' }, 'Ziel: Ausbildung und Spezialisierung (Waffenspezialist / Breacher) auf Top-Niveau – für KSK, Kampfschwimmer, EGB und GSG 9. Nach dem Schalter läuft der Plan automatisch in dieser Phase weiter, mit Check-in, Schonmodus und Schwächen-Anpassung wie bisher.'));
  if (!av.bestanden) {
    const d = h('input', { type: 'date', value: iso() });
    const a = h('input', { type: 'date' });
    el.append(card(h('div', { class: 'k' }, '[ AV BESTANDEN? ]'), h('p', {}, 'Erst nach dem Bestehen umschalten. Bis dahin läuft der normale Plan. Kurse und Spezialisierung kannst du schon jetzt nutzen.'),
      field('Bestanden am', d), field('Ausbildungsbeginn (optional)', a),
      h('button', { class: 'btn f', onclick: async () => {
        if (!(await confirmBox('Glückwunsch! Plan ab diesem Datum auf „Nach dem AV“ umstellen? (2 Wochen Erholung, dann neue Phase)', 'Umstellen'))) return;
        av.bestanden = d.value || iso(); av.ausbildungStart = a.value || null;
        const ev = giveBadge(st, 'av_bestanden'); app.save(); if (ev) celebrate([ev]); app.refresh();
      } }, '> AV bestanden – Phase starten')));
  } else {
    el.append(card(h('div', { class: 'k' }, '[ STATUS ]'), h('p', {}, `Bestanden am ${fmtDate(av.bestanden)}. Erholung bis ${fmtDate(addDays(nachAvStart(av.bestanden), -1))}, danach Phase „Nach dem AV“${av.ausbildungStart ? ' bis Ausbildungsbeginn ' + fmtDate(av.ausbildungStart) : ''}.`),
      h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Schalter zurücksetzen? Der Plan läuft dann wieder bis zum AV-Termin.', 'Zurücksetzen')) { av.bestanden = null; app.save(); app.refresh(); } } }, 'Schalter zurücksetzen')));
  }
  el.append(h('div', { class: 'm mt' }, 'SPEZIALISIERUNG'), seg([['breacher', 'Breacher'], ['waffen', 'Waffenspezialist'], ['beide', 'Beides']], av.spez || 'beide', (v) => { av.spez = v; app.save(); toast('Spezialisierungsblock angepasst.'); app.refresh(); }));

  for (const key of ['erholung', 'nachav']) {
    const ph = PHASE_INFO[key];
    el.append(card(h('div', { class: 'k' }, `[ ${ph.name.toUpperCase()} ]`), h('p', { class: 'small' }, ph.desc), h('div', { class: 'm' }, 'ZIELE: ' + ph.ziele.join(' · '))));
  }
  // Vorschau einer typischen Woche der Phase (oder die echte, wenn aktiv)
  const ref = av.bestanden ? (iso() < nachAvStart(av.bestanden) ? nachAvStart(av.bestanden) : iso()) : null;
  if (ref) {
    const week = weekPlan(st, ref);
    const wc = card(h('div', { class: 'k' }, `[ WOCHE AB ${fmtDate(week[0].date)} ]`));
    for (const d of week) wc.append(h('div', { style: { padding: '6px 0', borderBottom: '1px solid var(--line2)' } }, h('div', { class: 'm' }, ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'][week.indexOf(d)] + ' ' + fmtDate(d.date)),
      ...d.sessions.map((s, i) => h('div', { style: { cursor: 'pointer' }, onclick: () => openSession(app, s, d.date, i) }, h('b', {}, s.title), h('span', { class: 'm' }, ' ' + s.sub)))));
    el.append(wc, whyCard(week[0]));
  } else {
    el.append(card(h('div', { class: 'k' }, '[ SO SIEHT EINE WOCHE AUS ]'), h('ul', { class: 'plain small' },
      h('li', {}, 'Mo: Maximalkraft Unterkörper + schweres Tragen, danach lockerer Lauf'),
      h('li', {}, 'Di: Prophylaxe + Spezialisierungsblock (leicht) + Kickboxen'),
      h('li', {}, 'Mi: Schwimmen (eigener Tag)'),
      h('li', {}, 'Do: Maximalkraft Oberkörper & Griff (moderat) + Kickboxen'),
      h('li', {}, 'Fr: Ruhetag · Heimfahrt'),
      h('li', {}, 'Sa: Schwerer Marsch (ab 20 kg, max. +2 kg pro Woche bis 35 kg)'),
      h('li', {}, 'So: Langer lockerer Lauf + Kopftraining'),
      h('li', {}, 'Jede 4. Woche: Entlastung mit Monatstest'))));
  }
}

function renderKurse(el, app) {
  const st = app.state; const A = avState(st);
  const passed = AV_COURSES.filter((c) => A.exams[c.id]?.passed).length;
  el.append(h('div', { class: 'k mt' }, '[ WISSENSKURSE ]'), h('p', { class: 'small dim' }, 'Grundlagen aus offiziellen und öffentlich zugänglichen Quellen. Sicherheit steht in jeder Lektion zuerst. Kein Ersatz für Ausbildung und Vorschriften.'),
    h('div', { class: 'm' }, `${passed}/${AV_COURSES.length} ABSCHLUSSPRÜFUNGEN BESTANDEN`), progressBar(passed / AV_COURSES.length));
  for (const c of AV_COURSES) {
    const done = c.lessons.filter((_, i) => A.lessons[lessonId(c, i)]?.passed).length;
    const ex = A.exams[c.id];
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => openCourse(app, c) },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, c.title), h('div', { class: 'm' }, `${done}/${c.lessons.length} LEKTIONEN · PRÜFUNG ${ex?.passed ? '✓ ' + ex.best + '%' : ex ? ex.best + '%' : 'OFFEN'}`)), h('span', { class: 'mono ' + (ex?.passed ? 'olive' : 'dim') }, ex?.passed ? '✓' : '›'))));
  }
}

function openCourse(app, c) {
  const st = app.state; const A = avState(st);
  const m = modal(({ close }) => {
    const body = h('div', {});
    const list = () => {
      body.replaceChildren(h('div', { class: 'k' }, '[ LEKTIONEN ]'));
      c.lessons.forEach((l, i) => {
        const r = A.lessons[lessonId(c, i)];
        body.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => lesson(i) }, h('div', { class: 'row between' }, h('b', {}, `${i + 1}. ${l.title}`), h('span', { class: 'mono ' + (r?.passed ? 'olive' : 'dim') }, r ? `${r.best}%` : '—'))));
      });
      const allDone = c.lessons.every((_, i) => A.lessons[lessonId(c, i)]?.passed);
      body.append(h('button', { class: 'btn f', disabled: !allDone, onclick: () => exam() }, allDone ? '> Abschlussprüfung' : 'Abschlussprüfung nach allen Lektionen'));
      body.append(card(h('div', { class: 'k' }, '[ QUELLEN ]'), ...c.links.map((k) => h('a', { class: 'btn', href: QUELLEN[k][1], target: '_blank', rel: 'noopener' }, QUELLEN[k][0]))));
    };
    const lesson = (i) => {
      const l = c.lessons[i]; let ci = 0;
      const show = () => {
        body.replaceChildren(h('div', { class: 'm' }, `LEKTION ${i + 1}/${c.lessons.length} · KARTE ${ci + 1}/${l.cards.length}`), progressBar((ci + 1) / l.cards.length), h('h2', {}, l.title));
        if (l.visual && ci === Math.min(1, l.cards.length - 1)) body.append(avVisual(l.visual));
        const first = ci === 0;
        body.append(h('div', { class: 'card ' + (first ? 'warnc' : '') }, first ? h('div', { class: 'k' }, '[ SICHERHEIT ZUERST ]') : null, h('p', { style: { fontSize: '19px' } }, l.cards[ci])),
          h('button', { class: 'btn s', onclick: () => speak(l.cards[ci]) }, '🔊 Vorlesen'),
          h('button', { class: 'btn f', onclick: () => { stopSpeaking(); if (ci < l.cards.length - 1) { ci++; show(); } else quiz(l.quiz, (pct) => { const id = lessonId(c, i); const prev = A.lessons[id]; const pass = pct >= 67; A.lessons[id] = { best: Math.max(pct, prev?.best || 0), passed: pass || !!prev?.passed, date: iso() }; if (pass && !prev?.passed) app.award(10, 'kurse', 'Lektion bestanden.'); else app.save(); }, () => list()); } }, ci < l.cards.length - 1 ? 'Weiter' : '> Quiz zur Lektion'),
          ci > 0 ? h('button', { class: 'btn', onclick: () => { ci--; show(); } }, 'Zurück') : h('button', { class: 'btn', onclick: list }, 'Zur Übersicht'));
      };
      show();
    };
    const quiz = (questions, onDone, after, isExam = false) => {
      const qs = shuffle(questions); let qi = 0, ok = 0;
      const ask = () => {
        if (qi >= qs.length) {
          const pct = Math.round((ok / qs.length) * 100); onDone(pct);
          const pass = pct >= (isExam ? 80 : 67);
          body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, pass ? '[ BESTANDEN ]' : '[ NICHT BESTANDEN ]'), h('div', { class: 'big' }, pct + '%'), h('p', {}, pass ? 'Sauber.' : isExam ? 'Ab 80 % bestanden. Lektionen wiederholen.' : 'Ab 2 von 3 richtig bestanden. Karten nochmal lesen.')), h('button', { class: 'btn f', onclick: after }, 'Weiter'));
          return;
        }
        const q = qs[qi]; let answered = false;
        const order = shuffle(q.a.map((a, i) => i));
        const btns = order.map((i) => h('button', { style: { fontSize: '17px', fontFamily: 'var(--head)', textAlign: 'left' }, onclick: (ev) => {
          if (answered) return; answered = true;
          const good = i === q.ok; if (good) ok++;
          ev.currentTarget.classList.add(good ? 'ok' : 'no'); btns[order.indexOf(q.ok)].classList.add('ok');
          body.append(card(h('b', { class: good ? 'olive' : 'warn' }, good ? 'Richtig. ' : 'Falsch. '), q.why), h('button', { class: 'btn f', onclick: () => { qi++; ask(); } }, 'Weiter'));
        } }, q.a[i]));
        body.replaceChildren(h('div', { class: 'm' }, `${isExam ? 'ABSCHLUSSPRÜFUNG' : 'QUIZ'} · FRAGE ${qi + 1}/${qs.length}`), progressBar(qi / qs.length), h('h2', {}, q.q), h('div', { class: 'choice', style: { gridTemplateColumns: '1fr' } }, ...btns));
      };
      ask();
    };
    const exam = () => {
      const pool = [...c.lessons.flatMap((l) => l.quiz), ...c.exam];
      quiz(pool, (pct) => {
        const prev = A.exams[c.id]; const pass = pct >= 80;
        A.exams[c.id] = { best: Math.max(pct, prev?.best || 0), passed: pass || !!prev?.passed, date: iso() };
        const ev = [];
        if (pass && !prev?.passed) {
          const b = giveBadge(st, c.badge); if (b) ev.push(b);
          if (AV_COURSES.every((x) => A.exams[x.id]?.passed)) { const b2 = giveBadge(st, 'av_alle'); if (b2) ev.push(b2); }
          app.award(50, 'kurse', `Abschlussprüfung bestanden: ${c.title}`);
        } else app.save();
        celebrate(ev);
      }, list, true);
    };
    list();
    return h('div', {}, h('div', { class: 'k' }, `[ ${c.title.toUpperCase()} ]`), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

function renderSpez(el, app) {
  const sp = app.state.profile.av?.spez || 'beide';
  el.append(h('div', { class: 'k mt' }, '[ ANFORDERUNGSPROFIL ]'),
    h('p', { class: 'small dim' }, 'Ehrlich: Genaue Inhalte der Spezialisierungen sind nicht öffentlich und unterscheiden sich je Einheit. Hier steht, was sich aus öffentlich bekannten Aufgaben körperlich und geistig ableiten lässt.'));
  const prof = {
    breacher: ['Kraft: schweres Werkzeug tragen und führen, oft nach Laufen oder Treppen.', 'Griff und Unterarm: Ramme, Hebelwerkzeug, Seil.', 'Rumpf und Schultern: Schlag- und Rotationskraft ohne Verletzung.', 'Kopf: unter Zeitdruck sicher arbeiten, klare Kommunikation im Team.', 'Training: Maximalkraft-Montag, Spezialisierungsblock dienstags, Griff donnerstags, schwerer Marsch samstags.'],
    waffen: ['Präzision unter Belastung: Puls und Atmung schnell beruhigen.', 'Stabile Positionen über lange Zeit: Hüft- und Brustwirbelsäulen-Beweglichkeit, Rumpf.', 'Griff- und Unterarmausdauer.', 'Kopf: Ruhe, Sorgfalt, Verantwortung für Material und Ausbildung anderer.', 'Training: Spezialisierungsblock dienstags, Box-Atmung, Kopftraining sonntags, Kurse „Optik“ und „Schießgrundlagen“.'],
  };
  for (const k of sp === 'beide' ? ['breacher', 'waffen'] : [sp]) el.append(card(h('div', { class: 'k' }, `[ ${k === 'breacher' ? 'BREACHER' : 'WAFFENSPEZIALIST'} ]`), h('ul', { class: 'plain small' }, prof[k].map((x) => h('li', {}, x)))));
  el.append(card(h('div', { class: 'k' }, '[ FÜR ALLE EINHEITEN ]'), h('ul', { class: 'plain small' },
    h('li', {}, 'KSK, EGB: viel Tragen, Marsch, Schießen, Nahkampf.'),
    h('li', {}, 'Kampfschwimmer: Wasser hat Vorrang – wenn möglich mehr als einen Schwimmtag eintragen (Plan → Verfügbar).'),
    h('li', {}, 'GSG 9: urbanes Umfeld, Zugang, Präzision, Teamarbeit auf engem Raum.'),
    h('li', {}, 'Für alle: Gesund bleiben ist die Grundlage für die Top 0,1 %.'))),
    h('button', { class: 'btn', onclick: () => app.go('#/nachav/kurse') }, 'Zu den Wissenskursen'));
}
