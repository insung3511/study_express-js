# Claude 학습 컨텍스트

이 파일은 Claude가 매 대화 세션마다 참조하는 학습 진도 및 컨텍스트 파일입니다.
**새 세션 시작 시 반드시 이 파일을 먼저 읽고 학습자의 현재 수준과 다음 목표를 파악하세요.**

---

## 학습자 정보

- 4월 인턴십을 앞두고 Express.js + TypeScript 실무 역량을 키우는 중
- 목표: 미니 프로젝트를 혼자 설계·구현할 수 있는 수준으로 빠르게 끌어올리기
- 현재 날짜: 2026-03-07 기준으로 약 4주 남음
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

---

## 다음 학습 목표

### [다음] Chapter 3: 에러 핸들링 & 환경변수 & Zod 검증
우선순위 높음. 이 세 가지는 실무에서 항상 함께 사용됨.

**에러 핸들링**
- `(err, req, res, next)` 4인자 에러 미들웨어
- 커스텀 에러 클래스 (`AppError extends Error`)
- try-catch를 async 핸들러에서 다루는 패턴

**환경변수**
- `dotenv` 설치 및 `.env` 파일 분리
- `process.env`에 TypeScript 타입 입히기

**Zod 입력 검증**
- 스키마 정의 → `parse` / `safeParse`
- Express 미들웨어로 Zod 연결하는 패턴

### [예정] Chapter 4: Prisma ORM + 데이터베이스
- Prisma 스키마 정의, `npx prisma migrate dev`
- SQLite로 시작 → PostgreSQL 전환
- Controller / Service / Repository 레이어 분리

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

### 코드 스타일 (이 프로젝트 기준)
- TypeScript strict 모드
- `Request`, `Response`, `NextFunction` 명시적 타입 사용
- 파일당 하나의 책임 (미들웨어 파일 분리 패턴 유지)
- `export default` 사용

---

## 기술 스택 (현재 설치됨)

```json
{
  "dependencies": { "express": "^5.2.1" },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.3.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

앞으로 추가 예정: `zod`, `dotenv`, `prisma`, `jsonwebtoken`, `bcrypt`, `jest`, `supertest`

---

## 업데이트 이력

| 날짜 | 업데이트 내용 |
|------|--------------|
| 2026-03-07 | 초기 작성. Chapter 1, 2 완료 기록. |
| 2026-03-07 | Chapter 2.5 추가. 라우팅/미들웨어 심화 개념, 실무 디렉토리 구조(Layered vs Feature-based), 각 레이어 역할, app.ts/server.ts 분리 이유, types 디렉토리 역할 학습 완료. |
