// 🔵 Controller 레이어: HTTP 요청/응답만 담당
// req에서 데이터 꺼내기 → Service 호출 → res로 응답

import { Request, Response } from 'express';
import * as postService from './post.service';

// GET /posts
export async function getPosts(req: Request, res: Response) {
  const posts = await postService.getAllPosts();
  res.json(posts);
}

// GET /posts/:id
export async function getPostById(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  const post = await postService.getPostById(id);
  res.json(post);
}

// POST /posts
export async function createPost(req: Request, res: Response) {
  const { title, content, authorId, tags } = req.body;
  const post = await postService.createPost({ title, content, authorId, tags });
  res.status(201).json(post);
}

// PATCH /posts/:id
export async function updatePost(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  const post = await postService.updatePost(id, req.body);
  res.json(post);
}

// DELETE /posts/:id
export async function deletePost(req: Request, res: Response) {
  const id = Number(req.params.id as string);
  await postService.deletePost(id);
  res.status(204).send();
}
