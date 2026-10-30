// Datums- und Formatierungshilfen (lokale Zeit, deutsch).
export const pad = (n) => String(n).padStart(2, '0');
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); };
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
export const weekday = (s) => (parseDate(s).getDay() + 6) % 7; // 0 = Montag
export const mondayOf = (s) => addDays(s, -weekday(s));

export function isoWeekKey(s) {
  const d = parseDate(s);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad(wk)}`;
}

export const TAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const TAGE_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
export const fmtDate = (s) => { const d = parseDate(s); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`; };
export const fmtDateLong = (s) => { const d = parseDate(s); return `${TAGE_LANG[weekday(s)]}, ${d.getDate()}. ${MON[d.getMonth()]} ${d.getFullYear()}`; };
export const fmtMonth = (s) => { const d = parseDate(s); return `${MON[d.getMonth()]} ${d.getFullYear()}`; };

export function fmtTime(sec) {
  if (sec == null || isNaN(sec)) return '–';
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// "13:56", "13.56", "13,56", "1:02:30", "836" (Sekunden), "13 56" -> Sekunden
export function parseTime(str) {
  if (str == null) return null;
  const s = String(str).trim().replace(/[.,\s]+/g, ':');
  if (!s) return null;
  const parts = s.split(':').filter(Boolean).map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export const fmtPace = (secPerKm) => (secPerKm ? fmtTime(secPerKm) + ' /km' : '–');
export const num = (v) => { if (v === '' || v == null) return null; const n = Number(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
export const fmtNum = (n, d = 1) => (n == null ? '–' : Number(n).toLocaleString('de-DE', { maximumFractionDigits: d }));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const median = (arr) => { if (!arr.length) return null; const a = [...arr].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
export const sortByDate = (arr) => [...arr].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
export const last = (arr) => arr[arr.length - 1];
export const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
