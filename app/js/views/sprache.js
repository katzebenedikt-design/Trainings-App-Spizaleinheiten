// Bereich Sprache: Intensivmethode nach FSI/DLI. Sprachen kommen aus Sprachpaketen (app/sprachen/*.json
// oder per Datei importiert). GER-Pfad A1–C2, Einstufungs- und Stufentests, Tageseinheit 10/20/30/60 min,
// Wiederholung nach SM-2, Shadowing, freies Sprechen, ehrliche Stunden-Richtwerte.
import { h, card, modal, toast, progressBar, celebrate, seg, field, download, pickFile, confirmBox, lineChart } from '../ui.js';
import { buildExercises, checkAnswer, norm, sm2, sm2Preview, isDue } from '../core/lang.js';
import { speak, stopSpeaking, listen, sttAvailable, ttsAvailable, beep } from '../core/speech.js';
import { recAvailable, startRecording } from '../core/recorder.js';
import { iso, shuffle, pick, fmtDate } from '../core/util.js';
import { giveBadge, streak } from '../core/rewards.js';
import {
  LEVELS, FSI_TEXT, allPacks, packFor, builtinPacks, validatePack, langState, lessonsOf, nextLessonOf, workLevel, levelIdx,
  packLevels, logStudy, hoursEstimate, testItems, placementStep, applyLevel, PASS,
} from '../core/langpacks.js';

export const spracheTabs = [
  { key: 'heute', label: 'Heute', render: renderHeute },
  { key: 'pfad', label: 'Pfad', render: renderPfad },
  { key: 'karten', label: 'Karten', render: renderKarten },
  { key: 'hoeren', label: 'Hören', render: renderHoeren },
  { key: 'sprachen', label: 'Sprachen', render: renderSprachen },
];

const ttsText = (s) => String(s).replace(/\(.*?\)/g, '').replace(/…/g, '').trim();
const cur = (st) => { const p = packFor(st); return { p, L: p ? langState(st, p.code) : null }; };
const sayIn = (p, t, rate = 0.85) => speak(ttsText(t), { lang: p.tts, rate });
// Misst die tatsächliche Lernzeit eines Fensters (max. 45 min)
const timer = (L) => { const t0 = Date.now(); return (kind, cap = 45) => logStudy(L, Math.min(cap, (Date.now() - t0) / 60000), kind); };
const fmtH = (h) => (h >= 10 ? Math.round(h / 10) * 10 : Math.round(h)) + ' h';
const DEFAULT_SPRECHEN = {
  A1: ['Stell dich vor: Name, Herkunft, Beruf.', 'Zähle laut bis zwanzig und zurück.', 'Sag, was du heute gegessen und gemacht hast.'],
  A2: ['Erzähl, was du gestern gemacht hast.', 'Beschreibe deine Familie oder dein Zuhause.', 'Erkläre den Weg zu deiner Arbeit.'],
  B1: ['Erzähl von einem Erlebnis, auf das du stolz bist.', 'Erkläre, warum du zur Spezialeinheit willst.', 'Fasse die Nachrichten des Tages zusammen.'],
  B2: ['Argumentiere 2 Minuten für und gegen eine Sache.', 'Erkläre deinen Beruf im Detail.', 'Beschreibe einen Fehler und was du daraus gelernt hast.'],
  C1: ['Halte einen 3-Minuten-Vortrag ohne Notizen.', 'Fasse einen Podcast zusammen und bewerte ihn.'],
  C2: ['Halte eine 5-Minuten-Rede zu einem aktuellen Thema.', 'Verteidige spontan eine Meinung, die du nicht teilst.'],
};

// Für die Startseite (Sport → Heute)
export function spracheHome(st) {
  const { p, L } = cur(st);
  if (!p) return null;
  const nl = nextLessonOf(p, L);
  const t = L.today?.date === iso() ? L.today : null;
  const open = t ? t.steps.filter((s) => !s.done).length : null;
  return { t: `${p.name} · ${nl ? nl.title : 'Tageseinheit'}`, sub: open === 0 ? 'TAGESEINHEIT ERLEDIGT' : `${t ? t.dur + ' MIN' : '10–60 MIN'} · LAUT SPRECHEN`, done: open === 0 };
}

// ---------- Stunden-Richtwert ----------
function hoursCard(p, L) {
  const e = hoursEstimate(p, L);
  const lines = [];
  if (!e.target) lines.push(h('p', {}, 'C2 erreicht. Jetzt geht es ums Halten: täglich hören und sprechen.'));
  else {
    lines.push(h('div', { class: 'grid2 mt' },
      h('div', { class: 'tile' }, h('i', {}, `Bis ${e.target}`), h('b', { style: { fontSize: '20px' } }, `${e.range[0]}–${e.range[1]} h`)),
      h('div', { class: 'tile' }, h('i', {}, `Bis Ziel ${e.goal}`), h('b', { style: { fontSize: '20px' } }, e.toGoal ? 'ca. ' + fmtH(e.toGoal) : '✓'))));
    lines.push(h('p', { class: 'm' }, e.minDay ? `DEIN TEMPO: Ø ${e.minDay} MIN/TAG (14 TAGE) → ${e.target} IN CA. ${Math.ceil(e.daysNext / 7)} WOCHEN` : `MIT 30 MIN/TAG: ${e.target} IN CA. ${Math.ceil((e.toNext * 2) / 7)} WOCHEN`));
  }
  lines.push(h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '8px' } }, 'WIE WIRD DAS GERECHNET?'),
    h('p', { class: 'small dim' }, `Richtwerte für begleitete Lernstunden je GER-Stufe (Cambridge English: A2 ca. 200 h, B1 ca. 400 h, B2 ca. 600 h, C1 ca. 800 h, C2 ca. 1100 h – kumuliert). ${p.name}: ${FSI_TEXT[p.fsi || 1]}, Faktor ${e.factor}. Bisher erfasste Lernzeit: ${e.studiedH} h. Das sind Durchschnittswerte, keine Garantie: Wer nur in der App lernt, braucht eher länger. Täglich laut sprechen und echte Gespräche verkürzen den Weg. Erreicht ist eine Stufe erst, wenn der Stufentest bestanden ist.`)));
  return card(h('div', { class: 'k' }, '[ LERNSTUNDEN · EHRLICHER RICHTWERT ]'), ...lines);
}

function levelStrip(p, L) {
  const w = workLevel(L);
  return h('div', { class: 'lvstrip' }, ...LEVELS.map((lv) => h('span', { class: levelIdx(lv) <= levelIdx(L.level) ? 'done' : lv === w ? 'cur' : '' }, lv)));
}

// ---------- Tab: Heute ----------
const PLAN = {
  10: [['karten', 3], ['neu', 5], ['sprechen', 2]],
  20: [['karten', 5], ['neu', 7], ['shadowing', 5], ['sprechen', 3]],
  30: [['karten', 6], ['neu', 8], ['shadowing', 6], ['hoeren', 6], ['sprechen', 4]],
  60: [['karten', 10], ['neu', 15], ['shadowing', 10], ['hoeren', 15], ['sprechen', 10]],
};
const STEP_LABEL = { karten: 'Wiederholen (Karten)', neu: 'Neuer Stoff', shadowing: 'Shadowing', hoeren: 'Hören', sprechen: 'Laut sprechen' };
export function planSession(dur) { return { date: iso(), dur, steps: (PLAN[dur] || PLAN[20]).map(([kind, min]) => ({ kind, min, done: false })) }; }

