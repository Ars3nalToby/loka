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
| `js/validate.js` | `cleanData(S)`: validates every record on load (ids, enums, numbers, lengths). Run it on anything from a server too. See `docs/SECURITY.md`. |
| `js/art.js` | `art(listing)`: illustrated room scenes (perspective room, window view by zone, day/dusk/night). Stand-in until real photos (O4). |
| `js/suburbs.js` | `SUBURB_DATA` (53 suburbs, 4 zones, 5 campuses, approx. lat/lng), `ZONE`, `ZN`, `SUB()`. Single source of truth for suburbs. |
| `js/check.js` | Loka Check: `lokaCode` (daily code), `CHECKS`, `checkState`, `checkBadge`, `ladderHtml`, renter steps `RSTEPS`/`renterHtml`, `inspHtml`, `priceMeter` |
| `js/share.js` | Share sheet: Threads Post Intent, Instagram story image (canvas 1080x1920 + QR via `js/vendor/qrcode.js`, MIT, kazuhikoarase) through the Web Share API, copy text/link; `#/room/<id>` deep links (`openFromHash`). See `docs/SOCIAL.md`. |
| `js/auth.js` | Accounts via Supabase Auth (`js/vendor/supabase.js` 2.119.0, MIT, lazy-loaded only when `AUTH` is set): Google, email code, AU mobile code (`auMobile`), TOTP two-step verification, 18+ and privacy-notice gate, account sheet. Off by default = labelled preview. See `docs/AUTH.md`. |
| `js/map.js` | Drawn Brisbane map: `mapSvg` (zones as hulls, river, M1, campuses, room pins), `mapLegend`, `ZCOL` zone colours |
| `js/rooms.js` | `listHomes`, `homeDetail`, `matchSheet`, `compareHtml`, `enqText`, `verifiedSheet`, `verifyForm`, `homeForm` |
| `js/jobs.js` | `listJobs`, `jobDetail`, `jobForm` |
| `js/ask.js` | `askHtml`, `askForm`, `askDetail` |
| `js/brisbane.js` | Brisbane art: `season()` (jacaranda/poinciana/frangipani by month), `petals()`, `ibis()` mascot Bin Bin 宾宾, `skyline()` poster strip, `mapBoat()` CityCat on the map river |
| `js/theme.js` | Loaded WITHOUT defer in `<head>`: applies saved dark choice (`localStorage['loka-theme']`) before first paint. Light is always the default |
| `js/courts.js` | Badminton venues `COURTS` (checked by hand, `COURTS_CHECKED`), `courtsHtml()` on Squads, `courtSheet()`, `courtCard()`, `shuttle()`. No live data exists; venues book on their own sites |
| `api/live.js` | Vercel serverless function (free tier, no build step). GET `/api/live?k=events|transit|weather` reads FIXED official feeds (BCC events open data, Translink RSS, BoM QLD warnings RSS), returns cleaned JSON, edge-cached. Never put request input into a URL. Tests: tests/live.test.mjs |
| `js/live.js` | Today in Brisbane page (`todayHtml`) and Home strip (`liveStrip`); filters, Brisbane-only transit/weather filters, `safeUrl` host allowlist |
| `js/landed.js` | Just landed kit (`landedHtml`), install-to-home-screen card (`beforeinstallprompt`, iOS steps). Facts dated `LANDED_CHECKED` |
| `js/play.js` | How to play Brisbane (`PLAYS`, `guidesHtml`, `guideSheet`, `rednoteText`): creator-style day plans joined to live events and ferry notices; copy as a 小红书 post. No business names |
| `js/rights.js` | Renter rights page `rightsHtml()`: `HELP` (RTA, QSTARS, QCAT, CLCs, Scamwatch, TIS), `RTA_CAN`/`RTA_CANT`, `DOORS`, `NEWRULES`. Facts checked on `RIGHTS_CHECKED`; re-check official sites before editing |
| `js/more.js` | `GUIDE`, `calc`, `adminHtml`, `aboutHtml`, squads `detail`/`squadForm`, `taskForm`, posters, `inviteText` |
| `js/motion.js` | `motion()` after each render: page-entrance stagger on tab change only, scroll reveal (`.rv`/`.seen`). All keyframes are at the end of `css/app.css` under "Motion". Respects Reduce Motion. |
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
- 18 Nov 2026 · Claude Opus 5.5 · **Instagram + Threads sharing** (`js/share.js`,
  `docs/SOCIAL.md`). Threads = official Post Intent; Instagram = generated story image via the
  share sheet (download fallback), link copied for a Link sticker; story content kept inside
  Instagram's top/bottom 250px safe zones; QR verified to decode to the room link. Room deep
  links `#/room/<id>`. Follow buttons need real handles in `BRAND.instagram` / `BRAND.threads`
  (empty = hidden). Auto-posting is documented, not built (needs O2). 22 tests. SW `loka-v9`.
