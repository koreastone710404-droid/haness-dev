# Haness Engineering

`Haness Engineering` 팀의 **건축 가능 영역(Building Envelope) 시각화 도구** 저장소입니다.
팀의 개발 표준 · 협업 지침 · 에이전트(AI 코딩 도우미) 운영 규칙을 함께 포함합니다.

## 주요 문서

### 에이전트 · 하네스
- [CLAUDE.md](CLAUDE.md) — AI 에이전트용 **루트 가이드** (이 저장소에서 작업 시 가장 먼저 읽기)
- [AGENTS.md](AGENTS.md) — 에이전트 역할·책임·핸드오프 규칙·불변식
- [SKILL.md](SKILL.md) — 하네스 엔지니어링 skill 정의 (에이전트 환경 설계 원칙)

### 팀 표준
- [Haness engineering skill.md](Haness%20engineering%20skill.md) — 팀 엔지니어링 가이드라인 및 개발 원칙
- [CODE_STYLE.md](CODE_STYLE.md) — 코드 스타일, 네이밍, 테스트, 린트 규칙
- [CONTRIBUTING.md](CONTRIBUTING.md) — 기여 절차
- [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) — PR 작성 템플릿

### 제품 계획
- [다음단계 진행계획서.txt](다음단계%20진행계획서.txt) — 2단계 개발 로드맵 및 법정 참고 기준

## 시작하기

1. 저장소를 클론합니다.
2. AI 에이전트로 작업한다면 먼저 [CLAUDE.md](CLAUDE.md)를 읽습니다.
3. 사람 기여자라면 [CONTRIBUTING.md](CONTRIBUTING.md)를 따릅니다.
4. 로컬 개발 환경을 설정합니다 (아래 `환경 설정`).
5. 코드 작성 시 [CODE_STYLE.md](CODE_STYLE.md) 준수.
6. PR 제출 시 [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) 사용.
7. 팀 원칙은 [Haness engineering skill.md](Haness%20engineering%20skill.md)에서 확인.

## 환경 설정

### Node.js 프로젝트

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/ 생성)
```

### 테스트

```bash
node tests/envelope.test.mjs   # 로직 단위 테스트
node tests/runtime.test.mjs    # UI 런타임 테스트 (dev 서버 실행 중이어야 함)
```

### 공통

- `README.md`, `CLAUDE.md`, `CODE_STYLE.md`, `CONTRIBUTING.md`를 먼저 확인합니다.
- 배포 설정은 `vercel.json` 참고.

## 파일 요약

- `SKILL.md`는 팀의 작업 방식, 개발 프로세스, 협업 규칙을 설명합니다.
- `CODE_STYLE.md`는 코드 품질과 일관성을 위한 세부 스타일 가이드입니다.
- `PULL_REQUEST_TEMPLATE.md`는 PR 작성 시 체크리스트와 필수 항목을 제공합니다.

## PR 템플릿 사용 방법

1. `PULL_REQUEST_TEMPLATE.md`를 열어 PR 설명에 포함할 내용을 확인합니다.
2. PR 제목은 변경 내용을 간결하게 표현합니다.
3. PR 본문에 `요약`, `변경 사항`, `검증 방법`, `관련 이슈`, `주의 사항` 항목을 모두 작성합니다.
4. 체크리스트 항목을 모두 확인하고 필요한 테스트 및 문서 업데이트를 완료합니다.
5. PR 제출 후 리뷰어가 쉽게 검토할 수 있도록 변경 의도를 명확히 작성합니다.

### PR 템플릿 샘플 문장

#### 1. 기능 추가 시나리오 (feat)

- 제목: `feat: 사용자 인증 모듈 추가`
- 요약: `JWT 기반 사용자 로그인/로그아웃 기능을 구현하고, 관련 테스트와 문서를 추가했습니다.`
- 변경 사항:
  - `src/auth/` 디렉토리 생성 및 `authService.js` 구현
  - `src/controllers/userController.js`에 `/login`, `/logout` 엔드포인트 추가
  - 데이터베이스 마이그레이션: `migrations/001_add_user_sessions.sql`
  - 단위 테스트: `tests/authService.test.js` (5개 테스트 케이스)
  - 통합 테스트: `tests/auth.integration.test.js` (3개 시나리오)
- 검증 방법:
  - `npm test` 실행하여 모든 테스트 통과 확인
  - 로컬 환경에서 로그인/로그아웃 시나리오 수동 테스트
  - QA 팀과 협의하여 E2E 테스트 시나리오 검토
  - DevOps 팀과 배포 환경에서 토큰 검증 확인
- 관련 이슈: `#123`
- 주의 사항:
  - 배포 전 환경 변수(`JWT_SECRET`) 설정 필요
  - 기존 세션 데이터 마이그레이션 계획 수립
  - 보안 감사 후 배포 권장

