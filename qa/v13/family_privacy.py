"""Audit the actual encrypted artifact without recording its key or story passages."""
import base64,hashlib,json
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
R=Path(__file__).resolve().parents[2];private=Path('/workspace/joyi-private');text=(private/'key.txt').read_text().strip();key=base64.urlsafe_b64decode(text+'=');blob=(R/'family-books.bin').read_bytes();assert blob[:5]==b'JOYI1';plain=AESGCM(key).decrypt(blob[5:17],blob[17:],None);books=json.loads(plain)['books'];assert len(books)==4 and all(len(b['pages'])==10 for b in books)
for candidate,cipher in [(bytes(32),blob[17:]),(key,blob[17:-1]+bytes([blob[-1]^1]))]:
 try:AESGCM(candidate).decrypt(blob[5:17],cipher,None);raise AssertionError('Unauthenticated ciphertext accepted')
 except InvalidTag:pass
for source in R.rglob('*'):
 if '.git' in source.parts or not source.is_file() or source.suffix not in ['.html','.js','.css','.md','.json','.py','.txt']:continue
 raw=source.read_bytes();assert text.encode() not in raw,str(source)
 if source!=R/'stories-additions.js':
  for book in books:assert book['pages'][0]['text'][:60].encode() not in raw,str(source)
audit=json.loads((private/'audit.json').read_text());report=dict(books=4,pages=40,illustratedScenes=sum(bool(p['image'])for b in books for p in b['pages']),illustrationsPending=sum(not p['image'] for b in books for p in b['pages']),actualDecodedAudioFiles=len(audit),audioSeconds=round(sum(x['duration']for x in audit),2),keyInPublicTextFiles=False,plaintextPassagesInPublicTextFiles=True,publicEditionAuthorized=True,publicEditionFile="stories-additions.js",wrongKeyAndTamperingRejected=True,ciphertextSHA256=hashlib.sha256(blob).hexdigest());report['distinctIllustrations']=len({p['image']for b in books for p in b['pages']});assert report['distinctIllustrations']==40;assert report['illustratedScenes']==40 and report['illustrationsPending']==0 and len(audit)==40
out=R/'docs/v13/family-reader';out.mkdir(exist_ok=True);(out/'privacy.json').write_text(json.dumps(report,indent=2)+'\n');print('PASS authenticated encryption, wrong-key/tamper rejection and no secret key or unauthorized plaintext outside the user-requested public edition')
