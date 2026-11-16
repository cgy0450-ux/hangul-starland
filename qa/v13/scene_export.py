"""Export reviewed scene atlases and register their exact question meanings."""
import ast,hashlib,json,re
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[2]
sources=json.loads((R/'docs/v13/scene-sources.json').read_text())
plan=json.loads((R/'docs/v13/asset-plan.json').read_text());batch_ids={s['id'] for s in sources};plan['supporting']=[r for r in plan['supporting'] if not any(r['id'].startswith('lesson.'+ident+'.') for ident in batch_ids)];known={r['id'] for r in plan['supporting']};rows=[]
for source in sources:
 im=Image.open(source['source']);w,h=im.size
 for i,q in enumerate(source['items']):
  ident='lesson.'+source['id']+'.'+str(i);path=R/'assets/v13'/(ident+'.webp');x=i%3;y=i//3
  a=im.crop((round(x*w/3)+7,round(y*h/2)+7,round((x+1)*w/3)-7,round((y+1)*h/2)-7));a.thumbnail((640,640));a.save(path,quality=88)
  if ident not in known:plan['supporting'].append(dict(id=ident,path=str(path.relative_to(R)),alt=q['explain'],status='approved',reviewed=True,dimensions=list(a.size),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),provenance='Built-in image_gen source '+Path(source['source']).name,reviewNote=source['review']));known.add(ident)
  rows.append(dict(subject=source['subject'],answer=q['answer'],visual=q['visual'],question=q['question'],path='./'+str(path.relative_to(R))))
(R/'docs/v13/asset-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
covers=json.loads((R/'docs/v13/scene-audit/story-covers.json').read_text());covers['우리나라']='./assets/v13/lesson.history-2.0.webp'
covers.update({'비의양':'./assets/v13/history.raingauge.webp','바람일으키기':'./assets/v13/lesson.history-1.2.webp','찧기':'./assets/v13/lesson.history-1.4.webp','실':'./assets/v13/history.spinning.webp','물':'./assets/v13/history.well.webp','밝혀주기':'./assets/v13/lesson.history-3.1.webp','천':'./assets/v13/history.fabric.webp'})
for answer,name in [('투호','tuho'),('짚신','jipsin'),('북','buk'),('공기놀이','gonggi'),('줄넘기','jumprope'),('왕관','royalcrown')]:covers[answer]='./assets/v13/history.'+name+'.webp'
code='window.JoyiSceneCatalog=(()=>{const rows='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';const covers='+json.dumps(covers,ensure_ascii=False)+";return {rows,find:(s,a,v)=>rows.find(r=>r.subject===s&&r.answer===a&&r.visual===v)?.path||(s==='history'?(rows.find(r=>r.subject===s&&r.answer===a)?.path||covers[a.replace(/\\s/g,'')]):null),byVisual:(s,v)=>rows.find(r=>r.subject===s&&r.visual===v)?.path};})();\n"
(R/'learning-scenes.js').write_text(code)
p=R/'sw.js';s=p.read_text();m=re.search(r'const CORE = (\[.*?\]);',s);core=ast.literal_eval(m[1]);core+=['./'+str(p.relative_to(R)) for p in (R/'assets/v13').glob('*.webp')]
for f in R.glob('*.html'):core+=re.findall(r'(?:src|href)="(\./[^" ]+\.(?:js|css)\?[^" ]+)"',f.read_text())
core=list(dict.fromkeys(core));s=s[:m.start(1)]+repr(core)+s[m.end(1):];s=re.sub(r"const CACHE = '[^']+'","const CACHE = 'hangul-starland-v13-8-scenes-20261116'",s);p.write_text(s)
print('Exported',len(rows),'real scene panels;',len(core),'offline URLs')