- 18 Nov 2026 · Claude Opus 5.5 · **Accounts built, switched off.** `js/auth.js` + `AUTH` in
  config.js + Privacy tab (`privacyHtml`, draft for legal review) + account card on Me. Verified
  against a stand-in server with real supabase-js: email OTP, verify, TOTP enrol (QR is
  URI-encoded: raw SVG from Supabase contains quotes), phone OTP as +614…, Google PKCE redirect.
  Needs Loka's own Supabase project + Google OAuth client to go live (`docs/AUTH.md`). Phone stays
  off until an SMS provider is paid for. 26 tests. SW `loka-v10`.
- 18 Nov 2026 · Claude Opus 5.5 · **Security + code review.** `vercel.json` now sends a strict CSP
  (`script-src 'self'`) and HSTS / nosniff / DENY / referrer / permissions / COOP headers. New
  `js/validate.js` (`cleanData`) after a fuzz test showed bad enum values crashed the page. Service
  worker only handles same-origin requests. Injection fuzz: 0/6 payloads ran. CSP run: 0
  violations. ESLint clean except a harmless `when` global name. Fixed: sample listing h6 no longer
  says "girls only" (contradicted our own no-gender-field rule), new rooms must use a covered
  suburb, Privacy back button returns to Me, Ask pin icon, `HF0` single filter reset, dead code.
  `docs/SECURITY.md`. 33 tests. SW `loka-v11`. Helper names are global: check for clashes
  (`num` already exists in more.js).
- 18 Nov 2026 · Claude Opus 5.5 · **Motion + mobile pass.** `js/motion.js` + "Motion" CSS: poster
  wordmark extrudes its long shadow, copy rises in order, drifting light; house window breathes,
  coffee steams; river draws in, pins drop in sequence, selected price pin pulses; sheets spring
  up; Loka Check rungs light in order, ring fills. Transform/opacity only. Map re-renders on pin tap
  or search pass `still:true` so pins don't replay. Cards no longer re-animate on every filter tap.
  Reduce Motion stops everything (tested: 0 looping animations). Mobile: viewport-fit=cover +
  safe-area padding (notch, home bar), background scroll locked while a sheet is open (`html.lock`),
  44pt touch areas (invisible `::after` where the visible size should stay), no overflow at
  320/375/390/landscape, 320px header fix, no input under 16px. SW `loka-v12`.
