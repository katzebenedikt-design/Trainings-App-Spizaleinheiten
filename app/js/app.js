import * as store from './core/store.js';
import { h, icon, celebrate, toast, afterModalBack } from './ui.js';
import { award as awardCore, checkBadges, praise } from './core/rewards.js';
import { iso } from './core/util.js';
import { sportTabs } from './views/sport.js';
import { mentalTabs } from './views/mental.js';
import { spracheTabs } from './views/sprache.js';
import { kurseTabs } from './views/kurse.js';
import { openSettings, onboarding } from './views/settings.js';
import { checkReminders } from './views/reminders.js';

const AREAS = [
  { key: 'sport', label: 'Sport', icon: 'sport', tabs: sportTabs },
  { key: 'mental', label: 'Mental', icon: 'mental', tabs: mentalTabs },
  { key: 'sprache', label: 'Sprache', icon: 'sprache', tabs: spracheTabs },
  { key: 'kurse', label: 'Kurse', icon: 'kurse', tabs: kurseTabs },
];

const root = document.getElementById('app');
const nav = document.getElementById('nav');

export const app = {
  get state() { return store.state; },
  save: () => store.save(),
  async go(hash) { await afterModalBack(); if (location.hash === hash) render(); else location.hash = hash; },
  refresh: () => render(true),
  // Punkte vergeben, speichern, Belohnungen zeigen
  award(pts, tag, msg) {
    const ev = awardCore(store.state, pts, tag, iso());
    store.save();
    if (msg !== false) toast(`${msg || praise()}  +${pts} P`);
    celebrate(ev);
  },
  badges() { const ev = checkBadges(store.state); if (ev.length) { store.save(); celebrate(ev); } },
  settings: () => openSettings(app),
};

let lastArea = null;
function parse() {
  const [, area = 'sport', tab = ''] = (location.hash || '#/sport').split('/');
  const A = AREAS.find((a) => a.key === area) || AREAS[0];
  const tabs = A.tabs;
  const T = tabs.find((t) => t.key === tab) || tabs[0];
  return { A, T };
}

function render(soft = false) {
  const { A, T } = parse();
  nav.replaceChildren(...AREAS.map((a) => h('button', { class: a.key === A.key ? 'on' : '', 'aria-label': a.label, onclick: () => app.go(`#/${a.key}`) }, icon(a.icon), h('span', {}, a.label.toUpperCase()))));
  const view = h('div', { class: soft ? '' : 'anim' });
  if (A.tabs.length > 1) {
    const tabbar = h('div', { class: 'seg', role: 'tablist' }, ...A.tabs.map((t) => h('button', { class: t.key === T.key ? 'on' : '', role: 'tab', onclick: () => app.go(`#/${A.key}/${t.key}`) }, t.label)));
    view.append(h('div', { class: 'tabs' }, tabbar));
  }
  const body = h('div', {});
  view.append(body);
  root.replaceChildren(view);
  if (!soft && A.key !== lastArea) { const sc = h('div', { class: 'scanline' }); document.body.append(sc); setTimeout(() => sc.remove(), 1000); }
  lastArea = A.key;
  if (!soft) window.scrollTo(0, 0);
  try { T.render(body, app); } catch (e) { console.error(e); body.append(h('div', { class: 'card badc' }, h('h2', {}, 'Fehler'), h('p', { class: 'm' }, String(e.message || e)))); }
}

window.addEventListener('hashchange', () => render());

async function start() {
  await store.load();
  if (!store.state.profile.onboarded) await onboarding(app);
  render();
  app.badges();
  checkReminders(app);
  setInterval(() => checkReminders(app), 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkReminders(app); else store.flush(); });
  window.addEventListener('pagehide', () => store.flush());
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('Update geladen. App neu öffnen für die neue Version.', 4000); });
      });
    }).catch(() => {});
  }
}

start();
