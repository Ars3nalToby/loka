// Loka · motion.js: entrance and scroll-reveal animation. Classic script, loaded before app.js.
// Rules: only transform and opacity are animated (smooth on old phones); things animate when a page
// first appears or scrolls into view, never on every filter tap; nothing moves when the phone's
// "Reduce Motion" setting is on.
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)');
let motionTab=null,revealIO=null;
function motion(){const app=document.getElementById('app');if(!app)return;
 const changed=tab!==motionTab;motionTab=tab;
 if(REDUCED.matches)return;
 if(changed){app.classList.remove('enter');void app.offsetWidth;app.classList.add('enter');
  [...app.children].slice(0,16).forEach((el,i)=>el.style.setProperty('--i',i))}
 // Cards below the first screen fade up as they scroll into view.
 if(!('IntersectionObserver' in window))return;
 if(!revealIO)revealIO=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('seen');revealIO.unobserve(e.target)}},{rootMargin:'0px 0px -6% 0px'});
 const fold=innerHeight;
 app.querySelectorAll('.card,.mini-room,.mz,.tile,.pv-s,.xhs a').forEach((el,i)=>{if(el.dataset.rv)return;el.dataset.rv=1;
  if(el.getBoundingClientRect().top>fold){el.classList.add('rv');el.style.setProperty('--j',i%4);revealIO.observe(el)}})}
