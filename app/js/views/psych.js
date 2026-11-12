// Psychologengespräch: mündlich üben (Frage wird vorgelesen, Antwort aufnehmen, selbst bewerten),
// schriftlich (Lebenslauf, Motivationsschreiben, Persönlichkeitsfragebögen) und Reflexionstagebuch.
import { h, card, modal, seg, toast, lineChart, download, confirmBox, field } from '../ui.js';
import { THEMEN, NACHFRAGEN, CHECK, LEBENSLAUF, MOTIVATION, FRAGEBOGEN, FRAGEBOGEN_INFO, STAR, BEISPIEL_THEMEN, MEHRTEILIG, AUFSATZ, AUFSATZ_CHECK } from '../data/psych.js';
import { pickQuestions, checkPct, weakestCriterion, fragebogenItems, fragebogenAuswerten, buildLetter, dailyPrompts, psychFuer, bogenStabilitaet, wortzahl } from '../core/psych.js';
import { speak, stopSpeaking, listen, sttAvailable, beep } from '../core/speech.js';
import { recAvailable, startRecording, saveAudio, loadAudio, deleteAudio, pruneIds } from '../core/recorder.js';
import { iso, fmtDate, pick } from '../core/util.js';
import { uid } from '../core/store.js';

export const KEEP_AUDIO = 30;
const MAX_SEC = 180;
const ps = (st) => {
  st.psych = st.psych || {};
  const p = st.psych;
  for (const [k, v] of Object.entries({ answers: [], topics: [], cv: {}, letter: {}, bogen: [], diary: [], beispiele: {}, aufsaetze: [] })) if (p[k] === undefined) p[k] = v;
  return p;
};
const fmtSec = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Diktieren in ein Textfeld (Spracherkennung, Deutsch)
function dictate(ta, onChange) {
  if (!sttAvailable()) return null;
  return h('button', { class: 'btn s', style: { width: 'auto' }, onclick: async (ev) => {
    const b = ev.currentTarget; b.disabled = true; b.textContent = 'ICH HÖRE ZU …';
    try { const [t] = await listen({ lang: 'de-DE', alternatives: 1 }); ta.value = (ta.value ? ta.value.trimEnd() + ' ' : '') + t; onChange?.(); } catch (e) { toast(e.message); }
    b.disabled = false; b.textContent = '🎙 Diktieren';
  } }, '🎙 Diktieren');
}

