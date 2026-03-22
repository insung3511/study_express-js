---
tags:
  - eventim
  - intern
  - expressjs
  - typescript
  - study
---

## dotnev - Environment Variable Settings
환경변수는 서버의 포트, 주소 등을 정의하는 값이다. 이는 한 개의 코드가 아니라 여러개의 코드에 동시에 적용되는 내용임으로 하드코딩으로 일일이 작성하는 것이 아닌 모두 적용할 수 있도록 하는게 중요하다.

예시로, `const PORT = 3000;`으로 정의된 포트가 변경이 되어야한다면 `server.ts`, `app.ts` 등 다양한 코드에 변경점을 찾아서 수정해야한다. 이유는 local에서 테스트를 하는 경우에는 3000으로 할 수 있지만 실제 서비스를 적용하는 필드에서는 다른 포트를 사용할 수도 있기 때문이다.

```
chapter3/
├── errors/
│   └── AppError.ts      ← 커스텀 에러 클래스
├── types/
│   └── env.d.ts         ← process.env 타입 정의
├── .env                 ← 환경변수 (Git에 올리면 안 됨!)
├── app.ts               ← Express 설정
├── server.ts            ← dotenv 로드 + listen()
└── package.json
```
`types/env.d.ts`와 `.env`가 환경변수를 설정하는 스크립트다. `.env`는 실질적인 환경 변수의 값이 들어가 있으며`env.d.ts`는 `.env`에 대한 정의를 내린다. 실질적인 환경 변수 값은 `.env` 있는 것 이다. 

`env.d.ts`의 역할은 `__init__.py` 처럼 변수에 대한 type 정의로 `.env`의 값이 어떤 형태인지 (String, Integer, Float ...) 인지 정의하는 스크립트이다. 정의된 타입으로 `server.ts`에서 받아서 활용한다.

환경 변수를 설정하면 `server.ts`는 아래와 같이 수정된다.
```typescript
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

// 이전: const PORT = 3000; ← 하드코딩
// 이후: .env에서 읽어옴. 없으면 기본값 3000 사용
const PORT = process.env.PORT || 3000;
...
```

`types/env.d.ts`가 없어도 코드는 올바르게 동작할 수 있다. Typescript의 편의성과 안전성을 위해서 사용하기는 하지만, 반드시 짝을 이루지는 않는다. 실제 배포간에는 `.env`를 사용하지 않지만 test의 편의성으로 사용한다. 

---

## 관련 문서
- [[Basic of Express.js]]
