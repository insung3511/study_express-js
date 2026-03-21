// 라우트 정의: URL 패턴 + 미들웨어 + Controller 연결

import { Router } from 'express';
import { updateUserSchema } from '../schemas/user.schema';
import validate from '../middleware/validate';
import authenticate from '../middleware/auth.middleware';
import * as userController from './user.controller';

const router = Router();

// 공개 라우트
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

// 보호된 라우트 — 로그인 필요
router.patch('/:id', authenticate, validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

export default router;
