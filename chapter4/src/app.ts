// Express 앱 설정만 담당 (라우터 등록 + 에러 핸들러)

import express, { Request, Response, NextFunction } from 'express';
import userRouter from './users/user.routes';
import AppError from './errors/AppError';

const app = express();

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 등록
app.use('/users', userRouter);

// 에러 핸들링 미들웨어 (4인자 — 반드시 마지막에!)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
  });
});

export default app;
