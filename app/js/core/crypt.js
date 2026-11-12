// Verschlüsselung für die Garmin-Datei im öffentlichen Repository (läuft im Browser und in Node).
// Verfahren: Die App erzeugt auf dem Handy ein Schlüsselpaar (ECDH P-256). Der geheime Teil bleibt im Handy.
// Der öffentliche Teil („Verbindungscode“) liegt im Repository. Die tägliche Abholung erzeugt je Datei ein
// Einmal-Schlüsselpaar, leitet daraus mit dem Verbindungscode einen AES-256-GCM-Schlüssel ab und verschlüsselt.
// Nur das Handy mit dem geheimen Teil kann die Datei wieder öffnen.
const subtle = () => globalThis.crypto.subtle;
const enc = new TextEncoder(), dec = new TextDecoder();
const CURVE = { name: 'ECDH', namedCurve: 'P-256' };

export const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); };
export const unb64 = (s) => Uint8Array.from(atob(String(s).replace(/\s+/g, '')), (c) => c.charCodeAt(0));

// Neues Schlüsselpaar für die App. privateJwk wird in den App-Daten gespeichert, publicKey als Verbindungscode gezeigt.
export async function generateAppKeys() {
  const kp = await subtle().generateKey(CURVE, true, ['deriveKey']);
  const pub = new Uint8Array(await subtle().exportKey('raw', kp.publicKey));
  return { publicKey: b64(pub), privateJwk: await subtle().exportKey('jwk', kp.privateKey) };
}

// Prüft, ob ein Verbindungscode ein gültiger öffentlicher P-256-Schlüssel ist
export async function validPublicKey(code) {
  try { const raw = unb64(code); if (raw.length !== 65 || raw[0] !== 4) return false; await subtle().importKey('raw', raw, CURVE, true, []); return true; } catch { return false; }
}

const aesFrom = (priv, pub) => subtle().deriveKey({ name: 'ECDH', public: pub }, priv, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);

export async function encryptFor(obj, publicKeyB64) {
  const appPub = await subtle().importKey('raw', unb64(publicKeyB64), CURVE, true, []);
  const eph = await subtle().generateKey(CURVE, true, ['deriveKey']);
  const key = await aesFrom(eph.privateKey, appPub);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj))));
  return { v: 2, alg: 'ECDH-P256+AES-GCM-256', epk: b64(new Uint8Array(await subtle().exportKey('raw', eph.publicKey))), iv: b64(iv), data: b64(data) };
}

export async function decryptWith(env, privateJwk) {
  if (!env || env.v !== 2) throw new Error('Unbekanntes Dateiformat');
  try {
    const priv = await subtle().importKey('jwk', privateJwk, CURVE, false, ['deriveKey']);
    const epk = await subtle().importKey('raw', unb64(env.epk), CURVE, true, []);
    const plain = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, await aesFrom(priv, epk), unb64(env.data));
    return JSON.parse(dec.decode(plain));
  } catch { throw new Error('Datei passt nicht zu diesem Handy (anderer Verbindungscode) oder ist beschädigt'); }
}
