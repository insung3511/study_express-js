// Auth Service: 비밀번호 해싱 + JWT 토큰 발급/검증
// HTTP(req/res)를 모르는 순수 비즈니스 로직 레이어

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepository from '../users/user.repository';
import AppError from '../errors/AppError';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

// JWT 토큰의 payload 타입 정의
interface TokenPayload {
  userId: number;
}

const SALT_ROUNDS = 10; // bcrypt 해싱 반복 횟수 (10 = 실무 표준)

// JWT 비밀키 — 서버 시작 시 반드시 있어야 하므로 여기서 검증
const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다');
}

// ────────────────────────────
// 회원가입
// ────────────────────────────
export async function register(data: RegisterInput) {
  // 1. 이메일 중복 체크
  const existing = await userRepository.findUserByEmail(data.email);
  if (existing) {
    throw new AppError(409, `이메일 ${data.email}은 이미 사용 중입니다`);
  }

  // 2. 비밀번호 해싱 — 평문을 절대 DB에 저장하지 않는다!
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // 3. 해싱된 비밀번호로 유저 생성
  const user = await userRepository.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  // 4. JWT 토큰 발급
  const token = generateToken(user.id);

  // 5. 비밀번호는 응답에서 제외! (보안)
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

// ────────────────────────────
// 로그인
// ────────────────────────────
export async function login(data: LoginInput) {
  // 1. 이메일로 유저 찾기
  const user = await userRepository.findUserByEmail(data.email);
  if (!user) {
    // "이메일이 없다"고 알려주면 보안 취약 → 모호한 메시지 사용
    throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 2. 비밀번호 비교 — bcrypt.compare()가 해싱 후 비교해줌
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // 3. JWT 토큰 발급
  const token = generateToken(user.id);

  // 4. 비밀번호 제외하고 응답
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

// ────────────────────────────
// JWT 토큰 생성 (내부 헬퍼 함수)
// ────────────────────────────
function generateToken(userId: number): string {
  return jwt.sign(
    { userId } as TokenPayload,  // payload: 토큰에 담을 데이터
    JWT_SECRET,                    // secret: 서명에 사용할 비밀키
    { expiresIn: '7d' }          // options: 7일 후 만료
  );
}

// ────────────────────────────
// JWT 토큰 검증 (미들웨어에서 사용)
// ────────────────────────────
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
  } catch {
    throw new AppError(401, '유효하지 않거나 만료된 토큰입니다');
  }
}