function renderHeute(el, app) {
  const st = app.state; const { p, L } = cur(st);
  if (!p) { el.append(h('div', { class: 'card badc' }, 'Keine Sprachpakete geladen. App einmal mit Internet öffnen.')); return; }
  el.append(h('div', { class: 'grid3 mt' },
    h('div', { class: 'tile' }, h('i', {}, p.name.split(' ')[0]), h('b', { style: { fontSize: '20px' } }, L.level || '–'), h('span', { class: 'm' }, 'ERREICHT')),
    h('div', { class: 'tile' }, h('i', {}, 'Lernzeit'), h('b', { style: { fontSize: '20px' } }, Math.round((L.min || 0) / 6) / 10 + ' h')),
    h('div', { class: 'tile' }, h('i', {}, 'Serie'), h('b', {}, streak(st)))), levelStrip(p, L));
  if (!L.placement && !L.level) el.append(card(h('div', { class: 'k' }, '[ ZUERST: EINSTUFUNG ]'), h('p', {}, 'Ca. 5 Minuten. Danach weißt du, wo du stehst, und der Lernpfad startet auf deiner Stufe.'), h('button', { class: 'btn f', onclick: () => runPlacement(app) }, '> Einstufungstest starten')));
  if (!L.today || L.today.date !== iso()) L.today = planSession(L.today?.dur || 20);
  const T = L.today;
  el.append(h('div', { class: 'k mt2' }, '[ TAGESEINHEIT ]'), h('div', { class: 'm' }, 'DAUER WÄHLEN'),
    seg([[10, '10 min'], [20, '20 min'], [30, '30 min'], [60, '60 min']], T.dur, (v) => { const done = T.steps.filter((s) => s.done).map((s) => s.kind); L.today = planSession(v); L.today.steps.forEach((s) => { if (done.includes(s.kind)) s.done = true; }); app.save(); app.refresh(); }));
  const nl = nextLessonOf(p, L);
  const wl = workLevel(L); const wLessons = lessonsOf(p).filter((x) => x.level === wl);
  if (testItems(p, wl).length && wLessons.length && wLessons.every((x) => L.lessons[x.id]) && !L.tests[wl]?.passed) el.append(h('div', { class: 'card warnc' }, h('b', {}, `Alle Lektionen ${wl} erledigt.`), h('p', { class: 'small' }, `Mach den Stufentest ${wl} – erst dann gilt die Stufe als erreicht.`), h('button', { class: 'btn f', onclick: () => runLevelTest(app, wl) }, `> Stufentest ${wl}`)));
  const list = h('div', { class: 'steps' });
  for (const s of T.steps) {
    const sub = s.kind === 'karten' ? `${dueList(st, p, L).length} FÄLLIG` : s.kind === 'neu' ? (nl ? nl.title.toUpperCase() : 'ECHTE QUELLE + EIGENE KARTEN') : s.kind === 'shadowing' ? 'HÖREN UND GLEICHZEITIG NACHSPRECHEN' : s.kind === 'hoeren' ? (pickDialog(p, L) ? 'GESPRÄCH MIT ANTWORTEN' : 'ECHTE QUELLE') : 'FREI, OHNE NOTIZEN';
    list.append(h('div', { class: 'step ' + (s.done ? 'done' : ''), onclick: () => runStep(app, s) },
      h('div', { class: 'chk' }, s.done ? '✓' : ''), h('div', { class: 'grow' }, h('b', {}, STEP_LABEL[s.kind]), h('div', { class: 'm' }, sub)), h('span', { class: 'mono sand' }, `${s.min}′`)));
  }
  el.append(list);
  const open = T.steps.find((s) => !s.done);
  el.append(open ? h('button', { class: 'btn f', onclick: () => runStep(app, open) }, `> ${STEP_LABEL[open.kind]}`) : h('div', { class: 'card' }, h('h2', { class: 'olive' }, 'Tageseinheit erledigt.'), h('p', { class: 'm' }, 'Abends die Chunks des Tages noch einmal anhören.')));
  el.append(hoursCard(p, L));
  const log = L.log.slice(-30);
  if (log.length > 1) el.append(card(h('div', { class: 'k' }, '[ LERNMINUTEN PRO TAG ]'), lineChart(log.map((x) => ({ date: x.date, v: Math.round(x.min) })), { fmt: (v) => v + ' min', height: 120 })));
  el.append(h('p', { class: 'm mt' }, 'Methode nach FSI/DLI: viel verständlicher Input, Hören vor Sprechen, ganze Sätze statt Einzelwörter, jeden Tag laut sprechen, Wiederholen in wachsenden Abständen (SM-2).'));
}

function stepDone(app, s) {
  const { L } = cur(app.state);
  const T = L.today; if (!T || T.date !== iso()) return;
  const x = T.steps.find((y) => y.kind === s.kind); if (x && !x.done) { x.done = true; if (T.steps.every((y) => y.done)) app.award(10, 'sprache', 'Tageseinheit Sprache erledigt.'); else app.save(); }
}

function runStep(app, s) {
  const st = app.state; const { p, L } = cur(st);
  const done = () => stepDone(app, s);
  if (s.kind === 'karten') {
    if (!dueList(st, p, L).length) { toast('Nichts fällig – Schritt erledigt.'); done(); app.refresh(); return; }
    return runCards(app, null, 'fremd', { max: Math.round(s.min * 5), onDone: done });
  }
  if (s.kind === 'neu') { const nl = nextLessonOf(p, L); return nl ? runLesson(app, nl, done) : runQuelle(app, s.min, done); }
  if (s.kind === 'shadowing') { const sh = pickShadow(p, L); return sh ? runShadow(app, sh, done) : runSpeak(app, s.min, done); }
  if (s.kind === 'hoeren') { const d = pickDialog(p, L); return d ? runDialog(app, d, done) : runQuelle(app, s.min, done); }
  return runSpeak(app, s.min, done);
}

const stufeOf = (p, lv) => p.stufen[lv] || {};
const upTo = (p, L) => packLevels(p).filter((lv) => levelIdx(lv) <= levelIdx(workLevel(L)));
function pickShadow(p, L) {
  const all = upTo(p, L).flatMap((lv) => (stufeOf(p, lv).shadowing || []).map((x) => ({ ...x, lv })));
  if (!all.length) return null;
  const w = workLevel(L);
  const pool = all.filter((x) => x.lv === w).length ? all.filter((x) => x.lv === w) : all;
  return [...pool].sort((a, b) => (L.shadow[a.id] || 0) - (L.shadow[b.id] || 0))[0];
}
function pickDialog(p, L) {
  const ds = (p.dialoge || []).filter((d) => levelIdx(d.stufe) <= levelIdx(workLevel(L)));
  return ds.find((d) => (L.dialogs[d.id] || 0) < 100) || null;
}
function quellenFor(p, L) {
  const w = workLevel(L);
  const at = stufeOf(p, w).quellen || [];
  if (at.length) return at;
  return [...upTo(p, L)].reverse().map((lv) => stufeOf(p, lv).quellen || []).find((q) => q.length) || [];
}

