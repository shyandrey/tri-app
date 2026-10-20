"""Read HTML from stdin; extract only labelled profile attributes/social block."""
import sys, json
from html.parser import HTMLParser
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.root={'tag':'root','attrs':{},'children':[]}; self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        n={'tag':tag,'attrs':{k:v or '' for k,v in attrs},'children':[]};self.stack[-1]['children'].append(n)
        if tag not in ('meta','link','img','input','br','hr','source','area','base','embed','wbr'):self.stack.append(n)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i]['tag']==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1]['children'].append(data)
def nodes(n):
    if isinstance(n,dict):
        yield n
        for c in n['children']:yield from nodes(c)
def text(n):return ' '.join(n.split()) if isinstance(n,str) else ' '.join(filter(None,(text(c) for c in n['children'])))
def cls(n,c):return c in n['attrs'].get('class','').split()
p=Parser();p.feed(sys.stdin.read());allnodes=list(nodes(p.root));fields={};links=[];countries=[]
for n in allnodes:
    if cls(n,'country') and cls(n,'attribute'):
        for c in nodes(n):
            for token in c['attrs'].get('class','').split():
                if token.startswith('flag-icon-') and len(token)==12:countries.append(token[10:].upper())
    if '--identity-only' not in sys.argv and cls(n,'attribute'):
        names=[text(c) for c in n['children'] if isinstance(c,dict) and cls(c,'name')]
        vals=[text(c) for c in n['children'] if isinstance(c,dict) and cls(c,'value')]
        if len(names)==1 and names[0] in ('Age','Born'):fields.setdefault(names[0],[]).extend(vals)
    if '--identity-only' not in sys.argv and cls(n,'equipments-and-socials'):
        for social in nodes(n):
            if cls(social,'social'):
                for a in nodes(social):
                    if a['tag']=='a' and cls(a,'social-link'):links.append({'href':a['attrs'].get('href',''),'target':a['attrs'].get('target','')})
history=[]
if '--identity-only' in sys.argv:
    for n in allnodes:
        if n['tag']!='tr':continue
        cells={}
        for c in n['children']:
            if isinstance(c,dict) and c['tag']=='td':
                for key in ('race','place','overall','swim','bike','run'):
                    if cls(c,key):cells[key]=c
        if len(cells)!=6:continue
        anchors=[a for a in nodes(cells['race']) if a['tag']=='a' and a['attrs'].get('href','').startswith('/race/')]
        if len(anchors)!=1:continue
        history.append({'url':'https://stats.protriathletes.org'+anchors[0]['attrs']['href'],'position':text(cells['place']),'total':' '.join(c.strip() for c in cells['overall']['children'] if isinstance(c,str)).strip(),'swim':text(cells['swim']),'bike':text(cells['bike']),'run':text(cells['run'])})
print(json.dumps({'names':[n['attrs'].get('content','').split(' - Pro Triathlon')[0] for n in allnodes if n['tag']=='meta' and n['attrs'].get('property')=='og:title'], 'canonical':[n['attrs'].get('href') for n in allnodes if n['tag']=='link' and n['attrs'].get('rel')=='canonical'], 'fields':fields,'links':links,'countries':countries,'history':history}))