// ---------- Mündlich ----------
export function renderGespraech(el, app) {
  const st = app.state; const P = ps(st);
  let n = 5;
  el.append(h('div', { class: 'k mt' }, '[ PSYCHOLOGENGESPRÄCH · MÜNDLICH ]'),
    card(h('p', {}, 'Ziel: ehrlich und klar über dich sprechen. Keine auswendig gelernten Antworten – Psychologen erkennen sie und fragen so lange nach, bis du frei sprichst.'),
      h('ul', { class: 'plain small' }, h('li', {}, 'Die App liest eine Frage vor. Du antwortest laut, wie im echten Gespräch.'), h('li', {}, 'Deine Antwort wird aufgenommen. Hör sie dir an und bewerte dich mit der Checkliste.'), h('li', {}, 'Stichworte sind erlaubt, Sätze zum Aufsagen nicht. Merkst du, dass du auswendig sprichst: anders formulieren.'))),
    h('div', { class: 'm mt' }, 'THEMEN (ANTIPPEN ZUM AUSWÄHLEN, LEER = ALLE)'));
  const chips = h('div', { class: 'chips' });
  const drawChips = () => chips.replaceChildren(...Object.entries(THEMEN).map(([k, t]) => h('button', { class: 'chip ' + (P.topics.includes(k) ? 'on' : ''), onclick: () => { P.topics = P.topics.includes(k) ? P.topics.filter((x) => x !== k) : [...P.topics, k]; app.save(); drawChips(); } }, t.name)));
  drawChips();
  el.append(chips, h('div', { class: 'm mt' }, 'ANZAHL FRAGEN'), seg([[3, '3'], [5, '5'], [10, '10']], n, (v) => { n = v; }),
    h('button', { class: 'btn f mt', onclick: () => runInterview(app, pickQuestions(P.topics, n, P.answers)) }, '> Übung starten'),
    recAvailable() ? null : h('div', { class: 'card warnc small' }, 'Aufnahme in diesem Browser nicht verfügbar. Du kannst trotzdem üben und dich selbst bewerten.'));

  el.append(beispieleCard(app));
  const weak = weakestCriterion(P.answers);
  if (weak) el.append(card(h('div', { class: 'k' }, '[ DARAUF ACHTEST DU ALS NÄCHSTES ]'), h('b', {}, weak.t), h('p', { class: 'small dim' }, weak.d)));

  const days = {}; for (const a of P.answers) if (a.check) (days[a.date] = days[a.date] || []).push(checkPct(a.check));
  const pts = Object.entries(days).map(([date, v]) => ({ date, v: Math.round(v.reduce((x, y) => x + y, 0) / v.length) }));
  if (pts.length > 1) el.append(card(h('div', { class: 'm' }, 'SELBSTBEWERTUNG JE ÜBUNGSTAG (%)'), lineChart(pts, { fmt: (v) => v + ' %', height: 120 })));

  if (P.answers.length) {
    el.append(h('div', { class: 'k mt2' }, `[ DEINE ANTWORTEN (${P.answers.length}) ]`), h('p', { class: 'small dim' }, `Aufnahmen bleiben nur auf diesem Handy (die letzten ${KEEP_AUDIO}). Sie sind nicht in der Sicherungsdatei. Fragen, Bewertungen und Notizen schon.`));
    const list = h('div', {});
    for (const a of [...P.answers].reverse().slice(0, 15)) {
      const player = h('div', {});
      list.append(h('div', { class: 'card' }, h('div', { class: 'm' }, `${fmtDate(a.date)} · ${THEMEN[a.topic]?.name.toUpperCase() || ''}${a.followup ? ' · NACHFRAGE' : ''}${a.check ? ` · ${checkPct(a.check)} %` : ''}`), h('b', {}, a.q),
        a.note ? h('p', { class: 'small dim' }, '→ ' + a.note) : null,
        a.audio ? h('button', { class: 'btn s', style: { width: 'auto' }, onclick: async () => { try { const b = await loadAudio(a.id); if (!b) { player.replaceChildren(h('p', { class: 'small dim' }, 'Aufnahme nur auf dem Gerät, auf dem sie gemacht wurde.')); return; } player.replaceChildren(h('audio', { controls: true, autoplay: true, src: URL.createObjectURL(b) })); } catch { toast('Aufnahme nicht lesbar.'); } } }, `▶ Anhören (${fmtSec(a.sec || 0)})`) : null,
        player));
    }
    el.append(list);
  }
  el.append(card(h('div', { class: 'k' }, '[ KI-BEWERTUNG · SPÄTERE ERWEITERUNG ]'),
    h('p', { class: 'small' }, 'Nicht eingebaut: Die App hat keinen KI-Zugang und arbeitet komplett ohne Server. Für eine KI-Rückmeldung wäre nötig:'),
    h('ul', { class: 'plain small' }, h('li', {}, '1. Ein API-Zugang bei einem KI-Anbieter (kostenpflichtig, Schlüssel).'), h('li', {}, '2. Ein kleiner eigener Server als Zwischenstation – der Schlüssel darf nicht in der App auf GitHub Pages stehen.'), h('li', {}, '3. Spracherkennung der Aufnahme zu Text.'), h('li', {}, '4. Deine Zustimmung, dass Antworten an den Anbieter geschickt werden (sehr persönliche Daten).')),
    h('p', { class: 'small dim' }, 'Bis dahin: Selbstbewertung, und die Aufnahmen einer Vertrauensperson vorspielen.')));
}

