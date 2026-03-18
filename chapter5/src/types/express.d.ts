// Express Request 타입 확장
// authenticate 미들웨어가 주입하는 userId를 타입으로 선언
// 이 파일 덕분에 (req as any).userId 대신 req.userId를 쓸 수 있다!

declare namespace Express {
  interface Request {
    userId?: number;  // optional: authenticate 미들웨어를 거치지 않은 라우트에서는 undefined
  }
}
