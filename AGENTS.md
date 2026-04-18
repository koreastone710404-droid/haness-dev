# AGENTS.md

이 저장소에서 작업하는 AI 코딩 에이전트의 **역할, 책임, 핸드오프 규칙**을 정의합니다. 프로젝트 전반적인 안내는 [CLAUDE.md](CLAUDE.md)를 먼저 읽으세요. 하네스 설계 철학은 [SKILL.md](SKILL.md)를 참고합니다.

## 원칙

1. **사람은 방향, 에이전트는 실행.** 목표·제약·검증 기준은 사람이 정한다. 구현 세부는 에이전트가 책임진다.
2. **저장소가 단일 진실 원천.** 결정 근거를 저장소 밖(Slack, 채팅 로그)에만 두지 않는다.
3. **불변식은 코드로 강제.** 규칙은 테스트·린트·스크립트로 옮긴다.
4. **실패는 기록 가능한 피드백으로.** 반복된 실수는 문서·테스트·스크립트에 반영해 다음 세션에서 재발하지 않게 한다.

## 에이전트 역할

### 구현 에이전트 (기본 역할)
- 기능 추가, 버그 수정, 리팩터링
- 작업 전 [CLAUDE.md](CLAUDE.md)의 "디렉터리 책임"과 "의존 방향"을 확인
- 변경 후 반드시 관련 테스트 실행 (아래 "검증 루프" 참고)

### 검토 에이전트
- 코드 리뷰, 스키마 일관성 점검
- [CODE_STYLE.md](CODE_STYLE.md) 규칙 기계적 확인
- 의존 방향 위반 탐지 (`src/logic/`이 React/Three.js import하면 실패)

### 감사 에이전트
- 하네스 자체를 점검 ([SKILL.md](SKILL.md) Phase 1 "현황 감사")
- 반복되는 실패 패턴 3개 이상 발견 시 이 문서나 CLAUDE.md에 반영

## 책임 경계

| 에이전트가 한다 | 사람이 한다 |
|---|---|
| 코드 구현 | 목표·우선순위 설정 |
| 테스트 작성 | 검증 기준 정의 |
| 문서 갱신 | 아키텍처 결정(ADR) |
| 린트·빌드 실행 | 외부 API 키 발급 |
| PR 초안 작성 | 최종 승인·병합 |
| 캡처·리포트 생성 | 법규 해석 확정 |

## 핸드오프 규칙

### 세션 시작 시
1. [CLAUDE.md](CLAUDE.md) 읽기
2. 관련 도메인 문서 읽기 ([다음단계 진행계획서.txt](다음단계%20진행계획서.txt), 필요 시 [SKILL.md](SKILL.md))
3. 최근 커밋(`git log -10`)으로 직전 작업 확인
4. 작업 목표·성공 기준을 사용자와 합의 후 착수

### 세션 종료 시
- 변경 사항을 **구조 변경 + 검증 방법 + 남은 리스크** 형식으로 보고
- 테스트 추가 여부 명시
- 반복 실패 패턴 발견 시 이 문서나 CLAUDE.md에 반영 제안

### 세션 간 전달
- 세션 종료 전 `git status`로 미커밋 변경 확인
- 중간 결정은 구두가 아니라 문서 또는 커밋 메시지로 남긴다
- "이것은 이 세션에서만 유효한 임시 규칙"은 만들지 않는다

## 불변식 (Invariants)

다음 규칙은 **코드로 강제**된다. 위반 시 테스트·빌드·린트가 실패해야 한다.

### I1. 레이어 의존 방향
```
App.jsx → components/ → logic/
```
- `src/logic/**` 안에서 `react`, `three`, `@react-three/*` import 금지
- `src/components/**`는 `src/logic/**`의 순수 함수만 호출

