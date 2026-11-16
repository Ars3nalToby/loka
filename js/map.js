// Loka · map.js: Home-screen suburb map. Task S1 redraws it from data/suburbs.json.
// Classic script: shares global scope with the other js/ files. Load order is set in index.html.
const MAP=[['Toowong',96,96,0,-22,'middle'],['St Lucia',150,168,22,5,'start'],['Indooroopilly',64,196,0,34,'middle'],['South Brisbane',226,112,22,5,'start'],['Coopers Plains',204,250,-22,5,'end'],['Sunnybank',270,288,22,5,'start'],['Sunnybank Hills',222,338,-22,5,'end'],['Calamvale',276,388,22,5,'start'],['Rochedale',352,236,0,-22,'middle']];
function mapSvg(){const cnt=a=>S.homes.filter(h=>h.area===a).length+S.jobs.filter(j=>j.area===a).length;
 const river="M-10 150 C36 176 52 96 104 138 S150 214 190 150 S226 60 262 96 S318 150 346 96 S400 40 430 70";
 return `<svg viewBox="0 0 420 430" role="img" aria-label="${t('Map of Brisbane suburbs with listings','布里斯班各区房源与工作地图')}"><rect width="420" height="430" fill="#F8F5EE"/>
 <circle cx="120" cy="150" r="78" fill="#E3F0EB" opacity=".55"/><circle cx="262" cy="320" r="104" fill="#F6E7D8" opacity=".6"/>
 <path d="${river}" fill="none" stroke="#cfe3ee" stroke-width="20" stroke-linecap="round"/><path d="${river}" fill="none" stroke="#e9f3f7" stroke-width="7" stroke-linecap="round"/>
 <path d="M236 132 L214 236 L250 300 L262 420 M214 236 L360 232 M96 110 L62 186" stroke="#E4DCCB" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="1 9"/>
 <text x="330" y="52" font-family="Bodoni Moda,serif" font-style="italic" font-size="14" fill="#8fa3ad" text-anchor="middle">Brisbane River</text>
 <g transform="translate(386,396)"><circle r="15" fill="#fff"/><path d="M0-10 4 4 0 1-4 4z" fill="#E2683C"/><text y="-17" text-anchor="middle" font-size="9" font-weight="700" fill="#6B645A">N</text></g>
 <rect x="252" y="62" width="34" height="18" rx="9" fill="#191512"/><text x="269" y="75" text-anchor="middle" font-size="10" font-weight="700" fill="#F4F0E7">CBD</text>
 ${MAP.map(m=>{const c=cnt(m[0]);return `<g class="pin" data-a="pin" data-v="${m[0]}"><circle cx="${m[1]}" cy="${m[2]}" r="26" fill="transparent"/><circle cx="${m[1]}" cy="${m[2]}" r="${c?16:8}" fill="${c?'#1F6F5C':'#d8d0c0'}" stroke="#fff" stroke-width="3"/><text x="${m[1]}" y="${m[2]+4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${c||''}</text><text class="ml" x="${m[1]+m[3]}" y="${m[2]+m[4]}" text-anchor="${m[5]}" font-size="12" font-weight="600" fill="#191512" paint-order="stroke" stroke="#F8F5EE" stroke-width="4">${m[0]}</text></g>`}).join('')}</svg>`}
