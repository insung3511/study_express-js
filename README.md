# Express.js + TypeScript 인턴십 준비 스터디

> 목표: 2026년 4월 인턴십 시작 전까지 Express.js + TypeScript 실무 수준 도달

## 학습 배경

- 4월 인턴십을 앞두고 백엔드 실무 역량을 갖추기 위한 스터디
- Claude와 함께 진행하며, 매 세션마다 `CLAUDE.md`가 진도와 컨텍스트를 추적함
- 최종 목표는 미니 프로젝트를 혼자 설계하고 구현할 수 있는 수준

## 커리큘럼 (2026.03 ~ 2026.04 초)

### Week 1 — Express + TypeScript 기초 다지기 (3/7 ~ 3/14)

| 주제 | 핵심 개념 | 상태 |
|------|-----------|------|
| REST API 설계 | GET/POST/PUT/PATCH/DELETE, Route Params, Query String | ✅ 완료 |
| 미들웨어 개념 | app.use, 미들웨어 체인, next(), Router | ✅ 완료 |
| 미들웨어 실습 | authCheck, logger, validateBody, timeCheck | ✅ 완료 |
| 에러 핸들링 | 글로벌 에러 핸들러, AppError 커스텀 클래스, 4인자 에러 미들웨어 | ✅ 완료 |
| 환경변수 | dotenv, `.env` 분리, `env.d.ts` 타입 안전 설정, NODE_ENV 분기 | ✅ 완료 |
| app/server 분리 | app.ts(설정) / server.ts(실행) 분리, 테스트 대비 | ✅ 완료 |
| 입력 검증 | Zod를 이용한 스키마 기반 검증 | ✅ 완료 |

### Week 2 — 데이터베이스 연동 (3/15 ~ 3/21)

| 주제 | 핵심 개념 | 상태 |
|------|-----------|------|
| Prisma ORM | 스키마 정의, Migration, CRUD | ✅ 완료 |
| 실제 DB 연동 | SQLite → PostgreSQL 전환 | ✅ 완료 |
| 프로젝트 구조 | Controller / Service / Repository 레이어 분리 | ✅ 완료 |

### Phase 1 — 개념 학습 (3/18 ~ 3/31, 8세션, ~8.5시간)

| 세션 | 주제 | 핵심 개념 | 상태 |
|------|------|-----------|------|
| 1 | Ch5 JWT 정리 마무리 | 토큰 발급/검증, bcrypt 해싱, authenticate 미들웨어 복습 | ⬜ 예정 |
| 2 | Jest + Supertest ① | 설치, 설정, 첫 API 테스트 작성 | ⬜ 예정 |
| 3 | Jest + Supertest ② | Mock 패턴, Service 단위 테스트 | ⬜ 예정 |
| 4 | helmet / cors / rate-limit | 보안 헤더 설정, 요청 속도 제한 | ⬜ 예정 |
| 5 | Swagger/OpenAPI ① | swagger-jsdoc + swagger-ui-express 설정 | ⬜ 예정 |
| 6 | Swagger/OpenAPI ② | 기존 API 전체 문서화 적용 | ⬜ 예정 |
| 7 | Logging (winston) | 구조화된 로깅, 로그 레벨 | ⬜ 예정 |
| 8 | 미니 프로젝트 사전 설계 | ERD 설계, 엔드포인트 정의 | ⬜ 예정 |

### Phase 2 — 미니 프로젝트: 일정/예약 관리 API (4/1 ~ 4/5, 5일)

혼자 설계하고 구현하는 미니 프로젝트. 지금까지 배운 모든 것을 통합.

| 날짜 | 내용 |
|------|------|
| 4/1 | 프로젝트 초기화 + Prisma 모델 + 기본 CRUD |
| 4/2 | JWT 인증 연동 + 권한 분리 |
| 4/3 | 비즈니스 로직 (예약 충돌 검증 등) |
| 4/4 | 테스트 작성 + Swagger 문서화 |
| 4/5 | 마무리 + 전체 점검 + README |

### 인턴십 시작: 4/6

## 현재 프로젝트 구조

