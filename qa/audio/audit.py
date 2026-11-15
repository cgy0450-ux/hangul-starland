import hashlib,json,subprocess,concurrent.futures,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];manifest=json.loads((ROOT/'audio-manifest.js').read_text().split('=',1)[1].strip().rstrip(';'));rows=json.loads((ROOT/'docs/v13/audio/corpus.json').read_text());assert set(manifest)=={r['text']for r in rows};assert len(set(manifest.values()))==len(rows)
keep={ROOT/v.removeprefix('./')for v in manifest.values()};unused=Path('/workspace/joiland-tts/unused');unused.mkdir(exist_ok=True)
for file in (ROOT/'assets/audio').glob('*.mp3'):
 if file not in keep:shutil.move(str(file),unused/file.name)
sw=(ROOT/'sw.js').read_text()
def check(row):
 path=ROOT/manifest[row['text']].removeprefix('./');assert "'"+manifest[row['text']]+"'" in sw
 probe=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)],text=True);duration=float(probe);assert .15<duration<90,(path,duration)
 subprocess.run(['ffmpeg','-v','error','-threads','1','-i',str(path),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 return dict(row,path=str(path.relative_to(ROOT)),duration=round(duration,3),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:items=list(pool.map(check,rows))
result={'model':'Supertonic 3, int8 ONNX, released by Supertone; packaged by sherpa-onnx','modelArchive':'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2','provider':'CPU local, no paid API or key','speakerId':8,'language':'ko','numSteps':8,'speed':1.05,'clips':len(items),'storyScenes':sum(x['kind']=='story'for x in items),'bytes':sum(x['bytes']for x in items),'durationSeconds':round(sum(x['duration']for x in items),3),'items':items,'limitations':['No human listening approval or guarantee of subjective naturalness.','ASR spot-check is intelligibility evidence only, not a quality rating.','Unlisted dynamic/personalized sentences and English retain device speech.','Some indexed supporting phrases are retained for reuse.']};(ROOT/'docs/v13/audio/assets.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS',result['clips'],'decoded MP3s;',result['storyScenes'],'story scenes;',result['bytes'],'bytes')
