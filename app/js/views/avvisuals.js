// Mini-Animationen für die Wissenskurse „Nach dem AV“. Bewusst schlicht: man soll klar sehen, worum es geht.
import { h, s } from '../ui.js';

const C = { sand: '#c9b47e', sand2: '#e8dcb8', olive: '#8a9a4a', dim: '#a7ab90', line: '#3a3f2a', bad: '#c4613f', bg: '#0d0f0a' };
const T = (x, y, txt, o = {}) => s('text', { x, y, 'text-anchor': o.a || 'middle', style: `font:${o.size || 11}px var(--mono);fill:${o.fill || C.sand}` }, txt);
const wrap = (svg, ...kids) => h('div', { class: 'card' }, svg, ...kids);
const btns = (list) => h('div', { class: 'row wrap mt' }, ...list.map(([label, fn]) => h('button', { class: 'btn s', onclick: fn }, label)));
const anim = (el, frames, opts) => el.animate(frames, { duration: 1200, fill: 'forwards', easing: 'ease-in-out', ...opts });

export function avVisual(kind) {
  const f = { regeln, patrone, magazin, magazinFill, magazinInsert, absehen, ebene, haltepunkt, visierbild, atmung, tuer }[kind];
  return f ? f() : null;
}

// Mündung in sichere Richtung
function regeln() {
  const svg = s('svg', { viewBox: '0 0 320 170', class: 'fig' });
  const safe = s('path', { d: 'M160 90 L300 40 L300 140 Z', fill: '#8a9a4a33', stroke: C.olive });
  const person = s('g', {}, s('circle', { cx: 60, cy: 50, r: 9, fill: 'none', stroke: C.dim, 'stroke-width': 2 }), s('line', { x1: 60, y1: 59, x2: 60, y2: 95, stroke: C.dim, 'stroke-width': 3 }));
  const gun = s('g', { style: 'transform-origin:160px 90px' }, s('rect', { x: 120, y: 84, width: 80, height: 10, fill: C.sand }), s('rect', { x: 140, y: 94, width: 12, height: 22, fill: C.sand }));
  const label = T(160, 160, 'MÜNDUNG IN SICHERE RICHTUNG', { fill: C.olive });
  svg.append(safe, person, T(60, 115, 'KAMERAD', { fill: C.dim }), T(280, 95, 'KUGELFANG', { fill: C.olive }), gun, label);
  const show = (bad) => { anim(gun, [{ transform: `rotate(${bad ? 180 : 0}deg)` }]); label.textContent = bad ? 'FALSCH: MÜNDUNG AUF MENSCH' : 'MÜNDUNG IN SICHERE RICHTUNG'; label.style.fill = bad ? C.bad : C.olive; };
  return wrap(svg, btns([['✓ Richtig', () => show(false)], ['✗ Falsch', () => show(true)]]));
}

// Patrone im Schnitt
function patrone() {
  const parts = [['Geschoss', 'M40 70 Q40 50 80 50 L110 50 L110 90 L80 90 Q40 90 40 70Z'], ['Hülse', 'M110 46 L250 46 L262 56 L262 84 L250 94 L110 94Z'], ['Treibladung', 'M120 56 L240 56 L240 84 L120 84Z'], ['Zündhütchen', 'M262 62 L276 62 L276 78 L262 78Z']];
  const els = parts.map(([, d], i) => s('path', { d, fill: i === 2 ? '#c9b47e33' : '#1b1e14', stroke: C.dim, 'stroke-width': 1.5 }));
  const label = T(160, 130, 'ANTIPPEN ODER RUNDGANG');
  const svg = s('svg', { viewBox: '0 0 320 150', class: 'fig' }, ...els, label);
  const hl = (i) => { els.forEach((e, j) => { e.setAttribute('stroke', j === i ? C.sand : C.dim); e.setAttribute('stroke-width', j === i ? 3 : 1.5); }); label.textContent = parts[i][0].toUpperCase(); };
  els.forEach((e, i) => e.addEventListener('click', () => hl(i)));
  return wrap(svg, btns([['▶ Rundgang', () => parts.forEach((_, i) => setTimeout(() => hl(i), i * 1300))]]));
}

