---
tags:
  - expressjs
  - eventim
  - intern
  - typescript
  - study
---

---
## Why JWT need?
JWT (JSON Web Token) 은 로그인한 사용자가 이후 요청에서 본인임을 증명할 수 있도록 하는 **토큰 기반 인증** 시스템이다. 서버가 "이 유저는 인증되었음!" 을  *서명된* 문자열로 만들어서 Client에게 전달하는 역할을 수행한다.
JWT의 서명된 문자열에는
- Header: 알고리즘 정보
- Payload: 담고 싶은 데이터 (`userId`, `expire_dates`)
- Signature: **Header + Payload + Private Key**로 만든 서명 -> 위변조 방지
로 구성된다.

> `JWT` 토큰을 붙여넣으면 Payload를 모두 볼 수 있게된다. 민감한 정보는 JWT에 쓰면 안되는 이유 중에 하나. 
> > **암호화가 아님! 서명 절차임**

## Flow of Registrations
사용자가 JWT를 통해 가입을 하게 된다면 아래와 같은 pipeline을 거친다.
```
Client Reques 
	→ app.ts (Router로 분배)
		→ auth.routes.ts (URL Matching + Zod 검증)
			→ auth.controller.ts (req/res 처리)
				→ auth.service.ts (Feature/비즈니스 로직: 해싱, 토큰 발급)
					→ user.repository.ts (DB 사용자 정보 저장)

```
### Register 로직
가입 로직은 새로운 사용자 등록에서 `email` 중복 확인, `hashing`이 추가된다. 이때 `hashing`에는 서버의 비밀키가 필요하며 비밀키는 `.env`에서 저장되어 처리된다.
```typescript
// auth.service.ts - 가입 로직
import bcrypt from 'bcrypt';         // 암호 해싱 라이브러리 
import jwt from 'jsonwebtoken';      // JWT 토근 생성/검증 라이브러리
const SALT_ROUNDS = 10;              // bcrypt가 해싱을 반복하는 횟수
const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {                   // 비밀키 검증 - .env 파일에 있는지 확인
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다');
}
```

```typescript
// auth.service.ts - 가입 로직
export async function register(data: RegisterInput) {
  const existing = await userRepository.findUserByEmail(data.email);
  if (existing) {
    throw new AppError(409, `이메일 ${data.email}은 이미 사용 중입니다`);
  }
  
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  const user = await userRepository.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,  // "mypassword123" → "$2b$10$..."
  });
  
  const token = generateToken(user.id);      // 가입 완료 시, 토큰 생성
  
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}
```
`User` Database table에는 `email`, `name`, `id` 등 이 있고 `password`이 들어가게 된다. 이때 `password`에는 평문이 아닌 암호화된 해싱값이 들어간다. 해싱은 `auth.service.ts` 에서 `bcrypt`를 사용하여 처리한다. 
 - 비밀번호 해싱 (암호화) -- `bcrypt.hash`: 
	 - `const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);`
	 - `salt`, 랜덤 생성을 위함으로 자동으로 생성된다.

### Login 로직
 Login 로직은 이미 가입이 완료된 유저가 다시 인증을 받는 과정이다. 가입은 register()에서, 재로그인은 login()에서 각각 독립적으로 토큰을 발급한다.
```typescript
// auth.service.ts - 로그인 로직
export async function login(data: LoginInput) {
  // 사용자 등록 확인 (email 또는 id로 확인) 
  const user = await userRepository.findUserByEmail(data.email);
  if (!user) {
    throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다');
  }
  
  // 확인된 사용자의 메일과 ID를 통해 비밀번호를 확인 
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 위 두 단계를 모두 통과 했다면 토큰을 생성
  const token = generateToken(user.id);
  const { password, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
}
```
- `bcrypt.compare(data.password, user.password);` : 평문 비밀번호와 암호화된 비밀번호를 비교하여 Boolean 값으로 반환

