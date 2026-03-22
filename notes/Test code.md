## Jest + Supertest
- Jest: 테스트 프레임워크
- ts-Jest: Jest가 Typescript를 이해하도록 해주는 변환기
- Supertest: Express 앱에 HTTP 요청을 보내는 테스트 도구
	- 서버를 실제로 켜지 않고도 요청 가능!
	- `app.ts`, `server.ts`를 분리해둔 이유

### Configuration
Jest를 설정하는데에는 3개의 파일 수정이 필요하다. 
- `jest.config.ts`: `ts-jest`프리셋 설정과 `dotenv`를 자동로드
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
};
```
- `tsconfig.json` : `"types": ["node", "jest"]`
- `package.json`: `"test": "jest --verbose"` 스크립트 추가

### Test code
테스트 코드는 `src/__tests__/` 디렉토리에서 진행된다. Supertest 라이브러리를 통해서 API의 요청과 반환이 올바르게 오는지 확인한다. 코드를 하나하나 해석하면 아래와 같다.

#### `auth.test.ts`
```typescript
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '../../generated/prisma/client';
const prisma = new PrismaClient();

const testUser = {
  name: 'Test User',
  email: 'test-jest@example.com',
  password: 'password123',
};
```
`testUser`는 테스트에서 사용할 정적 데이터, 가상의 데이터이다.

```typescript
// 모든 테스트 시작 전: 혹시 남아있는 테스트 데이터 삭제
beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
});

// 모든 테스트 끝난 후: 테스트 데이터 삭제 + DB 연결 종료
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
  await prisma.$disconnect();
});
```
테스트 이전에 데이터베이스 환경을 초기화한다. 단, 실무에서는 `deleteMany`와 같은 문법을 쓰지 않는다. 더불어, 테스트 Database와 개발 Database는 완전히 분리된 상태로 개발이 이뤄진다. 테스트를 위해 CI/CD에서 임시 Database를 생성하는 경우도 있다. 

```typescript
describe('POST /auth/register', () => {
  it('새 유저를 등록하고 토큰을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    // 비밀번호가 응답에 포함되면 안 된다! (보안)
    expect(res.body.user.password).toBeUndefined();
  });
  
  it('이미 존재하는 이메일이면 409를 반환해야 한다', async () => {
    // 위 테스트에서 이미 등록됐으므로 같은 이메일로 다시 시도
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    expect(res.status).toBe(409);
  });
  
  it('비밀번호가 8자 미만이면 400을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Short Password',
        email: 'short@example.com',
        password: '1234567', // 7자 — Zod 스키마에서 min(8) 위반
      });
    expect(res.status).toBe(400);
  });
  
  it('이메일 형식이 잘못되면 400을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'password123',
      });
    expect(res.status).toBe(400);
  });
});
```
Jest의 문법으로 
```typescript
	describe('POST /auth/register', () => {   // Jest — 테스트 그룹
	  it('새 유저를 등록해야 한다', async () => { // Jest — 개별 테스트
	    const res = await request(app)          // Supertest — HTTP 요청
	      .post('/auth/register')               // Supertest
	      .send({...});                         // Supertest
	    expect(res.status).toBe(201);           // Jest — 결과 검증
	  });
	});
