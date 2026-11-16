# Loka: handoff brief

Read `AGENTS.md` first. Then this file, then `docs/ROADMAP.md`. The "File map" below says
which file to open for each part of the app.

## What Loka is

A bilingual (English / 中文) community notice board for Brisbane, starting narrow:
**rooms for Chinese-speaking international students around Sunnybank**.
Jobs, Ask (community Q&A), squads, favours and money tools already exist in the UI.

Owner goal: a place where people come together, talk, and solve everyday problems.
First milestone: 20 real room matches before the February university intake.

## Current state (be honest about this)

- **Live at https://tobyloka.vercel.app** (Vercel, auto-deploys every push to `main`).
  `BRAND.url` now follows whatever domain the site is served from.
  The localStorage key stays `hopper-demo-v5` so demo data is kept.
- **Read `AGENTS.md` before any change, then `docs/ROADMAP.md` for the ordered task list.**
  Copy-paste prompts for each model are in `docs/PROMPTS.md`.
- Coverage target: Brisbane inner city + south side, 53 suburbs in `data/suburbs.json`
  (not yet wired into the app; that is task S1).
- Icons in `icons/` still show the old "H" mark (task S3).

- Static site, no build step, no framework: `index.html` shell, `css/app.css`, and the
  scripts in `js/` (see "File map" below).
- **All data is localStorage on each visitor's own device.** Nothing is shared between users.
  Every listing shown is sample data from `seed()`.
- No login. The admin desk is open to anyone.
- PWA shell is in place: `manifest.webmanifest`, `sw.js`, icons. It installs to a home screen
  once served over HTTPS.

## What must be built next

The ordered, detailed list now lives in `docs/ROADMAP.md`. Summary of the backend part:

1. **Shared database.** Tables: `homes`, `jobs`, `questions`, `answers`, `reports`,
   `squads`, `tasks`. Supabase (Postgres plus row-level security) fits the current data shapes;
   see `seed()` in `js/seed.js` for every field.
2. **Auth.** Email or phone sign-in. Listers must be signed in to post.
3. **Admin gate.** Only the owner account can verify, remove, or see reports.
4. **Moderation.** New listings start unpublished or flagged until rule checks pass.
   Ask-board posts need a report button and removal.
5. **Photos.** Real listing photos in storage. The current pictures are generated SVG art.
6. **Hash routes** per listing so a room can be shared as a link or QR code.

## File map

Read only the file a task touches. The scripts in `js/` are **classic scripts, not ES
modules**: they share one global scope and run in this order (set in `index.html`). A file
may use anything from a file above it at load time, and anything from any file inside a
function. Top-level `let`/`const` names must stay unique across all files.

| File | What lives there |
| --- | --- |
| `index.html` | Shell only: head, fonts, the script list, empty `#app`, `#nav`, `#sheet`, `#toast` |
| `css/app.css` | All styles |
| `js/config.js` | `BRAND` |
| `js/rules.js` | `RULES`, `homeFlags`, `jobFlags`, `publishBlock`. Pure logic, no DOM. |
| `js/store.js` | `KEY`, `store` (localStorage today; Supabase in task O2) |
| `js/seed.js` | `nextDay`, `seed`, `seedQA`: sample data |
| `js/state.js` | `S` (all data), `tab`, filters `hf` `jf` `mq`, `save()` |
| `js/ui.js` | `t`, `esc`, dates, `art`, `HT`, `ZONE`/`ZN`/`zone`, `ROLE`, `IC`, `openSheet`, `toast`, `copy`, `val` |
| `js/map.js` | `MAP`, `mapSvg` (home-screen map) |
| `js/rooms.js` | `listHomes`, `homeDetail`, `matchSheet`, `compareHtml`, `enqText`, `verifiedSheet`, `verifyForm`, `homeForm` |
| `js/jobs.js` | `listJobs`, `jobDetail`, `jobForm` |
| `js/ask.js` | `askHtml`, `askForm`, `askDetail` |
| `js/more.js` | `GUIDE`, `calc`, `adminHtml`, `aboutHtml`, squads `detail`/`squadForm`, `taskForm`, posters, `inviteText` |
| `js/app.js` | `render()` for every tab, the input/change/click handlers (every `data-a` action, including `createhome`), start-up, service worker |
| `data/suburbs.json` | 53 suburbs in 4 zones (not wired in yet: task S1) |
| `tests/rules.test.mjs` | Queensland limit tests. Run `node --test` from the repo root. |

