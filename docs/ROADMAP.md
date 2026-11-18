# Loka roadmap

Written 17 Nov 2026 by Claude Fable 5.2 as a handover to Claude Opus 5.5, Claude Sonnet 5.5 and
Gemini. Read `AGENTS.md` and `HANDOFF.md` first. Tasks are done **in the order listed**, one
per session. Tick a task when it is pushed and live.

## The goal this roadmap serves

**20 real room matches before the February 2027 university intake**, among Chinese-speaking
students and workers in Brisbane's inner city and south side.

Everything below is ranked by how much it helps that number. Jobs, Ask, squads, favours and
money tools stay in the app but get no new work until Rooms has real listings.

## Three facts that shape every decision

1. **Nothing is shared yet.** Every listing is sample data on the visitor's own phone
   (`localStorage`). A person who opens the link today sees a demo. Until tasks O2 to O4 are
   done, Loka cannot hold one real room. This is the single biggest gap.
2. **"All the rooms in south side and inner city" means coverage, not copying.** Loka can
   cover every suburb (see `js/suburbs.js`, 53 suburbs in 4 zones). It cannot fill them by
   copying listings from Flatmates, Domain, realestate.com.au, WeChat groups or 小红书: that
   breaks those sites' terms and the listers never agreed to it. Rooms arrive only when a
   lister posts, or the owner posts for a lister who said yes. See "Supply plan" at the end.
3. **(Fixed by O1 on 17 Nov 2026.) One 100 KB file blocked teamwork.** `index.html` holds all HTML, CSS and JS. Two
   assistants cannot touch it without conflicts, and every session pays to read all of it.
   Task O1 fixes that before anything else is built.

## Who does what

| Model | Use for | Why |
| --- | --- | --- |
| **Opus 5.5** | Tasks marked **O**: restructuring, database, security, sign-in, moderation, final audit | Mistakes here lose data, leak contacts or break the legal rules |
| **Sonnet 5.5** | Tasks marked **S**: screens, forms, filters, design polish, share cards | Well-specified work inside one or two modules; cheaper per task |
| **Gemini (Antigravity)** | Any **S** task when Claude usage runs out | Same rules, same task list, same relay |

---

## Phase 0: make the code workable

### [x] O1. Split `index.html` into modules (Opus)

> Done 17 Nov 2026. Built as classic scripts rather than ES modules, to keep behaviour
> identical; the reasons and the real file list are in `HANDOFF.md` "File map".
> Run tests with `node --test` from the repo root.

No behaviour change. No visual change. Same `localStorage` key (`hopper-demo-v5`).

Target layout, native ES modules, no build step:

```
index.html            shell only: head, fonts, #app, #sheet, #nav, #toast, one <script type="module">
css/app.css           all styles, unchanged
js/app.js             boot, state S, render(), tab switching, the click delegate
js/store.js           the ONLY place that reads or writes data (see O2)
js/i18n.js            t(), language toggle
js/rules.js           RULES, homeFlags(), jobFlags(), publish checks. No DOM code in this file.
js/ui.js              openSheet, closeSheet, toast, esc, icons, art()
js/rooms.js           listHomes, homeDetail, homeForm, createhome, verify, compare, match
js/jobs.js            listJobs, jobDetail, jobForm
js/ask.js             Ask board
js/more.js            squads, tasks, posters, calculator, guide, about, admin
js/suburbs.js         loads js/suburbs.js, exports zone(), suburb lookup
tests/rules.test.mjs  node --test: bond and rent-in-advance limits
```

Done when:
- The live site looks and behaves the same in English and 中文 at 390px wide.
- `node --test` passes, with cases for: bond exactly 4 weeks (allowed), bond above
  4 weeks (refused), advance 2 vs 3 weeks on a room agreement, advance 4 vs 5 on a fixed term.
- `sw.js` `SHELL` lists every new file and `VERSION` is bumped.
- `HANDOFF.md` gets a "File map" section so later assistants read one module, not all.

---

## Phase 1: rooms worth opening (still demo data)

These three can ship before the database exists. They make the demo persuasive to the first
listers the owner approaches.

### [ ] S1. Suburb coverage: inner city + south side (Sonnet)

> Partly done 17 Nov 2026 (Opus): `js/suburbs.js` is wired in, zone chips on Rooms, new
> map with legend, suburb datalist on the listing form. **Still to do:** strict suburb picker
> (no free text), postcode search, 10 more sample rooms. ("Near my campus" and a
> map view were added 17 Nov 2026.)

Source of truth: `js/suburbs.js`. Replace the hard-coded `ZONE`, `ZN` and `MAP`.

- Create `js/suburbs.js` (add it to the script list in `index.html` after `js/ui.js`, and to
  `SHELL` in `sw.js`). Today `ZONE`/`ZN` live in `js/ui.js` and `MAP` in `js/map.js`.
