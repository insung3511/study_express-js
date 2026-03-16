import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import AppError from '../errors/AppError';

// ====================================
// Zod 검증 미들웨어 (Chapter 3-Zod에서 만든 것 그대로 재사용)
// ====================================

const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body === undefined) {
      throw new AppError(400, '요청 본문(body)이 없습니다');
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
        .join(', ');

      throw new AppError(400, errorMessages);
    }

    req.body = result.data;
    next();
  };
};

export default validate;