// Kastenmagazin im Schnitt
function magazinBase() {
  const svg = s('svg', { viewBox: '0 0 320 230', class: 'fig' });
  svg.append(s('path', { d: 'M110 20 L190 20 L200 200 L120 200 Z', fill: 'none', stroke: C.dim, 'stroke-width': 3 }));
  svg.append(s('path', { d: 'M110 20 L124 32 M190 20 L176 32', stroke: C.sand, 'stroke-width': 4 }));
  svg.append(T(250, 30, 'LIPPEN'), T(250, 210, 'BODEN'), s('rect', { x: 118, y: 198, width: 84, height: 8, fill: C.dim }));
  const rounds = s('g', {}); const follower = s('rect', { x: 122, width: 70, height: 8, fill: C.olive }); const spring = s('path', { fill: 'none', stroke: C.olive, 'stroke-width': 2 });
  svg.append(rounds, follower, spring, T(250, 120, 'ZUBRINGER', { fill: C.olive }), T(250, 160, 'FEDER', { fill: C.olive }));
  const draw = (n) => {
    rounds.replaceChildren();
    const top = 36;
    for (let i = 0; i < n; i++) rounds.append(s('rect', { x: 126 + (i % 2) * 8, y: top + i * 14, width: 58, height: 12, rx: 6, fill: '#c9b47e66', stroke: C.sand }));
    const fy = top + n * 14 + 2; follower.setAttribute('y', fy);
    const coils = 8, y0 = fy + 8, y1 = 198, step = (y1 - y0) / coils; let d = `M157 ${y0}`;
    for (let i = 0; i < coils; i++) d += ` L${i % 2 ? 130 : 184} ${y0 + step * (i + 0.5)} L157 ${y0 + step * (i + 1)}`;
    spring.setAttribute('d', d);
  };
  return { svg, draw };
}
function magazin() { const m = magazinBase(); m.draw(5); return wrap(m.svg, h('div', { class: 'm' }, 'Gehäuse · Lippen · Patronen · Zubringer · Feder · Boden')); }
function magazinFill() {
  const m = magazinBase(); let n = 0; m.draw(0);
  const info = h('div', { class: 'm' }, '0 PATRONEN – FEDER ENTSPANNT');
  const go = () => { n = 0; const t = setInterval(() => { n++; m.draw(n); info.textContent = `${n} PATRONEN – FEDER ${n > 8 ? 'STARK' : 'ZUNEHMEND'} GESPANNT`; if (n >= 10 || !m.svg.isConnected) clearInterval(t); }, 500); };
  return wrap(m.svg, info, btns([['▶ Füllen', go]]));
}
function magazinInsert() {
  const svg = s('svg', { viewBox: '0 0 320 200', class: 'fig' });
  svg.append(s('rect', { x: 60, y: 40, width: 200, height: 40, fill: '#1b1e14', stroke: C.dim }), T(160, 30, 'WAFFE (SCHEMATISCH)', { fill: C.dim }), s('rect', { x: 140, y: 80, width: 40, height: 14, fill: 'none', stroke: C.dim, 'stroke-dasharray': '3 3' }));
  const mag = s('g', {}, s('path', { d: 'M142 0 L178 0 L184 70 L148 70 Z', fill: '#c9b47e33', stroke: C.sand, 'stroke-width': 2 }));
  mag.setAttribute('transform', 'translate(0 120)');
  const label = T(160, 195, 'MAGAZIN BEREIT');
  svg.append(mag, label);
  const ins = () => { anim(mag, [{ transform: 'translate(0px,120px)' }, { transform: 'translate(0px,80px)' }]); setTimeout(() => { label.textContent = 'KLICK – EINGERASTET'; }, 1200); setTimeout(() => { anim(mag, [{ transform: 'translate(0px,80px)' }, { transform: 'translate(0px,86px)' }, { transform: 'translate(0px,80px)' }], { duration: 600 }); label.textContent = 'ZUGPROBE: SITZT FEST'; }, 2000); };
  return wrap(svg, btns([['▶ Einsetzen + Zugprobe', ins]]));
}

