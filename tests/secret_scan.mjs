// Fails if a Supabase secret key or any non-public JWT is committed. Public (anon / publishable) keys are fine.
// Run: node tests/secret_scan.mjs
import fs from 'node:fs'; import path from 'node:path';
const bad = [];
const walk = d => { for (const f of fs.readdirSync(d)) { if (/^(node_modules|\.git)$/.test(f)) continue; const p = path.join(d, f), st = fs.statSync(p);
  if (st.isDirectory()) walk(p); else if (/\.(js|mjs|cjs|json|html|md|sql|txt|env)$/.test(f) && st.size < 3e6) { const s = fs.readFileSync(p, 'utf8');
    if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(s)) bad.push(p + ' (sb_secret key)');
    for (const m of s.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      try { const r = JSON.parse(Buffer.from(m[1], 'base64url')).role; if (r && r !== 'anon') bad.push(`${p} (JWT with role ${r})`); } catch {} } } } };
walk(path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'));
if (bad.length) { console.log(bad.join('\n')); process.exit(1); } else console.log('clean');
