// Wanted posts 求租 (js/wanted.js). The form check must match the database (supabase/migrations/007_wanted.sql),
// matching must only suggest rooms that really fit, and the landlord numbers must be right.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const Z = { Sunnybank: 'south', 'St Lucia': 'west', 'West End': 'inner', Annerley: 'innersouth' };
const ctx = vm.createContext({
  t: (en) => en, esc: (s) => String(s), btoa, atob, escape, unescape, encodeURIComponent, decodeURIComponent,
  ZN: { inner: ['Inner city', '市中心'], west: ['West · UQ', '西区'], innersouth: ['Inner south', '内南区'], south: ['South', '南区'] },
  CAMPUS_SHORT: { uq: 'UQ', 'gu-nathan': 'Griffith' }, zone: (a) => Z[a] || 'other', homeFlags: (h) => (h.bond > h.rent * 4 ? ['bond'] : []),
  DB: { on: true }, S: { homes: [], wanted: [] }, location: { origin: 'https://lokabne.au' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
});
for (const f of ['scout.js', 'wanted.js']) vm.runInContext(readFileSync(new URL('../js/' + f, import.meta.url), 'utf8'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const form = (o = {}) => ({ budget: '280', zones: ['south'], kind: 'room', stay: '6', move: '', campus: 'gu-nathan', zh: true, note: 'Griffith student, quiet', by: 'Amy', contact: 'wx: amy_bne', c1: true, c2: true, ...o });
const row = (o) => { ctx.f = form(o); return run('wantRow(f)'); };

test('a good post becomes a database row and a separate contact', () => {
  const r = row();
  assert.ok(Array.isArray(r));
  assert.equal(JSON.stringify(r[0].zones), '["south"]'); assert.equal(r[0].budget, 280); assert.equal(r[0].move_in, null);
  assert.equal(r[1], 'wx: amy_bne'); assert.equal(r[0].note.includes('amy_bne'), false);
});
test('refused like the database: budget, sides of town, declarations, contact', () => {
  for (const o of [{ budget: '10' }, { budget: '9000' }, { zones: [] }, { c1: false }, { c2: false }, { contact: '' }])
    assert.equal(typeof row(o), 'string', JSON.stringify(o));
});
test('unknown sides of town and campuses are dropped, never sent', () => {
  const r = row({ zones: ['south', 'goldcoast'], campus: 'harvard', kind: 'castle', stay: '99' });
  assert.equal(JSON.stringify(r[0].zones), '["south"]'); assert.equal(r[0].campus, ''); assert.equal(r[0].kind, 'any'); assert.equal(r[0].stay, 'any');
});
// The database constraint wanted_note_no_contact, written as a JS regex. The client must refuse at least what it refuses.
const dbRefuses = (s) => /@/.test(s) || /(\d[\s.-]*){8,}/.test(s) || /(微信|wechat|\bwx\s*[:：]|\bvx\s*[:：])/i.test(s);
test('a phone, email or WeChat in "About you" is refused before it reaches the database', () => {
  for (const note of ['call 0412 345 678', 'a@b.com', '加我微信 abc', 'wechat amy', 'wx: amy', 'vx：amy', '+61412345678'])
  { assert.ok(dbRefuses(note), 'db: ' + note); assert.equal(typeof row({ note }), 'string', note); }
});
test('ordinary notes are accepted by both', () => {
  for (const note of ['Griffith master’s student, 2 years', 'Budget $280, bus 130 ok', '安静，不抽烟，会做饭', 'Move 1 12 2026'])
  { assert.equal(dbRefuses(note), false, 'db: ' + note); assert.ok(Array.isArray(row({ note })), note); }
});
test('a move-in more than a year away is refused', () => {
  assert.equal(typeof row({ move: '2099-01-01' }), 'string');
});

const home = (o) => ({ id: 'h', db: true, status: 'published', hidden: false, type: 'room', area: 'Sunnybank', rent: 250, bond: 1000, zh: true, verified: false, ...o });
const want = (o) => ({ id: 'w', db: true, status: 'published', hidden: false, mine: false, kind: 'room', budget: 280, zones: ['south'], zh: false, stay: 'any', exp: new Date(Date.now() + 5 * 864e5).toISOString(), ...o });
test('rooms that fit: budget, side of town, type, language, and no rule-breaking rooms', () => {
  ctx.S.homes = [home({ id: 'ok' }), home({ id: 'dear', rent: 300 }), home({ id: 'west', area: 'St Lucia' }), home({ id: 'unit', type: 'unit' }),
    home({ id: 'bond', bond: 2000 }), home({ id: 'pend', status: 'pending' }), home({ id: 'sample', db: false })];
  ctx.w = want(); assert.deepEqual(run('wFitRooms(w).map(h=>h.id)'), ['ok']);
  ctx.w = want({ kind: 'any', budget: 400, zones: ['south', 'west'] }); assert.deepEqual(run('wFitRooms(w).map(h=>h.id).sort()'), ['dear', 'ok', 'unit', 'west']);
  ctx.w = want({ zh: true }); ctx.S.homes = [home({ zh: false })]; assert.equal(run('wFitRooms(w).length'), 0);
});
test('landlord numbers count only live posts: not pending, hidden or expired', () => {
  ctx.S.wanted = [want({ budget: 200, zones: ['west'] }), want({ id: 'b', budget: 300, zones: ['south', 'west'] }), want({ id: 'c', budget: 400, zones: ['west'] }),
    want({ id: 'p', status: 'pending' }), want({ id: 'x', exp: new Date(Date.now() - 864e5).toISOString() }), want({ id: 'hid', hidden: true })];
  const s = run('wStats()'); assert.equal(s.n, 3); assert.equal(s.mid, 300); assert.equal(s.top, 'west');
});
test('a lister sees renters their room suits, never their own post', () => {
  ctx.S.wanted = [want(), want({ id: 'me', mine: true })]; ctx.h = home();
  assert.deepEqual(run('wForRoom(h).map(w=>w.id)'), ['w']);
});
test('the ready message to a renter carries no contact details and states the bond limit', () => {
  ctx.w = want(); const m = run('wMsg(w)');
  assert.ok(!dbRefuses(m.replace(/lokabne\.au/g, ''))); assert.match(m, /4 weeks/); assert.match(m, /RTA/);
});
test('while the live database has no wanted table, the 求租 entry points stay hidden', () => {
  ctx.DB.wantOk = false; assert.equal(run('wantedBar()'), '');
  ctx.DB.wantOk = true; assert.match(run('wantedBar()'), /data-v="wanted"/);
});
