import { Request, Response, NextFunction } from 'express';

// middleware3: POST 요청의 body 검증
// name과 email이 있는지 확인
const validateBody = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[Service1 - Middleware 3] validateBody 실행');

  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    console.log('[Service1 - Middleware 3] body 검증 실패! 여기서 멈춤');
    res.status(400).json({ error: 'name과 email은 필수입니다' });
    return;
  }

  console.log('[Service1 - Middleware 3] body 검증 통과 → next() 호출');
  next();
};

export default validateBody;