- **Suburb picker** in `homeForm` and `jobForm`: type-ahead over the 53 suburbs, matching
  English name, `zh` name or postcode. Free text is no longer accepted for suburb.
- **Zone chips** on the Rooms list: All / Inner city / West · UQ / Inner south / South.
  Then a second row of suburb chips for the chosen zone, each with its live count.
- **"Near my campus"** filter using `campuses` and each suburb's `near` list.
- **Map**: redraw `mapSvg()` as a stylised zone map (four soft colour fields, river, CBD
  marker). Pins only for suburbs with listings; tapping a zone filters the list. Keep the
  hand-drawn feel. Do not embed Google Maps or any paid map tile.
- Add 10 more sample rooms to `seed()` spread across all four zones, each clearly marked
  `sample:true` and shown with a small "Sample" tag, so nobody mistakes a demo for a real room.
- When `zh` is null show the English suburb name in both languages.

Done when: every suburb in the JSON can be picked, filtered and found by postcode; the
"Sample" tag shows on every seeded listing.

### [ ] S2. Room details renters ask about (Sonnet)

Add to the listing form, card and detail sheet:

| Field | Values |
| --- | --- |
| Available from | date, or "now" |
| Minimum stay | none / 3 / 6 / 12 months |
| Room | single / double / master / second / studio |
| Bathroom | own / shared, and shared with how many |
| People in the home | number |
| Lister lives there | yes / no |
| Couples OK, parking, air-con, cooking allowed | yes / no each |
| Languages at home | 普通话 / 粤语 / English / other |
| Walk to bus or train | minutes, with the stop name |
| Inspection | free text, e.g. "Sat 10am or video call" |

The card shows price, suburb and at most three facts. The detail sheet shows the rest as a
tidy two-column fact table.

**Do not add a "gender preferred" or "nationality" field in this task.** Whether a room
lister may state such a preference under Queensland anti-discrimination law has not been
checked. It is listed under "Not yet checked" in `HANDOFF.md`.

Filters to add: available by date, own bathroom, couples OK, lister does not live there.

### [x] S3. Identity and design polish (Sonnet)

> Done 17 Nov 2026 by Opus 5.5, ahead of S1/S2 at the owner's request. Shipped: new room
> illustrations (`js/art.js`), green italic "L." icon set incl. maskable + favicon, `og.png`
> link preview, drawn hero art, line icon set `ico()`, "New rooms" strip on Home, paper
> grain, Chinese line-height, focus rings. **Not done from this list:** moving squads /
> tasks / tools / guide into a "More" tab, skeleton loading cards, and the per-room trust
> strip. Pick those up inside S2 or S4.

- **Icons still show the old green "H".** Draw a new mark for Loka and regenerate
  `icons/icon-180.png`, `icon-192.png`, `icon-512.png` and a maskable version with safe
  padding. Cream ground, ink or green mark, Bodoni-style italic "L" or a small house-and-door
  glyph. Show the owner two options in the reply and ship the stronger one.
- **Link preview.** Add `og:title`, `og:description`, `og:image` (1200x630 cream card with the
  mark and "布村生活站 · Brisbane rooms & jobs") and a `<meta name="description">`.
- **Home screen.** One clear headline, the two hero tiles (Rooms, Jobs), a zone strip, then
  the three newest rooms. Move squads, tasks, calculator and guide under a "More" tab.
- **Type and spacing.** One spacing scale (4, 8, 12, 16, 24, 32). Chinese body text at
  line-height 1.7. Prices in Bodoni Moda, everything else in DM Sans / Noto Sans SC.
- **States.** Friendly empty states with one action, skeleton cards while loading, and a
  visible focus ring. Tap targets at least 44px.
- **Trust strip** on every room: who posted, when, what was checked, and "Report".

Keep: cream `#F4F0E7`, ink `#191512`, green `#1F6F5C`, coral `#E2683C`, gold `#C99A2B`.
The owner wants 美术感: editorial, warm, calm. Not a dashboard. Not dark.

---

## Phase 2: real shared data

### [ ] O2. Supabase database and data layer (Opus)

- Create a Supabase project on the free tier (Sydney region). The owner must create or
  approve it; ask him before creating anything. Check the current free-tier limits in the
  Supabase docs and tell him plainly what they are, including whether idle projects pause.
- Tables: `profiles`, `homes`, `home_photos`, `jobs`, `questions`, `answers`, `reports`.
  Squads and tasks stay on the device for now.
- `homes.status`: `pending`, `published`, `removed`. New rows are always `pending`.
- **Put the Queensland rules in the database as CHECK constraints**, so no client can skip
  them: `bond <= rent * 4`; `adv_weeks <= 2` for room/periodic and `<= 4` for fixed term;
  `rent > 0`; the four declarations all true. Suburb must exist in a `suburbs` table loaded
  from `js/suburbs.js`.
