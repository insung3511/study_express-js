---
tags:
  - eventim
  - intern
  - typescript
  - expressjs
  - study
---
## What is "Zod"
Zod는 Typescript에 설계된 유효성 검사 라이브러리이다. **검증 규칙을 선언적으로 정의하는 도구**. 따라서 Zod의 역할은 요청과 라우터 핸들러의 사이에서 동작하는 "검증" 단계에 속하게 된다.
> 이 인자값은 `string` 이고, `email` 형식이여야 한다.
> > `email` 포맷을 갖고 있으면서 `string`의 형식인 인자값을 받도록 정의.

Zod의 역할을 아래 코드의 예시로 설명할 수 있다. 
```typescript
// 필수 필드 누락 → 400 Bad Request
if (!name || !email) {
  throw new AppError(400, '이름(name)과 이메일(email)은 필수입니다');
}
// 이메일 형식 체크
if (!email.includes('@')) {
  throw new AppError(400, '올바른 이메일 형식이 아닙니다');
}
```
### 변수 선언과 조건의 문제
위와 같이 작성된 코드에서 인자값인 `name`, `email` 의 ...
- 타입은 올바른지? - String? Integer? Float? Double?
- 형식은 어떤식으로 되어야 하는지? - Email의 포맷, 전화번호 포맷, 비밀번호 최소 자리 수
- 범위 체크는 어떻게 할 것인가?
... 처럼, **변수에 대한 명확한 정의가 내려지지 않은 이상 실무에서는 문제**로 이어지게 된다. `if`문을 통해 해결이 가능하지만 비효율적인 코드의 구성이 발생하게 된다. 

### 재기능의 문제
다른 문제로, "입력 검증"과 "비즈니스 로직"이 한 개의 함수에 섞여 있음으로 라우터 핸들러의 역할에서 벗어나게 된다. 여기서 "입력 검증" 이라 함은 변수에 대한 조건, "비즈니스 로직"의 경우에는 해당 endpoint의 feature process가 된다.

### Type 에러 발생
Typescript는 Javascript의 컴파일러를 사용하기 때문에 실제 런타임 중 HTTP 요청 간에는 정의된 Type이 없게 된다. Interface를 통해 타입에 대한 선언이 있다고 한들, 코드를 작성하는 시점 - 컴파일 타임에만 동작하게 된다.

## Zod로 해결책!
별다른 `if`문이나 조건문 없이 런타임 검증과 Typescript 형식을 동시에 검증하는 라이브러리이다. 
```typescript
// 스키마 하나만 정의하면:
const createUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
});

// 1) TypeScript 타입 자동 추출 → interface 수동 작성 불필요
type CreateUserInput = z.infer<typeof createUserSchema>;
// → { name: string; email: string }

// 2) 런타임 검증 → if문 수동 작성 불필요
createUserSchema.parse(req.body);  // 실패하면 에러를 throw
```
스키마 하나로 정의하게 한다면 각 인자값, 변수에 대한 형식과 최소 조건 (`min`, `email`) 을 정의하게 된다.
타입 자동 추출시에는 interface 수동 작성이 필요없다. 더불어 `.parse( ... )` 구문을 통해서 에러를 자동으로 처리하게 된다.

```typescript
import { z } from 'zod';
// 기본 타입
z.string()              // string
z.number()              // number
z.boolean()             // boolean
// 검증 조건 체이닝
z.string().min(1)       // 빈 문자열 불가
z.string().email()      // 이메일 형식
z.string().url()        // URL 형식
z.number().int()        // 정수만
z.number().min(0).max(150)  // 범위 제한
// 객체
z.object({
  name: z.string(),
  email: z.string().email(),
})
// 검증 실행
schema.parse(data)      // 실패 시 ZodError throw
schema.safeParse(data)  // 실패해도 throw 안 함, 결과 객체 반환
```

