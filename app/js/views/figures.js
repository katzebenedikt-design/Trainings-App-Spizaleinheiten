// Animierte Übungsfiguren (SVG). Jede Übung hat einen passenden Blickwinkel (Seite, vorn, hinten),
// Equipment (Langhantel mit Scheiben, Kurzhanteln, Stange, Bank, Rucksack …) und 2–4 Posen,
// zwischen denen weich animiert wird. Eine gemeinsame Animationsschleife bewegt nur sichtbare Figuren.
import { s } from '../ui.js';

const C = { bone: '#f1e4bf', far: '#7d775c', joint: '#8a9a4a', head: '#0a0b09', sand: '#c9b47e', plate: '#2a2c22', olive: '#5d6a30', gear: '#a7ab90', bg: '#101209', ground: '#4a5034' };
const G = 226; // Boden

// ---------- Posen ----------
const STAND = { k: [150, 40], n: [150, 58], s: [150, 64], e: [150, 102], w: [152, 138], h: [150, 136], kn: [152, 180], a: [150, 222] };
const st = (o = {}) => ({ ...STAND, ...o });

export const FIGS = {
  kniebeuge: { view: 'Seite', props: [{ t: 'plate', at: 'bar' }], poses: [
    st({ s: [147, 64], e: [132, 82], w: [144, 66], bar: [138, 70] }),
    { k: [156, 82], n: [146, 98], s: [140, 104], e: [120, 118], w: [132, 104], bar: [130, 108], h: [108, 170], kn: [164, 176], a: [150, 222] }],
    hints: ['Aufrecht · Stange auf dem oberen Rücken', 'Oberschenkel waagerecht · Fersen am Boden'] },
  kreuzheben: { view: 'Seite', props: [{ t: 'plate', at: 'bar' }], poses: [
    { k: [190, 96], n: [178, 104], s: [170, 110], e: [164, 152], w: [156, 198], bar: [156, 202], h: [108, 150], kn: [166, 184], a: [150, 222] },
    st({ w: [152, 138], bar: [152, 140] })],
    hints: ['Stange am Schienbein · Rücken gerade', 'Hüfte strecken · Schultern zurück'] },
  bankdruecken: { view: 'Seite', props: [{ t: 'bench', x1: 60, x2: 205, y: 172 }, { t: 'plate', at: 'bar' }], poses: [
    { k: [74, 152], n: [90, 160], s: [98, 164], e: [102, 128], w: [102, 96], bar: [102, 96], h: [172, 166], kn: [214, 172], a: [220, 222] },
    { k: [74, 152], n: [90, 160], s: [98, 164], e: [80, 174], w: [104, 146], bar: [104, 146], h: [172, 166], kn: [214, 172], a: [220, 222] }],
    hints: ['Arme gestreckt über der Brust', 'Stange kontrolliert zur Brust'] },
  rudern: { view: 'Seite', props: [{ t: 'plate', at: 'bar' }], poses: [
    { k: [198, 96], n: [184, 104], s: [178, 110], e: [176, 150], w: [174, 186], bar: [174, 190], h: [116, 146], kn: [160, 184], a: [150, 222] },
    { k: [198, 96], n: [184, 104], s: [178, 110], e: [140, 126], w: [152, 158], bar: [152, 162], h: [116, 146], kn: [160, 184], a: [150, 222] }],
    hints: ['45° vorgebeugt · Arme lang', 'Zum Bauchnabel ziehen · Schulterblätter zusammen'] },
  schulterdruecken: { view: 'Vorn', vb: '0 -34 300 266', props: [{ t: 'barFront', plates: true }], poses: [
    { k: [150, 46], n: [150, 64], sL: [128, 70], sR: [172, 70], eL: [110, 96], eR: [190, 96], wL: [116, 66], wR: [184, 66], hL: [138, 140], hR: [162, 140], kL: [138, 182], kR: [162, 182], aL: [136, 222], aR: [164, 222] },
    { k: [150, 46], n: [150, 64], sL: [128, 70], sR: [172, 70], eL: [118, 38], eR: [182, 38], wL: [124, 6], wR: [176, 6], hL: [138, 140], hR: [162, 140], kL: [138, 182], kR: [162, 182], aL: [136, 222], aR: [164, 222] }],
    hints: ['Stange vor den Schultern', 'Über Kopf strecken · Rumpf fest'] },
  klimmzug: { view: 'Hinten', noGround: true, vb: '0 0 300 246', props: [{ t: 'pullbar', y: 30 }, { t: 'lats' }], poses: [
    { k: [150, 74], n: [150, 92], sL: [128, 98], sR: [172, 98], eL: [114, 64], eR: [186, 64], wL: [110, 32], wR: [190, 32], hL: [138, 166], hR: [162, 166], kL: [140, 200], kR: [160, 200], aL: [142, 236], aR: [158, 236] },
    { k: [150, 14], n: [150, 36], sL: [124, 44], sR: [176, 44], eL: [100, 64], eR: [200, 64], wL: [110, 32], wR: [190, 32], hL: [138, 112], hR: [162, 112], kL: [140, 148], kR: [160, 148], aL: [142, 184], aR: [158, 184] }],
    hints: ['Ausgehängt · Arme gestreckt', 'Ellbogen runter ziehen · Rücken arbeitet · Kinn über die Stange'] },
  latzug: { view: 'Hinten', props: [{ t: 'seat', x1: 112, x2: 188, y: 174 }, { t: 'cable', from: [150, 0], toMid: true }, { t: 'barFront' }, { t: 'lats' }], poses: [
    { k: [150, 86], n: [150, 102], sL: [126, 110], sR: [174, 110], eL: [108, 72], eR: [192, 72], wL: [100, 40], wR: [200, 40], hL: [138, 172], hR: [162, 172], kL: [134, 194], kR: [166, 194], aL: [132, 224], aR: [168, 224] },
    { k: [150, 86], n: [150, 102], sL: [126, 112], sR: [174, 112], eL: [104, 138], eR: [196, 138], wL: [108, 104], wR: [192, 104], hL: [138, 172], hR: [162, 172], kL: [134, 194], kR: [166, 194], aL: [132, 224], aR: [168, 224] }],
    hints: ['Arme gestreckt · Brust raus', 'Stange zur oberen Brust · Schulterblätter nach unten'] },
  liegestuetz: { view: 'Seite', poses: [
    { k: [240, 128], n: [226, 136], s: [218, 140], e: [218, 182], w: [218, 222], h: [140, 178], kn: [96, 200], a: [50, 222] },
    { k: [236, 186], n: [222, 192], s: [214, 196], e: [192, 202], w: [218, 222], h: [140, 208], kn: [96, 215], a: [50, 222] }],
    hints: ['Arme gestreckt · Körper gerade', 'Ellbogen 90° · Brust knapp über Boden'] },
  liegestuetz_eng: { view: 'Seite', poses: [
    { k: [240, 128], n: [226, 136], s: [218, 140], e: [214, 182], w: [212, 222], h: [140, 178], kn: [96, 200], a: [50, 222] },
    { k: [236, 186], n: [222, 192], s: [214, 196], e: [198, 208], w: [212, 222], h: [140, 208], kn: [96, 215], a: [50, 222] }],
    hints: ['Hände eng · Körper gerade', 'Ellbogen eng am Körper nach hinten'] },
  liegestuetz_erhoeht: { view: 'Seite', props: [{ t: 'box', x: 26, y: 192, w: 56, h: 34 }], poses: [
    { k: [240, 128], n: [226, 136], s: [218, 140], e: [218, 182], w: [218, 222], h: [140, 164], kn: [96, 178], a: [54, 192] },
    { k: [236, 190], n: [222, 196], s: [214, 200], e: [192, 206], w: [218, 222], h: [140, 197], kn: [96, 195], a: [54, 192] }],
    hints: ['Füße erhöht · Körper gerade', 'Kopf Richtung Boden · Ellbogen 90°'] },
  situp: { view: 'Seite', poses: [
    { k: [60, 204], n: [76, 210], s: [82, 212], e: [100, 198], w: [88, 206], h: [140, 214], kn: [182, 172], a: [214, 222] },
    { k: [112, 120], n: [118, 136], s: [122, 146], e: [166, 178], w: [134, 152], h: [140, 214], kn: [182, 172], a: [214, 222] }],
    hints: ['Schulterblätter am Boden · Arme gekreuzt', 'Hochrollen · Ellbogen an die Oberschenkel'] },
  ausfallschritt: { view: 'Seite', props: [{ t: 'dumbbell', at: 'w' }], poses: [
    st({ kn2: [146, 180], a2: [142, 222] }),
    { k: [150, 72], n: [150, 90], s: [150, 96], e: [150, 134], w: [152, 170], h: [150, 168], kn: [194, 172], a: [196, 222], kn2: [126, 212], a2: [92, 222] }],
    hints: ['Aufrecht · Hanteln seitlich', 'Großer Schritt · hinteres Knie Richtung Boden'] },
  splitsquat: { view: 'Seite', props: [{ t: 'box', x: 176, y: 206, w: 46, h: 20 }, { t: 'dumbbell', at: 'w' }], poses: [
    { k: [150, 32], n: [150, 50], s: [150, 56], e: [150, 94], w: [152, 130], h: [150, 128], kn: [180, 166], a: [198, 206], kn2: [138, 174], a2: [116, 222] },
    { k: [150, 74], n: [150, 92], s: [150, 98], e: [150, 136], w: [152, 172], h: [150, 170], kn: [196, 164], a: [198, 206], kn2: [126, 214], a2: [96, 222] }],
    hints: ['Vorderer Fuß auf der Stufe', 'Hinteres Knie Richtung Boden · Oberkörper aufrecht'] },
  dips: { view: 'Seite', props: [{ t: 'dipbars', y: 110 }], poses: [
    { k: [152, 36], n: [150, 54], s: [150, 70], e: [149, 90], w: [150, 110], h: [150, 140], kn: [160, 174], a: [138, 192] },
    { k: [168, 80], n: [163, 96], s: [160, 104], e: [128, 106], w: [150, 110], h: [152, 170], kn: [162, 204], a: [140, 218] }],
    hints: ['Arme gestreckt · Schultern tief', 'Absenken bis Ellbogen ca. 90°'] },
  plank: { view: 'Seite', speed: 0.5, poses: [
    { k: [240, 182], n: [226, 190], s: [218, 192], e: [218, 222], w: [246, 222], h: [140, 200], kn: [96, 210], a: [50, 222] },
    { k: [240, 181], n: [226, 189], s: [218, 191], e: [218, 222], w: [246, 222], h: [140, 197], kn: [96, 209], a: [50, 222] }],
    hints: ['Linie Ferse–Schulter · Bauch fest', 'Halten · ruhig weiteratmen'] },
  burpee: { view: 'Seite', vb: '0 -14 300 254', poses: [
    st(),
    { k: [176, 120], n: [166, 134], s: [160, 140], e: [172, 180], w: [180, 220], h: [128, 170], kn: [160, 178], a: [140, 222] },
    { k: [240, 128], n: [226, 136], s: [218, 140], e: [218, 182], w: [218, 222], h: [140, 178], kn: [96, 200], a: [50, 222] },
    { k: [150, 18], n: [150, 36], s: [150, 42], e: [156, 16], w: [160, -6], h: [150, 114], kn: [152, 158], a: [150, 200] }],
    hints: ['Stand', 'Hocke · Hände auf den Boden', 'Beine zurück · Liegestütz', 'Strecksprung'] },
  wade: { view: 'Seite', props: [{ t: 'box', x: 112, y: 212, w: 78, h: 14 }, { t: 'dumbbell', at: 'w' }], poses: [
    { k: [150, 30], n: [150, 48], s: [150, 54], e: [150, 92], w: [152, 128], h: [150, 126], kn: [152, 170], a: [150, 212] },
    { k: [150, 18], n: [150, 36], s: [150, 42], e: [150, 80], w: [152, 116], h: [150, 114], kn: [152, 158], a: [150, 200] }],
    hints: ['Fersen tief unter die Stufe', 'Auf die Zehenspitzen drücken'] },
  bridge: { view: 'Seite', poses: [
    { k: [52, 210], n: [66, 214], s: [74, 214], e: [98, 218], w: [122, 220], h: [140, 214], kn: [180, 180], a: [200, 222], kn2: [182, 196], a2: [224, 182] },
    { k: [52, 210], n: [66, 214], s: [74, 214], e: [98, 218], w: [122, 220], h: [134, 186], kn: [182, 168], a: [200, 222], kn2: [180, 170], a2: [226, 154] }],
    hints: ['Rückenlage · ein Bein gestreckt', 'Hüfte hoch · Linie Knie–Schulter · 2 s halten'] },
  bizeps: { view: 'Seite', props: [{ t: 'dumbbell', at: 'w' }], poses: [
    st({ e: [150, 102], w: [154, 138] }), st({ e: [152, 100], w: [172, 74] })],
    hints: ['Arme gestreckt', 'Beugen · Ellbogen bleibt am Körper'] },
  trizeps: { view: 'Seite', props: [{ t: 'cable', from: [206, 0], to: 'w' }, { t: 'handle', at: 'w' }], poses: [
    st({ k: [158, 40], n: [155, 58], s: [154, 64], e: [146, 100], w: [170, 82] }), st({ k: [158, 40], n: [155, 58], s: [154, 64], e: [146, 100], w: [164, 136] })],
    hints: ['Oberarme fest am Körper', 'Nur die Unterarme strecken'] },
  hyperextension: { view: 'Seite', props: [{ t: 'hypbench' }], poses: [
    { k: [110, 206], n: [118, 196], s: [124, 186], e: [138, 180], w: [126, 172], h: [150, 120], kn: [188, 140], a: [226, 160] },
    { k: [70, 76], n: [82, 82], s: [88, 86], e: [102, 96], w: [96, 86], h: [150, 120], kn: [188, 140], a: [226, 160] }],
    hints: ['Langsam ablassen', 'Aufrichten bis zur Linie · nicht überstrecken'] },
  butterfly: { view: 'Vorn', props: [{ t: 'seat', x1: 112, x2: 188, y: 158 }, { t: 'handles' }], poses: [
    { k: [150, 60], n: [150, 78], sL: [128, 84], sR: [172, 84], eL: [98, 96], eR: [202, 96], wL: [78, 110], wR: [222, 110], hL: [138, 156], hR: [162, 156], kL: [132, 178], kR: [168, 178], aL: [128, 222], aR: [172, 222] },
    { k: [150, 60], n: [150, 78], sL: [128, 84], sR: [172, 84], eL: [118, 104], eR: [182, 104], wL: [142, 108], wR: [158, 108], hL: [138, 156], hR: [162, 156], kL: [132, 178], kR: [168, 178], aL: [128, 222], aR: [172, 222] }],
    hints: ['Arme geöffnet · Ellbogen leicht gebeugt', 'Vor der Brust zusammenführen'] },
  farmers: { view: 'Seite', speed: 1.4, props: [{ t: 'dumbbell', at: 'w', big: true }], poses: [
    st({ kn: [164, 180], a: [172, 222], kn2: [140, 182], a2: [124, 222] }),
    st({ kn: [140, 182], a: [126, 222], kn2: [164, 180], a2: [172, 222] })],
    hints: ['Aufrecht · Schultern unten', 'Zügig gehen · Griff fest'] },
  tischrudern: { view: 'Seite', props: [{ t: 'table', y: 100, x1: 118, x2: 282 }], poses: [
    { k: [150, 166], n: [140, 168], s: [130, 170], e: [130, 138], w: [130, 104], h: [86, 195], kn: [62, 209], a: [40, 222] },
    { k: [152, 112], n: [142, 118], s: [132, 124], e: [108, 130], w: [130, 104], h: [86, 173], kn: [62, 198], a: [40, 222] }],
    hints: ['Körper gerade · Arme gestreckt', 'Brust zur Tischkante ziehen'] },
  kickbox: { view: 'Seite', poses: [
    st({ k: [150, 36], n: [150, 52], s: [150, 58], e: [170, 78], w: [170, 52], e2: [164, 84], w2: [160, 58], h: [150, 124], kn: [170, 168], a: [178, 222], kn2: [136, 168], a2: [124, 222] }),
    st({ k: [150, 36], n: [150, 52], s: [150, 58], e: [190, 58], w: [222, 54], e2: [164, 84], w2: [160, 58], h: [150, 124], kn: [170, 168], a: [178, 222], kn2: [136, 168], a2: [124, 222] })],
    hints: ['Deckung oben · Kinn runter', 'Jab · sofort zurück in die Deckung'] },
};
// Varianten mit Rucksack statt Hantel (gleiche Bewegung, anderes Gewicht)
FIGS.kniebeuge_rucksack = { ...FIGS.kniebeuge, props: [{ t: 'backpack' }], poses: FIGS.kniebeuge.poses.map((p) => ({ ...p, e: [p.s[0] + 12, p.s[1] + 30], w: [p.s[0] + 4, p.s[1] + 8] })), hints: ['Rucksack eng auf dem Rücken', 'Oberschenkel waagerecht · Fersen am Boden'] };
FIGS.kreuzheben_rucksack = { ...FIGS.kreuzheben, props: [{ t: 'bag', at: 'w' }], hints: ['Rucksack an den Griffen · Rücken gerade', 'Hüfte strecken'] };
FIGS.rudern_rucksack = { ...FIGS.rudern, props: [{ t: 'bag', at: 'w' }], hints: ['45° vorgebeugt · Rucksack hängt', 'Rucksack zum Bauchnabel ziehen'] };
FIGS.schulter_rucksack = { ...FIGS.schulterdruecken, props: [{ t: 'bagOver' }], hints: ['Rucksack vor den Schultern', 'Über Kopf strecken · kein Hohlkreuz'] };
FIGS.curl_rucksack = { ...FIGS.bizeps, props: [{ t: 'jug', at: 'w' }], hints: ['Kanister/Rucksack in der Hand', 'Beugen · Ellbogen am Körper'] };