export function runInterview(app, qs, { zeit = 0, onDone } = {}) {
  const st = app.state; const P = ps(st);
  let i = 0, rec = null, iv = null, saved = 0;
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      clearInterval(iv); iv = null; rec?.cancel(); rec = null;
      if (i >= qs.length) return summary();
      const Q = qs[i]; let blob = null, sec = 0; const check = {};
      speak(Q.q, { lang: 'de-DE', rate: 0.95 });
      const qText = h('h2', { class: 'hidden' }, Q.q);
      const limit = Q.zeit || zeit || MAX_SEC;
      const clock = h('div', { class: 'big center', style: { fontSize: '34px' } }, zeit || Q.zeit ? fmtSec(limit) : '0:00');
      const after = h('div', {});
      const recBtn = h('button', { class: 'btn f' }, recAvailable() ? '🎙 Antwort aufnehmen' : '▶ Antwort laut geben');
      const stopRec = async () => {
        clearInterval(iv); iv = null;
        if (rec) { const r = rec; rec = null; const out = await r.stop(); blob = out.blob; sec = out.sec; }
        recBtn.remove(); evaluate();
      };
      recBtn.onclick = async () => {
        if (rec || iv) return stopRec();
        stopSpeaking();
        if (recAvailable()) { try { rec = await startRecording(); } catch (e) { toast(e.message); } }
        const t0 = Date.now();
        iv = setInterval(() => { sec = Math.round((Date.now() - t0) / 1000); clock.textContent = zeit || Q.zeit ? fmtSec(Math.max(0, limit - sec)) : fmtSec(sec); if (limit - sec === 10) beep(660, 120); if (sec >= limit) { beep(440, 300); stopRec(); } }, 500);
        recBtn.textContent = '■ Antwort beenden'; recBtn.classList.remove('f'); recBtn.classList.add('danger');
      };
      const evaluate = () => {
        const note = h('textarea', { placeholder: 'Was sage ich nächstes Mal anders – in meinen eigenen Worten?', style: { minHeight: '70px' } });
        const rows = CHECK.map((c) => h('div', { class: 'chkrow' }, h('div', {}, h('b', {}, c.t), h('div', { class: 'small dim' }, c.d)),
          seg([[0, 'Nein'], [1, 'Teils'], [2, 'Ja']], null, (v) => { check[c.id] = v; })));
        const teileOk = {};
        const teileRow = Q.teile ? h('div', { class: 'chkrow' }, h('b', {}, 'Alle Teile beantwortet?'), ...Q.teile.map((t, k) => h('label', { class: 'small', style: { display: 'block', marginTop: '6px' } }, h('input', { type: 'checkbox', onchange: (e) => { teileOk[k] = e.target.checked; } }), ' ' + t))) : null;
        const save = async (followup) => {
          if (Object.keys(check).length < CHECK.length) return toast('Bitte alle vier Punkte bewerten.');
          const entry = { id: uid(), ts: Date.now(), date: iso(), topic: Q.topic, q: Q.q, followup: !!Q.followup, sec, zeit: zeit || Q.zeit || null, check: { ...check }, note: note.value.trim(), audio: false, teile: Q.teile ? Q.teile.filter((_, k) => teileOk[k]).length + '/' + Q.teile.length : undefined };
          if (blob && blob.size) { try { await saveAudio(entry.id, blob); entry.audio = true; } catch { toast('Aufnahme konnte nicht gespeichert werden.'); } }
          P.answers.push(entry); saved++;
          for (const id of pruneIds(P.answers, KEEP_AUDIO)) { const a = P.answers.find((x) => x.id === id); if (a) { a.audio = false; a.audioGone = true; } deleteAudio(id).catch(() => {}); }
          if (P.answers.length > 500) P.answers.splice(0, P.answers.length - 500);
          app.save();
          if (followup) qs.splice(i + 1, 0, { topic: Q.topic, q: pick(NACHFRAGEN), followup: true });
          i++; show();
        };
        after.replaceChildren(...[
          blob ? h('audio', { controls: true, src: URL.createObjectURL(blob) }) : h('p', { class: 'small dim' }, `Antwortzeit: ${fmtSec(sec)}`),
          h('p', { class: 'small dim' }, sec < 20 ? 'Sehr kurz. Psychologen fragen dann meist nach – hast du ein Beispiel genannt?' : sec > 150 ? 'Recht lang. Kommst du auf den Punkt?' : 'Gute Länge: 30 Sekunden bis 2 Minuten.'),
          h('div', { class: 'k mt' }, '[ SELBSTBEWERTUNG ]'), teileRow, ...rows, note,
          h('button', { class: 'btn f', onclick: () => save(false) }, i < qs.length - 1 ? 'Speichern – nächste Frage' : 'Speichern – fertig'),
          Q.followup ? null : h('button', { class: 'btn', onclick: () => save(true) }, 'Speichern + Nachfrage stellen')].filter(Boolean));
      };
      body.replaceChildren(h('div', { class: 'm' }, `FRAGE ${i + 1}/${qs.length} · ${(THEMEN[Q.topic]?.name || '').toUpperCase()}${Q.followup ? ' · NACHFRAGE' : ''}`),
        h('p', { class: 'small dim' }, THEMEN[Q.topic]?.worum || ''),
        h('div', { class: 'row wrap mt' }, h('button', { class: 'btn s', onclick: () => speak(Q.q, { lang: 'de-DE', rate: 0.95 }) }, '🔊 Nochmal'), h('button', { class: 'btn s', onclick: () => qText.classList.toggle('hidden') }, 'Frage als Text')),
        qText, Q.teile ? h('p', { class: 'warn small' }, `Merkaufgabe: Die Frage hat ${Q.teile.length} Teile. Beantworte alle, ohne nachzufragen.`) : null, zeit || Q.zeit ? h('p', { class: 'm' }, `ANTWORTZEIT ${fmtSec(limit)} – DANACH ENDET DIE AUFNAHME`) : null, beispielHinweis(P, Q.topic), clock, recBtn, after);
    };
    const summary = () => {
      stopSpeaking();
      const mine = P.answers.slice(-saved);
      const avg = mine.length ? Math.round(mine.reduce((a, x) => a + checkPct(x.check), 0) / mine.length) : 0;
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, '[ ÜBUNG BEENDET ]'), h('div', { class: 'big' }, avg + ' %'), h('div', { class: 'm' }, `SELBSTBEWERTUNG · ${mine.length} ANTWORTEN`)),
        h('p', { class: 'small dim' }, 'Hör dir die Aufnahmen morgen noch einmal an – mit Abstand hört man mehr. Noch besser: Lass eine Vertrauensperson zuhören und ehrlich sagen, was sie glaubt und was nicht.'),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      if (saved) { onDone?.(); app.award(10 + saved * 2, 'psych', 'Gespräch geübt.'); }
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, '[ PSYCHOLOGENGESPRÄCH · ÜBUNG ]'), body);
  }, { full: true });
  m.onClose(() => { clearInterval(iv); rec?.cancel(); stopSpeaking(); app.refresh(); });
}

