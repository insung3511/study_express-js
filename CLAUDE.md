# Claude 학습 컨텍스트

이 파일은 Claude가 매 대화 세션마다 참조하는 학습 진도 및 컨텍스트 파일입니다.
**새 세션 시작 시 반드시 이 파일을 먼저 읽고 학습자의 현재 수준과 다음 목표를 파악하세요.**

---

## 학습자 정보

- 4월 인턴십을 앞두고 Express.js + TypeScript 실무 역량을 키우는 중
- 목표: 미니 프로젝트를 혼자 설계·구현할 수 있는 수준으로 빠르게 끌어올리기
- 현재 날짜: 2026-03-13 기준으로 약 3주 남음
- 스터디 방식: Claude와 함께 코드 작성 → 개념 설명 → 실습 반복

---

## 현재까지 완료된 학습

### [완료] Chapter 1: REST API 기초 (`app.ts`)
- GET / POST / PUT / PATCH / DELETE 전체 구현 경험
- Route Params (`:id`), Query String (`?name=`), Request Body 구분
- `app.route()` 체이닝 패턴
- TypeScript에서 `Request`, `Response` 타입 사용
- 메모리 배열을 임시 DB로 사용한 CRUD 패턴

### [완료] Chapter 2: 미들웨어 & 라우터 분리 (`routing/`)
- 미들웨어 체인 개념: `next()` 호출 여부로 흐름 제어
- App 레벨 미들웨어 vs Router 레벨 미들웨어 차이
- 서비스별 라우터 분리 (`service1`, `service2`)
- 구현한 미들웨어: authCheck, logger, validateBody, timeCheck, validateAppointment
- `(req as any).user` 패턴으로 미들웨어 간 데이터 전달
- 404 핸들러 패턴

### [완료] Chapter 2.5: 라우팅 & 미들웨어 심화 이해 (개념 정리)
- **Express 내부 동작 원리**: 미들웨어 스택(배열) 순회 + 경로 패턴 매칭
- **`next()` 동작 원리**: 스택의 다음 인덱스로 이동하는 함수 (자동 탐색이 아닌 순차 순회)
- **Router 내부 스택**: Router도 미니 Express 앱으로, 자체 스택을 가짐
- **Routing의 4가지 역할**: 경로 매칭, HTTP 메서드 매칭, 미들웨어 체인 구성, 경로 접두사 관리
- **경로 접두사 제거**: `app.use('/users', router)` 시 라우터 내부에서 `/users`가 벗겨짐 (상대 경로)
- **HTTP 메서드별 특성**: GET/DELETE(Body X), POST/PUT/PATCH(Body O) → Body 유무에 따라 validation 미들웨어 적용 여부 결정
- **미들웨어 vs Route Handler**: 둘 다 같은 함수. `next()` 호출 여부가 유일한 차이
- **실무 디렉토리 구조 이해**: Layered(계층별) vs Feature-based(기능별) 구조
- **Feature-based 레이어 이해**: routes → validation → controller → service → model 각 레이어의 역할과 분리 이유
- **`app.ts` vs `server.ts` 분리**: 테스트 시 app만 import하기 위한 패턴
- **`common/types/`**: 공통 타입 정의, `express.d.ts`로 Request 타입 확장 (`as any` 제거)

### [완료] Chapter 3: 에러 핸들링 & 환경변수 (`chapter3/`)

**에러 핸들링**
- 에러 핸들링 없는 코드의 문제점 직접 시연: 200 OK에 빈 객체 반환, HTML 스택 트레이스 노출 등
- `(err, req, res, next)` **4인자 에러 미들웨어**: Express가 에러 미들웨어로 인식하는 핵심 조건
- 일반 미들웨어(3인자) vs 에러 미들웨어(4인자) 구분 이해
- **`AppError extends Error` 커스텀 에러 클래스**: 기본 Error에 `statusCode`를 추가하여 HTTP 상태코드를 에러 객체에 담는 패턴
- **`throw new AppError()`로 에러 발생 → 에러 미들웨어에서 일괄 처리** 패턴: 각 라우트에서 직접 `res.status().json()` 대신 throw만 하면 됨
- `instanceof AppError`로 의도적 에러(4xx) vs 예상치 못한 에러(500) 분기
- Express 5에서는 async 핸들러의 throw가 자동으로 에러 미들웨어로 전달됨 (Express 4에서는 별도 처리 필요)
- `req.params.id`의 타입이 `string | string[]`이므로 `as string` 캐스팅 필요 (Express 5 타입 이슈)
- 초기 버전(`app-with-error-handling.ts`): 각 라우트에서 직접 if문으로 검증 + `res.status().json()` → 중복 코드 문제
- 최종 버전(`app.ts`): AppError + 에러 미들웨어로 리팩토링 → 에러 처리 로직이 한 곳에 집중

