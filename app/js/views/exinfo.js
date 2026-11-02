// Erklärung, Quellen und PDF-Seiten einer Übung. Seitenbilder lassen sich antippen und zoomen.
import { h, card, modal } from '../ui.js';

export function exerciseInfo(ex) {
  const wrap = h('div', {});
  if (!ex.warum) {
    wrap.append(card(h('div', { class: 'k' }, '[ EIGENE ÜBUNG ]'), h('p', { class: 'small dim' }, 'Für eigene Übungen gibt es keine Erklärung und keine Quelle aus den PDFs.')));
    return wrap;
  }
  wrap.append(
    card(h('div', { class: 'k' }, '[ WARUM IST DIE ÜBUNG DRIN? ]'), h('p', {}, ex.warum)),
    card(h('div', { class: 'k' }, '[ WOFÜR IST SIE GUT? ]'), h('p', {}, ex.wofuer)),
    card(h('div', { class: 'k' }, '[ PRAXISBEISPIELE ]'), h('ul', { class: 'plain' }, ex.praxisbeispiele.map((p) => h('li', {}, p)))));
  const qc = card(h('div', { class: 'k' }, `[ QUELLE${ex.quellen.length > 1 ? 'N · ' + ex.quellen.length + ' FUNDSTELLEN' : ''} ]`));
  ex.quellen.forEach((q, i) => {
    qc.append(h('div', { class: 'quelle' + (i === 0 ? ' haupt' : '') },
      h('div', { class: 'm' }, i === 0 ? 'HAUPTQUELLE' : q.verwandt ? 'VERWANDTE FUNDSTELLE' : 'WEITERE FUNDSTELLE'),
      h('b', {}, `${q.kurz} · ${q.seitenText}`),
      h('div', { class: 'm', style: { wordBreak: 'break-all' } }, q.datei),
      h('p', { class: 'small' }, q.begruendung),
      h('button', { class: 'pdfseite', 'aria-label': `${q.kurz} ${q.seitenText} groß anzeigen`, onclick: () => zoomPage(q) },
        h('img', { src: q.bild, alt: `${q.titel}, ${q.seitenText}`, loading: 'lazy', onerror: (e) => { e.currentTarget.replaceWith(h('span', { class: 'm' }, 'Seite nicht geladen – einmal online öffnen.')); } }),
        h('span', { class: 'm' }, '🔍 ANTIPPEN ZUM VERGRÖSSERN'))));
  });
  wrap.append(qc);
  return wrap;
}

// Vollbild mit Zoom: Plus/Minus, Doppeltipp und Zwei-Finger-Zoom (scrollbar)
export function zoomPage(q) {
  let z = 1;
  modal(() => {
    const img = h('img', { src: q.bild, alt: `${q.titel}, ${q.seitenText}`, style: { width: '100%', display: 'block' } });
    const box = h('div', { class: 'zoombox' }, img);
    const set = (v) => { z = Math.max(1, Math.min(4, v)); img.style.width = z * 100 + '%'; label.textContent = Math.round(z * 100) + ' %'; };
    const label = h('span', { class: 'm' }, '100 %');
    img.addEventListener('dblclick', () => set(z > 1 ? 1 : 2.5));
    let d0 = null, z0 = 1;
    box.addEventListener('touchstart', (e) => { if (e.touches.length === 2) { d0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); z0 = z; } }, { passive: true });
    box.addEventListener('touchmove', (e) => { if (e.touches.length === 2 && d0) { e.preventDefault(); set(z0 * Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) / d0); } }, { passive: false });
    box.addEventListener('touchend', () => { d0 = null; });
    return h('div', {}, h('div', { class: 'k' }, `[ ${q.kurz.toUpperCase()} · ${q.seitenText.toUpperCase()} ]`), h('div', { class: 'm' }, q.datei),
      h('div', { class: 'row mt' }, h('button', { class: 'btn s', onclick: () => set(z - 0.5) }, '−'), label, h('button', { class: 'btn s', onclick: () => set(z + 0.5) }, '+'), h('span', { class: 'm' }, 'Doppeltipp = Zoom')),
      box);
  }, { full: true });
}
