# Loka: handoff brief

Paste this file, plus `index.html`, into any coding assistant to continue the build.

## What Loka is

A bilingual (English / 中文) community notice board for Brisbane, starting narrow:
**rooms for Chinese-speaking international students around Sunnybank**.
Jobs, Ask (community Q&A), squads, favours and money tools already exist in the UI.

Owner goal: a place where people come together, talk, and solve everyday problems.
First milestone: 20 real room matches before the February university intake.

## Current state (be honest about this)

- **Renamed from Hopper to Loka.** The domain in `BRAND.url` (`hopper.com.au`) is still the old
  one until a Loka domain is chosen. The localStorage key stays `hopper-demo-v5` so demo data is kept.

- One static file, `index.html`: HTML, CSS and vanilla JS, no build step, no framework.
- **All data is localStorage on each visitor's own device.** Nothing is shared between users.
  Every listing shown is sample data from `seed()`.
- No login. The admin desk is open to anyone.
- PWA shell is in place: `manifest.webmanifest`, `sw.js`, icons. It installs to a home screen
  once served over HTTPS.

## What must be built next, in order

1. **Shared database.** Tables: `homes`, `jobs`, `questions`, `answers`, `reports`,
   `squads`, `tasks`. Supabase (Postgres plus row-level security) fits the current data shapes;
   see `seed()` in `index.html` for every field.
2. **Auth.** Email or phone sign-in. Listers must be signed in to post.
3. **Admin gate.** Only the owner account can verify, remove, or see reports.
4. **Moderation.** New listings start unpublished or flagged until rule checks pass.
   Ask-board posts need a report button and removal.
5. **Photos.** Real listing photos in storage. The current pictures are generated SVG art.
6. **Hash routes** per listing so a room can be shared as a link or QR code.

## Rules that must survive any rewrite

These came from Queensland rental law research (RTA, Property Occupations Act 2014).
They are product requirements, not suggestions. Constants live in `RULES` in `index.html`.

| Rule | Where it lives now |
| --- | --- |
| Rent is one fixed weekly number. No ranges, no "offers". | `homeForm`, `createhome` |
| Bond above 4 weeks of rent is refused at publish. | `createhome`, `homeFlags` |
| Rent in advance: max 2 weeks (room / periodic), 4 weeks (fixed term). | `createhome`, `homeFlags` |
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
