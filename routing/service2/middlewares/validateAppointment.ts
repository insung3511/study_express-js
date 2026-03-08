import { Request, Response, NextFunction } from 'express';

// middleware2: 예약 데이터 검증
const validateAppointment = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[Service2 - Middleware 2] validateAppointment 실행');

  const { date, description } = req.body as { date?: string; description?: string };

  if (!date || !description) {
    console.log('[Service2 - Middleware 2] 검증 실패! 멈춤');
    res.status(400).json({ error: 'date와 description은 필수입니다' });
    return;
  }

  console.log('[Service2 - Middleware 2] 검증 통과 → next()');
  next();
};

export default validateAppointment;
