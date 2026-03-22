---
tags:
  - expressjs
  - eventim
  - intern
  - study
---
## What is Error Handling?
Express.js에서 말하는 Error Handling 이란, 동기 및 비동기적으로 발생하는 에러를 포착, 처리하는 방식을 의미한다. Middleware와 Route Handler 그 중간에서 위치하여 모든 에러를 포착하는 것이 중요하다. 

기본적으로 에러가 발생하는 것에 어떻게 처리를 할 것인지를 정하게 된다. 만약에 Error Handling이 없는 코드에서 에러가 발생하게 된다면 `body`가 없는 `200 OK`를 Response 한다 -- 무의미한 성공을 보냄. 

### Example Code w/ Error Handling
```typescript
// ====================================
// [해결 1] 존재하지 않는 유저 → 명확한 404 응답
// ====================================
app.get('/users/:id', (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id as string);

  // id가 숫자가 아닌 경우 체크
  if (isNaN(id)) {
    res.status(400).json({
      error: 'ID는 숫자여야 합니다',
    });
    return;
  }

  const user = users.find(u => u.id === id);

  // 유저가 없으면 명확하게 404를 보냄
  if (!user) {
    res.status(404).json({
      error: `ID ${id}인 유저를 찾을 수 없습니다`,
    });
    return;
  }

  res.json({ user });
});
```
`if (!user)` 등와 같은 구문을 통해서 Error를 잡아내고 잡아낸 에러를 어떤 Response로 보내는지, 정의하는 방법은 사용자의 근거하여 달라진다. 위 코드는 Express가 제공하는 *공식 에러 Middleware 패턴*, 회사나 기업에서는 Custom Error Handling을 활용하기도 한다.

Express의 Error Handling Function (혹은 Error Middleware) 는 인자 개수로 판단된다. 
- `app.use((req, res, next) => { ... }` : 일반적인 Middleware function 
- `app.use((err, req, res, next) => { ... }` : Error Middleware function 

Error Handling의 Pipeline은 Middleware를 거치고 Error가 발생하게 되면 Error Middleware로 이동하게 되는 흐름. 정상적인 트랙에서는 `next()`를 통해 다음 Middleware로 진행하게 된다면, 에러가 있는 트랙에서는 다음 Middleware가 정해져 있어도 Error Middleware (Error Handler) 로 넘어감.
```
Request -> Middleware 1 --next()--> Middleware 2 --next()--> Route Handler -*Error emerge* -> Error Middleware -> Respond
```
## Custom Error Handling
기존에는 각 Feature의 라우터에서 Error Response를 처리하고 있었음. 이 경우에는 Router가 늘어라고 Feature가 늘어나게 되면 Error Handling이 복잡하게 된다. 따라서 Error Handling을 한 곳에서 처리하게 되어 일괄처리가 가능해짐.
### Example Code
```typescript
// == app.ts ==
// 유저 전체 조회
app.get('/users', (req: Request, res: Response): void => {
  res.json({ users });
});

// 유저 단건 조회
app.get('/users/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string);

  // 숫자가 아닌 ID → 400 Bad Request
  if (isNaN(id)) {
    throw new AppError(400, 'ID는 숫자여야 합니다');
  }

  const user = users.find(u => u.id === id);

  // 유저 없음 → 404 Not Found
  if (!user) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  res.json({ user });
});

// == errors/AppError.ts ==
class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    // 부모 클래스(Error)의 생성자 호출 → this.message 설정
    super(message);

    this.statusCode = statusCode;

    // 클래스 이름이 "AppError"로 표시되도록 설정
    // (이걸 안 하면 그냥 "Error"로 표시됨)
    this.name = 'AppError';
  }
}

export default AppError;
```
기존에는 `res.status(ERROR_CODE).json({ ... })`와 같이 처리되던 방식에서 `throw new AppError(ERROR_CODE, ERROR_MESSAGE)`와 같이 처리가 된다. 

간단한 예시로 Error Response에 timestamp가 필요하지만 각기 다른 라우터에서 Error response를 한다면 각각의 feature의 response를 수정해줘야함. 한개의 Error Handler로 넘기게 되면 간단해짐! `AppError`가 없이도 `throw new Error( ... )`로 에러를 보낼 수 있지만 상태코드가 `500`으로 고정된다는 문제가 있다. 

```
[라우트 핸들러]
  유저 없음? → throw new AppError(404, '유저 없음')
  입력 잘못됨? → throw new AppError(400, '이메일 필수')
  예상 못한 버그? → throw new Error() (자동 발생)
       ↓
       ↓  모든 에러가 여기로 모임
       ↓
[에러 미들웨어 (Custom Error Handler)]
  AppError면? → err.statusCode 사용 (404, 400 등)
  그냥 Error면? → 500으로 처리
       ↓
[클라이언트에게 깔끔한 JSON 응답]
```

---

## 관련 문서
- [[Basic of Express.js]]
- [[Basis of Zod]]
