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

- **Live at https://lokabne.au** (Vercel, auto-deploys every push to `main`). tobyloka.vercel.app and www.lokabne.au 301-redirect to it (vercel.json `redirects`). One address = one PWA, one sign-in.
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
| `js/flyer.js` | Noticeboard flyers: `drawFlyer(kind,src)` A4 1240x1754 canvas (EN+中文, QR, 8 tear-off strips), `flyerSheet`/`flyerCard` (Admin desk + Earn page), print via `#printf` + `html.printing`. Place tags: `?src=` captured once per device (`srcCapture`, first wins, 60 days, `srcClean` = a-z0-9- max 24) and sent as sign-up metadata (`srcData()` in auth.js). `#/go/list` → `flyerLanding()` (sign in first, then `homeForm`). |
| `js/wanted.js` | 求租 Wanted posts: `wantedHtml` (tab `wanted`, `#/go/wanted`), `wantDetail`, `wantForm`/`wantRow` (mirrors DB rules), `wFits`/`wFitRooms`/`wForRoom` matching, `wStats` landlord numbers, `wantedBar` (Home + Rooms), `wantedAdminHtml` |
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
| Rent in advance: max 2 weeks for any room (rooming accommodation, even on a fixed term) and for periodic agreements; whole place on a fixed term: 4 weeks on Loka (law: 1 month). | `advLimit`, `publishBlock`, `homeFlags` (js/rules.js); DB constraint `qld_rent_in_advance` (009) |
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

