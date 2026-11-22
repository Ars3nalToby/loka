// Loka · api/live.js: a small Vercel serverless function that reads three official public feeds and
// returns small, clean JSON for the "Today in Brisbane" page. GET /api/live?k=events|transit|weather
//
// Sources (first-hand, official):
//   events  Brisbane City Council open data, "brisbane-city-council-events" (CC BY 4.0), updated daily
//   transit Translink service notices RSS
//   weather Bureau of Meteorology, Queensland warnings RSS (personal, non-commercial use; we link back)
//
// Security rules for this file:
//   • The upstream URLs are fixed below. Nothing from the request is ever put into a URL, so the
//     function cannot be pointed at another site (no SSRF). The only input is the key k.
//   • Every field is turned into plain text and cut to a maximum length. Links are kept only when
//     they are https and on the source's own domain. The browser still escapes everything (esc()).
//   • Upstream bodies over 3 MB are refused; each fetch times out after 8 s.
//   • Responses are cached at Vercel's edge (s-maxage), so the official sites see only a few
//     requests an hour however many people open Loka.
'use strict';
const DAY = 864e5, BNE = 10 * 36e5; // Queensland is UTC+10 all year (no daylight saving)
const ODS = 'https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-city-council-events/records';
const FIELDS = 'subject,web_link,start_datetime,end_datetime,venue,cost,primaryeventtype,event_type,description,geolocation,agerange';

// Events that have not finished yet and start before the end of tomorrow (Brisbane time).
function eventUrls(now) {
  const endTomorrow = new Date(Math.floor((now + BNE) / DAY) * DAY + 2 * DAY - BNE).toISOString().replace('.000', '');
  const nowIso = new Date(now).toISOString().replace(/\.\d{3}/, '');
  const where = `end_datetime > '${nowIso}' and start_datetime < '${endTomorrow}'`;
  return [0, 100].map(off => `${ODS}?select=${FIELDS}&where=${encodeURIComponent(where)}&order_by=start_datetime&limit=100&offset=${off}`);
}
const SRC = {
  // ttl: seconds Vercel's edge may reuse a copy. swr: extra seconds it may hand out the old copy while
  // fetching a new one. Safety feeds (transport, weather warnings) are kept within a few minutes.
  events: { ttl: 600, swr: 1200, urls: eventUrls },
  transit: { ttl: 180, swr: 60, urls: () => ['https://translink.com.au/service-updates/rss'] },
  weather: { ttl: 180, swr: 60, urls: () => ['https://reg.bom.gov.au/fwo/IDZ00056.warnings_qld.xml'] }
};

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function text(s, max) {
  if (s == null) return '';
  s = String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 31 && n < 0x110000 ? String.fromCodePoint(n) : ' '; }
      return ENT[e.toLowerCase()] ?? m;
    })
    .replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return max && s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}
function link(u, hostEnd) {
  try { const x = new URL(String(u).trim().replace(/^http:/, 'https:')); return x.protocol === 'https:' && (x.hostname === hostEnd || x.hostname.endsWith('.' + hostEnd)) ? x.href : ''; }
  catch { return ''; }
}
function tag(chunk, name) { const m = chunk.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')); return m ? m[1] : ''; }
function tags(chunk, name) { return [...chunk.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'gi'))].map(m => text(m[1], 40)).filter(Boolean); }
function parseRss(xml, hostEnd, max) {
  return String(xml).split(/<item[\s>]/i).slice(1, (max || 60) + 1).map(c => {
    const it = { t: text(tag(c, 'title'), 160), u: link(text(tag(c, 'link')), hostEnd), d: text(tag(c, 'description'), 300), cat: tags(c, 'category').slice(0, 4) };
    const p = Date.parse(text(tag(c, 'pubDate'))); if (Number.isFinite(p)) it.at = new Date(p).toISOString();
    return it;
  }).filter(i => i.t);
}
function iso(v) { const p = Date.parse(v); return Number.isFinite(p) ? new Date(p).toISOString() : ''; }
function shapeEvents(pages) {
  const seen = new Set(), out = [];
  for (const p of pages) for (const r of (p && Array.isArray(p.results) ? p.results : [])) {
    const t = text(r.subject, 140); if (!t || /^booked out/i.test(t)) continue;
    const s = iso(r.start_datetime), e = iso(r.end_datetime); if (!s) continue;
    const key = t + '|' + s + '|' + text(r.venue, 80); if (seen.has(key)) continue; seen.add(key);
    const g = r.geolocation && Number.isFinite(+r.geolocation.lat) && Number.isFinite(+r.geolocation.lon) ? [+(+r.geolocation.lat).toFixed(4), +(+r.geolocation.lon).toFixed(4)] : null;
    const ty = text(r.primaryeventtype || (Array.isArray(r.event_type) ? r.event_type.find(x => x !== 'Free') : '') || '', 40);
    out.push({ t, s, e: e || s, v: text(r.venue, 100), c: text(r.cost, 60), ty, d: text(r.description, 220), u: link(r.web_link, 'brisbane.qld.gov.au'), g });
  }
  return out.slice(0, 200);
}

async function get(url, json) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Loka/1.0 (+https://lokabne.au; Brisbane community notice board)', Accept: json ? 'application/json' : 'application/rss+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(8000), redirect: 'follow' });
  if (!r.ok) throw new Error('upstream ' + r.status);
  const body = await r.text(); if (body.length > 3e6) throw new Error('too big');
  return json ? JSON.parse(body) : body;
}

async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); return res.status(405).end('{"error":"method"}'); }
  const k = String((req.query && req.query.k) || ''), src = Object.prototype.hasOwnProperty.call(SRC, k) ? SRC[k] : null;
  if (!src) return res.status(400).end('{"error":"unknown feed"}');
  try {
    const urls = src.urls(Date.now());
    let items;
    if (k === 'events') items = shapeEvents(await Promise.all(urls.map(u => get(u, true).catch(() => null))));
    else items = parseRss(await get(urls[0], false), k === 'transit' ? 'translink.com.au' : 'bom.gov.au', k === 'transit' ? 80 : 40);
    if (k === 'events' && !items.length) throw new Error('empty');
    res.setHeader('Cache-Control', `public, max-age=60, s-maxage=${src.ttl}, stale-while-revalidate=${src.swr}`);
    return res.status(200).end(JSON.stringify({ k, at: new Date().toISOString(), items }));
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).end(JSON.stringify({ k, error: 'The official source did not answer. Try again soon.' }));
  }
}
module.exports = handler;
module.exports._test = { text, link, parseRss, shapeEvents, eventUrls };
