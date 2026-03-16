import { z } from 'zod';

// ====================================
// 유저 생성 스키마 (POST /users)
// ====================================
export const createUserSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z
    .string()
    .min(1, '이메일은 필수입니다')
    .email('올바른 이메일 형식이 아닙니다'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ====================================
// 유저 수정 스키마 (PATCH /users/:id)
// ====================================
// .partial() → 모든 필드를 선택적(optional)으로 만듦
// PATCH는 "부분 수정"이니까, name만 보내도 되고 email만 보내도 됨
export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