#### 2. 버그 수정 시나리오 (fix)

- 제목: `fix: 결제 API 타임아웃 오류 해결`
- 요약: `결제 처리 중 발생하던 타임아웃 오류를 수정하고 재시도 로직을 추가했습니다.`
- 변경 사항:
  - `src/services/paymentService.js`: 타임아웃 처리 및 재시도 로직 추가
  - `src/controllers/paymentController.js`: 에러 응답 개선
  - 테스트: `tests/paymentService.test.js`에 타임아웃 시나리오 추가
- 검증 방법:
  - `npm test` 실행 및 타임아웃 테스트 케이스 통과 확인
  - 결제 시뮬레이션에서 타임아웃 상황 재현 및 해결 확인
  - QA 팀의 회귀 테스트 완료
- 관련 이슈: `#234`
- 주의 사항:
  - 배포 전 캐시 무효화 및 데이터베이스 연결 풀 확인

#### 3. 리팩토링 시나리오 (refactor)

- 제목: `refactor: 사용자 데이터 처리 로직 최적화`
- 요약: `사용자 데이터 조회 및 캐싱 로직을 리팩토링하여 성능을 개선했습니다.`
- 변경 사항:
  - `src/services/userService.js`: 캐싱 전략 적용 및 쿼리 최적화
  - `src/utils/cache.js`: 새로운 캐시 유틸리티 추가
  - 기존 코드의 중복 제거 및 함수 분리
- 검증 방법:
  - `npm test` 실행 및 기존 테스트 유지 확인
  - 성능 벤치마크: 데이터 조회 속도 30% 개선 확인
  - QA 팀의 기능 회귀 테스트 완료
- 관련 이슈: `#345`
- 주의 사항:
  - 캐시 TTL 설정에 따른 메모리 사용량 모니터링 필요

#### 4. 문서 업데이트 시나리오 (docs)

- 제목: `docs: API 문서화 및 사용 예시 추가`
- 요약: `주요 API 엔드포인트에 대한 문서를 작성하고 사용 예시를 포함했습니다.`
- 변경 사항:
  - `docs/api/` 디렉토리 생성 및 엔드포인트별 문서 작성
  - `README.md`에 API 사용 가이드 추가
  - 코드 주석 개선 및 JSDoc 추가
- 검증 방법:
  - 문서 빌드 확인 및 링크 정상 작동 검증
  - 팀 리뷰를 통한 문서 정확성 확인
- 관련 이슈: `#456`
- 주의 사항:
  - 문서 배포 시 CDN 캐시 무효화 필요

### 기능 추가 시나리오 상세 코드 예시

#### 구현 전 코드 구조

```
src/
├── controllers/
│   └── userController.js
└── services/
    └── userService.js
```

#### 추가된 파일 및 코드

**src/auth/authService.js** (새 파일)