// ---------- Schriftlich ----------
let subTab = 'lebenslauf'; // gewählter Unterreiter bleibt beim Auffrischen erhalten
export function renderSchriftlich(el, app) {
  const st = app.state; const P = ps(st);
  const sub = el.dataset.sub || subTab;
  el.append(h('div', { class: 'k mt' }, '[ SCHRIFTLICH ]'), seg([['lebenslauf', 'Lebenslauf'], ['motivation', 'Motivation'], ['aufsatz', 'Aufsatz'], ['bogen', 'Fragebögen']], sub, (v) => { subTab = v; el.dataset.sub = v; el.replaceChildren(); renderSchriftlich(el, app); }));
  const area = (key, store, placeholder) => {
    const ta = h('textarea', { placeholder, style: { minHeight: '90px' } }, store[key] || '');
    const upd = () => { store[key] = ta.value; app.save(); };
    ta.oninput = upd;
    return h('div', {}, ta, dictate(ta, upd));
  };
  if (sub === 'lebenslauf') {
    el.append(h('p', { class: 'small dim mt' }, 'Im Gespräch wird der Lebenslauf oft Station für Station durchgegangen. Du musst jede Entscheidung erklären können – ehrlich, nicht geschönt. Notier hier Stichworte in deinen Worten; alles wird automatisch gespeichert.'));
    for (const s of LEBENSLAUF) el.append(card(h('div', { class: 'k' }, `[ ${s.titel.toUpperCase()} ]`), ...s.fragen.map((f, k) => h('div', { class: 'mt' }, h('b', { class: 'small' }, f), area(`${s.id}.${k}`, P.cv, 'Stichworte …')))));
    el.append(h('button', { class: 'btn', onclick: () => download('lebenslauf-notizen.txt', LEBENSLAUF.map((s) => `${s.titel.toUpperCase()}\n` + s.fragen.map((f, k) => `- ${f}\n  ${(P.cv[`${s.id}.${k}`] || '').trim() || '–'}`).join('\n')).join('\n\n'), 'text/plain') }, 'Als Textdatei speichern'));
  } else if (sub === 'motivation') {
    el.append(card(h('p', { class: 'small' }, 'Deine Worte, kurze Sätze, Beispiele statt Behauptungen: nicht „Ich bin belastbar“, sondern was du erlebt und getan hast. Keine Vorlagen aus dem Internet – Prüfer erkennen sie sofort.')));
    for (const q of MOTIVATION) el.append(card(h('b', {}, q.frage), area(q.id, P.letter, 'In deinen eigenen Worten …')));
    const draft = h('textarea', { style: { minHeight: '200px' } }, P.letter.entwurf || '');
    draft.oninput = () => { P.letter.entwurf = draft.value; app.save(); };
    el.append(card(h('div', { class: 'k' }, '[ ENTWURF ]'), h('p', { class: 'small dim' }, 'Setzt deine Antworten zu einem Rohtext zusammen. Danach selbst überarbeiten: Übergänge, Anrede, Schluss.'),
      h('button', { class: 'btn', onclick: async () => { if (P.letter.entwurf && !(await confirmBox('Vorhandenen Entwurf überschreiben?', 'Überschreiben'))) return; P.letter.entwurf = buildLetter(P.letter); draft.value = P.letter.entwurf; app.save(); } }, 'Aus meinen Antworten zusammensetzen'),
      draft, h('button', { class: 'btn', onclick: () => download('motivationsschreiben-entwurf.txt', draft.value, 'text/plain') }, 'Als Textdatei speichern')));
  } else if (sub === 'aufsatz') {
    el.append(card(h('p', { class: 'small' }, 'Aufsätze im Auswahlverfahren prüfen, ob du klar schreibst und ob deine Aussagen zu Gespräch und Fragebogen passen. Ehrlich, konkret, gleichbleibend.')));
    for (const t of AUFSATZ) el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => runAufsatz(app, { minuten: 15, thema: t }) }, h('b', {}, t), h('div', { class: 'm' }, `15 MIN${P.aufsaetze.some((a) => a.thema === t) ? ' · GESCHRIEBEN ✓' : ''}`)));
    if (P.aufsaetze.length) el.append(h('div', { class: 'k mt2' }, `[ DEINE AUFSÄTZE (${P.aufsaetze.length}) ]`), ...[...P.aufsaetze].reverse().slice(0, 10).map((a) => h('details', { class: 'card' }, h('summary', { class: 'm', style: { cursor: 'pointer' } }, `${fmtDate(a.date)} · ${a.words} WÖRTER · ${a.thema.slice(0, 40)}…`), h('p', { class: 'small', style: { whiteSpace: 'pre-line' } }, a.text))));
  } else {
    el.append(...FRAGEBOGEN_INFO.map(([t, d]) => card(h('b', {}, t), h('p', { class: 'small' }, d))));
    el.append(h('button', { class: 'btn f', onclick: () => runBogen(app) }, '> Übungsfragebogen (20 Aussagen, 3 min)'), h('button', { class: 'btn', onclick: () => runBogen(app, { sek: 5 }) }, 'Schnellrunde: 5 Sekunden je Aussage'),
      h('p', { class: 'small dim' }, 'Übung, keine Diagnose: Die Auswertung zeigt nur, ob du gleichbleibend antwortest und ob du dich bei Kontrollaussagen schönfärbst.'));
    const last = P.bogen[P.bogen.length - 1];
    if (last) el.append(h('div', { class: 'm' }, `LETZTER DURCHGANG ${fmtDate(last.date)}: ${last.stimmig}/${last.paare} PAARE STIMMIG · ${last.geschoent} KONTROLLAUSSAGEN GESCHÖNT`));
  }
}

