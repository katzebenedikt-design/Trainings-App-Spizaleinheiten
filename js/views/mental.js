// Bereich Mental: Box-Atmung, vorgelesene Texte, Minispiele, Mein Warum + Checkliste.
import { h, card, modal, seg, toast, lineChart, iconBtn, confirmBox } from '../ui.js';
import { speak, speakScript, stopSpeaking, beep, vibrate, ttsAvailable } from '../core/speech.js';
import { TEXTE, CHECKLISTE } from '../data/mental.js';
import { iso, fmtDate, weekday, sortByDate } from '../core/util.js';
import { GAMES, runGame } from './games.js';
import { uid } from '../core/store.js';

export const mentalTabs = [
  { key: 'atmung', label: 'Atmung', render: renderAtmung },
  { key: 'texte', label: 'Texte', render: renderTexte },
  { key: 'spiele', label: 'Spiele', render: renderSpiele },
  { key: 'warum', label: 'Warum', render: renderWarum },
];

function renderAtmung(el, app) {
  const st = app.state;
  let sec = 4, mins = 5;
  el.append(h('div', { class: 'k mt' }, '[ BOX-ATMUNG ]'), h('p', { class: 'small dim' }, 'Einatmen – Halten – Ausatmen – Halten. Senkt den Puls und bringt Ruhe in Stresslagen. Mit Sprachansage.'),
    h('div', { class: 'm mt' }, 'SEKUNDEN PRO SEITE'), seg([[4, '4 s'], [5, '5 s'], [6, '6 s']], sec, (v) => { sec = v; }),
    h('div', { class: 'm mt' }, 'DAUER'), seg([[2, '2 min'], [5, '5 min'], [10, '10 min']], mins, (v) => { mins = v; }),
    h('button', { class: 'btn f mt2', onclick: () => boxBreathing(app, sec, mins) }, '> Start'));
  const log = st.mental.breath;
  el.append(card(h('div', { class: 'k' }, '[ PROTOKOLL ]'), h('p', { class: 'm' }, `${log.length} Einheiten · ${Math.round(log.reduce((a, b) => a + (b.min || 0), 0))} Minuten gesamt`),
    log.length ? h('div', { class: 'm' }, 'Zuletzt: ' + log.slice(-5).reverse().map((b) => fmtDate(b.date)).join(' · ')) : null));
}

function boxBreathing(app, sec, mins) {
  const phases = ['Einatmen', 'Halten', 'Ausatmen', 'Halten'];
  let raf = 0, alive = true, lastPhase = -1, lock = null;
  const t0 = performance.now(); const total = mins * 60 * 1000;
  const m = modal(({ close }) => {
    const dot = h('div', { class: 'dot' }); const lbl = h('div', { class: 'lbl' }); const rest = h('div', { class: 'm center' });
    const box = h('div', { class: 'breath' }, h('div', { class: 'sq' }), dot, lbl);
    const frame = (t) => {
      if (!alive) return;
      const el = t - t0;
      if (el >= total) {
        alive = false; speak('Gut gemacht. Übung beendet.');
        app.state.mental.breath.push({ date: iso(), min: mins, sec });
        lbl.replaceChildren(h('div', {}, h('h2', {}, 'Fertig'), h('div', { class: 'm' }, `${mins} MINUTEN`)));
        app.award(10, 'mental', 'Atmung abgeschlossen.');
        return;
      }
      const cyc = (el / 1000) % (sec * 4); const ph = Math.floor(cyc / sec); const f = (cyc % sec) / sec;
      const S = 240; const pos = [[0, S - f * S], [f * S, 0], [S, f * S], [S - f * S, S]][ph];
      dot.style.left = pos[0] + 'px'; dot.style.top = pos[1] + 'px';
      if (ph !== lastPhase) {
        lastPhase = ph; vibrate(40);
        lbl.replaceChildren(h('div', {}, h('h2', { class: ph === 0 ? 'sand' : ph === 2 ? 'olive' : '' }, phases[ph]), h('div', { class: 'big' }, '')));
        if (app.state.settings.voice !== false) speak(phases[ph], { rate: 0.9 });
      }
      lbl.querySelector('.big').textContent = String(sec - Math.floor(cyc % sec));
      rest.textContent = `NOCH ${Math.ceil((total - el) / 60000)} MIN`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return h('div', {}, h('div', { class: 'k' }, `[ BOX-ATMUNG ${sec}-${sec}-${sec}-${sec} ]`), box, rest, h('button', { class: 'btn', onclick: close }, 'Beenden'));
  }, { full: true });
  navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
  m.onClose(() => { alive = false; cancelAnimationFrame(raf); stopSpeaking(); try { lock?.release(); } catch { /* egal */ } });
}

function renderTexte(el, app) {
  if (!ttsAvailable()) el.append(h('div', { class: 'card warnc' }, 'Sprachausgabe nicht verfügbar. Die Texte können trotzdem gelesen werden.'));
  for (const cat of ['Entspannung', 'Szenario']) {
    el.append(h('div', { class: 'k mt2' }, cat === 'Szenario' ? '[ SZENARIEN AUS DEM AUSWAHLVERFAHREN ]' : '[ ENTSPANNUNG ]'));
    for (const t of TEXTE.filter((x) => x.cat === cat)) {
      const n = app.state.mental.reads.filter((r) => r.id === t.id).length;
      el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => playText(app, t) },
        h('div', { class: 'row between' }, h('b', {}, t.title), h('span', { class: 'm' }, `${t.min} MIN${n ? ' · ' + n + '×' : ''}`))));
    }
  }
}

