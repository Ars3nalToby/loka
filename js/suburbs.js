// Loka · suburbs.js: coverage data (inner city + south side) and zone helpers. The single source of truth
// for suburbs; data/suburbs.json was folded in here so it loads without a fetch. Classic script, loaded before ui.js.
const SUBURB_DATA={
 "_note": "Loka coverage: Brisbane inner city + south side. `zh` values are common transliterations and MUST be checked by the owner before display; when `zh` is null show the English name (most Chinese speakers in Brisbane use the English suburb names anyway). Postcodes and `near` were written from general knowledge on 17 Nov 2026: verify against Australia Post and Translink before launch. Underwood and Rochedale South are in Logan City, kept because renters search them with Sunnybank. lat/lng are approximate suburb centres for the drawn map, not survey data.",
 "zones": {
  "inner": {
   "en": "Inner city",
   "zh": "市中心",
   "order": 1
  },
  "west": {
   "en": "West · UQ side",
   "zh": "西区 · UQ 一带",
   "order": 2
  },
  "innersouth": {
   "en": "Inner south",
   "zh": "近南区",
   "order": 3
  },
  "south": {
   "en": "South · Sunnybank side",
   "zh": "南区 · Sunnybank 一带",
   "order": 4
  }
 },
 "campuses": [
  {
   "id": "uq",
   "en": "UQ St Lucia",
   "zh": "昆士兰大学 UQ",
   "lat": -27.4975,
   "lng": 153.0137
  },
  {
   "id": "qut-gp",
   "en": "QUT Gardens Point",
   "zh": "QUT 市区校区",
   "lat": -27.4772,
   "lng": 153.028
  },
  {
   "id": "qut-kg",
   "en": "QUT Kelvin Grove",
   "zh": "QUT Kelvin Grove 校区",
   "lat": -27.452,
   "lng": 153.016
  },
  {
   "id": "gu-nathan",
   "en": "Griffith Nathan",
   "zh": "格里菲斯 Nathan 校区",
   "lat": -27.555,
   "lng": 153.053
  },
  {
   "id": "gu-sb",
   "en": "Griffith South Bank",
   "zh": "格里菲斯 South Bank 校区",
   "lat": -27.479,
   "lng": 153.022
  }
 ],
 "suburbs": [
  {
   "name": "Brisbane City",
   "zh": "布里斯班市中心",
   "zone": "inner",
   "postcode": "4000",
   "near": [
    "qut-gp"
   ],
   "lat": -27.468,
   "lng": 153.025
  },
  {
   "name": "Spring Hill",
   "zh": "春山",
   "zone": "inner",
   "postcode": "4000",
   "near": [
    "qut-gp"
   ],
   "lat": -27.46,
   "lng": 153.022
  },
  {
   "name": "Fortitude Valley",
   "zh": "毅力谷",
   "zone": "inner",
   "postcode": "4006",
   "near": [],
   "lat": -27.456,
   "lng": 153.034
  },
  {
   "name": "Bowen Hills",
   "zh": null,
   "zone": "inner",
   "postcode": "4006",
   "near": [],
   "lat": -27.444,
   "lng": 153.037
  },
  {
   "name": "Newstead",
   "zh": null,
   "zone": "inner",
   "postcode": "4006",
   "near": [],
   "lat": -27.446,
   "lng": 153.047
  },
  {
   "name": "New Farm",
   "zh": "新农场",
   "zone": "inner",
   "postcode": "4005",
   "near": [],
   "lat": -27.467,
   "lng": 153.048
  },
  {
   "name": "Kelvin Grove",
   "zh": "凯文格罗夫",
   "zone": "inner",
   "postcode": "4059",
   "near": [
    "qut-kg"
   ],
   "lat": -27.449,
   "lng": 153.012
  },
  {
   "name": "Milton",
   "zh": null,
   "zone": "inner",
   "postcode": "4064",
   "near": [],
   "lat": -27.47,
   "lng": 153.003
  },
  {
   "name": "South Brisbane",
   "zh": "南布里斯班",
   "zone": "inner",
   "postcode": "4101",
   "near": [
    "gu-sb",
    "qut-gp"
   ],
   "lat": -27.481,
   "lng": 153.018
  },
  {
   "name": "West End",
   "zh": "西端",
   "zone": "inner",
   "postcode": "4101",
   "near": [
    "gu-sb",
    "uq"
   ],
   "lat": -27.482,
   "lng": 153.008
  },
  {
   "name": "Highgate Hill",
   "zh": null,
   "zone": "inner",
   "postcode": "4101",
   "near": [
    "gu-sb"
   ],
   "lat": -27.49,
   "lng": 153.017
  },
  {
   "name": "Kangaroo Point",
   "zh": "袋鼠角",
   "zone": "inner",
   "postcode": "4169",
   "near": [
    "qut-gp"
   ],
   "lat": -27.477,
   "lng": 153.035
  },
  {
   "name": "East Brisbane",
   "zh": null,
   "zone": "inner",
   "postcode": "4169",
   "near": [],
   "lat": -27.483,
   "lng": 153.046
  },
  {
   "name": "Woolloongabba",
   "zh": "伍伦加巴",
   "zone": "inner",
   "postcode": "4102",
   "near": [
    "gu-sb"
   ],
   "lat": -27.491,
   "lng": 153.035
  },
  {
   "name": "St Lucia",
   "zh": "圣卢西亚",
   "zone": "west",
   "postcode": "4067",
   "near": [
    "uq"
   ],
   "lat": -27.498,
   "lng": 153.0
  },
  {
   "name": "Toowong",
   "zh": "图旺",
   "zone": "west",
   "postcode": "4066",
   "near": [
    "uq"
   ],
   "lat": -27.485,
   "lng": 152.992
  },
  {
   "name": "Auchenflower",
   "zh": null,
   "zone": "west",
   "postcode": "4066",
   "near": [
    "uq"
   ],
   "lat": -27.476,
   "lng": 152.993
  },
  {
   "name": "Taringa",
   "zh": null,
   "zone": "west",
   "postcode": "4068",
   "near": [
    "uq"
   ],
   "lat": -27.492,
   "lng": 152.98
  },
  {
   "name": "Indooroopilly",
   "zh": "因杜鲁皮利",
   "zone": "west",
   "postcode": "4068",
   "near": [
    "uq"
   ],
   "lat": -27.5,
   "lng": 152.972
  },
  {
   "name": "Dutton Park",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4102",
   "near": [
    "uq"
   ],
   "lat": -27.497,
   "lng": 153.026
  },
  {
   "name": "Fairfield",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4103",
   "near": [
    "uq"
   ],
   "lat": -27.508,
   "lng": 153.024
  },
  {
   "name": "Annerley",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4103",
   "near": [
    "uq"
   ],
   "lat": -27.512,
   "lng": 153.034
  },
  {
   "name": "Yeronga",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4104",
   "near": [],
   "lat": -27.518,
   "lng": 153.015
  },
  {
   "name": "Moorooka",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4105",
   "near": [],
   "lat": -27.535,
   "lng": 153.024
  },
  {
   "name": "Greenslopes",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4120",
   "near": [],
   "lat": -27.508,
   "lng": 153.05
  },
  {
   "name": "Stones Corner",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4120",
   "near": [],
   "lat": -27.498,
   "lng": 153.044
  },
  {
   "name": "Coorparoo",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4151",
   "near": [],
   "lat": -27.494,
   "lng": 153.058
  },
  {
   "name": "Holland Park",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4121",
   "near": [],
   "lat": -27.522,
   "lng": 153.068
  },
  {
   "name": "Tarragindi",
   "zh": null,
   "zone": "innersouth",
   "postcode": "4121",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.526,
   "lng": 153.044
  },
  {
   "name": "Sunnybank",
   "zh": "新利班",
   "zone": "south",
   "postcode": "4109",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.578,
   "lng": 153.06
  },
  {
   "name": "Sunnybank Hills",
   "zh": "新利班山",
   "zone": "south",
   "postcode": "4109",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.594,
   "lng": 153.053
  },
  {
   "name": "Robertson",
   "zh": "罗伯逊",
   "zone": "south",
   "postcode": "4109",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.566,
   "lng": 153.057
  },
  {
   "name": "Macgregor",
   "zh": null,
   "zone": "south",
   "postcode": "4109",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.566,
   "lng": 153.075
  },
  {
   "name": "Nathan",
   "zh": null,
   "zone": "south",
   "postcode": "4111",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.553,
   "lng": 153.06
  },
  {
   "name": "Coopers Plains",
   "zh": null,
   "zone": "south",
   "postcode": "4108",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.565,
   "lng": 153.04
  },
  {
   "name": "Salisbury",
   "zh": null,
   "zone": "south",
   "postcode": "4107",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.552,
   "lng": 153.032
  },
  {
   "name": "Acacia Ridge",
   "zh": null,
   "zone": "south",
   "postcode": "4110",
   "near": [],
   "lat": -27.586,
   "lng": 153.026
  },
  {
   "name": "Runcorn",
   "zh": "朗科恩",
   "zone": "south",
   "postcode": "4113",
   "near": [],
   "lat": -27.598,
   "lng": 153.077
  },
  {
   "name": "Eight Mile Plains",
   "zh": "八里坪",
   "zone": "south",
   "postcode": "4113",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.577,
   "lng": 153.096
  },
  {
   "name": "Kuraby",
   "zh": null,
   "zone": "south",
   "postcode": "4112",
   "near": [],
   "lat": -27.606,
   "lng": 153.093
  },
  {
   "name": "Underwood",
   "zh": null,
   "zone": "south",
   "postcode": "4119",
   "near": [],
   "lat": -27.61,
   "lng": 153.111
  },
  {
   "name": "Mount Gravatt",
   "zh": "格拉瓦特山",
   "zone": "south",
   "postcode": "4122",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.538,
   "lng": 153.08
  },
  {
   "name": "Mount Gravatt East",
   "zh": null,
   "zone": "south",
   "postcode": "4122",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.542,
   "lng": 153.09
  },
  {
   "name": "Upper Mount Gravatt",
   "zh": "上格拉瓦特山",
   "zone": "south",
   "postcode": "4122",
   "near": [
    "gu-nathan"
   ],
   "lat": -27.553,
   "lng": 153.082
  },
  {
   "name": "Wishart",
   "zh": null,
   "zone": "south",
   "postcode": "4122",
   "near": [],
   "lat": -27.553,
   "lng": 153.101
  },
  {
   "name": "Mansfield",
   "zh": null,
   "zone": "south",
   "postcode": "4122",
   "near": [],
   "lat": -27.539,
   "lng": 153.101
  },
  {
   "name": "Rochedale",
   "zh": "罗奇代尔",
   "zone": "south",
   "postcode": "4123",
   "near": [],
   "lat": -27.57,
   "lng": 153.13
  },
  {
   "name": "Rochedale South",
   "zh": null,
   "zone": "south",
   "postcode": "4123",
   "near": [],
   "lat": -27.596,
   "lng": 153.123
  },
  {
   "name": "Calamvale",
   "zh": "卡拉姆韦尔",
   "zone": "south",
   "postcode": "4116",
   "near": [],
   "lat": -27.621,
   "lng": 153.054
  },
  {
   "name": "Stretton",
   "zh": null,
   "zone": "south",
   "postcode": "4116",
   "near": [],
   "lat": -27.622,
   "lng": 153.068
  },
  {
   "name": "Drewvale",
   "zh": null,
   "zone": "south",
   "postcode": "4116",
   "near": [],
   "lat": -27.64,
   "lng": 153.061
  },
  {
   "name": "Algester",
   "zh": null,
   "zone": "south",
   "postcode": "4115",
   "near": [],
   "lat": -27.613,
   "lng": 153.033
  },
  {
   "name": "Parkinson",
   "zh": null,
   "zone": "south",
   "postcode": "4115",
   "near": [],
   "lat": -27.643,
   "lng": 153.03
  }
 ]
};
const ZONE=Object.fromEntries(SUBURB_DATA.suburbs.map(s=>[s.name,s.zone]));
const ZN=Object.fromEntries(Object.entries(SUBURB_DATA.zones).sort((a,b)=>a[1].order-b[1].order).map(([k,z])=>[k,[z.en,z.zh]]));
const SUB=n=>SUBURB_DATA.suburbs.find(s=>s.name===n);
