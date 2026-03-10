import express, { Request, Response, NextFunction } from 'express';
import AppError from './errors/AppError';
import validate from './middleware/validate';
import { createUserSchema, CreateUserInput } from './schemas/user.schema';

const app = express();
app.use(express.json());

// ====================================
// 임시 데이터 (메모리 DB)
// ====================================
// 기존: interface User { id: number; name: string; email: string }
// 변경: CreateUserInput(= { name, email })에 id만 추가
//       → 스키마를 수정하면 이 타입도 자동으로 반영됨!
interface User extends CreateUserInput {
  id: number;
}

const users: User[] = [
  { id: 1, name: '김철수', email: 'chulsoo@test.com' },
  { id: 2, name: '이영희', email: 'younghee@test.com' },
];

// ====================================
// 라우트 핸들러들
// → 에러 상황에서 직접 res.status().json() 하지 않고
// → AppError를 throw만 하면 됨!
// ====================================

// 유저 전체 조회
app.get('/users', (req: Request, res: Response): void => {
  res.json({ users });
});

// 유저 단건 조회
app.get('/users/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string);

  // 숫자가 아닌 ID → 400 Bad Request
  if (isNaN(id)) {
    throw new AppError(400, 'ID는 숫자여야 합니다');
  }

  const user = users.find(u => u.id === id);

  // 유저 없음 → 404 Not Found
  if (!user) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  res.json({ user });
});

// 유저 생성
// ★ 변경 전: if문으로 name, email 수동 검증 (10줄)
// ★ 변경 후: validate(createUserSchema) 미들웨어가 자동 검증 (0줄!)
//
// 흐름: 요청 → validate(createUserSchema) → 핸들러
//       검증 실패 시 validate에서 AppError throw → 에러 미들웨어로 직행
//       검증 성공 시 req.body에 검증된 데이터가 들어온 채로 핸들러 실행
app.post('/users', validate(createUserSchema), (req: Request, res: Response): void => {
  // validate 미들웨어를 통과했으므로 req.body는 이미 검증 완료!
  // if문이 하나도 필요 없다
  const { name, email } = req.body;

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);

  res.status(201).json({ user: newUser });
});

// 의도적 크래시 (예상 못한 에러 테스트용)
app.get('/crash', (req: Request, res: Response): void => {
  const obj: any = null;
  obj.someMethod();
});

// ====================================
// 404 핸들러 (매칭되는 라우트 없음)
// ====================================
app.use((req: Request, res: Response): void => {
  throw new AppError(404, `${req.method} ${req.url} 은(는) 존재하지 않는 경로입니다`);
});

// ====================================
// ★ 에러 미들웨어 (모든 에러를 한 곳에서 처리) ★
// ====================================
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  console.error('=== 예상치 못한 에러 ===');
  console.error(`경로: ${req.method} ${req.url}`);
  console.error(`메시지: ${err.message}`);
  console.error(`스택: ${err.stack}`);

  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
    ...(isDev && {
      message: err.message,
      stack: err.stack,
    }),
  });
});

export default app;
