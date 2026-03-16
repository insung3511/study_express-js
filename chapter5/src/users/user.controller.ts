// 🔵 Controller 레이어: HTTP 요청/응답만 담당
// req에서 데이터 꺼내기 → Service 호출 → res로 응답

import { Request, Response } from 'express';
import * as userService from './user.service';

// GET /users
export async function getUsers(req: Request, res: Response) {
  const users = await userService.getAllUsers();
  res.json(users);
}

// GET /users/:id
export async function getUserById(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  const user = await userService.getUserById(id);
  res.json(user);
}

// POST /users — 이제 회원가입은 POST /auth/register로 이동
// 관리자용 유저 생성이 필요하면 여기에 구현
// export async function createUser(req: Request, res: Response) {
//   const user = await userService.createUser(req.body);
//   res.status(201).json(user);
// }

// PATCH /users/:id
export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  const user = await userService.updateUser(id, req.body);
  res.json(user);
}

// DELETE /users/:id
export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  await userService.deleteUser(id);
  res.status(204).send();
}