export function runBogen(app, { sek = 0, onDone } = {}) {
  const st = app.state; const P = ps(st);
  const items = fragebogenItems(); const ans = {}; let i = 0, tmr = null, zuLangsam = 0;
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      clearInterval(tmr);
      if (i >= items.length) return result();
      const it = items[i];
      const bar = sek ? h('div', { class: 'bar' }, h('i', { style: { width: '100%', transition: `width ${sek}s linear` } })) : null;
      body.replaceChildren(h('div', { class: 'm' }, `AUSSAGE ${i + 1}/${items.length}${sek ? ` · ${sek} S` : ''}`), bar, h('h2', { style: { minHeight: '84px' } }, it.t),
        h('div', { class: 'likert' }, ...FRAGEBOGEN.skala.map((s, k) => h('button', { onclick: () => { ans[it.id] = k + 1; i++; show(); } }, h('b', {}, k + 1), h('span', {}, s)))),
        i && !sek ? h('button', { class: 'btn s', style: { width: 'auto' }, onclick: () => { i--; show(); } }, 'Zurück') : null);
      if (sek) { requestAnimationFrame(() => { if (bar) bar.firstChild.style.width = '0%'; }); let left = sek; tmr = setInterval(() => { if (--left <= 0) { zuLangsam++; i++; show(); } }, 1000); }
    };
    const result = () => {
      const r = fragebogenAuswerten(ans);
      P.bogen.push({ date: iso(), stimmig: r.stimmig, paare: r.paare.length, geschoent: r.geschoent.length, ans: { ...ans }, sek: sek || null, zuLangsam });
      if (P.bogen.length > 60) P.bogen.shift();
      app.save(); onDone?.();
      const stab = bogenStabilitaet(P.bogen);
      const scale = (v) => FRAGEBOGEN.skala[v - 1];
      body.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'k' }, '[ AUSWERTUNG · KEINE DIAGNOSE ]'), h('div', { class: 'big' }, `${r.stimmig}/${r.paare.length}`), h('div', { class: 'm' }, 'PAARE GLEICHBLEIBEND BEANTWORTET')),
        r.widerspruch.length ? card(h('div', { class: 'k' }, '[ WIDERSPRÜCHE ]'), h('p', { class: 'small dim' }, 'Diese Aussagen messen dasselbe, deine Antworten passen nicht zusammen. Im echten Gespräch würde hier nachgefragt. Was stimmt wirklich?'),
          ...r.widerspruch.map((p) => h('div', { class: 'mt small' }, h('div', {}, `„${p.a}“ → ${scale(p.x)}`), h('div', {}, `„${p.b}“ → ${scale(p.y)}`), h('div', { class: 'dim' }, p.rev ? '(umgekehrt formuliert)' : '(gleich formuliert)')))) : card(h('p', {}, 'Keine deutlichen Widersprüche.')),
        r.unklar.length ? card(h('div', { class: 'k' }, `[ LEICHT ABWEICHEND: ${r.unklar.length} ]`), h('p', { class: 'small dim' }, 'Zwei Stufen Unterschied – kein Widerspruch, aber schau ehrlich hin, was eher stimmt.'), ...r.unklar.map((p) => h('div', { class: 'small mt' }, `„${p.a}“ / „${p.b}“`))) : null,
        sek ? card(h('div', { class: 'k' }, '[ UNTER ZEITDRUCK ]'), h('p', { class: 'small' }, zuLangsam ? `${zuLangsam} Aussagen nicht rechtzeitig beantwortet. Im echten Test zählt der erste Impuls – nicht grübeln.` : 'Alle Aussagen rechtzeitig beantwortet.')) : null,
        stab ? card(h('div', { class: 'k' }, '[ GLEICHBLEIBEND ÜBER DIE ZEIT ]'), h('p', { class: 'small' }, `${stab.stabil} von ${stab.gesamt} Aussagen wie beim letzten Durchgang (±1 Stufe).`), stab.wechsel.length ? h('p', { class: 'small dim' }, 'Deutlich anders als letztes Mal: ' + stab.wechsel.map((id) => '„' + items.find((x) => x.id === id)?.t + '“').join(', ') + '. Was stimmt wirklich?') : null) : null,
        r.geschoent.length ? card(h('div', { class: 'k' }, '[ KONTROLLAUSSAGEN ]'), h('p', { class: 'small dim' }, 'Diesen Aussagen kann kaum jemand ehrlich voll zustimmen. Wer es tut, wirkt geschönt – das senkt die Glaubwürdigkeit des ganzen Bogens.'),
          ...r.geschoent.map((k) => h('div', { class: 'small mt' }, `„${k.t}“ → ${scale(k.v)}`))) : card(h('p', {}, 'Kontrollaussagen realistisch beantwortet.')),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      app.award(10, 'psych', 'Fragebogen geübt.');
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, '[ ÜBUNGSFRAGEBOGEN ]'), h('p', { class: 'small dim' }, 'Zügig antworten, erster Impuls. Denk an dein typisches Verhalten, nicht an dein Wunschbild.'), body);
  }, { full: true });
  m.onClose(() => app.refresh());
}

