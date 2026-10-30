// Bereich Sprache: Lernpfad wie Duolingo (Lektionen, Levels, Serie, Punkte), Karteikarten, Gespräche, weitere Sprachen.
import { h, card, modal, seg, toast, iconBtn, progressBar, celebrate } from '../ui.js';
import { UNITS_EN, PHASES_EN, FUNK_DECK, DIALOGS, OTHER_LANGS } from '../data/english.js';
import { buildExercises, flatChunks, levelLabel, checkAnswer, similarity, norm, review, isDue } from '../core/lang.js';
import { speak, speakScript, stopSpeaking, listen, sttAvailable } from '../core/speech.js';
import { iso, daysBetween, shuffle } from '../core/util.js';
import { giveBadge, streak } from '../core/rewards.js';

export const spracheTabs = [
  { key: 'pfad', label: 'Lernpfad', render: renderPfad },
  { key: 'karten', label: 'Karten', render: renderKarten },
  { key: 'gespraeche', label: 'Gespräche', render: renderDialoge },
  { key: 'sprachen', label: 'Sprachen', render: renderSprachen },
];

const ttsText = (s) => s.replace(/\(.*?\)/g, '').replace(/…/g, '').trim();
function langState(st, code = 'en') {
  const l = st.lang.langs[code] || (st.lang.langs[code] = { start: iso(), lessons: {}, xp: 0, dialogs: {}, perfectDialogs: 0 });
  return l;
}
const lessonsList = () => UNITS_EN.flatMap((u, ui) => u.lessons.map((chunks, li) => ({ id: `${u.id}-${li}`, unit: u, ui, li, chunks, title: `${u.title} ${li + 1}` })));

export function nextLesson(st) {
  const L = langState(st);
  return lessonsList().find((x) => !L.lessons[x.id]) || null;
}

function renderPfad(el, app) {
  const st = app.state; const L = langState(st);
  const all = lessonsList(); const done = all.filter((x) => L.lessons[x.id]).length;
  const week = Math.min(26, Math.floor(daysBetween(L.start, iso()) / 7) + 1);
  el.append(h('div', { class: 'grid3 mt' },
    h('div', { class: 'tile' }, h('i', {}, 'Level'), h('b', { style: { fontSize: '18px' } }, levelLabel(done, all.length))),
    h('div', { class: 'tile' }, h('i', {}, 'XP'), h('b', {}, L.xp)),
    h('div', { class: 'tile' }, h('i', {}, 'Serie'), h('b', {}, streak(st)))),
    h('div', { class: 'm mt' }, `WOCHE ${week}/26 · ${done}/${all.length} LEKTIONEN · 5–10 MIN TÄGLICH, IMMER LAUT SPRECHEN`), progressBar(done / all.length));
  const nl = nextLesson(st);
  if (nl) el.append(h('button', { class: 'btn f', onclick: () => runLesson(app, nl) }, `> Weiter: ${nl.title}`));
  const due = dueCards(st).length;
  if (due) el.append(h('button', { class: 'btn', onclick: () => app.go('#/sprache/karten') }, `Wiederholen: ${due} Karten fällig`));

  for (const ph of PHASES_EN) {
    el.append(h('div', { class: 'card' }, h('div', { class: 'k' }, `[ PHASE ${ph.n} · WOCHE ${ph.weeks} · ${ph.level} ]`), h('h2', {}, ph.name), h('div', { class: 'm' }, ph.goal)));
    const path = h('div', { class: 'path' });
    for (const u of UNITS_EN.filter((x) => x.phase === ph.n)) {
      path.append(h('div', { class: 'unit-h' }, h('b', {}, u.title), h('span', { class: 'm' }, `  · AB WOCHE ${u.week}`)));
      u.lessons.forEach((chunks, li) => {
        const it = all.find((x) => x.id === `${u.id}-${li}`);
        const isDone = !!L.lessons[it.id]; const isNext = nl && nl.id === it.id;
        const locked = !isDone && !isNext;
        path.append(h('div', { class: 'node ' + (isDone ? 'done' : isNext ? 'next' : 'lock'), onclick: () => (locked ? toast('Erst die vorherige Lektion abschließen.') : runLesson(app, it)) },
          h('div', {}, isDone ? `✓\n${L.lessons[it.id].score}%` : `L${li + 1}`)));
      });
    }
    el.append(path);
  }
  el.append(h('p', { class: 'm mt' }, 'Methode nach FSI/DLI: Hören vor Sprechen, ganze Sätze (Chunks), laut sprechen ab Tag 1, Wiederholung nach 1, 3, 7, 14, 30 Tagen. Abends die Lektion noch einmal anhören (Abendtext).'));
}

