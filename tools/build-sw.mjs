// Erzeugt app/sw.js mit Dateiliste und Versionsnummer (Inhalts-Hash).
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = new URL('../app/', import.meta.url).pathname;
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (!/sw\.js$|\.DS_Store/.test(f)) files.push(p); } };
walk(root);
files.sort();
const hash = createHash('sha1');
for (const f of files) hash.update(readFileSync(f));
const list = ['./', ...files.map((f) => './' + relative(root, f))];
const tpl = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8');
writeFileSync(join(root, 'sw.js'), tpl.replace('__VERSION__', hash.digest('hex').slice(0, 10)).replace('__ASSETS__', JSON.stringify(list, null, 1)));
console.log('sw.js:', list.length, 'Dateien');