// ---------- Darstellung ----------
const FAR = [7, -4];
const SIDE_FAR = { s2: 's', e2: 'e', w2: 'w', h2: 'h', kn2: 'kn', a2: 'a' };
function complete(p, view) {
  if (view !== 'Seite') return p;
  const q = { ...p };
  for (const [k, from] of Object.entries(SIDE_FAR)) if (!q[k]) q[k] = [p[from][0] + FAR[0], p[from][1] + FAR[1]];
  return q;
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// Halten an den Endpunkten, dazwischen weiche Bewegung (smootherstep)
const smooth = (t) => { const x = Math.max(0, Math.min(1, (t - 0.18) / 0.64)); return x * x * x * (x * (x * 6 - 15) + 10); };

const line = (cls, extra = {}) => s('line', { class: cls, ...extra });
const set = (el, a, b) => { el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]); el.setAttribute('x2', b[0]); el.setAttribute('y2', b[1]); };

function staticProp(pr) {
  switch (pr.t) {
    case 'bench': return s('g', {}, s('rect', { x: pr.x1, y: pr.y, width: pr.x2 - pr.x1, height: 10, fill: C.olive, stroke: C.gear, 'stroke-width': 2 }), s('line', { x1: pr.x1 + 20, x2: pr.x1 + 20, y1: pr.y + 10, y2: G, stroke: C.gear, 'stroke-width': 5 }), s('line', { x1: pr.x2 - 20, x2: pr.x2 - 20, y1: pr.y + 10, y2: G, stroke: C.gear, 'stroke-width': 5 }));
    case 'pullbar': return s('g', {}, s('line', { x1: 50, x2: 250, y1: pr.y, y2: pr.y, stroke: C.gear, 'stroke-width': 7, 'stroke-linecap': 'round' }), s('line', { x1: 50, x2: 50, y1: pr.y, y2: 246, stroke: C.ground, 'stroke-width': 6 }), s('line', { x1: 250, x2: 250, y1: pr.y, y2: 246, stroke: C.ground, 'stroke-width': 6 }));
    case 'box': return s('rect', { x: pr.x, y: pr.y, width: pr.w, height: pr.h, fill: C.olive, stroke: C.gear, 'stroke-width': 2 });
    case 'dipbars': return s('g', {}, s('line', { x1: 112, x2: 204, y1: pr.y, y2: pr.y, stroke: C.gear, 'stroke-width': 7, 'stroke-linecap': 'round' }), s('line', { x1: 196, x2: 196, y1: pr.y, y2: G, stroke: C.ground, 'stroke-width': 6 }), s('line', { x1: 120, x2: 120, y1: pr.y, y2: G, stroke: C.ground, 'stroke-width': 6 }));
    case 'table': return s('g', {}, s('rect', { x: pr.x1, y: pr.y - 8, width: pr.x2 - pr.x1, height: 8, fill: C.olive, stroke: C.gear, 'stroke-width': 2 }), s('line', { x1: pr.x2 - 12, x2: pr.x2 - 12, y1: pr.y, y2: G, stroke: C.gear, 'stroke-width': 5 }), s('line', { x1: pr.x1 + 70, x2: pr.x1 + 70, y1: pr.y, y2: G, stroke: C.gear, 'stroke-width': 5 }));
    case 'seat': return s('g', {}, s('rect', { x: pr.x1, y: pr.y, width: pr.x2 - pr.x1, height: 12, fill: C.olive, stroke: C.gear, 'stroke-width': 2 }), s('line', { x1: 150, x2: 150, y1: pr.y + 12, y2: G, stroke: C.gear, 'stroke-width': 6 }));
    case 'hypbench': return s('g', {}, s('rect', { x: 136, y: 124, width: 30, height: 14, rx: 4, fill: C.olive, stroke: C.gear, 'stroke-width': 2 }), s('line', { x1: 150, x2: 150, y1: 138, y2: G, stroke: C.gear, 'stroke-width': 6 }), s('line', { x1: 150, x2: 236, y1: 200, y2: 168, stroke: C.gear, 'stroke-width': 5 }), s('circle', { cx: 230, cy: 168, r: 6, fill: C.olive, stroke: C.gear, 'stroke-width': 2 }), s('line', { x1: 236, x2: 236, y1: 168, y2: G, stroke: C.gear, 'stroke-width': 5 }));
    default: return null;
  }
}