// ---------- Tagebuch ----------
export function renderTagebuch(el, app) {
  const st = app.state; const P = ps(st);
  const today = iso();
  const prompts = dailyPrompts(today);
  const entry = P.diary.find((d) => d.date === today) || { date: today, prompts, texts: prompts.map(() => '') };
  el.append(h('div', { class: 'k mt' }, '[ REFLEXIONSTAGEBUCH ]'), h('p', { class: 'small dim' }, 'Jeden Abend 5 Minuten. Wer sich selbst kennt, kann im Gespräch ehrlich und konkret antworten – mit echten Beispielen statt Floskeln. Nur für dich; gespeichert auf dem Handy und in deiner Sicherung.'));
  const tas = entry.prompts.map((p, k) => {
    const ta = h('textarea', { placeholder: 'Ehrlich, in Stichworten oder Sätzen …', style: { minHeight: '90px' } }, entry.texts[k] || '');
    return { p, ta };
  });
  const save = () => {
    entry.texts = tas.map((x) => x.ta.value);
    const first = !P.diary.includes(entry);
    if (!entry.texts.some((t) => t.trim())) return toast('Erst etwas schreiben.');
    if (first) P.diary.push(entry);
    if (psychFuer(today).art === 'tagebuch') { const l = st.done[today] || (st.done[today] = []); if (!l.includes('psych-kurz')) l.push('psych-kurz'); }
    if (first) app.award(5, 'tagebuch', 'Tagebuch geschrieben.'); else { app.save(); toast('Gespeichert.'); }
  };
  el.append(card(h('div', { class: 'k' }, `[ HEUTE · ${fmtDate(today)} ]`), ...tas.map(({ p, ta }) => h('div', { class: 'mt' }, h('b', {}, p), ta, dictate(ta))), h('button', { class: 'btn f', onclick: save }, 'Speichern')));
  const old = P.diary.filter((d) => d.date !== today).slice(-30).reverse();
  if (old.length) {
    el.append(h('div', { class: 'k mt2' }, `[ FRÜHERE EINTRÄGE (${P.diary.length}) ]`));
    for (const d of old) el.append(h('details', { class: 'card' }, h('summary', { class: 'm', style: { cursor: 'pointer' } }, `${fmtDate(d.date)} · ${d.prompts[0].slice(0, 40)}…`),
      ...d.prompts.map((p, k) => h('div', { class: 'mt' }, h('b', { class: 'small' }, p), h('p', { class: 'small dim', style: { whiteSpace: 'pre-line' } }, d.texts[k] || '–')))));
  }
}