```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthService {
  constructor(userService, config) {
    this.userService = userService;
    this.jwtSecret = config.jwtSecret;
    this.saltRounds = config.saltRounds || 10;
  }

  async login(email, password) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: "24h" },
    );

    return { token, user: { id: user.id, email: user.email } };
  }

  async logout(token) {
    // 토큰 블랙리스트에 추가 (실제 구현에서는 Redis 등 사용)
    // 이 예시에서는 간단히 성공 반환
    return { success: true };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

module.exports = AuthService;
```

**src/controllers/userController.js** (수정)

```javascript
const AuthService = require("../auth/authService");

class UserController {
  constructor(userService, authService) {
    this.userService = userService;
    this.authService = authService;
  }

  // 기존 코드...

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const result = await this.authService.logout(token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
```

**tests/authService.test.js** (새 파일)

```javascript
const AuthService = require("../src/auth/authService");

describe("AuthService", () => {
  let authService;
  let mockUserService;
  let mockConfig;

  beforeEach(() => {
    mockUserService = {
      findByEmail: jest.fn(),
    };
    mockConfig = {
      jwtSecret: "test-secret",
      saltRounds: 10,
    };
    authService = new AuthService(mockUserService, mockConfig);
  });

  describe("login", () => {
    it("should return token and user data on successful login", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        passwordHash: await bcrypt.hash("password123", 10),
      };
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login("test@example.com", "password123");

      expect(result).toHaveProperty("token");
      expect(result.user).toEqual({ id: 1, email: "test@example.com" });
    });

    it("should throw error for non-existent user", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login("nonexistent@example.com", "password"),
      ).rejects.toThrow("User not found");
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", () => {
      const token = jwt.sign({ userId: 1 }, "test-secret");
      const decoded = authService.verifyToken(token);

      expect(decoded.userId).toBe(1);
    });

    it("should throw error for invalid token", () => {
      expect(() => authService.verifyToken("invalid-token")).toThrow(
        "Invalid token",
      );
    });
  });
});
```

#### 데이터베이스 마이그레이션 (migrations/001_add_user_sessions.sql)

```sql
-- 사용자 세션 테이블 추가
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token_hash)
);

-- 인덱스 추가로 성능 최적화
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 추가 샘플: 보안 패치 시나리오 (security)

- 제목: `security: SQL 인젝션 취약점 패치`
- 요약: `사용자 입력 검증을 강화하여 SQL 인젝션 공격을 방어했습니다.`
- 변경 사항:
  - `src/services/userService.js`: 파라미터화된 쿼리 적용
  - `src/middleware/security.js`: 입력 검증 미들웨어 추가
  - 보안 테스트: `tests/security.test.js` 추가
- 검증 방법:
  - `npm test` 실행 및 보안 테스트 통과 확인
  - OWASP ZAP 또는 Burp Suite로 취약점 스캔
  - 보안 팀의 침투 테스트 완료
- 관련 이슈: `#567`
- 주의 사항:
  - 패치 적용 후 사용자 세션 무효화 고려
  - 보안 로그 모니터링 강화

### PR 체크리스트 (SKILL.md 기준)

- [x] 목표와 변경 내용을 명확히 서술했는가?
- [x] 수정된 코드가 기존 컨벤션과 스타일을 따르는가? (`CODE_STYLE.md` 준수)
- [x] 테스트가 충분히 추가 또는 갱신되었는가?
- [x] 성능 또는 보안 문제를 유발하지 않는가? (보안 팀 리뷰 요청)
- [x] 문서, 주석, 린트 메시지 등 필요한 보충 설명이 포함되었는가?

### 추가 샘플: CI/CD 파이프라인 변경 시나리오 (ci)

- 제목: `ci: GitHub Actions 워크플로우 최적화`
- 요약: `CI/CD 파이프라인을 개선하여 빌드 시간을 단축하고 캐싱을 적용했습니다.`
- 변경 사항:
  - `.github/workflows/ci.yml`: 캐싱 전략 추가 및 병렬 실행 적용
  - `.github/workflows/deploy.yml`: 배포 자동화 개선
  - `Dockerfile`: 멀티스테이지 빌드 적용으로 이미지 크기 최적화
