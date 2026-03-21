// 라우트 정의: URL 패턴 + 미들웨어 + Controller 연결

import { Router } from 'express';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema';
import validate from '../middleware/validate';
import * as postController from './post.controller';

const router = Router();

router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.post('/', validate(createPostSchema), postController.createPost);
router.patch('/:id', validate(updatePostSchema), postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;
