import { Router } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import validate from '../middleware/validate';
import authenticate from '../middleware/auth.middleware';
import * as authController from './auth.controller';

const router = Router();

// 공개 라우트 — 토큰 없이 접근 가능
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// 보호된 라우트 — 토큰 필요
router.get('/me', authenticate, authController.getMe);

export default router;
