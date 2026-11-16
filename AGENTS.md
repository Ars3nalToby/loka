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
- No build step, no framework, no paid services. Plain HTML, CSS and JavaScript modules.
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

1. Test in a browser at 390px wide, in English and in 中文.
2. Bump `VERSION` in `sw.js` and update its `SHELL` list if files were added or renamed.
3. Tick the task in `docs/ROADMAP.md` and add one line under "Log" in `HANDOFF.md`:
   date, who (model name), what changed, anything the next assistant must know.
4. Commit with a clear message and `git push origin main`.
5. Tell the owner in plain words what changed and what he should look at on his phone.

## Talking to the owner

He is a pharmacist, not a developer. Explain in plain words, in a mix of Chinese and English.
Say what is confirmed and what is your guess. Push back when an idea adds legal risk or
spreads the product too thin.