function dynamicProp(pr) {
  const g = s('g', {});
  switch (pr.t) {
    case 'plate': { // Langhantel von der Seite: man sieht die Hantelscheibe
      const p = s('circle', { r: 23, fill: C.plate, stroke: C.sand, 'stroke-width': 4 }), hub = s('circle', { r: 5, fill: C.sand });
      g.append(p, hub);
      return { g, front: false, up: (q) => { const c = q[pr.at] || q.w; for (const el of [p, hub]) { el.setAttribute('cx', c[0]); el.setAttribute('cy', c[1]); } } };
    }
    case 'dumbbell': {
      const r = pr.big ? 11 : 9;
      const near = s('circle', { r, fill: C.plate, stroke: C.sand, 'stroke-width': 3 }), far = s('circle', { r: r - 2, fill: C.plate, stroke: C.far, 'stroke-width': 2 });
      g.append(far, near);
      return { g, front: true, up: (q) => { near.setAttribute('cx', q.w[0]); near.setAttribute('cy', q.w[1] + 2); if (q.w2) { far.setAttribute('cx', q.w2[0]); far.setAttribute('cy', q.w2[1] + 2); } } };
    }
    case 'barFront': { // Langhantel von vorn/hinten mit Scheiben
      const bar = line('', { stroke: C.bone, 'stroke-width': 6, 'stroke-linecap': 'round' });
      const pl = pr.plates ? [0, 1].map(() => s('rect', { width: 11, height: 50, rx: 2, fill: C.plate, stroke: C.sand, 'stroke-width': 3 })) : [];
      g.append(bar, ...pl);
      return { g, front: true, up: (q) => { const y = (q.wL[1] + q.wR[1]) / 2, x1 = q.wL[0] - (pr.plates ? 44 : 14), x2 = q.wR[0] + (pr.plates ? 44 : 14); set(bar, [x1, y], [x2, y]); if (pl.length) { pl[0].setAttribute('x', x1 + 4); pl[0].setAttribute('y', y - 25); pl[1].setAttribute('x', x2 - 15); pl[1].setAttribute('y', y - 25); } } };
    }
    case 'handles': {
      const a = s('rect', { width: 8, height: 26, rx: 3, fill: C.sand }), b = s('rect', { width: 8, height: 26, rx: 3, fill: C.sand });
      g.append(a, b);
      return { g, front: true, up: (q) => { a.setAttribute('x', q.wL[0] - 4); a.setAttribute('y', q.wL[1] - 13); b.setAttribute('x', q.wR[0] - 4); b.setAttribute('y', q.wR[1] - 13); } };
    }
    case 'cable': {
      const c = line('', { stroke: C.gear, 'stroke-width': 2 }), pul = s('circle', { cx: pr.from[0], cy: pr.from[1] + 6, r: 7, fill: 'none', stroke: C.gear, 'stroke-width': 3 });
      g.append(c, pul);
      return { g, up: (q) => { const to = pr.toMid ? [(q.wL[0] + q.wR[0]) / 2, (q.wL[1] + q.wR[1]) / 2] : q[pr.to]; set(c, [pr.from[0], pr.from[1] + 6], to); } };
    }
    case 'handle': {
      const hd = line('', { stroke: C.sand, 'stroke-width': 6, 'stroke-linecap': 'round' });
      g.append(hd);
      return { g, front: true, up: (q) => set(hd, [q.w[0] - 8, q.w[1] + 2], [q.w[0] + 8, q.w[1] + 2]) };
    }
    case 'backpack': {
      const pk = s('polygon', { fill: C.olive, stroke: C.sand, 'stroke-width': 3 });
      g.append(pk);
      return { g, up: (q) => {
        const v = [q.s[0] - q.h[0], q.s[1] - q.h[1]], L = Math.hypot(...v), u = [v[0] / L, v[1] / L], nrm = [-u[1], u[0]];
        const side = nrm[0] < 0 ? nrm : [-nrm[0], -nrm[1]]; // Rücken = Seite entgegen der Blickrichtung
        const pt = (t, d) => `${q.h[0] + v[0] * t + side[0] * d},${q.h[1] + v[1] * t + side[1] * d}`;
        pk.setAttribute('points', [pt(0.15, 6), pt(0.95, 6), pt(0.95, 34), pt(0.15, 34)].join(' '));
      } };
    }
    case 'bag': {
      const b = s('rect', { width: 40, height: 34, rx: 6, fill: C.olive, stroke: C.sand, 'stroke-width': 3 });
      g.append(b);
      return { g, front: true, up: (q) => { b.setAttribute('x', q.w[0] - 20); b.setAttribute('y', q.w[1] - 2); } };
    }
    case 'bagOver': {
      const b = s('rect', { height: 34, rx: 6, fill: C.olive, stroke: C.sand, 'stroke-width': 3 });
      g.append(b);
      return { g, front: true, up: (q) => { b.setAttribute('x', q.wL[0] - 8); b.setAttribute('width', q.wR[0] - q.wL[0] + 16); b.setAttribute('y', q.wL[1] - 30); } };
    }
    case 'jug': {
      const b = s('rect', { width: 20, height: 28, rx: 3, fill: C.olive, stroke: C.sand, 'stroke-width': 3 });
      g.append(b);
      return { g, front: true, up: (q) => { b.setAttribute('x', q.w[0] - 10); b.setAttribute('y', q.w[1] - 4); } };
    }
    case 'lats': { // Breiter Rückenmuskel: wird beim Hochziehen sichtbar dicker, Schulterblätter rücken zusammen
      const l = s('polygon', { fill: '#8a9a4a55', stroke: C.joint, 'stroke-width': 2 }), r = s('polygon', { fill: '#8a9a4a55', stroke: C.joint, 'stroke-width': 2 });
      const scL = line('', { stroke: C.joint, 'stroke-width': 3 }), scR = line('', { stroke: C.joint, 'stroke-width': 3 });
      g.append(l, r, scL, scR);
      return { g, front: true, up: (q, prog) => {
        const w = 4 + 10 * prog;
        l.setAttribute('points', `${q.sL[0] + 2},${q.sL[1] + 8} ${q.sL[0] - w},${q.sL[1] + 30} ${q.hL[0] + 2},${q.hL[1] - 10}`);
        r.setAttribute('points', `${q.sR[0] - 2},${q.sR[1] + 8} ${q.sR[0] + w},${q.sR[1] + 30} ${q.hR[0] - 2},${q.hR[1] - 10}`);
        const c = 14 - 6 * prog;
        set(scL, [150 - c - 4, q.sL[1] + 6], [150 - c, q.sL[1] + 30]); set(scR, [150 + c + 4, q.sR[1] + 6], [150 + c, q.sR[1] + 30]);
      } };
    }
    default: return null;
  }
}

