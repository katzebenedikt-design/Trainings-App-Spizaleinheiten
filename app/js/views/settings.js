// Einstellungen, Ersteinrichtung, Sichern & Wiederherstellen.
import { h, card, modal, field, seg, toast, download, pickFile, confirmBox } from '../ui.js';
import * as store from '../core/store.js';
import { iso, fmtTime, parseTime, num, fmtDate } from '../core/util.js';
import { enableReminders, icsFile } from './reminders.js';
import { giveBadge } from '../core/rewards.js';
import { celebrate } from '../ui.js';

const UNITS = [['offen', 'Offen'], ['KSK', 'KSK'], ['GSG 9', 'GSG 9'], ['EGB', 'EGB'], ['Kampfschwimmer', 'Kampfschw.']];

export function onboarding(app) {
  return new Promise((resolve) => {
    const st = store.state; const p = st.profile;
    const m = modal(({ close }) => {
      const name = h('input', { placeholder: 'optional', value: p.name });
      const date = h('input', { type: 'date', value: p.targetDate });
      const height = h('input', { inputmode: 'numeric', value: p.heightCm });
      const kg = h('input', { inputmode: 'decimal', placeholder: 'z. B. 72' });
      const r3 = h('input', { value: fmtTime(p.start.run3000) }), pu = h('input', { inputmode: 'numeric', value: p.start.pullups }), ps = h('input', { inputmode: 'numeric', value: p.start.pushups }), su = h('input', { inputmode: 'numeric', value: p.start.situps }), sw = h('input', { placeholder: 'offen, z. B. 2:10' });
      let unit = p.unit, anrede = p.anrede, mode = st.week.mode;
      return h('div', {}, h('div', { class: 'm' }, '// ERSTEINRICHTUNG'), h('h1', { class: 'typein' }, 'Lage: Melden'),
        h('p', { class: 'dim' }, 'Alles bleibt auf deinem Handy. Werte kannst du später unter Einstellungen ändern.'),
        h('div', { class: 'k mt' }, 'Ziel-Einheit'), seg(UNITS, unit, (u) => { unit = u; }),
        field('Geplanter Termin Auswahlverfahren', date),
        h('div', { class: 'k mt' }, 'Ansprache'), seg([['du', 'Du'], ['name', 'Mit Name'], ['rang', 'Mit Dienstgrad']], anrede, (a) => { anrede = a; }),
        field('Name', name),
        h('div', { class: 'k mt' }, 'Diese Woche'), seg([['arbeit', 'Arbeitswoche'], ['schule', 'Berufsschulwoche']], mode, (x) => { mode = x; }),
        h('div', { class: 'grid2' }, field('Größe (cm)', height), field('Gewicht (kg)', kg)),
        h('div', { class: 'k mt' }, 'Startwerte'),
        h('div', { class: 'grid2' }, field('3000 m', r3), field('Klimmzüge', pu), field('Liegestütze', ps), field('Sit-ups', su)), field('100 m Brust (Zeit)', sw),
        h('button', { class: 'btn f mt2', onclick: () => {
          Object.assign(p, { name: name.value.trim(), targetDate: date.value || p.targetDate, heightCm: num(height.value) || 176, unit, anrede, onboarded: true });
          p.start = { run3000: parseTime(r3.value) || 836, pullups: num(pu.value) ?? 11, pushups: num(ps.value) ?? 41, situps: num(su.value) ?? 41, swim100: parseTime(sw.value) };
          st.week.mode = mode;
          const w = num(kg.value); if (w) st.bodyweight.push({ date: iso(), kg: w });
          store.save(); close(); resolve();
        } }, '> Los geht’s'));
    }, { full: true });
    m.onClose(() => { st.profile.onboarded = true; store.save(); resolve(); });
  });
}

