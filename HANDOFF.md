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
- Coverage target: Brisbane inner city + south side, 53 suburbs in `js/suburbs.js`
  (not yet wired into the app; that is task S1).
- Icons: green italic "L." mark (`icons/`), link preview `og.png`. Source compositions are
  described in the S3 log line; regenerate them rather than editing the PNGs by hand.

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
| `js/ui.js` | `t`, `esc`, dates, `HT`, line icons `LI`/`ico()`, `HERO_ART`, `ZONE`/`ZN`/`zone`, `ROLE`, `IC`, `openSheet`, `toast`, `copy`, `val` |
| `js/art.js` | `art(listing)`: illustrated room scenes (perspective room, window view by zone, day/dusk/night). Stand-in until real photos (O4). |
| `js/suburbs.js` | `SUBURB_DATA` (53 suburbs, 4 zones, 5 campuses, approx. lat/lng), `ZONE`, `ZN`, `SUB()`. Single source of truth for suburbs. |
| `js/check.js` | Loka Check: `lokaCode` (daily code), `CHECKS`, `checkState`, `checkBadge`, `ladderHtml`, renter steps `RSTEPS`/`renterHtml`, `inspHtml`, `priceMeter` |
| `js/map.js` | Drawn Brisbane map: `mapSvg` (zones as hulls, river, M1, campuses, room pins), `mapLegend`, `ZCOL` zone colours |
| `js/rooms.js` | `listHomes`, `homeDetail`, `matchSheet`, `compareHtml`, `enqText`, `verifiedSheet`, `verifyForm`, `homeForm` |
| `js/jobs.js` | `listJobs`, `jobDetail`, `jobForm` |
| `js/ask.js` | `askHtml`, `askForm`, `askDetail` |
| `js/more.js` | `GUIDE`, `calc`, `adminHtml`, `aboutHtml`, squads `detail`/`squadForm`, `taskForm`, posters, `inviteText` |
| `js/app.js` | `render()` for every tab, the input/change/click handlers (every `data-a` action, including `createhome`), start-up, service worker |
| `tests/rules.test.mjs` | Queensland limit tests. Run `node --test` from the repo root. |

Why classic scripts: the app reassigns shared state (`S`, `tab`, filters) from many places.
ES modules cannot reassign an imported variable, so converting would have meant rewriting
logic. Classic scripts let O1 move the code with no behaviour change. If a later task wants
ES modules, it should first move shared state into one object.

## Rules that must survive any rewrite

These came from Queensland rental law research (RTA, Property Occupations Act 2014).
They are product requirements, not suggestions. Constants live in `RULES` in `js/rules.js`, tested by `tests/rules.test.mjs`; Loka Check by `tests/check.test.mjs`.

| Rule | Where it lives now |
| --- | --- |
| Rent is one fixed weekly number. No ranges, no "offers". | `homeForm`, `createhome` |
| Bond above 4 weeks of rent is refused at publish. | `publishBlock`, `homeFlags` (js/rules.js) |
| Rent in advance: max 2 weeks (room / periodic), 4 weeks (fixed term). | `publishBlock`, `homeFlags` (js/rules.js) |
| A tenant sub-letting must declare the owner's written permission. | `homeForm` declarations |
| Lister declares any bond goes to the RTA within 10 days. | `homeForm` declarations |
| "Verified" needs all four Loka Check steps (ID sighted, room seen live with today's code, right to let, fair terms) and each stores its date. | `checkState` (js/check.js), `verifyForm`, `adverok` |
| "Verified" always links to what was and was not checked. | `verifiedSheet`, `ladderHtml` |
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
- Type (chosen by the owner 17 Nov 2026, "option B"): **Bagel Fat One** for the "Loka." wordmark
  only; **Nunito** 900 for headlines, 400-800 for body; **Noto Sans SC** (900 for Chinese headlines).
  No italics on Chinese. Bodoni and DM Sans are retired.
- Signature effect: **long shadow** (`text-shadow` stacked 1px steps in `#185a4a`) on the green
  home poster (`.hposter`). Use it on green only, never on body text.
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
  Wrote `AGENTS.md`, `docs/ROADMAP.md`, `docs/PROMPTS.md`, `js/suburbs.js`. No app code
  changed in this handover. Next task: O1.
- 17 Nov 2026 · Claude Opus 5.5 · **O1 done.** Split the 100 KB `index.html` into
  `css/app.css` and 12 classic scripts in `js/` (see "File map"). Code moved line for line;
  the one logic change is that the bond / advance-rent publish check now calls
  `publishBlock()` in `js/rules.js` (same results, same messages). Added 12 rule tests.
  Checked old vs new in Chromium at 390px: 12 tabs x EN/中文, 13 sheets, search, filters and
  publish attempts gave identical output. `sw.js` is `loka-v3` and caches the new files.
  Next task: S1.
- 17 Nov 2026 · Claude Opus 5.5 · **S3 design pass** (owner asked for visible design work
  before S1). New `js/art.js` replaces the flat room drawings: one-point perspective room,
  window view that follows the suburb's zone (CBD + bridge, river, Queenslander + jacaranda
  or palm), day / dusk / night, light pool, rug, pendant; stable per listing id. New icon:
  cream italic Bodoni "L" with coral dot on the green gradient (512, 192, 180, maskable,
  favicon 32). `og.png` 1200x630 + Open Graph tags (absolute URL uses tobyloka.vercel.app;
  change it if the domain changes). Emoji replaced by drawn icons on Home, Rooms chips and
  card pins. CSS additions are at the end of `css/app.css` under "S3 design pass".
  Watch out: `.li` is the verified-sheet list class; the icon class is `.ic`.
  SW `loka-v4`. Next task: S1.