// Gemeinsame Animationsschleife; es bewegen sich nur sichtbare Figuren.
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
  const view = def.view || 'Seite';
  const poses = def.poses.map((p) => complete(p, view));
  const vb = def.vb || '0 0 300 240';
  const [vx, vy, vw, vh] = vb.split(' ').map(Number);
  const svg = s('svg', { class: 'fig' + (thumb ? ' thumb' : ''), viewBox: vb, role: 'img', 'aria-label': `Bewegungsablauf, Ansicht ${view.toLowerCase()}` });
  svg.append(s('rect', { x: vx, y: vy, width: vw, height: vh, fill: C.bg }));
  if (!def.noGround) svg.append(s('line', { x1: vx, x2: vx + vw, y1: G + 2, y2: G + 2, stroke: C.ground, 'stroke-width': 4 }));
  for (const pr of def.props || []) { const el = staticProp(pr); if (el) svg.append(el); }
  const dyn = (def.props || []).map(dynamicProp).filter(Boolean);
  for (const d of dyn) if (!d.front) svg.append(d.g);

  let parts;
  if (view === 'Seite') {
    parts = { far: [0, 1, 2, 3].map(() => line('bone far')), torso: line('bone torso'), neck: line('bone'), near: [0, 1, 2, 3].map(() => line('bone')) };
    svg.append(...parts.far, parts.torso, parts.neck);
  } else {
    parts = { torso: s('polygon', { class: 'torso-poly' }), neck: line('bone'), limbs: Array.from({ length: 8 }, () => line('bone')) };
    svg.append(parts.torso, parts.neck);
  }
  const head = s('circle', { class: 'head', r: 15 });
  const joints = thumb ? [] : Array.from({ length: view === 'Seite' ? 3 : 4 }, () => s('circle', { class: 'joint', r: 4.5 }));
  svg.append(head, ...(view === 'Seite' ? parts.near : parts.limbs), ...joints);
  for (const d of dyn) if (d.front) svg.append(d.g);
  const hint = thumb ? null : s('text', { class: 'hint', x: vx + 10, y: vy + 20 });
  if (hint) svg.append(hint, s('text', { class: 'viewtag', x: vx + vw - 10, y: vy + vh - 10, 'text-anchor': 'end' }, `ANSICHT ${view.toUpperCase()}`));

  const n = poses.length;
  const dur = 1700 / ((def.speed || 1) * speed); // ms pro Bewegung
  let t0 = null;
  const draw = (ts) => {
    t0 = t0 ?? ts;
    const cyc = reduce ? 0.5 : (ts - t0) / dur;
    const seg = Math.floor(cyc) % n, e = smooth(cyc % 1);
    const A = poses[seg], Bp = poses[(seg + 1) % n];
    const q = {}; for (const k of Object.keys(A)) if (Bp[k]) q[k] = lerp(A[k], Bp[k], e);
    const prog = n === 2 ? (seg === 0 ? e : 1 - e) : 0.5; // 0 = Start, 1 = Arbeitsposition
    if (view === 'Seite') {
      set(parts.far[0], q.s2, q.e2); set(parts.far[1], q.e2, q.w2); set(parts.far[2], q.h2, q.kn2); set(parts.far[3], q.kn2, q.a2);
      set(parts.torso, q.s, q.h); set(parts.neck, q.k, q.n);
      set(parts.near[0], q.s, q.e); set(parts.near[1], q.e, q.w); set(parts.near[2], q.h, q.kn); set(parts.near[3], q.kn, q.a);
      [q.e, q.kn, q.h].forEach((p, i) => { if (joints[i]) { joints[i].setAttribute('cx', p[0]); joints[i].setAttribute('cy', p[1]); } });
    } else {
      parts.torso.setAttribute('points', [q.sL, q.sR, q.hR, q.hL].map((p) => p.join(',')).join(' '));
      set(parts.neck, q.k, q.n);
      const L = parts.limbs;
      set(L[0], q.sL, q.eL); set(L[1], q.eL, q.wL); set(L[2], q.sR, q.eR); set(L[3], q.eR, q.wR);
      set(L[4], q.hL, q.kL); set(L[5], q.kL, q.aL); set(L[6], q.hR, q.kR); set(L[7], q.kR, q.aR);
      [q.eL, q.eR, q.kL, q.kR].forEach((p, i) => { if (joints[i]) { joints[i].setAttribute('cx', p[0]); joints[i].setAttribute('cy', p[1]); } });
    }
    head.setAttribute('cx', q.k[0]); head.setAttribute('cy', q.k[1]);
    for (const d of dyn) d.up(q, prog);
    if (hint) hint.textContent = (def.hints[e > 0.5 ? (seg + 1) % n : seg] || '').toUpperCase();
  };
  const fig = { svg, draw, visible: undefined, started: false };
  svg.__fig = fig;
  draw(0); // erste Pose sofort zeichnen
  if (!reduce) { live.add(fig); io?.observe(svg); kick(); }
  return svg;
}

// Platzhalter, solange es für eine Übung noch keine Animation gibt
function placeholder(thumb) {
  return s('svg', { class: 'fig placeholder' + (thumb ? ' thumb' : ''), viewBox: '0 0 300 240', role: 'img', 'aria-label': 'Animation folgt' },
    s('rect', { x: 0, y: 0, width: 300, height: 240, fill: C.bg }),
    s('rect', { x: 20, y: 20, width: 260, height: 200, fill: 'none', stroke: '#3a3f2a', 'stroke-dasharray': '6 6' }),
    s('circle', { cx: 150, cy: 80, r: 16, fill: 'none', stroke: '#7f8a5a', 'stroke-width': 4 }),
    s('line', { x1: 150, y1: 96, x2: 150, y2: 150, stroke: '#7f8a5a', 'stroke-width': 6 }),
    s('text', { x: 150, y: 196, 'text-anchor': 'middle', style: 'font:16px var(--mono);fill:#7f8a5a' }, 'ANIMATION FOLGT'));
}
