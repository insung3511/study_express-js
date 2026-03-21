import { z } from 'zod';

// ====================================
// 게시글 생성 스키마 (POST /posts)
// ====================================
export const createPostSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  content: z.string().optional(),             // 본문은 선택
  authorId: z.number().int('작성자 ID는 정수여야 합니다'),
  tags: z.array(z.string().min(1)).optional(),    // 태그 이름 배열 (선택)
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// ====================================
// 게시글 수정 스키마 (PATCH /posts/:id)
// ====================================
export const updatePostSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),          // 공개 여부 변경
  tags: z.array(z.string().min(1)).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