Why classic scripts: the app reassigns shared state (`S`, `tab`, filters) from many places.
ES modules cannot reassign an imported variable, so converting would have meant rewriting
logic. Classic scripts let O1 move the code with no behaviour change. If a later task wants
ES modules, it should first move shared state into one object.

## Rules that must survive any rewrite

These came from Queensland rental law research (RTA, Property Occupations Act 2014).
They are product requirements, not suggestions. Constants live in `RULES` in `js/rules.js`, tested by `tests/rules.test.mjs`.

| Rule | Where it lives now |
| --- | --- |
| Rent is one fixed weekly number. No ranges, no "offers". | `homeForm`, `createhome` |
| Bond above 4 weeks of rent is refused at publish. | `publishBlock`, `homeFlags` (js/rules.js) |
| Rent in advance: max 2 weeks (room / periodic), 4 weeks (fixed term). | `publishBlock`, `homeFlags` (js/rules.js) |
| A tenant sub-letting must declare the owner's written permission. | `homeForm` declarations |
| Lister declares any bond goes to the RTA within 10 days. | `homeForm` declarations |
| "Verified" needs all four checks ticked and stores a date. | `verifyForm`, `adverok` |
| "Verified" always links to what was and was not checked. | `verifiedSheet` |
| ID documents are sighted only. **Never store ID images or numbers.** | policy, `aboutHtml` |
| Loka never negotiates, collects rent or bond, or takes a fee per move-in. | policy, `aboutHtml` |
| Scouts earn points only, never cash per letting. | `earn` tab |

The last two rows exist because being paid to let someone else's property can require a
real estate licence in Queensland. Do not add commissions, payments, or booking-on-behalf
features without the owner first getting legal advice.

## Not yet checked (owner to confirm with a lawyer before charging money)

- Whether a flat advertising fee to listers is allowed without a licence.
- Privacy Act obligations once real user data is stored.
- Job-board rules (the jobs side has had no legal review).
- Whether a room lister may state a gender or similar preference (Queensland
  anti-discrimination law). No such field until checked.
- Wage figures in `RULES` (`minWage`, `minCasual`, `studentHrs`) should be re-checked
  against Fair Work and Home Affairs before launch.

## Design system (keep it)

- Cream background `#F4F0E7`, ink `#191512`, green `#1F6F5C`, coral `#E2683C`, gold `#C99A2B`.
- Bodoni Moda (display, italic accents), DM Sans and Noto Sans SC (body).
- Rooms and Jobs are the two hero tiles and stay front and centre.
- Mobile first, max width 520px, bottom nav, bottom sheets for detail.
- Every string goes through `t(en, zh)`. Any new text needs both languages.

## WeChat and 小红书

- **WeChat:** share the website link or a QR code. It opens in WeChat's built-in browser,
  so the site must work well there (no downloads, no pop-ups, fast first load).
  A Mini Program needs a mainland China entity or a licensed partner for filing; not a
  first-year task.
- **小红书:** treat as a content and discovery channel, not an integration. The platform
  penalises notes that push people to outside links or contact details. Make the brand
  name searchable instead.

## Deploy

Static site. Any static host works (Vercel, Netlify, Cloudflare Pages): no build command,
output directory is the repo root. Bump `VERSION` in `sw.js` on each deploy.

## Log

One line per session: date, model, what changed, what the next assistant must know.

- 13 Nov 2026 · Claude · First static app (as Hopper), then renamed to Loka.
- 17 Nov 2026 · Claude Fable 5.2 · Vercel prep (`vercel.json`, share links use live domain).
  Wrote `AGENTS.md`, `docs/ROADMAP.md`, `docs/PROMPTS.md`, `data/suburbs.json`. No app code
  changed in this handover. Next task: O1.
- 17 Nov 2026 · Claude Opus 5.5 · **O1 done.** Split the 100 KB `index.html` into
  `css/app.css` and 12 classic scripts in `js/` (see "File map"). Code moved line for line;
  the one logic change is that the bond / advance-rent publish check now calls
  `publishBlock()` in `js/rules.js` (same results, same messages). Added 12 rule tests.
  Checked old vs new in Chromium at 390px: 12 tabs x EN/中文, 13 sheets, search, filters and
  publish attempts gave identical output. `sw.js` is `loka-v3` and caches the new files.
  Next task: S1.