- 검증 방법:
  - GitHub Actions 워크플로우 실행 및 모든 단계 통과 확인
  - 빌드 시간 측정: 이전 대비 40% 단축 확인
  - DevOps 팀과 스테이징 환경 배포 테스트 완료
- 관련 이슈: `#678`
- 주의 사항:
  - 캐시 키 변경 시 기존 캐시 무효화 필요
  - 배포 환경별 설정 분리 확인

#### CI/CD 파이프라인 코드 예시

**.github/workflows/ci.yml** (수정)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level=moderate

      - name: Run dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: "Haness Engineering"
          path: "."
          format: "ALL"

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/
```

**Dockerfile** (멀티스테이지 빌드 적용)

```dockerfile
# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS production

WORKDIR /app

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 보안 강화
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 추가 샘플: 데이터베이스 스키마 변경 시나리오 (db)

- 제목: `db: 사용자 프로필 테이블 확장`
- 요약: `사용자 프로필에 추가 정보를 저장하기 위해 데이터베이스 스키마를 변경했습니다.`
- 변경 사항:
  - 마이그레이션: `migrations/002_add_user_profile_fields.sql`
  - 모델 업데이트: `src/models/User.js`에 새 필드 추가
  - API 변경: `src/controllers/userController.js` 프로필 업데이트 엔드포인트 수정
  - 테스트: `tests/models/User.test.js` 및 `tests/controllers/userController.test.js` 업데이트
- 검증 방법:
  - 로컬 데이터베이스에서 마이그레이션 실행 및 롤백 테스트
  - 기존 데이터 무결성 확인 (데이터 마이그레이션 스크립트 실행)
  - QA 팀의 데이터베이스 테스트 완료
  - 프로덕션 환경에서 점진적 배포 및 모니터링
- 관련 이슈: `#789`
- 주의 사항:
  - 다운타임 최소화를 위한 점진적 마이그레이션 적용
  - 롤백 계획 수립 및 데이터 백업 확인
  - 기존 쿼리 성능 영향 평가

#### 데이터베이스 스키마 변경 코드 예시

**migrations/002_add_user_profile_fields.sql**

```sql
-- 사용자 프로필 필드 추가
ALTER TABLE users
ADD COLUMN phone VARCHAR(20),
ADD COLUMN date_of_birth DATE,
ADD COLUMN bio TEXT,
ADD COLUMN avatar_url VARCHAR(500),
ADD COLUMN preferences JSONB DEFAULT '{}';

-- 인덱스 추가로 성능 최적화
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);

-- 기존 데이터 마이그레이션 (필요시)
-- UPDATE users SET preferences = '{"theme": "light", "notifications": true}' WHERE preferences IS NULL;

-- 제약조건 추가
ALTER TABLE users
ADD CONSTRAINT chk_phone_format CHECK (phone ~ '^\\+?[0-9\\s\\-\\(\\)]+$'),
ADD CONSTRAINT chk_date_of_birth CHECK (date_of_birth <= CURRENT_DATE);
```

**src/models/User.js** (업데이트)

```javascript
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // 새로 추가된 필드들
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[\+]?[0-9\s\-\(\)]+$/,
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "avatar_url",
        validate: {
          isUrl: true,
        },
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      tableName: "users",
      timestamps: true,
      indexes: [
        {
          fields: ["phone"],
        },
        {
          fields: ["date_of_birth"],
        },
        {
          using: "GIN",
          fields: ["preferences"],
        },
      ],
    },
  );

  return User;
};
```

**tests/models/User.test.js** (업데이트)

