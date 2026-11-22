// Run: node --test   Australian mobile number handling for SMS sign-in codes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ AUTH: { url: '', key: '' }, t: (en) => en, window: {}, document: {} });
vm.runInContext(readFileSync(new URL('../js/auth.js', import.meta.url), 'utf8'), ctx);
const au = (s) => vm.runInContext(`auMobile(${JSON.stringify(s)})`, ctx);
test('accepts the usual ways people write an Australian mobile', () => {
  for (const s of ['0412 345 678', '0412345678', '412345678', '+61 412 345 678', '61412345678', '(04) 1234-5678'])
    assert.equal(au(s), '+61412345678', s);
});
test('rejects landlines, short numbers and other countries', () => {
  for (const s of ['07 3123 4567', '0312345678', '041234567', '+64 21 123 4567', '+86 138 0013 8000', '', 'abc'])
    assert.equal(au(s), null, s);
});
test('shows a stored number back in local format', () =>
  assert.equal(vm.runInContext(`showPhone('+61412345678')`, ctx), '0412 345 678'));
test('auth stays off until url and key are set', () => assert.equal(vm.runInContext('authReady()', ctx), false));
// 23 Nov 2026: email now carries a code (custom SMTP + {{ .Token }} template). The sheet must ask for the
// code, accept Supabase's 6-10 digit lengths, and no longer tell home-screen users to go to the browser.
test('email sign-in asks for the code and accepts 6-10 digits', () => {
  const src = readFileSync(new URL('../js/auth.js', import.meta.url), 'utf8');
  assert.ok(src.includes("Enter the code from your email"));
  assert.ok(src.includes('maxlength="10" class="otp"'));
  assert.ok(src.includes('code.length<6||code.length>10'));
  assert.ok(!src.includes('the link cannot reach the home-screen app'));
});