**환경변수**
- `dotenv` 설치 및 `.env` 파일 분리: `PORT=4000`, `NODE_ENV=development`
- `server.ts`에서 `dotenv.config()`를 가장 먼저 호출해야 하는 이유
- `types/env.d.ts`로 `process.env`에 TypeScript 타입 입히기: `declare namespace NodeJS` 패턴
- `env.d.ts`(타입 선언)와 `.env`(실제 값)는 독립적 — 타입이 있어도 실제 값은 .env에서 로드해야 함
- `NODE_ENV`에 따른 에러 응답 분기: 개발 환경에서는 스택 트레이스 포함, 운영 환경에서는 숨김
- `.env` 파일은 `.gitignore`에 추가하여 Git에 올리지 않는 원칙

**`app.ts` / `server.ts` 분리**
- `app.ts`: Express 앱 설정만 (미들웨어, 라우트, 에러 핸들러) → `export default app`
- `server.ts`: `dotenv.config()` + `app.listen()` → 서버 시작만 담당
- 분리 이유: 테스트 시 app만 import하여 supertest로 테스트 가능

### [완료] Chapter 3-Zod: Zod 입력 검증 (`chapter3-zod/`)
- **Zod는 Express 전용이 아닌 범용 검증 라이브러리**라는 점 이해 — Express에는 미들웨어로 수동 연결
- `z.object()`, `z.string().min()`, `z.string().email()` 등으로 스키마 정의
- `parse()` vs `safeParse()` 차이: 미들웨어에서는 `safeParse()` 선호 (에러를 직접 제어하기 위해)
- `z.infer<typeof schema>`로 스키마에서 TypeScript 타입 자동 추출 → 컴파일타임과 런타임 검증 일치
- Zod의 기본 동작: 알 수 없는 필드를 자동으로 strip (보안 이점)
- **검증 미들웨어 패턴**: 고차 함수 `validate(schema)`가 Express 미들웨어를 반환, `safeParse()` 실패 시 `AppError(400)` throw
- `req.body === undefined` 가드 추가 — body 없는 요청에 대한 방어
- Zod v4에서는 `.errors`가 아닌 `.issues`로 에러 목록에 접근
- 기존 if문 검증을 `validate(createUserSchema)` 미들웨어로 완전 교체
- `interface User extends CreateUserInput`으로 스키마 타입 재사용
- curl 테스트 6종 전체 통과: 정상 생성, 빈 이름, 잘못된 이메일, 복합 에러, 초과 필드 strip, body 없음

### [진행중] Chapter 4: Prisma ORM + 데이터베이스 (`chapter4/`)

**Prisma ORM 기초**
- **Prisma의 3가지 구성요소**: `schema.prisma`(모델 정의) → `prisma migrate dev`(DB 테이블 생성) → `prisma generate`(TypeScript 타입 생성)
- `generator client`: PrismaClient 타입을 `generated/prisma/` 폴더에 자동 생성
- `datasource db`: DB 종류(SQLite)와 연결 URL(`env("DATABASE_URL")`)을 설정
- `@id @default(autoincrement())`: 자동 증가 PK, `@unique`: 유니크 제약조건, `@updatedAt`: 수정 시 자동 갱신
- `findUnique()`: 없는 데이터 조회 시 **에러가 아닌 `null` 반환** — `findUniqueOrThrow()`와 구분
- `findMany()`: 결과 없으면 빈 배열 `[]` 반환
- 메모리 배열(`users.push()`) → Prisma(`prisma.user.create()`)로 전환: 서버 재시작해도 데이터 유지