```javascript
const { sequelize, User } = require("../../src/models");

describe("User Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("새 프로필 필드 검증", () => {
    it("should create user with new profile fields", async () => {
      const userData = {
        email: "john@example.com",
        passwordHash: "hashedpassword",
        phone: "+1-555-0123",
        dateOfBirth: "1990-01-01",
        bio: "Software developer passionate about clean code",
        avatarUrl: "https://example.com/avatar.jpg",
        preferences: { theme: "dark", notifications: true },
      };

      const user = await User.create(userData);
      expect(user.phone).toBe(userData.phone);
      expect(user.dateOfBirth).toBe(userData.dateOfBirth);
      expect(user.bio).toBe(userData.bio);
      expect(user.avatarUrl).toBe(userData.avatarUrl);
      expect(user.preferences).toEqual(userData.preferences);
    });

    it("should validate phone number format", async () => {
      await expect(
        User.create({
          email: "test@example.com",
          passwordHash: "hash",
          phone: "invalid-phone",
        }),
      ).rejects.toThrow();
    });

    it("should validate avatar URL format", async () => {
      await expect(
        User.create({
          email: "test@example.com",
          passwordHash: "hash",
          avatarUrl: "not-a-url",
        }),
      ).rejects.toThrow();
    });
  });
});
```

### 추가 샘플: API 버전 변경 시나리오 (feat)

- 제목: `feat: API v2 버전 추가 및 버전 관리 도입`
- 요약: `API 버전 관리를 도입하여 하위 호환성을 유지하면서 새로운 기능을 제공합니다.`
- 변경 사항:
  - 버전 라우팅: `src/routes/v2/` 디렉토리 생성 및 버전별 라우터 구현
  - 새로운 API 엔드포인트: `src/controllers/v2/userController.js` 추가
  - 미들웨어: `src/middleware/apiVersion.js` 버전 검증 및 라우팅
  - 문서화: `docs/api/v2/` API v2 문서 작성
  - 테스트: `tests/routes/v2/` 버전별 API 테스트 추가
- 검증 방법:
  - API 버전 헤더 테스트 (`Accept-Version: v2`)
  - 하위 호환성 확인 (v1 API 계속 작동)
  - QA 팀의 API 테스트 완료 및 문서 검토
  - 프로덕션 환경에서 점진적 트래픽 이전
- 관련 이슈: `#890`
- 주의 사항:
  - v1 API 지원 종료 일정 공지 및 마이그레이션 가이드 제공
  - 버전 헤더 표준화 및 클라이언트 SDK 업데이트
  - API 사용량 모니터링 및 성능 영향 평가

#### API 버전 변경 코드 예시

**src/middleware/apiVersion.js** (새 파일)

```javascript
const API_VERSIONS = {
  v1: "2023-01-01",
  v2: "2024-01-01",
};

const DEFAULT_VERSION = "v1";

function parseVersionHeader(req) {
  const version =
    req.headers["accept-version"] ||
    req.headers["api-version"] ||
    req.query.version ||
    DEFAULT_VERSION;

  if (!API_VERSIONS[version]) {
    const error = new Error(`Unsupported API version: ${version}`);
    error.statusCode = 400;
    throw error;
  }

  return version;
}

function apiVersionMiddleware(req, res, next) {
  try {
    req.apiVersion = parseVersionHeader(req);
    req.apiVersionDate = API_VERSIONS[req.apiVersion];
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  apiVersionMiddleware,
  API_VERSIONS,
  DEFAULT_VERSION,
};
```

**src/routes/v2/userRoutes.js** (새 파일)

```javascript
const express = require("express");
const router = express.Router();
const userControllerV2 = require("../controllers/v2/userController");
const { authenticate } = require("../middleware/auth");

// v2 API 엔드포인트들
router.get("/users", authenticate, userControllerV2.getUsers);
router.get("/users/:id", authenticate, userControllerV2.getUserById);
router.post("/users", userControllerV2.createUser);
router.put("/users/:id", authenticate, userControllerV2.updateUser);
router.delete("/users/:id", authenticate, userControllerV2.deleteUser);

// v2에서 추가된 새로운 기능들
router.post("/users/:id/follow", authenticate, userControllerV2.followUser);
router.delete("/users/:id/follow", authenticate, userControllerV2.unfollowUser);
router.get("/users/:id/followers", authenticate, userControllerV2.getFollowers);
router.get("/users/:id/following", authenticate, userControllerV2.getFollowing);

module.exports = router;
```

