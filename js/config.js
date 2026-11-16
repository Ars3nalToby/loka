// Loka · config.js: Brand and site constants.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
// ───────── config ─────────
const BRAND={en:'Loka',zh:'布村生活站',url:(location.host&&!/^(localhost|127\.)/.test(location.host))?location.host:'loka.vercel.app'};
