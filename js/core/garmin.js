// Garmin-Import: FIT, GPX, TCX, CSV (einzelne Aktivitäten) und Garmin-Gesamtexport (ZIP mit JSON).
// Läuft komplett im Browser, nichts wird hochgeladen.

const FIT_EPOCH = 631065600; // 1989-12-31T00:00:00Z

const SPORT = { 1: 'lauf', 2: 'rad', 5: 'schwimmen', 11: 'gehen', 17: 'wandern', 4: 'fitness', 10: 'training' };

export function parseFIT(buf) {
  const dv = new DataView(buf instanceof ArrayBuffer ? buf : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const hlen = dv.getUint8(0);
  const sig = String.fromCharCode(dv.getUint8(8), dv.getUint8(9), dv.getUint8(10), dv.getUint8(11));
  if (sig !== '.FIT') throw new Error('Keine FIT-Datei');
  const dataSize = dv.getUint32(4, true);
  let pos = hlen; const end = hlen + dataSize;
  const defs = {}; const out = { sessions: [], records: 0, hr: [] };
  let lastTs = 0;
  const readVal = (p, size, base, little) => {
    const t = base & 0x1f;
    switch (t) {
      case 0: case 2: case 10: case 13: return size === 1 ? dv.getUint8(p) : null; // enum/uint8/uint8z/byte
      case 1: return dv.getInt8(p);
      case 3: return size >= 2 ? dv.getInt16(p, little) : null;
      case 4: case 11: return size >= 2 ? dv.getUint16(p, little) : null;
      case 5: return size >= 4 ? dv.getInt32(p, little) : null;
      case 6: case 12: return size >= 4 ? dv.getUint32(p, little) : null;
      default: return null;
    }
  };
  const invalid = (v, base) => { const t = base & 0x1f; return v == null || (t === 2 && v === 0xff) || (t === 0 && v === 0xff) || (t === 4 && v === 0xffff) || (t === 6 && v === 0xffffffff) || (t === 1 && v === 0x7f) || (t === 3 && v === 0x7fff) || (t === 5 && v === 0x7fffffff); };
  while (pos < end) {
    const h = dv.getUint8(pos++);
    if (h & 0x80) { // komprimierter Zeitstempel
      const local = (h >> 5) & 3; const off = h & 0x1f;
      const def = defs[local]; if (!def) throw new Error('FIT: Definition fehlt');
      lastTs = (lastTs & ~0x1f) + off + (off < (lastTs & 0x1f) ? 0x20 : 0);
      pos = handle(def, pos, lastTs);
      continue;
    }
    const local = h & 0x0f;
    if (h & 0x40) { // Definition
      const dev = h & 0x20;
      pos++; const arch = dv.getUint8(pos++); const little = arch === 0;
      const gnum = dv.getUint16(pos, little); pos += 2;
      const n = dv.getUint8(pos++); const fields = [];
      for (let i = 0; i < n; i++) { fields.push({ num: dv.getUint8(pos), size: dv.getUint8(pos + 1), base: dv.getUint8(pos + 2) }); pos += 3; }
      let devSize = 0;
      if (dev) { const dn = dv.getUint8(pos++); for (let i = 0; i < dn; i++) { devSize += dv.getUint8(pos + 1); pos += 3; } }
      defs[local] = { gnum, little, fields, devSize };
    } else {
      const def = defs[local]; if (!def) throw new Error('FIT: Definition fehlt');
      pos = handle(def, pos, null);
    }
  }
  function handle(def, p, ts) {
    const vals = {};
    for (const f of def.fields) { const v = readVal(p, f.size, f.base, def.little); if (!invalid(v, f.base)) vals[f.num] = v; p += f.size; }
    p += def.devSize;
    if (vals[253] != null) lastTs = vals[253];
    if (ts != null && vals[253] == null) vals[253] = ts;
    if (def.gnum === 18) { // session
      out.sessions.push({
        start: vals[2] != null ? new Date((vals[2] + FIT_EPOCH) * 1000) : null,
        sport: SPORT[vals[5]] || 'sonstiges',
        durSec: vals[7] != null ? vals[7] / 1000 : vals[8] != null ? vals[8] / 1000 : null,
        distM: vals[9] != null ? vals[9] / 100 : null,
        avgHR: vals[16] ?? null, maxHR: vals[17] ?? null,
      });
    } else if (def.gnum === 20) { out.records++; if (vals[3] != null) out.hr.push(vals[3]); }
    return p;
  }
  return out;
}

const hav = (a, b) => {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const xmlDoc = (txt) => new DOMParser().parseFromString(txt, 'application/xml');
const byLocal = (doc, name) => Array.from(doc.getElementsByTagName('*')).filter((e) => e.localName === name);

export function parseGPX(txt) {
  const doc = xmlDoc(txt);
  const pts = byLocal(doc, 'trkpt').map((p) => ({ lat: +p.getAttribute('lat'), lon: +p.getAttribute('lon'), time: byLocal(p, 'time')[0]?.textContent, hr: Number(byLocal(p, 'hr')[0]?.textContent) || null }));
  if (!pts.length) throw new Error('GPX enthält keine Trackpunkte');
  let dist = 0; for (let i = 1; i < pts.length; i++) dist += hav(pts[i - 1], pts[i]);
  const t0 = pts[0].time ? new Date(pts[0].time) : null, t1 = pts[pts.length - 1].time ? new Date(pts[pts.length - 1].time) : null;
  const hrs = pts.map((p) => p.hr).filter(Boolean);
  const type = (byLocal(doc, 'type')[0]?.textContent || '').toLowerCase();
  return { start: t0, durSec: t0 && t1 ? (t1 - t0) / 1000 : null, distM: dist, avgHR: hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null, sport: /swim/.test(type) ? 'schwimmen' : /walk|hik/.test(type) ? 'gehen' : 'lauf' };
}

export function parseTCX(txt) {
  const doc = xmlDoc(txt);
  const act = byLocal(doc, 'Activity')[0];
  if (!act) throw new Error('TCX enthält keine Aktivität');
  const sport = (act.getAttribute('Sport') || '').toLowerCase();
  let dur = 0, dist = 0, hrSum = 0, hrW = 0, start = null;
  for (const lap of byLocal(act, 'Lap')) {
    start = start || new Date(lap.getAttribute('StartTime'));
    const d = Number(byLocal(lap, 'TotalTimeSeconds')[0]?.textContent || 0);
    dur += d; dist += Number(byLocal(lap, 'DistanceMeters')[0]?.textContent || 0);
    const avg = byLocal(lap, 'AverageHeartRateBpm')[0];
    if (avg) { const v = Number(byLocal(avg, 'Value')[0]?.textContent); if (v) { hrSum += v * d; hrW += d; } }
  }
  return { start, durSec: dur, distM: dist, avgHR: hrW ? Math.round(hrSum / hrW) : null, sport: sport.includes('run') ? 'lauf' : sport.includes('bik') ? 'rad' : sport.includes('swim') ? 'schwimmen' : 'sonstiges' };
}

// CSV aus Garmin Connect (Aktivitätenliste, deutsch oder englisch) oder eigene Tabellen
export function splitCSV(txt) {
  const sep = (txt.split('\n')[0].match(/;/g) || []).length > (txt.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) { if (ch === '"' && txt[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && txt[i + 1] === '\n') i++; row.push(cur); if (row.some((c) => c.trim())) rows.push(row); row = []; cur = ''; }
    else cur += ch;
  }
  row.push(cur); if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

const numDE = (s) => { if (s == null) return null; s = String(s).trim().replace(/"/g, ''); if (!s || s === '--') return null; if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, ''); s = s.replace(',', '.').replace(/[^\d.-]/g, ''); const n = parseFloat(s); return isNaN(n) ? null : n; };
const timeToSec = (s) => { if (!s) return null; const p = String(s).trim().split(':').map((x) => parseFloat(x.replace(',', '.'))); if (p.some(isNaN)) return null; return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0]; };

export function parseCSV(txt) {
  const rows = splitCSV(txt.replace(/^﻿/, ''));
  if (rows.length < 2) throw new Error('CSV ist leer');
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (...names) => head.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));
  const cType = col('aktivitätstyp', 'activity type', 'typ', 'type');
  const cDate = col('datum', 'date', 'calendar date', 'start time');
  const cDist = col('distanz', 'distance');
  const cTime = col('zeit', 'time', 'dauer', 'duration');
  const cHR = col('ø herzfrequenz', 'avg hr', 'durchschnittliche herzfrequenz', 'average heart rate');
  const cRest = col('ruhepuls', 'resting heart rate', 'resting hr');
  const cSleep = col('schlaf', 'sleep');
  const cBB = col('body battery');
  const cVO2 = col('vo2', 'vo2max', 'vo2 max');
  const acts = [], daily = [];
  for (const r of rows.slice(1)) {
    const rawDate = cDate >= 0 ? r[cDate] : null;
    const d = parseAnyDate(rawDate);
    if (!d) continue;
    if (cDist >= 0 && cTime >= 0 && r[cDist] && r[cTime]) {
      const type = (cType >= 0 ? r[cType] : '').toLowerCase();
      const sport = /schwimm|swim/.test(type) ? 'schwimmen' : /lauf|run/.test(type) ? 'lauf' : /geh|walk|wander|hik/.test(type) ? 'gehen' : /rad|cycl|bik/.test(type) ? 'rad' : 'sonstiges';
      let dist = numDE(r[cDist]);
      if (dist != null) dist = sport === 'schwimmen' && dist > 20 ? dist : dist * 1000; // Schwimmen meist in m, sonst km
      acts.push({ start: d, sport, distM: dist, durSec: timeToSec(r[cTime]), avgHR: cHR >= 0 ? numDE(r[cHR]) : null });
    } else if (cRest >= 0 || cSleep >= 0 || cBB >= 0 || cVO2 >= 0) {
      const sl = cSleep >= 0 ? r[cSleep] : null;
      daily.push({ date: toIso(d), restHR: cRest >= 0 ? numDE(r[cRest]) : null, sleepH: sl ? (sl.includes(':') ? timeToSec(sl) / 3600 * (sl.split(':').length === 2 ? 60 : 1) : numDE(sl)) : null, bodyBattery: cBB >= 0 ? numDE(r[cBB]) : null, vo2max: cVO2 >= 0 ? numDE(r[cVO2]) : null });
    }
  }
  return { acts, daily };
}

function parseAnyDate(s) {
  if (!s) return null;
  s = String(s).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 12), +(m[5] || 0));
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (m) return new Date(+(m[3].length === 2 ? '20' + m[3] : m[3]), +m[2] - 1, +m[1], +(m[4] || 12), +(m[5] || 0));
  const d = new Date(s); return isNaN(d) ? null : d;
}
const pad = (n) => String(n).padStart(2, '0');
export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---------- ZIP (Garmin-Gesamtexport) ----------
async function inflateRaw(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export function zipEntries(buf) {
  const dv = new DataView(buf); const u8 = new Uint8Array(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Keine ZIP-Datei');
  let n = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true);
  const entries = [];
  const dec = new TextDecoder();
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true);
    const nlen = dv.getUint16(off + 28, true), xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true);
    const lho = dv.getUint32(off + 42, true);
    const name = dec.decode(u8.subarray(off + 46, off + 46 + nlen));
    entries.push({ name, method, csize, lho });
    off += 46 + nlen + xlen + clen;
  }
  return entries.map((e) => ({ ...e, read: async () => {
    const lnl = dv.getUint16(e.lho + 26, true), lxl = dv.getUint16(e.lho + 28, true);
    const start = e.lho + 30 + lnl + lxl; const data = u8.subarray(start, start + e.csize);
    if (e.method === 0) return data;
    if (e.method === 8) return inflateRaw(data);
    throw new Error('ZIP-Kompression nicht unterstützt');
  } }));
}

