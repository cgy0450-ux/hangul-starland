## 변경 내용
v13 리뉴얼의 실제 기준선과 전용 래스터 자산 제작 준비를 추가합니다. 54개 대상×4화면 크기의 실제 캡처 216장, 현존 이미지 25개와 SVG symbol 목록, 게임/과목/동화 장면 221개의 미제작 계획 및 검증기가 포함됩니다. 신규 생성·승인 삽화는 0개이며 그래픽 리뉴얼 완료 PR이 아닙니다.

추가 동작 검사에서 발견한 기존 결함을 수정합니다. 오프라인에서 `journey.html?subject=math`를 열면 기존에는 홈 HTML로 fallback했으나, 이제 캐시된 학습관 HTML을 사용하여 쿼리에 해당하는 수학 학습관을 렌더링합니다. 서비스워커 캐시 버전을 갱신했습니다. 원본 쪼이, 저장 스키마, 게임/획쓰기/타이머는 변경하지 않습니다.

## 검증
- PASS 기존 smoke 및 Chrome 67개 렌더링 검사
- PASS 216개 캡처에서 페이지/HTTP 오류·가로 넘침 0 (미적 완성 또는 전체 게임 완주를 의미하지 않음)
- PASS 동화 200장과 이전 이동 20편, 51개 캐시 요청 및 오프라인 쿼리 경로 4개
- PASS 실제 v12→v13 워커 업그레이드·구캐시 제거 후 오프라인 수학 경로
- PASS 자산 검증기의 부정 테스트 6개. 221개 pending이며 승인 이미지 0개
- 수정 전 실패 증거: docs/v13/baseline/behavior-before.json

## 실제 화면
기준선:
![태블릿 홈](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/baseline/tablet-index.webp)
수정 후 오프라인 수학 학습관:
![오프라인 모바일](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/offline-math-mobile.webp)

## 미완료
내장 이미지 생성 도구는 목록에 있지만 추가 비용 여부가 보장되지 않아 사용자 비용 금지 조건에 따라 호출하지 않았습니다. 전용 신규 래스터 제작, 모든 장면의 시각 검수, 음성 품질·5분 타이머·게임 완주 검증은 남아 있습니다. 배포/병합/환경 게시는 수행하지 않습니다. 자세한 상태는 V13-STATUS.md 및 docs/v13/README.md를 참조하세요.
