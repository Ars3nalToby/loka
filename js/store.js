// Loka · store.js: Where data is saved. Today: localStorage on this device only. Task O2 swaps this for Supabase.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
const KEY='hopper-demo-v5';
const mem={};
const store={get(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return mem.d||null}},set(d){mem.d=d;try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}};
