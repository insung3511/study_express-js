// ====================================
// Zod 동작 확인용 테스트 스크립트
// 실행: npx ts-node schemas/test-zod.ts
// 학습 후 삭제해도 됨!
// ====================================

import { createUserSchema } from './user.schema';

console.log('========================================');
console.log('1. 정상 데이터 → parse() 성공');
console.log('========================================');

const validData = { name: '김철수', email: 'chulsoo@test.com' };
const result = createUserSchema.parse(validData);
console.log('결과:', result);
// → { name: '김철수', email: 'chulsoo@test.com' }

console.log('\n========================================');
console.log('2. 이름 누락 → parse()가 ZodError를 throw');
console.log('========================================');

try {
  createUserSchema.parse({ email: 'chulsoo@test.com' });
} catch (error: any) {
  console.log('에러 타입:', error.constructor.name);
  console.log('에러 상세:', error.issues);
}

console.log('\n========================================');
console.log('3. 이메일 형식 틀림 → 커스텀 에러 메시지');
console.log('========================================');

try {
  createUserSchema.parse({ name: '김철수', email: 'not-an-email' });
} catch (error: any) {
  console.log('에러 상세:', error.issues);
}

console.log('\n========================================');
console.log('4. safeParse() — throw 없이 결과 객체 반환');
console.log('========================================');

const good = createUserSchema.safeParse({ name: '이영희', email: 'yh@test.com' });
console.log('성공:', good);

const bad = createUserSchema.safeParse({ name: '', email: 'bad' });
console.log('\n실패:', JSON.stringify(bad, null, 2));

if (!bad.success) {
  console.log('\n실패 이유:');
  bad.error.issues.forEach((e) => {
    console.log(`  - [${e.path.join('.')}] ${e.message}`);
  });
}

console.log('\n========================================');
console.log('5. 여분 필드 → 자동 제거 (strip)');
console.log('========================================');

const extraData = { name: '박민수', email: 'ms@test.com', age: 25, role: 'admin' };
const stripped = createUserSchema.parse(extraData);
console.log('결과:', stripped);
// → { name: '박민수', email: 'ms@test.com' } — age, role은 제거됨!