const dateOf = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return toIso(new Date(v));
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})/); return m ? m[1] : null;
};

// Sammelt Tageswerte und Aktivitäten aus beliebig verschachtelten Garmin-JSON-Dateien
export function harvestGarminJSON(json, name, acc) {
  const walk = (o) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    const day = dateOf(o.calendarDate?.date || o.calendarDate || o.sleepStartTimestampLocal || o.summaryDate);
    // Aktivitäten (summarizedActivities)
    if (o.activityType && (o.duration != null || o.distance != null) && (o.startTimeLocal || o.beginTimestamp)) {
      const t = (o.activityType.typeKey || o.activityType || '').toString().toLowerCase();
      const sport = /swim/.test(t) ? 'schwimmen' : /run/.test(t) ? 'lauf' : /walk|hik/.test(t) ? 'gehen' : /cycl|bik/.test(t) ? 'rad' : 'sonstiges';
      const dur = o.duration > 100000 ? o.duration / 1000 : o.duration; // Export: ms
      const dist = o.distance > 0 ? (o.distance > 100000 ? o.distance / 100 : o.distance) : null; // Export: cm
      acc.acts.push({ start: new Date(o.startTimeLocal || o.beginTimestamp), sport, durSec: dur, distM: dist, avgHR: o.avgHr || o.averageHR || null });
      return;
    }
    if (day) {
      const d = acc.daily[day] || (acc.daily[day] = { date: day });
      if (o.restingHeartRate) d.restHR = o.restingHeartRate;
      if (o.currentDayRestingHeartRate) d.restHR = o.currentDayRestingHeartRate;
      const sleepSec = (o.deepSleepSeconds || 0) + (o.lightSleepSeconds || 0) + (o.remSleepSeconds || 0);
      if (sleepSec > 0) d.sleepH = Math.round((sleepSec / 3600) * 10) / 10;
      if (o.vo2MaxValue || o.vo2Max) d.vo2max = o.vo2MaxValue || o.vo2Max;
      if (o.totalSteps) d.steps = o.totalSteps;
      if (o.averageStressLevel > 0) d.stress = o.averageStressLevel;
      if (o.bodyBatteryHighestValue != null) d.bodyBattery = o.bodyBatteryHighestValue;
      if (Array.isArray(o.bodyBatteryStatList)) {
        const hi = o.bodyBatteryStatList.find((x) => /HIGHEST|MAX/i.test(x.bodyBatteryStatType || ''));
        const wake = o.bodyBatteryStatList.find((x) => /WAKE/i.test(x.bodyBatteryStatType || ''));
        if (wake?.statsValue != null) d.bodyBattery = wake.statsValue; else if (hi?.statsValue != null) d.bodyBattery = hi.statsValue;
      }
    }
    for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v);
  };
  walk(json);
  return acc;
}

