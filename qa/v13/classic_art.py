import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/workspace/joiland-tools/bin/google-chrome',args=['--no-sandbox']);page=b.new_page()
 def intercept(route):
  response=route.fetch();body=response.text().replace('var el=id=>','window.JoyiAcademyAudit={generate,games};var el=id=>');route.fulfill(response=response,body=body)
 page.route('**/academy.html*',intercept);page.goto('http://127.0.0.1:8000/academy.html?subject=science')
 rows=page.evaluate("""()=>{const seg=new Intl.Segmenter('ko',{granularity:'grapheme'}),rows=[];for(const subject of ['math','science','english','history','coding'])for(let game=0;game<10;game++){if(JoyiAcademyAudit.games[subject][game].route)continue;for(const q of JoyiAcademyAudit.generate(subject,game)){const tokens=[...seg.segment(q.visual)].map(x=>x.segment).filter(x=>/\\p{Extended_Pictographic}/u.test(x));rows.push({...q,subject,game,unsupported:tokens.filter(t=>!JoyiArt.MAP[t]),scene:JoyiSceneCatalog?.find(subject,q.answer,q.visual)||null})}}return rows}""")
 for r in rows:
  if r['unsupported']:
   assert all(t in ['➡️','⬅️','⬆️','⬇️'] for t in r['unsupported']) or r['scene'] or r['answer'] in ['투호','짚신'],r
 b.close()
(ROOT/'docs/v13/scene-audit/classic-questions.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print(len(rows),'classic questions; unsupported:',sorted({t for r in rows for t in r['unsupported']}))
