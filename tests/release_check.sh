#!/usr/bin/env bash
# Loka release check. Run from the repo root before every push:  bash tests/release_check.sh
# Every line must end in OK. The weekly maintenance task runs this too.
set -u; cd "$(dirname "$0")/.."; fail=0
ok(){ echo "OK    $1"; }; bad(){ echo "FAIL  $1"; fail=1; }
export CHROME="${CHROME:-$(ls /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | head -1)}"
node --test >/tmp/loka-unit.txt 2>&1 && ok "unit tests ($(grep -oP '^# pass \K\d+' /tmp/loka-unit.txt) passed)" || { bad "unit tests"; grep -E '^not ok' /tmp/loka-unit.txt; }
for f in js/*.js api/*.js sw.js; do node --check "$f" 2>/dev/null || { bad "syntax $f"; }; done; ok "syntax"
D=/tmp/loka-pglite; [ -d $D/node_modules/@electric-sql/pglite ] || npm i --silent --no-save --prefix $D @electric-sql/pglite >/dev/null 2>&1
NODE_PATH=$D/node_modules node tests/db/rls_check.mjs >/tmp/loka-db.txt 2>&1 && ok "database rules ($(grep -c '^PASS' /tmp/loka-db.txt) attacks blocked)" || { bad "database rules"; grep FAIL /tmp/loka-db.txt; }
QUICK=1 python3 tests/e2e/clip_audit.py 2>/dev/null | grep -q 'ISSUES 0 | page errors 0' && ok "nothing cut off (320/390px, EN+中文)" || bad "clip audit: run QUICK=1 python3 tests/e2e/clip_audit.py"
python3 tests/e2e/mobile_audit.py 2>/dev/null | grep -q '^TOTAL 0' && ok "phone usability" || bad "mobile audit: run python3 tests/e2e/mobile_audit.py"
python3 tests/e2e/pwa_check.py >/tmp/loka-pwa.txt 2>/dev/null; grep -q 'OFFLINE reload ok' /tmp/loka-pwa.txt && grep -q "^errors \[\]" /tmp/loka-pwa.txt && ok "installable app works offline" || { bad "PWA check"; cat /tmp/loka-pwa.txt; }
git diff --quiet HEAD -- sw.js js css index.html manifest.webmanifest 2>/dev/null || { git diff HEAD -- sw.js | grep -q "VERSION=" && ok "sw VERSION bumped" || bad "app files changed but sw.js VERSION was not bumped"; }
node tests/secret_scan.mjs >/dev/null && ok "no secret keys (only public keys)" || bad "secret key in repo: remove it and rotate it in Supabase"
[ $fail = 0 ] && echo "RELEASE CHECK PASSED" || { echo "RELEASE CHECK FAILED"; exit 1; }
