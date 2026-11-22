# Loka backups and keep-alive

Set up 23 Nov 2026 (Claude Opus 5.5). Code: `api/daily.js`. Schedule: `crons` in `vercel.json`.

## What runs

| When | What | Why |
| --- | --- | --- |
| Every day, 03:00-03:59 Brisbane (Vercel Hobby fires anywhere in the hour) | One read of `public.suburbs` with the public key | Supabase Free pauses a project after about a week of low database activity |
| Mondays (Brisbane), same run | Reads the 8 public tables with the Supabase secret key, gzips them as JSON, emails the file to `BACKUP_TO` via Resend | Supabase Free has no backups. The GitHub repo is public, so backups never go to GitHub |

## Settings (Vercel → tobyloka → Settings → Environment Variables, Production)

| Name | What | Needed for |
| --- | --- | --- |
| `CRON_SECRET` | A long random string (at least 32 characters). Vercel sends it with every cron run | Everything. Without it `/api/daily` refuses all requests |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API keys → secret key (`sb_secret_…`). Bypasses all row rules: never in the repo, never in chat | Backup |
| `RESEND_API_KEY` | A second Resend key, Sending access, domain lokabne.au, named "Loka backups" | Backup |
| `BACKUP_TO` | The owner's inbox | Backup |

After adding or changing a variable, redeploy (Deployments → … → Redeploy) so the function sees it.
To test at once: Vercel → Settings → Cron Jobs → Run. On a Brisbane Monday this also sends the backup.

## What is NOT in the backup

- `auth.users` (sign-in records): not reachable through the API. After a restore, people sign in again
  with the same email and get a new account id; their old listings must be re-linked by email.
- `private.*` (admin email list, contact-view counts, owner alerts): small and rebuildable.
- Photos, if added later to Supabase Storage.

## Restore (an assistant does this, with the owner)

1. Download `loka-backup-YYYY-MM-DD.json.gz` from the email; `gunzip` it.
2. On a fresh project: apply `supabase/migrations/001…` in order.
3. As `postgres` in the SQL editor, insert rows table by table in this order: profiles (only for users
   that exist again in auth.users), homes, home_contacts, jobs, job_contacts, questions, answers, reports.
   Triggers allow `postgres` (is_trusted()), so statuses and verified flags are kept.
4. Run the attack suite and the Supabase security advisor before sharing the site again.

## Privacy

The backup holds users' emails and listing contacts. It is described in the Privacy page ("Who else
handles it"). Keep the backup emails in one Gmail label; delete ones older than about 3 months.