// Absehen (MRAD) über einer Zielfigur
function absehen() {
  const svg = s('svg', { viewBox: '0 0 300 250', class: 'fig' });
  const R = 100, cx = 150, cy = 110, px = 12; // 12 px pro MRAD
  svg.append(s('circle', { cx, cy, r: R, fill: C.bg, stroke: C.dim, 'stroke-width': 2 }));
  const target = s('g', {});
  svg.append(target);
  svg.append(s('line', { x1: cx - R, x2: cx + R, y1: cy, y2: cy, stroke: C.sand, 'stroke-width': 1 }), s('line', { x1: cx, x2: cx, y1: cy - R, y2: cy + R, stroke: C.sand, 'stroke-width': 1 }));
  for (let i = -7; i <= 7; i++) if (i) { svg.append(s('line', { x1: cx + i * px, x2: cx + i * px, y1: cy - 4, y2: cy + 4, stroke: C.sand }), s('line', { y1: cy + i * px, y2: cy + i * px, x1: cx - 4, x2: cx + 4, stroke: C.sand })); }
  const label = T(150, 226, '', { size: 11 }), label2 = T(150, 242, '', { size: 11, fill: C.olive });
  svg.append(label, label2);
  const set = (m) => {
    const mil = (1.8 * 1000) / m; const hpx = mil * px;
    target.replaceChildren(s('rect', { x: cx + 8, y: cy - hpx / 2, width: hpx * 0.28, height: hpx, rx: hpx * 0.1, fill: '#8a9a4a55', stroke: C.olive }));
    const mt = mil.toFixed(1).replace('.', ',');
    label.textContent = `PERSON 1,8 m DECKT ${mt} MRAD`;
    label2.textContent = `1,8 × 1000 ÷ ${mt} ≈ ${m} m`;
  };
  set(300);
  return wrap(svg, btns([[ '300 m', () => set(300)], ['500 m', () => set(500)], ['800 m', () => set(800)]]), h('div', { class: 'm' }, '1 Strich = 1 MRAD. Ziel unten auf dem Querbalken anlegen und Striche zählen.'));
}

// Erste vs. zweite Bildebene
function ebene() {
  const svg = s('svg', { viewBox: '0 0 320 170', class: 'fig' });
  const scope = (x, title) => {
    const g = s('g', {});
    g.append(s('circle', { cx: x, cy: 80, r: 62, fill: C.bg, stroke: C.dim, 'stroke-width': 2 }), T(x, 162, title));
    const tgt = s('rect', { x: x - 6, y: 60, width: 12, height: 40, fill: '#8a9a4a55', stroke: C.olive });
    const ret = s('g', {}, s('line', { x1: x - 50, x2: x + 50, y1: 80, y2: 80, stroke: C.sand }), s('line', { x1: x, x2: x, y1: 30, y2: 130, stroke: C.sand }), ...[-3, -2, -1, 1, 2, 3].map((i) => s('line', { x1: x + i * 12, x2: x + i * 12, y1: 76, y2: 84, stroke: C.sand })));
    g.append(tgt, ret);
    return { g, tgt, ret };
  };
  const a = scope(80, 'ERSTE (FFP)'), b = scope(240, 'ZWEITE (SFP)');
  svg.append(a.g, b.g);
  const zoom = (z) => {
    for (const sc of [a, b]) { const x = sc === a ? 80 : 240; anim(sc.tgt, [{ transform: `translate(${x}px,80px) scale(${z}) translate(${-x}px,-80px)` }], { duration: 700 }); }
    anim(a.ret, [{ transform: `translate(80px,80px) scale(${z}) translate(-80px,-80px)` }], { duration: 700 });
  };
  return wrap(svg, btns([['Vergrößerung ×1', () => zoom(1)], ['×2', () => zoom(1.8)]]), h('div', { class: 'm' }, 'FFP: Absehen wächst mit – Ziel deckt immer gleich viele Striche. SFP: Absehen bleibt gleich – die Zahl ändert sich.'));
}

// Flugbahn und Haltepunkt
function haltepunkt() {
  const svg = s('svg', { viewBox: '0 0 320 170', class: 'fig' });
  svg.append(s('line', { x1: 20, y1: 80, x2: 310, y2: 80, stroke: C.dim, 'stroke-dasharray': '4 4' }), T(300, 74, 'VISIERLINIE', { a: 'end', fill: C.dim }));
  svg.append(s('path', { d: 'M20 90 Q120 50 200 80 T310 130', fill: 'none', stroke: C.sand, 'stroke-width': 2 }), T(200, 70, '300 m: Treffer', { fill: C.olive }));
  const dot = s('circle', { cx: 20, cy: 90, r: 4, fill: C.sand });
  const label = T(160, 160, 'EINGESCHOSSEN AUF 300 m');
  svg.append(s('line', { x1: 310, y1: 60, x2: 310, y2: 150, stroke: C.olive, 'stroke-width': 3 }), T(296, 150, '500 m', { a: 'end', fill: C.olive }), dot, label);
  const fly = () => { const path = svg.querySelector('path'); const L = path.getTotalLength(); let t = 0; const step = () => { t += 0.02; const p = path.getPointAtLength(Math.min(1, t) * L); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); if (t < 1 && svg.isConnected) requestAnimationFrame(step); else label.textContent = 'AUF 500 m ZU TIEF → HÖHER HALTEN ODER TURM VERSTELLEN'; }; step(); };
  return wrap(svg, btns([['▶ Schuss auf 500 m', fly]]));
}

