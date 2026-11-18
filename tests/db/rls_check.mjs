// Run from the repo root:  npm i --no-save @electric-sql/pglite && node tests/db/rls_check.mjs
// Loads supabase/migrations/001_init.sql into PGlite (real Postgres in WebAssembly) with a small
// stand-in for Supabase's auth schema and roles, then tries what an attacker or a careless client
// would try. Every line must print PASS. Roadmap O2 asks for the two attacks marked [O2].
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
const A = '11111111-1111-1111-1111-111111111111', B = '22222222-2222-2222-2222-222222222222', ADM = '33333333-3333-3333-3333-333333333333';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
async function as(who, sql, params) {
  await db.exec('reset role; reset session authorization');
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [who === 'anon' ? '' : who]);
  // Like Supabase: the API logs in as "authenticator", which may only become anon or authenticated.
  await db.exec(`set session authorization authenticator; set role ${who === 'anon' ? 'anon' : 'authenticated'}`);
  try { const r = await db.query(sql, params); return { rows: r.rows, n: r.affectedRows ?? r.rows.length }; }
  catch (e) { return { err: e.message }; }
  finally { await db.exec('reset role; reset session authorization'); }
}
const home = (o = {}) => ({ type: 'room', agr: 'room', title: 'Sunny room near Griffith', area: 'Sunnybank', rent: 250, bond: 1000, adv_weeks: 2,
  decl_fixed_price: true, decl_bond_rta: true, decl_sublet_ok: true, decl_true: true, ...o });
const ins = h => { const k = Object.keys(h); return [`insert into public.homes(${k.join(',')}) values (${k.map((_, i) => '$' + (i + 1)).join(',')}) returning id,status,verified`, Object.values(h)]; };

// Supabase stand-in
await db.exec(`
  create schema auth; create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin;
  create role authenticator noinherit login; grant anon, authenticated to authenticator;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;`);
await db.exec(readFileSync(new URL('../../supabase/migrations/001_init.sql', import.meta.url), 'utf8'));
await db.exec(`insert into auth.users(id) values ('${A}'),('${B}'),('${ADM}'); update public.profiles set is_admin = true where id = '${ADM}';`);
ok((await db.query('select count(*)::int c from public.suburbs')).rows[0].c === 53, '53 suburbs loaded from js/suburbs.js');

// Posting
let r = await as('anon', ...ins(home()));
ok(!!r.err, 'signed-out visitor cannot post a room');
r = await as(A, ...ins(home({ status: 'published', verified: true, verified_at: '2026-11-18' })));
ok(!r.err && r.rows[0].status === 'pending' && r.rows[0].verified === false, 'a new room is forced to pending and unverified, whatever the client sends');
const h1 = r.rows[0]?.id;
r = await as(A, ...ins(home({ bond: 1500 })));
ok(/qld_bond_max_4_weeks/.test(r.err || ''), '[O2] bond of 6 weeks is rejected by the database');
r = await as(A, ...ins(home({ adv_weeks: 3 })));
ok(/qld_rent_in_advance/.test(r.err || ''), '3 weeks rent in advance on a room is rejected');
r = await as(A, ...ins(home({ role: 'head', owner_consent: false })));
ok(/sublet_needs_owner_consent/.test(r.err || ''), 'sub-letting without the owner\'s consent is rejected');
r = await as(A, ...ins(home({ decl_bond_rta: false })));
ok(/all_declarations_true/.test(r.err || ''), 'a room with a declaration left unticked is rejected');
r = await as(A, ...ins(home({ area: 'Gold Coast' })));
ok(!!r.err, 'a suburb outside Loka\'s coverage list is rejected');
r = await as(A, ...ins(home({ owner: B })));
ok(!!r.err, 'nobody can post a room in someone else\'s name');

// Self-promotion
r = await as(A, `update public.homes set verified = true, verified_at = current_date where id = $1`, [h1]);
ok(/only an admin can verify/.test(r.err || ''), '[O2] the owner cannot mark their own room verified');
r = await as(A, `update public.homes set status = 'published' where id = $1`, [h1]);
ok(/only an admin can publish/.test(r.err || ''), 'the owner cannot publish their own room');
r = await as(A, `update public.profiles set is_admin = true where id = $1`, [A]);
ok(/only an admin/.test(r.err || ''), 'nobody can make themselves an admin');
r = await as(A, `select set_config('role', 'postgres', false)`);
ok(!!r.err, 'a signed-in user cannot switch to the database owner role');
r = await as(A, `update public.homes set owner = $2 where id = $1`, [h1, B]);
ok(!!r.err, 'an owner cannot hand a room to someone else');

// Visibility before and after review
r = await as('anon', `select id from public.homes`);
ok(r.rows.length === 0, 'a pending room is invisible to the public');
r = await as(ADM, `update public.homes set status = 'published' where id = $1`, [h1]);
ok(!r.err && r.n === 1, 'an admin can publish');
await as(A, `insert into public.home_contacts(home_id, contact) values ($1, 'wechat: amy_bne')`, [h1]);
r = await as('anon', `select id from public.homes`);
ok(r.rows.length === 1, 'the published room is visible to the public');
r = await as('anon', `select contact from public.home_contacts`);
ok(!!r.err || r.rows.length === 0, 'signed-out visitors cannot read contact details');
r = await as(B, `select contact from public.home_contacts`);
ok(r.rows.length === 1, 'a signed-in user can read the contact of a published room');
r = await as(B, `update public.homes set rent = 10 where id = $1`, [h1]);
ok(r.n === 0 || !!r.err, 'another user cannot edit someone else\'s room');
r = await as(B, `delete from public.homes where id = $1`, [h1]);
ok(r.n === 0 || !!r.err, 'another user cannot delete someone else\'s room');
r = await as(A, `update public.homes set rent = 260 where id = $1 returning status`, [h1]);
ok(r.rows?.[0]?.status === 'pending', 'an owner\'s edit sends a published room back for review');

// Rate limit (A already has 1 room today)
await as(A, ...ins(home())); await as(A, ...ins(home()));
r = await as(A, ...ins(home()));
ok(/limit: 3 new homes per day/.test(r.err || ''), 'a 4th room in 24 hours is refused');

// Reports
await as(ADM, `update public.homes set status = 'published' where id = $1`, [h1]);
r = await as('anon', `insert into public.reports(kind,item,why) values ('homes',$1,'scam')`, [h1]);
ok(!!r.err, 'signed-out visitors cannot send reports');
for (const u of [A, B, ADM]) await as(u, `insert into public.reports(kind,item,why) values ('homes',$1,'looks like a scam')`, [h1]);
r = await as('anon', `select id from public.homes where id = $1`, [h1]);
ok(r.rows.length === 0, 'three reports hide the room from the public until an admin looks');
r = await as(B, `update public.reports set open = false`);
ok(!!r.err || r.n === 0, 'a reporter cannot close reports');

// Jobs share the same guards
r = await as(A, `insert into public.jobs(title,area,pay,decl_award_pay,decl_no_cash_only,decl_true,status) values ('Kitchen hand','Sunnybank',30,true,true,true,'published') returning status`);
ok(r.rows?.[0]?.status === 'pending', 'a new job is forced to pending');

console.log(fails ? `\n${fails} FAILED` : '\nAll database checks passed.');
process.exit(fails ? 1 : 0);
