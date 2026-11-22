# Loka accounts: sign-in, two-step verification, mobile numbers

Built 18 Nov 2026 in `js/auth.js`. Off until `AUTH.url` and `AUTH.key` are set in `js/config.js`.
Sources checked 18 Nov 2026 are listed at the end. Re-check before launch.

## What is built

| Method | How | Cost |
| --- | --- | --- |
| Google sign-in | `signInWithOAuth({provider:'google'})`, PKCE flow | Free |
| Email code | `signInWithOtp({email})` then `verifyOtp(type 'email')`, 6-10 digits | Free: custom SMTP via Resend (free plan 100 emails/day), sender no-reply@lokabne.au, set up 23 Nov 2026 |
| Australian mobile code | `signInWithOtp({phone})`, numbers normalised to +614XXXXXXXX by `auMobile()`; landlines and overseas numbers refused | Paid per SMS via the SMS provider. Off (`AUTH.phone=false`) until set up |
| Two-step verification | TOTP via `auth.mfa.enroll / challengeAndVerify`; works with Google Authenticator, Microsoft Authenticator, Authy. Asked for at every sign-in once enrolled | Free |

Before any of these run, the person must tick "I am 18 or older and have read the privacy notice
and listing rules". The privacy notice is the Privacy tab (`privacyHtml()` in `js/more.js`).

Tested 18 Nov 2026 against a stand-in server with the real supabase-js 2.119.0: correct request
bodies for email OTP, verify, TOTP enrol, phone OTP (+61412345678), and the Google authorize
redirect with PKCE. Not yet tested against a live Supabase project.

## To switch it on (owner + next assistant)

1. **Supabase project for Loka.** Create a separate project (not the-non-negotiables), region
   Sydney (ap-southeast-2). Put its Project URL and publishable key into `AUTH` in `js/config.js`.
2. **Auth URLs.** Supabase → Authentication → URL Configuration: Site URL
   `https://lokabne.au`, and add it to Redirect URLs.
3. **Google.** In Google Cloud Console create an OAuth client (type: Web application). Authorised
   redirect URI = the callback URL Supabase shows on its Google provider page. Paste the client ID
   and secret into Supabase → Authentication → Providers → Google. Set the OAuth consent screen
   app name to Loka and add the privacy page link.
4. **Email.** Change the Supabase email template to show the 6-digit `{{ .Token }}` code. Before
   launch, connect a real SMTP sender.
5. **Two-step verification.** TOTP is on by default in Supabase. Nothing to do.
6. **Mobile (optional, costs money).** Pick an SMS provider Supabase supports (Twilio, Vonage,
   MessageBird, TextLocal). Send from a **number**, or register an alphanumeric sender name: since
   1 July 2026 unregistered branded sender IDs in Australia show as "Unverified", and registering
   needs an ABN. Then set `AUTH.phone=true`.
7. **Contact email.** Set `BRAND.contact`. The privacy notice and account page show it.

## Rules this design follows

- **Privacy Act 1988 / APPs.** Loka is probably under the $3m small business exemption, but the
  exemption is expected to be narrowed or removed, and a privacy policy plus a collection notice at
  the point of collection is the standard either way (APP 1, APP 5). Both exist; the policy is a
  draft for legal review.
- **Collect the minimum.** No ID documents, ID numbers, dates of birth or bank details, ever.
- **Spam Act 2003.** Phone numbers are used for sign-in codes only. Any marketing later needs
  separate opt-in consent and an unsubscribe.
- **SMS Sender ID Register (ACMA).** See step 6.
- **Social media minimum age (from 10 Dec 2025).** Applies to platforms whose sole or significant
  purpose is online social interaction. Loka is a rooms and jobs notice board, but the Ask board
  and squads are social. Accounts are 18+ for renting and work reasons, which also keeps under-16s
  out. Self-declaration is a light measure: get advice on whether eSafety's "reasonable steps" apply
  before growing the social features.

## Sources (checked 18 Nov 2026)

- Supabase MFA: https://supabase.com/docs/guides/auth/auth-mfa
- Supabase phone login: https://supabase.com/docs/guides/auth/phone-login
- ACMA SMS Sender ID Register: https://www.acma.gov.au/sms-sender-id-register
- eSafety social media age restrictions: https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions
- OAIC Australian Privacy Principles: https://www.oaic.gov.au/privacy/australian-privacy-principles
