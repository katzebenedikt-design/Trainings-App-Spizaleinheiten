// Sprachaufnahme mit dem Mikrofon (MediaRecorder, in Chrome auf Android verfügbar).
// Aufnahmen bleiben auf dem Gerät (eigene IndexedDB-Datenbank, nicht in der Sicherungsdatei).
export const recAvailable = () => typeof window !== 'undefined' && !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

export async function startRecording() {
  if (!recAvailable()) throw new Error('Aufnahme wird von diesem Browser nicht unterstützt.');
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) {
    throw new Error(e?.name === 'NotAllowedError' ? 'Mikrofon nicht erlaubt. In den Chrome-Einstellungen freigeben.' : 'Mikrofon nicht verfügbar.');
  }
  const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const parts = [];
  const t0 = Date.now();
  rec.ondataavailable = (e) => { if (e.data?.size) parts.push(e.data); };
  rec.start(500);
  const end = () => stream.getTracks().forEach((t) => t.stop());
  return {
    stop: () => new Promise((res) => {
      rec.onstop = () => { end(); res({ blob: new Blob(parts, { type: rec.mimeType || type || 'audio/webm' }), sec: Math.round((Date.now() - t0) / 1000) }); };
      if (rec.state !== 'inactive') rec.stop(); else rec.onstop();
    }),
    cancel: () => { try { rec.state !== 'inactive' && rec.stop(); } catch { /* egal */ } end(); },
    seconds: () => Math.round((Date.now() - t0) / 1000),
  };
}

// ---------- Ablage (letzte N Aufnahmen) ----------
const DB = 'trainings-app-audio', STORE = 'rec';
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const tx = async (mode, fn) => { const db = await openDB(); return new Promise((res, rej) => { const t = db.transaction(STORE, mode); const out = fn(t.objectStore(STORE)); t.oncomplete = () => res(out?.result ?? out); t.onerror = () => rej(t.error); }); };
export const saveAudio = (id, blob) => tx('readwrite', (s) => s.put(blob, id));
export const loadAudio = (id) => tx('readonly', (s) => s.get(id));
export const deleteAudio = (id) => tx('readwrite', (s) => s.delete(id));

// Hält nur die neuesten `keep` Aufnahmen; liefert die gelöschten IDs
export function pruneIds(entries, keep = 30) {
  const withAudio = entries.filter((e) => e.audio).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return withAudio.slice(0, Math.max(0, withAudio.length - keep)).map((e) => e.id);
}
