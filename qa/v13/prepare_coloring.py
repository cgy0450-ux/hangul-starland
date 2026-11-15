"""Technical atlas export and connected-region masks; preserves original generated artwork."""
import json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageOps,ImageFilter
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[2]
sheets=[('exec-265f9bcf-6482-46c8-b802-05158f8a18ed.png',615,690,['joyi','fire','police','bus']),('exec-b0cd487a-ff87-48f6-bf52-df7b699b28a9.png',623,640,['convertible','dino','rabbit','puppy'])]
names=['쪼이 호랑이','소방차','경찰차','마을 버스','쪼이 오픈카','트리케라톱스','당근 토끼','강아지'];items=[]
for source,sx,sy,ids in sheets:
 im=Image.open('/workspace/generated_images/'+source).convert('RGB');w,h=im.size
 for box,id in zip([(0,0,sx,sy),(sx,0,w,sy),(0,sy,sx,h),(sx,sy,w,h)],ids):
  crop=im.crop(box);ink=crop.convert('L').point(lambda v:255 if v<140 else 0);crop=crop.crop(ink.getbbox());crop.thumbnail((672,672),Image.Resampling.LANCZOS);canvas=Image.new('RGB',(768,768),'white');canvas.paste(crop,((768-crop.width)//2,(768-crop.height)//2));path=ROOT/f'assets/v13/coloring.{id}.webp';canvas.save(path,lossless=True,method=6)
  barrier=np.asarray(canvas.convert('L'))<200;barrier=ndimage.binary_dilation(barrier,iterations=1);labels,n=ndimage.label(~barrier);outside=set(np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]])));sizes=np.bincount(labels.ravel());mask=np.zeros_like(labels,dtype=np.uint16);regions=[]
  for k in range(1,n+1):
   if k in outside or sizes[k]<100:continue
   rid=len(regions)+1;part=labels==k;mask[part]=rid;distance=ndimage.distance_transform_edt(part);y,x=np.unravel_index(np.argmax(distance),distance.shape);regions.append({'id':rid,'x':int(x),'y':int(y),'pixels':int(sizes[k]),'radius':round(float(distance[y,x]),1)})
  rgb=np.zeros((768,768,3),np.uint8);rgb[:,:,0]=mask%256;rgb[:,:,1]=mask//256;Image.fromarray(rgb).save(ROOT/f'assets/coloring/{id}.mask.png')
  items.append({'id':id,'name':names[len(items)],'art':f'./assets/v13/coloring.{id}.webp','mask':f'./assets/coloring/{id}.mask.png','regions':regions,'source':source})
  print(id,len(regions),sum(r['pixels'] for r in regions))
(ROOT/'coloring-data.js').write_text('window.JoyiColoringSheets='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'docs/v13/coloring/generation.json').write_text(json.dumps({'tool':'built-in image_gen','sheets':sheets,'reference':'original JoYi embedded raster','export':'Tight crop and white padding to 768px, lossless WebP; threshold/dilation only for technical region masks, not redrawn art','licensing':'Original commissioned generated subjects only. No licensed third-party character used; branded requests held pending permission evidence.','items':items},ensure_ascii=False,indent=2)+'\n')
