import express, { Request, Response, NextFunction } from 'express';
import AppError from './errors/AppError';

const app = express();
app.use(express.json());

// ====================================
// 임시 데이터 (메모리 DB)
// ====================================
interface User {
  id: number;
  name: string;
  email: string;
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
app.post('/users', (req: Request, res: Response): void => {
  const { name, email } = req.body;

  // 필수 필드 누락 → 400 Bad Request
  if (!name || !email) {
    throw new AppError(400, '이름(name)과 이메일(email)은 필수입니다');
  }

  // 이메일 형식 체크
  if (!email.includes('@')) {
    throw new AppError(400, '올바른 이메일 형식이 아닙니다');
  }

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
  // AppError가 아닌 일반 에러 → 에러 미들웨어가 500으로 처리
  const obj: any = null;
  obj.someMethod();
});

// ====================================
// 404 핸들러 (매칭되는 라우트 없음)
// → 이것도 AppError를 throw!
// ====================================
app.use((req: Request, res: Response): void => {
  throw new AppError(404, `${req.method} ${req.url} 은(는) 존재하지 않는 경로입니다`);
});

// ====================================
// ★ 에러 미들웨어 (모든 에러를 한 곳에서 처리) ★
//
// AppError인 경우 → 해당 상태코드와 메시지 사용
// 일반 Error인 경우 → 500으로 처리
// ====================================
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  // AppError인지 판별
  if (err instanceof AppError) {
    // 우리가 의도적으로 던진 에러 → 해당 상태코드 사용
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // AppError가 아닌 예상 못한 에러 → 500
  console.error('=== 예상치 못한 에러 ===');
  console.error(`경로: ${req.method} ${req.url}`);
  console.error(`메시지: ${err.message}`);
  console.error(`스택: ${err.stack}`);

  // 개발 환경: 에러 상세 정보를 응답에 포함 (디버깅용)
  // 운영 환경: 상세 정보를 숨김 (보안)
  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
    // 개발 환경에서만 상세 정보 포함
    ...(isDev && {
      message: err.message,
      stack: err.stack,
    }),
  });
});

// app만 export — server.ts에서 가져다 listen() 실행
export default app;
