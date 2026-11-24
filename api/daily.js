// Loka · api/daily.js: the once-a-day job (Vercel Cron, see "crons" in vercel.json; 03:00-03:59 Brisbane).
//
// 1. Keep-alive. Supabase pauses a Free project after about a week with too little database activity.
//    Every run makes one real, harmless database read (the public suburbs list), so Loka never pauses,
//    even in a quiet week.
// 2. Weekly backup. On Mondays (Brisbane time) it reads every public table with the Supabase secret key,
//    packs them into one gzipped JSON file and emails it to the owner through Resend.
//    Supabase Free has no backups of its own, and the GitHub repo is PUBLIC, so the backup must never go
//    to GitHub. It goes only to the address in BACKUP_TO.
//
// Settings (Vercel → Project → Settings → Environment Variables; never in this repo):
//   CRON_SECRET          required. Vercel sends it as "Authorization: Bearer …" on cron runs. Without it
//                        this function refuses every request, so strangers cannot trigger it.
//   SUPABASE_SECRET_KEY  for the backup only (Supabase → Project Settings → API keys → secret key).
//   RESEND_API_KEY       for the backup only (a separate "Sending access" key for lokabne.au).
//   BACKUP_TO            for the backup only: the owner's inbox.
// If the three backup settings are missing, the keep-alive still runs and the reply says the backup was skipped.
//
// Security rules for this file:
//   • Nothing from the request is used except the Authorization header. No URL, table or address comes from
//     the request, so the function cannot be pointed anywhere else.
//   • Secrets and table contents are never written to the reply or the logs. The reply holds only counts.
'use strict';
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const SUPA = 'https://ksnjvgfptqhtydcmmqwm.supabase.co';
const PUBLISHABLE = 'sb_publishable_JIlgPYIVzeFqupY1WANZxw_J9gomZjO'; // public by design (also in js/config.js)
const TABLES = ['profiles', 'homes', 'home_contacts', 'jobs', 'job_contacts', 'questions', 'answers', 'reports', 'wanted', 'wanted_contacts'];
const FROM = 'Loka backups <no-reply@lokabne.au>';
const BNE = 10 * 36e5; // Queensland is UTC+10 all year

function authorised(req, secret) {
  if (!secret) return false; // fail closed
  const got = Buffer.from(String(req.headers?.authorization || ''));
  const want = Buffer.from('Bearer ' + secret);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
const isBrisbaneMonday = now => new Date(now + BNE).getUTCDay() === 1;
const bneDate = now => new Date(now + BNE).toISOString().slice(0, 10);
const keyHeaders = key => (/^eyJ/.test(key) ? { apikey: key, Authorization: 'Bearer ' + key } : { apikey: key });

async function keepAlive(fetchFn) {
  const r = await fetchFn(`${SUPA}/rest/v1/suburbs?select=name&limit=1`, { headers: keyHeaders(PUBLISHABLE) });
  if (!r.ok) throw new Error('keepalive_http_' + r.status);
  await r.json();
  return true;
}

async function dumpTables(fetchFn, key) {
  const out = {}, counts = {};
  for (const t of TABLES) {
    const rows = [];
    for (let from = 0; ; from += 1000) { // PostgREST returns at most 1000 rows per request
      const r = await fetchFn(`${SUPA}/rest/v1/${t}?select=*`, { headers: { ...keyHeaders(key), Range: `${from}-${from + 999}` } });
      if (!r.ok) throw new Error(`backup_${t}_http_${r.status}`);
      const page = await r.json();
      rows.push(...page);
      if (page.length < 1000) break;
    }
    out[t] = rows; counts[t] = rows.length;
  }
  return { out, counts };
}

async function sendBackup(fetchFn, env, now) {
  const { out, counts } = await dumpTables(fetchFn, env.SUPABASE_SECRET_KEY);
  const day = bneDate(now);
  const file = zlib.gzipSync(Buffer.from(JSON.stringify({ project: 'loka', taken_at: new Date(now).toISOString(), tables: out })));
  const lines = TABLES.map(t => `${t}: ${counts[t]}`).join('\n');
  const r = await fetchFn('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM, to: [env.BACKUP_TO], subject: `Loka weekly backup ${day}`,
      text: `Loka weekly database backup, ${day} (Brisbane).\n\nRows per table:\n${lines}\n\n` +
        `Keep this email private: the file holds users' emails and listing contacts.\n` +
        `Restore steps: docs/BACKUP.md in the Loka repo.`,
      attachments: [{ filename: `loka-backup-${day}.json.gz`, content: file.toString('base64') }],
    }),
  });
  if (!r.ok) throw new Error('backup_email_http_' + r.status);
  return counts;
}

async function handler(req, res, deps = {}) {
  const env = deps.env || process.env, fetchFn = deps.fetch || fetch, now = deps.now || Date.now();
  res.setHeader('Cache-Control', 'no-store');
  if (!authorised(req, env.CRON_SECRET)) { res.statusCode = 401; return res.end(JSON.stringify({ ok: false, error: 'unauthorised' })); }
  const result = { ok: true, keepalive: false, backup: 'not_monday' };
  try { result.keepalive = await keepAlive(fetchFn); } catch (e) { result.ok = false; result.keepalive_error = String(e.message).slice(0, 80); }
  if (isBrisbaneMonday(now)) {
    if (!env.SUPABASE_SECRET_KEY || !env.RESEND_API_KEY || !env.BACKUP_TO) result.backup = 'skipped_missing_settings';
    else {
      try { result.backup = 'sent'; result.rows = await sendBackup(fetchFn, env, now); }
      catch (e) { result.ok = false; result.backup = 'failed'; result.backup_error = String(e.message).slice(0, 80); }
    }
  }
  console.log('daily', JSON.stringify(result)); // counts only, never contents or secrets
  res.statusCode = result.ok ? 200 : 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result));
}
module.exports = handler;
module.exports._test = { authorised, isBrisbaneMonday, TABLES };
