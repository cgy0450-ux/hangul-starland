# v13: 쪼이 3D 삽화 221개 적용, 스무 편 동화와 게임 그래픽 리뉴얼

원본 쪼이의 얼굴·고글·스카프를 실제 참조해 내장 이미지 도구로 제작한 신규 삽화를 적용합니다. 게임 11개, 과목 10개, 동화 장면 200개의 본 삽화와 지원 그림 232개를 포함합니다. 출처·패널 추출·재수정 기록과 SHA-256/실제 화면 증거를 보존합니다. 단순 SVG·이모지·스톡 그림으로 새 삽화를 대체하지 않습니다.

홈과 학습/놀이터 카드는 큰 그림과 읽기 쉬운 위계로 정리했습니다. 실제 게임에는 투명 동물/물체, 일치하는 그림자, 구별되는 우주 대상과 공룡, 위에서 내려다본 자동차, 구조 차량·동물·소방 장소 12종을 사용합니다. 기존 물 게이지 갱신, 그림 위치 상속, 타이머 겹침 문제도 수정했습니다. 기존 게임/저장/선택 링크와 `word-gate.js`의 획 판정 조건은 보존합니다.

동화 20편의 도입·결말과 장면별 그림, 인물 연속성, 이해 질문, 음성 일시정지/이어듣기/반복·선택적 자동 넘김을 개선했습니다. 실제 기기 Web Speech를 사용하며 생성 음원은 추가하지 않습니다. 변신 중 인물 중복과 강아지의 귀가 후 결말은 재생성으로 수정했습니다.

검증:

- PASS Node smoke 및 실제 Chrome 67개 렌더링 검사
- PASS 453개 실제 WebP의 파일·해시·중복·오프라인 포함 검사와 Python 디코딩/치수 검사, 부정 사례 6개
- PASS 모바일/태블릿 동화 400장과 모든 책의 정답·오답 이해 활동
- PASS 13개 실제 조작 시나리오: 부분/마지막 획 누락 차단, 모든 획 통과, 전체 소방차 단어를 쓴 뒤 구조 저장, 물 소비와 연속 충전, 5분 시뮬레이션 등
- PASS 음성 상태/취소 경쟁 조건 검사 (API 대역 사용; 실제 청취는 미검증)
- PASS 오프라인 탐색·동화 그림 및 구버전 서비스워커의 실제 업그레이드/캐시 교체
- 실제 휴대폰·태블릿·좁은 휴대폰·가로 태블릿 화면 검수 기록 보존

실제 앱 화면:

![휴대폰 읽기](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/active-review/mobile-story-0.webp)
![실행 중 소방 구조](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/active-review/mobile-firetruck-rescue.html.webp)
![실제 학습 문제](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/active-review/mobile-lesson.webp)

실제 iPad/Android 터치·한국어 음성 청취, 전체 440개 학습과 모든 게임 상태 완주 및 배포는 미완료입니다. 개발 브랜치에만 커밋하며 프로덕션 main 병합·환경 게시를 수행하지 않습니다. GitHub PR API는 이전에 Forbidden을 반환했으므로 이 문서에 리뷰 본문을 보존합니다. 상세 증거는 V13-STATUS.md와 docs/v13/README.md를 참조하세요.
