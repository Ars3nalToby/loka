// Owner's rule (23 Nov 2026): wherever the app shows 小红书, it also says RedNote, so people who only know
// the English name understand it. Comments (// ...) are ignored; every user-facing 小红书 must be followed by RedNote.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
test('every 小红书 shown to users is labelled RedNote', () => {
  const bad = [];
  for (const f of fs.readdirSync('js').filter(f => f.endsWith('.js'))) {
    fs.readFileSync('js/' + f, 'utf8').split('\n').forEach((line, i) => {
      const code = line.trimStart().startsWith('//') ? '' : line;
      for (const m of code.matchAll(/小红书/g)) {
        const after = code.slice(m.index + 3, m.index + 14);
        if (!/^(\s?\(|（)RedNote/.test(after)) bad.push(`${f}:${i + 1}`);
      }
    });
  }
  assert.deepEqual(bad, []);
});