// ---------- Eigene Beispiele (STAR) ----------
function beispielHinweis(P, topic) {
  const list = P.beispiele?.[topic] || [];
  if (!list.length) return h('p', { class: 'small dim' }, 'Tipp: Unter „Meine Beispiele“ echte Erlebnisse in Stichworten sammeln – dann hast du sie im Kopf, ohne auswendig zu lernen.');
  const box = h('div', { class: 'hidden small dim' }, ...list.map((b) => h('div', { class: 'mt' }, h('b', {}, b.titel), h('div', {}, STAR.map((x) => b[x.id] ? `${x.t}: ${b[x.id]}` : '').filter(Boolean).join(' · ')))));
  return h('div', {}, h('button', { class: 'btn s', style: { width: 'auto' }, onclick: () => box.classList.toggle('hidden') }, `Meine Beispiele (${list.length}) zeigen`), box);
}

export function beispieleCard(app) {
  const P = ps(app.state);
  const n = Object.values(P.beispiele).reduce((a, l) => a + l.length, 0);
  return card(h('div', { class: 'k' }, `[ MEINE BEISPIELE (${n}) ]`),
    h('p', { class: 'small dim' }, 'Echte Erlebnisse statt auswendig gelernter Sätze. Pro Thema 1–2 Beispiele in Stichworten (Situation – Aufgabe – Handlung – Ergebnis – Gelernt). Im Gespräch kannst du sie einblenden.'),
    h('div', { class: 'chips' }, ...BEISPIEL_THEMEN.map((t) => h('button', { class: 'chip ' + ((P.beispiele[t] || []).length ? 'on' : ''), onclick: () => beispielModal(app, t) }, `${THEMEN[t].name} ${(P.beispiele[t] || []).length || ''}`))));
}

function beispielModal(app, topic) {
  const P = ps(app.state);
  modal(({ close }) => {
    const list = h('div', {});
    const draw = () => list.replaceChildren(...(P.beispiele[topic] || []).map((b, k) => card(h('b', {}, b.titel), ...STAR.map((x) => (b[x.id] ? h('div', { class: 'small' }, h('span', { class: 'm' }, x.t.toUpperCase() + ': '), b[x.id]) : null)),
      h('button', { class: 'btn s', style: { width: 'auto' }, onclick: async () => { if (await confirmBox('Beispiel löschen?', 'Löschen')) { P.beispiele[topic].splice(k, 1); app.save(); draw(); } } }, 'Löschen'))));
    draw();
    const titel = h('input', { placeholder: 'Kurzer Titel, z. B. „Marsch im Regen 2025“' });
    const inputs = STAR.map((x) => { const i = h('input', { placeholder: x.d }); return { x, i }; });
    return h('div', {}, h('div', { class: 'k' }, `[ MEINE BEISPIELE · ${THEMEN[topic].name.toUpperCase()} ]`), h('p', { class: 'small dim' }, THEMEN[topic].worum), list,
      card(h('div', { class: 'k' }, '[ NEUES BEISPIEL – NUR STICHWORTE ]'), field('Titel', titel), ...inputs.map(({ x, i }) => field(x.t, i, dictate(i))),
        h('button', { class: 'btn f', onclick: () => { if (!titel.value.trim() || !inputs[2].i.value.trim()) return toast('Titel und Handlung eintragen.'); (P.beispiele[topic] = P.beispiele[topic] || []).push({ titel: titel.value.trim(), ...Object.fromEntries(inputs.map(({ x, i }) => [x.id, i.value.trim()])), date: iso() }); app.save(); toast('Gespeichert.'); close(); app.refresh(); } }, 'Speichern')));
  }, { full: true });
}