**Controller / Service / Repository 3-레이어 분리**
- **레이어 분리 이유**: 같은 비즈니스 로직을 REST API, CLI, 크론잡, 메시지 큐 등에서 재사용하기 위함
- **의존성 방향**: Controller → Service → Repository → Prisma(DB) — 항상 아래 방향으로만, 역방향 금지
- **Repository 레이어**: Prisma를 직접 사용하는 유일한 파일. 비즈니스 로직 없음. `findAllUsers()`, `findUserById()`, `createUser()` 등 순수 DB 접근 함수
- **Service 레이어**: 비즈니스 규칙 담당. HTTP(`req`/`res`)를 모르고, Prisma도 모름. Repository를 통해서만 DB 접근. `getUserById()`에서 없으면 `AppError(404)` throw
- **Controller 레이어**: HTTP 요청/응답만 담당. `req.body`에서 데이터 추출 → Service 호출 → `res.json()`으로 응답
- **Routes 파일**: URL 패턴 + 미들웨어(Zod 검증) + Controller 연결
- Service에 `req`/`res`가 없으므로 **테스트 시 Repository를 mock하면 DB 없이 비즈니스 로직만 테스트 가능**
- `getUserById()`를 `updateUser()`와 `deleteUser()`에서 재사용: 존재 확인 로직 중복 제거
- 리팩토링 전 `app.ts`(119줄, 모든 게 섞임) → 리팩토링 후 역할별 5개 파일로 분리

---

## 다음 학습 목표

### [다음] Chapter 4 남은 내용
- SQLite → PostgreSQL 전환
- 관계형 모델 (1:N, N:M 관계)

### [예정] Chapter 5: JWT 인증 & 보안
- `jsonwebtoken` 토큰 발급 / 검증
- bcrypt 비밀번호 해싱
- helmet, cors, rate limiting

### [예정] Chapter 6: 미니 프로젝트 (혼자 구현)
- 학습자가 혼자 API를 설계하고 구현
- Claude는 막히는 부분에만 개입
- Jest + Supertest 테스트, Swagger 문서화

---

## Claude 행동 지침

### 학습 스타일
- 개념을 먼저 짧게 설명하고, 바로 코드 실습으로 넘어갈 것
- 코드에는 한국어 주석을 달아 이해를 도울 것
- 새 개념 도입 시 "왜 이게 필요한가"를 실무 맥락에서 먼저 설명할 것
- 오류가 나면 왜 틀렸는지 설명하고, 고치는 법을 함께 생각할 것

### 진도 관리
- 각 챕터 완료 시 이 파일의 `완료된 학습` 섹션을 업데이트할 것
- 새로운 패턴이나 깨달음이 생기면 해당 챕터 항목에 추가할 것
- `README.md`의 커리큘럼 표 상태(⬜ → ✅)도 함께 업데이트할 것
- 미니 프로젝트 시작 전 학습자가 혼자 설계할 수 있는지 점검할 것
- **[자동 업데이트 규칙]** 수업 내용이 변경되거나 진도가 진행될 때마다 이 파일(`CLAUDE.md`)과 `README.md`를 자동으로 업데이트할 것 — 학습자가 별도로 요청하지 않아도 챕터 완료, 새 개념 학습, 커리큘럼 변경 시 즉시 반영

### 코드 스타일 (이 프로젝트 기준)
- TypeScript strict 모드
- `Request`, `Response`, `NextFunction` 명시적 타입 사용
- 파일당 하나의 책임 (미들웨어 파일 분리 패턴 유지)
- `export default` 사용
- `app.ts` / `server.ts` 분리: app.ts는 Express 앱 설정만, server.ts는 listen()만 담당

---

## 기술 스택 (현재 설치됨)

```json
{
  "dependencies": { "express": "^5.2.1", "dotenv": "^17.3.1" },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.3.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

앞으로 추가 예정: `prisma`, `jsonwebtoken`, `bcrypt`, `jest`, `supertest`

---

## 업데이트 이력

| 날짜 | 업데이트 내용 |
|------|--------------|
| 2026-03-07 | 초기 작성. Chapter 1, 2 완료 기록. |
| 2026-03-07 | Chapter 2.5 추가. 라우팅/미들웨어 심화 개념, 실무 디렉토리 구조(Layered vs Feature-based), 각 레이어 역할, app.ts/server.ts 분리 이유, types 디렉토리 역할 학습 완료. |
| 2026-03-08 | 코드 스타일에 app.ts/server.ts 분리 원칙 추가. Chapter 3부터 적용. |
| 2026-03-08 | Chapter 3 에러 핸들링 & 환경변수 완료 기록. Zod 검증은 다음 세션에서 이어서 진행. |
| 2026-03-09 | Chapter 3-Zod 완료 기록. Zod 입력 검증 전체 학습 완료 (스키마, safeParse, 검증 미들웨어, 리팩토링, 테스트 6종). 자동 업데이트 규칙 추가. |
| 2026-03-13 | Chapter 4 Prisma ORM 기초 + Controller/Service/Repository 3-레이어 분리 학습 기록. app.ts(119줄)→역할별 5개 파일 리팩토링 완료. curl 테스트 7종 통과. |
