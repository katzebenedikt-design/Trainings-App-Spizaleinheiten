// UI-Bausteine: Elemente, Symbole, Modal, Toast, Belohnungen, Diagramme.
import { fmtDate, fmtTime } from './core/util.js';
import { BADGES } from './core/rewards.js';
import { listen, sttAvailable, vibrate, beep } from './core/speech.js';

export function h(tag, attrs = {}, ...kids) {
  const el = tag === 'frag' ? document.createDocumentFragment() : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) { if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v); }
  for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

export const ICONS = {
  sport: 'M13 4a2 2 0 1 0 0 .1M9 21l3-6 3 3v3M7 12l3-4 4 1 2 4 3 1',
  mental: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M12 1v3M12 20v3M1 12h3M20 12h3',
  sprache: 'M4 18V8M8 18V4M12 18v-6M16 18V7M20 18v-9M2 21h20',
  kurse: 'M3 6h18v12H3zM3 10h18M7 14h5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3M5 11a7 7 0 0 0 14 0M12 18v3',
  play: 'M7 4l13 8-13 8z', stop: 'M6 6h12v12H6z', back: 'M15 5l-7 7 7 7', gear: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  plus: 'M12 5v14M5 12h14', x: 'M6 6l12 12M18 6L6 18', check: 'M5 12l5 5 9-10', speaker: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12',
  timer: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9 1h6', upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', trash: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',
};

export const icon = (name) => s('svg', { viewBox: '0 0 24 24' }, s('path', { d: ICONS[name] }));
export const iconBtn = (name, onclick, title = '') => h('button', { class: 'icon-btn', onclick, title, 'aria-label': title }, icon(name));

export function card(...kids) { return h('div', { class: 'card' }, ...kids); }

export function toast(msg, ms = 2200) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

// Fensterstapel: neueste Fenster liegen oben; die Android-Zurück-Taste schließt das oberste Fenster.
const stack = [];
let skipPops = 0, backDone = Promise.resolve();
window.addEventListener('popstate', () => {
  if (skipPops) { skipPops--; return; }
  const top = stack[stack.length - 1];
  if (top) top.close(true);
});
export const afterModalBack = () => backDone;
export const modalOpen = () => stack.length > 0;

export function modal(build, { full = false } = {}) {
  let onClose = null, closed = false;
  const close = (fromPop = false) => {
    if (closed) return; closed = true;
    wrap.remove(); stack.splice(stack.indexOf(api), 1);
    if (fromPop !== true) {
      skipPops++;
      backDone = new Promise((res) => { const f = () => { window.removeEventListener('popstate', f); res(); }; window.addEventListener('popstate', f); setTimeout(f, 300); });
      history.back();
    }
    onClose?.();
  };
  const body = h('div', { class: full ? 'inner' : '' });
  const wrap = full ? h('div', { class: 'full' }, body) : h('div', { class: 'modal-bg', onclick: (e) => { if (e.target === wrap) close(); } }, h('div', { class: 'modal' }, body));
  wrap.style.zIndex = String(50 + stack.length * 2);
  body.append(h('div', { class: 'close' }, iconBtn('x', () => close(), 'Schließen')));
  const api = { close, body, onClose: (fn) => { onClose = fn; } };
  stack.push(api);
  history.pushState({ modal: stack.length }, '');
  const content = build(api);
  if (content) body.append(content);
  document.body.append(wrap);
  return api;
}

export function confirmBox(text, okLabel = 'Ja') {
  return new Promise((res) => {
    const m = modal(({ close }) => h('div', {}, h('h2', {}, 'Bestätigen'), h('p', {}, text),
      h('button', { class: 'btn f', onclick: () => { res(true); close(); } }, okLabel),
      h('button', { class: 'btn', onclick: () => { res(false); close(); } }, 'Abbrechen')));
    m.onClose(() => res(false));
  });
}

// Skala 1–5 als Knopfreihe
export function scale(value, onChange, n = 5) {
  const wrap = h('div', { class: 'scale' });
  const render = () => { wrap.replaceChildren(...Array.from({ length: n }, (_, i) => h('button', { class: value === i + 1 ? 'on' : '', type: 'button', onclick: () => { value = i + 1; render(); onChange(value); } }, i + 1))); };
  render();
  return wrap;
}

export function seg(options, value, onChange) {
  const wrap = h('div', { class: 'seg', role: 'tablist' });
  const render = () => wrap.replaceChildren(...options.map(([k, label]) => h('button', { class: k === value ? 'on' : '', role: 'tab', onclick: () => { value = k; render(); onChange(k); } }, label)));
  render();
  return wrap;
}

export function field(label, input, extra) {
  return h('label', { class: 'f' }, h('span', {}, label), extra ? h('div', { class: 'row' }, h('div', { class: 'grow' }, input), extra) : input);
}

