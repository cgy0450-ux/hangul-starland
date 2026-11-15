"""One-time deployment export optimization; original generated PNG outputs are retained separately."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
metadata=ROOT/'docs/v13/asset-plan.json'
if json.loads(metadata.read_text()).get('deploymentExport'):
 raise SystemExit('Deployment export already optimized. Use retained original source PNGs for a new export; do not repeatedly recompress WebP files.')
files=list((ROOT/'assets/v13').glob('*.webp'));before=sum(p.stat().st_size for p in files)
def export(p):
 im=Image.open(p);is_sprite=p.name.startswith('sprite.');im=im.convert('RGBA' if is_sprite else 'RGB')
 maximum=1280 if p.name.startswith(('subject.','game.','home.','background.')) else 1024
 if max(im.size)>maximum:im.thumbnail((maximum,maximum),Image.Resampling.LANCZOS)
 im.save(p,quality=86 if is_sprite else 84,method=6)
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(export,files))
p=ROOT/'docs/v13/asset-plan.json';data=json.loads(p.read_text())
for item in data['planned']+data['supporting']:
 file=ROOT/item['path']
 with Image.open(file) as im:item['dimensions']=list(im.size)
 item['sha256']=hashlib.sha256(file.read_bytes()).hexdigest();item['export']='WebP q86 for transparent sprites, q84 for scenes; scene max 1280px, story max 1024px, original source PNG retained'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
after=sum(p.stat().st_size for p in files);print(json.dumps({'beforeBytes':before,'afterBytes':after,'savedBytes':before-after}))
