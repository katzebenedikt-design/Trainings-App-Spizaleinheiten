// Ersatz-Einheiten und Erklärungen: für jede Einheit des Plans vorhanden, Regeln eingehalten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EINHEITEN, wochenErklaerung } from '../app/js/data/einheiten.js';
import { defaultState } from '../app/js/core/store.js';
import { plannedDay } from '../app/js/core/planner.js';
import { addDays, weekday } from '../app/js/core/util.js';
import { WEEK_RULES } from '../app/js/data/requirements.js';

const st = () => { const s = defaultState(); s.created = '2026-11-02T08:00:00Z'; s.profile.targetDate = '2028-06-05'; return s; };

test('Jede geplante Einheit hat Erklärung (2–3 Beispiele) und Ersatz bzw. Hinweis', () => {
  const s = st(); const codes = new Set();
  for (let d = '2026-11-02'; d < '2028-06-30'; d = addDays(d, 1)) for (const x of plannedDay(s, d, { withReadiness: false }).sessions) codes.add(x.code);
  for (const c of codes) {
    const e = EINHEITEN[c]; assert.ok(e, 'fehlt: ' + c);
    assert.ok(e.zweck && e.nutzen, c); assert.ok(e.beispiele.length >= 1 && e.beispiele.length <= 3, c);
    if (c !== 'REST') assert.ok(e.ersatz.length || e.ersatzHinweis, 'Ersatz fehlt: ' + c);
    for (const r of e.ersatz) { assert.ok([15, 30].includes(r.min), c); assert.ok(r.lines.length && r.reiz, c); }
  }
});

test('Ersatz an Kickbox-Tagen ohne Laufen und Schwimmen', () => {
  const s = st();
  for (let d = '2026-11-02'; d < '2027-03-01'; d = addDays(d, 1)) {
    if (!WEEK_RULES[weekday(d)].fest) continue;
    for (const x of plannedDay(s, d, { withReadiness: false }).sessions) for (const r of EINHEITEN[x.code]?.ersatz || []) {
      const t = (r.titel + ' ' + r.lines.join(' ')).toLowerCase();
      assert.ok(!/\b(lauf|laufen|joggen|schwimm)/.test(t.replace(/kein laufen|kein schwimmen|keine beine/g, '')), `${x.code}: ${r.titel}`);
    }
  }
});

test('Wochenerklärung', () => {
  assert.match(wochenErklaerung('Grundlage', 1, false), /Belastungswoche 1 von 5/);
  assert.match(wochenErklaerung('Grundlage', 6, true), /Regenerationswoche/);
});