// Mikrofon-Knopf, der eine Zahl/Zeit in ein Feld einträgt
export function micFor(input, { lang = 'de-DE', transform } = {}) {
  if (!sttAvailable()) return null;
  const b = iconBtn('mic', async () => {
    b.classList.add('on');
    try {
      const alts = await listen({ lang });
      const txt = alts[0] || '';
      input.value = transform ? transform(txt) : spokenToValue(txt);
      input.dispatchEvent(new Event('input'));
    } catch (e) { toast(e.message); }
    b.classList.remove('on');
  }, 'Spracheingabe');
  return b;
}

import { normalizeSpoken } from './core/voiceparse.js';
export function spokenToValue(txt) {
  const t = normalizeSpoken(txt);
  const mm = t.match(/(\d+)\s*minuten?\s*(\d+)?/);
  if (mm) return mm[2] ? `${mm[1]}:${String(mm[2]).padStart(2, '0')}` : `${mm[1]}:00`;
  const n = t.match(/\d+(?:\.\d+)?/);
  return n ? n[0].replace('.', ',') : txt;
}

// ---------- Belohnungen ----------
export function badgeSVG(id, size = 100) {
  const b = BADGES[id] || { icon: '?' };
  return s('svg', { viewBox: '0 0 100 100', width: size, height: size },
    s('path', { d: 'M50 6 L88 22 V50 C88 72 72 88 50 95 C28 88 12 72 12 50 V22Z', fill: '#20240f', stroke: '#c9b47e', 'stroke-width': 4 }),
    s('text', { x: 50, y: 60, 'text-anchor': 'middle', 'font-family': 'Share Tech Mono', 'font-size': b.icon.length > 3 ? 15 : 22, fill: '#e8dcb8' }, b.icon));
}

export function chevronSVG(n = 3) {
  const paths = [];
  for (let i = 0; i < n; i++) paths.push(s('path', { d: `M10 ${20 + i * 18} L50 ${40 + i * 18} L90 ${20 + i * 18}`, stroke: i === n - 1 ? '#8a9a4a' : '#c9b47e', 'stroke-width': 8, fill: 'none' }));
  return s('svg', { class: 'chev', viewBox: '0 0 100 90', width: 130 }, ...paths);
}