### I2. envelope 반환 shape 고정
`calculateEnvelope`의 반환 키는 UI와 테스트 양쪽이 의존. 키 추가는 허용, 기존 키 제거·이름 변경 시 다음을 모두 갱신해야 한다:
- [src/components/Scene3D.jsx](src/components/Scene3D.jsx)
- [src/components/InputForm.jsx](src/components/InputForm.jsx)
- [tests/envelope.test.mjs](tests/envelope.test.mjs)
- [tests/runtime.test.mjs](tests/runtime.test.mjs)

### I3. 법정 기본값
용도지역 프리셋 값은 「국토의 계획 및 이용에 관한 법률」 시행령 §84·§85 법정 최대치 기준. 지자체 조례값은 **별도 presets로 분리**해서 추가하고 법정값을 덮어쓰지 않는다.

### I4. 정북일조권 계산식
`setback = max(0, (floorTopHeight - threshold) × 0.5)`
- threshold 기본 10m (법정), 서울 조례 9m
- `SUNLIGHT_SLOPE = 0.5`는 상수로 유지

### I5. 법령 데이터 — md와 js 동시 수정
용도지역·일조권 기준값은 두 파일에 각각 존재한다.
- **사람 참고용**: [docs/references/korean-zoning-defaults.md](docs/references/korean-zoning-defaults.md)
- **기계 판독용**: [src/data/zoning-defaults.js](src/data/zoning-defaults.js)

규칙:
- 법령 개정 시 **두 파일을 같은 커밋에서 함께** 수정한다.
- md의 모든 수치는 js에 1:1로 반영되어야 한다 (예: 중심상업 FAR 1,500% ↔ `{ far: 1500 }`).
- 새 용도지역 추가 시 md 표와 js `ZONE_CATEGORIES`에 동일 순서로 추가.
- 컴포넌트(InputForm, Scene3D 등)는 값을 인라인 하드코딩하지 말고 반드시 `zoning-defaults.js`에서 import한다.
- md 하단 "변경 이력" 표에 날짜·변경내용·근거 법령을 추가한다.

## 검증 루프

구현 후 반드시 아래 순서로 검증한다.

```bash
# 1. 로직 단위 테스트
node tests/envelope.test.mjs

# 2. 빌드 성공 확인
npm run build

# 3. UI 변경 시 런타임 테스트 (dev 서버 선행 실행 필요)
npm run dev &
node tests/runtime.test.mjs
```

실패 시:
- 어떤 assertion이 실패했는지 출력에서 파악
- 실패를 **문서·코드·테스트 중 어느 층에서 고칠지** 판단 ([SKILL.md](SKILL.md) "판단 규칙" 참고)
- 같은 실패가 두 번 이상 반복되면 테스트 케이스나 규칙을 추가

## 금지 사항

- `--no-verify`, `--no-gpg-sign`으로 훅 우회 (사용자가 명시 요청한 경우 제외)
- `git reset --hard`, `git push --force` 등 파괴적 명령 사용자 승인 없이 실행
- `src/logic/` 안에 React/Three.js import 추가
- 사용자 승인 없는 의존성 추가·업그레이드·다운그레이드
- 테스트 없이 envelope 반환 shape 변경
- 법정 기본값을 지자체 값으로 덮어쓰기

## 에이전트를 위한 빠른 체크리스트

작업 시작 전:
- [ ] CLAUDE.md 읽었나?
- [ ] 변경 대상 디렉터리 책임 확인했나?
- [ ] 의존 방향 위반 여부 점검했나?

작업 중:
- [ ] 구현 전 테스트 기대값을 먼저 정했나?
- [ ] 새 규칙이 생겼다면 코드로 강제할 방법을 검토했나?

작업 종료:
- [ ] 단위 테스트 실행했나?
- [ ] 빌드 성공하나?
- [ ] UI 변경 시 런타임 테스트 실행했나?
- [ ] 반복 실패 패턴을 발견했다면 문서·테스트에 반영했나?
- [ ] 남은 리스크·다음 개선 단위를 보고했나?
