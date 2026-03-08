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
| 에러 핸들링 | 글로벌 에러 핸들러, Error 타입 | ⬜ 예정 |
| 환경변수 | dotenv, `.env` 분리, 타입 안전 설정 | ⬜ 예정 |
| 입력 검증 | Zod를 이용한 스키마 기반 검증 | ⬜ 예정 |

### Week 2 — 데이터베이스 연동 (3/15 ~ 3/21)

| 주제 | 핵심 개념 | 상태 |
|------|-----------|------|
| Prisma ORM | 스키마 정의, Migration, CRUD | ⬜ 예정 |
| 실제 DB 연동 | SQLite → PostgreSQL 전환 | ⬜ 예정 |
| 프로젝트 구조 | Controller / Service / Repository 레이어 분리 | ⬜ 예정 |

### Week 3 — 인증 & 보안 (3/22 ~ 3/28)

| 주제 | 핵심 개념 | 상태 |
|------|-----------|------|
| JWT 인증 | 토큰 발급/검증, 미들웨어 적용 | ⬜ 예정 |
| 비밀번호 해싱 | bcrypt, salt | ⬜ 예정 |
| 보안 기초 | helmet, cors, rate limiting | ⬜ 예정 |

### Week 4 — 미니 프로젝트 (3/29 ~ 4/6)

혼자 설계하고 구현하는 미니 프로젝트. 지금까지 배운 모든 것을 통합.

- [ ] API 설계 (ERD, 엔드포인트 정의)
- [ ] Prisma + PostgreSQL 연동
- [ ] JWT 인증 흐름 구현
- [ ] Zod 기반 입력 검증
- [ ] 글로벌 에러 핸들링
- [ ] 테스트 작성 (Jest + Supertest)
- [ ] Swagger API 문서화

## 현재 프로젝트 구조

```
express_js+study/
├── app.ts                   # REST API 기초 실습 (CRUD + app.route)
├── routing/                 # 미들웨어 & 라우터 분리 실습
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
├── package.json
└── tsconfig.json
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (app.ts)
npm run dev

# routing 실습 실행
cd routing && npx ts-node app.ts
```

## 기술 스택

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js v5
- **ORM**: Prisma (Week 2 예정)
- **Validation**: Zod (Week 1 예정)
- **Auth**: JWT + bcrypt (Week 3 예정)
- **Test**: Jest + Supertest (Week 4 예정)
