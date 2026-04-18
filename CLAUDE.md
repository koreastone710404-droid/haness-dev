# CLAUDE.md

이 파일은 AI 코딩 에이전트(Claude Code, Codex, Cursor, Copilot 등)가 이 저장소에서 작업할 때 읽는 **짧은 루트 가이드**입니다. 상세 규칙은 각 참조 문서로 분리되어 있으니, 작업 전 반드시 관련 문서를 먼저 확인하세요.

## 이 프로젝트가 하는 일

**건축 가능 영역(Building Envelope) 시각화 도구.**
토지 정보와 법정 규제(용도지역, 건폐율, 용적률, 정북일조권, 최고높이)를 입력하면 신축 가능한 최대 건물 부피를 3D로 즉시 렌더링합니다. 사업성 검토(Feasibility Study) 단계 단축이 목표입니다.

## 기술 스택

- **프론트엔드**: React 18 + Vite 5
- **3D**: three.js + @react-three/fiber + @react-three/drei
- **런타임**: 정적 SPA (서버 없음)
- **테스트**: Node `assert` + Puppeteer (E2E)

## 디렉터리 책임

| 경로 | 책임 | 금지 사항 |
|---|---|---|
| [src/logic/](src/logic/) | 순수 계산 로직 (envelope, 규제 적용) | React·Three.js import 금지 |
| [src/components/](src/components/) | React 컴포넌트 (UI, 3D 씬) | 계산 로직·법령 수치 하드코딩 금지 — `src/logic/`·`src/data/`에서 import |
| [src/data/](src/data/) | 법령 기반 정적 데이터 (용도지역 프리셋, 일조권 기준) | 로직·컴포넌트 코드 금지. md 참고표와 1:1 싱크 유지 |
| [src/App.jsx](src/App.jsx) | 상태 루트, 컴포넌트 조립 | 렌더링 세부 로직 금지 |
| [docs/references/](docs/references/) | 법령·정책 참고 문서 (사람 판독용) | 기계 판독 데이터 금지 — `src/data/`로 분리 |
| [tests/](tests/) | 단위(envelope.test.mjs) + 런타임(runtime.test.mjs) | 테스트끼리 서로 import 금지 |
| [screenshots/](screenshots/) | 수동 캡처 및 자동 캡처(capture.mjs) | 소스 코드 작성 금지 |

## 의존 방향 (절대 규칙)

```
App.jsx → components/ → logic/
```

- `logic/`은 React나 three.js를 절대 import하지 않는다.
- `components/`는 `logic/`의 순수 함수만 호출한다.
- 역참조는 금지.

## 주요 실행 경로

1. `npm install` — 의존성 설치
2. `npm run dev` — Vite dev 서버 (http://localhost:5173)
3. `npm run build` — 프로덕션 빌드
4. `node tests/envelope.test.mjs` — 로직 단위 테스트
5. `node tests/runtime.test.mjs` — UI 런타임 테스트 (dev 서버 실행 중이어야 함)
6. `node screenshots/capture.mjs` — 스크린샷 캡처 (dev 서버 실행 중이어야 함)

## 핵심 도메인 용어

| 용어 | 의미 |
|---|---|
| **건폐율 (BCR)** | 대지면적 대비 건축면적 비율 (%) |
| **용적률 (FAR)** | 대지면적 대비 연면적 비율 (%) |
| **Footprint** | 건물이 대지에 앉는 1층 평면 면적 |
| **Envelope** | 규제 후 신축 가능한 최대 건물 부피 |
| **정북일조권** | 북측 대지경계에서 기준 높이(법정 10m / 서울 9m) 초과분의 1/2 이격 |
| **Stepback** | 일조권·사선 규제로 상층부가 후퇴하는 단차 |

## 입력 스키마 (변경 금지)

`src/logic/envelope.js::calculateEnvelope(input)` 에 전달되는 input shape:

```ts
{
  siteWidth: number,     // 대지 폭 (동서, m)
  siteDepth: number,     // 대지 깊이 (남북, m)
  bcr: number,           // 건폐율 (%)
  far: number,           // 용적률 (%)
  maxHeightLimit: number,// 최고높이 제한 (m, 0=없음)
  roadSetback: number,   // 대지 안의 공지 (m)
  applySunlight: boolean,// 정북일조권 적용 여부
  sunlightThreshold: number, // 일조권 기준 높이 (10 또는 9)
  zone?: string,         // 용도지역 키 (프리셋 표시용)
}
```

반환 shape은 [src/logic/envelope.js](src/logic/envelope.js)의 `return` 블록 참고. 이 shape은 UI와 테스트가 모두 의존하므로 **테스트 없이 변경 금지**.

## 검증 기준 (PR 전 필수)

- [ ] `npm run build` 성공
- [ ] `node tests/envelope.test.mjs` 모든 케이스 통과
- [ ] UI 변경 시 `node tests/runtime.test.mjs` 통과
- [ ] 법규 관련 변경 시 [다음단계 진행계획서.txt](다음단계%20진행계획서.txt)의 참고 기준과 일치 확인

## 상세 문서 포인터

| 주제 | 문서 |
|---|---|
| 팀 엔지니어링 가이드 | [Haness engineering skill.md](Haness%20engineering%20skill.md) |
| 하네스(에이전트 환경) 설계 | [SKILL.md](SKILL.md) |
| 에이전트 역할·핸드오프 규칙 | [AGENTS.md](AGENTS.md) |
| 코드 스타일 | [CODE_STYLE.md](CODE_STYLE.md) |
| 기여 절차 | [CONTRIBUTING.md](CONTRIBUTING.md) |
| PR 템플릿 | [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) |
| 2단계 개발 계획 | [다음단계 진행계획서.txt](다음단계%20진행계획서.txt) |
| 용도지역 법정 최대치 (참고표) | [docs/references/korean-zoning-defaults.md](docs/references/korean-zoning-defaults.md) |
| 용도지역 프리셋 (기계 판독) | [src/data/zoning-defaults.js](src/data/zoning-defaults.js) |

## 에이전트를 위한 주의사항

- 이 문서는 **짧게** 유지한다. 상세 내용을 여기 적지 말고 각 문서에 둔다.
- 새 기능을 추가할 때 **디렉터리 책임**과 **의존 방향**을 먼저 확인한다.
- 법규 값(건폐율·용적률·일조권 등)은 [다음단계 진행계획서.txt](다음단계%20진행계획서.txt)의 참고표와 교차 검증한다.
- 실패 패턴이 반복되면 프롬프트가 아니라 이 문서·규칙·테스트를 고친다. ([SKILL.md](SKILL.md) "판단 규칙" 참고)
