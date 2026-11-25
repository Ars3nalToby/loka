// api/daily.js: keep-alive every day, backup email on Brisbane Mondays, locked to Vercel Cron's secret.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { createRequire } from 'node:module'; import zlib from 'node:zlib';
const handler = createRequire(import.meta.url)('../api/daily.js');
const SUN_UTC_1715 = Date.UTC(2026, 10, 22, 17, 15); // = Mon 23 Nov 03:15 Brisbane
const TUE_UTC_1715 = Date.UTC(2026, 10, 23, 17, 15); // = Tue 24 Nov 03:15 Brisbane
const env = { CRON_SECRET: 's3cret-for-test', SUPABASE_SECRET_KEY: 'sb_secret_TEST', RESEND_API_KEY: 're_TEST', BACKUP_TO: 'owner@example.com', BACKUP_KEY: 'correct horse battery staple' };
function run({ auth = 'Bearer s3cret-for-test', e = env, now = TUE_UTC_1715, fail } = {}) {
  const calls = []; let status, body; const headers = {};
  const fetch = async (url, opt = {}) => { calls.push({ url, opt });
    if (fail && url.includes(fail)) return { ok: false, status: 503, json: async () => ({}) };
    if (url.includes('/rest/v1/homes')) return { ok: true, json: async () => [{ id: 'h1', title: 'Room' }] };
    return { ok: true, json: async () => [] }; };
  const res = { setHeader: (k, v) => (headers[k] = v), end: b => (body = JSON.parse(b)), set statusCode(s) { status = s; }, get statusCode() { return status; } };
  return handler({ headers: auth ? { authorization: auth } : {} }, res, { env: e, fetch, now }).then(() => ({ status, body, calls, headers }));
}
test('refuses anyone without the cron secret', async () => {
  for (const auth of [null, 'Bearer wrong', 'Bearer s3cret-for-tes', 's3cret-for-test']) {
    const r = await run({ auth }); assert.equal(r.status, 401); assert.equal(r.calls.length, 0, 'no database call for strangers'); }
});
test('refuses everything when CRON_SECRET is not set (fails closed)', async () => {
  const r = await run({ e: { ...env, CRON_SECRET: '' }, auth: 'Bearer ' }); assert.equal(r.status, 401);
});
test('keep-alive makes one real database read on an ordinary day, no backup', async () => {
  const r = await run();
  assert.equal(r.status, 200); assert.equal(r.body.keepalive, true); assert.equal(r.body.backup, 'not_monday');
  assert.equal(r.calls.length, 1); assert.match(r.calls[0].url, /\/rest\/v1\/suburbs\?select=name&limit=1$/);
  assert.equal(r.headers['Cache-Control'], 'no-store');
});
test('on a Brisbane Monday it emails a gzipped backup of every table to BACKUP_TO only', async () => {
  const r = await run({ now: SUN_UTC_1715 });
  assert.equal(r.body.backup, 'sent'); assert.equal(r.body.rows.homes, 1);
  const mail = r.calls.find(c => c.url === 'https://api.resend.com/emails'); const m = JSON.parse(mail.opt.body);
  assert.deepEqual(m.to, ['owner@example.com']); assert.match(m.from, /no-reply@lokabne\.au/);
  const enc = Buffer.from(m.attachments[0].content, 'base64');
  assert.equal(enc.subarray(0, 5).toString(), 'LOKA1'); assert.match(m.attachments[0].filename, /\.json\.gz\.enc$/);
  assert.throws(() => zlib.gunzipSync(enc), 'the email attachment must not be readable without the passphrase');
  const { decryptBackup } = await import('../tools/decrypt-backup.mjs');
  const data = JSON.parse(zlib.gunzipSync(decryptBackup(enc, env.BACKUP_KEY)));
  assert.throws(() => decryptBackup(enc, 'wrong passphrase'));
  assert.equal(data.tables.homes[0].title, 'Room'); assert.equal(Object.keys(data.tables).length, 10);
  assert.ok(r.calls.filter(c => c.url.includes('/rest/v1/') && !c.url.includes('suburbs')).every(c => c.opt.headers.apikey === 'sb_secret_TEST'));
});
test('the reply never contains secrets or table contents', async () => {
  const r = await run({ now: SUN_UTC_1715 }); const s = JSON.stringify(r.body);
  for (const bad of ['sb_secret_TEST', 're_TEST', 's3cret', 'owner@example.com', 'Room']) assert.ok(!s.includes(bad), bad);
});
test('missing backup settings: keep-alive still runs, backup skipped', async () => {
  const r = await run({ now: SUN_UTC_1715, e: { CRON_SECRET: env.CRON_SECRET } });
  assert.equal(r.status, 200); assert.equal(r.body.keepalive, true); assert.equal(r.body.backup, 'skipped_missing_settings');
});
test('no BACKUP_KEY: the backup is not sent in the clear, and the run is marked failed', async () => {
  const { BACKUP_KEY, ...e } = env;
  const r = await run({ now: SUN_UTC_1715, e });
  assert.equal(r.status, 500); assert.equal(r.body.backup, 'skipped_no_encryption_key');
  assert.ok(!r.calls.some(c => c.url === 'https://api.resend.com/emails'));
});
test('a failed backup is reported as a failure (500), not silently ignored', async () => {
  const r = await run({ now: SUN_UTC_1715, fail: 'api.resend.com' });
  assert.equal(r.status, 500); assert.equal(r.body.backup, 'failed');
});
test('vercel.json schedules it once a day (Hobby limit) at 03:00 Brisbane', async () => {
  const v = JSON.parse((await import('node:fs')).readFileSync('vercel.json', 'utf8'));
  assert.deepEqual(v.crons, [{ path: '/api/daily', schedule: '0 17 * * *' }]);
});