export function runLesson(app, it, lang = 'en', ttsLang = 'en-US') {
  const st = app.state; const L = langState(st, lang);
  const pool = lang === 'en' ? flatChunks(UNITS_EN.filter((u) => u.phase === it.unit.phase)) : OTHER_LANGS[lang].chunks;
  let queue = buildExercises(it.chunks, pool);
  const total = queue.filter((e) => e.type !== 'learn').length;
  let i = 0, correct = 0, retried = new Set();
  const say = (t, rate = 0.85) => speak(ttsText(t), { lang: ttsLang, rate });
  const m = modal(({ close }) => {
    const bar = h('div', {}); const body = h('div', {});
    const wrap = h('div', {}, h('div', { class: 'k' }, `[ ${it.title.toUpperCase()} ]`), bar, body);
    const next = () => {
      i++;
      if (i >= queue.length) return finish();
      show();
    };
    const feedback = (ok, solution) => {
      const fb = h('div', { class: 'card ' + (ok ? '' : 'warnc') }, h('h2', { class: ok ? 'olive' : 'warn' }, ok ? 'Richtig!' : 'Nicht ganz.'), ok ? null : h('p', {}, 'Richtig: ', h('b', {}, solution)),
        h('button', { class: 'btn f', onclick: next }, 'Weiter'));
      body.append(fb); fb.scrollIntoView?.({ behavior: 'smooth' });
      if (!ok) { say(solution); const cur = queue[i]; if (!cur.retry) { retried.add(cur); queue.push({ ...cur, retry: true }); } }
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
          bank.replaceChildren(...e.words.map((w, k) => h('span', { class: 'word ' + (chosen.includes(k) ? 'used' : ''), onclick: () => { if (chosen.includes(k)) chosen.splice(chosen.indexOf(k), 1); else chosen.push(k); draw(); } }, w)));
        };
        draw();
        body.append(h('div', { class: 'm mt' }, 'BAU DEN SATZ AUF ENGLISCH'), h('div', { class: 'flash', style: { minHeight: '70px', fontSize: '20px' } }, e.c.de), out, bank,
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
              const alts = await listen({ lang: ttsLang });
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
      // Karten für Wiederholung anlegen
      it.chunks.forEach(([en]) => { const id = `${lang}:${en}`; if (!st.cards[id]) st.cards[id] = { box: 0, due: iso() }; });
      bar.replaceChildren(progressBar(1));
      body.replaceChildren(h('div', { class: 'center mt2' }, h('div', { class: 'k' }, '[ LEKTION ABGESCHLOSSEN ]'), h('div', { class: 'big' }, pct + '%'), h('div', { class: 'm' }, `+${xp} XP`)),
        card(h('div', { class: 'k' }, '[ CHUNKS DES TAGES ]'), h('ul', { class: 'plain' }, it.chunks.map(([en, de]) => h('li', {}, h('b', {}, en), h('span', { class: 'dim' }, ' – ' + de))))),
        h('button', { class: 'btn', onclick: () => abendText(it.chunks, ttsLang) }, '🌙 Abendtext anhören'),
        h('button', { class: 'btn f', onclick: close }, 'Fertig'));
      const ev = [];
      if (lang === 'en') {
        if (it.unit?.nato && it.li === 1) { const b = giveBadge(st, 'nato'); if (b) ev.push(b); }
        for (const ph of [1, 2, 3]) {
          const ls = lessonsList().filter((x) => x.unit.phase === ph);
          if (ls.every((x) => L.lessons[x.id])) { const b = giveBadge(st, 'englisch_p' + ph); if (b) ev.push(b); }
        }
      }
      app.award(15 + (pct === 100 ? 10 : 0), 'sprache', `Lektion geschafft: ${pct} %`);
      celebrate(ev);
    };
    show();
    return wrap;
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

export function abendText(chunks, ttsLang = 'en-US') {
  const parts = ['Abendtext. Hör einfach zu.', 2];
  for (const [en, de] of chunks) parts.push({ en }, 1.5, de, 2, { en }, 3);
  let cancel = false;
  const m = modal(() => h('div', {}, h('div', { class: 'k' }, '[ ABENDTEXT ]'), h('p', { class: 'dim' }, 'Kurz vor dem Schlafen anhören. Im Schlaf lernt man keine neuen Wörter – aber Wiederholen kurz vor dem Einschlafen festigt den Tagesstoff.'),
    h('ul', { class: 'plain' }, chunks.map(([en, de]) => h('li', {}, en, h('span', { class: 'dim' }, ' – ' + de))))));
  (async () => {
    for (const p of parts) {
      if (cancel) return;
      if (typeof p === 'number') await new Promise((r) => setTimeout(r, p * 1000));
      else if (typeof p === 'string') await speak(p, { lang: 'de-DE', rate: 0.9 });
      else await speak(ttsText(p.en), { lang: ttsLang, rate: 0.75 });
    }
  })();
  m.onClose(() => { cancel = true; stopSpeaking(); });
}

// ---------- Karteikarten ----------
function cardPool(st) {
  const learned = Object.keys(st.cards).filter((k) => k.startsWith('en:')).map((k) => k.slice(3));
  const map = new Map(flatChunks(UNITS_EN).map(([en, de]) => [en, de]));
  const out = learned.filter((en) => map.has(en)).map((en) => ({ id: 'en:' + en, front: en, back: map.get(en), deck: 'gelernt' }));
  for (const [en, de] of FUNK_DECK) out.push({ id: 'funk:' + en, front: en, back: de, deck: 'funk' });
  return out;
}
const dueCards = (st, deck) => cardPool(st).filter((c) => (!deck || c.deck === deck) && (c.deck === 'gelernt' || st.cards[c.id]) && isDue(st.cards[c.id]));

function renderKarten(el, app) {
  const st = app.state;
  const pool = cardPool(st);
  const learned = pool.filter((c) => c.deck === 'gelernt');
  const funkSeen = pool.filter((c) => c.deck === 'funk' && st.cards[c.id]);
  el.append(h('div', { class: 'k mt' }, '[ KARTEIKARTEN ]'), h('p', { class: 'small dim' }, 'Wiederholung nach 1, 3, 7, 14, 30 Tagen (Leitner-System). Gewusst → Abstand wächst. Nicht gewusst → morgen wieder.'));
  const deckCard = (title, deck, list, newAvail) => {
    const due = dueCards(st, deck).length;
    return card(h('div', { class: 'row between' }, h('div', {}, h('b', {}, title), h('div', { class: 'm' }, `${list.length} KARTEN · ${due} FÄLLIG${newAvail ? ` · ${newAvail} NEU` : ''}`))),
      h('div', { class: 'row mt' }, h('button', { class: 'btn s f', disabled: !due && !newAvail, onclick: () => runCards(app, deck, 'en') }, 'EN → DE'), h('button', { class: 'btn s', disabled: !due && !newAvail, onclick: () => runCards(app, deck, 'de') }, 'DE → EN')));
  };
  el.append(deckCard('Gelernte Chunks', 'gelernt', learned, 0));
  el.append(deckCard('Funkvokabular (NATO-Alphabet, Funkbegriffe)', 'funk', funkSeen, pool.filter((c) => c.deck === 'funk' && !st.cards[c.id]).length));
  if (!learned.length) el.append(h('p', { class: 'm' }, 'Gelernte Chunks erscheinen hier nach der ersten Lektion.'));
}

function runCards(app, deck, dir) {
  const st = app.state;
  let list = dueCards(st, deck);
  if (deck === 'funk') list = [...list, ...shuffle(cardPool(st).filter((c) => c.deck === 'funk' && !st.cards[c.id])).slice(0, Math.max(0, 10 - list.length))];
  list = shuffle(list).slice(0, 20);
  if (!list.length) return toast('Nichts fällig. Morgen wieder.');
  let i = 0, known = 0;
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      if (i >= list.length) {
        body.replaceChildren(h('div', { class: 'center mt2' }, h('h2', {}, 'Durch!'), h('div', { class: 'big' }, `${known}/${list.length}`)), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
        app.award(5 + Math.min(10, known), 'sprache', false);
        return;
      }
      const c = list[i]; let flipped = false;
      const front = dir === 'en' ? c.front : c.back, back = dir === 'en' ? c.back : c.front;
      if (dir === 'en') speak(ttsText(c.front), { lang: 'en-US', rate: 0.85 });
      const fl = h('div', { class: 'flash' }, front);
      const btns = h('div', { class: 'grid2 hidden' },
        h('button', { class: 'btn danger', onclick: () => { st.cards[c.id] = review(st.cards[c.id], false); i++; app.save(); show(); } }, 'Nicht gewusst'),
        h('button', { class: 'btn f', onclick: () => { st.cards[c.id] = review(st.cards[c.id], true); known++; i++; app.save(); show(); } }, 'Gewusst'));
      fl.onclick = () => { if (flipped) { speak(ttsText(c.front), { lang: 'en-US', rate: 0.85 }); return; } flipped = true; fl.replaceChildren(h('div', {}, front, h('div', { class: 'sand', style: { marginTop: '12px' } }, back))); btns.classList.remove('hidden'); if (dir === 'de') speak(ttsText(c.front), { lang: 'en-US', rate: 0.85 }); };
      body.replaceChildren(h('div', { class: 'm' }, `KARTE ${i + 1}/${list.length} · ANTIPPEN ZUM UMDREHEN`), fl, btns);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, deck === 'funk' ? '[ FUNKVOKABULAR ]' : '[ GELERNTE CHUNKS ]'), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Gespräche ----------
function renderDialoge(el, app) {
  const st = app.state; const L = langState(st);
  el.append(h('div', { class: 'k mt' }, '[ GESPRÄCHE ]'), h('p', { class: 'small dim' }, 'Die App spricht, du antwortest per Mikrofon. Geprüft wird gegen mehrere richtige Antworten – ohne KI. Erst nur hören, Text bei Bedarf einblenden.'),
    sttAvailable() ? null : h('div', { class: 'card warnc' }, 'Spracheingabe nicht verfügbar – du kannst die Antworten eintippen.'));
  for (const d of DIALOGS) {
    const best = L.dialogs[d.id];
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => runDialog(app, d) },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, d.title), h('div', { class: 'm' }, `PHASE ${d.level} · ${d.turns.length} ANTWORTEN`)), h('span', { class: 'mono sand' }, best != null ? best + '%' : '—'))));
  }
}

