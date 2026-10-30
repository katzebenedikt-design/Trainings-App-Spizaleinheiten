// Bereich Grundlagenkurse: kurze Lektionen mit Quiz.
import { h, s, card, modal, progressBar, celebrate } from '../ui.js';
import { COURSES } from '../data/courses.js';
import { speak, stopSpeaking } from '../core/speech.js';
import { giveBadge } from '../core/rewards.js';
import { iso, shuffle } from '../core/util.js';

export const kurseTabs = [{ key: 'alle', label: 'Kurse', render: renderKurse }];

function renderKurse(el, app) {
  const st = app.state;
  const passed = COURSES.filter((c) => st.courses[c.id]?.passed).length;
  el.append(h('div', { class: 'k mt' }, '[ GRUNDLAGENKURSE ]'), h('p', { class: 'small dim' }, 'Kurze Lektionen mit Quiz, orientiert an der Grundausbildung. Vorwissen fürs Auswahlverfahren – kein Ersatz für echte Ausbildung.'),
    h('div', { class: 'm' }, `${passed}/${COURSES.length} BESTANDEN`), progressBar(passed / COURSES.length));
  for (const c of COURSES) {
    const r = st.courses[c.id];
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => openCourse(app, c) },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, c.title), h('div', { class: 'm' }, `${c.lessons.length} LEKTIONEN · ${c.quiz.length} FRAGEN`)),
        h('span', { class: 'mono ' + (r?.passed ? 'olive' : 'dim') }, r?.passed ? `✓ ${r.best}%` : r ? `${r.best}%` : '—'))));
  }
}