// ---------- Tab: Pfad ----------
function renderPfad(el, app) {
  const st = app.state; const { p, L } = cur(st);
  if (!p) return;
  const w = workLevel(L);
  const nl = nextLessonOf(p, L);
  el.append(h('div', { class: 'k mt' }, `[ ${p.name.toUpperCase()} · ZIEL ${p.ziel || 'B2'} ]`), levelStrip(p, L),
    h('p', { class: 'small dim' }, p.hinweis || ''),
    h('div', { class: 'row mt' },
      h('button', { class: 'btn ' + (L.placement ? '' : 'f'), style: { margin: 0 }, onclick: () => runPlacement(app) }, L.placement ? 'Neu einstufen' : '> Einstufung'),
      testItems(p, w).length ? h('button', { class: 'btn f', style: { margin: 0 }, onclick: () => runLevelTest(app, w) }, `Stufentest ${w}`) : null));
  if (L.placement) el.append(h('div', { class: 'm mt' }, `EINSTUFUNG ${fmtDate(L.placement.date)}: ${L.placement.level || 'UNTER A1'}`));
  if (nl) el.append(h('button', { class: 'btn f', onclick: () => runLesson(app, nl) }, `> Weiter: ${nl.title}`));

  for (const lv of packLevels(p)) {
    const S = stufeOf(p, lv);
    const reached = levelIdx(lv) <= levelIdx(L.level), isCur = lv === w, locked = levelIdx(lv) > levelIdx(w);
    const t = L.tests[lv];
    el.append(h('div', { class: 'card ' + (isCur ? 'activec' : '') },
      h('div', { class: 'k' }, `[ STUFE ${lv} · ${reached ? 'ERREICHT' : isCur ? 'AKTUELL' : 'SPÄTER'} ]`),
      S.ziel ? h('div', { class: 'm' }, S.ziel.toUpperCase()) : null,
      t ? h('div', { class: 'm' }, `STUFENTEST ${fmtDate(t.date)}: ${t.pct} % ${t.passed ? '· BESTANDEN' : ''}`) : null,
      !locked && testItems(p, lv).length && !isCur ? h('button', { class: 'btn s', onclick: () => runLevelTest(app, lv) }, `Stufentest ${lv} wiederholen`) : null));
    const units = S.einheiten || [];
    if (units.length) {
      const path = h('div', { class: 'path' });
      for (const u of units) {
        path.append(h('div', { class: 'unit-h' }, h('b', {}, u.titel)));
        u.lektionen.forEach((chunks, li) => {
          const id = `${u.id}-${li}`; const isDone = !!L.lessons[id]; const isNext = nl && nl.id === id;
          const open = isDone || isNext || reached;
          const it = { id, level: lv, unit: u, li, chunks, title: `${u.titel} ${li + 1}` };
          path.append(h('div', { class: 'node ' + (isDone ? 'done' : isNext ? 'next' : open ? 'open' : 'lock'), onclick: () => (open ? runLesson(app, it) : toast('Erst die vorherige Lektion abschließen.')) },
            h('div', {}, isDone ? `✓\n${L.lessons[id].score}%` : `L${li + 1}`)));
        });
      }
      el.append(path);
    } else if (!locked) {
      const q = S.quellen || [];
      el.append(h('p', { class: 'small dim' }, 'Ab dieser Stufe lernst du mit echten Quellen: hören, Shadowing, frei sprechen, neue Ausdrücke als eigene Karten. Die Tageseinheit stellt das automatisch zusammen.'),
        ...q.map(quelleCard));
    }
  }
}

const quelleCard = (q) => h('a', { class: 'card linkc', href: q.url, target: '_blank', rel: 'noopener' }, h('div', { class: 'row between' }, h('b', {}, q.titel), h('span', { class: 'm' }, (q.art || 'Quelle').toUpperCase() + ' ↗')), q.text ? h('div', { class: 'small dim' }, q.text) : null);

