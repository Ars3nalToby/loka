# Local stand-in for Vercel during tests: serves the repo, mimics cleanUrls (/index.html -> /) and
# answers /api/live with fixed sample data (EVIL=1 fills it with script-injection payloads).
import http.server,json,sys,datetime as dt,os
root=sys.argv[2];now=dt.datetime.now(dt.timezone.utc)
def iso(h):return (now+dt.timedelta(hours=h)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
EV=[('Brisbane City Markets - Cathedral Square',-1,3,'Cathedral Square, Brisbane City','Free','Markets'),('English conversation group',0.5,1.5,'Coopers Plains Library','Free','Library event'),
('WILD ABANDON',1,2.5,'Brisbane Powerhouse, New Farm','Adults - $52; Concession - $42.','Performing arts'),('Tai Chi Qigong',14,15,'Sherwood Arboretum, Sherwood','Free',''),
('Seido Karate Classes',0.2,1.2,'Sunnybank Hall, Sunnybank','See website for costs','Fitness & well-being'),('First 5 Forever toddler time',15,15.5,'Corinda Library','Free','Library event'),
('Free guided tours - City Botanic Gardens',16,19,'City Botanic Gardens, Brisbane City','Free','Tours'),('Precious',-5000,9000,'Museum of Brisbane, Brisbane City','Free','Exhibitions'),('Zumba Gold',30,31,'Wynnum Municipal Hall','Free','Move Well Brisbane')]
DATA={'events':[{'t':a,'s':iso(s),'e':iso(e),'v':v,'c':c,'ty':ty,'d':'','u':'https://www.brisbane.qld.gov.au/trumba?x=1','g':None} for a,s,e,v,c,ty in EV],
'transit':[{'t':'⚠ Beenleigh line timetable changes - Dutton Park to Salisbury','u':'https://translink.com.au/updates/887301','d':'Start date: 16/11/2026 6:00 AM, End date: 14/12/2026 11:59 PM, Services: Fairfield station, Yeronga station, ...','cat':['Current','Minor']},
 {'t':'☒ Moorooka station - extended closure','u':'https://translink.com.au/updates/962201','d':'Start date: 02/03/2026 4:00 AM, Services: 19, Moorooka station','cat':['Current','Major','SEQ']},
 {'t':'☒ Reef Street, Gympie - temporary stop closure','u':'https://translink.com.au/updates/1134886','d':'Services: Reef Street at Park Gates','cat':['Current','Major']}],
'weather':[{'t':'18/13:30 EST Heatwave Warning (QLD)','u':'https://reg.bom.gov.au/qld/warnings/heatwave.shtml','d':'','cat':[],'at':iso(-4)},{'t':'18/15:00 EST Marine Wind Warning Summary for Queensland','u':'https://reg.bom.gov.au/qld/warnings/marinewind.shtml','d':'','cat':[]}]}
if os.environ.get('EVIL'):
  P='<img src=x onerror="window.__x=1">"\'><svg onload=window.__x=1>'
  for k in DATA:
    for it in DATA[k]:
      for f in ('t','v','c','d','ty'):
        if f in it: it[f]=P+str(it[f])
      it['u']='javascript:window.__x=1'
class H(http.server.SimpleHTTPRequestHandler):
  def __init__(s,*a,**k):super().__init__(*a,directory=root,**k)
  def log_message(s,*a):pass
  def do_GET(s):
    if s.path.split('?')[0]=='/index.html':
      s.send_response(308);s.send_header('Location','/');s.end_headers();return
    if s.path.startswith('/api/live'):
      k=s.path.split('k=')[-1];b=json.dumps({'k':k,'at':iso(-0.05),'items':DATA.get(k,[])}).encode()
      s.send_response(200);s.send_header('Content-Type','application/json');s.end_headers();s.wfile.write(b);return
    return super().do_GET()
http.server.ThreadingHTTPServer(('127.0.0.1',int(sys.argv[1])),H).serve_forever()
