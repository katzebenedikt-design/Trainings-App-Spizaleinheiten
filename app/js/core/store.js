// Dauerhafter Speicher auf dem Gerät (IndexedDB, Fallback localStorage) + Sichern/Wiederherstellen.
export const SCHEMA = 1;

export function defaultState() {
  return {
    schema: SCHEMA,
    created: new Date().toISOString(),
    profile: {
      name: '', anrede: 'du', heightCm: 176, birthYear: null,
      unit: 'offen', targetDate: '2028-06-01',
      start: { run3000: 836, pullups: 11, pushups: 41, situps: 41, swim100: null },
      maxHR: null, onboarded: false,
    },
    week: { mode: 'arbeit', overrides: {} }, // overrides: { '2026-W45': 'schule' }
    checkins: [], bodyweight: [], strength: [], runs: [], swims: [], tests: [],
    customExercises: [],
    daily: [], // Garmin-Tageswerte {date, restHR, sleepH, bodyBattery, vo2max, steps, stress}
    done: {}, // { '2026-10-30': ['train', 'checkin', ...] }
    plan: { volFactor: 1, focus: [], group: 'C', lastAdapt: null, notes: [] },
    rewards: { points: 0, badges: {}, log: [] },
    mental: {
      why: { text: '', updated: null, history: [] },
      checklist: null, breath: [], reads: [],
      games: {},
    },
    lang: { active: 'en', langs: {} },
    cards: {}, // Karteikarten-Status { cardId: { box, due } }
    courses: {},
    settings: { remindMorning: '06:00', remindEvening: '21:00', remindOn: false, voice: true, lastBackup: null, lastRemind: {} },
  };
}

function merge(base, data) {
  if (Array.isArray(base) || base === null || typeof base !== 'object') return data === undefined ? base : data;
  const out = { ...base };
  if (data && typeof data === 'object') for (const k of Object.keys(data)) out[k] = k in base ? merge(base[k], data[k]) : data[k];
  return out;
}

export function normalize(data) {
  return merge(defaultState(), data || {});
}

const DB = 'trainings-app', STORE = 'kv', KEY = 'state';

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function idbGet() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE).objectStore(STORE).get(KEY);
    t.onsuccess = () => res(t.result);
    t.onerror = () => rej(t.error);
  });
}

async function idbPut(val) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(val, KEY);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export let state = defaultState();
const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);

export async function load() {
  let data = null;
  try { data = await idbGet(); } catch { /* IndexedDB nicht verfügbar */ }
  if (!data) try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { data = null; }
  state = normalize(data);
  try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch { /* egal */ }
  return state;
}

let timer = null;
export function save() {
  clearTimeout(timer);
  timer = setTimeout(flush, 250);
  listeners.forEach((f) => f(state));
}

export async function flush() {
  clearTimeout(timer);
  const json = JSON.parse(JSON.stringify(state));
  try { await idbPut(json); } catch {
    try { localStorage.setItem(KEY, JSON.stringify(json)); } catch { /* voll */ }
  }
}

export function exportJSON() {
  return JSON.stringify({ app: 'trainings-app-spezialeinheiten', exported: new Date().toISOString(), state }, null, 1);
}

export function parseBackup(text) {
  const obj = JSON.parse(text);
  const data = obj && obj.app === 'trainings-app-spezialeinheiten' ? obj.state : obj;
  if (!data || typeof data !== 'object' || !data.profile) throw new Error('Keine gültige Sicherungsdatei.');
  return normalize(data);
}

export async function replaceState(next) {
  state = next;
  await flush();
  listeners.forEach((f) => f(state));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
