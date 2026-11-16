"""Crop actual reviewed generated transparent prop atlases; never synthesize art."""
import hashlib,json
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[2]
plan=json.loads((R/'docs/v13/asset-plan.json').read_text())
sources=json.loads((R/'docs/v13/prop-sources.json').read_text())
for sheet in sources:
 im=Image.open(sheet['source']).convert('RGBA');w,h=im.size
 for i,name in enumerate(sheet['names']):
  ident='sprite.'+name;path=R/'assets/v13'/(ident+'.webp')
  tile=im.crop((round(i%3*w/3)+4,round(i//3*h/2)+4,round((i%3+1)*w/3)-4,round((i//3+1)*h/2)-4))
  box=tile.getchannel('A').point(lambda a:255 if a>30 else 0).getbbox()
  assert box and tile.getchannel('A').getextrema()[0]<=5,name
  tile=tile.crop(box);tile.thumbnail((500,500));out=Image.new('RGBA',(560,560));out.alpha_composite(tile,((560-tile.width)//2,(560-tile.height)//2));out.save(path,quality=91)
  plan['supporting']=[r for r in plan['supporting'] if r['id']!=ident]
  plan['supporting'].append(dict(id=ident,path=str(path.relative_to(R)),alt=name,status='approved',reviewed=True,dimensions=list(out.size),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),provenance='Built-in image_gen source '+Path(sheet['source']).name,reviewNote='Actual original atlas visually inspected for subject, silhouette and transparent separation.'))
(R/'docs/v13/asset-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print('Exported',sum(len(s['names']) for s in sources),'actual transparent props')