- 2026-11-18 · Claude Opus 5.5 · Renter rights page (tab `rights`, linked from Home, About, Me and every room sheet): what the RTA can and cannot do, QSTARS 1300 744 263, QCAT, CLCs, Scamwatch, TIS 131 450, which door first for 7 common problems; every fact checked against official sites 18 Nov 2026. Brisbane art: seasonal petals, skyline with Story Bridge lights, big wheel, Queenslander, CityCat; ibis mascot Bin Bin; CityCat sails the map river (SMIL, skipped under Reduce Motion). New line icons incl. `flag` (report button icon was missing). sw `loka-v13`. Fees and phone hours change yearly: re-check `js/rights.js` each new financial year.
- 2026-11-18 · Claude Opus 5.5 · Header no longer slices the home poster: phone header turns solid green with the small logo while over the poster (`green` class), cream only after the poster has passed; poster lines fade out over the last 56px before the header edge (`hdr()` in app.js). Wide screens: poster is a fully rounded card below a normal header. sw `loka-v14`.
- 2026-11-18 · Claude Opus 5.5 · Badminton courts on Squads: 7 verified venues (IBC Coopers Plains, Griffith Mt Gravatt Rec Hall, UQ Centre, Sky Badminton Logan Central, QBC Carole Park, Brisbane Ent. Centre Boondall, Sam's Nundah) with map pins, phone, own-site link, Google Maps directions, "Start a squad here" prefill, venue datalist in the squad form. No price or phone unless the venue's own page shows it. Dark mode: opt-in toggle in the header (sun/moon), circle reveal via View Transitions, `[data-theme=dark]` variable overrides at the end of app.css; light stays default per AGENTS.md. Brisbane: Brissie word-of-the-day card (tap to flip), night sky with stars, moon and a possum on the poster after 7pm Brisbane time or in dark mode, two ibises rallying a shuttle on Squads. tests/courts.test.mjs (38 tests). sw `loka-v15`.
- 2026-11-18 · Claude Opus 5.5 · Just landed kit (Airtrain $23.30 from 27 Apr 2026 per Translink; 50c Translink fares; uni airport reception links; 000 / 13 HEALTH / Policelink / TIS; install-to-home-screen) and Today in Brisbane (live council events, Translink notices, BoM warnings via new `api/live.js`). Local static test servers return 404 for /api: use tools' live_srv.py style fixture server to test. No Queensland ministerial statements: that site has no RSS and we do not scrape HTML. sw `loka-v16`. 45 tests.
- 2026-11-18 · Claude Opus 5.5 · Brisbane panorama `panorama()` replaces the old skyline: Mt Coot-tha masts, Kurilpa, Queen's Wharf + Sky Deck + Neville Bonner Bridge, CBD, City Hall clock tower, South Bank wheel and Streets Beach, Story Bridge on the Kangaroo Point Cliffs; night windows flicker. Landmark cards (`LANDMARKS`, `landmarksHtml()`) are crops of the same art, each with a checked fact and 'Rooms near here'. sw `loka-v17`.
- 2026-11-18 · Claude Opus 5.5 · No more hard cuts on horizontal rows (.chips, .xhs, .strip, .lms): phones bleed to the screen edge and fade only the side that still hides content (edgeFade() in motion.js sets fl/fr); 560px+ wraps chips and turns card rows into grids. Rule for new rows: use one of these classes, never a bare overflow-x:auto. tests/css.test.mjs catches unclosed CSS rules. sw `loka-v18`.
- 2026-11-18 · Claude Opus 5.5 · PWA made solid: sw.js v19 (offline page is cached './' because cleanUrls redirects /index.html; app files cache-first + background refresh; pages and /api network-first with 3.5 s / 6 s timeout), 'Loka was updated · Refresh' banner, manifest id/shortcuts (#/go/<tab>, allow-listed in GO_TABS)/screenshots/categories, last live data saved in localStorage 'loka-live-v1' for offline, Me → Loka check-up (tab `check`). Guides tab `guides` (js/play.js). Before every release also run: python3 tests/e2e/pwa_check.py (CHROME=path if needed).
- 2026-11-18 · Claude Opus 5.5 · O2 part 1: `supabase/migrations/001_init.sql` (suburbs from js/suburbs.js, profiles, homes, home_contacts, jobs, job_contacts, questions, answers, reports). QLD rules are CHECK constraints; triggers force new rows to pending, block self-publish/self-verify/self-admin, 3 new homes or jobs per user per 24 h, 3 open reports hide an item; RLS on every table; contacts readable only when signed in. `is_trusted()` lets the owner work in the Supabase SQL editor (role postgres); app requests (anon/authenticated) never get it. Test: `npm i --no-save @electric-sql/pglite && node tests/db/rls_check.mjs` → 27 PASS, including the two [O2] attacks (6-week bond, self-verify); a mutation check (bond limit loosened) makes it FAIL as it should. Not applied to any real database yet: waiting for the owner's "可以" to create the Supabase project. To make the owner admin after he signs up: run `update public.profiles set is_admin = true where id = '<his user id>';` in the SQL editor. sw `loka-v20` (no app file changed).
- 2026-11-19 · Claude Opus 5.5 · Owner said "可以": Supabase project **loka** created (ref `ksnjvgfptqhtydcmmqwm`, Sydney ap-southeast-2, free tier, org thenonnegotiablog.com; separate from the-non-negotiables). Applied 001_init and new 002_lock_functions (is_admin moved to schema `private`; trigger functions not callable). Real-database attack run (one transaction, rolled back, nothing left behind): 6-week bond, self-verify, self-publish, self-admin, anon post, other user edit/delete all blocked; pending hidden; admin publish works; contacts only when signed in. 'role-escape' only fails when the test logs in as postgres; checked that the API login `authenticator` cannot become postgres. Supabase security advisor: 0 warnings. Offline test now 29 PASS. Next: owner signs up → make him admin in the SQL editor; then js/store.js Supabase layer (anon/publishable key may go in the repo; service_role never).
- 2026-11-19 · Claude Opus 5.5 · Clipping sweep: new `tests/e2e/clip_audit.py` opens every tab + room/job/guide/court sheets at 320/375/390/430px, EN and 中文, light and dark, and lists anything off-screen, clipped, "…"-truncated, or a side-scroll row with no fade hint (QUICK=1 for 320/390 light only). Found and fixed: bilingual titles "English · 中文" now show only the reader's half via `ttl()` in ui.js (lister's own words; titles not in that shape are shown as written; tests/ttl.test.mjs); `.mini` rows and admin rows wrap instead of "…"; new-rooms strip lets the suburb drop to a second line. Result 0 issues. Rule: no `text-overflow:ellipsis` in the app; wrap instead. sw `loka-v22`.
- 2026-11-19 · Claude Opus 5.5 · App now talks to the live database. New `js/db.js` (after auth.js; in sw SHELL with js/vendor/supabase.js): dbLoad() reads homes/jobs (RLS decides what each person sees), keeps samples tagged "Sample" until the first real listing of that kind is published, caches in localStorage for offline; contacts fetched per listing and only when signed in (contactHtml); posting goes through dbCreateHome/dbCreateJob (sign-in required, lands as pending, "Waiting for review" tag + note to the owner); reports go to `reports`; admin desk (`adminLive()` in more.js) shows pending + open reports, Publish / Take down / Verify, visible only when profiles.is_admin. dbErr() turns constraint names into plain words. Migration 003 adds `by_name` (public "Listed by"). config.js AUTH filled with the project URL + publishable key (public by design); google:false until a Google OAuth client exists. Job form now needs a suburb from the list and three declarations (award pay, payslips not cash-only, true). Mobile: all number boxes inputmode=decimal, checkbox rows and small buttons have 44px touch areas, focused fields scroll above the keyboard, Enter/Go submits sign-in codes (data-enter). **Owner must do once in the Supabase dashboard:** Authentication → Email Templates → put {{ .Token }} in both "Magic link" and "Confirm signup" (otherwise emails carry a link, not a 6-digit code); Authentication → URL Configuration → Site URL = https://tobyloka.vercel.app. After he signs up: SQL editor `update public.profiles set is_admin = true where id = (select id from auth.users where email = '<his email>');`. Sandbox cannot reach supabase.co, so the UI was tested with mocked REST answers (/tmp script, not committed); DB rules were tested on the real project. sw `loka-v23`.