function openCourse(app, c) {
  let li = 0, ci = 0;
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      const les = c.lessons[li];
      body.replaceChildren(h('div', { class: 'm' }, `LEKTION ${li + 1}/${c.lessons.length}`), progressBar((li + ci / les.cards.length) / c.lessons.length), h('h2', {}, les.title));
      if (les.visual && ci === 0) body.append(visual(les.visual));
      body.append(card(h('p', { style: { fontSize: '20px' } }, les.cards[ci])),
        h('div', { class: 'row mt' }, h('button', { class: 'btn s', onclick: () => speak(les.cards[ci]) }, '🔊 Vorlesen'), h('span', { class: 'm' }, `${ci + 1}/${les.cards.length}`)));
      const last = li === c.lessons.length - 1 && ci === les.cards.length - 1;
      body.append(h('button', { class: 'btn f', onclick: () => { stopSpeaking(); if (last) quiz(); else { ci++; if (ci >= les.cards.length) { ci = 0; li++; } show(); } } }, last ? '> Zum Quiz' : 'Weiter'));
      if (li > 0 || ci > 0) body.append(h('button', { class: 'btn', onclick: () => { if (ci > 0) ci--; else { li--; ci = c.lessons[li].cards.length - 1; } show(); } }, 'Zurück'));
      if (last && c.links) body.append(card(h('div', { class: 'k' }, '[ OFFIZIELLE VIDEOS ]'), ...c.links.map(([t, u]) => h('a', { class: 'btn', href: u, target: '_blank', rel: 'noopener' }, t))));
    };
    const quiz = () => {
      const qs = shuffle(c.quiz); let qi = 0, ok = 0;
      const ask = () => {
        if (qi >= qs.length) return result(Math.round((ok / qs.length) * 100));
        const q = qs[qi]; let answered = false;
        const btns = q.a.map((a, i) => h('button', { style: { fontSize: '17px', fontFamily: 'var(--head)', textAlign: 'left' }, onclick: (ev) => {
          if (answered) return; answered = true;
          const good = i === q.ok; if (good) ok++;
          ev.currentTarget.classList.add(good ? 'ok' : 'no'); btns[q.ok].classList.add('ok');
          body.append(card(h('b', { class: good ? 'olive' : 'warn' }, good ? 'Richtig. ' : 'Falsch. '), q.why), h('button', { class: 'btn f', onclick: () => { qi++; ask(); } }, 'Weiter'));
        } }, a));
        body.replaceChildren(h('div', { class: 'm' }, `QUIZ · FRAGE ${qi + 1}/${qs.length}`), progressBar(qi / qs.length), h('h2', {}, q.q), h('div', { class: 'choice', style: { gridTemplateColumns: '1fr' } }, ...btns));
      };
      ask();
    };
    const result = (pct) => {
      const st = app.state; const prev = st.courses[c.id];
      const passed = pct >= 80;
      st.courses[c.id] = { best: Math.max(pct, prev?.best || 0), passed: passed || !!prev?.passed, date: iso() };
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, passed ? '[ BESTANDEN ]' : '[ NICHT BESTANDEN ]'), h('div', { class: 'big' }, pct + '%'), h('p', {}, passed ? 'Sauber.' : 'Ab 80 % bestanden. Lektion nochmal lesen und wiederholen.')),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'), passed ? null : h('button', { class: 'btn', onclick: () => { li = 0; ci = 0; show(); } }, 'Lektion wiederholen'));
      const ev = [];
      if (passed && !prev?.passed) {
        const b1 = giveBadge(st, 'kurs1'); if (b1) ev.push(b1);
        if (COURSES.every((x) => st.courses[x.id]?.passed)) { const b2 = giveBadge(st, 'alle_kurse'); if (b2) ev.push(b2); }
        app.award(30, 'kurse', `Kurs bestanden: ${c.title}`);
      } else app.award(5, 'kurse', false);
      celebrate(ev);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ ${c.title.toUpperCase()} ]`), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Visualisierungen ----------
function visual(kind) {
  if (kind === 'kompass') return kompassSVG();
  if (kind === 'waffe') return waffeSVG();
  if (kind === 'nato') return natoGrid();
  return null;
}

function kompassSVG() {
  const needle = s('g', { style: 'transform-origin:150px 120px;animation:swing 4s ease-in-out infinite' },
    s('path', { d: 'M150 55 L160 120 L150 185 L140 120Z', fill: '#e8dcb8' }), s('path', { d: 'M150 55 L160 120 L140 120Z', fill: '#c4613f' }));
  const ticks = [];
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const r1 = i % 8 ? 74 : 68; ticks.push(s('line', { x1: 150 + Math.sin(a) * r1, y1: 120 - Math.cos(a) * r1, x2: 150 + Math.sin(a) * 80, y2: 120 - Math.cos(a) * 80, stroke: '#a7ab90', 'stroke-width': i % 8 ? 1 : 2 })); }
  const svg = s('svg', { viewBox: '0 0 300 260', class: 'fig' },
    s('style', {}, '@keyframes swing{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(10deg)}}'),
    s('rect', { x: 60, y: 20, width: 180, height: 220, fill: '#1b1e14', stroke: '#7f8a5a' }),
    s('line', { x1: 60, y1: 230, x2: 240, y2: 230, stroke: '#c9b47e', 'stroke-dasharray': '2 4' }),
    s('circle', { cx: 150, cy: 120, r: 82, fill: '#0d0f0a', stroke: '#c9b47e', 'stroke-width': 2 }), ...ticks,
    s('text', { x: 150, y: 34, 'text-anchor': 'middle', fill: '#c9b47e', style: 'font:12px var(--mono)' }, 'N · 6400'), needle,
    s('circle', { cx: 150, cy: 120, r: 5, fill: '#c9b47e' }),
    s('text', { x: 246, y: 120, fill: '#8a9a4a', style: 'font:10px var(--mono)' }, 'Teilring'),
    s('text', { x: 64, y: 252, fill: '#8a9a4a', style: 'font:10px var(--mono)' }, 'Anlegekante mit Maßstab'));
  return h('div', { class: 'card' }, svg, h('div', { class: 'm center' }, 'MAGNETNADEL PENDELT SICH AUF NORD EIN'));
}

const PARTS = [
  ['lauf', 'Lauf', 'M20 96 H150 V104 H20Z'], ['muendung', 'Mündung', 'M8 94 H22 V106 H8Z'],
  ['handschutz', 'Handschutz', 'M60 92 H150 V118 H60Z'], ['verschluss', 'Verschluss / Patronenlager', 'M150 88 H205 V108 H150Z'],
  ['visier', 'Visier / Optik', 'M160 70 H215 V86 H160Z'], ['magazin', 'Magazin', 'M178 108 H200 L206 156 H184Z'],
  ['abzug', 'Abzug & Sicherung', 'M212 108 H226 V126 H212Z'], ['griff', 'Griffstück', 'M226 108 H244 L238 150 H222Z'],
  ['schaft', 'Schaft', 'M244 88 H312 V128 L244 118Z'],
];

function waffeSVG() {
  const parts = PARTS.map(([id, , d]) => s('path', { class: 'part', d, 'data-id': id }));
  const label = s('text', { x: 160, y: 182, 'text-anchor': 'middle' }, 'SCHEMATISCHE DARSTELLUNG');
  const svg = s('svg', { viewBox: '0 0 320 200', class: 'fig waffe' }, ...parts, label);
  let timer = null;
  const tour = () => {
    clearInterval(timer); let i = 0;
    const step = () => {
      parts.forEach((p) => p.classList.remove('hl'));
      if (i >= PARTS.length) { clearInterval(timer); label.textContent = 'RUNDGANG BEENDET'; return; }
      parts[i].classList.add('hl'); label.textContent = PARTS[i][1].toUpperCase(); speak(PARTS[i][1]); i++;
    };
    step(); timer = setInterval(step, 2200);
  };
  const bolt = () => {
    clearInterval(timer); parts.forEach((p) => p.classList.remove('hl'));
    const v = parts[3]; v.classList.add('hl'); label.textContent = 'VERSCHLUSS: ZURÜCK – HÜLSE RAUS – VOR – NEUE PATRONE';
    v.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(38px)' }, { transform: 'translateX(0)' }], { duration: 1600, iterations: 3, easing: 'ease-in-out' });
  };
  parts.forEach((p, i) => p.addEventListener('click', () => { parts.forEach((x) => x.classList.remove('hl')); p.classList.add('hl'); label.textContent = PARTS[i][1].toUpperCase(); }));
  return h('div', { class: 'card' }, svg, h('div', { class: 'row' }, h('button', { class: 'btn s', onclick: tour }, '▶ Rundgang'), h('button', { class: 'btn s', onclick: bolt }, '▶ Funktionsprinzip')), h('div', { class: 'm' }, 'Teile antippen zum Benennen. Nur Prinzip, keine Bedienanleitung.'));
}

const NATO = ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'];
function natoGrid() {
  return h('div', { class: 'card' }, h('div', { class: 'grid3' }, ...NATO.map((w) => h('button', { class: 'tile', style: { cursor: 'pointer', textAlign: 'left' }, onclick: () => speak(w, { lang: 'en-US', rate: 0.85 }) }, h('b', {}, w[0]), h('i', {}, w)))));
}
