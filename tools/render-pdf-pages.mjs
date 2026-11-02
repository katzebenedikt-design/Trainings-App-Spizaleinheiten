// Rendert alle in app/js/data/exercise-info.js genannten PDF-Seiten als JPG nach app/pdfseiten/.
// Aufruf: node tools/render-pdf-pages.mjs   (benötigt pdftoppm aus poppler-utils)
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { EXERCISE_INFO, PDFS, seitenBild } from '../app/js/data/exercise-info.js';

const root = new URL('..', import.meta.url).pathname;
mkdirSync(join(root, 'app/pdfseiten'), { recursive: true });
const pages = new Map();
for (const info of Object.values(EXERCISE_INFO)) for (const q of info.quellen) pages.set(seitenBild(q.pdf, q.seite), q);
for (const [rel, q] of pages) {
  const out = join(root, 'app', rel);
  if (existsSync(out)) continue;
  const base = out.replace(/\.jpg$/, '');
  execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=72', '-scale-to', '1100', '-f', String(q.seite), '-l', String(q.seite), '-singlefile', join(root, PDFS[q.pdf].datei), base]);
  if (!existsSync(out)) renameSync(base + '.jpg', out);
  console.log('✓', rel);
}
console.log(pages.size, 'Seiten');
