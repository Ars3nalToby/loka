# Loka security

Reviewed 18 Nov 2026 (Claude Opus 5.5). Re-run the checks below after any big change.

## What protects the site today

| Layer | Where | What it stops |
| --- | --- | --- |
| Output escaping | `esc()` in `js/ui.js`, used on every user string in every template | Script injection (XSS) through listing text, names, contacts, search |
| Input validation | `cleanData()` in `js/validate.js`, run on load | Bad or hostile records crashing the page or carrying unsafe ids; enums, numbers and lengths forced into range |
| Content Security Policy | `vercel.json` | Any script not served from Loka's own domain; inline scripts; framing; plugins; form posts elsewhere. `script-src 'self'` with no `unsafe-inline` or `unsafe-eval` |
| Other headers | `vercel.json` | HSTS (HTTPS only), nosniff, no framing (clickjacking), strict referrer, camera/mic/location off, COOP same-origin |
| Service worker | `sw.js` | Only Loka's own files are cached or answered; other sites' requests pass through untouched |
| Accounts | `js/auth.js`, Supabase | Codes instead of passwords, PKCE for Google, optional authenticator-app 2FA |
| No secrets in the repo | checked over full git history | Leaked keys |

## How it was tested (18 Nov 2026)

- **Injection test:** six attack payloads planted in every text field of every record, every tab and
  panel opened in English and Chinese: 0 executed, 0 injected elements.
- **CSP test:** every screen, share image, download, QR, squad poster and the full sign-in flow run
  under the real headers: 0 violations.
- **Robustness:** hostile values in enum fields previously crashed the page (fixed, now tested in
  `tests/validate.test.mjs`).
- **Lint:** ESLint over all scripts in load order (`no-undef`, `no-redeclare`, `no-unused-vars`).

## Check the live headers

Open https://securityheaders.com and enter the site address. It should show the CSP, HSTS,
X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy headers.

## Still to do (needs the shared database, task O2 onwards)

- Row-level security on every table; never trust the browser: repeat `cleanData`-style checks and the
  Qld rules as database constraints.
- Rate limits and CAPTCHA on sign-up, posting and reports (Supabase supports CAPTCHA).
- `/.well-known/security.txt` once `BRAND.contact` exists.
- Photo uploads: re-encode in the browser (strips location data), size limits, image types only.

## Running the checks

```
node --test                       # 33 unit tests
npx eslint@9 <scripts in index.html order>   # see HANDOFF.md for the one-liner
```