---
## Schema 작성
```typescript
// user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  // name: 문자열이어야 하고, 최소 1글자 이상 (빈 문자열 방지)
  name: z.string().min(1, '이름은 필수입니다'),

  // email: 문자열 + 최소 1글자 + 이메일 형식 검증
  // .min(1)을 먼저 → 빈 문자열이면 '이메일은 필수입니다' 메시지
  // .email()     → 형식 틀리면 '올바른 이메일 형식이 아닙니다' 메시지
  email: z
    .string()
    .min(1, '이메일은 필수입니다')
    .email('올바른 이메일 형식이 아닙니다'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

```typescript
// test-zod.ts
import { createUserSchema } from './user.schema';

const validData = { name: '김철수', email: 'chulsoo@test.com' };
const result1 = createUserSchema.parse(validData);
console.log('결과:', result1);
// → { name: '김철수', email: 'chulsoo@test.com' }

console.log('\n========================================');
console.log('2. 이름 누락으로 parse() 호출 → 에러 발생!');
console.log('========================================');

try {
  const badData1 = { email: 'chulsoo@test.com' };
  createUserSchema.parse(badData1);
} catch (error) {
  console.log('에러 타입:', (error as any).constructor.name);
  console.log('에러 내용:', (error as any).issues);
  // → ZodError, [{ message: '이름은 필수입니다' ... }]
}

const good = createUserSchema.safeParse({ name: '이영희', email: 'yh@test.com' });
console.log('성공 케이스:', good);
// → { success: true, data: { name: '이영희', email: 'yh@test.com' } }

const bad = createUserSchema.safeParse({ name: '', email: 'bad' });
console.log('\n실패 케이스:', bad);
// → { success: false, error: ZodError { ... } }
```
위와 같이 `validData`에 존재하는 데이터를 `try { ... } catch (e) { ... }` 구문 혹은 `safeParse`로 Zod Error를 할 수 있다. 코드에서는 실패 케이스의 경우 Error throw도 데이터 형식과 구조를 확인할 수 있다.

## Zod Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import AppError from '../errors/AppError';

// ====================================
// Zod 검증 미들웨어
// ====================================
//
// 사용법:
//   app.post('/users', validate(createUserSchema), (req, res) => { ... });
//
// 동작 흐름:
//   1. 요청이 들어옴
//   2. validate(스키마)가 req.body를 스키마로 검증
//   3-A. 성공 → 검증된 데이터를 req.body에 덮어쓰고 next()
//   3-B. 실패 → AppError(400)를 throw → 에러 미들웨어에서 처리
//

// validate는 "스키마를 받아서 미들웨어 함수를 반환"하는 고차 함수
//
// 왜 고차 함수인가?
//   validate(createUserSchema)  → 미들웨어 함수 반환
//   validate(updateUserSchema)  → 다른 미들웨어 함수 반환
//   → 스키마만 바꾸면 어떤 라우트에든 재사용 가능!
//
const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // body가 아예 없는 경우 (Content-Type 헤더 없이 요청 등)
    if (req.body === undefined) {
      throw new AppError(400, '요청 본문(body)이 없습니다');
    }

    // safeParse: 실패해도 throw하지 않고 결과 객체를 반환
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 검증 실패 → Zod 에러 메시지들을 추출해서 AppError로 변환
      const errorMessages = result.error.issues
        .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
        .join(', ');

      throw new AppError(400, errorMessages);
    }

    // 검증 성공 → 검증된(strip된) 데이터로 req.body를 덮어쓰기
    // 이렇게 하면 스키마에 없는 여분의 필드가 자동으로 제거됨 (보안!)
    req.body = result.data;

    // 다음 미들웨어(= 라우트 핸들러)로 이동
    next();
  };
};

export default validate;
```