// ---------- Lektion ----------
export function runLesson(app, it, onDone) {
  const st = app.state; const { p, L } = cur(st);
  const pool = lessonsOf(p).filter((x) => x.level === it.level).flatMap((x) => x.chunks);
  const queue = buildExercises(it.chunks, pool.length >= 4 ? pool : lessonsOf(p).flatMap((x) => x.chunks));
  const total = queue.filter((e) => e.type !== 'learn').length;
  const stop = timer(L);
  let i = 0, correct = 0; const retried = new Set();
  const say = (t, rate = 0.85) => sayIn(p, t, rate);
  const m = modal(({ close }) => {
    const bar = h('div', {}); const body = h('div', {});
    const wrap = h('div', {}, h('div', { class: 'k' }, `[ ${p.name.toUpperCase()} · ${it.level} · ${it.title.toUpperCase()} ]`), bar, body);
    const next = () => { i++; if (i >= queue.length) return finish(); show(); };
    const feedback = (ok, solution) => {
      const fb = h('div', { class: 'card ' + (ok ? '' : 'warnc') }, h('h2', { class: ok ? 'olive' : 'warn' }, ok ? 'Richtig!' : 'Nicht ganz.'), ok ? null : h('p', {}, 'Richtig: ', h('b', {}, solution)),
        h('button', { class: 'btn f', onclick: next }, 'Weiter'));
      body.append(fb); fb.scrollIntoView?.({ behavior: 'smooth' });
      if (!ok) { say(solution); const c = queue[i]; if (!c.retry) { retried.add(c); queue.push({ ...c, retry: true }); } }
    };
    const show = () => {
      const e = queue[i];
      bar.replaceChildren(progressBar(i / queue.length));
      body.replaceChildren();
      if (e.type === 'learn') {
        say(e.c.en);
        body.append(h('div', { class: 'm mt' }, 'NEU · HÖREN UND 2× LAUT NACHSPRECHEN'), h('div', { class: 'flash', onclick: () => say(e.c.en) }, h('div', {}, e.c.en, h('div', { class: 'm', style: { marginTop: '10px' } }, e.c.de))),
          h('div', { class: 'row mt' }, h('button', { class: 'btn s', onclick: () => say(e.c.en, 0.6) }, '🐢 Langsam'), h('button', { class: 'btn s', onclick: () => say(e.c.en) }, '🔊 Nochmal')),
          h('button', { class: 'btn f', onclick: next }, 'Nachgesprochen – weiter'));
      } else if (e.type === 'listen' || e.type === 'translate') {
        if (e.type === 'listen') say(e.c.en);
        const target = e.type === 'listen' ? e.c.de : e.c.en;
        let answered = false;
        const btns = e.options.map((o) => h('button', { style: { fontSize: '17px', fontFamily: 'var(--head)' }, onclick: (ev) => {
          if (answered) return; answered = true;
          const ok = o === target; if (ok) correct++;
          ev.currentTarget.classList.add(ok ? 'ok' : 'no'); btns[e.options.indexOf(target)].classList.add('ok');
          feedback(ok, target);
        } }, o));
        body.append(h('div', { class: 'm mt' }, e.type === 'listen' ? 'WAS BEDEUTET DAS?' : 'WIE SAGT MAN DAS?'),
          e.type === 'listen' ? h('div', { class: 'flash', onclick: () => say(e.c.en) }, '🔊 Antippen zum Hören') : h('div', { class: 'flash' }, e.c.de),
          h('div', { class: 'choice', style: { gridTemplateColumns: '1fr' } }, ...btns));
      } else if (e.type === 'build') {
        const chosen = [];
        const out = h('div', { class: 'flash', style: { minHeight: '90px', fontSize: '20px' } }, '…');
        const bank = h('div', { class: 'center' });
        const draw = () => {
          out.textContent = chosen.map((k) => e.words[k]).join(' ') || '…';
          bank.replaceChildren(...e.words.map((wd, k) => h('span', { class: 'word ' + (chosen.includes(k) ? 'used' : ''), onclick: () => { if (chosen.includes(k)) chosen.splice(chosen.indexOf(k), 1); else chosen.push(k); draw(); } }, wd)));
        };
        draw();
        body.append(h('div', { class: 'm mt' }, `BAU DEN SATZ AUF ${p.name.split(' ')[0].toUpperCase()}`), h('div', { class: 'flash', style: { minHeight: '70px', fontSize: '20px' } }, e.c.de), out, bank,
          h('button', { class: 'btn f', onclick: (ev) => {
            ev.currentTarget.disabled = true;
            const said = chosen.map((k) => e.words[k]).join(' ');
            const ok = [e.c.en, ...e.c.alt].some((t) => norm(t) === norm(said)); if (ok) correct++;
            feedback(ok, e.c.en);
          } }, 'Prüfen'));
      } else if (e.type === 'speak') {
        say(e.c.en);
        const res = h('div', { class: 'm mt' });
        body.append(h('div', { class: 'm mt' }, 'SPRICH DEN SATZ'), h('div', { class: 'flash', onclick: () => say(e.c.en) }, h('div', {}, e.c.en, h('div', { class: 'm', style: { marginTop: '10px' } }, e.c.de))), res,
          sttAvailable() ? h('button', { class: 'btn f', onclick: async (ev) => {
            const b = ev.currentTarget; b.disabled = true; res.textContent = 'ICH HÖRE ZU …';
            try {
              const alts = await listen({ lang: p.tts });
              const r = checkAnswer(alts, [e.c.en, ...e.c.alt]);
              res.textContent = `GEHÖRT: „${r.said}“ · ${Math.round(r.score * 100)} %`;
              const ok = r.verdict !== 'falsch'; if (ok) correct++;
              feedback(ok, e.c.en);
            } catch (err) { res.textContent = err.message; b.disabled = false; }
          } }, '🎙 Sprechen') : null,
          h('button', { class: 'btn', onclick: () => { correct++; feedback(true, e.c.en); } }, sttAvailable() ? 'Kein Mikro – laut gesagt ✓' : 'Laut gesagt ✓'));
      }
    };
    const finish = () => {
      const graded = total + retried.size;
      const pct = Math.round(Math.min(1, correct / Math.max(1, graded)) * 100);
      const first = !L.lessons[it.id];
      L.lessons[it.id] = { score: Math.max(pct, L.lessons[it.id]?.score || 0), date: iso() };
      const xp = 10 + (pct === 100 ? 5 : 0) + (first ? 5 : 0);
      L.xp += xp;
      stop('lektion');
      it.chunks.forEach(([fr]) => { const id = `${p.code}:${fr}`; if (!st.cards[id]) st.cards[id] = { due: iso() }; });
      bar.replaceChildren(progressBar(1));
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, '[ LEKTION ABGESCHLOSSEN ]'), h('div', { class: 'big' }, pct + '%'), h('div', { class: 'm' }, `+${xp} XP`)),
        card(h('div', { class: 'k' }, '[ CHUNKS DES TAGES ]'), h('ul', { class: 'plain' }, it.chunks.map(([fr, de]) => h('li', {}, h('b', {}, fr), h('span', { class: 'dim' }, ' – ' + de))))),
        h('button', { class: 'btn', onclick: () => abendText(it.chunks, p.tts) }, '🌙 Abendtext anhören'),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      const ev = [];
      if (p.code === 'en') {
        if (it.unit?.nato && it.li === 1) { const b = giveBadge(st, 'nato'); if (b) ev.push(b); }
        ['A1', 'A2', 'B1'].forEach((lv, k) => { const ls = lessonsOf(p).filter((x) => x.level === lv); if (ls.length && ls.every((x) => L.lessons[x.id])) { const b = giveBadge(st, 'englisch_p' + (k + 1)); if (b) ev.push(b); } });
      }
      onDone?.();
      app.award(15 + (pct === 100 ? 10 : 0), 'sprache', `Lektion geschafft: ${pct} %`);
      celebrate(ev);
    };
    show();
    return wrap;
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

export function abendText(chunks, tts = 'en-US') {
  const parts = ['Abendtext. Hör einfach zu.', 2];
  for (const [fr, de] of chunks) parts.push({ fr }, 1.5, de, 2, { fr }, 3);
  let cancel = false;
  const m = modal(() => h('div', {}, h('div', { class: 'k' }, '[ ABENDTEXT ]'), h('p', { class: 'dim' }, 'Kurz vor dem Schlafen anhören. Im Schlaf lernt man keine neuen Wörter – aber Wiederholen kurz vor dem Einschlafen festigt den Tagesstoff.'),
    h('ul', { class: 'plain' }, chunks.map(([fr, de]) => h('li', {}, fr, h('span', { class: 'dim' }, ' – ' + de))))));
  (async () => {
    for (const x of parts) {
      if (cancel) return;
      if (typeof x === 'number') await new Promise((r) => setTimeout(r, x * 1000));
      else if (typeof x === 'string') await speak(x, { lang: 'de-DE', rate: 0.9 });
      else await speak(ttsText(x.fr), { lang: tts, rate: 0.75 });
    }
  })();
  m.onClose(() => { cancel = true; stopSpeaking(); });
}

// ---------- Tests ----------
function quizItem(p, t, onAnswer) {
  const opts = shuffle(t.optionen.map((o, k) => ({ o, ok: k === t.loesung })));
  let plays = 0, answered = false;
  const play = () => { if (plays >= 3) return toast('Höchstens 3× hören – wie im Test.'); plays++; sayIn(p, t.text, 0.9); };
  const btns = opts.map((x) => h('button', { style: { fontSize: '17px', fontFamily: 'var(--head)' }, onclick: (ev) => {
    if (answered) return; answered = true; stopSpeaking();
    ev.currentTarget.classList.add(x.ok ? 'ok' : 'no'); btns[opts.findIndex((y) => y.ok)].classList.add('ok');
    setTimeout(() => onAnswer(x.ok), 650);
  } }, x.o));
  if (t.typ === 'hoeren') setTimeout(play, 250);
  const dunno = h('button', { class: 'btn s', onclick: () => { if (answered) return; answered = true; stopSpeaking(); btns[opts.findIndex((y) => y.ok)].classList.add('ok'); setTimeout(() => onAnswer(false), 900); } }, 'Weiß nicht');
  return h('div', {}, t.typ === 'hoeren' ? h('button', { class: 'btn s', onclick: play }, '🔊 Hören') : null, h('h2', {}, t.frage), h('div', { class: 'choice', style: { gridTemplateColumns: '1fr' } }, ...btns), dunno);
}

function speakItem(p, chunk, onAnswer) {
  const [fr, de, ...alt] = chunk;
  const res = h('div', { class: 'm mt' });
  return h('div', {}, h('div', { class: 'm' }, 'SPRICH AUF ' + p.name.split(' ')[0].toUpperCase() + ':'), h('div', { class: 'flash' }, de), res,
    sttAvailable() ? h('button', { class: 'btn f', onclick: async (ev) => {
      const b = ev.currentTarget; b.disabled = true; res.textContent = 'ICH HÖRE ZU …';
      try { const r = checkAnswer(await listen({ lang: p.tts }), [fr, ...alt]); res.textContent = `GEHÖRT: „${r.said}“ · ${Math.round(r.score * 100)} % · RICHTIG: ${fr}`; setTimeout(() => onAnswer(r.score >= 0.8), 1600); } catch (e) { res.textContent = e.message; b.disabled = false; }
    } }, '🎙 Sprechen') : null,
    h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '10px' } }, sttAvailable() ? 'OHNE MIKROFON: SELBST BEWERTEN' : 'SELBST BEWERTEN'),
      h('p', {}, 'Lösung: ', h('b', {}, fr)), h('div', { class: 'grid2' }, h('button', { class: 'btn danger', onclick: () => onAnswer(false) }, 'Nicht gekonnt'), h('button', { class: 'btn f', onclick: () => onAnswer(true) }, 'Flüssig gesagt'))));
}

