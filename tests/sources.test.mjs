// Prüft Erklärungen, Quellen und PDF-Seitenbilder aller Kraftübungen – und dass der Übungsbegriff
// tatsächlich auf der angegebenen PDF-Seite steht (keine erfundenen Quellen).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { EXERCISES } from '../app/js/data/exercises.js';
import { PDFS } from '../app/js/data/exercise-info.js';

const root = new URL('..', import.meta.url).pathname;
const hasPdftotext = (() => { try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); return true; } catch { return false; } })();

// Begriffe, die auf der Seite vorkommen müssen (deutsch/englisch, klein geschrieben)
const TERMS = {
  klimmzug: ['klimmz', 'pull-up'], liegestuetz: ['liegestütz', 'push-up'], situp: ['sit-up', 'situp', 'bauchaufz'],
  kniebeuge: ['kniebeug', 'squat'], ausfallschritt: ['ausfallschritt', 'lunge'], kreuzheben: ['kreuzheb', 'dead lift', 'deadlift'],
  bankdruecken: ['bankdrück', 'bench'], latzug: ['latzug', 'lat pull'], rudern: ['rudern', 'row'], schulterdruecken: ['schulterdrück', 'press'],
  hyperextension: ['hyperextension'], bizeps: ['bizeps', 'biceps'], trizeps: ['trizeps', 'triceps'], butterfly: ['butterfly'],
  dips: ['dips'], plank: ['plank', 'unterarmstütz'], burpee: ['burpee'], wadendruecken: ['wadendrück', 'heel raise'], farmers: ['farmer'],
  rucksack_kniebeuge: ['squat', 'kniebeug'], bulgarian: ['split squat'], rucksack_kreuzheben: ['dead lift', 'kreuzheb'], glute_bridge: ['bridge'],
  tischrudern: ['inverted row', 'rudern'], rucksack_rudern: ['row', 'rudern'], pike: ['overhead press', 'schulterdrück'], diamant: ['narrow (triceps)'],
  rucksack_curl: ['bizeps'], liegestuetz_erhoeht: ['raised surface', 'füße in den griffen'],
};

test('Jede Kraftübung hat Erklärung und Hauptquelle im Datenmodell', () => {
  for (const ex of EXERCISES) {
    assert.ok(ex.warum?.length > 30, ex.id + ' warum');
    assert.ok(ex.wofuer?.length > 15, ex.id + ' wofuer');
    assert.ok(Array.isArray(ex.praxisbeispiele) && ex.praxisbeispiele.length >= 2 && ex.praxisbeispiele.length <= 3, ex.id + ' praxisbeispiele');
    assert.ok(ex.quellePdf && ex.quelleSeite && ex.quelleBegruendung, ex.id + ' quelle');
    assert.ok(existsSync(root + ex.quellePdf), ex.id + ': PDF fehlt ' + ex.quellePdf);
    assert.ok(ex.quellen.length >= 1);
    for (const q of ex.quellen) {
      assert.ok(existsSync(root + 'app/' + q.bild), `${ex.id}: Bild fehlt ${q.bild}`);
      assert.ok(readFileSync(root + 'app/' + q.bild).length > 20000, `${ex.id}: Bild leer ${q.bild}`);
      assert.ok(q.begruendung.length > 10);
    }
    assert.ok(TERMS[ex.id], 'Suchbegriffe fehlen für ' + ex.id);
  }
});

test('Quellen sind echt: Übungsbegriff steht auf der angegebenen PDF-Seite', { skip: !hasPdftotext && 'pdftotext nicht installiert' }, () => {
  const cache = new Map();
  const page = (pdf, n) => { const k = pdf + n; if (!cache.has(k)) cache.set(k, execFileSync('pdftotext', ['-f', String(n), '-l', String(n), root + PDFS[pdf].datei, '-'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().toLowerCase().replace(/\s+/g, ' ')); return cache.get(k); };
  for (const ex of EXERCISES) for (const q of ex.quellen) {
    const txt = page(q.pdf, q.seite);
    assert.ok(TERMS[ex.id].some((t) => txt.includes(t)), `${ex.id}: kein Treffer auf ${PDFS[q.pdf].datei} S. ${q.seite}`);
  }
});
