// Browser-Durchlauf (Pixel-7-Format): node tests/e2e.cjs [url] [screenshot-ordner]
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8765/';
const shots = process.argv[3] || null;

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, permissions: ['microphone'] });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shot = async (n) => { if (shots) await page.screenshot({ path: `${shots}/${n}.png` }); };
  const step = async (name, fn) => { if (name !== 'Ersteinrichtung') await page.evaluate(() => document.querySelectorAll('.full,.modal-bg,.reward').forEach((e) => e.remove())).catch(() => {}); try { await fn(); console.log('✓', name); } catch (e) { await shot('FEHLER-' + name.replace(/[^\w]/g, '_')).catch(() => {}); errors.push(`${name}: ${e.message.split('\n')[0]}`); console.log('✗', name, e.message.split('\n').slice(0, 4).join(' | ')); } };
  const noOverflow = async (n) => { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 413) throw new Error(`${n}: seitliches Scrollen (${w}px)`); };
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

  for (const tab of ['plan', 'kraft', 'ausdauer', 'test', 'garmin', 'daten', 'timer']) {
    await step('Sport/' + tab, async () => { await page.goto(url + '#/sport/' + tab); await page.waitForTimeout(400); await shot('sport-' + tab); });
  }
  await step('Verfügbarkeit: kein Studio, kein Bad', async () => {
    await page.goto(url + '#/sport/plan'); await page.waitForTimeout(300);
    await page.locator('.chip', { hasText: 'Fitnessstudio' }).click(); await page.waitForTimeout(300);
    await page.locator('.chip', { hasText: 'Schwimmbad' }).click(); await page.waitForTimeout(300);
    const txt = await page.locator('.card', { hasText: 'WARUM SO?' }).innerText();
    if (!/Verfügbarkeit/.test(txt)) throw new Error('Keine Begründung zur Verfügbarkeit');
    if (/Regelkonflikt/.test(await page.content())) throw new Error('Regelkonflikt angezeigt');
    await shot('plan-verfuegbarkeit');
    await page.locator('.chip', { hasText: 'Fitnessstudio' }).click(); await page.waitForTimeout(200);
    await page.locator('.chip', { hasText: 'Schwimmbad' }).click(); await page.waitForTimeout(200);
  });
  await step('Garmin-Werte manuell (Morgenbericht)', async () => {
    await page.goto(url + '#/sport/garmin'); await page.waitForTimeout(300);
    await page.getByText('+ Werte heute').click();
    const fill = async (label, v) => page.locator('.full label', { hasText: label }).first().locator('input').fill(v);
    await fill('Schlaf (h)', '7,5'); await fill('Schlafscore', '61'); await fill('HRV letzte Nacht', '52'); await fill('Trainingsbereitschaft', '64');
    await page.locator('.full').getByText('> Speichern').click(); await page.waitForTimeout(400);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    if (!(await page.getByText('[ GARMIN-MORGENBERICHT', { exact: false }).count())) throw new Error('Morgenbericht-Karte fehlt');
    await shot('garmin');
  });
  await step('Garmin automatisch: Verbindungscode, verschlüsselte Datei', async () => {
    const path = require('path'); const fs = require('fs');
    const root = path.join(__dirname, '..');
    const { encryptFor } = await import(path.join(root, 'app/js/core/crypt.js'));
    const { mapGarmin, mergePayload } = await import(path.join(root, 'app/js/core/garmin-map.js'));
    const { iso, addDays, mondayOf } = await import(path.join(root, 'app/js/core/util.js'));
    await page.goto(url + '#/sport/heute'); await page.waitForTimeout(300); await page.locator('[title=Einstellungen]').click();
    await page.getByText('Verbindungscode erzeugen').click(); await page.waitForTimeout(400);
    const code = (await page.locator('.full textarea[readonly]').inputValue()).trim();
    if (!/^[A-Za-z0-9+/=]{80,}$/.test(code)) throw new Error('Kein Verbindungscode angezeigt');
    await shot('garmin-verbindung');
    const t = iso();
    const swap = (txt) => txt.replaceAll('2030-01-10', t).replaceAll('2030-01-09', addDays(t, -1)).replaceAll('2030-01-07', mondayOf(t)).replaceAll('2030-01-05', addDays(t, -5)).replaceAll('2030-01-06', addDays(t, -4));
    const raw = {}; for (const k of ['readiness', 'status', 'hrv', 'sleep', 'stats', 'vo2', 'intensity', 'activities']) raw[k] = JSON.parse(swap(fs.readFileSync(path.join(root, 'tests/fixtures/garmin', k + '.json'), 'utf8')));
    const env = await encryptFor(mergePayload({}, { ...mapGarmin(raw), created: new Date().toISOString() }), code);
    await ctx.route('**/garmin/daten.enc.json*', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(env) }));
    await page.locator('.full').getByText('Jetzt abholen').click(); await page.waitForTimeout(1200);
    await close(); await page.waitForTimeout(300);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await page.goto(url + '#/sport/heute'); await page.waitForTimeout(500);
    if (!(await page.getByText('▼ Leichtere Ersatz-Einheit').count())) throw new Error('Morgenbericht führt nicht zur leichteren Einheit');
    await shot('morgenbericht');
    await page.goto(url + '#/sport/garmin'); await page.waitForTimeout(600);
    for (const txt of ['Krafttraining', 'Intensitätsminuten pro Woche', 'Schlafphasen (letzte Nächte)', 'zuletzt aktualisiert']) if (!(await page.getByText(txt, { exact: false }).count())) throw new Error('Fehlt im Garmin-Bereich: ' + txt);
    if (!(await page.getByText('47,2').count())) throw new Error('VO2max aus Abholung fehlt');
    await shot('garmin-sync'); await noOverflow('sport/garmin');
  });
  await step('Animationen neben Übungen', async () => {
    await page.goto(url + '#/sport/kraft'); await page.waitForTimeout(400);
    const n = await page.locator('.list li').count(), t = await page.locator('.list li svg.fig.thumb').count();
    if (n === 0 || t < n) throw new Error(`Nur ${t} von ${n} Übungen mit Animation/Platzhalter`);
  });
  await step('Jede Übung: Animation, Erklärung, Quelle, PDF-Bild, Zoom', async () => {
    await page.goto(url + '#/sport/kraft'); await page.waitForTimeout(400);
    const names = await page.locator('.list li b').allInnerTexts();
    if (names.length < 29) throw new Error('Nur ' + names.length + ' Übungen');
    const bad = [];
    for (const [i, name] of names.entries()) {
      await page.goto(url + '#/sport/kraft'); await page.waitForTimeout(150);
      await page.locator('.list li').nth(i).click();
      const full = page.locator('.full').last();
      await full.locator('summary', { hasText: 'WARUM' }).click();
      if (await full.locator('svg.fig.placeholder').count()) bad.push(name + ': Platzhalter statt Animation');
      if (!(await full.locator('svg.fig:not(.placeholder)').count())) bad.push(name + ': keine Animation');
      const txt = await full.innerText();
      for (const t of ['WARUM IST DIE ÜBUNG DRIN?', 'WOFÜR IST SIE GUT?', 'PRAXISBEISPIELE', 'HAUPTQUELLE']) if (!txt.includes(t)) bad.push(name + ': ' + t + ' fehlt');
      const imgs = full.locator('.pdfseite img');
      const n = await imgs.count();
      if (!n) bad.push(name + ': kein PDF-Bild');
      for (let k = 0; k < n; k++) { await imgs.nth(k).scrollIntoViewIfNeeded(); await page.waitForTimeout(60); const ok = await imgs.nth(k).evaluate((im) => im.complete && im.naturalWidth > 500); if (!ok) bad.push(name + ': Bild ' + k + ' nicht geladen'); }
      if (i === 5) { await full.locator('.pdfseite').first().click(); await page.waitForTimeout(300); await shot('pdf-zoom'); await page.locator('.full').last().getByText('+', { exact: true }).click(); const w = await page.locator('.zoombox img').evaluate((im) => im.style.width); if (w !== '150%') bad.push('Zoom funktioniert nicht'); }
      if (i === 0) await shot('uebung-info');
      await page.evaluate(() => document.querySelectorAll('.full,.modal-bg').forEach((e) => e.remove()));
    }
    if (bad.length) throw new Error(bad.join(' | '));
  });
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

  const lessonLoop = async () => {
    for (let i = 0; i < 80; i++) {
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
    await page.locator('.full').last().getByText('Fertig').click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  };
  const testLoop = async (endMark) => {
    for (let i = 0; i < 40; i++) {
      const full = page.locator('.full').last();
      await page.waitForTimeout(150);
      if (await full.getByText(endMark).count()) return;
      const choice = full.locator('.choice button');
      if (await choice.count()) { await choice.first().click(); await page.waitForTimeout(750); continue; }
      const self = full.getByText(/SELBST BEWERTEN/);
      if (await self.count()) { await self.click(); await full.getByText('Flüssig gesagt').click(); continue; }
    }
    throw new Error('Test endet nicht');
  };
  for (const tab of ['heute', 'pfad', 'karten', 'hoeren', 'sprachen']) await step('Sprache/' + tab, async () => { await page.goto(url + '#/sprache/' + tab); await page.waitForTimeout(400); await shot('sprache-' + tab); await noOverflow('sprache/' + tab); });
  await step('Einstufungstest', async () => {
    await page.goto(url + '#/sprache/heute'); await page.waitForTimeout(300);
    await page.getByText('> Einstufungstest starten').click();
    await testLoop('[ EINSTUFUNG ]');
    await shot('einstufung'); await page.locator('.full').last().getByText('Los geht’s').click();
    const res = await page.evaluate(() => document.querySelector('.lvstrip') ? 1 : 0); if (!res) throw new Error('Stufenleiste fehlt');
  });
  await step('Lektion komplett', async () => {
    await page.goto(url + '#/sprache/pfad'); await page.waitForTimeout(300);
    await page.getByText(/^> Weiter:/).click();
    await lessonLoop();
  });
  await step('Tageseinheit 10 min: Laut sprechen', async () => {
    await page.goto(url + '#/sprache/heute'); await page.waitForTimeout(300);
    await page.locator('.seg button', { hasText: '10 min' }).click(); await page.waitForTimeout(200);
    if ((await page.locator('.step').count()) !== 3) throw new Error('10 min sollte 3 Schritte haben');
    await page.locator('.step', { hasText: 'Laut sprechen' }).click();
    await page.locator('.full').last().getByText('▶ Start').click(); await page.waitForTimeout(1200);
    await shot('sprechen'); await page.locator('.full').last().getByText('Erledigt').click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    if (!(await page.locator('.step.done', { hasText: 'Laut sprechen' }).count())) throw new Error('Schritt nicht abgehakt');
  });
  await step('Shadowing', async () => {
    await page.goto(url + '#/sprache/hoeren'); await page.waitForTimeout(300);
    await page.locator('.card', { hasText: 'SÄTZE' }).first().click();
    for (let i = 0; i < 8 && await page.getByText('Nachgesprochen – weiter').count(); i++) await page.getByText('Nachgesprochen – weiter').click();
    await shot('shadowing'); await page.locator('.full').last().getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await step('Stufentest', async () => {
    await page.goto(url + '#/sprache/pfad'); await page.waitForTimeout(300);
    await page.getByText(/^Stufentest [ABC][12]$/).first().click();
    await testLoop('[ DAS ÜBST DU NOCH ]').catch(async () => { if (!(await page.getByText(/erreicht\.|Bestanden\./).count())) throw new Error('Kein Testergebnis'); });
    await shot('stufentest'); await page.locator('.full').last().getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await step('Karteikarten SM-2', async () => {
    await page.goto(url + '#/sprache/karten'); await page.waitForTimeout(300);
    await page.locator('.card', { hasText: 'Funkvokabular' }).getByText('EN → DE').click(); await page.locator('.flash').click(); await shot('karten');
    await page.locator('.grid4').getByText('Gut', { exact: true }).click(); await close(); await page.waitForTimeout(600);
    const c = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('trainings-app'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('state'); g.onsuccess = () => res(Object.values(g.result.cards).filter((x) => x.ef).length); }; }));
    if (!c) throw new Error('SM-2-Karte nicht gespeichert');
  });
  await step('Eigene Karte', async () => { await page.goto(url + '#/sprache/karten'); await page.getByPlaceholder(/Englisch/).fill('to cut corners'); await page.getByPlaceholder('Deutsch').fill('pfuschen'); await page.getByText('+ Karte').click(); await page.waitForTimeout(200); await page.getByText('EIGENE KARTEN (1)').count(); });
  await step('Gespräch tippen', async () => { await page.goto(url + '#/sprache/hoeren'); await page.getByText('Funkprobe').click(); await page.getByPlaceholder('oder Antwort eintippen').fill('loud and clear over'); await page.getByText('OK', { exact: true }).click(); await page.waitForTimeout(300); await shot('gespraech'); await close(); });
  await step('Sprache wechseln: Arabisch-Lektion', async () => {
    await page.goto(url + '#/sprache/sprachen'); await page.waitForTimeout(300);
    await page.locator('.card', { hasText: 'Arabisch' }).first().click(); await page.waitForTimeout(400);
    await page.goto(url + '#/sprache/pfad'); await page.waitForTimeout(300); await shot('arabisch-pfad');
    await page.getByText(/^> Weiter:/).click(); await lessonLoop();
    await page.goto(url + '#/sprache/sprachen'); await page.locator('.card', { hasText: 'Englisch' }).first().click(); await page.waitForTimeout(300);
  });
  await step('Sprachpaket-Vorlage importieren', async () => {
    await page.goto(url + '#/sprache/sprachen'); await page.waitForTimeout(300);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByText('Vorlage speichern', { exact: true }).click()]);
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Sprachpaket importieren', { exact: true }).click()]);
    await fc.setFiles(await dl.path()); await page.waitForTimeout(400);
    if (!(await page.locator('.card', { hasText: 'Italienisch' }).count())) throw new Error('Importiertes Paket fehlt');
    await shot('sprachen-import');
  });

  const catLoop = async (endText) => {
    for (let i = 0; i < 200; i++) {
      if (await page.locator('.reward').count()) { await page.locator('.reward').first().click(); continue; }
      const full = page.locator('.full').last();
      if (await full.getByText(endText).count()) return;
      const start = full.getByText('> Start', { exact: true }); if (await start.count()) { await start.click(); continue; }
      const weiter = full.getByText('Weiter', { exact: true }); if (await weiter.count()) { await weiter.click(); continue; }
      const ready = full.getByText('Ich bin so weit'); if (await ready.count()) { await ready.click(); await page.waitForTimeout(1200); continue; }
      const d2 = full.locator('.d2'); if (await d2.count()) { for (let k = 0; k < 6; k++) await d2.nth(k).click(); await full.getByText('Fertig', { exact: true }).click(); await page.waitForTimeout(250); continue; }
      const opt = full.locator('.catopts button'); if (await opt.count()) { await opt.first().click(); await page.waitForTimeout(260); continue; }
      await page.waitForTimeout(300);
    }
    throw new Error('Ende nicht erreicht: ' + endText);
  };
  await step('Auswahl/CAT', async () => { await page.goto(url + '#/auswahl/cat'); await page.waitForTimeout(400); await shot('cat'); await noOverflow('auswahl/cat'); });
  for (const mod of ['Sprache', 'Mathe', 'Logik', 'Raum', 'Technik', 'Merken', 'Konzentr.', 'Wissen']) await step('CAT-Training ' + mod, async () => {
    await page.goto(url + '#/auswahl/cat'); await page.waitForTimeout(300);
    await page.locator('.tile', { hasText: mod }).click();
    await page.waitForTimeout(300); await shot('cat-train-' + mod.replace('.', ''));
    await catLoop('ABGESCHLOSSEN ]');
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await page.locator('.full').last().getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await step('CAT-Kurz-Simulation Bundespolizei', async () => {
    await page.goto(url + '#/auswahl/cat'); await page.waitForTimeout(300);
    await page.locator('.seg button', { hasText: 'Bundespolizei' }).click(); await page.waitForTimeout(300);
    await page.getByText(/^Kurz-Simulation/).click();
    await catLoop('[ AUSWERTUNG ]');
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await shot('cat-auswertung');
    await page.locator('.full').last().getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await page.waitForTimeout(400);
    if (!(await page.getByText('[ EMPFOHLEN: SCHWÄCHSTE BEREICHE ]').count())) throw new Error('Keine Empfehlung nach Simulation');
    await shot('cat-verlauf');
    await page.goto(url + '#/sport/plan'); await page.waitForTimeout(400);
    if (!(await page.getByText(/schwächster Bereich der letzten Simulation|Kopf-Test \(monatlich/).count())) throw new Error('Sonntag im Kopf-Wochenplan nutzt nicht den schwächsten CAT-Bereich');
  });

  await step('Kopf-Test (monatlich) komplett', async () => {
    await page.goto(url + '#/auswahl/cat'); await page.waitForTimeout(300);
    await page.getByText(/^> Kopf-Test starten/).click();
    await catLoop('[ AUSWERTUNG ]');
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await shot('kopftest-auswertung');
    await page.locator('.full').last().getByText('Fertig', { exact: true }).click(); await page.waitForTimeout(400);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    if (!(await page.getByText(/^LETZTER TEST/).count())) throw new Error('Kopf-Test nicht gespeichert');
    await page.getByText('[ KOPF-TEST · MONATLICH ]').scrollIntoViewIfNeeded(); await shot('kopftest-karte');
  });
  for (const tab of ['gespraech', 'schriftlich', 'tagebuch']) await step('Auswahl/' + tab, async () => { await page.goto(url + '#/auswahl/' + tab); await page.waitForTimeout(400); await shot('auswahl-' + tab); await noOverflow('auswahl/' + tab); });
  await step('Psychologengespräch: 3 Fragen mit Aufnahme + Nachfrage', async () => {
    await page.goto(url + '#/auswahl/gespraech'); await page.waitForTimeout(300);
    await page.locator('.seg button', { hasText: /^3$/ }).click();
    await page.getByText('> Übung starten').click();
    for (let q = 0; q < 4; q++) {
      const full = page.locator('.full').last();
      await full.getByText('🎙 Antwort aufnehmen').click(); await page.waitForTimeout(1600);
      await full.getByText('■ Antwort beenden').click(); await page.waitForTimeout(500);
      if (q === 0) await shot('psych-bewertung');
      const rows = full.locator('.chkrow'); for (let k = 0; k < 4; k++) await rows.nth(k).getByText(k === 1 ? 'Teils' : 'Ja', { exact: true }).click();
      await full.locator('textarea').fill('Konkretes Beispiel nennen.');
      if (!(await full.locator('audio').count())) throw new Error('Keine Aufnahme zum Anhören');
      if (q === 0) await full.getByText('Speichern + Nachfrage stellen').click(); else await full.getByText(/^Speichern – (nächste Frage|fertig)$/).click();
      await page.waitForTimeout(400);
    }
    const full = page.locator('.full').last(); await full.getByText('[ ÜBUNG BEENDET ]').waitFor(); await shot('psych-ende');
    await full.getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await page.waitForTimeout(500);
    if ((await page.getByText(/^▶ Anhören/).count()) < 4) throw new Error('Antworten mit Aufnahme fehlen');
    await page.getByText(/^▶ Anhören/).first().click(); await page.waitForTimeout(500);
    if (!(await page.locator('audio').count())) throw new Error('Aufnahme lässt sich nicht abspielen');
    if (!(await page.getByText('NACHFRAGE', { exact: false }).count())) throw new Error('Nachfrage nicht gespeichert');
    await shot('psych-verlauf');
  });
  await step('Lebenslauf + Motivationsschreiben', async () => {
    await page.goto(url + '#/auswahl/schriftlich'); await page.waitForTimeout(300);
    await page.locator('textarea').first().fill('Realschule 2019, Ausbildung Kältetechnik seit 2024');
    await page.locator('.seg button', { hasText: 'Motivation' }).click(); await page.waitForTimeout(200);
    await page.locator('textarea').first().fill('Weil ich im Team Verantwortung tragen will.');
    await page.getByText('Aus meinen Antworten zusammensetzen').click(); await page.waitForTimeout(200);
    const v = await page.locator('textarea').last().inputValue(); if (!v.includes('Verantwortung')) throw new Error('Entwurf leer');
    await shot('motivation');
  });
  await step('Übungsfragebogen', async () => {
    await page.goto(url + '#/auswahl/schriftlich'); await page.locator('.seg button', { hasText: 'Fragebögen' }).click(); await page.waitForTimeout(200);
    await page.getByText(/^> Übungsfragebogen/).click();
    for (let i = 0; i < 20; i++) await page.locator('.likert button').nth(i % 5).click();
    await page.getByText('[ AUSWERTUNG · KEINE DIAGNOSE ]').waitFor(); await shot('fragebogen');
    await page.locator('.full').last().getByText('Fertig', { exact: true }).click();
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
  });
  await step('Tagebuch', async () => {
    await page.goto(url + '#/auswahl/tagebuch'); await page.waitForTimeout(300);
    await page.locator('textarea').first().fill('Heute bei der Arbeit ruhig geblieben, als es hektisch wurde.');
    await page.getByText('Speichern', { exact: true }).click(); await page.waitForTimeout(600);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    await page.reload(); await page.waitForTimeout(900); await page.goto(url + '#/auswahl/tagebuch'); await page.waitForTimeout(400);
    if (!(await page.locator('textarea').first().inputValue()).includes('ruhig geblieben')) throw new Error('Tagebuch nicht gespeichert');
  });

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

  for (const tab of ['phase', 'kurse', 'spez']) await step('Nach AV/' + tab, async () => { await page.goto(url + '#/nachav/' + tab); await page.waitForTimeout(400); await shot('nachav-' + tab); });
  await step('Wissenskurs Magazin: Lektion + Quiz', async () => {
    await page.goto(url + '#/nachav/kurse'); await page.waitForTimeout(300);
    await page.getByText('Magazin: Aufbau & Handhabung').click();
    await page.locator('.full').last().getByText('1. Aufbau eines Kastenmagazins').click();
    for (let i = 0; i < 10; i++) {
      const full = page.locator('.full').last();
      if (await full.locator('svg.fig').count()) await shot('nachav-animation');
      const q = full.getByText('> Quiz zur Lektion'); if (await q.count()) { await q.click(); break; }
      await full.getByText('Weiter', { exact: true }).click();
    }
    for (let i = 0; i < 5; i++) {
      const full = page.locator('.full').last();
      if (await full.getByText(/BESTANDEN/).count()) break;
      await full.locator('.choice button').first().click();
      await full.getByText('Weiter', { exact: true }).click();
    }
    await shot('nachav-quiz-ende');
  });
  await step('Absehen-Animation', async () => {
    await page.goto(url + '#/nachav/kurse'); await page.waitForTimeout(300);
    await page.getByText('Optik & Absehen richtig ablesen').click();
    await page.locator('.full').last().getByText('2. Entfernung schätzen mit dem Absehen').click();
    await page.locator('.full').last().getByText('Weiter', { exact: true }).click();
    await page.getByText('800 m', { exact: true }).click(); await page.waitForTimeout(300);
    const txt = await page.locator('.full').last().innerText();
    if (!/2,3 MRAD/.test(txt)) throw new Error('Absehen-Rechnung fehlt');
    await shot('nachav-absehen');
  });
  await step('AV bestanden: Phase wechselt', async () => {
    await page.goto(url + '#/nachav/phase'); await page.waitForTimeout(300);
    await page.getByText('> AV bestanden – Phase starten').click();
    await page.getByText('Umstellen', { exact: true }).click(); await page.waitForTimeout(500);
    while (await page.locator('.reward').count()) { await page.locator('.reward').click(); await page.waitForTimeout(200); }
    const txt = await page.locator('#app').innerText();
    if (!/Maximalkraft Unterkörper/.test(txt)) throw new Error('Woche der neuen Phase fehlt');
    if (/Regelkonflikt/.test(txt)) throw new Error('Regelkonflikt');
    await shot('nachav-aktiv');
    await page.getByText('Schalter zurücksetzen').click(); await page.getByText('Zurücksetzen', { exact: true }).click(); await page.waitForTimeout(300);
  });
  await step('Kognitivtraining: Tagesbefehl, Plan, Mental', async () => {
    await page.goto(url + '#/sport/heute'); await page.waitForTimeout(400);
    const it = page.locator('.tl .it', { hasText: /^Kopf:/ }); if (!(await it.count())) throw new Error('Kein Kopf-Punkt im Tagesbefehl');
    await it.click(); await page.waitForTimeout(400);
    if (!(await page.locator('.full').count())) throw new Error('Training startet nicht'); await shot('kognitiv-start'); await close();
    await page.goto(url + '#/sport/plan'); await page.waitForTimeout(400);
    if (!(await page.getByText('[ KOGNITIVTRAINING · WOCHENPLAN ]').count())) throw new Error('Wochenplan fehlt');
    await page.getByText('[ KOGNITIVTRAINING · WOCHENPLAN ]').scrollIntoViewIfNeeded(); await shot('kognitiv-plan');
    await page.goto(url + '#/mental/spiele'); await page.waitForTimeout(300);
    if (!(await page.getByText('[ HEUTE IM PLAN ]').count())) throw new Error('Hinweis in Mental fehlt');
  });
  await step('Ruhepuls-Grenze in Einstellungen', async () => {
    await page.goto(url + '#/sport/heute'); await page.waitForTimeout(300); await page.locator('[title=Einstellungen]').click();
    const f = page.locator('label', { hasText: 'Ruhepuls-Grenze' }).locator('input'); if ((await f.inputValue()) !== '70') throw new Error('Standard nicht 70');
    await close();
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
