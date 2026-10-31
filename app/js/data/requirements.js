// ZENTRALE KONFIGURATION der Anforderungen und Wochenregeln.
// Wenn sich Auswahlverfahren oder Ausbildung ändern, nur hier anpassen (oder in der App unter
// Einstellungen → Zielwerte eigene Werte setzen). Der Planer liest ausschließlich hier.
export const REQ_STAND = 'Oktober 2026';

// Disziplinen: lower = kleiner ist besser (Zeiten). Einheit: 'zeit' (Sekunden), 'wdh', 'ml'.
// base: Richtwerte, wenn keine Einheit etwas vorgibt. min = Mindestniveau, goal = sicher bestehen, top = Top 0,1 %.
export const DISCIPLINES = {
  run3000: { label: '3000-m-Lauf', unit: 'zeit', lower: true, base: { min: 780, goal: 720, top: 645 }, core: true },
  run5000: { label: '5000-m-Lauf', unit: 'zeit', lower: true, base: { min: 1440, goal: 1320, top: 1140 } },
  pullups: { label: 'Klimmzüge', unit: 'wdh', base: { min: 7, goal: 14, top: 20 }, core: true },
  pushups: { label: 'Liegestütze', unit: 'wdh', base: { min: 40, goal: 60, top: 75 }, core: true },
  situps: { label: 'Sit-ups', unit: 'wdh', base: { min: 40, goal: 60, top: 75 }, core: true },
  swim100: { label: '100 m Brust', unit: 'zeit', lower: true, base: { min: 150, goal: 120, top: 100 }, core: true },
  ruck7: { label: '7 km Eilmarsch 20 kg', unit: 'zeit', lower: true, base: { min: 3120, goal: 2700, top: 2400 } },
  march20: { label: '20 km Marsch 20 kg', unit: 'zeit', lower: true, base: { min: 12600, goal: 11400, top: 10200 } },
  vo2max: { label: 'VO2max', unit: 'ml', base: { min: 45, goal: 50, top: 58 } },
};

// Vorgaben je Einheit. Nur was belegt ist; leere Einheit = Richtwerte (base).
export const UNITS = {
  KSK: {
    name: 'KSK (PFV)', quelle: 'Trainingshandbuch Bewerber KSK: PFV Phase 1/2',
    norms: {
      pullups: { min: 7 }, run3000: { goal: 720 }, ruck7: { goal: 2700 }, march20: { min: 12600 }, vo2max: { goal: 50 },
    },
    hinweise: ['5×1000 m in 4:30–3:50 min/km, 3 min Pause', 'mind. 20 Sit-ups und 22 Liegestütze in je 30 s', '200 m im Kampfanzug max. 7:30 + Entkleiden', '20 km Marsch mit 20 kg in max. 3,5 h', 'Nahkampf 2 min Sparring'],
  },
  EGB: {
    name: 'EGB (EAV)', quelle: 'EGB-Report PPF Germany: Vorbereitungs-Checkliste',
    norms: { run5000: { goal: 1320 }, ruck7: { goal: 2700 } },
    hinweise: ['5000 m unter 22 min', '7 km Eilmarsch 20 kg unter 45 min', '200 m Kleiderschwimmen deutlich unter 7:30', 'relative Maximalkraft 1,5–2× Körpergewicht'],
  },
  'GSG 9': {
    name: 'GSG 9 (Bundespolizei)', quelle: 'noch keine verlässlichen Werte – bitte unter Einstellungen → Zielwerte eintragen',
    norms: {},
    hinweise: ['Aktuelle Anforderungen bei der Bundespolizei erfragen'],
  },
};

// Feste Wochenregeln (0 = Montag). Der Planer prüft jeden Tag gegen diese Regeln.
export const WEEK_RULES = {
  0: { kraft: true, schwimmen: true },
  1: { kraft: true, schwimmen: true, fest: 'KICKBOX', keineSchwerenBeine: true },
  2: { kraft: true, schwimmen: true },
  3: { kraft: true, schwimmen: true, fest: 'KICKBOX', keineSchwerenBeine: true },
  4: { ruhetag: true, notiz: 'Heimfahrt' }, // kompletter Ruhetag, kein Training
  5: { kraft: false, schwimmen: false },
  6: { kraft: false, schwimmen: false },
};

export const KICKBOX = { titel: 'Kickboxen', min: 90, zeit: 'abends (fester Termin)' };

// Wirksame Zielwerte: Einheit gewählt → Einheit über Richtwerten; „offen“ → strengster Wert je Disziplin.
// Eigene Werte aus den Einstellungen (profile.targets) haben immer Vorrang.
export function getNorms(profile = {}) {
  const out = {};
  const unitKeys = profile.unit && UNITS[profile.unit] ? [profile.unit] : Object.keys(UNITS);
  for (const [k, d] of Object.entries(DISCIPLINES)) {
    const n = { ...d.base };
    for (const field of ['min', 'goal', 'top']) {
      const vals = unitKeys.map((u) => UNITS[u].norms[k]?.[field]).filter((v) => v != null);
      if (vals.length) n[field] = d.lower ? Math.min(...vals) : Math.max(...vals);
    }
    const own = profile.targets?.[k];
    if (own) for (const field of ['min', 'goal', 'top']) if (own[field] != null) n[field] = own[field];
    out[k] = { ...d, ...n, src: srcFor(k, unitKeys, own) };
  }
  return out;
}

function srcFor(k, unitKeys, own) {
  if (own && Object.values(own).some((v) => v != null)) return 'Eigener Zielwert';
  const from = unitKeys.filter((u) => UNITS[u].norms[k]);
  return from.length ? 'Vorgabe ' + from.join(' / ') : 'Richtwert aus den Handbüchern';
}
