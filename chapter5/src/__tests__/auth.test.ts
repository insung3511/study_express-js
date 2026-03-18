// Auth API 테스트
// Supertest로 서버를 켜지 않고 HTTP 요청을 보내서 API를 검증한다

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────
// 테스트에서 사용할 고정 데이터
// ──────────────────────────────────────
const testUser = {
  name: 'Test User',
  email: 'test-jest@example.com',
  password: 'password123',
};

// ──────────────────────────────────────
// 테스트 전후 DB 정리
// ──────────────────────────────────────

// 모든 테스트 시작 전: 혹시 남아있는 테스트 데이터 삭제
beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
});

// 모든 테스트 끝난 후: 테스트 데이터 삭제 + DB 연결 종료
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
  await prisma.$disconnect();
});

// ──────────────────────────────────────
// 회원가입 테스트
// ──────────────────────────────────────
describe('POST /auth/register', () => {
  it('새 유저를 등록하고 토큰을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    // 비밀번호가 응답에 포함되면 안 된다! (보안)
    expect(res.body.user.password).toBeUndefined();
  });

  it('이미 존재하는 이메일이면 409를 반환해야 한다', async () => {
    // 위 테스트에서 이미 등록됐으므로 같은 이메일로 다시 시도
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
  });

  it('비밀번호가 8자 미만이면 400을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Short Password',
        email: 'short@example.com',
        password: '1234567', // 7자 — Zod 스키마에서 min(8) 위반
      });

    expect(res.status).toBe(400);
  });

  it('이메일 형식이 잘못되면 400을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'password123',
      });

    expect(res.status).toBe(400);
  });
});

// ──────────────────────────────────────
// 로그인 테스트
// ──────────────────────────────────────
describe('POST /auth/login', () => {
  it('올바른 이메일/비밀번호로 로그인하면 토큰을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('존재하지 않는 이메일이면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
  });

  it('비밀번호가 틀리면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
  });
});

// ──────────────────────────────────────
// GET /auth/me 테스트 (인증 필요)
// ──────────────────────────────────────
describe('GET /auth/me', () => {
  it('유효한 토큰이면 내 정보를 반환해야 한다', async () => {
    // 1. 먼저 로그인해서 토큰 발급
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.token;

    // 2. 발급받은 토큰으로 /auth/me 요청
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('토큰이 없으면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .get('/auth/me');

    expect(res.status).toBe(401);
  });

  it('토큰이 잘못되면 401을 반환해야 한다', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
  });
});