const queue = [];
let showing = false;
export function celebrate(events) {
  for (const e of events || []) queue.push(e);
  if (!showing) next();
}
function next() {
  const e = queue.shift();
  if (!e) { showing = false; return; }
  showing = true;
  vibrate([60, 40, 60]); beep(660, 120); setTimeout(() => beep(990, 160), 140);
  const content = e.type === 'rank'
    ? h('div', { class: 'box' }, h('div', { class: 'k' }, '[ BEFÖRDERUNG ]'), chevronSVG(e.rank.chevrons), h('div', { class: 'label' }, h('h1', {}, e.rank.name), h('div', { class: 'm' }, 'Neuer Dienstgrad in der App')))
    : h('div', { class: 'box' }, h('div', { class: 'k' }, '[ ABZEICHEN VERLIEHEN ]'), h('div', { class: 'badge' }, h('span', { class: 'ray' }), badgeSVG(e.id, 140)), h('div', { class: 'label' }, h('h1', {}, e.badge.name), h('div', { class: 'm' }, e.badge.desc)));
  const el = h('div', { class: 'reward', onclick: () => { el.remove(); next(); } }, content, h('div', { class: 'm', style: { position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center' } }, 'TIPPEN ZUM WEITERMACHEN'));
  document.body.append(el);
}

// ---------- Diagramm (eine Linie, Referenzlinien, Tipp zeigt Wert) ----------
export function lineChart(points, { refs = [], fmt = (v) => v, lowerBetter = false, height = 170, title } = {}) {
  const W = 340, H = height, L = 44, R = 10, T = 12, B = 22;
  const wrap = h('div', {});
  if (title) wrap.append(h('div', { class: 'k' }, title));
  if (!points.length) { wrap.append(h('div', { class: 'm', style: { padding: '20px 0' } }, 'Noch keine Daten.')); return wrap; }
  const xs = points.map((p) => new Date(p.date).getTime());
  const vals = [...points.map((p) => p.v), ...refs.map((r) => r.v)];
  let min = Math.min(...vals), max = Math.max(...vals);
  if (max - min < 4) { const m = (max + min) / 2; min = m - 2; max = m + 2; }
  const pad = (max - min) * 0.1; min -= pad; max += pad;
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const X = (t) => (x1 === x0 ? L + (W - L - R) / 2 : L + ((t - x0) / (x1 - x0)) * (W - L - R));
  const Y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const svg = s('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title || 'Verlauf' });
  for (let i = 0; i <= 3; i++) {
    const v = min + ((max - min) * i) / 3;
    svg.append(s('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), stroke: '#2a2e20', 'stroke-width': 1 }));
    svg.append(s('text', { x: L - 6, y: Y(v) + 3, 'text-anchor': 'end' }, fmt(v)));
  }
  for (const r of refs) {
    svg.append(s('line', { x1: L, x2: W - R, y1: Y(r.v), y2: Y(r.v), stroke: '#8a9a4a', 'stroke-width': 1.5, 'stroke-dasharray': r.dash || '5 4' }));
    svg.append(s('text', { x: W - R - 2, y: Y(r.v) - 4, 'text-anchor': 'end', style: 'fill:#a7ab90' }, `${r.label} ${fmt(r.v)}`));
  }
  svg.append(s('text', { x: L, y: H - 6 }, fmtDate(points[0].date)));
  if (points.length > 1) svg.append(s('text', { x: W - R, y: H - 6, 'text-anchor': 'end' }, fmtDate(points[points.length - 1].date)));
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
  svg.append(s('path', { d, stroke: '#c9b47e', 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round' }));
  const tip = s('g', { visibility: 'hidden' });
  const tipBg = s('rect', { fill: '#161911', stroke: '#c9b47e', 'stroke-width': 1, height: 30, rx: 0 });
  const tipT = s('text', { style: 'fill:#e8dcb8;font-size:11px' });
  const cross = s('line', { stroke: '#7f8a5a', 'stroke-width': 1, y1: T, y2: H - B });
  tip.append(cross, tipBg, tipT);
  points.forEach((p, i) => {
    const cx = X(xs[i]), cy = Y(p.v);
    svg.append(s('circle', { cx, cy, r: 4, fill: '#c9b47e', stroke: '#10120d', 'stroke-width': 2 }));
    const show = () => {
      const label = `${fmtDate(p.date)} · ${fmt(p.v)}${p.note ? ' · ' + p.note : ''}`;
      tipT.textContent = label;
      const w = label.length * 6.4 + 12; const tx = Math.min(Math.max(cx - w / 2, L), W - R - w);
      tipBg.setAttribute('x', tx); tipBg.setAttribute('y', Math.max(0, cy - 40)); tipBg.setAttribute('width', w);
      tipT.setAttribute('x', tx + 6); tipT.setAttribute('y', Math.max(0, cy - 40) + 19);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
      tip.setAttribute('visibility', 'visible');
    };
    svg.append(s('circle', { cx, cy, r: 16, fill: 'transparent', onclick: show, onmouseenter: show, onmouseleave: () => tip.setAttribute('visibility', 'hidden') }));
  });
  svg.append(tip);
  wrap.append(svg);
  const lastP = points[points.length - 1], firstP = points[0];
  if (points.length > 1) {
    const diff = lastP.v - firstP.v; const good = lowerBetter ? diff < 0 : diff > 0;
    wrap.append(h('div', { class: 'm' }, `Start ${fmt(firstP.v)} → aktuell ${fmt(lastP.v)} `, h('span', { class: good ? 'olive' : diff === 0 ? '' : 'warn' }, good ? '▲ besser' : diff === 0 ? '= gleich' : '▼ schlechter')));
  }
  return wrap;
}
export const fmtSec = (v) => fmtTime(v);

export function ring(percent, label = 'BEREIT', size = 118) {
  const r = 50, c = 2 * Math.PI * r, p = percent == null ? 0 : percent;
  const svg = s('svg', { class: 'ring', viewBox: '0 0 120 120', width: size, height: size },
    s('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: '#3a3f2a', 'stroke-width': 10 }),
    s('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: p < 40 ? '#c4613f' : p < 60 ? '#d9a441' : '#c9b47e', 'stroke-width': 10, 'stroke-dasharray': `${(c * p) / 100} ${c}`, transform: 'rotate(-90 60 60)', style: 'transition:stroke-dasharray 1s ease' }),
    s('text', { x: 60, y: 64, 'text-anchor': 'middle', 'font-size': 26, fill: '#e8dcb8' }, percent == null ? '--' : percent + '%'),
    s('text', { x: 60, y: 82, 'text-anchor': 'middle', 'font-size': 9, fill: '#7f8a5a' }, label));
  return svg;
}

export function countUp(el, to, ms = 900) {
  const t0 = performance.now();
  const f = (t) => { const p = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

export function progressBar(frac, markerFrac) {
  return h('div', { class: 'bar' }, h('i', { style: { width: Math.round((frac || 0) * 100) + '%' } }), markerFrac != null ? h('b', { style: { left: Math.round(markerFrac * 100) + '%' } }) : null);
}

export function download(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function pickFile(accept) {
  return new Promise((res) => {
    const i = h('input', { type: 'file', accept, style: { display: 'none' } });
    i.onchange = () => { res(i.files[0] || null); i.remove(); };
    document.body.append(i); i.click();
  });
}
