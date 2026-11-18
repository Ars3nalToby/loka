// Loka · theme.js: applies the saved light/dark choice before the page paints, so there is no flash.
// Loaded WITHOUT defer in <head>, before the stylesheet's first paint. Light is always the default:
// dark only when the person chose it (AGENTS.md: never ship a dark default theme).
(function(){try{if(localStorage.getItem('loka-theme')==='dark'){document.documentElement.dataset.theme='dark';
 var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#14120F')}}catch(e){}})();
