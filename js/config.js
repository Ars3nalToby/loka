// Loka · config.js: Brand and site constants.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// ───────── config ─────────
// instagram / threads: Loka's own account handles, without @. Leave empty until the accounts exist;
// the Follow buttons only show when these are filled in.
const BRAND={instagram:'',threads:'',en:'Loka',zh:'布村生活站',url:(location.host&&!/^(localhost|127\.)/.test(location.host))?location.host:'loka.vercel.app'};
