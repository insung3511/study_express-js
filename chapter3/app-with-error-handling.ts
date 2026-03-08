import express, { Request, Response, NextFunction } from 'express';

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
// [해결 1] 존재하지 않는 유저 → 명확한 404 응답
// ====================================
app.get('/users/:id', (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id as string);

  // id가 숫자가 아닌 경우 체크
  if (isNaN(id)) {
    res.status(400).json({
      error: 'ID는 숫자여야 합니다',
    });
    return;
  }

  const user = users.find(u => u.id === id);

  // 유저가 없으면 명확하게 404를 보냄
  if (!user) {
    res.status(404).json({
      error: `ID ${id}인 유저를 찾을 수 없습니다`,
    });
    return;
  }

  res.json({ user });
});

// ====================================
// [해결 2] 입력 검증 후 유저 생성
// ====================================
app.post('/users', (req: Request, res: Response): void => {
  const { name, email } = req.body;

  // 필수 필드 검증
  if (!name || !email) {
    res.status(400).json({
      error: '이름(name)과 이메일(email)은 필수입니다',
      received: { name: name ?? '없음', email: email ?? '없음' },
    });
    return;
  }

  // 이메일 형식 간단 체크
  if (!email.includes('@')) {
    res.status(400).json({
      error: '올바른 이메일 형식이 아닙니다',
    });
    return;
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);

  res.status(201).json({ user: newUser });
});

// ====================================
// [해결 3] 런타임 에러 → 에러 미들웨어가 잡아줌
// ====================================
app.get('/crash', (req: Request, res: Response): void => {
  const obj: any = null;
  obj.someMethod(); // 여전히 에러 발생!
  // → 하지만 아래 에러 미들웨어가 잡아서 깔끔한 JSON 응답을 보냄
});

// ====================================
// 404 핸들러 (매칭되는 라우트 없음)
// ====================================
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: `${req.method} ${req.url} 은(는) 존재하지 않는 경로입니다`,
  });
});

// ====================================
// ★ 에러 미들웨어 (4개 인자!) ★
// → 위에서 throw된 에러나 next(err)로 넘어온 에러를 여기서 일괄 처리
// → 반드시 4개의 인자를 써야 Express가 에러 미들웨어로 인식함!
// ====================================
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  // 서버 콘솔에는 상세 에러 기록 (개발자가 디버깅할 수 있도록)
  console.error('=== 에러 발생 ===');
  console.error(`경로: ${req.method} ${req.url}`);
  console.error(`메시지: ${err.message}`);
  console.error(`스택: ${err.stack}`);

  // 클라이언트에게는 깔끔한 JSON 응답
  // → 내부 구현 정보(스택 트레이스)를 노출하지 않음!
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
    message: err.message,
  });
});

// ====================================
// 서버 시작
// ====================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버 시작: http://localhost:${PORT}`);
  console.log('');
  console.log('=== 에러 핸들링 적용 버전 ===');
  console.log('');
  console.log('테스트해볼 것:');
  console.log('1) 없는 유저 조회:');
  console.log('   curl http://localhost:3000/users/999');
  console.log('');
  console.log('2) ID가 숫자가 아닌 경우:');
  console.log('   curl http://localhost:3000/users/abc');
  console.log('');
  console.log('3) 불완전한 데이터로 생성:');
  console.log('   curl -X POST -H "Content-Type: application/json" -d \'{}\' http://localhost:3000/users');
  console.log('');
  console.log('4) 이메일 형식 틀림:');
  console.log('   curl -X POST -H "Content-Type: application/json" -d \'{"name":"박지민","email":"wrong"}\' http://localhost:3000/users');
  console.log('');
  console.log('5) 서버 크래시 (에러 미들웨어가 잡음):');
  console.log('   curl http://localhost:3000/crash');
  console.log('');
  console.log('6) 없는 경로:');
  console.log('   curl http://localhost:3000/blahblah');
});
