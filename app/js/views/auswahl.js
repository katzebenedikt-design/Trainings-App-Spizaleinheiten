// Bereich Auswahl: alles rund ums Auswahlverfahren außer Sport – CAT-Test und Psychologengespräch.
import { renderCat } from './cat.js';
import { renderGespraech, renderSchriftlich, renderTagebuch } from './psych.js';

export const auswahlTabs = [
  { key: 'cat', label: 'CAT-Test', render: renderCat },
  { key: 'gespraech', label: 'Gespräch', render: renderGespraech },
  { key: 'schriftlich', label: 'Schriftlich', render: renderSchriftlich },
  { key: 'tagebuch', label: 'Tagebuch', render: renderTagebuch },
];