```
와 같이 쓰이며 `describe()`에 어떤 테스트인지, `it()`에는 어떤 토큰을 반환 해야하는지, 실제 테스트는 `const res ... .toBe(201)`로 된다. Jest는 테스트 구조와 검증을 하며 Supertest는 Request, Response를 담당한다.

위와 같은 방식으로 Jest 코드가 작성되어 테스트 코드를 구성한다. 

더불어 각각의 데이터 요청을 아래와 같은 형식으로 보내어서 각 Body의 응답과 요청을 확인할 수 있다.
```typescript
// ──────────────────────────────────────
// 로그인 테스트
// ──────────────────────────────────────
describe('POST /auth/login', () => {
  it('올바른 이메일/비밀번호로 로그인하면 토큰을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });
  // ...
});
```

## Mock + 단위 테스트
위 코드는 통합 테스트로 요청부터 응답까지 전체를 테스트하는 방법이다. 이 방법은 전체 Pipeline을 확인하는데 있어서 이 점이 있지만 Database가 꺼져 있거나 레이어 간에 테스트는 어렵다. 이로 인해 *단위 테스트 (Unit Test)* 를 통해 하나의 레이어만 꺼내어 테스트를 진행할 수 있다. 

`jest.mock(' LAYER_PATH ')` 를 통해서 해당 모듈을 가짜 레이어로 바꾸어서 테스트할 수 있다. 

#### `auth.service.test.ts`
```typescript
import * as authService from '../auth/auth.service';
import * as userRepository from '../users/user.repository';
import bcrypt from 'bcrypt';

jest.mock('../users/user.repository');
```
`jest.mock` 코드을 통해서 **모든 export 함수를 Mock으로 바꾼다.** Database, Prisma를 건들이지 않고 Repository를 독립화 시킨다.

```typescript
const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
  typeof userRepository.findUserByEmail
>;
const mockCreateUser = userRepository.createUser as jest.MockedFunction<
  typeof userRepository.createUser
>;
```
위에서 `jest.mock`으로 repository의 함수들을 모두 mock으로 바꿨기 때문에 우리는 `MockedFunction`을 통해서 캐스팅한 함수를 불러온다.
- `mockResolvedValue( VALUE )`: `async` 함수가 이 값을 반환하게 설정
- `mockRejectedValue( ERROR )`: `async`함수가 이 에러를 throw하게 설정
- `mock.calls`: 함수가 호출 될때 마다 전달된 인자 기록

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```
`beforeEach`를 통해서 `mock` 값들을 미리 리셋한다.

```typescript
// ──────────────────────────────────────
// register 테스트
// ──────────────────────────────────────
describe('authService.register', () => {
  const registerData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('새 유저를 등록하고 토큰을 반환해야 한다', async () => {
    // Arrange: Mock이 반환할 값 설정
    mockFindUserByEmail.mockResolvedValue(null); // 이메일 중복 없음
    mockCreateUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act: 실제 함수 호출
    const result = await authService.register(registerData);

    // Assert: 결과 검증
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password'); // 비밀번호 제외 확인

    // Mock 함수가 올바른 인자로 호출되었는지 검증
    expect(mockFindUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockCreateUser).toHaveBeenCalledTimes(1);

    // createUser에 전달된 비밀번호가 해싱되었는지 확인
    const createUserArg = mockCreateUser.mock.calls[0][0];
    expect(createUserArg.password).not.toBe('password123'); // 평문이 아니어야 함
  });

  it('이메일이 이미 존재하면 409 에러를 던져야 한다', async () => {
    // Arrange: 이미 존재하는 유저 시뮬레이션
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Existing User',
      email: 'test@example.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act & Assert: 에러가 던져지는지 검증
    await expect(authService.register(registerData)).rejects.toThrow();

    // createUser가 호출되지 않았어야 한다 (중복 체크에서 걸렸으니까)
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────
// login 테스트
// ──────────────────────────────────────
describe('authService.login', () => {
  const loginData = {
    email: 'test@example.com',
    password: 'password123',
  };

  it('올바른 비밀번호로 로그인하면 토큰을 반환해야 한다', async () => {
    // Arrange: DB에서 찾은 유저 시뮬레이션 (해싱된 비밀번호 포함)
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword, // bcrypt.compare()가 성공하도록 실제 해싱값 사용
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await authService.login(loginData);

    // Assert
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password');
  });

  it('존재하지 않는 이메일이면 에러를 던져야 한다', async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    await expect(authService.login(loginData)).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않습니다'
    );
  });

  it('비밀번호가 틀리면 에러를 던져야 한다', async () => {
    // Arrange: 다른 비밀번호로 해싱된 유저
    const hashedPassword = await bcrypt.hash('different_password', 10);
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(authService.login(loginData)).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않습니다'
    );
  });
});
```