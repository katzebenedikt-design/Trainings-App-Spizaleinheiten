// Drahtmodell-Figuren für die Übungsausführung (Seitenansicht). Jede Übung: 2–3 Posen,
// zwischen denen weich hin- und her animiert wird, plus Hinweistexte pro Pose.
import { s } from '../ui.js';

// Gelenke: k=Kopf, n=Nacken/Schulter, e=Ellbogen, w=Hand, hip=Hüfte, kn=Knie, a=Fuß
const P = (k, n, e, w, hip, kn, a) => ({ k, n, e, w, hip, kn, a });

export const FIGS = {
  liegestuetz: { ground: 150, poses: [
    P([224, 92], [210, 102], [210, 126], [210, 150], [130, 118], [80, 132], [36, 146]),
    P([224, 124], [210, 132], [232, 140], [210, 150], [130, 138], [80, 143], [36, 148])],
    hints: ['Arme gestreckt · Körper gerade', 'Ellbogen 90° · Brust knapp über Boden'] },
  klimmzug: { ground: 165, bar: [[90, 30], [230, 30]], poses: [
    P([160, 74], [160, 86], [160, 58], [160, 32], [160, 140], [160, 170], [168, 195]),
    P([160, 22], [160, 40], [130, 46], [150, 31], [160, 96], [160, 128], [168, 152])],
    hints: ['Ausgehängt · Arme gestreckt', 'Kinn über der Stange · kein Schwung'] },
  situp: { ground: 160, poses: [
    P([60, 146], [76, 148], [80, 140], [84, 142], [140, 152], [176, 120], [214, 156]),
    P([150, 72], [146, 86], [140, 92], [146, 90], [140, 152], [176, 120], [214, 156])],
    hints: ['Schulterblätter am Boden', 'Ellbogen berühren die Oberschenkel'] },
  kniebeuge: { ground: 190, gear: 'bar', poses: [
    P([160, 24], [160, 40], [176, 46], [164, 38], [160, 106], [162, 148], [160, 188]),
    P([186, 62], [178, 76], [194, 80], [182, 74], [134, 130], [182, 136], [160, 188])],
    hints: ['Aufrecht · Rumpf fest', 'Oberschenkel waagerecht · Fersen am Boden'] },
  ausfallschritt: { ground: 190, poses: [
    { ...P([160, 24], [160, 40], [160, 72], [160, 100], [160, 106], [164, 148], [162, 188]), kn2: [156, 148], a2: [150, 188] },
    { ...P([160, 58], [160, 74], [160, 106], [160, 132], [160, 140], [204, 144], [206, 188]), kn2: [128, 182], a2: [94, 186] }],
    hints: ['Stand', 'Großer Schritt · hinteres Knie Richtung Boden'] },
  kreuzheben: { ground: 190, gear: 'hantel', poses: [
    P([206, 82], [190, 92], [190, 128], [190, 160], [130, 110], [176, 148], [160, 188]),
    P([160, 24], [160, 40], [160, 72], [160, 102], [160, 106], [162, 148], [160, 188])],
    hints: ['Rücken gerade · Stange am Schienbein', 'Hüfte strecken · Schultern zurück'] },
  bankdruecken: { ground: 160, bench: true, gear: 'press', poses: [
    P([70, 130], [90, 132], [110, 104], [110, 74], [160, 132], [208, 150], [218, 186]),
    P([70, 130], [90, 132], [118, 140], [110, 118], [160, 132], [208, 150], [218, 186])],
    hints: ['Arme gestreckt über der Brust', 'Stange kontrolliert zur Brust'] },
  latzug: { ground: 190, poses: [
    P([160, 70], [160, 86], [150, 50], [148, 22], [160, 150], [200, 150], [200, 188]),
    P([160, 70], [160, 86], [132, 104], [148, 88], [160, 150], [200, 150], [200, 188])],
    hints: ['Arme gestreckt oben', 'Zur oberen Brust ziehen · Brust raus'] },
  rudern: { ground: 190, gear: 'hantel', poses: [
    P([204, 64], [190, 76], [190, 112], [190, 146], [130, 108], [158, 148], [150, 188]),
    P([204, 64], [190, 76], [158, 92], [176, 112], [130, 108], [158, 148], [150, 188])],
    hints: ['45° vorgebeugt · Rücken gerade', 'Zum Bauchnabel ziehen'] },
  schulterdruecken: { ground: 190, poses: [
    P([160, 24], [160, 40], [184, 44], [178, 24], [160, 106], [162, 148], [160, 188]),
    P([160, 24], [160, 40], [166, 14], [164, -6], [160, 106], [162, 148], [160, 188])],
    hints: ['Hände auf Schulterhöhe', 'Über Kopf strecken · kein Hohlkreuz'] },
  hyperextension: { ground: 190, poses: [
    P([226, 160], [212, 146], [218, 160], [222, 170], [150, 110], [100, 112], [50, 118]),
    P([236, 104], [220, 108], [226, 120], [230, 130], [150, 110], [100, 112], [50, 118])],
    hints: ['Langsam ablassen', 'Aufrichten bis Linie · nicht überstrecken'] },
  bizeps: { ground: 190, poses: [
    P([160, 24], [160, 40], [160, 72], [164, 104], [160, 106], [162, 148], [160, 188]),
    P([160, 24], [160, 40], [160, 72], [176, 48], [160, 106], [162, 148], [160, 188])],
    hints: ['Arme gestreckt', 'Beugen · Ellbogen bleibt am Körper'] },
  trizeps: { ground: 190, poses: [
    P([160, 24], [160, 40], [166, 72], [180, 54], [160, 106], [162, 148], [160, 188]),
    P([160, 24], [160, 40], [166, 72], [170, 104], [160, 106], [162, 148], [160, 188])],
    hints: ['Oberarme fixiert', 'Unterarme strecken'] },
  dips: { ground: 190, bars: true, poses: [
    P([160, 24], [160, 40], [162, 72], [160, 100], [160, 106], [150, 140], [170, 160]),
    P([160, 60], [160, 76], [134, 82], [160, 100], [160, 142], [150, 170], [170, 186])],
    hints: ['Arme gestreckt · Schultern tief', 'Ellbogen ca. 90°'] },
  plank: { ground: 150, poses: [
    P([224, 102], [208, 112], [208, 148], [228, 148], [130, 124], [80, 134], [36, 146]),
    P([224, 102], [208, 112], [208, 148], [228, 148], [130, 124], [80, 134], [36, 146])],
    hints: ['Linie Ferse–Schulter · Bauch fest', 'Halten · ruhig atmen'] },
  burpee: { ground: 190, poses: [
    P([160, 24], [160, 40], [160, 72], [160, 100], [160, 106], [160, 148], [160, 188]),
    P([196, 110], [182, 120], [182, 154], [182, 186], [150, 150], [176, 170], [146, 188]),
    P([224, 144], [210, 152], [210, 172], [210, 188], [130, 162], [80, 174], [36, 186])],
    hints: ['Stand', 'Hocke · Hände am Boden', 'Stütz · Liegestütz'] },
  wade: { ground: 190, poses: [
    P([160, 30], [160, 46], [160, 78], [160, 106], [160, 112], [160, 152], [160, 186]),
    P([160, 18], [160, 34], [160, 66], [160, 94], [160, 100], [160, 140], [162, 176])],
    hints: ['Fersen unten', 'Auf die Zehenspitzen drücken'] },
  bridge: { ground: 170, poses: [
    P([50, 158], [66, 160], [96, 164], [120, 166], [130, 160], [176, 128], [196, 166]),
    P([50, 158], [66, 156], [96, 164], [120, 166], [130, 122], [176, 118], [196, 166])],
    hints: ['Rückenlage, Füße nah', 'Hüfte hoch: Linie Knie–Schulter'] },
  kickbox: { ground: 190, poses: [
    { ...P([150, 28], [150, 44], [168, 64], [168, 40], [150, 108], [170, 148], [176, 188]), kn2: [134, 148], a2: [126, 188] },
    { ...P([156, 28], [156, 44], [186, 44], [214, 40], [152, 108], [172, 148], [178, 188]), kn2: [136, 148], a2: [128, 188] }],
    hints: ['Deckung oben · Kinn runter', 'Jab · Arm zurück in die Deckung'] },
};

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Eine gemeinsame Animationsschleife für alle Figuren; es bewegen sich nur sichtbare.
const live = new Set();
let raf = 0;
const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((entries) => {
  for (const e of entries) { const f = e.target.__fig; if (f) f.visible = e.isIntersecting; }
  kick();
}, { rootMargin: '50px' }) : null;
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function kick() { if (!raf && live.size) raf = requestAnimationFrame(tick); }
function tick(ts) {
  raf = 0;
  for (const f of live) {
    if (!f.svg.isConnected) { if (f.started) { live.delete(f); io?.unobserve(f.svg); } continue; }
    f.started = true;
    if (f.visible === false) continue;
    f.draw(ts);
  }
  if ([...live].some((f) => f.visible !== false)) kick();
}

