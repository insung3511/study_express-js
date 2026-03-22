---
tags:
  - eventim
  - intern
  - expressjs
  - typescript
  - study
---

## Concept of Express.JS
#Expressjs 는 #Nodejs 에 종속적인 웹 애플리케이션 프레임워크로, Express는 웹 및 모바일에 최적화 되어 있음. 각종 라이브러리와 미들웨어가 내장되어 있어서 개발에 용이함. Express.JS는 Node.JS 필수적으로 요구하는 종속적인 관계로서, Express.JS는 Node.JS를 사용하여 쉽게 서버를 구성하는 클래스와 라이브러리의 집합체와 같음.

## Directory Structure of Express.JS
```
Example by Claude Opus 4.6

src/
├── common/                    ← 공통 모듈
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── apiError.ts
│   │   └── catchAsync.ts
│   └── types/
│       └── index.ts
├── modules/                   ← 기능별로 완전 분리
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   ├── user.validation.ts
│   │   └── user.test.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.test.ts
│   └── appointment/
│       ├── appointment.controller.ts
│       ├── appointment.service.ts
│       ├── appointment.model.ts
│       ├── appointment.routes.ts
│       └── appointment.test.ts
├── config/
│   └── env.ts
├── app.ts
└── server.ts
```
위는 실무에서 사용하는 Express.JS의 형식을 예시로 보여주고 있다. 이는 기능별 구조의 경우에 나타나게 된다. `common/middleware`는 스택에 따라 구분하는 인증절차를 위한 Middleware의 역할. 
- `auth.middleware.ts`: `user`와 `appointment`간의 의존성을 제거하기 위해서 공통 폴더로 뺌.
- `utils`: API의 오류와 비동기처리를 담당하는 코드 등 도구로 쓰이는 코드
- `types`: 공통 타입 ()

각 기능별로 `module`를 분류해둠. 

사용자에 관련된 정보는 `users`
- `user.controller.ts`는 요청과 응답을 처리
- `user.services.ts`는 비즈니스 로직 -> 실제 업무적인 처리를 진행 (기능 제 역할 수행)
- `user.model.ts`는 데이터 구조의 정의 (DB Schema 정의,메모리 배열 등)
- `user.routes.ts`는 요청 Method에 대한 정의 (`user/:id`, `user/create`에 연결 담당)
- `user.validation.ts`는 요청 검증 절차를 위함. 
	- 검증 성공 시, `next()`를 통해 `controller`에게 넘김. 실패 시, Error로 종료
- `user.test.ts`는 모듈 테스트 과정
위와 같이 정의됨. `users.XXX.ts`는 각각의 다른 **layer**로 구분된다. 각자의 역할을 수행하는 것으로 나뉨. 서로가 독립적인 역할을 수행하게 된다! `auth`, `appointment`도 동일함.

`app.ts` vs `server.ts`, 는 개발방식에 차이가 있음. `app.ts`는 Expres App을 띄우는 경우, `server.ts`는 Server를 띄우는 경우로 나뉨. 최종적으로 `app`은 export만 진행을 하게 되고 `server`를 따로 띄우게 되어서 요청을 받는 서버는 `server.ts`가 담당하게 된다.
## Routing
Routing은 사용자의 요청에 응답하는 방식. GET, POST 방식으로 처리가 된다. 타 처리 방식은 `app.METHOD` 로 처리. 라우터의 매개변수는 URL의 `/request/request_content`와 같이 처리됨.

Routing의 방식에서도 각자 다른 역할이 있다. GET, POST, DELETE 등이 있으며 이에 따라 각자 다른 핸들러로 가게 된다. GET의 경우에는 body가 없음. URL의 Params를 통해서 변수를 받지만 POST의 경우에는 Body 를 요구하게 된다. Body 정보가 있어야 유효함.
```
GET  /users/create → router.get('/:id')    ← id="create"로 조회
POST /users/create → router.post('/create') ← 유저 생성
```
 - GET: 조회, 읽기, Body not required
 - POST: 생성 `(CREATE)`, Body required
 - PUT: 전체 수정 `(MODIFIE)`, Body required
 - PATCH: 부분 수정`(MODIFIE)` , Body required
 - DELETE: 삭제, Body not required (보통은 요구되지 않음)

### Advanced Routing
- 라우트 패턴 매칭 (`/ab*cd`, 정규식)
	- `app.get('/ab?cd', (req, res) => {` 의 경우 `acd` 경로와 `abcd`와 일치함
	- `app.get('/ab+cd', (req, res) => {` 의 경우 `abcd`,  `abbcd`, `abbbcd` 와 일치함
	- `app.get('/ab*cd', (req, res) => {` 의 경우 `abxcd`, `abRABD0Mcd`, `ab1234cd` 와 일치함
- app.route() — 같은 경로에 여러 메서드 체이닝
- req.params에서 여러 파라미터 (/users/:userId/posts/:postId)
```
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }
```

