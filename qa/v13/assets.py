"""Inventory existing art; validate deliberately registered future raster art.
No fallback generation, external requests, or application behavior changes.
"""
import argparse, collections, hashlib, json, re, subprocess
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/v13'

def inventory():
    items=[]
    for p in sorted(ROOT.iterdir()):
        if p.suffix not in ['.svg','.webp','.png']:continue
        raw=p.read_bytes(); row={'path':p.name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'provenance':'existing repository asset; creation history not independently verified','references':[]}
        if p.suffix=='.svg':
            row['viewBox']=re.search(r'viewBox="([^"]+)"',raw.decode()).group(1)
            row['symbols']=re.findall(r'<symbol[^>]*id="([^"]+)"',raw.decode())
        else:
            with Image.open(p) as im:row.update(width=im.width,height=im.height,mode=im.mode)
        for source in sorted(ROOT.iterdir()):
            if source.suffix in ['.html','.js','.css','.webmanifest'] and p.name in source.read_text():row['references'].append(source.name)
        items.append(row)
    return items

def validate(data):
    errors=[]; seen={}
    for item in data['planned']:
        if item['id'] in seen:errors.append('Duplicate semantic ID '+item['id'])
        seen[item['id']]=True
        if item['status']=='pending':
            if item['path'] is not None:errors.append('Pending item has a misleading file path: '+item['id'])
            continue
        if item['status']!='approved':errors.append('Unknown status: '+item['id']);continue
        p=(ROOT/item['path']).resolve()
        if not p.is_relative_to(ROOT) or p.suffix not in ['.png','.webp'] or not p.is_file():errors.append('Missing/invalid raster: '+item['id']);continue
        if not item.get('alt') or not item.get('provenance') or not item.get('reviewed'):errors.append('Missing semantic/visual/provenance review: '+item['id'])
        with Image.open(p) as im:
            if list(im.size)!=item.get('dimensions'):errors.append('Dimensions mismatch: '+item['id'])
        digest=hashlib.sha256(p.read_bytes()).hexdigest()
        if digest in seen:errors.append('Duplicate raster content: '+item['id']+' and '+seen[digest])
        seen[digest]=item['id']
        if p.name not in (ROOT/'sw.js').read_text():errors.append('Not in offline cache: '+item['id'])
    return errors

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--refresh-inventory',action='store_true');a=ap.parse_args()
    path=DOC/'asset-plan.json'
    if a.refresh_inventory:
        (DOC/'existing-assets.json').write_text(json.dumps(inventory(),ensure_ascii=False,indent=2)+'\n')
    data=json.loads(path.read_text()); errors=validate(data)
    if errors:raise SystemExit('\n'.join(errors))
    n=sum(x['status']=='approved' for x in data['planned'])
    print(f'PASS registry consistency: {len(data["planned"])} planned; {n} approved; {len(data["planned"])-n} pending. This is NOT artwork completion.')
if __name__=='__main__':main()
