// ====================================
// process.env에 타입을 입히는 파일
//
// 이게 없으면: process.env.PORT → string | undefined (뭐가 있는지 모름)
// 이게 있으면: process.env.PORT → string (자동완성도 됨!)
// ====================================

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