export function runLevelTest(app, lv) {
  const st = app.state; const { p, L } = cur(st);
  const items = shuffle(testItems(p, lv)).slice(0, 10).map((t) => ({ t }));
  const chunks = lessonsOf(p).filter((x) => x.level === lv).flatMap((x) => x.chunks);
  shuffle(chunks).slice(0, 2).forEach((c) => items.push({ speak: c }));
  if (!items.length) return toast('Für diese Stufe gibt es noch keinen Test.');
  const stop = timer(L);
  let i = 0, ok = 0; const wrong = [];
  const m = modal(({ close }) => {
    const bar = h('div', {}); const body = h('div', {});
    const show = () => {
      bar.replaceChildren(progressBar(i / items.length));
      if (i >= items.length) return finish();
      const it = items[i];
      const answer = (good) => { if (good) ok++; else wrong.push(it); i++; show(); };
      body.replaceChildren(h('div', { class: 'm' }, `AUFGABE ${i + 1}/${items.length}`), it.t ? quizItem(p, it.t, answer) : speakItem(p, it.speak, answer));
    };
    const finish = () => {
      const pct = Math.round((ok / items.length) * 100); const passed = pct >= PASS * 100;
      L.tests[lv] = { date: iso(), pct, passed };
      stop('test');
      let up = false; if (passed) up = applyLevel(L, lv, 'stufentest');
      const ev = []; if (passed) { const b = giveBadge(st, 'ger_' + lv); if (b) ev.push(b); }
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, `[ STUFENTEST ${lv} ]`), h('div', { class: 'big' }, pct + '%'),
        h('h2', { class: passed ? 'olive' : 'warn' }, passed ? (up ? `${lv} erreicht.` : 'Bestanden.') : `Noch nicht. Ab ${PASS * 100} % ist ${lv} geschafft.`)),
        wrong.length ? card(h('div', { class: 'k' }, '[ DAS ÜBST DU NOCH ]'), h('ul', { class: 'plain small' }, wrong.map((w) => h('li', {}, w.t ? `${w.t.frage} → ${w.t.optionen[w.t.loesung]}` : `${w.speak[1]} → ${w.speak[0]}`)))) : null,
        h('p', { class: 'small dim' }, 'Übungstest der App, kein offizielles Zertifikat. Offizielle Nachweise: z. B. Cambridge-, TOEFL- oder bei der Bundeswehr SLP-Prüfung.'),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      app.award(passed ? 30 : 10, 'sprache', passed ? `Stufe ${lv} bestanden.` : 'Test gemacht. Weiter üben.');
      celebrate(ev);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ ${p.name.toUpperCase()} · STUFENTEST ${lv} ]`), bar, body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

export function runPlacement(app) {
  const st = app.state; const { p, L } = cur(st);
  const history = [];
  const stop = timer(L);
  const m = modal(({ close }) => {
    const body = h('div', {});
    const stage = (lv) => {
      const items = shuffle(testItems(p, lv)).slice(0, 4);
      let i = 0, ok = 0;
      const show = () => {
        if (i >= items.length) { history.push({ level: lv, correct: ok, total: items.length }); return step(); }
        body.replaceChildren(h('div', { class: 'm' }, `EINSTUFUNG · BLOCK ${history.length + 1} · AUFGABE ${i + 1}/${items.length}`), progressBar(i / items.length), quizItem(p, items[i], (good) => { if (good) ok++; i++; show(); }));
      };
      show();
    };
    const step = () => {
      const s = placementStep(p, history);
      if (!s.done) return stage(s.next);
      L.placement = { date: iso(), level: s.level, history };
      applyLevel(L, s.level, 'einstufung');
      stop('test');
      const w = workLevel(L);
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, '[ EINSTUFUNG ]'), h('div', { class: 'big' }, s.level || '< A1'),
        h('p', {}, s.level ? `Du startest mit Stufe ${w}. Lektionen der erreichten Stufen bleiben offen zum Wiederholen.` : 'Du startest bei A1. Genau richtig – Fundament zuerst.')),
        h('ul', { class: 'plain small' }, history.map((x) => h('li', {}, `${x.level}: ${x.correct}/${x.total} richtig`))),
        h('p', { class: 'small dim' }, 'Kurzer Übungstest zur Orientierung, kein offizielles Ergebnis. Wiederholbar jederzeit im Pfad.'),
        h('button', { class: 'btn f', onclick: close }, 'Los geht’s'));
      app.award(10, 'sprache', false);
    };
    step();
    return h('div', {}, h('div', { class: 'k' }, `[ ${p.name.toUpperCase()} · EINSTUFUNGSTEST ]`), h('p', { class: 'small dim' }, 'Hören und Verstehen, ca. 5 Minuten. Bei Hörfragen ist der Text höchstens 3× abspielbar. Nicht raten – „weiß nicht“ ist besser als Glück.'), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Karten (SM-2) ----------
function cardPool(st, p, L) {
  const out = [];
  const learned = lessonsOf(p).filter((x) => L.lessons[x.id]).flatMap((x) => x.chunks);
  const seen = new Set();
  for (const [fr, de] of learned) { const id = `${p.code}:${fr}`; if (!seen.has(id)) { seen.add(id); out.push({ id, front: fr, back: de, deck: 'gelernt' }); } }
  for (const d of p.decks || []) for (const [fr, de] of d.karten) out.push({ id: `${d.id}:${fr}`, front: fr, back: de, deck: d.id });
  for (const o of L.own) out.push({ id: 'own:' + o.id, front: o.front, back: o.back, deck: 'eigene' });
  return out;
}
const dueList = (st, p, L, deck) => cardPool(st, p, L).filter((c) => (!deck || c.deck === deck) && (c.deck !== 'gelernt' && c.deck !== 'eigene' ? !!st.cards[c.id] : true) && isDue(st.cards[c.id]));

function renderKarten(el, app) {
  const st = app.state; const { p, L } = cur(st);
  if (!p) return;
  const pool = cardPool(st, p, L);
  el.append(h('div', { class: 'k mt' }, `[ KARTEIKARTEN · ${p.name.toUpperCase()} ]`), h('p', { class: 'small dim' }, 'Wiederholung nach SM-2: Je leichter eine Karte, desto länger der Abstand (1 Tag, 6 Tage, dann wachsend). „Nochmal“ setzt sie zurück. Jeden Tag die fälligen Karten – nie mehr nachholen müssen.'));
  const deckCard = (title, deck, newAvail = 0) => {
    const list = pool.filter((c) => c.deck === deck); const due = dueList(st, p, L, deck).length;
    return card(h('div', {}, h('b', {}, title), h('div', { class: 'm' }, `${list.length} KARTEN · ${due} FÄLLIG${newAvail ? ` · ${newAvail} NEU` : ''}`)),
      h('div', { class: 'row mt' }, h('button', { class: 'btn s f', disabled: !due && !newAvail, onclick: () => runCards(app, deck, 'fremd') }, `${p.code.toUpperCase()} → DE`), h('button', { class: 'btn s', disabled: !due && !newAvail, onclick: () => runCards(app, deck, 'de') }, `DE → ${p.code.toUpperCase()}`)));
  };
  el.append(deckCard('Gelernte Chunks', 'gelernt'));
  for (const d of p.decks || []) el.append(deckCard(d.titel, d.id, pool.filter((c) => c.deck === d.id && !st.cards[c.id]).length));
  el.append(deckCard('Eigene Vokabeln', 'eigene'));
  if (!pool.some((c) => c.deck === 'gelernt')) el.append(h('p', { class: 'm' }, 'Gelernte Chunks erscheinen hier nach der ersten Lektion.'));
  const f = h('input', { placeholder: `${p.name.split(' ')[0]} (z. B. aus einem Podcast)` }), d = h('input', { placeholder: 'Deutsch' });
  el.append(card(h('div', { class: 'k' }, '[ EIGENE KARTE ANLEGEN ]'), h('p', { class: 'small dim' }, 'Ganze Sätze oder Wendungen statt Einzelwörter. Ab C1 kommen neue Wörter vor allem aus echten Quellen.'), field(p.name.split(' ')[0], f), field('Deutsch', d),
    h('button', { class: 'btn f', onclick: () => { if (!f.value.trim() || !d.value.trim()) return toast('Beide Felder ausfüllen.'); addOwn(L, f.value, d.value); app.save(); toast('Karte angelegt.'); app.refresh(); } }, '+ Karte'),
    L.own.length ? h('details', {}, h('summary', { class: 'm', style: { cursor: 'pointer', marginTop: '10px' } }, `EIGENE KARTEN (${L.own.length})`),
      h('ul', { class: 'list' }, ...L.own.map((o) => h('li', {}, h('div', { class: 'grow' }, h('b', {}, o.front), h('div', { class: 'dim small' }, o.back)),
        h('button', { class: 'btn s', style: { width: 'auto', margin: 0 }, onclick: async () => { if (await confirmBox('Karte löschen?', 'Löschen')) { L.own = L.own.filter((x) => x.id !== o.id); delete st.cards['own:' + o.id]; app.save(); app.refresh(); } } }, 'Löschen'))))) : null));
}
const addOwn = (L, front, back) => L.own.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), front: front.trim(), back: back.trim(), date: iso() });

function runCards(app, deck, dir, { max = 20, onDone } = {}) {
  const st = app.state; const { p, L } = cur(st);
  let list = dueList(st, p, L, deck);
  const decks = (p.decks || []).map((d) => d.id);
  if (deck && decks.includes(deck)) list = [...list, ...shuffle(cardPool(st, p, L).filter((c) => c.deck === deck && !st.cards[c.id])).slice(0, Math.max(0, 10 - list.length))];
  list = shuffle(list).slice(0, max);
  if (!list.length) return toast('Nichts fällig. Morgen wieder.');
  const stop = timer(L);
  let i = 0, known = 0; const again = new Set();
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      if (i >= list.length) {
        stop('karten'); onDone?.();
        body.replaceChildren(h('div', { class: 'center mt2' }, h('h2', {}, 'Durch!'), h('div', { class: 'big' }, `${known}/${list.length - again.size}`), h('div', { class: 'm' }, 'BEIM ERSTEN VERSUCH GEWUSST')), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
        app.award(5 + Math.min(10, known), 'sprache', false);
        return;
      }
      const c = list[i]; let flipped = false;
      const front = dir === 'fremd' ? c.front : c.back, back = dir === 'fremd' ? c.back : c.front;
      if (dir === 'fremd') sayIn(p, c.front);
      const fl = h('div', { class: 'flash' }, front);
      const grade = (q) => {
        if (!again.has(c.id)) { st.cards[c.id] = sm2(st.cards[c.id], q); if (q >= 3) known++; }
        if (q < 3 && !again.has(c.id)) { again.add(c.id); list.push(c); }
        i++; app.save(); show();
      };
      const pv = (q) => { const d = sm2Preview(st.cards[c.id], q); return d === 1 ? '1 T' : d + ' T'; };
      const btns = h('div', { class: 'grid4 hidden' },
        h('button', { class: 'btn danger', onclick: () => grade(1) }, h('div', {}, 'Nochmal'), h('small', {}, 'JETZT')),
        h('button', { class: 'btn', onclick: () => grade(3) }, h('div', {}, 'Schwer'), h('small', {}, pv(3))),
        h('button', { class: 'btn f', onclick: () => grade(4) }, h('div', {}, 'Gut'), h('small', {}, pv(4))),
        h('button', { class: 'btn', onclick: () => grade(5) }, h('div', {}, 'Leicht'), h('small', {}, pv(5))));
      fl.onclick = () => { if (flipped) { sayIn(p, c.front); return; } flipped = true; fl.replaceChildren(h('div', {}, front, h('div', { class: 'sand', style: { marginTop: '12px' } }, back))); btns.classList.remove('hidden'); if (dir !== 'fremd') sayIn(p, c.front); };
      body.replaceChildren(h('div', { class: 'm' }, `KARTE ${i + 1}/${list.length} · ANTIPPEN ZUM UMDREHEN`), fl, btns);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ ${p.name.toUpperCase()} · KARTEN ]`), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Tab: Hören (Shadowing, Gespräche, Quellen) ----------
