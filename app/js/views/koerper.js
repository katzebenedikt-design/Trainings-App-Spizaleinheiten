// Interaktives Körperbild: Stelle antippen, Stärke und Art wählen. Der Plan passt sich an (core/schmerz.js).
import { h, card, modal, seg, scale, toast, s } from '../ui.js';
import { KOERPER, REGIONEN, ARTEN, WARNUNG } from '../data/koerper.js';
import { aktiveSchmerzen, warnzeichen, painLabel } from '../core/schmerz.js';
import { plannedDay } from '../core/planner.js';
import { iso, fmtDate, daysBetween } from '../core/util.js';
import { uid } from '../core/store.js';

// Silhouette (gleiche Maße wie die Klickbereiche, 200 × 440)
function silhouette() {
  const st = { fill: 'none', stroke: 'var(--line)', 'stroke-width': 2 };
  return [
    s('circle', { cx: 100, cy: 40, r: 22, ...st }),
    s('path', { d: 'M86 62h28v10H86z', ...st }),
    s('path', { d: 'M62 82 Q100 70 138 82 L132 196 Q100 204 68 196 Z', ...st }),
    s('path', { d: 'M60 86 L40 160 L34 222 M140 86 L160 160 L166 222', ...st, 'stroke-width': 14, 'stroke-linecap': 'round', stroke: '#1f2318' }),
    s('path', { d: 'M84 196 L80 300 L82 404 M116 196 L120 300 L118 404', ...st, 'stroke-width': 24, 'stroke-linecap': 'round', stroke: '#1f2318' }),
  ];
}
const shapeOf = (r, attrs) => (r.shape.e ? s('ellipse', { cx: r.shape.e[0], cy: r.shape.e[1], rx: r.shape.e[2], ry: r.shape.e[3], ...attrs }) : s('rect', { x: r.shape.r[0], y: r.shape.r[1], width: r.shape.r[2], height: r.shape.r[3], rx: 6, ...attrs }));

export function koerperBild(ansicht, aktiv, onPick, selected) {
  const svg = s('svg', { viewBox: '0 0 200 440', class: 'koerper', role: 'img', 'aria-label': 'Körperbild ' + ansicht });
  svg.append(...silhouette());
  for (const r of KOERPER[ansicht]) {
    const on = aktiv.some((p) => p.typ === r.typ && (p.seite || null) === (r.seite || null));
    const el = shapeOf(r, { class: 'reg' + (on ? ' on' : '') + (selected === r.id ? ' sel' : ''), 'data-id': r.id });
    el.addEventListener('click', () => onPick(r));
    el.append(s('title', {}, REGIONEN[r.typ].name + (r.seite === 'l' ? ' links' : r.seite === 'r' ? ' rechts' : '')));
    svg.append(el);
  }
  svg.append(s('text', { x: 100, y: 436, 'text-anchor': 'middle', class: 'koerper-t' }, ansicht === 'vorne' ? 'VORNE · rechts = dein rechts' : 'HINTEN'));
  return svg;
}

export function schmerzModal(app, vorauswahl = null) {
  const st = app.state; st.pain = st.pain || [];
  let ansicht = vorauswahl?.ansicht || 'vorne', region = null, staerke = vorauswahl?.staerke || 0, art = vorauswahl?.art || null;
  const m = modal(({ close }) => {
    const bildBox = h('div', { class: 'center' });
    const auswahl = h('div', { class: 'm center' }, 'STELLE ANTIPPEN');
    const form = h('div', { class: 'hidden' });
    const drawBild = () => bildBox.replaceChildren(koerperBild(ansicht, aktiveSchmerzen(st, iso()), (r) => { region = r; auswahl.textContent = (REGIONEN[r.typ].name + (r.seite === 'l' ? ' links' : r.seite === 'r' ? ' rechts' : '')).toUpperCase(); form.classList.remove('hidden'); drawBild(); }, region?.id));
    drawBild();
    const schwellung = h('input', { type: 'checkbox' }), taubheit = h('input', { type: 'checkbox' });
    const note = h('input', { placeholder: 'Notiz (optional), z. B. „seit dem Marsch“' });
    form.append(h('div', { class: 'm mt' }, 'STÄRKE (1 = KAUM, 10 = UNERTRÄGLICH)'), scale(staerke, (v) => { staerke = v; }, 10),
      h('div', { class: 'm mt' }, 'ART'), seg(ARTEN.map((a) => [a, a[0].toUpperCase() + a.slice(1)]), art, (v) => { art = v; }),
      h('label', { class: 'small', style: { display: 'block', marginTop: '10px' } }, schwellung, ' Schwellung'),
      h('label', { class: 'small', style: { display: 'block', marginTop: '6px' } }, taubheit, ' Taubheit oder Kribbeln'), note,
      h('button', { class: 'btn f mt', onclick: () => {
        if (!region) return toast('Erst die Stelle antippen.');
        if (!staerke || !art) return toast('Stärke und Art wählen.');
        const p = { id: uid(), date: iso(), ts: new Date().toISOString().slice(11, 19), typ: region.typ, seite: region.seite, staerke, art, schwellung: schwellung.checked, taubheit: taubheit.checked, note: note.value.trim(), erledigt: false };
        p.label = painLabel(p);
        st.pain.push(p); if (st.pain.length > 300) st.pain.shift();
        app.save();
        ergebnis(app, p, close);
      } }, 'Speichern'));
    return h('div', {}, h('div', { class: 'k' }, '[ SCHMERZEN MELDEN ]'), h('p', { class: 'small dim' }, 'Tippe die Stelle an. Die App nimmt belastende Übungen vorübergehend heraus und schiebt sanfte Übungen ein. Keine Diagnose.'),
      seg([['vorne', 'Vorne'], ['hinten', 'Hinten']], ansicht, (v) => { ansicht = v; region = null; form.classList.add('hidden'); auswahl.textContent = 'STELLE ANTIPPEN'; drawBild(); }), bildBox, auswahl, form);
  }, { full: true });
  m.onClose(() => app.refresh());
}

