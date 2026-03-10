import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { createUserSchema, updateUserSchema } from './schemas/user.schema';
import validate from './middleware/validate';
import AppError from './errors/AppError';

const app = express();
const prisma = new PrismaClient();

// JSON 파싱 미들웨어
app.use(express.json());

// ───── GET /users ─────
// 전체 유저 목록 조회
app.get('/users', async (req: Request, res: Response) => {
  // 이전: users 배열에서 꺼냄
  // 지금: DB에서 조회!
  const users = await prisma.user.findMany();
  res.json(users);
});

// ───── GET /users/:id ─────
// 특정 유저 조회
app.get('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  res.json(user);
});

// ───── POST /users ─────
// 유저 생성 (Zod 검증 → Prisma 저장)
app.post('/users', validate(createUserSchema), async (req: Request, res: Response) => {
  const { name, email } = req.body;

  // 이메일 중복 체크 (DB 레벨에서 @unique가 있지만, 친절한 에러 메시지를 위해)
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError(409, `이메일 ${email}은 이미 사용 중입니다`);
  }

  // DB에 저장! (이전: users.push() → 지금: prisma.user.create())
  const user = await prisma.user.create({
    data: { name, email },
  });

  res.status(201).json(user);
});

// ───── PATCH /users/:id ─────
// 유저 부분 수정
app.patch('/users/:id', validate(updateUserSchema), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // 존재 확인
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  // 부분 수정 (req.body에 있는 필드만 업데이트)
  const user = await prisma.user.update({
    where: { id },
    data: req.body,
  });

  res.json(user);
});

// ───── DELETE /users/:id ─────
// 유저 삭제
app.delete('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  await prisma.user.delete({
    where: { id },
  });

  res.status(204).send();
});

// ───── 에러 핸들링 미들웨어 ─────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // 예상치 못한 에러
  console.error(err);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
  });
});

export default app;
