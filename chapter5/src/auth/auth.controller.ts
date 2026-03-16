import { Request, Response } from 'express';
import * as authService from './auth.service';
import * as userService from '../users/user.service';

// POST /auth/register
export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

// POST /auth/login
export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

// GET /auth/me — 토큰으로 내 정보 조회
export async function getMe(req: Request, res: Response) {
  // authenticate 미들웨어가 이미 토큰을 검증하고 userId를 붙여줌
  const userId = (req as any).userId;
  const user = await userService.getUserById(userId);
  res.json(user);
}
