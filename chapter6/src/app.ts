// Express 앱 설정만 담당 (라우터 등록 + 에러 핸들러)

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import authRouter from './auth/auth.routes';
import userRouter from './users/user.routes';
import postRouter from './posts/post.routes';
import AppError from './errors/AppError';

const app = express();

// 보안 헤더 자동 설정 (X-Powered-By 제거, CSP, HSTS 등)
app.use(helmet());

// CORS — localhost:3000 에서 오는 요청만 허용
app.use(cors({
  origin: 'http://localhost:3000',
}));

// 로그인/회원가입 전용 rate-limit — 1분에 5번까지만 허용
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  limit: 5,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 등록 — /auth 에만 rate-limit 적용
app.use('/auth', authLimiter, authRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);

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
