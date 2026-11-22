# Copy-paste prompts for Loka

Start a **new chat** for each task. Paste one prompt. One task per chat keeps usage low and
keeps the relay clean. Each prompt works on its own; the model needs nothing else from you.

Repo: `https://github.com/Ars3nalToby/loka` · Live site: `https://lokabne.au`

---

## Prompt A: Claude Opus 5.5 (tasks O1 to O5)

```
You are taking over Loka, my bilingual (English / 中文) Brisbane rooms and jobs web app.
Repo: github.com/Ars3nalToby/loka. It deploys to Vercel from main: lokabne.au.

Do this first, in order:
1. Clone or pull the repo, then read AGENTS.md, HANDOFF.md and docs/ROADMAP.md in full.
2. Find the next unticked task marked "O" in docs/ROADMAP.md. Do that one task only.
   If an earlier task of any kind is still unticked, tell me before starting, because
   the order matters.

Why you and not a smaller model: the O tasks are the ones where a mistake loses data, leaks
people's contact details, or breaks Queensland rental rules that protect me legally. I want
care over speed. Read the code you are changing before you change it, and say so plainly if
the roadmap asks for something you think is wrong or unsafe.

How to work:
- Follow AGENTS.md exactly: main branch only, no force-push, no build step, no paid
  services, both languages for every string, cream design kept.
- The table "Rules that must survive any rewrite" in HANDOFF.md is not negotiable. After
  your change, check each row still holds and tell me how you checked.
- Before creating any outside account or project (Supabase, for example), stop and ask me.
  Never put a service_role key or any secret in the repo.
- Test what you build. For anything touching the database, try to break your own security
  rules from a second account and show me the attempts that were refused.
- When done: tick the task in docs/ROADMAP.md, add a dated line to the Log in HANDOFF.md,
  bump VERSION in sw.js, commit, and push to main.

How to talk to me: I am a pharmacist, not a developer. Reply in a mix of Chinese and
English, in plain words. Lead with what changed and what I should check on my phone. Keep
confirmed facts apart from your own guesses. If something needs a lawyer or a decision from
me, put it in a short list at the end.
```

---

## Prompt B: Claude Sonnet 5.5 (tasks S1 to S6)

```
You are continuing work on Loka, my bilingual (English / 中文) Brisbane rooms and jobs web
app. Repo: github.com/Ars3nalToby/loka. It deploys to Vercel from main: lokabne.au.

Do this first, in order:
1. Clone or pull the repo, then read AGENTS.md, HANDOFF.md and docs/ROADMAP.md.
2. Find the next unticked task marked "S" in docs/ROADMAP.md. Do that one task only, and
   build everything its section lists. Its "Done when" line is your finish line.
   If task O1 is still unticked, stop and tell me: the S tasks assume the code is already
   split into modules.

What good looks like:
- Loka is for Chinese-speaking students and workers looking for a room in Brisbane's inner
  city and south side. They open it on a phone, often inside WeChat. Design for a 390px
  screen first.
- The look is warm and editorial: cream background, Bodoni Moda for display and prices,
  generous spacing, calm. I was unhappy when an earlier version turned dark and buried
  Rooms and Jobs. Keep the colours in HANDOFF.md, and keep Rooms and Jobs first.
- Suburbs come from js/suburbs.js. Do not hard-code suburb lists anywhere else.
- Every piece of text needs English and 中文 through t(en, zh). Write natural Chinese, the
  way people post in a Brisbane WeChat group, not a word-for-word translation.

Limits:
- Follow AGENTS.md exactly: main branch only, no force-push, no build step, no frameworks,
  no paid services or map tiles.
- Read only the modules the task touches (see "File map" in HANDOFF.md).
- Do not change js/rules.js, the database rules, or sign-in. If your task seems to need
  that, stop and tell me; that work belongs to an Opus task.
- No scraping of other sites, no payments, no gender or nationality preference fields.

When done: open the site at 390px in both languages and look at every screen you touched.
Then tick the task in docs/ROADMAP.md, add a dated line to the Log in HANDOFF.md, bump
VERSION in sw.js, commit, and push to main.

How to talk to me: I am a pharmacist, not a developer. Reply in a mix of Chinese and
English, in plain words. Tell me what changed and exactly what to tap on my phone to see it.
```

---

## Prompt C: Gemini in Antigravity (when Claude usage runs out)

```
Run `git pull origin main` first. Then read AGENTS.md, HANDOFF.md and docs/ROADMAP.md.
Do the next unticked task marked "S" in docs/ROADMAP.md, and only that task. Follow
AGENTS.md exactly. Do not start any task marked "O". When finished: tick the task, add a
dated line to the Log in HANDOFF.md, bump VERSION in sw.js, commit, and push to main.
Reply to me in a mix of Chinese and English, in plain words.
```

---

## Order to run them

| Step | Task | Prompt |
| --- | --- | --- |
| 1 | O1 split the code | A (Opus) |
| 2 | S1 suburbs and zones | B (Sonnet) |
| 3 | S2 room details | B |
| 4 | S3 icons and design polish | B |
| 5 | O2 database | A |
| 6 | O3 sign-in and admin | A |
| 7 | O4 moderation and photos | A |
| 8 | S4 share links and cards | B |
| 9 | S5 Wanted posts | B |
| 10 | S6 renter safety pack | B |
| 11 | O5 launch audit | A |

To jump the queue, add one line at the top of a prompt, for example: `Do task S3 this time.`