// Visierbild Kimme/Korn
function visierbild() {
  const svg = s('svg', { viewBox: '0 0 320 150', class: 'fig' });
  const mk = (x, dx, ok) => { const g = s('g', {}); g.append(s('circle', { cx: x, cy: 70, r: 40, fill: 'none', stroke: C.dim, 'stroke-width': 10 }), s('rect', { x: x - 4 + dx, y: 70, width: 8, height: 40, fill: ok ? C.sand : C.bad }), s('line', { x1: x - 30, x2: x + 30, y1: 70, y2: 70, stroke: '#ffffff22' }), T(x, 140, ok ? '✓ KORN MITTIG, BÜNDIG' : '✗ KORN SEITLICH', { fill: ok ? C.olive : C.bad })); return g; };
  svg.append(mk(90, 0, true), mk(230, 14, false));
  return wrap(svg, h('div', { class: 'm' }, 'Auge fokussiert das Korn. Das Ziel darf leicht unscharf sein.'));
}

// Atemkurve mit natürlicher Atempause
function atmung() {
  const svg = s('svg', { viewBox: '0 0 320 140', class: 'fig' });
  let d = 'M10 70'; for (let x = 10; x <= 310; x += 5) { const ph = ((x - 10) % 100) / 100; const y = ph < 0.35 ? 70 - Math.sin((ph / 0.35) * Math.PI / 2) * 40 : ph < 0.7 ? 30 + Math.sin(((ph - 0.35) / 0.35) * Math.PI / 2) * 40 : 70; d += ` L${x} ${y}`; }
  svg.append(s('path', { d, fill: 'none', stroke: C.sand, 'stroke-width': 2 }));
  for (const x of [80, 180, 280]) svg.append(s('rect', { x: x - 10, y: 62, width: 30, height: 16, fill: '#8a9a4a44', stroke: C.olive }));
  const dot = s('circle', { r: 5, fill: C.sand2 });
  svg.append(dot, T(160, 130, 'GRÜN = NATÜRLICHE ATEMPAUSE → HIER BRICHT DER SCHUSS', { fill: C.olive, size: 10 }));
  const path = svg.querySelector('path');
  const t0 = performance.now();
  const step = (t) => { if (!svg.isConnected && t - t0 > 500) return; const L = path.getTotalLength(); const p = path.getPointAtLength((((t - t0) / 6000) % 1) * L); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); requestAnimationFrame(step); };
  requestAnimationFrame(step);
  return wrap(svg);
}

// Tür lesen: Band- und Schlossseite, Ansatzpunkt Ramme
function tuer() {
  const svg = s('svg', { viewBox: '0 0 320 210', class: 'fig' });
  svg.append(s('rect', { x: 100, y: 20, width: 120, height: 170, fill: '#1b1e14', stroke: C.dim, 'stroke-width': 3 }));
  svg.append(s('rect', { x: 94, y: 40, width: 8, height: 18, fill: C.olive }), s('rect', { x: 94, y: 150, width: 8, height: 18, fill: C.olive }), T(60, 105, 'BÄNDER', { fill: C.olive }));
  svg.append(s('circle', { cx: 205, cy: 110, r: 6, fill: C.sand }), T(270, 105, 'SCHLOSS'));
  const ram = s('g', {}, s('rect', { x: 230, y: 100, width: 70, height: 18, rx: 4, fill: '#c9b47e55', stroke: C.sand }));
  const hit = s('circle', { cx: 210, cy: 110, r: 16, fill: 'none', stroke: C.bad, 'stroke-width': 2, opacity: 0 });
  const label = T(160, 205, 'NACH INNEN ÖFFNEND · RAMME AN DER SCHLOSSSEITE', { size: 10 });
  svg.append(ram, hit, label);
  const go = () => { anim(ram, [{ transform: 'translateX(40px)' }, { transform: 'translateX(-14px)' }, { transform: 'translateX(40px)' }], { duration: 900 }); setTimeout(() => anim(hit, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }), 400); };
  return wrap(svg, btns([['▶ Ansatzpunkt zeigen', go]]), h('div', { class: 'm' }, 'Schematisch. Nur mechanisches Prinzip, kein Verfahren.'));
}