- Row-level security on every table. Anyone may read `published` rows. A signed-in user may
  insert and edit their own rows but may never set `status`, `verified` or `verified_at`.
  Only an admin may. **Contact details are readable only by signed-in users.**
- `js/store.js` becomes the single data interface (`listHomes`, `getHome`, `createHome`,
  ...). The rest of the app must not know whether data came from Supabase or the device.
- The public `anon` key may live in the repo. The `service_role` key must never.
- Keep the sample listings for visitors when the database is empty, each tagged "Sample".

Done when: a room posted on one phone appears on another after admin approval, and a direct
API call that tries bond of 6 weeks, or tries to self-verify, is rejected by the database.
Write those two attempts as a script in `tests/` and record the result in `HANDOFF.md`.

### [ ] O3. Sign-in and admin gate (Opus)

- Email sign-in with a **6-digit code**, not a magic link. Links opened inside WeChat's
  browser land in a different browser and lose the session. No SMS: it costs money.
- Posting, saving and seeing contact details need sign-in. Browsing does not.
- Admin desk visible only to accounts flagged `is_admin` in `profiles`, enforced by RLS,
  not by hiding a button.
- A short privacy notice and listing rules page in both languages, linked from sign-in.
  Flag to the owner that the Privacy Act question in `HANDOFF.md` is still open.

### [ ] O4. Moderation and photos (Opus)

- Admin queue: pending rooms with rule flags, approve / reject with a reason, remove,
  mark verified (the four checks, date stored), and a reports inbox.
- Reports from any signed-in user on rooms, jobs and Ask posts. Three open reports hide the
  item until an admin looks.
- Photos: up to 6 per room in Supabase Storage. Resize in the browser to 1600px on the long
  side and re-encode through a canvas, which also strips location data from the file.
  Listers may upload photos of the room only; the form says never to upload ID or documents.
- Rate limits: at most 3 new rooms per account per day.

---

## Phase 3: sharing and demand

### [ ] S4. One link per room, and a share card (Sonnet)

> Mostly done 18 Nov 2026 (Opus): `#/room/<id>` links, share sheet with Threads, Instagram
> story image with QR, WeChat text (see `docs/SOCIAL.md`). **Still to do:** `#/job/`,
> `#/suburb/`, `#/zone/` routes, and testing inside WeChat's own browser on a real phone.

- Hash routes: `#/room/<id>`, `#/job/<id>`, `#/suburb/<name>`, `#/zone/<id>`. Opening a
  room link shows that room directly.
- "Share" on a room: copy link, copy bilingual text, and a downloadable 1080x1440 image
  (reuse the canvas code in `drawPoster`) with photo, price, suburb, three facts and a QR
  code to the link. This image is what gets posted in WeChat groups and on 小红书.
- Test inside WeChat's built-in browser: no blocked downloads, long-press to save the image.

### [ ] S5. "Wanted" posts 求租 (Sonnet)

Renters post what they need: budget, zones or suburbs, move-in date, length of stay,
campus. Listers browse Wanted and message the renter. A new room that fits a Wanted post is
shown to that renter on their next visit. This gives Loka value on days with few listings.

### [ ] S6. Renter safety pack (Sonnet)

Bilingual, short, linked from every room: inspection checklist, scam warning signs (asked
to pay before seeing the room, bond not going to the RTA, no written agreement), what a
legal bond and advance rent look like, and links to the RTA's own pages. Link to the RTA
rather than restating the law at length, and show the date the page was last reviewed.

---

## Phase 4: before telling the public

### [ ] O5. Launch audit (Opus)

Security pass on RLS with a second, non-admin account. Check every rule in `HANDOFF.md`
against the live site. Re-check wage figures in `RULES` against Fair Work, and the rental
rules against the RTA site, citing the pages. Lighthouse on mobile. Test on iPhone Safari,
Android Chrome and the WeChat browser. Write the findings for the owner in plain language
with a clear "ready / not ready" call.

---

## Supply plan (the owner's job, not code)

Software will not produce rooms. For the first 30 listings:

1. The owner messages listers he finds in WeChat groups and on 小红书 and asks whether he may
   put their room on Loka, or sends them the link to post it themselves. Only with a yes.
2. Each real listing gets its share card (S4) posted back into those groups. The card brings
   renters; renters bring the next listers.
3. Start with one zone done well (South · Sunnybank side) before pushing the other three.
4. Track one number weekly: rooms where lister and renter confirm they matched.

## Ideas parked on purpose

Payments, deposits, paid featured listings, commissions, a WeChat Mini Program, in-app chat,
AI listing writers, and anything on the Jobs side. Each either needs legal advice first (see
`HANDOFF.md`) or does nothing for the first 20 matches.
