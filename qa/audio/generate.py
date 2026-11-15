import sys,time,json,hashlib,subprocess,argparse
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--model-dir',required=True);args=parser.parse_args()
import sherpa_onnx,soundfile as sf
D=Path(args.model_dir)
model=sherpa_onnx.OfflineTtsSupertonicModelConfig(**{k:str(D/v) for k,v in {'duration_predictor':'duration_predictor.int8.onnx','text_encoder':'text_encoder.int8.onnx','vector_estimator':'vector_estimator.int8.onnx','vocoder':'vocoder.int8.onnx','tts_json':'tts.json','unicode_indexer':'unicode_indexer.bin','voice_style':'voice.bin'}.items()})
tts=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(supertonic=model,num_threads=2,provider='cpu')))
cfg=sherpa_onnx.GenerationConfig();cfg.sid=8;cfg.num_steps=8;cfg.speed=1.05;cfg.extra['lang']='ko'

ROOT=Path(__file__).resolve().parents[2];rows=json.loads((ROOT/'docs/v13/audio/corpus.json').read_text());manifest={};start=time.time()
for i,row in enumerate(rows):
 text=row['text'];name=hashlib.sha256(text.encode()).hexdigest()[:20]+'.mp3';out=ROOT/'assets/audio'/name
 valid=False
 if out.exists():
  check=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(out)],capture_output=True,text=True)
  valid=check.returncode==0 and float(check.stdout.strip() or '0')>.15
 if not valid:
  audio=tts.generate(text,cfg)
  if len(audio.samples)<audio.sample_rate*.15:raise ValueError(text)
  wav=Path('/tmp/joiland-tts-render.wav');sf.write(wav,audio.samples,audio.sample_rate)
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-ac','1','-ar','24000','-codec:a','libmp3lame','-b:a','64k',str(out)],check=True)
 manifest[text]='./assets/audio/'+name
 if i%10==0:print(i,len(rows),round(time.time()-start),flush=True)
(ROOT/'audio-manifest.js').write_text('window.JoyiAudioClips='+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
print('DONE',len(manifest),round(time.time()-start),flush=True)
