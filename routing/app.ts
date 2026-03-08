import express, { Request, Response, NextFunction } from 'express';
import service1Router from './service1/routes';
import service2Router from './service2/routes';

const app = express();

// ====================================
// App 레벨 미들웨어 (모든 요청에 적용)
// ====================================
app.use(express.json());

// 모든 요청에 대한 글로벌 로깅
app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log('\n========================================');
  console.log(`[App 레벨] 새 요청: ${req.method} ${req.url}`);
  console.log('========================================');
  next();
});

// ====================================
// 서비스별 라우터 마운트
// ====================================
app.use('/users', service1Router);             // /users/* → service1
app.use('/appointments', service2Router);       // /appointments/* → service2

// ====================================
// 404 핸들러
// ====================================
app.use((req: Request, res: Response): void => {
  console.log('[App 레벨] 매칭되는 라우트 없음 → 404');
  res.status(404).json({ error: `${req.method} ${req.url} 은(는) 존재하지 않는 경로입니다` });
});

// ====================================
// 서버 시작
// ====================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버 시작: http://localhost:${PORT}`);
  console.log('');
  console.log('테스트 명령어:');
  console.log('');
  console.log('--- Service1 (Users) ---');
  console.log('1) 토큰 없이 (MW1에서 멈춤):');
  console.log('   curl http://localhost:3000/users');
  console.log('');
  console.log('2) 토큰 있이 GET (MW1→MW2→Handler):');
  console.log('   curl -H "x-auth-token: abc123" http://localhost:3000/users');
  console.log('');
  console.log('3) POST body 없이 (MW3에서 멈춤):');
  console.log('   curl -X POST -H "x-auth-token: abc123" -H "Content-Type: application/json" http://localhost:3000/users/create');
  console.log('');
  console.log('4) POST 전부 통과:');
  console.log('   curl -X POST -H "x-auth-token: abc123" -H "Content-Type: application/json" -d \'{"name":"Alice","email":"alice@test.com"}\' http://localhost:3000/users/create');
  console.log('');
  console.log('--- Service2 (Appointments) ---');
  console.log('5) 영업시간 외 (MW1에서 멈춤):');
  console.log('   curl -H "x-override-hour: 22" http://localhost:3000/appointments');
  console.log('');
  console.log('6) 영업시간 내 GET:');
  console.log('   curl -H "x-override-hour: 12" http://localhost:3000/appointments');
  console.log('');
  console.log('7) 예약 생성 전부 통과:');
  console.log('   curl -X POST -H "x-override-hour: 12" -H "Content-Type: application/json" -d \'{"date":"2026-03-10","description":"미팅"}\' http://localhost:3000/appointments/create');
});
