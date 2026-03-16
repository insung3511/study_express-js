import { z } from 'zod';

// 회원가입 스키마 (POST /auth/register)
export const registerSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().min(1, '이메일은 필수입니다').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// 로그인 스키마 (POST /auth/login)
export const loginSchema = z.object({
  email: z.string().min(1, '이메일은 필수입니다').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호는 필수입니다'),
});

export type LoginInput = z.infer<typeof loginSchema>;
