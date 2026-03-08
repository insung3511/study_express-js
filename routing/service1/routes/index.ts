import { Router, Request, Response } from 'express';
import authCheck from '../middlewares/authCheck';
import logger from '../middlewares/logger';
import validateBody from '../middlewares/validateBody';

const router = Router();

// ====================================
// 라우터 레벨 미들웨어 (이 라우터의 모든 요청에 적용)
// ====================================
router.use(authCheck);  // 스택[0]: 모든 요청에 인증 확인
router.use(logger);     // 스택[1]: 모든 요청에 로깅

// ====================================
// 라우트 핸들러들
// ====================================

// GET /users - 유저 목록 조회
// authCheck → logger → handler (미들웨어 2개만 통과)
router.get('/', (req: Request, res: Response): void => {
  console.log('[Service1 - Handler] GET /users 도달!');
  res.json({
    message: '유저 목록 조회 성공',
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });
});

// GET /users/:id - 특정 유저 조회
router.get('/:id', (req: Request, res: Response): void => {
  console.log(`[Service1 - Handler] GET /users/${req.params.id} 도달!`);
  res.json({
    message: `유저 ${req.params.id} 조회 성공`,
    user: { id: req.params.id, name: 'Alice' },
  });
});

// POST /users/create - 유저 생성
// authCheck → logger → validateBody → handler (미들웨어 3개 모두 통과)
router.post('/create', validateBody, (req: Request, res: Response): void => {
  console.log('[Service1 - Handler] POST /users/create 도달!');
  res.status(201).json({
    message: '유저 생성 성공',
    user: req.body,
  });
});

export default router;