export function figure(key, { speed = 1, thumb = false } = {}) {
  const def = FIGS[key];
  if (!def) return placeholder(thumb);
  const svg = s('svg', { class: 'fig' + (thumb ? ' thumb' : ''), viewBox: thumb ? '0 -10 260 210' : '0 -10 260 210', role: 'img', 'aria-label': 'Bewegungsablauf' });
  svg.append(s('line', { class: 'ground', x1: 10, x2: 250, y1: def.ground, y2: def.ground }));
  if (!thumb) svg.append(s('line', { class: 'guide', x1: 10, x2: 250, y1: 2, y2: 2 }));
  if (def.bar) svg.append(s('line', { class: 'gear', x1: def.bar[0][0], y1: def.bar[0][1], x2: def.bar[1][0], y2: def.bar[1][1] }));
  if (def.bench) svg.append(s('rect', { class: 'gear', x: 60, y: 138, width: 120, height: 8 }), s('line', { class: 'gear', x1: 120, x2: 120, y1: 146, y2: def.ground }));
  if (def.bars) svg.append(s('line', { class: 'gear', x1: 130, x2: 200, y1: 100, y2: 100 }));
  const two = !!def.poses[0].kn2;
  const bones = ['k-n', 'n-e', 'e-w', 'n-hip', 'hip-kn', 'kn-a', ...(two ? ['hip-kn2', 'kn2-a2'] : [])].map(() => s('line', { class: 'bone' }));
  const joints = thumb ? [] : ['e', 'hip', 'kn', 'n'].map(() => s('circle', { class: 'joint', r: 4 }));
  const head = s('circle', { class: 'head', r: 11 });
  const gear = def.gear ? s('line', { class: 'gear', 'stroke-width': 6 }) : null;
  const hint = thumb ? null : s('text', { class: 'hint', x: 12, y: -1 });
  svg.append(...bones, ...joints, head);
  if (gear) svg.append(gear);
  if (hint) svg.append(hint);
  const n = def.poses.length;
  let t0 = null;
  const set = (el, a, b) => { el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]); el.setAttribute('x2', b[0]); el.setAttribute('y2', b[1]); };
  const draw = (ts) => {
    t0 = t0 ?? ts;
    const cyc = reduce ? 0.6 : ((ts - t0) / 1000) * 0.45 * speed; // Bewegungen pro Sekunde
    const seg = Math.floor(cyc) % n; const f = cyc % 1;
    const ease = (1 - Math.cos(Math.min(1, f * 1.3) * Math.PI)) / 2;
    const A = def.poses[seg], B = def.poses[(seg + 1) % n];
    const p = {}; for (const k of Object.keys(A)) p[k] = lerp(A[k], B[k], ease);
    set(bones[0], p.k, p.n); set(bones[1], p.n, p.e); set(bones[2], p.e, p.w); set(bones[3], p.n, p.hip); set(bones[4], p.hip, p.kn); set(bones[5], p.kn, p.a);
    if (two) { set(bones[6], p.hip, p.kn2); set(bones[7], p.kn2, p.a2); }
    ['e', 'hip', 'kn', 'n'].forEach((j, i) => { if (joints[i]) { joints[i].setAttribute('cx', p[j][0]); joints[i].setAttribute('cy', p[j][1]); } });
    head.setAttribute('cx', p.k[0]); head.setAttribute('cy', p.k[1]);
    if (gear) { gear.setAttribute('x1', p.w[0]); gear.setAttribute('y1', p.w[1] - 10); gear.setAttribute('x2', p.w[0]); gear.setAttribute('y2', p.w[1] + 10); }
    if (hint) hint.textContent = (def.hints[ease > 0.5 ? (seg + 1) % n : seg] || '').toUpperCase();
  };
  const fig = { svg, draw, visible: undefined, started: false };
  svg.__fig = fig;
  draw(0); // erste Pose sofort zeichnen
  if (!reduce) { live.add(fig); io?.observe(svg); kick(); }
  return svg;
}

// Platzhalter, solange es für eine Übung noch keine Animation gibt
function placeholder(thumb) {
  return s('svg', { class: 'fig placeholder' + (thumb ? ' thumb' : ''), viewBox: '0 0 260 200', role: 'img', 'aria-label': 'Animation folgt' },
    s('rect', { x: 20, y: 20, width: 220, height: 160, fill: 'none', stroke: '#3a3f2a', 'stroke-dasharray': '6 6' }),
    s('circle', { cx: 130, cy: 70, r: 14, fill: 'none', stroke: '#7f8a5a', 'stroke-width': 3 }),
    s('line', { x1: 130, y1: 84, x2: 130, y2: 130, stroke: '#7f8a5a', 'stroke-width': 4 }),
    s('text', { x: 130, y: 165, 'text-anchor': 'middle', style: 'font:14px var(--mono);fill:#7f8a5a' }, 'ANIMATION FOLGT'));
}