```
express_js+study/
├── app.ts                   # Chapter 1: REST API 기초 실습 (CRUD + app.route)
├── routing/                 # Chapter 2: 미들웨어 & 라우터 분리 실습
│   ├── app.ts               # 메인 앱 (서비스별 라우터 마운트)
│   ├── service1/            # Users 서비스
│   │   ├── routes/index.ts
│   │   └── middlewares/
│   │       ├── authCheck.ts     # 인증 토큰 확인
│   │       ├── logger.ts        # 요청 로깅
│   │       └── validateBody.ts  # body 검증
│   └── service2/            # Appointments 서비스
│       ├── routes/index.ts
│       └── middlewares/
│           ├── timeCheck.ts         # 영업시간 확인
│           └── validateAppointment.ts
├── chapter3/                # Chapter 3: 에러 핸들링 & 환경변수
│   ├── app.ts               # Express 앱 설정 (AppError + 에러 미들웨어)
│   ├── server.ts            # dotenv 로드 + listen() (서버 시작만 담당)
│   ├── app-with-error-handling.ts  # 초기 에러 핸들링 시연용 (참고용)
│   ├── errors/
│   │   └── AppError.ts      # 커스텀 에러 클래스 (statusCode + message)
│   ├── types/
│   │   └── env.d.ts         # process.env 타입 정의
│   ├── .env                 # 환경변수 (PORT, NODE_ENV) — .gitignore 대상
│   ├── package.json
│   └── tsconfig.json
├── chapter3-zod/            # Chapter 3-Zod: Zod 입력 검증
│   ├── app.ts               # Express 앱 (Zod 검증 미들웨어 적용)
│   ├── server.ts            # dotenv 로드 + listen()
│   ├── schemas/
│   │   └── user.schema.ts   # Zod 스키마 + CreateUserInput 타입
│   ├── middleware/
│   │   └── validate.ts      # 고차 함수 validate(schema) → Express 미들웨어
│   ├── errors/
│   │   └── AppError.ts      # 커스텀 에러 클래스
│   ├── types/
│   │   └── env.d.ts         # process.env 타입 정의
│   ├── .env                 # 환경변수 (PORT, NODE_ENV)
│   ├── package.json
│   └── tsconfig.json
├── chapter4/                # Chapter 4: Prisma ORM + 3-레이어 (완료)
│   ├── src/
│   │   ├── app.ts           # Express 앱 (app/server 분리)
│   │   ├── server.ts
│   │   ├── users/           # User CRUD (controller/service/repository 3층)
│   │   ├── posts/           # Post CRUD + 1:N, N:M 관계
│   │   ├── schemas/         # Zod 검증 스키마
│   │   ├── middleware/       # validate.ts
│   │   └── errors/          # AppError.ts
│   ├── prisma/
│   │   └── schema.prisma    # PostgreSQL + User/Post/Tag 모델
│   ├── package.json
│   └── tsconfig.json
├── chapter5/                # Chapter 5: JWT 인증 (완료)
│   ├── src/
│   │   ├── app.ts           # Express 앱
│   │   ├── server.ts
│   │   ├── auth/            # register/login (controller/service/routes)
│   │   ├── users/           # User CRUD
│   │   ├── posts/           # Post CRUD
│   │   ├── schemas/         # auth.schema.ts, user.schema.ts, post.schema.ts
│   │   ├── middleware/
│   │   │   ├── validate.ts
│   │   │   └── auth.middleware.ts  # Bearer 토큰 검증 미들웨어
│   │   ├── errors/          # AppError.ts
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── tsconfig.json
```

## 실행 방법

```bash
# Chapter 1: REST API 기초 실행
npm run dev

# Chapter 2: 라우터 & 미들웨어 실습 실행
cd routing && npx ts-node app.ts

# Chapter 3: 에러 핸들링 & 환경변수 실행
cd chapter3 && npm install && npm run dev

# Chapter 3-Zod: Zod 입력 검증 실행
cd chapter3-zod && npm install && npm run dev

# Chapter 4: Prisma ORM + 3-레이어 실행
cd chapter4 && npm install && npm run dev

# Chapter 5: JWT 인증 실행
cd chapter5 && npm install && npm run dev
```

## 학습 내용 정리

### Chapter 1: REST API 기초
Express.js로 REST API의 기본 CRUD 작업을 구현하며 HTTP 메서드의 역할을 학습했다.
- **GET / POST / PUT / PATCH / DELETE** 전체 구현
- **Route Params** (`:id`), **Query String** (`?name=`), **Request Body** 세 가지 데이터 전달 방식 구분
- `app.route()` 체이닝으로 같은 경로의 여러 메서드를 깔끔하게 정리
- 메모리 배열을 임시 DB로 사용한 CRUD 패턴

### Chapter 2: 미들웨어 & 라우터 분리
Express의 핵심 개념인 미들웨어 체인과 라우터 분리를 학습했다.
- **미들웨어 체인**: `next()` 호출 여부로 요청 흐름을 제어
- **App 레벨 vs Router 레벨** 미들웨어의 차이
- 서비스별 라우터 분리 (`service1`, `service2`)
- 실제 미들웨어 구현: `authCheck`, `logger`, `validateBody`, `timeCheck`, `validateAppointment`

