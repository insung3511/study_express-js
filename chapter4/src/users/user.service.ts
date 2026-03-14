// 🟡 Service 레이어: 비즈니스 로직 담당
// HTTP(req/res)를 모르고, Prisma도 모름
// Repository를 통해서만 DB에 접근

import * as userRepository from './user.repository';
import AppError from '../errors/AppError';

// 전체 유저 목록 조회
export async function getAllUsers() {
  return userRepository.findAllUsers();
}

// 특정 유저 조회 (없으면 404 에러)
export async function getUserById(id: number) {
  const user = await userRepository.findUserById(id);

  if (!user) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }

  return user;
}

// 유저 생성 (이메일 중복 체크 포함)
export async function createUser(data: { name: string; email: string }) {
  // 비즈니스 규칙: 이메일 중복 불가
  const existing = await userRepository.findUserByEmail(data.email);

  if (existing) {
    throw new AppError(409, `이메일 ${data.email}은 이미 사용 중입니다`);
  }

  return userRepository.createUser(data);
}

// 유저 수정
export async function updateUser(id: number, data: { name?: string; email?: string }) {
  // 존재하는 유저만 수정 가능 (없으면 getUserById에서 404 에러)
  await getUserById(id);

  return userRepository.updateUser(id, data);
}

// 유저 삭제
export async function deleteUser(id: number) {
  // 존재하는 유저만 삭제 가능
  await getUserById(id);

  return userRepository.deleteUser(id);
}