# Compaction (mar 9th)
```
---
Goal
The user is studying Express.js with TypeScript chapter by chapter. They completed Chapter 3 (error handling + environment variables) and are now learning Zod for input validation to replace manual if statement validation. All 5 steps of the Zod learning plan have been completed. The next step is Chapter 4: Prisma ORM + Database.
Instructions
- The user prefers detailed conceptual explanations before writing code — they want to understand "why" before "how."
- Explanations should be in Korean.
- Each chapter should be in its own separate directory — the user explicitly requested this when Zod files were initially added to chapter3/. They want clean separation so learning stages don't get mixed up. The Zod work was moved to chapter3-zod/.
- chapter3/ must remain untouched (it was restored to its original state after accidentally adding Zod files to it).
- The schemas/test-zod.ts file is a learning aid that can be deleted when no longer needed.
Discoveries
- Zod v4 uses .issues not .errors on ZodError objects. The initial test script used .errors which returned undefined; it was fixed to .issues.
- Port conflicts: When restarting servers, the old process on port 4000 can linger and serve stale responses. Always lsof -ti:4000 | xargs kill -9 before restarting.
- The user initially thought Zod was Express-specific — they now understand it's a general-purpose validation library manually connected to Express via middleware.
- The user understands the TypeScript compile-time vs runtime gap: req.body is any at runtime, so TS interfaces alone don't protect against bad input. Zod solves this with z.infer.
- safeParse() is preferred over parse() for the middleware pattern because we want to catch failures and convert them to AppError rather than letting ZodError propagate.
- Zod's default behavior strips unknown fields from parsed objects (security benefit).
- A guard for req.body === undefined was added to the validate middleware to handle requests with no body gracefully.
Accomplished
- ✅ Step 1: Explained why Zod is needed (4 problems with if-statement validation)
- ✅ Step 2: Installed Zod, created schemas/user.schema.ts with createUserSchema and CreateUserInput type, created test-zod.ts for hands-on learning of parse(), safeParse(), strip behavior
- ✅ Step 3: Created middleware/validate.ts — a higher-order function that takes a ZodSchema, runs safeParse() on req.body, and throws AppError(400) on failure
- ✅ Step 4: Refactored app.ts — removed if-statement validation (lines 52-63 of original), added validate(createUserSchema) middleware to POST /users, changed interface User to extends CreateUserInput
- ✅ Step 5: Ran 6 curl tests (normal creation, empty name, bad email, both wrong, extra fields stripped, no body) — all passed correctly
- ✅ Cleanup: Removed Zod files and zod dependency from chapter3/ to restore it to original state
- 🔲 Chapter 4: Not started — likely Prisma ORM + Database
Relevant files / directories
chapter3-zod/ — Zod validation learning project (ACTIVE, ALL COMPLETE)
- chapter3-zod/package.json — includes zod dependency alongside express, dotenv
- chapter3-zod/tsconfig.json — standard TS config (ES2020, commonjs, strict)
- chapter3-zod/.env — PORT=4000, NODE_ENV=development
- chapter3-zod/app.ts — refactored: imports validate middleware + Zod schema, POST /users uses validate(createUserSchema) instead of if-statements, interface User extends CreateUserInput
- chapter3-zod/server.ts — server entry point with startup curl examples
- chapter3-zod/errors/AppError.ts — custom error class with statusCode (copied from chapter3)
- chapter3-zod/types/env.d.ts — process.env type declarations (copied from chapter3)
- chapter3-zod/schemas/user.schema.ts — NEW: createUserSchema (z.object with name + email validation), CreateUserInput type via z.infer
- chapter3-zod/schemas/test-zod.ts — NEW: learning script demonstrating parse/safeParse/strip (deletable)
- chapter3-zod/middleware/validate.ts — NEW: higher-order function validate(schema) returning Express middleware, uses safeParse(), throws AppError(400) with [field] message format on failure, guards against undefined body
chapter3/ — Error handling + environment variables (COMPLETED, DO NOT MODIFY)
- chapter3/app.ts — original with if-statement validation (restored to pre-Zod state)
- chapter3/server.ts, chapter3/errors/AppError.ts, chapter3/types/env.d.ts, chapter3/.env, chapter3/package.json — all original, untouched
```

---

## 관련 문서
- [[Basic of Express.js]]
- [[Primsa ORM + Database]]
- [[Erro Handling]]
