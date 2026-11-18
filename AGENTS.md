# Rules for every AI working on Loka

This repo is worked on in relay by several assistants (Claude Opus, Claude Sonnet, Gemini in
Antigravity). Only one works at a time. These rules keep the relay from breaking.

## Before you change anything

1. `git pull origin main`
2. Read `HANDOFF.md` (state and legal rules) and `docs/ROADMAP.md` (what to build, in order).
3. Pick the **next unticked task** in `docs/ROADMAP.md` unless the owner names a different one.
   Do one task per session. Do not start a second task in the same session.

## While you work

- Work on `main` only. No feature branches, no pull requests. The owner wants changes live at once.
- Never force-push. If a push is rejected, pull, resolve, and push again.
- Keep the app working after every commit. Vercel deploys every push to `main`.
- No build step, no framework, no paid services. Plain HTML, CSS and JavaScript files in `js/`.
  They are classic scripts sharing one global scope, loaded in the order set in `index.html`
  (see "File map" in `HANDOFF.md`). A new file goes in that list at the right place.
- Every user-facing string goes through `t(en, zh)`. Both languages, every time.
- Keep the design system in `HANDOFF.md`: cream background, Rooms and Jobs front and centre.
  Never ship a dark default theme.
- Never weaken the Queensland rules in `HANDOFF.md` ("Rules that must survive any rewrite").
  If a task seems to need that, stop and ask the owner.
- Never add: scraping of other listing sites, payments, commissions, booking on someone's
  behalf, or storage of ID documents or ID numbers.
- Never commit secrets. A Supabase `service_role` key must never appear in this repo.
- Do not read all of a large file when a task names the module it lives in. Read that module.

## When you finish

1. Run `bash tests/release_check.sh` from the repo root. It must print RELEASE CHECK PASSED.
   It runs: unit tests, syntax, the database attack suite (tests/db/rls_check.mjs), the clipping
   audit, the phone-usability audit, the offline PWA check and the secret-key scan.
   Then look at the change yourself in a browser at 390px wide, in English and in 中文.
2. Bump `VERSION` in `sw.js` and update its `SHELL` list if files were added or renamed.
3. Tick the task in `docs/ROADMAP.md` and add one line under "Log" in `HANDOFF.md`:
   date, who (model name), what changed, anything the next assistant must know.
4. Commit with a clear message and `git push origin main`.
5. Tell the owner in plain words what changed and what he should look at on his phone.

## Engineering standard (owner's request, 19 Nov 2026)

- **One app, two doors.** The website and the home-screen app (PWA) run the same files. Every file
  `index.html` loads must be in `sw.js` SHELL (tests/pwa.test.mjs enforces it). Bump `VERSION` on every
  release so installed apps update; they also check for a new version when reopened (hourly at most).
- **Live data stays fresh.** Weather warnings and transport alerts: at most a few minutes old
  (api/live.js ttl 180 s, swr 60 s; client asks again after 3 min and when the app returns to screen).
  Events: at most about 10-20 minutes. Never make these longer without asking the owner.
  Always show "Updated … ago" and the official source. Never invent or pad live data.
- **Never redraw under someone's fingers.** Background refreshes skip while a field is focused or a
  form sheet is open.
- **Every bug fixed gets a test** that would have caught it, in tests/ or in one of the audits.
- **Database changes** go in a new numbered file in `supabase/migrations/`, are added to
  tests/db/rls_check.mjs with attack checks, pass offline first, then are applied to the live project.
  Never put real emails or other personal data in migrations.
- **Say what was tested and how.** If something could only be tested with stand-ins (for example the
  sandbox cannot reach Supabase), say so in HANDOFF and to the owner.

## Talking to the owner

He is a pharmacist, not a developer. Explain in plain words, in a mix of Chinese and English.
Say what is confirmed and what is your guess. Push back when an idea adds legal risk or
spreads the product too thin.
