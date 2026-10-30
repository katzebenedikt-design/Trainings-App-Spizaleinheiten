// Logik-Tests: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, normalize, parseBackup } from '../app/js/core/store.js';
import { phasesFor, plannedDay, weekPlan, score7D, adaptAfterTest, calisthenics, currentBest } from '../app/js/core/plan.js';
import { readiness, applyReadiness } from '../app/js/core/readiness.js';
import { suggestNext, effLoad, bests } from '../app/js/core/strength.js';
import { parseFIT, splitCSV, harvestGarminJSON } from '../app/js/core/garmin.js';
import { parseVoice, wordToNum } from '../app/js/core/voiceparse.js';
import { checkAnswer, similarity, buildExercises, review } from '../app/js/core/lang.js';
import { mathTask, patternTask, nextLevel, memoryTask, switchItem } from '../app/js/core/games.js';
import { award, rankFor, streak } from '../app/js/core/rewards.js';
import { parseTime, fmtTime, isoWeekKey, weekday, addDays } from '../app/js/core/util.js';
import { UNITS_EN, DIALOGS } from '../app/js/data/english.js';
import { EXERCISES } from '../app/js/data/exercises.js';
import { COURSES } from '../app/js/data/courses.js';

const st0 = () => { const s = defaultState(); s.created = '2026-10-30T10:00:00Z'; return s; };

test('Zeit parsen/formatieren', () => {
  assert.equal(parseTime('13:56'), 836);
  assert.equal(parseTime('13,56'), 836);
  assert.equal(parseTime('1:02:30'), 3750);
  assert.equal(fmtTime(836), '13:56');
  assert.equal(fmtTime(3750), '1:02:30');
  assert.equal(weekday('2026-11-02'), 0); // Montag
  assert.equal(isoWeekKey('2026-10-30'), '2026-W44');
});

test('Phasen bis 2028 rückwärts geplant', () => {
  const ph = phasesFor('2026-10-30', '2028-06-01');
  assert.deepEqual(ph.map((p) => p.key), ['grundlage', 'aufbau', 'leistung', 'spezifik', 'taper']);
  assert.equal(ph[ph.length - 1].weeks, 2);
  for (let i = 1; i < ph.length; i++) assert.equal(addDays(ph[i - 1].to, 1), ph[i].from);
});

test('Wochenplan: Gym nur Mo–Fr, Sonntag Ruhe, Entlastungswoche mit Test', () => {
  const s = st0();
  for (let w = 0; w < 16; w++) {
    const week = weekPlan(s, addDays('2026-11-02', w * 7));
    assert.equal(week[6].sessions[0].code, 'REST');
    for (const d of week.slice(5)) for (const se of d.sessions) assert.ok(!se.gym, 'Kein Gym am Wochenende ' + d.date);
    if (week[0].deload) assert.equal(week[5].sessions[0].code, 'TEST');
  }
  const day = plannedDay(s, '2026-11-02');
  assert.ok(day.sessions[0].blocks.length > 0);
});

test('Berufsschulwoche ändert den Plan', () => {
  const s = st0();
  const a = weekPlan(s, '2026-11-02');
  s.week.overrides['2026-W45'] = 'schule';
  const b = weekPlan(s, '2026-11-02');
  assert.notDeepEqual(a.map((d) => d.sessions.map((x) => x.code)), b.map((d) => d.sessions.map((x) => x.code)));
});

test('Schonmodus-Regeln', () => {
  const s = st0(); const d = '2026-11-03';
  assert.equal(readiness(s, d).mode, 'offen');
  s.checkins.push({ date: d, schlaf: 4, energie: 4, kater: 2, schmerz: 1, stimmung: 4 });
  assert.equal(readiness(s, d).mode, 'normal');
  s.checkins[0] = { date: d, schlaf: 4, energie: 4, kater: 2, schmerz: 4, stimmung: 4 };
  const r = readiness(s, d); assert.equal(r.mode, 'pause'); assert.ok(r.doctor);
  s.checkins[0] = { date: d, schlaf: 2, energie: 2, kater: 3, schmerz: 1, stimmung: 3 };
  assert.equal(readiness(s, d).mode, 'leicht');
  // Ruhepuls erhöht
  for (let i = 1; i <= 7; i++) s.checkins.push({ date: addDays(d, -i), schlaf: 4, energie: 4, kater: 1, schmerz: 1, stimmung: 4, ruhepuls: 52 });
  s.checkins[0] = { date: d, schlaf: 4, energie: 4, kater: 1, schmerz: 1, stimmung: 4, ruhepuls: 63 };
  assert.equal(readiness(s, d).mode, 'pause');
  const sess = applyReadiness(plannedDay(s, d).sessions, readiness(s, d));
  assert.equal(sess[0].code, 'REST');
});