function runDialog(app, d) {
  const st = app.state; const L = langState(st);
  let t = 0, ok = 0;
  const m = modal(({ close }) => {
    const body = h('div', {});
    const show = () => {
      if (t >= d.turns.length) {
        const pct = Math.round((ok / d.turns.length) * 100);
        L.dialogs[d.id] = Math.max(pct, L.dialogs[d.id] || 0);
        if (pct === 100) L.perfectDialogs = (L.perfectDialogs || 0) + 1;
        body.replaceChildren(h('div', { class: 'center mt2' }, h('h2', {}, 'Gespräch beendet'), h('div', { class: 'big' }, pct + '%')), h('button', { class: 'btn f', onclick: close }, 'Fertig'));
        const ev = (L.perfectDialogs || 0) >= 5 ? giveBadge(st, 'funker') : null;
        app.award(10 + Math.round(pct / 10), 'sprache', false);
        if (ev) celebrate([ev]);
        return;
      }
      const turn = d.turns[t];
      const play = () => (turn.speakDe ? speak(turn.say, { lang: 'de-DE' }) : speak(turn.say, { lang: 'en-US', rate: 0.9 }));
      play();
      const txt = h('div', { class: 'flash ' + (turn.speakDe ? '' : 'hidden'), style: { fontSize: '20px' } }, turn.say);
      const de = h('p', { class: 'dim hidden' }, turn.de);
      const res = h('div', {});
      const typed = h('input', { placeholder: 'oder Antwort eintippen' });
      const evaluate = (alts) => {
        const r = checkAnswer(alts, turn.expect);
        const good = r.verdict === 'richtig', close_ = r.verdict === 'fast';
        if (good || close_) ok++;
        res.replaceChildren(h('div', { class: 'card ' + (good ? '' : close_ ? 'warnc' : 'badc') },
          h('h2', { class: good ? 'olive' : 'warn' }, good ? 'Richtig!' : close_ ? 'Fast richtig.' : 'Nicht verstanden.'),
          h('div', { class: 'm' }, `DU: „${r.said}“`), !good ? h('p', {}, 'Muster: ', h('b', {}, turn.hint)) : null,
          h('button', { class: 'btn s', onclick: () => speak(ttsText(turn.hint), { lang: 'en-US', rate: 0.85 }) }, '🔊 Muster'),
          h('button', { class: 'btn f', onclick: () => { t++; show(); } }, 'Weiter')));
      };
      body.replaceChildren(h('div', { class: 'm' }, `ANTWORT ${t + 1}/${d.turns.length}`),
        h('div', { class: 'row wrap mt' }, h('button', { class: 'btn s', onclick: play }, '🔊 Nochmal'), h('button', { class: 'btn s', onclick: () => txt.classList.toggle('hidden') }, 'Text'), h('button', { class: 'btn s', onclick: () => de.classList.toggle('hidden') }, 'Deutsch'), h('button', { class: 'btn s', onclick: () => toast('Tipp: ' + turn.hint, 4000) }, 'Tipp')),
        txt, de,
        sttAvailable() ? h('button', { class: 'btn f', onclick: async (ev) => { const b = ev.currentTarget; b.disabled = true; b.textContent = 'ICH HÖRE ZU …'; try { evaluate(await listen({ lang: 'en-US' })); } catch (e) { toast(e.message); } b.disabled = false; b.textContent = '🎙 Antworten'; } }, '🎙 Antworten') : null,
        h('div', { class: 'row mt' }, typed, h('button', { class: 'btn s', onclick: () => typed.value.trim() && evaluate([typed.value]) }, 'OK')), res);
    };
    show();
    return h('div', {}, h('div', { class: 'k' }, `[ ${d.title.toUpperCase()} ]`), body);
  }, { full: true });
  m.onClose(() => { stopSpeaking(); app.refresh(); });
}

