// Run: node --test   The stylesheet is hand-written: catch an unclosed rule before it breaks a page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../css/app.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"]*"/g, '""');
test('every { in app.css has its }', () => {
  let d = 0, line = 1;
  for (const ch of css) { if (ch === '\n') line++; if (ch === '{') d++; if (ch === '}') { d--; assert.ok(d >= 0, 'extra } near line ' + line); } }
  assert.equal(d, 0, 'unclosed rule(s)');
});
test('no rule nests a selector inside a plain rule by accident', () => {
  // A plain rule (not @media/@supports/@keyframes) that contains another { means a missing }.
  const re = /(^|})\s*([^@{}\s][^{}]*)\{([^{}]*)\{/g; const m = re.exec(css);
  assert.equal(m, null, m ? 'possible missing } before: ' + m[2].trim().slice(0, 60) : '');
});