function renderHoeren(el, app) {
  const st = app.state; const { p, L } = cur(st);
  if (!p) return;
  const w = workLevel(L);
  el.append(h('div', { class: 'k mt' }, '[ SHADOWING ]'), h('p', { class: 'small dim' }, 'Hören und sofort nachsprechen – erst Satz für Satz, dann gleichzeitig mit der Stimme. Trainiert Aussprache, Rhythmus und Hörverstehen zugleich (DLI-Methode).'));
  for (const lv of packLevels(p)) for (const sh of stufeOf(p, lv).shadowing || []) {
    const n = L.shadow[sh.id] || 0; const hard = levelIdx(lv) > levelIdx(w);
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => runShadow(app, { ...sh, lv }) },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, sh.titel), h('div', { class: 'm' }, `${lv} · ${sh.saetze.length} SÄTZE${hard ? ' · ANSPRUCHSVOLL' : ''}`)), h('span', { class: 'mono sand' }, n ? n + '×' : '—'))));
  }
  el.append(h('div', { class: 'k mt2' }, '[ FREI SPRECHEN ]'), h('button', { class: 'btn', onclick: () => runSpeak(app, 3) }, '🎙 Sprechaufgabe (3 min)'));
  if ((p.dialoge || []).length) {
    el.append(h('div', { class: 'k mt2' }, '[ GESPRÄCHE ]'), h('p', { class: 'small dim' }, 'Die App spricht, du antwortest per Mikrofon. Geprüft wird gegen mehrere richtige Antworten – ohne KI.'),
      sttAvailable() ? null : h('div', { class: 'card warnc' }, 'Spracheingabe nicht verfügbar – du kannst die Antworten eintippen.'));
    for (const d of p.dialoge) {
      const best = L.dialogs[d.id];
      el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => runDialog(app, d) },
        h('div', { class: 'row between' }, h('div', {}, h('b', {}, d.title), h('div', { class: 'm' }, `${d.stufe} · ${d.turns.length} ANTWORTEN`)), h('span', { class: 'mono sand' }, best != null ? best + '%' : '—'))));
    }
  }
  el.append(h('div', { class: 'k mt2' }, '[ ECHTE QUELLEN ]'), h('p', { class: 'small dim' }, 'Verständlicher Input: Hör Material, das du zu 70–90 % verstehst. Neue Wendungen als eigene Karte anlegen.'));
  for (const lv of packLevels(p)) {
    const q = stufeOf(p, lv).quellen || [];
    if (q.length) el.append(h('div', { class: 'm mt' }, `STUFE ${lv}${lv === w ? ' · DEINE STUFE' : ''}`), ...q.map(quelleCard));
  }
}

