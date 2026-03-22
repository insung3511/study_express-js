서버에 요청을 보내면 돌아오는 응답 헤더는 `Express` 라는게 나타난다. 문제는 이 헤더를 이용하여 공격자가 무차별 대입 공격을 시도할 수 있다. 
```js
 for i in {1..1000}; do curl -X POST /auth/login -d '{"email":"...", "password":"guess"}'; done
```
- `helmet`: 위험한 응답 헤더를 제거 + 보안 헤더를 추가
- `CORS`: 허용된 출처(origin)만 API 호출이 가능하케 함
- `express-rate-limit`: IP당 요청 횟수 제한

## Helmet 🪖
```typescript
app.use(helmet())
```
위 코드 한줄로 아래의 역할을 수행할 수 있게 된다.
- `X-Powered-By`제거: 서버 기술 스택을 숨김, 공격자는 Backend Framework를 통해서 취약점을 파악할 수 있다.
- `X-Frame-Option: SAMEORIGIN`: 클릭재킹 (`iframe` 공격) 방어, 사용자도 모르게 클릭하게 만드는 클랙재킹 공격을 방지할 수 있음.
- `X-Content-Type-Option: nosniff`: MIME  타입 스니핑 방어, XSS 공격와 같이 파일 업로드에 주의를 기울임.
- `Strict-Transport-Security`: 중간 HTTP 공격 MIME 공격 방어
- `Content-Security-Policy`: XSS 공격 방어, 허용되지 않은 페이지를 JS로 끌어오는 취약점 방지

## CORS
CORS는 브라우저의 동일 출처 정책(Same-Origin Policy) 때문에 필요하다. 브라우저는 기본적으로 다른 출처(도메인/포트)로의 요청을 차단한다. `cors()` 미들웨어는 서버가 Access-Control-Allow-Origin 헤더를 응답에 붙여줘서 브라우저가 요청을 허용하게 만든다. Preflight는 그 허락을 구하는 사전 요청이다.

## `rate-limit` 동작 원리
요청이 들어온 IP를 `n`분에 `m`번까지만 허용하는 방식이다. 이때 `m > limit` 이 되면 `429 Too Many Request`를 보내어 더 이상 동작하지 못하게 한다.