### Chapter 2.5: 라우팅 & 미들웨어 심화 (개념)
Express 내부 동작 원리와 실무 프로젝트 구조를 이론적으로 이해했다.
- Express는 **미들웨어 스택(배열)**을 순회하며, `next()`는 다음 인덱스로 이동하는 함수
- Router도 미니 Express 앱으로, 자체 미들웨어 스택을 가짐
- 실무 디렉토리 구조: **Layered**(계층별) vs **Feature-based**(기능별) 비교
- Feature-based 레이어: `routes → validation → controller → service → model`

### Chapter 3: 에러 핸들링 & 환경변수
실무에서 반드시 필요한 에러 처리와 환경 설정 분리를 학습했다.

**에러 핸들링**
- 에러 핸들링이 없을 때의 문제점을 직접 시연 (200 OK에 빈 객체, HTML 스택 트레이스 노출)
- **`(err, req, res, next)` 4인자 에러 미들웨어**: Express가 에러 미들웨어로 인식하는 핵심 조건
- **`AppError extends Error`** 커스텀 에러 클래스로 HTTP 상태코드를 에러 객체에 담는 패턴
- `throw new AppError(404, '...')` → 에러 미들웨어에서 일괄 처리 (각 라우트에서 직접 `res.status().json()` 안 해도 됨)
- `instanceof AppError`로 의도적 에러(4xx) vs 예상치 못한 에러(500) 분기
- Express 5에서는 async 핸들러의 throw가 자동으로 에러 미들웨어로 전달됨

**환경변수**
- `dotenv`로 `.env` 파일에서 환경변수 로드
- `types/env.d.ts`로 `process.env`에 TypeScript 타입을 입혀 자동완성 지원
- `NODE_ENV`에 따라 에러 응답의 상세도 분기 (개발: 스택 포함 / 운영: 숨김)

**app.ts / server.ts 분리**
- `app.ts`는 Express 앱 설정만, `server.ts`는 `dotenv.config()` + `listen()`만 담당
- 테스트 시 `app`만 import하여 `supertest`로 테스트 가능하게 하는 패턴

### Chapter 3-Zod: Zod 입력 검증
Zod를 사용한 스키마 기반 입력 검증을 학습하고, 기존 if문 검증을 완전히 교체했다.

- **Zod는 범용 검증 라이브러리** — Express 전용이 아니며, 미들웨어로 수동 연결하여 사용
- `z.object()`, `z.string().min()`, `z.string().email()` 등으로 스키마 정의
- `parse()` vs `safeParse()` 차이: 미들웨어에서는 `safeParse()` 선호 (에러를 직접 제어)
- `z.infer<typeof schema>`로 스키마에서 TypeScript 타입 자동 추출 → 컴파일타임과 런타임 검증 일치
- Zod 기본 동작: 알 수 없는 필드를 자동 strip (보안 이점)
- **고차 함수 `validate(schema)`** 패턴으로 재사용 가능한 검증 미들웨어 구현
- Zod v4에서는 `.errors`가 아닌 `.issues`로 에러 목록 접근
- curl 테스트 6종 전체 통과 (정상 생성, 빈 이름, 잘못된 이메일, 복합 에러, 초과 필드 strip, body 없음)

### Chapter 5: JWT 인증
- **bcrypt**: `bcrypt.hash(평문, saltRounds)`로 비밀번호 해싱, `bcrypt.compare()`로 검증
- **JWT**: `jwt.sign(payload, secret, { expiresIn })`로 토큰 발급, `jwt.verify(token, secret)`로 검증
- **TokenPayload**: JWT payload에 userId만 담는 최소 설계
- **register**: 이메일 중복 체크 → bcrypt 해싱 → 유저 생성 → JWT 발급 → 비밀번호 제외 응답
- **login**: 이메일 조회 → bcrypt.compare() 비교 → JWT 발급 → 비밀번호 제외 응답
- **authenticate 미들웨어**: Authorization 헤더에서 `Bearer 토큰` 추출 → `verifyToken()` → `req.userId` 주입
- **JWT_SECRET**: `.env`에서 로드, 미설정 시 서버 시작 시 에러throw

## 기술 스택

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js v5
- **ORM**: Prisma (완료)
- **Environment**: dotenv
- **Validation**: Zod (완료)
- **Auth**: JWT + bcrypt (완료)
- **Test**: Jest + Supertest (Phase 1 세션 2-3 예정)
- **Security**: helmet, cors, express-rate-limit (Phase 1 세션 4 예정)
- **Logging**: winston (Phase 1 세션 7 예정)
- **Docs**: Swagger/OpenAPI (Phase 1 세션 5-6 예정)