- 17 Nov 2026 · Claude Opus 5.5 · Header redesign: green "L." mark (same as app icon) +
  "Loka." wordmark + 布村生活站 · BRISBANE tagline; tapping it goes Home. EN / 中文 segmented
  switch (only the inactive side has `data-a="lang"`). Header is transparent at the top and
  gets class `stuck` (frosted, hairline) after 8px of scroll; listener at the end of
  `js/app.js`. Chinese headline accents no longer use fake italic. SW `loka-v5`.
- 17 Nov 2026 · Claude Opus 5.5 · **Type system B + green poster.** Owner picked Bagel Fat One
  for "Loka." and pairing B (Nunito + Noto Sans SC Black). Home now opens on a green
  long-shadow poster (`.hposter` in `js/app.js` / end of `css/app.css`); the header is
  transparent over it (`header.onposter`) and hides its small wordmark until you scroll.
  Class `.poster` is the squads share image; the home poster is `.hposter`. Icons, maskable,
  favicon and `og.png` redrawn in the Bagel style. SW `loka-v6`.
- 17 Nov 2026 · Claude Opus 5.5 · **Loka Check + new map + price check.**
  Verification is now 4 visible steps per listing (`js/check.js`): lister ID sighted (no copy),
  room seen live holding **today's Loka code** (`lokaCode`, changes daily so copied photos fail),
  right to let, fair terms (automatic from rules.js). Partial progress shows as dots on cards
  ("2/4"); "Verified" only at 4/4. Renters get 5 self-checks per listing (saved in `S.mine`),
  a copyable video-call request with the code, and the RTA step (Acknowledgement of rental
  bond, RTA 1300 366 311, sourced from rta.qld.gov.au and Tenants Qld on 17 Nov 2026).
  "Inspected it?" feedback (`x.insp`, a "did not match" also files a report). Price check
  compares rent with same-type listings in the same zone (falls back to all Brisbane).
  Map redrawn from `js/suburbs.js` (data/suburbs.json was folded into it); zone chips on
  Rooms (`hf.z`), legend on Home (`mz`). Suburb datalist on the listing form. State
  migration in `js/state.js` adds sample checks to old saved demo data. Confirmed 17 Nov 2026:
  Qld max bond is 4 weeks for all tenancies since 30 Sep 2024 (RTA). SW `loka-v7`. 19 tests.
  Map labels use English suburb names in both languages (Chinese names in suburbs.js are
  unverified transliterations).
- 17 Nov 2026 · Claude Opus 5.5 · **Map-first Rooms.** Rooms page has a List / Map toggle
  (`rview` in state.js). Map view = `mapSvg({rooms:true})`: one price pin per listing
  (`pinPos` fans out rooms in the same suburb; green + gold dot = verified 4/4, coral =
  selected), zooms its viewBox to the chosen zone (`hf.z`, all sizes scale by `k`), and a
  preview card (`mapPreview`) under it. "Near" campus chips (`hf.c`) draw 2 km / 5 km rings,
  sort the list nearest-first and show "≈ x km to UQ" (straight line via `kmBetween`, never
  presented as travel time). Type / price / other filters fold into a `<details class="moref">`
  drawer (`hfOpen`, `hfCount`). Home map pins and zone chips now open the Rooms map zoomed
  in. `filtHomes()` in rooms.js is the one place the room filters live. SW `loka-v8`.
