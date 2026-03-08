import { Request, Response, NextFunction } from 'express';

// middleware2: 요청 로깅
// 어떤 요청이 들어왔는지 기록
const logger = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[Service1 - Middleware 2] logger 실행');
  const user = (req as any).user;
  console.log(`  → ${req.method} ${req.originalUrl} | User: ${user?.name}`);
  console.log('[Service1 - Middleware 2] 로깅 완료 → next() 호출');
  next();
};

export default logger;
