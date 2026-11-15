"""Transcribe representative actual MP3s; evidence, not subjective quality approval."""
import sys,json
from pathlib import Path
sys.path.insert(0,'/workspace/joiland-tts/python')
import sherpa_onnx,soundfile as sf
ROOT=Path(__file__).resolve().parents[2];D=Path('/workspace/joiland-tts/sherpa-onnx-whisper-tiny')
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=str(D/'tiny-encoder.int8.onnx'),decoder=str(D/'tiny-decoder.int8.onnx'),tokens=str(D/'tiny-tokens.txt'),num_threads=1,language='ko',task='transcribe')
m=json.loads((ROOT/'audio-manifest.js').read_text().split('=',1)[1].strip().rstrip(';'));rows=[]
for term in ['강아지가 쉬러','신사임당은 식물','그림을 잘 그린 조선 시대 인물']:
 text=next(t for t in m if term in t);x,sr=sf.read(ROOT/m[text].removeprefix('./'));s=r.create_stream();s.accept_waveform(sr,x);r.decode_stream(s);rows.append({'expected':text,'recognized':s.result.text,'path':m[text]})
(ROOT/'docs/v13/audio/release-asr.json').write_text(json.dumps({'recognizer':'Whisper tiny int8, CPU, Korean','results':rows,'limit':'Machine transcription only; no human listening or subjective naturalness claim.'},ensure_ascii=False,indent=2)+'\n');print(rows)