test('7D-Punkte und Anpassung nach Test', () => {
  const r = score7D({ run3000: 836, pullups: 11, swim100: 130 });
  assert.ok(['A', 'B', 'C'].includes(r.group));
  const s = st0();
  const t = { id: 't1', date: '2026-11-28', run3000: 800, pullups: 13, pushups: 45, situps: 44 };
  s.tests.push(t);
  const ad = adaptAfterTest(s, t);
  assert.ok(ad.volFactor > 1);
  assert.equal(ad.focus.length, 2);
  assert.equal(currentBest(s).run3000, 800);
  assert.deepEqual(calisthenics(41, 11), { push: [5, '15–20'], pull: [5, '5–6'] });
});

test('Kraft: KG + Zusatz und Vorschlag', () => {
  const s = st0();
  s.bodyweight.push({ date: '2026-11-01', kg: 75 });
  const ex = EXERCISES.find((e) => e.id === 'klimmzug');
  assert.equal(effLoad(ex, { kg: 10 }, 75), 85);
  s.strength.push({ id: 'a', date: '2026-11-02', exId: 'klimmzug', sets: [{ reps: 8, kg: 5 }, { reps: 8, kg: 5 }], range: [6, 8] });
  const sug = suggestNext(s, ex);
  assert.match(sug.text, /\+2.5 kg/);
  assert.ok(bests(s, ex).best1rm.v > 80);
  const bank = EXERCISES.find((e) => e.id === 'bankdruecken');
  s.strength.push({ id: 'b', date: '2026-11-02', exId: 'bankdruecken', sets: [{ reps: 20, kg: 40 }, { reps: 18, kg: 40 }], range: [20, 25] });
  assert.match(suggestNext(s, bank).text, /1 Wiederholung mehr/);
});

test('FIT-Datei lesen (synthetisch)', () => {
  // Header 14 Byte + Definition (Session, 4 Felder) + Daten
  const fields = [[2, 4, 0x86], [5, 1, 0x00], [7, 4, 0x86], [9, 4, 0x86], [16, 1, 0x02]];
  const def = [0x40, 0, 0, 18, 0, fields.length, ...fields.flat()];
  const dv = new DataView(new ArrayBuffer(4 + 1 + 4 + 4 + 1));
  dv.setUint32(0, 1100000000, true); dv.setUint8(4, 1); dv.setUint32(5, 1800000, true); dv.setUint32(9, 500000, true); dv.setUint8(13, 150);
  const data = [0x00, ...new Uint8Array(dv.buffer)];
  const body = [...def, ...data];
  const hdr = new Uint8Array(14); const hv = new DataView(hdr.buffer);
  hv.setUint8(0, 14); hv.setUint8(1, 0x10); hv.setUint32(4, body.length, true); hdr.set([46, 70, 73, 84], 8);
  const buf = new Uint8Array([...hdr, ...body, 0, 0]).buffer;
  const r = parseFIT(buf);
  assert.equal(r.sessions.length, 1);
  assert.equal(r.sessions[0].sport, 'lauf');
  assert.equal(r.sessions[0].durSec, 1800);
  assert.equal(r.sessions[0].distM, 5000);
  assert.equal(r.sessions[0].avgHR, 150);
});

test('CSV und Garmin-JSON', () => {
  const rows = splitCSV('a;b\n"1,5";"x ""y"""\n');
  assert.deepEqual(rows[1], ['1,5', 'x "y"']);
  const acc = { acts: [], daily: {} };
  harvestGarminJSON([{ calendarDate: '2026-10-01', restingHeartRate: 52, totalSteps: 9000 }, { calendarDate: '2026-10-01', deepSleepSeconds: 7200, lightSleepSeconds: 14400, remSleepSeconds: 3600 },
    { activityType: { typeKey: 'running' }, startTimeLocal: 1790000000000, duration: 1800000, distance: 500000, avgHr: 148 }], 'x', acc);
  assert.equal(acc.daily['2026-10-01'].restHR, 52);
  assert.equal(acc.daily['2026-10-01'].sleepH, 7);
  assert.equal(acc.acts[0].distM, 5000);
  assert.equal(acc.acts[0].durSec, 1800);
});