export function runShadow(app, sh, onDone) {
  const st = app.state; const { p, L } = cur(st);
  let rate = 0.8, i = 0, stopped = false;
  const stop = timer(L);
  const m = modal(({ close }) => {
    const body = h('div', {});
    const speed = seg([[0.6, 'Langsam'], [0.8, 'Mittel'], [1, 'Normal']], rate, (v) => { rate = v; });
    const show = () => {
      if (i >= sh.saetze.length) return whole();
      const [fr, de] = sh.saetze[i];
      const res = h('div', { class: 'm mt' });
      const trans = h('div', { class: 'm hidden', style: { marginTop: '10px' } }, de);
      sayIn(p, fr, rate);
      body.replaceChildren(h('div', { class: 'm' }, `SATZ ${i + 1}/${sh.saetze.length} · HÖREN, DANN SOFORT NACHSPRECHEN`), progressBar(i / sh.saetze.length),
        h('div', { class: 'flash', onclick: () => sayIn(p, fr, rate) }, h('div', {}, fr, trans)), res,
        h('div', { class: 'row wrap mt' }, h('button', { class: 'btn s', onclick: () => sayIn(p, fr, rate) }, '🔊 Nochmal'), h('button', { class: 'btn s', onclick: () => trans.classList.toggle('hidden') }, 'Deutsch')),
        sttAvailable() ? h('button', { class: 'btn', onclick: async (ev) => {
          const b = ev.currentTarget; b.disabled = true; res.textContent = 'ICH HÖRE ZU …';
          try { const r = checkAnswer(await listen({ lang: p.tts }), [fr]); const pc = Math.round(r.score * 100); res.replaceChildren(h('span', { class: pc >= 80 ? 'olive' : pc >= 55 ? 'sand' : 'warn' }, `AUSSPRACHE ${pc} % · GEHÖRT: „${r.said}“`)); } catch (e) { res.textContent = e.message; }
          b.disabled = false;
        } }, '🎙 Aussprache prüfen') : null,
        h('button', { class: 'btn f', onclick: () => { i++; show(); } }, 'Nachgesprochen – weiter'));
    };
    const whole = () => {
      body.replaceChildren(h('div', { class: 'k' }, '[ JETZT GLEICHZEITIG ]'), h('p', {}, 'Der ganze Text am Stück. Sprich gleichzeitig mit – leise anfangen, dann lauter. Nicht perfekt sein, im Rhythmus bleiben.'),
        card(h('ul', { class: 'plain' }, sh.saetze.map(([fr]) => h('li', {}, fr)))),
        h('button', { class: 'btn', onclick: async () => { stopped = false; for (const [fr] of sh.saetze) { if (stopped) break; await sayIn(p, fr, rate); await new Promise((r) => setTimeout(r, 400)); } } }, '▶ Am Stück abspielen'),
        h('button', { class: 'btn f', onclick: () => { L.shadow[sh.id] = (L.shadow[sh.id] || 0) + 1; stop('shadowing'); onDone?.(); app.award(10, 'sprache', 'Shadowing erledigt.'); close(); } }, 'Fertig'));
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ SHADOWING · ${sh.titel.toUpperCase()} ]`), h('div', { class: 'm mt' }, 'TEMPO'), speed, body);
  }, { full: true });
  m.onClose(() => { stopped = true; stopSpeaking(); app.refresh(); });
}

// Freies Sprechen mit Uhr und Aufnahme zum Selbst-Anhören (wird nicht gespeichert)
export function runSpeak(app, min = 3, onDone) {
  const st = app.state; const { p, L } = cur(st);
  const w = workLevel(L);
  const prompts = stufeOf(p, w).sprechen?.length ? stufeOf(p, w).sprechen : DEFAULT_SPRECHEN[w];
  let prompt = pick(prompts), iv = null, rec = null, left = Math.round(min * 60);
  const stop = timer(L);
  const m = modal(({ close }) => {
    const pr = h('h2', {}, prompt);
    const clock = h('div', { class: 'big center' }, `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
    const player = h('div', {});
    const recBtn = recAvailable() ? h('button', { class: 'btn', onclick: async () => {
      if (rec) { const r = rec; rec = null; recBtn.textContent = '🎙 Aufnehmen'; const { blob } = await r.stop(); player.replaceChildren(h('audio', { controls: true, src: URL.createObjectURL(blob) }), h('p', { class: 'small dim' }, 'Anhören: Wo stockst du? Welche Wörter fehlen? Diese als eigene Karte anlegen.')); return; }
      try { rec = await startRecording(); recBtn.textContent = '■ Aufnahme stoppen'; } catch (e) { toast(e.message); }
    } }, '🎙 Aufnehmen') : null;
    const startBtn = h('button', { class: 'btn f', onclick: () => {
      if (iv) return; startBtn.textContent = 'Läuft …'; beep(880, 150);
      iv = setInterval(() => { left--; clock.textContent = `${Math.floor(Math.max(0, left) / 60)}:${String(Math.max(0, left) % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(iv); beep(660, 400); startBtn.textContent = 'Zeit um'; } }, 1000);
    } }, '▶ Start');
    return h('div', {}, h('div', { class: 'k' }, `[ LAUT SPRECHEN · ${p.name.toUpperCase()} · ${w} ]`),
      h('p', { class: 'small dim' }, `Sprich die ganze Zeit laut auf ${p.name.split(' ')[0]}, ohne Notizen. Fehler sind erlaubt, Schweigen nicht. Fehlt ein Wort: umschreiben.`),
      pr, h('button', { class: 'btn s', onclick: () => { prompt = pick(prompts); pr.textContent = prompt; } }, '↻ Andere Aufgabe'), clock, startBtn, recBtn, player,
      h('button', { class: 'btn', onclick: () => { stop('sprechen'); onDone?.(); app.award(5, 'sprache', 'Laut gesprochen.'); close(); } }, 'Erledigt'));
  }, { full: true });
  m.onClose(() => { clearInterval(iv); rec?.cancel(); stopSpeaking(); app.refresh(); });
}

// Echte Quelle hören + neue Ausdrücke als Karten
function runQuelle(app, min, onDone) {
  const st = app.state; const { p, L } = cur(st);
  const qs = quellenFor(p, L);
  const stop = timer(L);
  const m = modal(({ close }) => {
    const f = h('input', { placeholder: p.name.split(' ')[0] }), d = h('input', { placeholder: 'Deutsch' });
    const added = h('ul', { class: 'plain small' });
    return h('div', {}, h('div', { class: 'k' }, `[ ECHTE QUELLE · ${min} MIN ]`),
      h('ol', { class: 'small' }, h('li', {}, `Eine Quelle öffnen und ${min} Minuten hören (Kopfhörer).`), h('li', {}, 'Nach jedem Abschnitt laut zusammenfassen – in der Fremdsprache.'), h('li', {}, 'Bis zu 5 neue Wendungen notieren und unten als Karte anlegen.')),
      ...(qs.length ? qs.map(quelleCard) : [h('p', { class: 'dim' }, 'Für diese Stufe sind keine Quellen hinterlegt. Nimm einen Podcast oder Nachrichten in der Sprache.')]),
      card(h('div', { class: 'k' }, '[ NEUE WENDUNG ]'), field(p.name.split(' ')[0], f), field('Deutsch', d),
        h('button', { class: 'btn', onclick: () => { if (!f.value.trim() || !d.value.trim()) return toast('Beide Felder ausfüllen.'); addOwn(L, f.value, d.value); added.append(h('li', {}, `${f.value} – ${d.value}`)); f.value = ''; d.value = ''; app.save(); } }, '+ Als Karte speichern'), added),
      h('button', { class: 'btn f', onclick: () => { stop('quelle', 90); onDone?.(); app.award(10, 'sprache', 'Hören erledigt.'); close(); } }, 'Gehört – erledigt'));
  }, { full: true });
  m.onClose(() => app.refresh());
}

// ---------- Gespräche ----------
function runDialog(app, d, onDone) {
  const st = app.state; const { p, L } = cur(st);
  let t = 0, ok = 0;
  const stop = timer(L);
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      if (t >= d.turns.length) {
        const pct = Math.round((ok / d.turns.length) * 100);
        L.dialogs[d.id] = Math.max(pct, L.dialogs[d.id] || 0);
        if (pct === 100) L.perfectDialogs = (L.perfectDialogs || 0) + 1;
        stop('gespraech'); onDone?.();
        body.replaceChildren(h('div', { class: 'center mt2' }, h('h2', {}, 'Gespräch beendet'), h('div', { class: 'big' }, pct + '%')), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
        const ev = p.code === 'en' && (L.perfectDialogs || 0) >= 5 ? giveBadge(st, 'funker') : null;
        app.award(10 + Math.round(pct / 10), 'sprache', false);
        if (ev) celebrate([ev]);
        return;
      }
      const turn = d.turns[t];
      const play = () => (turn.speakDe ? speak(turn.say, { lang: 'de-DE' }) : speak(turn.say, { lang: p.tts, rate: 0.9 }));
      play();
      const txt = h('div', { class: 'flash ' + (turn.speakDe ? '' : 'hidden'), style: { fontSize: '20px' } }, turn.say);
      const de = h('p', { class: 'dim hidden' }, turn.de);
      const res = h('div', {});
      const typed = h('input', { placeholder: 'oder Antwort eintippen' });
      const evaluate = (alts) => {
        const r = checkAnswer(alts, turn.expect);
        const good = r.verdict === 'richtig', near = r.verdict === 'fast';
        if (good || near) ok++;
        res.replaceChildren(h('div', { class: 'card ' + (good ? '' : near ? 'warnc' : 'badc') },
          h('h2', { class: good ? 'olive' : 'warn' }, good ? 'Richtig!' : near ? 'Fast richtig.' : 'Nicht verstanden.'),
          h('div', { class: 'm' }, `DU: „${r.said}“`), !good ? h('p', {}, 'Muster: ', h('b', {}, turn.hint)) : null,
          h('button', { class: 'btn s', onclick: () => sayIn(p, turn.hint) }, '🔊 Muster'),
          h('button', { class: 'btn f', onclick: () => { t++; show(); } }, 'Weiter')));
      };
      body.replaceChildren(h('div', { class: 'm' }, `ANTWORT ${t + 1}/${d.turns.length}`),
        h('div', { class: 'row wrap mt' }, h('button', { class: 'btn s', onclick: play }, '🔊 Nochmal'), h('button', { class: 'btn s', onclick: () => txt.classList.toggle('hidden') }, 'Text'), h('button', { class: 'btn s', onclick: () => de.classList.toggle('hidden') }, 'Deutsch')),
        txt, de,
        sttAvailable() ? h('button', { class: 'btn f', onclick: async (ev) => { const b = ev.currentTarget; b.disabled = true; b.textContent = 'ICH HÖRE ZU …'; try { evaluate(await listen({ lang: p.tts })); } catch (e) { toast(e.message); } b.disabled = false; b.textContent = '🎙 Antworten'; } }, '🎙 Antworten') : null,
        h('div', { class: 'row mt' }, typed, h('button', { class: 'btn s', onclick: () => typed.value.trim() && evaluate([typed.value]) }, 'OK')), res);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ ${d.title.toUpperCase()} ]`), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Tab: Sprachen ----------
const TEMPLATE = {
  code: 'it', name: 'Italienisch', tts: 'it-IT', fsi: 1, ziel: 'B2', hinweis: 'Kurzer Hinweis zur Sprache.',
  stufen: {
    A1: {
      ziel: 'Überleben und vorstellen',
      einheiten: [{ id: 'it1', titel: 'Vorstellen', lektionen: [[['Mi chiamo Ben.', 'Ich heiße Ben.'], ['Sono tedesco.', 'Ich bin Deutscher.']]] }],
      shadowing: [{ id: 'it-a1-1', titel: 'Vorstellen', saetze: [['Ciao, mi chiamo Ben.', 'Hallo, ich heiße Ben.']] }],
      quellen: [{ titel: 'Name der Quelle', url: 'https://example.org/', art: 'Podcast', text: 'Wofür die Quelle gut ist.' }],
      sprechen: ['Stell dich vor: Name, Herkunft, Beruf.'],
      test: [{ typ: 'wahl', frage: 'Was heißt „Grazie“?', optionen: ['Danke', 'Bitte', 'Hallo', 'Tschüss'], loesung: 0 }, { typ: 'hoeren', text: 'Mi chiamo Anna.', frage: 'Wie heißt die Person?', optionen: ['Anna', 'Maria', 'Laura', 'Sara'], loesung: 0 }],
    },
  },
  decks: [{ id: 'it-basis', titel: 'Grundwortschatz', karten: [['grazie', 'danke']] }],
};

function renderSprachen(el, app) {
  const st = app.state; const packs = allPacks(st); const active = packFor(st);
  el.append(h('div', { class: 'k mt' }, '[ SPRACHEN ]'), h('p', { class: 'small dim' }, 'Antippen zum Wechseln. Fortschritt wird je Sprache getrennt gespeichert.'));
  for (const p of Object.values(packs)) {
    const L = st.lang.langs[p.code] ? langState(st, p.code) : null;
    const e = L ? hoursEstimate(p, L) : null;
    const custom = !!st.lang.custom?.[p.code];
    el.append(h('div', { class: 'card ' + (p.code === active?.code ? 'activec' : ''), style: { cursor: 'pointer' }, onclick: () => { st.lang.active = p.code; app.save(); toast(`${p.name} aktiv.`); app.go('#/sprache/heute'); } },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, p.name), h('div', { class: 'm' }, `${packLevels(p).join(' ')} · ZIEL ${p.ziel || 'B2'} · ${FSI_TEXT[p.fsi || 1].toUpperCase()}${custom ? ' · IMPORTIERT' : ''}`)),
        h('span', { class: 'mono sand' }, p.code === active?.code ? 'AKTIV' : L?.level || '—')),
      L ? h('div', { class: 'm' }, `${Math.round((L.min || 0) / 6) / 10} H GELERNT${e?.target ? ` · BIS ${e.target} CA. ${e.range[0]}–${e.range[1]} H` : ''}`) : null,
      custom ? h('button', { class: 'btn s', style: { width: 'auto' }, onclick: async (ev) => { ev.stopPropagation(); if (await confirmBox(`Importiertes Paket „${p.name}“ entfernen? Dein Lernstand bleibt gespeichert.`, 'Entfernen')) { delete st.lang.custom[p.code]; if (st.lang.active === p.code) st.lang.active = 'en'; app.save(); app.refresh(); } } }, 'Paket entfernen') : null));
  }
  el.append(card(h('div', { class: 'k' }, '[ EHRLICH ]'), h('p', { class: 'small' }, 'Zwei neue Sprachen gleichzeitig bremsen beide. Empfehlung: Englisch hat Vorrang bis mindestens B2, eine zweite Sprache erst danach oder höchstens 10 Minuten am Tag.')));
  el.append(card(h('div', { class: 'k' }, '[ NEUE SPRACHE HINZUFÜGEN ]'),
    h('p', { class: 'small dim' }, 'Ohne Programmieren: Vorlage speichern, mit eigenen Sätzen füllen (z. B. am PC), hier importieren. Oder dauerhaft für alle: Datei nach app/sprachen/ legen und in app/sprachen/index.json eintragen.'),
    h('button', { class: 'btn', onclick: () => download('sprachpaket-vorlage.json', JSON.stringify(TEMPLATE, null, 2)) }, 'Vorlage speichern'),
    h('button', { class: 'btn f', onclick: async () => {
      const f = await pickFile('.json,application/json'); if (!f) return;
      let pk; try { pk = JSON.parse(await f.text()); } catch { return toast('Keine gültige JSON-Datei.'); }
      const err = validatePack(pk);
      if (err.length) { modal(() => h('div', {}, h('h2', {}, 'Paket fehlerhaft'), h('ul', { class: 'plain small' }, err.slice(0, 15).map((x) => h('li', {}, x))))); return; }
      if (builtinPacks()[pk.code] && !(await confirmBox(`Es gibt schon ein eingebautes Paket „${pk.code}“. Durch deine Datei ersetzen?`, 'Ersetzen'))) return;
      st.lang.custom = { ...(st.lang.custom || {}), [pk.code]: pk };
      app.save(); toast(`${pk.name} importiert.`); app.refresh();
    } }, 'Sprachpaket importieren')));
  el.append(card(h('div', { class: 'k' }, '[ TECHNIK ]'), h('ul', { class: 'plain small' },
    h('li', {}, `Vorlesen (Text-to-Speech): ${ttsAvailable() ? 'verfügbar' : 'nicht verfügbar'}. Stimmen je Sprache in Android unter Einstellungen → Sprache → Sprachausgabe nachladen.`),
    h('li', {}, `Aussprache prüfen (Spracherkennung): ${sttAvailable() ? 'verfügbar' : 'nicht verfügbar'}. In Chrome läuft die Erkennung über Google-Server und braucht Internet. Geprüft wird, ob die Erkennung deinen Satz versteht – ein guter Hinweis auf verständliche Aussprache, aber keine Lautanalyse.`),
    h('li', {}, `Aufnahme zum Selbst-Anhören: ${recAvailable() ? 'verfügbar' : 'nicht verfügbar'}.`))));
}