// ---------- Aufsatz mit Zeitlimit ----------
export function runAufsatz(app, { minuten = 15, thema, onDone } = {}) {
  const P = ps(app.state);
  const T = thema || pick(AUFSATZ);
  let left = minuten * 60, iv = null; const t0 = Date.now();
  const m = modal(({ close }) => {
    const clock = h('span', { class: 'mono sand' }, fmtSec(left));
    const words = h('span', { class: 'm' }, '0 WÖRTER');
    const ta = h('textarea', { placeholder: 'In deinen eigenen Worten. Ein echtes Beispiel gehört rein.', style: { minHeight: '260px', fontSize: '17px' } });
    ta.oninput = () => { words.textContent = wortzahl(ta.value) + ' WÖRTER'; };
    const finish = () => {
      clearInterval(iv); ta.readOnly = true;
      const check = {};
      body.replaceChildren(h('div', { class: 'k' }, '[ SELBSTPRÜFUNG ]'), h('div', { class: 'm' }, `${wortzahl(ta.value)} WÖRTER · ${fmtSec(Math.round((Date.now() - t0) / 1000))} MIN`),
        ...AUFSATZ_CHECK.map((c) => h('div', { class: 'chkrow' }, h('div', {}, h('b', {}, c.t), h('div', { class: 'small dim' }, c.d)), seg([[0, 'Nein'], [1, 'Teils'], [2, 'Ja']], null, (v) => { check[c.id] = v; }))),
        h('button', { class: 'btn f', onclick: () => {
          if (Object.keys(check).length < AUFSATZ_CHECK.length) return toast('Bitte alle Punkte bewerten.');
          P.aufsaetze.push({ id: uid(), date: iso(), thema: T, text: ta.value, words: wortzahl(ta.value), sec: Math.round((Date.now() - t0) / 1000), check });
          if (P.aufsaetze.length > 100) P.aufsaetze.shift();
          onDone?.(); app.award(10, 'psych', 'Aufsatz geschrieben.'); close();
        } }, 'Speichern'));
    };
    const body = h('div', {}, h('h2', {}, T), h('div', { class: 'row between' }, words, clock), ta, dictate(ta, () => ta.oninput()), h('button', { class: 'btn f', onclick: finish }, 'Abgeben'));
    iv = setInterval(() => { left--; clock.textContent = fmtSec(Math.max(0, left)); if (left === 60) beep(660, 150); if (left <= 0) { beep(440, 400); finish(); } }, 1000);
    return h('div', {}, h('div', { class: 'k' }, `[ AUFSATZ · ${minuten} MIN ]`), h('p', { class: 'small dim' }, 'Schreib so, wie du im Gespräch reden würdest – ehrlich und gleichbleibend. Keine Vorlagen.'), body);
  }, { full: true });
  m.onClose(() => { clearInterval(iv); app.refresh(); });
}

// ---------- Tägliche Kurzeinheit (5–10 min) ----------
export function startPsychKurz(app, date = iso(), onDone) {
  const p = psychFuer(date); const P = ps(app.state);
  if (p.art === 'gespraech') return runInterview(app, pickQuestions(p.topics, p.n, P.answers), { zeit: p.zeit, onDone });
  if (p.art === 'mehrteilig') { const seen = new Set(P.answers.map((a) => a.q)); const q = MEHRTEILIG.find((x) => !seen.has(x.q)) || pick(MEHRTEILIG); return runInterview(app, [{ ...q, zeit: 150 }], { onDone }); }
  if (p.art === 'bogen-schnell') return runBogen(app, { sek: p.sek, onDone });
  if (p.art === 'aufsatz') return runAufsatz(app, { minuten: p.minuten || 8, onDone });
  // Tagebuch: Reiter öffnen, beim Speichern gilt der Punkt als erledigt
  app.go('#/auswahl/tagebuch');
}
