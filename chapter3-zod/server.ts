// ====================================
// server.ts — 서버 시작만 담당
// ====================================

import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 시작: http://localhost:${PORT}`);
  console.log(`환경: ${process.env.NODE_ENV}`);
  console.log('');
  console.log('테스트:');
  console.log(`  전체 조회:       curl http://localhost:${PORT}/users`);
  console.log(`  단건 조회:       curl http://localhost:${PORT}/users/1`);
  console.log(`  유저 생성:       curl -X POST http://localhost:${PORT}/users -H "Content-Type: application/json" -d '{"name":"박민수","email":"ms@test.com"}'`);
  console.log(`  검증 실패 (Zod): curl -X POST http://localhost:${PORT}/users -H "Content-Type: application/json" -d '{"name":"","email":"bad"}'`);
});