### Token 생성
Token은 Client에게 주는 열쇠와 같은 역할이다. Client (즉, 유저 및 사용자)는 계정 생성과 동시에 토큰이 생성되고 다시 로그인을 할때에도 Token을 통해서 접근이 가능해진다.
```typescript
// auth.service.ts - 토큰 생성 로직
function generateToken(userId: number): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
  } catch {
    throw new AppError(401, '유효하지 않거나 만료된 토큰입니다');
  }
}
```
`generateToken`은 export 안함. 파일 내부에서만 사용 -> **외부에서 직접 토큰 생성을 막고, 반드시 `register/login`을 거치도록 접근을 제한**
- `jwt.sign`: `userId`와 비밀키 (`JWT_SECRET`)을 통해서 토큰 생성, `expiresIn`은 토큰 파기일
	- 비밀키는 `.env`환경변수에 있음 -- 개발 프로젝트마다 다를 수는 있지만, 핵심은 **외부로 공개되면 안된다!**

`verifyToken`은 export 함. 파일 외부에서도 사용 -> **사용자 검증은 미들웨어에서도 진행**
- `jwt.verify`: 요청으로 받은 토큰 `token`과 비밀키를 통해서 검증을 진행. 
	- 만일 검증이 되었다면 `userId`를 반환함. 위조가 되었다면 `AppError`로 반환

### Controller - Request, Response 처리
Login, Register 처리에서 controller의 역할은 가입, 로그인, 검증 요청 및 응답만 처리한다. 실제 서비스와 가입 절차는 `auth.service.ts`에서 수행할 것이고 `auth.controller.ts`는 응답을 받으면 어떤 함수를 불러올 것인지를 정하는 역할.
```typescript
// auth.controller.ts
export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}
```

### Router - URL 연결
`app.ts`에서 `app.use('/auth', authRouter)`로 auth route handler를 마운트했다면 
- `POST /auth/register` -> Zod 검증 -> `controller.register` 
- `POST /auth/login` -> Zod 검증 -> `controller.login`
와 같이 Pipeline이 이어지게 된다.

```typescript
// auth.routes.ts
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
```

### Middleware - 토큰 검증
이 미들웨어는 요청 헤더의 JWT 토큰을 검증하여 로그인된 유저인지 확인하는 과정이다. Zod 검증(데이터 형식 확인)과는 별개의 미들웨어이다.
```typescript
// auth.middleware.ts
export default function authenticate(req, res, next) {
  // 1. 헤더에서 "Bearer eyJhbG..." 추출
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, '인증 토큰이 필요합니다');
  }
  // 2. "Bearer " 떼어내고 토큰만
  const token = authHeader.split(' ')[1];
  // 3. 토큰 검증
  const payload = verifyToken(token);
  // 4. req에 userId 붙이기
  (req as any).userId = payload.userId;
  next();  // 다음 핸들러로!
}
```
토큰이 있어야만 접근이 가능한 라우트, endpoint를 해당 미들웨어를 통해서 접근할 수 있게된다. Middleware가 없게 된다면, 인증 토큰 없이 접근이 가능하게 됨으로 특정 페이지 접근에 대한 인증이 필요할 때 사용하게 된다.

### Repository - Database 부분
`auth`가 아닌 `user`기능에서 `password` 없이 필드를 갖고오는 로직을 필요하다. API 응답에 비밀번호 노출을 안하기 위함으로 GET Method의 응답에서 비밀번호가 노출되지 않도록 한다.
```typescript
// user.repository.ts 
const userSelectWithoutPassword = {
  id: true, email: true, name: true,
  createdAt: true, updatedAt: true,
  // password는 안 적었으니 자동 제외
};

export async function findAllUsers() {
  return prisma.user.findMany({
    select: userSelectWithoutPassword,  // ← 추가
  });
}
```

## `Auth` 전체 흐름도
```
[회원가입]
"mypassword123" → bcrypt.hash() → "$2b$10$..." → DB 저장

[로그인]
DB에서 "$2b$10$..." 가져옴
"mypassword123" → bcrypt.compare("mypassword123", "$2b$10$...") → true
→ jwt.sign({ userId: 1 }) → "eyJhbG..." 토큰 발급

[인증된 요청] (아직 미적용)
"Bearer eyJhbG..." → jwt.verify() → { userId: 1 }
→ req.userId = 1 → 다음 핸들러에서 사용
```


## 관련 문서
- [[Basic of Express.js]]