function playText(app, t) {
  let cancelled = false;
  const m = modal(({ close }) => {
    const lines = t.parts.map((p) => (typeof p === 'number' ? h('span', {}) : h('p', { class: 'dim' }, p)));
    const btn = h('button', { class: 'btn f' }, '> Vorlesen');
    btn.onclick = async () => {
      btn.disabled = true; cancelled = false;
      await speakScript(t.parts, { rate: 0.85, pitch: 0.95 }, () => cancelled, (i) => { lines.forEach((l, j) => { l.className = j === i ? 'sand' : 'dim'; }); if (lines[i].scrollIntoView) lines[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); });
      if (!cancelled) { app.state.mental.reads.push({ id: t.id, date: iso() }); app.award(10, 'mental', 'Text abgeschlossen.'); }
      btn.disabled = false;
    };
    return h('div', {}, h('div', { class: 'k' }, `[ ${t.cat.toUpperCase()} · ${t.min} MIN ]`), h('h1', {}, t.title), btn,
      h('button', { class: 'btn', onclick: () => { cancelled = true; stopSpeaking(); } }, 'Stopp'), h('div', { class: 'mt' }, ...lines));
  }, { full: true });
  m.onClose(() => { cancelled = true; stopSpeaking(); });
}

function renderSpiele(el, app) {
  const st = app.state;
  const g = st.mental.games;
  let load = el.dataset.load === '1';
  el.append(h('div', { class: 'k mt' }, '[ KOPFTRAINING ]'), h('p', { class: 'small dim' }, 'Realistische Übungsaufgaben, keine echten Testaufgaben. Die Schwierigkeit passt sich an: Ziel sind 70–85 % Treffer.'),
    h('div', { class: 'm mt' }, 'BELASTUNGSMODUS (DIREKT NACH DEM SPORT)'), seg([['0', 'Aus'], ['1', 'An – nach Belastung']], load ? '1' : '0', (v) => { el.dataset.load = v; }));
  for (const [key, def] of Object.entries(GAMES)) {
    const s = g[key] || { level: 1, history: [] };
    const hist = (s.history || []).slice(-30);
    const c = h('div', { class: 'card' },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, def.name), h('div', { class: 'm' }, def.desc)), h('div', { class: 'center' }, h('div', { class: 'big', style: { fontSize: '30px' } }, s.level), h('div', { class: 'm' }, 'LEVEL'))),
      hist.length > 1 ? lineChart(hist.map((x) => ({ date: x.date, v: x.level, note: x.load ? 'Belastung' : '' })), { fmt: (v) => Math.round(v), height: 110 }) : null,
      h('button', { class: 'btn', onclick: () => runGame(app, key, el.dataset.load === '1') }, '> Spielen'));
    el.append(c);
  }
}

function renderWarum(el, app) {
  const st = app.state; const w = st.mental.why;
  const sunday = weekday(iso()) === 6;
  const ta = h('textarea', { placeholder: 'Warum willst du in die Spezialeinheit? Was gibst du dafür auf? Was sagst du dir bei Kilometer 17, wenn alles weh tut?' }, w.text || '');
  el.append(card(h('div', { class: 'k' }, '[ MEIN WARUM ]'),
    sunday ? h('p', { class: 'sand' }, 'Sonntag: Lies dein Warum laut. Passt es noch? Überarbeite es.') : h('p', { class: 'm' }, 'Jeden Sonntag lesen und überarbeiten. Es trägt dich durch die härtesten Momente.'),
    w.updated ? h('div', { class: 'm' }, 'Zuletzt überarbeitet: ' + fmtDate(w.updated)) : null,
    ta,
    h('div', { class: 'row mt' },
      h('button', { class: 'btn f', style: { margin: 0 }, onclick: () => {
        const txt = ta.value.trim(); if (!txt) return toast('Erst etwas schreiben.');
        if (w.text && w.text !== txt) { w.history.push({ date: w.updated, text: w.text }); if (w.history.length > 12) w.history.shift(); }
        const first = !w.updated || w.updated !== iso();
        w.text = txt; w.updated = iso();
        if (first) app.award(sunday ? 20 : 10, 'mental', 'Warum gespeichert.'); else { app.save(); toast('Gespeichert.'); }
        app.badges();
      } }, 'Speichern'),
      iconBtn('speaker', () => speak(ta.value, { rate: 0.9 }), 'Vorlesen')),
    w.history.length ? h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '10px' } }, `FRÜHERE FASSUNGEN (${w.history.length})`), ...[...w.history].reverse().map((v) => h('div', { class: 'mt' }, h('div', { class: 'm' }, fmtDate(v.date || iso())), h('p', { class: 'dim small' }, v.text)))) : null));

  if (!st.mental.checklist) st.mental.checklist = CHECKLISTE.map((t) => ({ id: uid(), text: t, done: false }));
  const list = st.mental.checklist;
  const ul = h('ul', { class: 'list' });
  for (const it of list) {
    ul.append(h('li', {}, h('button', { class: 'icon-btn ' + (it.done ? 'on' : ''), onclick: () => { it.done = !it.done; app.save(); app.refresh(); } }, it.done ? '✓' : ''),
      h('div', { class: 'grow ' + (it.done ? 'dim' : '') }, it.text),
      iconBtn('trash', async () => { if (await confirmBox('Punkt löschen?', 'Löschen')) { st.mental.checklist = list.filter((x) => x.id !== it.id); app.save(); app.refresh(); } }, 'Löschen')));
  }
  const add = h('input', { placeholder: 'Neuer Punkt …' });
  el.append(card(h('div', { class: 'k' }, `[ OFFENE PUNKTE ${list.filter((x) => x.done).length}/${list.length} ]`), ul,
    h('div', { class: 'row mt' }, add, h('button', { class: 'btn s', onclick: () => { if (!add.value.trim()) return; list.push({ id: uid(), text: add.value.trim(), done: false }); app.save(); app.refresh(); } }, '+'))));
}
