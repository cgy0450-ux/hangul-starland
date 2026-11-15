import sys,time,json,hashlib,subprocess,argparse,ast,re
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--model-dir',required=True);parser.add_argument('--shard-index',type=int,default=0);parser.add_argument('--shard-count',type=int,default=1);parser.add_argument('--regenerate-new',action='store_true');parser.add_argument('--reuse-existing',action='store_true',help='Reuse files; full independent decode audit must run afterwards');args=parser.parse_args()
import sherpa_onnx,soundfile as sf
D=Path(args.model_dir)
model=sherpa_onnx.OfflineTtsSupertonicModelConfig(**{k:str(D/v) for k,v in {'duration_predictor':'duration_predictor.int8.onnx','text_encoder':'text_encoder.int8.onnx','vector_estimator':'vector_estimator.int8.onnx','vocoder':'vocoder.int8.onnx','tts_json':'tts.json','unicode_indexer':'unicode_indexer.bin','voice_style':'voice.bin'}.items()})
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(supertonic=model,num_threads=2,provider='cpu')))
cfg=sherpa_onnx.GenerationConfig();cfg.sid=8;cfg.num_steps=8;cfg.speed=1.05;cfg.extra['lang']='ko'

ROOT=Path(__file__).resolve().parents[2];rows=json.loads((ROOT/'docs/v13/audio/corpus.json').read_text());manifest={};start=time.time()
tracked=set(subprocess.check_output(['git','ls-files','assets/audio'],cwd=ROOT,text=True).splitlines()) if args.regenerate_new else None
for i,row in enumerate(rows):
 text=row['text'];name=hashlib.sha256(text.encode()).hexdigest()[:20]+'.mp3';out=ROOT/'assets/audio'/name
 manifest[text]='./assets/audio/'+name
 if i%args.shard_count!=args.shard_index:continue
 valid=False
 if out.exists() and (tracked is None or str(out.relative_to(ROOT)) in tracked):
  if args.reuse_existing:valid=out.stat().st_size>1024
  else:
   check=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out)],capture_output=True,text=True)
   valid=check.returncode==0 and float(check.stdout.strip() or '0')>.15
 if not valid:
  audio=tts.generate(text,cfg)
  if len(audio.samples)<audio.sample_rate*.15:raise ValueError(text)
  wav=Path('/tmp/joiland-tts-render-'+str(args.shard_index)+'.wav');sf.write(wav,audio.samples,audio.sample_rate)
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-ac','1','-ar','24000','-codec:a','libmp3lame','-b:a','64k',str(out)],check=True)
 if i%10==0:print(i,len(rows),round(time.time()-start),flush=True)
(ROOT/'audio-manifest.js').write_text('window.JoyiAudioClips='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
# Keep the offline cache synchronized with the exact generated corpus. This is
# mechanical: preserve all non-audio URLs and replace only generated MP3 URLs.
worker=ROOT/'sw.js';source=worker.read_text();match=re.search(r'const CORE = (\[.*?\]);',source)
if not match:raise RuntimeError('service worker CORE not found')
core=ast.literal_eval(match.group(1));core=[url for url in core if not url.startswith('./assets/audio/')]
insert=next((i for i,url in enumerate(core) if not url.startswith('./audio-')),4)
core[insert:insert]=list(manifest.values())
source=source[:match.start(1)]+repr(core)+source[match.end(1):]
worker.write_text(source)
print('DONE',len(manifest),round(time.time()-start),flush=True)
