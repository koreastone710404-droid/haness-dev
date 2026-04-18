# Contributing to Haness Engineering

감사합니다! 이 문서는 `Haness Engineering` 팀의 협업 규칙과 기여 방법을 안내합니다.

## 문서 참조

### 에이전트로 작업한다면 먼저
- [CLAUDE.md](CLAUDE.md) — 저장소 루트 가이드 (필수)
- [AGENTS.md](AGENTS.md) — 에이전트 역할·불변식·검증 루프
- [SKILL.md](SKILL.md) — 하네스 엔지니어링 skill 정의

### 사람 기여자 표준
- [Haness engineering skill.md](Haness%20engineering%20skill.md) — 팀 엔지니어링 철학, 프로세스, 역할 및 책임
- [CODE_STYLE.md](CODE_STYLE.md) — 코드 스타일, 네이밍, 테스트 및 린트 규칙
- [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) — PR 작성 템플릿 및 검증 체크리스트

## 기여 절차

1. 작업할 이슈를 선택하거나 새로운 이슈를 등록합니다.
2. 브랜치를 생성합니다. 예: `feature/<요약>` 또는 `fix/<이슈번호>`.
3. 로컬 개발 환경을 설정하고 의존성을 설치합니다.
4. `CODE_STYLE.md`를 참고하여 코드를 작성합니다.
5. 필요한 테스트를 추가하거나 수정합니다.
6. `PULL_REQUEST_TEMPLATE.md`를 참고하여 PR을 작성합니다.
7. 리뷰 요청 전에 반드시 린트와 포맷 도구를 실행합니다.

## 환경 설정

### Node.js 환경

```bash
npm install
```

### Python 환경

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Windows CMD
.\.venv\Scripts\activate.bat
# macOS / Linux
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
```

### 참고

- 프로젝트에 따라 필요한 의존성 파일(`package.json`, `requirements.txt`)이 있는지 확인합니다.
- Python 가상환경 사용은 개발 환경 일관성을 위해 권장됩니다.

## PR 작성 기준

- PR 제목과 요약은 간결하고 명확하게 작성합니다.
- 변경 사항과 검증 방법을 구체적으로 기재합니다.
- 관련 이슈 번호를 포함합니다.
- 문서, 주석, 테스트가 필요한 경우 함께 업데이트합니다.

## 커뮤니케이션

- 변경 내용이나 결정 사항은 PR 설명에 명확히 남깁니다.
- 리뷰어가 필요한 경우 구현 의도와 검증 결과를 함께 전달합니다.
- 피드백은 구체적이고 건설적으로 제공합니다.

## 기타

- `Haness Engineering` 팀 내에서 추가 표준이 생기면 이 문서를 업데이트합니다.
- 새로운 도구, 규칙, 워크플로우는 팀 합의를 거쳐 반영합니다.
