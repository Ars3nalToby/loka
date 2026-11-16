// Loka · state.js: App state: loaded data, current tab, filters.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
let S=store.get()||seed();if(!S.qa)S.qa=seedQA();
let tab='home',filter='all',posterTheme='neon';
let hf={type:'all',max:0,q:'',bills:false,clean:false,zh:false,nobond:false},jf={q:'',fair:false,zh:false,cash:false};
let mq={b:350,z:'south',zh:false};
const save=()=>store.set(S);