- **Naming rule (owner, 23 Nov 2026):** wherever the app shows 小红书, write it with its English name: `小红书 (RedNote)` in English text, `小红书（RedNote）` in Chinese text. tests/rednote.test.mjs enforces it.
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
- 2026-11-19 · Claude Opus 5.5 · Supabase finding: since June 2026, new free-plan projects on Supabase's built-in email sender cannot edit auth email templates, and the built-in sender allows about 2 auth emails per hour per project. So the email currently carries a **sign-in link, not a 6-digit code**. Temporary fix: signInWithOtp passes emailRedirectTo=location.origin+'/', the sheet says "Check your email" and explains the link must be opened on the same phone and browser (PKCE), and that home-screen-app users should sign in through Safari/Chrome for now; the code box still works if a code arrives. Proper fix before launch: own domain + custom SMTP (e.g. Resend free tier, needs a verified domain) → then put {{ .Token }} in the "Magic link or OTP" and "Confirm signup" templates. Owner still needs to set Site URL = https://tobyloka.vercel.app (Authentication → URL Configuration). sw `loka-v24`.
- 2026-11-19 · Claude Opus 5.5 · Migration 004_admin_emails: an address in private.admin_emails becomes admin automatically once it is CONFIRMED (trigger zz_admin_email on auth.users). Real addresses are added only in the SQL editor, never committed. tests/db/rls_check.mjs now 32 checks; fixed a harness bug (PGlite ignores RESET SESSION AUTHORIZATION, so as() now uses SET SESSION AUTHORIZATION postgres) and the "role escape" check now passes for real. Applied to the live project on 19 Nov (without the drop-trigger line, which triggers a confirmation prompt). The owner signed up by email link and is admin (profiles.is_admin=true, his address is in private.admin_emails).
- 2026-11-19 · Claude Opus 5.5 · First real account: the owner signed in by email link (works). Security advisor shows one warning, 'leaked password protection disabled'; Loka uses no passwords, so it is low priority (it may also be a paid-plan feature; not checked).
- 2026-11-19 · Claude Opus 5.5 · Professional baseline. `bash tests/release_check.sh` = the one gate before every push (unit, syntax, DB attacks, clip audit, new tests/e2e/mobile_audit.py, PWA offline, new tests/secret_scan.mjs). New tests/pwa.test.mjs keeps website and PWA on the same files. Freshness: api/live.js ttl events 600 s / transit+weather 180 s with swr 1200/60/60 (was up to 30 min stale for weather warnings); js/live.js LIVE_FRESH per feed + freshen() on visibilitychange/pageshow/online and every 3 min, skipped while typing (busyTyping); listings refresh every 5 min the same way; installed PWA calls reg.update() when reopened (hourly max). AGENTS.md gained an "Engineering standard" section. Weekly maintenance runs as a scheduled task (see AGENTS/owner). sw `loka-v25`.
- 21 Nov 2026 · Claude Opus 5.5 · Security review of live DB + front end (RLS on all 9 tables, admin-escalation trigger, esc()/CSP confirmed; 0 XSS findings). Gap fixed: any signed-in account could bulk-read every contact. Migration `005_contact_reveal_limit.sql`: contacts only via `reveal_contact(kind,id)`, 20 different listings per account per 24 h, repeats free, owner/admin unlimited; 9 new attack checks (40 total). Apply 005 to project ksnjvgfptqhtydcmmqwm once the owner approves; `dbContact` falls back to the old read until then. Sign-in uses email codes, so the "leaked password protection" warning does not affect normal users. sw `loka-v26`.
- 23 Nov 2026 · Claude Opus 5.5 · Owner-reported: thin cream gap at the top on iPhone Chrome. Cause: home poster tucked under the header by a guessed 74px, but the real header is 75.4px at 375-430px (fonts), leaving a 1.4-1.7px strip. Fix: hdrSize() in app.js measures #top (ResizeObserver) into CSS var --hh; .hposter uses it. html.pullgreen makes the iOS rubber-band pull at the top of Home green instead of cream. New TOP-GAP check in tests/e2e/mobile_audit.py (fails on the old code). Not tested on a real iPhone: owner to confirm. sw `loka-v27`.
- 23 Nov 2026 · Claude Opus 5.5 · One address: lokabne.au (already pointed at Vercel, checked live). vercel.json redirects tobyloka.vercel.app and www.lokabne.au → https://lokabne.au (301, keeps path+query so sign-in ?code= links still land). og:image, UA, landed/auth strings, docs updated. tests/domain.test.mjs. **Owner must:** Supabase → Authentication → URL Configuration → Site URL https://lokabne.au, Redirect URLs add https://lokabne.au/** . Anyone who installed the PWA from tobyloka must reinstall from lokabne.au (only the owner so far). sw `loka-v28`.
- 23 Nov 2026 · Claude Opus 5.5 · Email sign-in moved to custom SMTP: Resend (free: 100/day, 3,000/month), domain lokabne.au verified (DKIM, SPF via rsend/send CNAMEs, DMARC p=none; Tokyo region), sender no-reply@lokabne.au, restricted 'Sending access' key only (stored in Supabase, never in repo). Supabase Site URL https://lokabne.au + redirect https://lokabne.au/**. 'Magic link or OTP' and 'Confirm signup' templates now show {{ .Token }} (link kept as backup). Code sheet in auth.js now asks for the code, accepts 6-10 digits, drops the 'sign in through Safari' warning. Supabase SMTP default cap is 30 emails/hour (Rate Limits); Resend free 100/day is the real ceiling. Before this, the built-in mailer only delivered to project team members, so nobody but the owner could sign in. www.lokabne.au has NO DNS record yet (NXDOMAIN): add it in Vercel → Domains, then the CNAME it shows in Porkbun. sw `loka-v29`.
- 23 Nov 2026 · Claude Opus 5.5 · Owner's rule: every user-facing 小红书 now reads 小红书 (RedNote) / 小红书（RedNote） (home guides row, Guides intro + copy button, share sheet, copy toasts). New tests/rednote.test.mjs fails on any bare 小红书 in js/ outside comments. sw `loka-v30`.
- 23 Nov 2026 · Claude Opus 5.5 · Owner said go on 005: checked live → 005 was ALREADY applied 21 Nov (reveal_contact live, anon blocked, old bulk-read policies replaced). Found **006_owner_alerts_report_guard applied live 21 Nov but never committed** (relay drift). Copied it back verbatim from supabase_migrations.schema_migrations into supabase/migrations/006_owner_alerts_report_guard.sql; rls_check now loads 001-006 with 6 new [006] checks (46 total): owner alert feed written + unreadable by app users, 3 brand-new accounts cannot hide a room, 3 accounts ≥3 days old can, 11th report/day refused, reporter always = real sender. Security advisor: only expected WARNs (reveal_contact callable by signed-in users by design; leaked-password check n/a, no passwords). RULE for every assistant: never apply a migration to the live project without committing the same file in the same session.
- 23 Nov 2026 · Claude Opus 5.5 · www.lokabne.au fixed: added in Vercel → Domains as 308 redirect to lokabne.au (apex stays canonical; 'redirect apex to www' left OFF on purpose), Porkbun CNAME www → the project-specific vercel-dns value. Google DNS resolves it; Vercel was issuing the SSL certificate at 01:46. Still open for launch: hello@lokabne.au forwarding (Porkbun, then set BRAND.contact), a real sign-in test from a non-team email, Supabase keep-alive + backups, first real listings.
- 23 Nov 2026 · Claude Opus 5.5 · Keep-alive + weekly backup: new api/daily.js (Vercel Cron 0 17 * * * UTC = 03:00 Brisbane, once a day = Hobby limit). Daily: one read of public.suburbs with the publishable key (Supabase Free pauses after ~7 days low activity). Brisbane Mondays: dumps the 8 public tables with SUPABASE_SECRET_KEY, gzip JSON, emailed via Resend to BACKUP_TO (repo is PUBLIC, so never to GitHub). Locked by CRON_SECRET (timing-safe compare, fails closed). Reply/logs hold counts only. tests/daily.test.mjs (8). Privacy page now names Resend and the weekly backup. docs/BACKUP.md has settings + restore. **Owner must add in Vercel env: CRON_SECRET, SUPABASE_SECRET_KEY, RESEND_API_KEY (new 'Loka backups' key), BACKUP_TO, then redeploy.** Until CRON_SECRET exists the job refuses to run (so no keep-alive yet). Live DB checked: anon can read suburbs; service_role reads all 8 tables. sw `loka-v31`.
- 23 Nov 2026 · Claude Opus 5.5 · VERIFIED LIVE: owner added the 4 Vercel env vars (Secret, Production) + new Supabase secret key 'vercel_backup' + Resend key 'Loka backups', redeployed, ran the cron manually: backup email arrived in Gmail INBOX (not spam) from no-reply@lokabne.au with the .json.gz attachment (profiles 1, all else 0). This also proves Resend sending from lokabne.au works. Cron UI location: Observability → Schedules → Cron Jobs (tab marked Legacy/deprecated; works; migrate to Vercel Schedules later, no end date announced as of 23 Nov 2026).
- 23 Nov 2026 · Claude Opus 5.5 · Scout invites (owner's request): new js/scout.js (after rooms.js; in sw SHELL). Any scout (Earn page 'Invite a landlord') or admin (card on Admin desk) types ROOM details only → link https://lokabne.au/#/draft/<base64url JSON> + copy-ready 中文/English message (admin says 创办人/'I run Loka', others 'I use Loka'). Landlord opens link → landing sheet → sign in → normal homeForm prefilled; contact, role and all declarations left for the landlord; they publish as lister (status pending as usual). No DB change: the draft is only in the #fragment + localStorage (14-day expiry, cleared on publish or 'No thanks'). Contact details refused both when making and when opening a link (@, 微信/wechat/wx:/vx:, any 8+ digit run). Earn page step 2 changed from 'Post it here, with a contact' (posting someone else's number) to 'Invite the landlord'. tests/scout.test.mjs (11). e2e walk at 390px EN (scout) + 中文 (landlord) passed, no page errors. OPEN: Earn page 'Post a job lead' still asks scouts to post an employer's contact; same consent problem, not changed this session. sw `loka-v32`.
- 24 Nov 2026 · Claude Opus 5.5 · **S5 求租 Wanted posts.** Live DB had 0 rooms / 0 jobs / 1 user, so demand capture went first. Migration `007_wanted.sql` (applied live with the owner's OK, same file committed): tables `wanted` + `wanted_contacts`, pending until admin publishes, 30-day expiry the client cannot extend (renew = now+30d and back to review), CHECK refuses phone/email/WeChat in the public note, `reveal_contact('wanted',…)` shares the 20/day counter, reports + owner alerts learn 'wanted'. Also fixed a latent bug in shared `guard_listing`: `tg_table_name='homes' and (new.verified…)` is resolved on every table, so any owner edit on a table without `verified` crashed; now nested. Offline: rls_check 68 PASS (22 new [007]). Live: rolled-back probe with two throwaway non-admin users → forced pending, expiry capped, self-publish refused, pending invisible, no bulk contacts, reveal works after publish; nothing left behind; advisor shows only the 2 known WARNs. App: tab `wanted` (nav highlights Rooms), green 求租 bar on Home + Rooms list, landlord stats (count, median budget, top side), lister copy-message, owner renew/take-down, "N renters want a room like this" on a lister's own room, admin desk section. `DB.wantOk` hides every 求租 entry point if the table is ever missing. api/daily.js backs up 10 tables. Audits now include tab `wanted` + 3 wanted sheets. tests/wanted.test.mjs (11). sw `loka-v33`. Shareable link for promotion: https://lokabne.au/#/go/wanted
- 24 Nov 2026 · Claude Opus 5.5 · Weekly maintenance. Live DB: migrations 001-007 applied, RLS on all 11 public tables, advisor only the 2 known WARNs, only reveal_contact callable by signed-in users. Found 2 gaps → new `supabase/migrations/008_post_limit_qa_close.sql` (**NOT applied live, needs owner OK**): daily post limit could be reset by deleting your own posts (now also counted in private.post_log); questions/answers tables accepted unlimited unmoderated public posts via the API (insert now admin-only; app does not use them yet). 7 new [008] checks in rls_check (failed first, pass with 008). No app file changed, so no sw bump; front end works with or without 008. NMW $26.44/h re-confirmed against FWC AWR 2026 announcement ([14]); casual $33.05 = +25%; studentHrs not re-checked this week. Could not reach lokabne.au from the sandbox (proxy 403): live headers, redirects, /api/live and the phone walk-through UNVERIFIED this week.
- 25 Nov 2026 · Claude Opus 5.5 · **Noticeboard flyers + where sign-ups come from** (owner: time to find customers; live DB still 0 rooms / 0 wanted / 1 user). New js/flyer.js (after scout.js; in sw SHELL). Landlord flyer QR → `/?src=<tag>#/go/list` → welcome sheet → sign in → List a place form (so a landlord never loses a typed form at the sign-in wall; `flyerAfterSignIn` in afterSignIn). Renter flyer QR → `#/go/wanted`. Tag stored on the device and passed as Supabase sign-up `data.src` (raw_user_meta_data; no DB change, no analytics). Owner query: `select raw_user_meta_data->>'src' src,count(*) from auth.users group by 1 order by 2 desc;`. Privacy page gained a 'Flyers and QR codes' paragraph. QR quiet zone 4 modules; both flyers decoded by OpenCV from the full A4 image. Fonts did not load in the sandbox (no Google Fonts), so real-device rendering of Bagel on the flyer is UNVERIFIED: owner to print one and check. tests/flyer.test.mjs (6). sw `loka-v34`. Still open: 008 not applied (needs owner OK), BRAND.contact/instagram/threads empty, Earn 'Post a job lead' consent issue.
- 25 Nov 2026 · Claude Opus 5.5 · **Stop-and-look pass** (owner: push flyers further, more animation, make people browse). Home: black ticker under the poster (`ticker()`, class `.lticker` because `.tick` is the checkbox-row class, aria-hidden, the promises Loka keeps; pauses on press), Bin Bin strolls along the skyline (`walker()`), new landlord card `landlordCard()` (door opens, key swings, glow + shine; shows live 求租 count when >0) → `flyerLanding()`. Before this Home had no way in for landlords. Flyers: Bin Bin + speech bubble on every flyer; formats A4 / 小红书 (RedNote) 3:4 (NO QR on purpose: the platform throttles off-site links, brand written big to search) / Story 9:16 (QR; text kept above Instagram's bottom 250px, `STORY_TEXT_Y`). New tests/e2e/flyer_check.py (in release_check): Home pieces present, all 6 flyers' QR decode via OpenCV (skipped if not installed), rednote has none, story safe zone; mutation-checked. All motion off under Reduce Motion. Fonts still unverified in sandbox. sw `loka-v35`.
- 25 Nov 2026 · Claude Opus 5.5 · **Audit fixes** (report: /home/claude/reports/Loka compliance and design audit.md, not in repo; owner said "go ahead, fix whatever is necessary"). Scout cash-per-letting code removed (`owed`, `adpay`, '成交' → `checks`), Earn 'Post a job lead' removed (employer consent). Rooming accommodation rent in advance = 2 weeks whatever the term (`advLimit`). Jobs under the national adult minimum now refused (client toast; DB `fw_min_wage_2026` in 009), 'Legal pay' → 'At or above national minimum', Cash filter gone, cash jobs flagged. Wording: 'Fair terms' → 'Rent, bond and advance within Qld limits', no 'ever'/'Scam-safe'. Scout invites (Spam Act): sender name required, 'reply STOP / 回复不用了' opt-out, one message only, web links refused in drafts. Shared room links wait for dbLoad (`PEND_ROOM`/`openPendingRoom`, also on auth failure). Privacy page names Japan/US, Google Fonts, breach notice. Backup encrypted (AES-256-GCM, `BACKUP_KEY`, tools/decrypt-backup.mjs); **without BACKUP_KEY the Monday backup is NOT sent**. THIRD_PARTY_NOTICES.md + MIT banner on js/vendor/supabase.js. Instagram/Threads glyphs replaced by generic icons (Meta brand rules). BCC CC BY link + BoM 'emergencies: bom.gov.au and 000'. Facts: QCAT waiver + lawyers wording, bond cap scope, NEWRULES (+fee-free rent payment, 48 h entry, ID originals, rent in advance), Sky Deck ~100 m, tap-off, RTA ack by email/post, RIGHTS_CHECKED 25 Nov. ACMA fiction numbers in samples. Poster colour buttons `ptheme` (was flipping dark mode). Sheets: role=dialog, Escape, focus return. copy(): execCommand + manual sheet fallback (WeChat). CSP connect-src = Loka's project only. Admin Publish closes open reports. DB: **008 applied live 25 Nov**; **009_audit_fixes.sql committed, NOT yet applied** (Supabase confirmation went unanswered, then the safety check blocked a retry): profiles.created_at locked, created_at := now() on insert, contact edit/delete → pending, rooming 2-week constraint, job min wage. rls_check 86 PASS, each [009] check fails without 009. New tests: roomlink, actions (action-name clash, ACMA numbers, no inline handlers, CSP host). Not done (need owner): BRAND.contact, CAPTCHA (Supabase Auth + Turnstile keys), trade-mark search, BoM/Translink written permission before any fee, Translink GTFS-RT switch. sw `loka-v36`.
- 25 Nov 2026 · Claude Opus 5.5 · **Design pass: proof, not a portal.** Rooms now opens on **Notes** (`rview='notes'`, `notesHomes()` in rooms.js): two-column 小红书 (RedNote)-style room notes, heights vary per listing (`noteH`), price pill, ⚠ rule-flag count, lister initial, Loka Check x/4 chip, small tags; List and Map unchanged. `.bar2` wraps at 320px. Home: **The Loka way** (`lokaWay()` in flyer.js, after the landlord card): 1 see it live with today's code (code rolls in like a slot reel, real `lokaCode('loka-home')`), 2 bond goes to the RTA (envelope flies in), 3 then pay within the limits (tick draws); steps light in turn on a 9 s loop; all motion off under Reduce Motion. sw `loka-v37`.