**src/controllers/v2/userController.js** (새 파일)

```javascript
const userService = require("../services/userService");
const { APIError } = require("../utils/errors");

class UserControllerV2 {
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const filters = {
        ...req.query,
        apiVersion: req.apiVersion,
      };

      const users = await userService.getUsers(filters);
      const paginatedResult = await userService.paginate(users, page, limit);

      res.json({
        data: paginatedResult.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: paginatedResult.total,
          pages: Math.ceil(paginatedResult.total / limit),
        },
        apiVersion: req.apiVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id, {
        apiVersion: req.apiVersion,
      });

      if (!user) {
        throw new APIError("User not found", 404);
      }

      res.json({
        data: user,
        apiVersion: req.apiVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const userData = {
        ...req.body,
        apiVersion: req.apiVersion,
      };

      const user = await userService.createUser(userData);

      res.status(201).json({
        data: user,
        apiVersion: req.apiVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        apiVersion: req.apiVersion,
      };

      const user = await userService.updateUser(id, updateData);

      res.json({
        data: user,
        apiVersion: req.apiVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // v2에서 추가된 팔로우 기능들
  async followUser(req, res, next) {
    try {
      const { id: targetUserId } = req.params;
      const currentUserId = req.user.id;

      await userService.followUser(currentUserId, targetUserId);

      res.status(201).json({
        message: "User followed successfully",
        apiVersion: req.apiVersion,
      });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const { id: targetUserId } = req.params;
      const currentUserId = req.user.id;

      await userService.unfollowUser(currentUserId, targetUserId);

      res.json({
        message: "User unfollowed successfully",
        apiVersion: req.apiVersion,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const { id } = req.params;
      const followers = await userService.getFollowers(id);

      res.json({
        data: followers,
        apiVersion: req.apiVersion,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const { id } = req.params;
      const following = await userService.getFollowing(id);

      res.json({
        data: following,
        apiVersion: req.apiVersion,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserControllerV2();
```

**tests/routes/v2/userRoutes.test.js** (새 파일)

```javascript
const request = require("supertest");
const express = require("express");
const userRoutesV2 = require("../../../src/routes/v2/userRoutes");
const { apiVersionMiddleware } = require("../../../src/middleware/apiVersion");

const app = express();
app.use(express.json());
app.use(apiVersionMiddleware);
app.use("/api/v2", userRoutesV2);

describe("User Routes V2", () => {
  describe("GET /api/v2/users", () => {
    it("should return users with v2 response format", async () => {
      const response = await request(app)
        .get("/api/v2/users")
        .set("Accept-Version", "v2")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("apiVersion", "v2");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should handle pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v2/users?page=2&limit=10")
        .set("Accept-Version", "v2")
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe("POST /api/v2/users/:id/follow", () => {
    it("should follow a user successfully", async () => {
      // Mock authentication middleware
      const response = await request(app)
        .post("/api/v2/users/123/follow")
        .set("Accept-Version", "v2")
        .set("Authorization", "Bearer mock-token")
        .expect(201);

      expect(response.body.message).toBe("User followed successfully");
      expect(response.body.apiVersion).toBe("v2");
    });
  });

  describe("Version header validation", () => {
    it("should reject unsupported API version", async () => {
      await request(app)
        .get("/api/v2/users")
        .set("Accept-Version", "v3")
        .expect(400);
    });

    it("should default to v1 when no version specified", async () => {
      // This would route to v1 if v2 routes are not mounted
      const response = await request(app).get("/api/v2/users").expect(200);

      // In a real scenario, this might redirect or handle differently
    });
  });
});
```

## 기여 가이드

이 프로젝트에 기여하려면 다음 문서를 참고하세요.

- `README.md`
- `CONTRIBUTING.md`