// ---------- Weitere Sprachen ----------
function renderSprachen(el, app) {
  const st = app.state; const L = langState(st);
  const p2 = lessonsList().filter((x) => x.unit.phase <= 2);
  const b1 = p2.every((x) => L.lessons[x.id]);
  el.append(card(h('div', { class: 'k' }, '[ HAUPTSPRACHE ]'), h('h2', {}, 'Englisch'), h('div', { class: 'm' }, `${Object.keys(L.lessons).length} LEKTIONEN · ${L.xp} XP`)));
  el.append(h('div', { class: 'k mt2' }, '[ WEITERE SPRACHEN · ÜBERLEBENS-SET ]'),
    b1 ? h('p', { class: 'small dim' }, 'Englisch-Grundlage steht. Eine zweite Sprache ist jetzt sinnvoll.') : h('div', { class: 'card warnc' }, h('p', { class: 'small' }, 'Ehrlich: Eine zweite Sprache parallel bremst beide. Empfehlung: erst wenn Englisch Phase 2 abgeschlossen ist (ca. B1). Schnuppern geht trotzdem.')));
  for (const [code, lg] of Object.entries(OTHER_LANGS)) {
    const S = st.lang.langs[code];
    const done = S?.lessons?.['s-0'];
    el.append(h('div', { class: 'card', style: { cursor: 'pointer' }, onclick: () => runLesson(app, { id: 's-0', title: `${lg.name} · Überlebens-Set`, chunks: lg.chunks }, code, lg.tts) },
      h('div', { class: 'row between' }, h('div', {}, h('b', {}, lg.name), h('div', { class: 'm' }, `${lg.chunks.length} CHUNKS · HALLO, DANKE, HILFE, ARZT, ZAHLEN`)), h('span', { class: 'mono sand' }, done ? done.score + '%' : '—'))));
  }
  el.append(h('p', { class: 'm mt' }, 'Erste Einsatz-Themen in jeder neuen Sprache: Kontakt mit Zivilisten und Erste Hilfe. Weitere Sprachen lassen sich in data/english.js ergänzen.'));
}
