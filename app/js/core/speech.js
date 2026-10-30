// Sprachausgabe (Text-to-Speech) und Spracheingabe (Web Speech API, in Chrome auf Android verfügbar).
let voices = [];
const loadVoices = () => { voices = window.speechSynthesis?.getVoices() || []; };
if (typeof window !== 'undefined' && window.speechSynthesis) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function voiceFor(lang) {
  const l = lang.toLowerCase();
  return voices.find((v) => v.lang.toLowerCase() === l && /google/i.test(v.name)) || voices.find((v) => v.lang.toLowerCase() === l) || voices.find((v) => v.lang.toLowerCase().startsWith(l.slice(0, 2)));
}

export function speak(text, { lang = 'de-DE', rate = 1, pitch = 1 } = {}) {
  return new Promise((resolve) => {
    if (!ttsAvailable() || !text) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate; u.pitch = pitch;
    const v = voiceFor(lang); if (v) u.voice = v;
    let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 1500 + text.length * 180 / rate); // Sicherheitsnetz
    window.speechSynthesis.speak(u);
  });
}

export const stopSpeaking = () => { try { window.speechSynthesis.cancel(); } catch { /* egal */ } };

// Liest Texte mit Pausen. Format: Array aus Strings und Zahlen (Pause in Sekunden).
export async function speakScript(parts, opts = {}, isCancelled = () => false, onPart = () => {}) {
  for (let i = 0; i < parts.length; i++) {
    if (isCancelled()) return;
    const p = parts[i];
    onPart(i);
    if (typeof p === 'number') await new Promise((r) => setTimeout(r, p * 1000));
    else await speak(p, opts);
  }
}

export const sttAvailable = () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

// Einmal zuhören, liefert mehrere Alternativen
export function listen({ lang = 'de-DE', alternatives = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject(new Error('Spracheingabe wird von diesem Browser nicht unterstützt.'));
    const r = new SR();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = alternatives; r.continuous = false;
    let got = false;
    r.onresult = (e) => { got = true; resolve(Array.from(e.results[0]).map((a) => a.transcript)); };
    r.onerror = (e) => reject(new Error(e.error === 'not-allowed' ? 'Mikrofon nicht erlaubt. In den Chrome-Einstellungen freigeben.' : e.error === 'no-speech' ? 'Nichts gehört. Nochmal versuchen.' : 'Spracheingabe: ' + e.error));
    r.onend = () => { if (!got) reject(new Error('Nichts gehört. Nochmal versuchen.')); };
    r.start();
  });
}

// Kurze Signaltöne
let ctx = null;
export function beep(freq = 880, ms = 150, vol = 0.2) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination); o.start();
    o.stop(ctx.currentTime + ms / 1000);
  } catch { /* kein Audio */ }
}
export const vibrate = (p) => { try { navigator.vibrate?.(p); } catch { /* egal */ } };