Routing에서는 Middleware Chain을 결정 짓기도 한다. 어떤 Middleware를 거치게 될지를 정한다. 검증이 필요한 Request의 경우에는 `authCheck`와 같은 Middleware를 통과 후 `handler (route handler)`로 이동. 

정리하면...
1. 경로 매칭 - 어떤 *Feature*로 이동하여 기능을 수행할 것인가?
2. Method 매칭 - `GET, POST, PUT, DELETE, PATCH` 등 들어온 Method에 따라 들어감
3. Middleware Chain 구성 - 요청과 Method에 근거하여 Middleware Pipeline을 구성
4. 경로 접두사 관리 - 실제 요청이 `/users/12` 였다면 router는 `router.get('/')`와 같이 *상대 경로*만 처리
### Example code
```typescript
const express = require('express');
const app = express();
const port = 8080;

app.get('/', function (req, res) {
	res.send('Hello, World!');
})

app.post('/', function (req, res) {
	res.send('Hello, World!');
})

app.delete('/', function (req, res) {
	res.send('Hello, World!');
})

// ... using other method routing

app.listen(port);
```

## Middleware
Middleware는 Request와 Response 사이에서 실행되는 함수 개념. Routing이 URL에 대한 요청을 처리한다면 Middleware는 라우팅 과정 중에 Request와 Response, 즉 Body를 보내는 과정에 역할과 같다. Middleware는 **Routing Stack의 일부임!!**
```typescript
// 미들웨어 예시
app.use((req, res, next) => {
  console.log('요청 시간:', Date.now());
  next(); // 다음 미들웨어 또는 라우트로 넘김
});
// 라우트 핸들러
app.get('/users', (req, res) => {
  res.send('유저 목록');
});
```

비유를 들면, 
```
  식당에서 손님(Request)가 입장        <---- Request
		    |
코트를 맡기고, 신분증을 확인, 자리 안내    <---- Middleware
			|
	최종적인 주문을 받는 역할           <---- Route Handler
	
*Request* -> Middleware 1 -> Middleware 2 -> Route Handler -> *Response*
```
실질적으로 코드의 본 내용이 움직이는거는 Middleware의 역할임!

코드에서는 **Middleware Stack**이라는 배열이 있음. 최초 선언 시에 사용할 디렉토리 들을 선언을 통해서 Middleware 경로를 생성하게 됨. 만약에 `GET /users/123` 이라는 요청이 오게 되면 `app.use('/users')` 라는 경로를 통해서 실행하게 됨. 

서비스 분리는 Router를 모듈화 `const router = express.Router();`가 된 후에 `app.use('경로', router)` 로 경로가 정해지게 된다. Express 라우팅 핵심은 **선형 스택 순회와 경로 패턴 매칭** 이 핵심! 중요한거는 Middleware를 이어가기 위해서는 `next() = 다음 스택으로 넘겨라 = 다음 Middleware로 넘겨라`.
## Using `next()`, `.send()`

 - `next()`는 다음 미들웨어 또는 라우트로 제어를 넘기는 것임. 유저는 최종적으로 마지막 라우트의 응답을 받게 됨. 
 - `res.send()`는 HTTP 응답을 보내고 요청-응답 사이클을 종료하는 Method
	 - 최종적인 응답을 보내는 Method. Endpoint에 반드시 응답 Body가 있어야함.

```plain
	USER                   SERVER
	 |                       |
	 | --{req: /users/1}---> |
	 |                       |
	 |              [res.send(USER_INFO)]
	 |                       |
	 | <-{res: User info }-- |
	 |                       |
	======= END SESSION =======
```
`next()` 는 반드시 다음 라우터로 이어가기 위한 Middleware 간의 중간다리 역할로 다음 스택에 대한 정의를 구체화함. 
## Static
정적 파일이란 `style.css`, `image.png`, `index.html` ... 등 와 같이 이미지, 코드, 파일 등을 의미한다. 
```typescript
express.static(root, [options])

// Example to using static files under public directory
app.use(express.static('public'))

http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
```
위와 같이 진행을 하게 되면 `public` 아래의 디렉토리에 접근이 가능하게 된다. 

만일 `public` 디렉토리 안에 있는 파일들을 (예시로) `static` 이라는 가상 경로로 불러올려면 아래와 같이 진행한다.
```typescript
app.use('/static', express.static('public'))

http://localhost:3000/static/images/kitten.jpg
http://localhost:3000/static/css/style.css
http://localhost:3000/static/js/app.js
http://localhost:3000/static/images/bg.png
http://localhost:3000/static/hello.html
```

---

## 관련 문서
- [[Basis of Zod]]
- [[Environment Variables]]
- [[Primsa ORM + Database]]
- [[Erro Handling]]
- [[JWT Auth & Security]]
- [[Eventim Interview]]
