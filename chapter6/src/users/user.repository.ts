// 🟢 Repository 레이어: DB 접근만 담당
// Prisma를 직접 사용하는 유일한 레이어
// 비즈니스 로직 없음 — "이메일 중복인지"는 Service가 판단

import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

// 비밀번호를 제외한 유저 필드 선택 (응답용)
const userSelectWithoutPassword = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  // password: false — select 사용 시 명시하지 않으면 자동 제외
};

// 모든 유저 조회
export async function findAllUsers() {
  return prisma.user.findMany({
    select: userSelectWithoutPassword,
  });
}

// ID로 유저 조회 (없으면 null 반환)
export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelectWithoutPassword,
  });
}

// 이메일로 유저 조회 (중복 체크용)
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

// 유저 생성
export async function createUser(data: { name: string; email: string; password: string }) {
  return prisma.user.create({ data });
}

// 유저 수정
export async function updateUser(id: number, data: { name?: string; email?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelectWithoutPassword,
  });
}

// 유저 삭제
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id },
  });
}
