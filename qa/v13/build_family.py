"""Build authenticated encrypted family books; never write plaintext/key into the repo."""
import base64,json,os,hashlib,subprocess
from pathlib import Path
from PIL import Image
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
R=Path(__file__).resolve().parents[2];private=Path('/workspace/joyi-private');mapping=json.loads((private/'atlases.json').read_text());books=[];audit=[]
for source in sorted(private.glob('*.json'),key=lambda p:{'tiger':0,'spider':1,'poli':2,'mario':3}.get(p.stem,9)):
 b=json.loads(source.read_text())
 if 'pages' not in b:continue
 im=Image.open(mapping[b['id']]) if mapping[b['id']] else None;w,h=im.size if im else (0,0);pages=[]
 for i,text in enumerate(b['pages']):
  image=None
  if im:
   tile=im.crop((i%3*w//3+6,i//3*h//2+6,(i%3+1)*w//3-6,(i//3+1)*h//2-6));tile.thumbnail((650,650));image=private/(b['id']+'-'+str(i)+'.webp');tile.save(image,quality=90)
  sound=private/(b['id']+'-'+str(i)+'.mp3');subprocess.run(['ffmpeg','-v','error','-i',str(sound),'-f','null','-'],check=True,capture_output=True)
  duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(sound)],text=True));assert duration>5
  data=lambda p,mime:'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
  pages.append(dict(text=text,image=data(image,'image/webp') if image else None,audio=data(sound,'audio/mpeg'),alt=b['title']+' '+str(i+1)+'장'))
  audit.append(dict(book=len(books),page=i,duration=duration,imageBytes=image.stat().st_size if image else 0,audioBytes=sound.stat().st_size))
 books.append(dict(title=b['title'],pages=pages,question=b['question']))
assert len(books)==4 and len(audit)==24
keyfile=private/'key.txt';key=base64.urlsafe_b64decode(keyfile.read_text().strip()+'=') if keyfile.exists() else os.urandom(32)
keyfile.write_text(base64.urlsafe_b64encode(key).decode().rstrip('='));nonce=os.urandom(12);plain=json.dumps(dict(books=books),ensure_ascii=False,separators=(',',':')).encode();encrypted=AESGCM(key).encrypt(nonce,plain,None);assert AESGCM(key).decrypt(nonce,encrypted,None)==plain
out=R/'family-books.bin';out.write_bytes(b'JOYI1'+nonce+encrypted)
(private/'access-link.txt').write_text('https://cgy0450-ux.github.io/hangul-starland/family-stories.html#key='+keyfile.read_text())
(private/'audit.json').write_text(json.dumps(audit,indent=2)+'\n');print('PASS encrypted four books / 18 illustrated / 24 narrated scenes;',out.stat().st_size,'ciphertext bytes; SHA256',hashlib.sha256(out.read_bytes()).hexdigest())
