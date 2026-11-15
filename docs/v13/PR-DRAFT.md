# v13.5: 글자·우주·동물·영어 그림 선택·연속 미로 개선

기존 학습 화면이 세로 중앙에 작게 모이고, 우주/동물 게임은 이모지와 평면 도로를 사용했습니다. 글자 격자와 예시 카드를 화면에 맞춰 배치하고, 전용 우주 가로/세로 배경·행성 선택지, 숲길·쪼이 차량·동물 삽화를 적용합니다. 새 원본 작화 13개와 출처/투명 보정/실제 화면 증거를 보존합니다.

영어 쓰기는 CAT 문자 대신 고양이 그림을 눌러 소문자 c→a→t→전체 cat을 연습합니다. 대/소문자 알파벳과 숫자 수업은 유지하며 판정 기준을 바꾸지 않습니다. 미로는 칸 중심 점프를 없애고 손가락의 연속 궤적과 쪼이 이동을 연결합니다. 벽 통과/건너뛰기를 막고, 그린 길에서 재개하며 도착과 완료 기록을 유지합니다. 타이머로 판이 밀리거나 가로 화면의 버튼이 잘리던 문제를 함께 고쳤습니다.

검증: 실제 미로 80개 한 번의 연속 드래그 완주, 내/외부 벽 차단·비중심 좌표·재개·저장, native touch 입력, 고양이 선택 후 실제 전체 cat 쓰기/빈 입력 거부, 38개 글자 예시 그림, 우주/동물 20문제의 오답 차단/완료/기기 TTS 호출 0회. 기존 엄격한 쓰기·구조·5분 검사 13개와 Chrome 72개 렌더링 검사 통과. 20개 경로/크기 화면과 추가 실제 작동 화면을 확인했습니다. 전체 489개 삽화/825개 음원 무결성과 오프라인 포함도 확인했습니다.

![글자 만나기](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/learning-refresh/final/mobile-0.webp)
![우주](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/learning-refresh/final/mobile-1.webp)
![동물 여행](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/learning-refresh/final/mobile-2.webp)
![실제 자유 곡선 미로](https://raw.githubusercontent.com/cgy0450-ux/hangul-starland/v13/02-offline-query-navigation/docs/v13/learning-refresh/maze-freehand-mobile.webp)

물리 Android/iPad와 사람의 음질 평가는 미실시입니다. 무료 내장 이미지 생성과 기존 환경의 로컬 음성 모델을 사용했으며 유료 API는 없습니다. PR 권한 제한으로 이 초안을 보존하고 기존 브랜치의 커밋/푸시 및 검증 후 반영을 진행합니다.
