// process.env에 TypeScript 타입 입히기
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    NODE_ENV: 'development' | 'production';
    JWT_SECRET: string;  // JWT 서명에 사용할 비밀키
  }
}
