// Verschlüsselung für die Garmin-Datei im öffentlichen Repository: AES-GCM 256, Schlüssel per
// PBKDF2 (SHA-256, 200 000 Runden) aus dem persönlichen App-Schlüssel. Läuft im Browser und in Node.
const subtle = () => globalThis.crypto.subtle;
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (u8) => (typeof btoa === 'function' ? btoa(String.fromCharCode(...u8)) : Buffer.from(u8).toString('base64'));
const unb64 = (s) => Uint8Array.from(typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('binary'), (c) => c.charCodeAt(0));
export const ITER = 200000;

// Schlüssel normalisieren: Groß-/Kleinschreibung, Leerzeichen und Bindestriche egal
export const normKey = (k) => String(k || '').toUpperCase().replace(/[^A-Z2-7]/g, '');

async function derive(key, salt) {
  const base = await subtle().importKey('raw', enc.encode(normKey(key)), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptJSON(obj, key) {
  if (normKey(key).length < 20) throw new Error('Schlüssel zu kurz');
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  // Für Chunks: große Daten nicht per Spread in String wandeln
  const data = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, await derive(key, salt), enc.encode(JSON.stringify(obj))));
  let bin = ''; for (let i = 0; i < data.length; i += 0x8000) bin += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return { v: 1, alg: 'AES-GCM-256/PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), data: typeof btoa === 'function' ? btoa(bin) : Buffer.from(data).toString('base64') };
}

export async function decryptJSON(env, key) {
  if (!env || env.v !== 1) throw new Error('Unbekanntes Dateiformat');
  try {
    const plain = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, await derive(key, unb64(env.salt)), unb64(env.data));
    return JSON.parse(dec.decode(plain));
  } catch { throw new Error('Schlüssel falsch oder Datei beschädigt'); }
}

// Neuer zufälliger Schlüssel (160 Bit, Base32, in 4er-Gruppen)
export function newKey() {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const r = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(r, (x) => A[x % 32]).join('').match(/.{4}/g).join('-');
}
