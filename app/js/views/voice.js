// Werte per Spracheingabe eintragen ("Gewicht 72,5", "Klimmzüge 12", "Lauf 5 Kilometer 28 Minuten").
import { h, modal, toast } from '../ui.js';
import { listen, sttAvailable } from '../core/speech.js';
import { parseVoice } from '../core/voiceparse.js';
import { iso, fmtTime } from '../core/util.js';
import { logRunModal, logWeightModal } from './ausdauer.js';
import { testModal } from './test.js';
import { openCheckin } from './sport.js';

export function voiceCommand(app) {
  if (!sttAvailable()) { toast('Spracheingabe wird von diesem Browser nicht unterstützt.'); return; }
  modal(({ close }) => {
    const out = h('div', { class: 'm mt' }, 'Tippe auf das Mikrofon und sprich.');
    const go = async () => {
      out.textContent = 'ICH HÖRE ZU …';
      try {
        const alts = await listen({ lang: 'de-DE' });
        let r = null, heard = alts[0];
        for (const a of alts) { r = parseVoice(a); if (r) { heard = a; break; } }
        out.textContent = `GEHÖRT: „${heard}“`;
        if (!r) { if (/check/i.test(heard)) { close(); openCheckin(app); return; } toast('Nicht verstanden. Beispiel: „Klimmzüge 12“'); return; }
        close();
        if (r.kind === 'gewicht') logWeightModal(app, r.kg);
        else if (r.kind === 'ruhepuls') { const c = app.state.checkins.find((x) => x.date === iso()); if (c) { c.ruhepuls = r.bpm; app.save(); toast(`Ruhepuls ${r.bpm} eingetragen.`); app.refresh(); } else { toast('Erst Check-in ausfüllen, Ruhepuls dort eintragen.'); openCheckin(app); } }
        else if (r.kind === 'wdh') testModal(app, { [r.key]: r.value });
        else logRunModal(app, r.kind === 'schwimmen' ? 'schwimmen' : r.kind === 'marsch' ? 'marsch' : 'lauf', iso(), { distM: r.distM, durSec: r.durSec, kg: r.kg });
        toast('Bitte prüfen und speichern.' + (r.durSec ? ' Zeit: ' + fmtTime(r.durSec) : ''));
      } catch (e) { out.textContent = e.message; }
    };
    return h('div', {}, h('div', { class: 'k' }, '[ SPRACHEINGABE ]'), h('h2', {}, 'Wert ansagen'),
      h('ul', { class: 'plain small dim' }, h('li', {}, '„Gewicht 72,5“'), h('li', {}, '„Ruhepuls 54“'), h('li', {}, '„Klimmzüge 12“ / „Liegestütze 45“'), h('li', {}, '„Lauf 5 Kilometer 28 Minuten 30“'), h('li', {}, '„Schwimmen 800 Meter 22 Minuten“'), h('li', {}, '„Marsch 12 Kilometer 2 Stunden 15 Kilo“'), h('li', {}, '„Check-in“')),
      h('button', { class: 'btn f mt', onclick: go }, '🎙 Sprechen'), out);
  });
}