test('Spracheingabe verstehen', () => {
  assert.equal(wordToNum('siebenundfünfzig'), 57);
  assert.deepEqual(parseVoice('Gewicht 72,5'), { kind: 'gewicht', kg: 72.5 });
  assert.deepEqual(parseVoice('Klimmzüge zwölf'), { kind: 'wdh', key: 'pullups', value: 12 });
  const l = parseVoice('Lauf 5 Kilometer 28 Minuten 30');
  assert.equal(l.kind, 'lauf'); assert.equal(l.distM, 5000); assert.equal(l.durSec, 1710);
  const r = parseVoice('3000 Meter 13:56');
  assert.equal(r.distM, 3000); assert.equal(r.durSec, 836);
  const m = parseVoice('Marsch 12 Kilometer 2 Stunden 15 Kilo');
  assert.equal(m.kind, 'marsch'); assert.equal(m.kg, 15); assert.equal(m.durSec, 7200);
  assert.equal(parseVoice('Ruhepuls 54').bpm, 54);
});

test('Antworten prüfen ohne KI', () => {
  assert.equal(checkAnswer(['loud and clear over'], ['alfa one this is bravo two loud and clear over', 'loud and clear over']).verdict, 'richtig');
  assert.equal(checkAnswer(['alpha one this is bravo 2 loud and clear over'], ['alfa one this is bravo two loud and clear over']).verdict, 'richtig');
  assert.equal(checkAnswer(['my name is Tom'], ['my name is *']).verdict, 'richtig');
  assert.equal(checkAnswer(['banana'], ['say again over']).verdict, 'falsch');
  assert.ok(similarity("I'm from Germany", 'I am from Germany') > 0.99);
  const ex = buildExercises(UNITS_EN[0].lessons[0], UNITS_EN.flatMap((u) => u.lessons.flat()));
  assert.ok(ex.filter((e) => e.type === 'learn').length === 5);
  for (const e of ex.filter((x) => x.options)) assert.equal(new Set(e.options).size, e.options.length);
  assert.deepEqual(review({ box: 2 }, true, '2026-11-01'), { box: 3, due: '2026-11-08' });
  assert.deepEqual(review({ box: 4 }, false, '2026-11-01'), { box: 1, due: '2026-11-02' });
  // Jeder Dialog hat erwartete Antworten
  for (const d of DIALOGS) for (const t of d.turns) assert.ok(t.expect.length);
});

test('Spiele: Aufgaben korrekt, Level 70–85 %', () => {
  for (let L = 1; L <= 20; L++) for (let i = 0; i < 30; i++) {
    const t = mathTask(L); assert.ok(Number.isFinite(t.a), t.q);
    const p = patternTask(L); assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, 4);
    const m = memoryTask(L); assert.equal(m.answer.length, m.items.length);
    const sw = switchItem('FARBE', 0.3); assert.ok(['L', 'R'].includes(sw.correct));
  }
  assert.equal(nextLevel(3, 0.9), 4); assert.equal(nextLevel(3, 0.75), 3); assert.equal(nextLevel(3, 0.5), 2); assert.equal(nextLevel(1, 0.1), 1);
});

test('Punkte, Rang, Serie, Abzeichen', () => {
  const s = st0();
  s.checkins.push({ date: '2026-11-01', schlaf: 3, energie: 3, kater: 1, schmerz: 1, stimmung: 3 });
  const ev = award(s, 300, 'checkin', '2026-11-01');
  assert.ok(ev.some((e) => e.type === 'rank' && e.rank.name === 'Gefreiter'));
  assert.ok(ev.some((e) => e.type === 'badge' && e.id === 'erster_checkin'));
  for (let i = 1; i < 7; i++) award(s, 1, 'checkin', addDays('2026-11-01', i));
  assert.equal(streak(s, '2026-11-07'), 7);
  assert.ok(s.rewards.badges.serie7);
  assert.equal(rankFor(0).name, 'Rekrut');
});

test('Sicherung: Export/Import', () => {
  const s = st0(); s.profile.name = 'Test';
  const back = parseBackup(JSON.stringify({ app: 'trainings-app-spezialeinheiten', state: s }));
  assert.equal(back.profile.name, 'Test');
  assert.ok(Array.isArray(back.checkins));
  assert.throws(() => parseBackup('{"x":1}'));
  const n = normalize({ profile: { name: 'X' } });
  assert.equal(n.profile.heightCm, 176);
});

test('Inhalte vollständig', () => {
  assert.equal(UNITS_EN.length, 18);
  assert.equal(new Set(UNITS_EN.map((u) => u.phase)).size, 3);
  for (const c of COURSES) { assert.ok(c.quiz.length >= 3); for (const q of c.quiz) assert.ok(q.ok < q.a.length); }
  assert.deepEqual(COURSES.map((c) => c.id).sort(), ['dienstgrade', 'erstehilfe', 'funk', 'kompass', 'nato', 'rucksack', 'tarnen', 'verhalten', 'waffen'].sort());
});
