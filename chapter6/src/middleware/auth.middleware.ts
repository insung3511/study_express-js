import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/auth.service';
import AppError from '../errors/AppError';

// 요청의 Authorization 헤더에서 JWT 토큰을 검증하는 미들웨어
// 사용법: router.get('/me', authenticate, controller.getMe)
export default function authenticate(req: Request, res: Response, next: NextFunction) {
  // 1. Authorization 헤더에서 토큰 추출
  //    형식: "Bearer eyJhbGciOiJI..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, '인증 토큰이 필요합니다');
  }

  // 2. "Bearer " 뒤의 실제 토큰 부분만 추출
  const token = authHeader.split(' ')[1];

  // 3. 토큰 검증 → userId 추출
  const payload = verifyToken(token);

  // 4. 검증된 userId를 req에 붙여서 다음 핸들러에서 사용 가능하게
  (req as any).userId = payload.userId;

  next();
}