export async function parseGarminZip(buf, onProgress) {
  const entries = zipEntries(buf);
  const acc = { acts: [], daily: {}, files: 0, fit: 0 };
  const json = entries.filter((e) => /\.json$/i.test(e.name) && /(sleep|uds|wellness|metrics|maxmet|summarized|fitness|hydration|healthstatus|trainingreadiness)/i.test(e.name));
  const fits = entries.filter((e) => /\.fit$/i.test(e.name));
  let i = 0;
  for (const e of json) {
    i++; onProgress?.(i, json.length + fits.length);
    try { harvestGarminJSON(JSON.parse(new TextDecoder().decode(await e.read())), e.name, acc); acc.files++; } catch { /* Datei überspringen */ }
  }
  for (const e of fits.slice(0, 500)) {
    i++; onProgress?.(i, json.length + fits.length);
    try { const f = parseFIT((await e.read()).slice().buffer); for (const s of f.sessions) acc.acts.push(s); acc.fit++; } catch { /* überspringen */ }
  }
  return { acts: acc.acts, daily: Object.values(acc.daily), files: acc.files, fit: acc.fit };
}

export async function importFile(file, onProgress) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.fit')) { const r = parseFIT(await file.arrayBuffer()); return { acts: r.sessions, daily: [] }; }
  if (name.endsWith('.gpx')) return { acts: [parseGPX(await file.text())], daily: [] };
  if (name.endsWith('.tcx')) return { acts: [parseTCX(await file.text())], daily: [] };
  if (name.endsWith('.csv')) return parseCSV(await file.text());
  if (name.endsWith('.zip')) return parseGarminZip(await file.arrayBuffer(), onProgress);
  if (name.endsWith('.json')) { const acc = { acts: [], daily: {} }; harvestGarminJSON(JSON.parse(await file.text()), name, acc); return { acts: acc.acts, daily: Object.values(acc.daily) }; }
  throw new Error('Dateityp nicht unterstützt (FIT, GPX, TCX, CSV, JSON, ZIP)');
}
