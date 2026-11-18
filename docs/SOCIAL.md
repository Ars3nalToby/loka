# Loka on Instagram and Threads

Checked against Meta's developer documentation on 18 Nov 2026. Re-check before building stage 3.

## Stage 1: sharing (built, live)

Every room has **Share** (`js/share.js`):

| Button | What really happens | Needs any account or key? |
| --- | --- | --- |
| Threads | Opens Meta's official Post Intent `https://www.threads.com/intent/post?text=…&url=…`. The Threads app opens with the post written; the person taps Post. | No |
| Instagram Story | Loka draws a 1080x1920 image (room, price, Loka Check status, QR code) and hands it to the phone's share sheet; the person picks Instagram. The room link is copied first, because Instagram does not let websites add a Link sticker: the person adds it. If the browser cannot share files (many in-app browsers, desktop), the image downloads instead. | No |
| WeChat / 小红书 | Copies bilingual text + link. | No |
| Copy link | `https://<site>/#/room/<id>`; opening it opens that room. | No |

Limit: until the shared database exists (task O2), a listing someone posts lives only on their
phone, so its link will not open on another phone. Sample listings work everywhere. The share
sheet says so for non-sample listings.

## Stage 2: Loka's own accounts (owner's job)

1. Create an Instagram account for Loka and switch it to a **Professional** account
   (Settings → Account type and tools). Threads uses the same Instagram login.
2. Put the handles (without @) in `js/config.js`: `BRAND.instagram` and `BRAND.threads`.
   The Follow buttons on the About page appear only when these are filled in.
   Threads Follow uses the official Follow Intent `https://www.threads.com/intent/follow?username=…`.

## Stage 3: automatic posting of new verified rooms (not built)

Possible, but only after task O2 (a server must know when a room is verified).

- **Threads API** (`graph.threads.net`): a Meta app with the Threads use case and the
  `threads_basic` + `threads_content_publish` permissions. Without App Review the app can still
  publish to the app owner's own account and tester accounts, which is all Loka needs.
  Tokens expire and must be refreshed.
- **Instagram API**: needs an Instagram professional account. An app that only serves an account
  you own needs Standard Access. Images must be JPEG and at a public URL. Link stickers cannot be
  published through the API.
- Build as a Vercel serverless function triggered when an admin marks a room 4/4 verified. Keep the
  tokens in Vercel environment variables, never in this repo.
