# v13.2: 독자 도안 8종의 쪼이 색칠공방

기존 색칠 활동은 한글 획순 쓰기여서 그림 전체를 칠할 수 없었습니다. 기존 수업을 유지하고 놀이터의 열두 번째 놀이로 독립 색칠공방을 추가합니다. 쪼이·소방차·경찰차·마을 버스·오픈카·공룡·토끼·강아지 도안과 별도 3D 공방 장면을 내장 이미지 도구로 제작했습니다.

영역 톡 채우기와 선 안에 머무는 손가락 색칠, 9색 팔레트, 붓 크기, 지우개, 되돌리기, 확인 후 다시 시작, 키보드 조작을 제공합니다. 그림은 새 로컬 저장 키에 자동 보존되며 완성 작품방·이어 칠하기·PNG 저장을 사용할 수 있습니다. 기존 점수·학습 기록과 글씨쓰기 설정은 보존합니다. 5분이 되면 한 번 트로피를 받고 색칠이 멈춥니다.

실제 검증:

- 8개 도안의 311개 전체 영역을 모바일 터치로 채움. 윤곽선·배경 변경 픽셀 0개
- 실제 touchStart/move/end로 선을 가로질러 그려도 시작 영역 밖 변경 0개, 지우개·정확한 되돌리기
- 작품방 미리보기·완성본 복원·새로고침 복원·PNG 다운로드(768px 실제 디코딩)·기존 데이터 보존
- 방향키/Enter 조작, 대화상자 중 시간 일시정지, 300초 전 보상 차단/정시 1회 지급
- 4개 화면 크기의 실제 Chrome 화면 확인, 좁은 휴대폰/태블릿 터치, 페이지 오류·이미지 실패·가로 넘침 없음
- Node smoke, Chrome 68개 페이지 검사, 476개 삽화 무결성/해시/치수와 오류 거부 검사
- 배포된 v13.1 → v13.2 캐시 교체(553 URLs), 완전 오프라인 그림·마스크 로딩/채우기/작품 저장. 기존 퀴즈·우주·차량과 설정 검사도 통과

![휴대폰 색칠공방](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/coloring/screens/mobile-0.webp)
![실제 손가락 색칠](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/coloring/verified/touch-brush-mobile.webp)
![작품방](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/coloring/verified/gallery-mobile.webp)

지정된 마리오/루이지·로보카폴리·타요는 이용 허락 근거가 없어 공개 도안에서 제외하고 보류했습니다. 독자 캐릭터/차량을 대안으로 제공하며 제휴를 암시하지 않습니다. 물리 iPad/Android와 한국어 음성 청취는 미검증입니다. PR API 제한으로 이 리뷰 초안을 보존하며, 기존 개발 브랜치 커밋·푸시와 사용자가 요청한 검증 후 서비스 반영을 계속합니다.
