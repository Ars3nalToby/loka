// Loka · state.js: App state: loaded data, current tab, filters.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
let S=store.get()||seed();if(!S.qa)S.qa=seedQA();
// Migration: demo data saved before Loka Check existed gets the sample checks and inspection counts.
(()=>{const d=seed();for(const h of S.homes){const o=d.homes.find(x=>x.id===h.id);if(o&&!h.checks){h.checks=o.checks;if(o.vdate&&!h.vdate)h.vdate=o.vdate;if(!h.insp)h.insp=o.insp}}})();
let tab='home',filter='all',posterTheme='neon';
let hf={type:'all',max:0,q:'',bills:false,clean:false,zh:false,nobond:false},jf={q:'',fair:false,zh:false,cash:false};
let mq={b:350,z:'south',zh:false};
let rview='list'; // Rooms page: 'list' or 'map'
let hfOpen=false; // Rooms page: is the Filters drawer open
const hfCount=()=>(hf.type!=='all')+(hf.max?1:0)+(hf.zh?1:0)+(hf.bills?1:0)+(hf.nobond?1:0)+(hf.clean?1:0);
const save=()=>store.set(S);
