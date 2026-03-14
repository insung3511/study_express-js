// 🟡 Service 레이어: 비즈니스 로직 담당
// HTTP(req/res)를 모르고, Prisma도 모름

import * as postRepository from './post.repository';
import * as userService from '../users/user.service';
import AppError from '../errors/AppError';

// 전체 게시글 목록 조회
export async function getAllPosts() {
  return postRepository.findAllPosts();
}

// 특정 게시글 조회 (없으면 404 에러)
export async function getPostById(id: number) {
  const post = await postRepository.findPostById(id);

  if (!post) {
    throw new AppError(404, `ID ${id}인 게시글을 찾을 수 없습니다`);
  }

  return post;
}

// 게시글 생성 (작성자 존재 확인 포함)
export async function createPost(data: { title: string; content?: string; authorId: number; tags?: string[] }) {
  // 비즈니스 규칙: 존재하는 유저만 글을 쓸 수 있음
  await userService.getUserById(data.authorId);

  return postRepository.createPost(data);
}

// 게시글 수정
export async function updatePost(id: number, data: { title?: string; content?: string; published?: boolean; tags?: string[] }) {
  // 존재하는 게시글만 수정 가능
  await getPostById(id);

  return postRepository.updatePost(id, data);
}

// 게시글 삭제
export async function deletePost(id: number) {
  // 존재하는 게시글만 삭제 가능
  await getPostById(id);

  return postRepository.deletePost(id);
}