function ergebnis(app, p, close) {
  const st = app.state; const d = iso();
  const w = warnzeichen(st, p, d);
  const day = plannedDay(st, d, { withReadiness: false });
  modal(({ close: c2 }) => h('div', {}, h('div', { class: 'k' }, `[ ${p.label.toUpperCase()} · ${p.staerke}/10 · ${p.art.toUpperCase()} ]`),
    w.length ? h('div', { class: 'card badc' }, h('h2', { class: 'bad' }, 'Nicht weitertrainieren'), h('p', {}, WARNUNG.text), h('p', { class: 'small' }, 'Erkannt: ' + w.join(', ')))
      : card(h('div', { class: 'k' }, '[ PLAN ANGEPASST ]'), h('ul', { class: 'plain small' }, (day.pain?.notes?.length ? day.pain.notes : ['Heute keine belastenden Übungen für diese Stelle geplant.']).map((x) => h('li', {}, x))),
        h('div', { class: 'm mt' }, 'EINGESCHOBEN'), h('ul', { class: 'plain small' }, ...(['mobil', 'dehnen', 'kraeftigen'].flatMap((k) => REGIONEN[p.typ].reha[k]).map((x) => h('li', {}, x)))),
        h('p', { class: 'small dim' }, 'Nur schmerzfrei üben. ' + WARNUNG.text)),
    h('button', { class: 'btn f', onclick: () => { c2(); close(); } }, 'OK')));
}

// Karte auf der Startseite: aktive Schmerzen, Warnhinweis, abgeklungen markieren
export function schmerzCard(app) {
  const st = app.state; const d = iso();
  const aktiv = aktiveSchmerzen(st, d);
  if (!aktiv.length) return h('button', { class: 'btn s', style: { width: 'auto' }, onclick: () => schmerzModal(app) }, '+ Schmerzen melden (Körperbild)');
  const warn = aktiv.filter((p) => warnzeichen(st, p, d).length);
  return h('div', { class: 'card ' + (warn.length ? 'badc' : 'warnc') }, h('div', { class: 'k' }, '[ SCHMERZEN ]'),
    warn.length ? h('p', { class: 'small bad' }, WARNUNG.text) : h('p', { class: 'small dim' }, 'Belastende Übungen sind vorübergehend raus, ein Reha-Block ist eingeschoben.'),
    ...aktiv.map((p) => h('div', { class: 'row between mt' }, h('div', {}, h('b', {}, p.label), h('div', { class: 'm' }, `${p.staerke}/10 · ${p.art.toUpperCase()} · SEIT ${fmtDate(p.date)}${daysBetween(p.date, d) ? ` (${daysBetween(p.date, d)} T)` : ''}`)),
      h('button', { class: 'btn s', style: { width: 'auto', margin: 0 }, onclick: () => { p.erledigt = true; p.erledigtAm = d; app.save(); toast('Als abgeklungen markiert. Der Plan läuft wieder normal.'); app.refresh(); } }, 'Abgeklungen'))),
    h('button', { class: 'btn s', onclick: () => schmerzModal(app) }, 'Aktualisieren / neue Stelle'));
}
