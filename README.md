# Loka · 布村生活站

Brisbane rooms and jobs, checked against Queensland rules. Bilingual (English / 中文).

- `index.html`, `css/app.css`, `js/`: the app (no build step; file map in `HANDOFF.md`)
- `tests/`: rule tests, run `node --test`
- `manifest.webmanifest`, `sw.js`, `icons/`: installable PWA shell
- `HANDOFF.md`: current state, rules that must be kept, and what to build next

Run locally: `npx serve .` then open the printed address.

Status: demo. Data is stored on each visitor's device only. See `HANDOFF.md`.
