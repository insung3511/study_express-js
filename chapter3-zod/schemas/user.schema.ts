import { z } from 'zod';

// ====================================
// 유저 생성 스키마 (POST /users 요청의 body 검증용)
// ====================================
//
// 현재 app.ts의 수동 검증(if문)을 Zod 스키마로 대체:
//
//   if (!name)                → z.string().min(1)
//   if (!email)               → z.string().min(1)
//   if (!email.includes('@')) → z.string().email()
//
export const createUserSchema = z.object({
  // name: 문자열이어야 하고, 최소 1글자 이상 (빈 문자열 방지)
  name: z.string().min(1, '이름은 필수입니다'),

  // email: 문자열 + 최소 1글자 + 이메일 형식 검증
  // .min(1)을 먼저 → 빈 문자열이면 '이메일은 필수입니다' 메시지
  // .email()     → 형식 틀리면 '올바른 이메일 형식이 아닙니다' 메시지
  email: z
    .string()
    .min(1, '이메일은 필수입니다')
    .email('올바른 이메일 형식이 아닙니다'),
});

// ====================================
// 스키마에서 TypeScript 타입을 자동 추출
// ====================================
//
// z.infer는 스키마의 구조를 읽어서 TypeScript 타입으로 변환해준다.
// 이렇게 하면 스키마와 타입이 항상 동기화됨 (수동 interface 불필요!)
//
// 결과적으로 아래와 동일한 타입이 만들어짐:
//   type CreateUserInput = { name: string; email: string }
//
export type CreateUserInput = z.infer<typeof createUserSchema>;
