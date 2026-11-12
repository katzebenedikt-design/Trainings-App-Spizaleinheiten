// Schmerzen aus dem Körperbild → Plan: belastende Übungen raus, sanfte Übungen rein, Warnzeichen → Pause + Arzt/Physio.
import { REGIONEN, WARNUNG } from '../data/koerper.js';
import { exById } from '../data/exercises.js';
import { daysBetween } from './util.js';

export const painLabel = (p) => REGIONEN[p.typ].name + (p.seite === 'l' ? ' links' : p.seite === 'r' ? ' rechts' : '');
const ort = (p) => p.typ + ':' + (p.seite || '');

// Aktive Schmerzen am Datum: je Stelle der neueste Eintrag, der nicht als abgeklungen markiert ist
export function aktiveSchmerzen(st, date) {
  const byOrt = new Map();
  for (const p of (st.pain || []).filter((x) => x.date <= date).sort((a, b) => (a.date + (a.ts || '') < b.date + (b.ts || '') ? -1 : 1))) byOrt.set(ort(p), p);
  return [...byOrt.values()].filter((p) => !p.erledigt && daysBetween(p.date, date) <= 21);
}

// Warnzeichen je aktivem Schmerz (keine Diagnose)
export function warnzeichen(st, p, date) {
  const out = [];
  if (p.staerke >= WARNUNG.staerkeAb) out.push(`starke Schmerzen (${p.staerke}/10)`);
  if (WARNUNG.arten.includes(p.art)) out.push(`${p.art}er Schmerz`);
  if (p.schwellung) out.push('Schwellung');
  if (p.taubheit) out.push('Taubheit/Kribbeln');
  const erster = (st.pain || []).filter((x) => ort(x) === ort(p) && x.date <= date).reduce((a, x) => (x.date < a ? x.date : a), p.date);
  if (daysBetween(erster, date) > WARNUNG.laengerAlsTage) out.push(`seit über ${WARNUNG.laengerAlsTage} Tagen`);
  return out;
}

function rehaSession(aktiv) {
  const lines = []; const seen = new Set();
  for (const p of aktiv) {
    if (seen.has(p.typ)) continue; seen.add(p.typ);
    const r = REGIONEN[p.typ].reha;
    lines.push(`${painLabel(p)}: ${[...r.mobil, ...r.dehnen, ...r.kraeftigen].join(' · ')}`);
  }
  return { code: 'REHA', title: 'Reha-Block: ' + aktiv.map(painLabel).join(', '), sub: 'Mobilisieren · Dehnen · Kräftigen · 10–15 min · nur schmerzfrei', min: 15, light: true,
    blocks: [{ kind: 'main', title: 'Sanft und schmerzfrei', lines: [...lines, 'Nur im schmerzfreien Bereich. Wird es schlimmer: abbrechen.'] }] };
}

export function applyPain(sessions, st, date, build) {
  const aktiv = aktiveSchmerzen(st, date);
  if (!aktiv.length) return { sessions, notes: [], pause: false, aktiv };
  const warn = aktiv.map((p) => ({ p, w: warnzeichen(st, p, date) })).filter((x) => x.w.length);
  if (warn.length) {
    return { pause: true, aktiv, warn, notes: [`Warnzeichen (${warn.map((x) => `${painLabel(x.p)}: ${x.w.join(', ')}`).join('; ')}) → heute kein Training.`],
      sessions: [{ code: 'REST', title: 'Schmerz: Pause', sub: 'Nicht weitertrainieren – Arzt oder Physio', min: 0, rest: true, schon: true, doctor: true,
        blocks: [{ kind: 'main', title: 'Sicherheit zuerst', lines: [WARNUNG.text, 'Spazierengehen ist in Ordnung, wenn es nicht wehtut.', 'Sobald es besser ist: im Körperbild als „abgeklungen“ markieren.'] }] }] };
  }
  const ex = new Set(aktiv.flatMap((p) => REGIONEN[p.typ].uebungen));
  const ohne = {}; for (const p of aktiv) for (const [k, v] of Object.entries(REGIONEN[p.typ].ohne)) if (ohne[k] !== true) ohne[k] = v;
  const wo = aktiv.map(painLabel).join(', ');
  const notes = [];
  const alt = (s, warum) => { notes.push(`${s.title} → schonende Ausdauer (${warum})`); return { ...build('ALTCARDIO'), min: s.min || 30, sub: `statt ${s.title} · ${s.min || 30} min · ${warum}` }; };
  let out = sessions.map((s) => {
    if (s.rest || s.code === 'REHA') return s;
    if (s.code === 'KICKBOX' && ohne.kickbox) { notes.push(`Kickboxen nur Technik (${wo})`); return { ...s, title: s.title + ' (nur Technik)', sub: `Schmerz ${wo} · kein Sparring`, blocks: [{ kind: 'main', title: 'Schonen', lines: ['Hingehen, aber nur Technik ohne Belastung der Stelle.', 'Kein Sparring. Dem Trainer Bescheid sagen.'] }] }; }
    if (s.run && ohne.laufen === true) return alt(s, `Schmerz ${wo}`);
    if (s.ruck && ohne.marsch === true) return alt(s, `Schmerz ${wo}`);
    if (s.ruck && ohne.marsch === 'leicht' && s.code !== 'MT1') { notes.push(`${s.title} → leichter Marsch (${wo})`); return build('MT1'); }
    if (s.run && (ohne.laufen === 'locker' || ohne.sprint) && ['TB2', 'TB3', 'TB4', 'TESTLAUF'].includes(s.code)) { notes.push(`${s.title} → lockerer Lauf (${wo})`); return build('TB1'); }
    let t = s;
    if (s.swim && ohne.schwimmen) t = { ...t, blocks: [...t.blocks, { kind: 'main', title: 'Schmerz: ' + wo, lines: ['Nur locker schwimmen, nichts, was die Stelle reizt.'] }] };
    if (ohne.sprung) t = { ...t, blocks: t.blocks.filter((b) => !/Agilität/.test(b.title)) };
    if (t.blocks.some((b) => b.ex?.some((e) => ex.has(e.id)))) {
      const raus = [];
      t = { ...t, blocks: t.blocks.map((b) => (b.ex ? { ...b, ex: b.ex.filter((e) => (ex.has(e.id) ? (raus.push(exById(e.id)?.name || e.id), false) : true)), lines: [...(b.lines || [])] } : b)) };
      t.blocks.push({ kind: 'main', title: 'Vorübergehend ausgelassen', lines: [`${raus.join(', ')} – wegen Schmerz ${wo}.`] });
      notes.push(`${s.title}: ${raus.join(', ')} ausgelassen (${wo})`);
    }
    return t;
  });
  out = [rehaSession(aktiv), ...out];
  return { sessions: out, notes, pause: false, aktiv };
}
