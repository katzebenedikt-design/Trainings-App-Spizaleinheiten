// Körperbild: Schmerzen passen den Plan an, Warnzeichen stoppen das Training, Regeln bleiben gültig.
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../app/js/core/store.js';
import { plannedDay } from '../app/js/core/planner.js';
import { violations } from '../app/js/core/rules.js';
import { aktiveSchmerzen, warnzeichen } from '../app/js/core/schmerz.js';
import { REGIONEN, KOERPER } from '../app/js/data/koerper.js';
import { EXERCISES } from '../app/js/data/exercises.js';
import { addDays, weekday } from '../app/js/core/util.js';

const st = () => { const s = defaultState(); s.created = '2026-11-02T08:00:00Z'; s.profile.targetDate = '2028-06-05'; return s; };
const MON = '2026-11-16';
const allEx = (day) => day.sessions.flatMap((x) => x.blocks.flatMap((b) => (b.ex || []).map((e) => e.id)));

test('Konfiguration: alle Stellen vorne/hinten, Übungs-IDs gültig, Reha vollständig', () => {
  const ids = new Set(EXERCISES.map((e) => e.id));
  for (const [k, r] of Object.entries(REGIONEN)) { for (const id of r.uebungen) assert.ok(ids.has(id), `${k}: ${id}`); for (const t of ['mobil', 'dehnen', 'kraeftigen']) assert.ok(r.reha[t].length, `${k} ${t}`); }
  for (const v of ['vorne', 'hinten']) for (const x of KOERPER[v]) assert.ok(REGIONEN[x.typ], x.id);
  assert.ok(KOERPER.vorne.length >= 18 && KOERPER.hinten.length >= 18);
});

test('Knieschmerz (4/10, dumpf): kein Laufen/Marsch, Kniebeugen raus, Reha rein, Regeln bleiben', () => {
  const s = st(); s.pain.push({ id: 'k', date: MON, typ: 'knie', seite: 'r', staerke: 4, art: 'dumpf', label: 'Knie rechts' });
  for (let i = 0; i < 7; i++) {
    const d = addDays(MON, i); const day = plannedDay(s, d, { withReadiness: false });
    assert.deepEqual(violations(d, day.sessions), [], d);
    assert.ok(!day.sessions.some((x) => x.run || x.ruck), d + ': Laufen/Marsch trotz Knie');
    for (const id of ['kniebeuge', 'ausfallschritt', 'bulgarian']) assert.ok(!allEx(day).includes(id), d + ': ' + id);
    if (weekday(d) === 4) assert.ok(!day.sessions.some((x) => x.code === 'REHA'), 'Freitag bleibt komplett frei');
    else assert.ok(day.sessions.some((x) => x.code === 'REHA'), d + ': Reha fehlt');
  }
});

test('Schulter: Kickboxen nur Technik, Drücken über Kopf und Bankdrücken raus', () => {
  const s = st(); s.pain.push({ id: 's', date: MON, typ: 'schulter', seite: 'l', staerke: 3, art: 'ziehend', label: 'Schulter links' });
  const di = plannedDay(s, addDays(MON, 1), { withReadiness: false });
  assert.ok(di.sessions.find((x) => x.code === 'KICKBOX').title.includes('nur Technik'));
  for (let i = 0; i < 7; i++) { const day = plannedDay(s, addDays(MON, i), { withReadiness: false }); for (const id of ['schulterdruecken', 'bankdruecken', 'dips']) assert.ok(!allEx(day).includes(id)); }
});

test('Warnzeichen: stark, stechend, Schwellung, Taubheit, länger als 7 Tage → Pause + Arzt', () => {
  const cases = [{ staerke: 8, art: 'dumpf' }, { staerke: 3, art: 'stechend' }, { staerke: 3, art: 'dumpf', schwellung: true }, { staerke: 3, art: 'ziehend', taubheit: true }];
  for (const c of cases) {
    const s = st(); s.pain.push({ id: 'x', date: MON, typ: 'fuss', seite: 'r', label: 'Fuß', ...c });
    const day = plannedDay(s, MON, { withReadiness: false });
    assert.equal(day.sessions.length, 1); assert.equal(day.sessions[0].code, 'REST'); assert.ok(day.sessions[0].doctor);
    assert.deepEqual(violations(MON, day.sessions, { schonPause: true }), []);
  }
  const s = st(); s.pain.push({ id: 'a', date: MON, typ: 'wade', seite: 'l', staerke: 3, art: 'dumpf' }, { id: 'b', date: addDays(MON, 8), typ: 'wade', seite: 'l', staerke: 2, art: 'dumpf' });
  const p = aktiveSchmerzen(s, addDays(MON, 8))[0];
  assert.ok(warnzeichen(s, p, addDays(MON, 8)).some((w) => w.includes('7 Tagen')));
});

test('Abgeklungen: Plan wieder normal', () => {
  const s = st(); s.pain.push({ id: 'k', date: MON, typ: 'knie', seite: 'r', staerke: 4, art: 'dumpf', erledigt: true });
  assert.equal(aktiveSchmerzen(s, MON).length, 0);
  assert.ok(!plannedDay(s, MON, { withReadiness: false }).sessions.some((x) => x.code === 'REHA'));
});

test('Schmerz-Pause: Tagesbereitschaft wird trotzdem berechnet (Startseite stürzt nicht ab)', () => {
  const s = st(); s.pain.push({ id: 'x', date: MON, typ: 'knie', seite: 'r', staerke: 9, art: 'stechend' });
  const day = plannedDay(s, MON, { withReadiness: true });
  assert.ok(day.readiness && day.readiness.mode); assert.equal(day.sessions[0].code, 'REST');
});
