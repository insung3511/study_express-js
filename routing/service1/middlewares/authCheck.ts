import { Request, Response, NextFunction } from 'express';

// middleware1: 인증 확인
// 헤더에 'x-auth-token'이 있는지 확인
const authCheck = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[Service1 - Middleware 1] authCheck 실행');

  const token = req.headers['x-auth-token'] as string | undefined;

  if (!token) {
    console.log('[Service1 - Middleware 1] 토큰 없음! 여기서 멈춤 (next 호출 안 함)');
    res.status(401).json({ error: '인증 토큰이 필요합니다' });
    return;
  }

  // 토큰이 있으면 req에 user 정보를 붙여서 다음 미들웨어로 전달
  (req as any).user = { id: 1, name: 'TestUser', token };
  console.log('[Service1 - Middleware 1] 토큰 확인 완료 → next() 호출');
  next();
};

export default authCheck;
