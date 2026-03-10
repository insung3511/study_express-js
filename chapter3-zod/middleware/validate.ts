import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import AppError from '../errors/AppError';

// ====================================
// Zod 검증 미들웨어
// ====================================
//
// 사용법:
//   app.post('/users', validate(createUserSchema), (req, res) => { ... });
//
// 동작 흐름:
//   1. 요청이 들어옴
//   2. validate(스키마)가 req.body를 스키마로 검증
//   3-A. 성공 → 검증된 데이터를 req.body에 덮어쓰고 next()
//   3-B. 실패 → AppError(400)를 throw → 에러 미들웨어에서 처리
//

// validate는 "스키마를 받아서 미들웨어 함수를 반환"하는 고차 함수
//
// 왜 고차 함수인가?
//   validate(createUserSchema)  → 미들웨어 함수 반환
//   validate(updateUserSchema)  → 다른 미들웨어 함수 반환
//   → 스키마만 바꾸면 어떤 라우트에든 재사용 가능!
//
const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // body가 아예 없는 경우 (Content-Type 헤더 없이 요청 등)
    if (req.body === undefined) {
      throw new AppError(400, '요청 본문(body)이 없습니다');
    }

    // safeParse: 실패해도 throw하지 않고 결과 객체를 반환
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // 검증 실패 → Zod 에러 메시지들을 추출해서 AppError로 변환
      const errorMessages = result.error.issues
        .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
        .join(', ');

      throw new AppError(400, errorMessages);
    }

    // 검증 성공 → 검증된(strip된) 데이터로 req.body를 덮어쓰기
    // 이렇게 하면 스키마에 없는 여분의 필드가 자동으로 제거됨 (보안!)
    req.body = result.data;

    // 다음 미들웨어(= 라우트 핸들러)로 이동
    next();
  };
};

export default validate;
