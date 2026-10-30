// Erinnerungen: morgens Check-in, abends Mentaltraining.
// 1) Benachrichtigung, wenn die App offen/im Hintergrund ist und die Uhrzeit erreicht ist.
// 2) Periodic Background Sync (installierte App, Chrome entscheidet über den Zeitpunkt).
// 3) Zuverlässig: Kalender-Datei (.ics) mit täglichen Alarmen für Google Kalender.
import { iso } from '../core/util.js';

export async function enableReminders(app) {
  if (!('Notification' in window)) throw new Error('Benachrichtigungen werden nicht unterstützt.');
  const p = await Notification.requestPermission();
  if (p !== 'granted') throw new Error('Benachrichtigungen wurden nicht erlaubt.');
  app.state.settings.remindOn = true; app.save();
  try {
    const reg = await navigator.serviceWorker?.ready;
    const perm = await navigator.permissions?.query({ name: 'periodic-background-sync' });
    if (reg?.periodicSync && perm?.state === 'granted') await reg.periodicSync.register('erinnerung', { minInterval: 6 * 60 * 60 * 1000 });
  } catch { /* nicht verfügbar */ }
}

async function notify(title, body, tag) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png' });
    else new Notification(title, { body, tag });
  } catch { /* egal */ }
}

export function checkReminders(app) {
  const st = app.state; const s = st.settings;
  if (!s.remindOn || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(); const today = iso(now);
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const doneToday = st.done[today] || [];
  if (hm >= s.remindMorning && hm < '12:00' && s.lastRemind.morning !== today && !st.checkins.some((c) => c.date === today)) {
    s.lastRemind.morning = today; app.save();
    notify('Morgen-Check-in', 'Schlaf, Energie, Muskelkater, Schmerzen, Stimmung – 30 Sekunden.', 'morgen');
  }
  if (hm >= s.remindEvening && s.lastRemind.evening !== today && !doneToday.includes('mental')) {
    s.lastRemind.evening = today; app.save();
    notify('Mentaltraining', 'Box-Atmung oder ein Abendtext, 5 Minuten.', 'abend');
  }
}

export function icsFile(st) {
  const d = iso().replace(/-/g, '');
  const ev = (uid, time, title, desc) => {
    const [hh, mm] = time.split(':');
    return ['BEGIN:VEVENT', `UID:${uid}@auswahl-app`, `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${hh}${mm}00`, `DURATION:PT10M`, 'RRULE:FREQ=DAILY', `SUMMARY:${title}`, `DESCRIPTION:${desc}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n');
  };
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Auswahl App//DE', 'CALSCALE:GREGORIAN',
    ev('morgen', st.settings.remindMorning, 'Check-in (Auswahl-App)', 'Morgen-Check-in in der App ausfüllen.'),
    ev('abend', st.settings.remindEvening, 'Mentaltraining (Auswahl-App)', 'Box-Atmung oder Abendtext, 5 Minuten.'),
    'END:VCALENDAR'].join('\r\n');
}
