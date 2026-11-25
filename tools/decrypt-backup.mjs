#!/usr/bin/env node
// Open an encrypted Loka weekly backup (made by api/daily.js).
//   node tools/decrypt-backup.mjs loka-backup-2026-11-30.json.gz.enc
// Asks for the BACKUP_KEY passphrase, writes loka-backup-2026-11-30.json next to it.
import { readFileSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { createInterface } from 'node:readline';

export function decryptBackup(buf, pass) {
  if (buf.subarray(0, 5).toString() !== 'LOKA1') throw new Error('not a Loka encrypted backup');
  const salt = buf.subarray(5, 21), iv = buf.subarray(21, 33), tag = buf.subarray(33, 49), body = buf.subarray(49);
  const key = crypto.scryptSync(String(pass), salt, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]); // throws on a wrong passphrase or a damaged file
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const f = process.argv[2];
  if (!f) { console.error('Usage: node tools/decrypt-backup.mjs <file.json.gz.enc>'); process.exit(1); }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Backup passphrase (BACKUP_KEY): ', pass => {
    rl.close();
    try {
      const json = zlib.gunzipSync(decryptBackup(readFileSync(f), pass));
      const out = f.replace(/\.json\.gz\.enc$/, '') + '.json';
      writeFileSync(out, json); console.log('Wrote ' + out);
    } catch (e) { console.error('Could not open it: wrong passphrase or damaged file.'); process.exit(1); }
  });
}
