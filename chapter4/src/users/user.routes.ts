// 라우트 정의: URL 패턴 + 미들웨어 + Controller 연결

import { Router } from 'express';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import validate from '../middleware/validate';
import * as userController from './user.controller';

const router = Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(createUserSchema), userController.createUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
