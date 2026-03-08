// ====================================
// server.ts — 서버 시작만 담당
// app.ts에서 Express 앱을 가져와서 listen()만 실행
// ====================================

// dotenv를 가장 먼저 import → .env 파일의 값들을 process.env에 로드
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

// 이전: const PORT = 3000; ← 하드코딩
// 이후: .env에서 읽어옴. 없으면 기본값 3000 사용
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 시작: http://localhost:${PORT}`);
  console.log(`환경: ${process.env.NODE_ENV}`);
  console.log('');
  console.log('테스트:');
  console.log(`1) 정상 조회:        curl http://localhost:${PORT}/users/1`);
  console.log(`2) 없는 유저 (404):  curl http://localhost:${PORT}/users/999`);
  console.log(`3) 서버 크래시 (500): curl http://localhost:${PORT}/crash`);
});
