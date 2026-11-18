// Website and home-screen app (PWA) must run the same code. These checks fail the build when they drift.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const sw = read('sw.js'), html = read('index.html'), man = JSON.parse(read('manifest.webmanifest'));
const SHELL = JSON.parse(sw.match(/const SHELL=(\[[^\]]+\])/)[1].replace(/'/g, '"'));
test('every script and stylesheet the page loads is in the offline SHELL', () => {
  const used = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map(m => m[1]);
  assert.ok(used.length > 20);
  for (const f of used) assert.ok(SHELL.includes(f), `${f} is loaded by index.html but missing from sw.js SHELL (offline app would break)`);
});
test('every file in SHELL exists', () => {
  for (const f of SHELL) if (f !== './') assert.ok(existsSync(new URL('../' + f, import.meta.url)), `sw.js SHELL lists missing file ${f}`);
});
test('dynamically loaded vendor files are in SHELL too', () => {
  for (const f of [...read('js/auth.js').matchAll(/src='(js\/vendor\/[^']+)'/g)].map(m => m[1])) assert.ok(SHELL.includes(f), f);
});
test('manifest icons and screenshots exist', () => {
  for (const i of [...man.icons, ...(man.screenshots || [])]) assert.ok(existsSync(new URL('../' + i.src.replace(/^\//, ''), import.meta.url)), i.src);
});
test('cache version has the loka-v<number> shape', () => assert.match(sw, /const VERSION='loka-v\d+'/));
