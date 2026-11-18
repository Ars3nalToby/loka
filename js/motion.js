// Loka · motion.js: entrance and scroll-reveal animation. Classic script, loaded before app.js.
// Rules: only transform and opacity are animated (smooth on old phones); things animate when a page
// first appears or scrolls into view, never on every filter tap; nothing moves when the phone's
// "Reduce Motion" setting is on.
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)');
let motionTab=null,revealIO=null;
const WIDE=matchMedia('(min-width:560px)');let hdrRaf=0; // used by hdr() in app.js
function motion(){const app=document.getElementById('app');if(!app)return;
 const changed=tab!==motionTab;motionTab=tab;
 if(REDUCED.matches)return;
 if(changed){app.classList.remove('enter');void app.offsetWidth;app.classList.add('enter');
  [...app.children].slice(0,16).forEach((el,i)=>el.style.setProperty('--i',i))}
 // Cards below the first screen fade up as they scroll into view.
 if(!('IntersectionObserver' in window))return;
 if(!revealIO)revealIO=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('seen');revealIO.unobserve(e.target)}},{rootMargin:'0px 0px -6% 0px'});
 const fold=innerHeight;
 app.querySelectorAll('.card,.mini-room,.mz,.tile,.pv-s,.xhs a,.hcard,.door,.hb,.rule,.court,.lstep,.tr').forEach((el,i)=>{if(el.dataset.rv)return;el.dataset.rv=1;
  if(el.getBoundingClientRect().top>fold){el.classList.add('rv');el.style.setProperty('--j',i%4);revealIO.observe(el)}})}

// ───────── Light / dark ─────────
// Light is the default. Dark only when chosen here; the choice is kept in localStorage ('loka-theme')
// and applied before first paint by theme.js. The switch grows as a circle from the button, using the
// View Transitions API where the browser has it, and is instant everywhere else.
const isDark=()=>document.documentElement.dataset.theme==='dark';
function themeIcon(){return `<svg viewBox="0 0 24 24" aria-hidden="true"><g class="sun"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g><path class="moon" d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"/></svg>`}
function setTheme(dark,btn){const apply=()=>{const h=document.documentElement;if(dark)h.dataset.theme='dark';else delete h.dataset.theme;
  try{localStorage.setItem('loka-theme',dark?'dark':'light')}catch(e){}
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',dark?'#14120F':'#F4F0E7');render()};
 if(!document.startViewTransition||REDUCED.matches)return apply();
 const r=btn?btn.getBoundingClientRect():{left:innerWidth-40,top:30,width:0,height:0},x=r.left+r.width/2,y=r.top+r.height/2,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
 const vt=document.startViewTransition(apply);
 vt.ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},{duration:650,easing:'cubic-bezier(.16,1,.3,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{})}
