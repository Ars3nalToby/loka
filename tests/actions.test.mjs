// Every data-a action name must mean one thing. The squad poster's colour buttons once used "theme",
// which the header's light/dark switch catches first, so picking a poster colour flipped the whole app dark.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
test('poster colour buttons do not share the light/dark action name', () => {
  const more = readFileSync(new URL('../js/more.js', import.meta.url), 'utf8');
  const poster = more.slice(more.indexOf('function poster('));
  assert.ok(!/data-a="theme"/.test(poster.slice(0, 2000)), 'poster buttons must not use data-a="theme"');
});
test('sample listings use ACMA fiction phone numbers only (no real person gets called)', () => {
  const seed = readFileSync(new URL('../js/seed.js', import.meta.url), 'utf8');
  for (const m of seed.matchAll(/\b0[45]\d{2}[ \d]{6,8}\b/g)) assert.match(m[0].replace(/\s/g, ''), /^049157\d{4}$/, m[0]);
});
test('no inline event handlers (the CSP blocks them, so they silently do nothing)', () => {
  for (const f of readdirSync(new URL('../js/', import.meta.url)).filter(f => f.endsWith('.js'))) {
    const s = readFileSync(new URL('../js/' + f, import.meta.url), 'utf8');
    assert.ok(!/\son(click|change|input|load|error)=/.test(s), f);
  }
});
test('the CSP lets the app reach only Loka\'s own Supabase project', () => {
  const v = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
  const host = readFileSync(new URL('../js/config.js', import.meta.url), 'utf8').match(/url:'https:\/\/([a-z0-9]+\.supabase\.co)'/)[1];
  const cs = v.match(/connect-src ([^;"]*)/)[1];
  assert.ok(cs.includes('https://' + host) && cs.includes('wss://' + host), cs);
  assert.ok(!cs.includes('*.supabase.co'), 'no wildcard Supabase projects');
});
