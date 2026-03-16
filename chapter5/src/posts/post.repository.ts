// 🟢 Repository 레이어: DB 접근만 담당
// Post 조회 시 author 정보를 함께 가져옴 (include)

import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

// 조회 시 공통으로 포함할 관계 데이터
const postInclude = {
  author: { select: { id: true, name: true } },
  tags: { select: { id: true, name: true } },
};

// 모든 게시글 조회
export async function findAllPosts() {
  return prisma.post.findMany({
    include: postInclude,
  });
}

// ID로 게시글 조회
export async function findPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

// 게시글 생성 (태그: 없으면 생성, 있으면 연결)
export async function createPost(data: { title: string; content?: string; authorId: number; tags?: string[] }) {
  const { tags, ...postData } = data;

  return prisma.post.create({
    data: {
      ...postData,
      tags: tags ? {
        // connectOrCreate: 태그가 이미 있으면 연결, 없으면 생성 후 연결
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      } : undefined,
    },
    include: postInclude,
  });
}

// 게시글 수정 (태그도 수정 가능)
export async function updatePost(id: number, data: { title?: string; content?: string; published?: boolean; tags?: string[] }) {
  const { tags, ...postData } = data;

  return prisma.post.update({
    where: { id },
    data: {
      ...postData,
      tags: tags ? {
        // set: [] → 기존 태그 연결을 모두 끊고
        set: [],
        // connectOrCreate → 새 태그 목록으로 교체
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      } : undefined,
    },
    include: postInclude,
  });
}

// 게시글 삭제
export async function deletePost(id: number) {
  return prisma.post.delete({
    where: { id },
  });
}
