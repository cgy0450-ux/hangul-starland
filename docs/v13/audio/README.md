# v13.4 무료 AI 음원 제작·적용

기기 TTS 설정 변경에 그치지 않고, 한국어 문장을 공개 모델로 로컬 합성해 MP3로 배포한다. API 키·무료 체험 크레딧·유료 구독·과금형 TTS 서버를 사용하지 않았다. CPU 추론은 기존 클라우드 작업 환경에서 실행했다. 앱은 정적 MP3만 재생하며 모델 실행이나 합성 API 요청을 하지 않는다.

## 조사와 이용 조건

- [Supertonic 공식 소스/라이선스 안내](https://github.com/supertone-oss-archive/supertonic#license): 한국어를 포함한 다국어 로컬 ONNX 추론. 코드 MIT, 모델은 상위 README에 OpenRAIL-M으로 명시되어 있다. 코드가 MIT라는 이유로 모델도 MIT라고 추정하지 않는다. 모델 라이선스의 용도 제한을 준수해 일반 유아 교육·안내 음원을 생성하며, 모델 가중치는 앱/저장소에 배포하지 않는다. 공개 모델 사용·음원 제작에 별도 사용료나 계정 가입이 필요하지 않다.
- 실제 모델은 [sherpa-onnx 공식 TTS 배포본](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models)의 `sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2`를 사용했다. 동봉 LICENSE는 MIT 표기이며 별도 보존했다. 상위 README의 모델 라이선스 표기도 함께 보존한다. 모델/코드 라이선스와 생성 결과물의 권리를 혼동하지 않는다.
- [MeloTTS](https://github.com/myshell-ai/MeloTTS)는 한국어와 CPU 실행을 지원하고 코드 MIT/상업·비상업 무료를 안내한다. 이번 구현에는 더 작은 ONNX Supertonic 배포본을 선택했다. Melo의 가중치·음원을 사용하지 않았다.
- Hugging Face 직접 접근은 이 환경에서 CONNECT 403이었다. 별도 공개된 공식 sherpa-onnx GitHub 배포본을 사용했다. 차단된 도메인의 프록시/우회 다운로드를 사용하지 않았다.
- 생성 음원은 사전 제공 음색(speaker ID 8)을 사용하며 가족·유명인 등 실존 인물의 목소리를 복제하지 않는다. 앱에 코드/모델을 포함하지 않지만 출처와 라이선스 고지를 함께 보존한다.

## 실제 제작 범위

`assets.json`에 693개 MP3의 합성 문장·용도·길이·파일 크기·SHA-256을 기록했다. 동화 20편의 200개 장면을 모두 포함한다. 주요 게임 안내·칭찬·낱말·단계 쓰기 문장과 지원 문구를 추가했다. 모든 지원 문구가 현재 화면에서 호출되는 것은 아니다. 영어·개인화된 이름·미제작 동적 문장은 기기 TTS로 보조하며 전체 앱의 모든 문장을 변환했다고 주장하지 않는다.

모델 설정: Supertonic 3 int8, CPU, 2 threads, ko, speaker 8, 8 steps, speed 1.05. MP3 mono 24kHz/64kbps. 실제 음원 합계 20,681,244 bytes, 약 42.7분. 모델은 `/workspace/joiland-tts`에만 보존하며 공개 앱은 약 20.7 MB의 생성 음원을 추가한다. 이는 실제 모바일 통신 속도 측정이 아니다.

재현:

```sh
node qa/audio/corpus.cjs
PYTHONPATH=/workspace/joiland-tts/python python3 qa/audio/generate.py --model-dir /workspace/joiland-tts/sherpa-onnx-supertonic-3-tts-int8-2026-05-11
python3 qa/audio/audit.py
node qa/audio/adapter.cjs
node qa/audio/integrity.cjs
python3 qa/audio/browser.py
python3 qa/audio/offline.py
```

준비물은 공개 `sherpa-onnx`, `soundfile`, ffmpeg 및 위 모델이다. 모델/API를 앱에 설치하지 않는다. 생성기는 이미 유효한 음원을 재사용한다. 기존 배포 음색을 변경할 때에는 새 파일 이름/캐시 버전을 사용하고 출처·해시를 갱신한다.

## 검증과 한계

- 693개 전부 ffprobe 길이 확인, ffmpeg 실제 디코딩, 해시·오프라인 포함 검사. 모든 200개 동화 장면의 실제 텍스트와 음원 연결 확인.
- 실제 모바일/태블릿 크기 Chrome에서 MP3 시간이 진행됨을 확인하고, 동화에는 기기 TTS 호출이 없음을 검사했다. 일시정지·이어듣기·페이지 취소·자동 넘김·음소거·책장 복귀, 보호자 미리듣기·모드 보존 검사.
- 플레이어 하나를 재사용해 자동 넘김 시 재생 권한과 중복 재생 문제를 줄였다. 취소한 음원의 종료 콜백으로 다음 장이 열리지 않는다. 테스트 초기에 Playwright가 저장한 콜백 표현식을 자동 실행해 생긴 거짓 종료는 명시적 함수 래퍼로 고쳤다. 검사 조건을 낮추지 않았다.
- 전체 캐시 설치 뒤 네트워크를 끄고 20번째 책 두 장의 MP3를 실제 재생했다. Safari용 Range 요청을 서비스워커에서 처리하고, 206/구간 길이/접미 구간/잘못된 416 응답을 확인했다. 이것을 물리 Safari 테스트로 표시하지 않는다.
- Whisper tiny 기계 전사 참고 자료는 `asr-spot-check.json`에 그대로 보존한다. '쪼이'와 일부 단어의 전사가 일치하지 않아 정확한 발음·자연스러움이 검증됐다는 증거로 사용하지 않는다. 사람의 실제 청취 평가, 물리 iPad/Android 음질 평가는 미실시다.
- `voice-preview.html`에서 배포한 실제 인사말과 동화 음원을 직접 들을 수 있다. 보호자 화면에서 새 AI 음원 사용을 끄면 기기 TTS로 돌아간다. 이번 작업은 실제 파일 제작·재생 연결이며, 모든 문장에 대한 성우 수준 품질 승인으로 표시하지 않는다.
