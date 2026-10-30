// Browser-Durchlauf (Pixel-7-Format): node tests/e2e.cjs [url] [screenshot-ordner]
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8765/';
const shots = process.argv[3] || null;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shot = async (n) => { if (shots) await page.screenshot({ path: `${shots}/${n}.png` }); };
  const step = async (name, fn) => { if (name !== 'Ersteinrichtung') await page.evaluate(() => document.querySelectorAll('.full,.modal-bg,.reward').forEach((e) => e.remove())).catch(() => {}); try { await fn(); console.log('✓', name); } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); console.log('✗', name, e.message.split('\n').slice(0, 4).join(' | ')); } };
  const close = async () => { const b = page.locator('.close .icon-btn').last(); if (await b.count()) await b.click(); };

  await page.goto(url);
  await step('Ersteinrichtung', async () => { await page.getByText('Los geht’s').click(); await page.waitForSelector('nav.bottom button'); });
  await page.waitForTimeout(800);
  await shot('01-start');

  await step('Check-in', async () => {
    await page.locator('.tl .it').first().click();
    const scales = page.locator('.modal .scale');
    for (let i = 0; i < 5; i++) await scales.nth(i).locator('button').nth(i === 2 || i === 3 ? 0 : 3).click();
    await page.locator('.modal input[type=number]').fill('55');
    await page.getByText('> Speichern').click();
    await page.waitForTimeout(500);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await shot('02-nach-checkin');

  await step('Trainingseinheit öffnen + abschließen', async () => {
    await page.locator('.tl .it').nth(1).click();
    await page.waitForSelector('.full');
    await shot('03-einheit');
    const ab = page.locator('.full').getByText('Ablauf');
    if (await ab.count()) { await ab.first().click(); await page.waitForTimeout(1200); await shot('04-figur'); await close(); }
    const done = page.getByText('> Einheit abgeschlossen');
    if (await done.count()) await done.click();
    await page.waitForTimeout(400);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });

  for (const tab of ['plan', 'kraft', 'ausdauer', 'test', 'daten', 'timer']) {
    await step('Sport/' + tab, async () => { await page.goto(url + '#/sport/' + tab); await page.waitForTimeout(400); await shot('sport-' + tab); });
  }
  await step('Kraft eintragen', async () => {
    await page.goto(url + '#/sport/kraft'); await page.waitForTimeout(300);
    await page.getByText('Klimmzüge (Ristgriff)').first().click();
    await page.getByText('+ Training').click();
    const inputs = page.locator('.full >> nth=-1').locator('input[inputmode=decimal]');
    await inputs.nth(0).fill('10'); await inputs.nth(1).fill('0');
    await page.locator('.full >> nth=-1').getByText('> Speichern').click();
    await page.waitForTimeout(500);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await shot('kraft-detail');
    await close();
  });
  await step('Lauf eintragen', async () => {
    await page.goto(url + '#/sport/ausdauer'); await page.waitForTimeout(300);
    await page.getByText('+ Lauf eintragen').click();
    await page.getByPlaceholder('km, z. B. 5,2').fill('3');
    await page.getByPlaceholder('mm:ss oder h:mm:ss').fill('13:30');
    await page.locator('.modal').getByText('> Speichern').click();
    await page.waitForTimeout(400);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await shot('ausdauer-nach-lauf');
  });
  await step('Test eintragen', async () => {
    await page.goto(url + '#/sport/test'); await page.waitForTimeout(300);
    await page.getByText('+ Test eintragen').click();
    const f = page.locator('.full input:not([type=date])');
    await f.nth(0).fill('13:20'); await f.nth(1).fill('12'); await f.nth(2).fill('45'); await f.nth(3).fill('44');
    await page.getByText('> Speichern & Plan anpassen').click();
    await page.waitForTimeout(500);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await shot('test-nach');
  });
  await step('Timer', async () => {
    await page.goto(url + '#/sport/timer'); await page.waitForTimeout(300);
    await page.getByText('Tabata 20/10').click(); await page.waitForTimeout(1500); await shot('timer');
    await page.getByText('Beenden').click();
  });

  for (const tab of ['atmung', 'texte', 'spiele', 'warum']) await step('Mental/' + tab, async () => { await page.goto(url + '#/mental/' + tab); await page.waitForTimeout(400); await shot('mental-' + tab); });
  await step('Box-Atmung', async () => { await page.goto(url + '#/mental/atmung'); await page.getByText('> Start').click(); await page.waitForTimeout(2500); await shot('atmung-lauf'); await page.getByText('Beenden').click(); });
  for (const g of ['Kopfrechnen unter Zeitdruck', 'Merkfähigkeit', 'Reaktion', 'Muster erkennen', 'Entscheiden unter Stress']) {
    await step('Spiel ' + g, async () => {
      await page.goto(url + '#/mental/spiele'); await page.waitForTimeout(300);
      await page.locator('.card', { hasText: g }).getByText('> Spielen').click();
      await page.locator('.full').getByText('> Start').click();
      await page.waitForTimeout(1500);
      await shot('spiel-' + g.split(' ')[0]);
      await close();
    });
  }
  await step('Warum speichern', async () => { await page.goto(url + '#/mental/warum'); await page.locator('textarea').fill('Weil ich es will.'); await page.getByText('Speichern', { exact: true }).click(); await page.waitForTimeout(400); while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); } });

  for (const tab of ['pfad', 'karten', 'gespraeche', 'sprachen']) await step('Sprache/' + tab, async () => { await page.goto(url + '#/sprache/' + tab); await page.waitForTimeout(400); await shot('sprache-' + tab); });
  await step('Lektion komplett', async () => {
    await page.goto(url + '#/sprache/pfad'); await page.waitForTimeout(300);
    await page.getByText(/^> Weiter:/).click();
    for (let i = 0; i < 60; i++) {
      const full = page.locator('.full').last();
      if (await full.getByText('[ LEKTION ABGESCHLOSSEN ]').count()) break;
      const learn = full.getByText('Nachgesprochen – weiter');
      if (await learn.count()) { await learn.click(); continue; }
      const choice = full.locator('.choice button');
      if (await choice.count()) { await choice.first().click(); await full.getByText('Weiter', { exact: true }).click(); continue; }
      const word = full.locator('.word');
      if (await word.count()) { const n = await word.count(); for (let k = 0; k < n; k++) await word.nth(k).click(); await full.getByText('Prüfen').click(); await full.getByText('Weiter', { exact: true }).click(); continue; }
      const said = full.getByText(/laut gesagt ✓/i);
      if (await said.count()) { await said.click(); await full.getByText('Weiter', { exact: true }).click(); continue; }
      throw new Error('Unbekannter Schritt in Lektion');
    }
    await shot('lektion-ende');
    await page.locator('.full').last().getByText('Fertig').click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await step('Karteikarten', async () => { await page.goto(url + '#/sprache/karten'); await page.waitForTimeout(300); await page.locator('.card', { hasText: 'Funkvokabular' }).getByText('EN → DE').click(); await page.locator('.flash').click(); await page.getByText('Gewusst', { exact: true }).click(); await shot('karten'); await close(); });
  await step('Gespräch tippen', async () => { await page.goto(url + '#/sprache/gespraeche'); await page.getByText('Funkprobe').click(); await page.getByPlaceholder('oder Antwort eintippen').fill('loud and clear over'); await page.getByText('OK', { exact: true }).click(); await page.waitForTimeout(300); await shot('gespraech'); await close(); });

  await step('Kurse', async () => { await page.goto(url + '#/kurse'); await page.waitForTimeout(300); await shot('kurse'); });
  await step('Kurs Waffen + Quiz', async () => {
    await page.getByText('Waffenkunde (Grundlagen)').click();
    for (let i = 0; i < 30; i++) {
      const full = page.locator('.full').last();
      if (await full.locator('.waffe').count() && i < 20) { await full.getByText('▶ Rundgang').click(); await page.waitForTimeout(500); await shot('waffe'); }
      const q = full.getByText('> Zum Quiz'); if (await q.count()) { await q.click(); break; }
      await full.getByText('Weiter', { exact: true }).click();
    }
    for (let i = 0; i < 10; i++) {
      const full = page.locator('.full').last();
      if (await full.getByText('Fertig').count()) break;
      await full.locator('.choice button').first().click();
      await full.getByText('Weiter', { exact: true }).click();
    }
    await shot('kurs-ende');
    await page.locator('.full').last().getByText('Fertig').click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });

  await step('Sicherung herunterladen + wiederherstellen', async () => {
    await page.goto(url + '#/sport/heute'); await page.waitForTimeout(400);
    await page.locator('[title=Einstellungen]').click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByText('Sicherung als Datei speichern').click()]);
    const p = await dl.path();
    const txt = require('fs').readFileSync(p, 'utf8');
    if (!txt.includes('"checkins"')) throw new Error('Sicherung unvollständig');
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Aus Datei wiederherstellen').click()]);
    await fc.setFiles(p);
    await page.getByText('Wiederherstellen', { exact: true }).click();
    await page.waitForTimeout(500);
  });
  await step('Daten bleiben nach Neuladen', async () => {
    await page.reload(); await page.waitForTimeout(1000);
    const n = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('trainings-app'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('state'); g.onsuccess = () => res(g.result.checkins.length + ':' + g.result.tests.length + ':' + g.result.strength.length); }; }));
    if (n !== '1:1:1') throw new Error('Gespeichert: ' + n);
    await shot('99-start-ende');
  });
  await step('Service Worker aktiv', async () => {
    const ok = await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active);
    if (!ok) throw new Error('kein SW');
  });

  console.log('\nFEHLER:', errors.length ? '\n' + errors.join('\n') : 'keine');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