export function openSettings(app) {
  const st = store.state; const p = st.profile; const s = st.settings;
  modal(({ close }) => {
    const name = h('input', { value: p.name });
    const date = h('input', { type: 'date', value: p.targetDate });
    const height = h('input', { inputmode: 'numeric', value: p.heightCm });
    const maxhr = h('input', { inputmode: 'numeric', value: p.maxHR || '', placeholder: 'leer = 220 − Alter' });
    const mo = h('input', { type: 'time', value: s.remindMorning }), ev = h('input', { type: 'time', value: s.remindEvening });
    let unit = p.unit, anrede = p.anrede;
    const saveProfile = () => {
      Object.assign(p, { name: name.value.trim(), targetDate: date.value || p.targetDate, heightCm: num(height.value) || p.heightCm, maxHR: num(maxhr.value), unit, anrede });
      s.remindMorning = mo.value || '06:00'; s.remindEvening = ev.value || '21:00';
      store.save();
    };
    return h('div', {}, h('div', { class: 'k' }, '[ EINSTELLUNGEN ]'), h('h1', {}, 'Einstellungen'),
      card(h('div', { class: 'k' }, '[ PROFIL & ZIEL ]'),
        h('div', { class: 'm mt' }, 'ZIEL-EINHEIT'), seg(UNITS, unit, (u) => { unit = u; }),
        field('Termin Auswahlverfahren', date), h('p', { class: 'm' }, 'Der Phasenplan wird rückwärts von diesem Datum gerechnet.'),
        h('div', { class: 'm mt' }, 'ANSPRACHE'), seg([['du', 'Du'], ['name', 'Mit Name'], ['rang', 'Mit Dienstgrad']], anrede, (a) => { anrede = a; }),
        field('Name', name), h('div', { class: 'grid2' }, field('Größe (cm)', height), field('Max. Puls', maxhr)),
        h('button', { class: 'btn', onclick: () => { saveProfile(); toast('Gespeichert.'); app.refresh(); } }, 'Speichern')),
      card(h('div', { class: 'k' }, '[ ERINNERUNGEN ]'),
        h('div', { class: 'grid2' }, field('Morgens Check-in', mo), field('Abends Mental', ev)),
        h('button', { class: 'btn ' + (s.remindOn ? 'o' : 'f'), onclick: async () => { saveProfile(); try { await enableReminders(app); toast('Benachrichtigungen an.'); } catch (e) { toast(e.message, 4000); } } }, s.remindOn ? 'Benachrichtigungen sind an ✓' : 'Benachrichtigungen erlauben'),
        h('p', { class: 'm' }, 'Android weckt Web-Apps nicht immer pünktlich. Für feste Uhrzeiten zusätzlich die Kalender-Erinnerung importieren:'),
        h('button', { class: 'btn', onclick: () => { saveProfile(); download('erinnerungen-auswahl-app.ics', icsFile(st), 'text/calendar'); toast('Datei öffnen → mit Google Kalender importieren.', 5000); } }, 'Kalender-Erinnerung (.ics)')),
      card(h('div', { class: 'k' }, '[ SPRACHE & TON ]'),
        seg([['an', 'Sprachansagen an'], ['aus', 'aus']], s.voice === false ? 'aus' : 'an', (v) => { s.voice = v === 'an'; store.save(); })),
      card(h('div', { class: 'k' }, '[ SICHERN & WIEDERHERSTELLEN ]'),
        h('p', { class: 'small' }, `Alle Daten liegen nur auf diesem Handy. Sichere regelmäßig als Datei (z. B. in Google Drive). ${s.lastBackup ? 'Letzte Sicherung: ' + fmtDate(s.lastBackup.slice(0, 10)) : 'Noch keine Sicherung.'}`),
        h('button', { class: 'btn f', onclick: () => backup(app) }, 'Sicherung als Datei speichern'),
        h('button', { class: 'btn', onclick: () => restore(app, close) }, 'Aus Datei wiederherstellen')),
      card(h('div', { class: 'k' }, '[ APP ]'),
        h('p', { class: 'm' }, 'Inhalte orientieren sich am Trainingshandbuch Bewerber KSK, dem SFAS-Handbuch, dem NSW Physical Training Guide und dem EGB-Report. Keine medizinische Beratung. Normen ändern sich – offizielle Seiten prüfen.'),
        h('a', { class: 'btn', href: 'https://www.bundeswehrkarriere.de', target: '_blank', rel: 'noopener' }, 'Bundeswehr Karriere'),
        h('a', { class: 'btn', href: 'https://www.komm-zur-bundespolizei.de', target: '_blank', rel: 'noopener' }, 'Bundespolizei Karriere'),
        h('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Wirklich ALLE Daten löschen? Vorher sichern!', 'Alles löschen')) { await store.replaceState(store.defaultState()); location.reload(); } } }, 'Alle Daten löschen')));
  }, { full: true });
}

function backup(app) {
  const st = store.state;
  st.settings.lastBackup = new Date().toISOString();
  const ev = giveBadge(st, 'backup');
  download(`auswahl-app-sicherung-${iso()}.json`, store.exportJSON());
  store.save();
  toast('Sicherung gespeichert (Ordner „Downloads“).', 4000);
  if (ev) celebrate([ev]);
}

async function restore(app, closeSettings) {
  const f = await pickFile('.json,application/json');
  if (!f) return;
  try {
    const next = store.parseBackup(await f.text());
    if (!(await confirmBox(`Sicherung vom ${next.settings.lastBackup ? fmtDate(next.settings.lastBackup.slice(0, 10)) : '?'} laden? Die aktuellen Daten werden ersetzt.`, 'Wiederherstellen'))) return;
    await store.replaceState(next);
    closeSettings(); toast('Wiederhergestellt.'); app.refresh();
  } catch (e) { toast('Datei ungültig: ' + e.message, 4000); }
}
