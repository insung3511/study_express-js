// Jest 설정 파일
// ts-jest를 사용해서 TypeScript 테스트를 바로 실행

export default {
  // ts-jest 프리셋: TypeScript → JavaScript 변환을 ts-jest가 담당
  preset: 'ts-jest',

  // 테스트 환경: Node.js (브라우저가 아닌 서버 테스트)
  testEnvironment: 'node',

  // 테스트 파일 위치 패턴
  // __tests__ 폴더의 .test.ts 파일 또는 .spec.ts 파일을 찾음
  testMatch: ['<rootDir>/src/**/*.test.ts'],

  // .env 파일을 테스트 시작 전에 자동 로드
  // dotenv/config 모듈이 require되면 자동으로 .env를 읽어줌
  setupFiles: ['dotenv/config'],
};
