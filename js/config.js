// Loka · config.js: Brand and site constants.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// ───────── config ─────────
// instagram / threads: Loka's own account handles, without @. Leave empty until the accounts exist;
// the Follow buttons only show when these are filled in.
// contact: an email people can use for privacy requests and complaints. Must be set before launch.
const BRAND={contact:'',instagram:'',threads:'',en:'Loka',zh:'布村生活站',url:(location.host&&!/^(localhost|127\.)/.test(location.host))?location.host:'loka.vercel.app'};
// Accounts (js/auth.js, docs/AUTH.md). url + key come from Loka's own Supabase project:
// Project Settings → API → Project URL and the publishable (anon) key. The publishable key is
// meant to be public; never put a secret or service_role key here.
// phone stays false until an SMS provider is set up in Supabase (it costs money per SMS).
const AUTH={url:'',key:'',google:true,email:true,phone:false};
