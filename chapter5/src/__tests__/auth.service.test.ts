// Auth Service 단위 테스트
// Repository를 Mock으로 대체하여 DB 없이 비즈니스 로직만 테스트

import * as authService from '../auth/auth.service';
import * as userRepository from '../users/user.repository';
import bcrypt from 'bcrypt';

// ──────────────────────────────────────
// Repository 모듈을 통째로 Mock 처리
// 이 한 줄로 userRepository의 모든 함수가 가짜로 교체된다
// ──────────────────────────────────────
jest.mock('../users/user.repository');

// Mock 함수에 타입을 입히면 mockResolvedValue 등을 쓸 수 있다
const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
  typeof userRepository.findUserByEmail
>;
const mockCreateUser = userRepository.createUser as jest.MockedFunction<
  typeof userRepository.createUser
>;

// 각 테스트 전에 Mock 상태 초기화 (이전 테스트의 설정이 남지 않도록)
beforeEach(() => {
  jest.clearAllMocks();
});

// ──────────────────────────────────────
// register 테스트
// ──────────────────────────────────────
describe('authService.register', () => {
  const registerData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('새 유저를 등록하고 토큰을 반환해야 한다', async () => {
    // Arrange: Mock이 반환할 값 설정
    mockFindUserByEmail.mockResolvedValue(null); // 이메일 중복 없음
    mockCreateUser.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act: 실제 함수 호출
    const result = await authService.register(registerData);

    // Assert: 결과 검증
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password'); // 비밀번호 제외 확인

    // Mock 함수가 올바른 인자로 호출되었는지 검증
    expect(mockFindUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockCreateUser).toHaveBeenCalledTimes(1);

    // createUser에 전달된 비밀번호가 해싱되었는지 확인
    const createUserArg = mockCreateUser.mock.calls[0][0];
    expect(createUserArg.password).not.toBe('password123'); // 평문이 아니어야 함
  });

  it('이메일이 이미 존재하면 409 에러를 던져야 한다', async () => {
    // Arrange: 이미 존재하는 유저 시뮬레이션
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Existing User',
      email: 'test@example.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act & Assert: 에러가 던져지는지 검증
    await expect(authService.register(registerData)).rejects.toThrow();

    // createUser가 호출되지 않았어야 한다 (중복 체크에서 걸렸으니까)
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────
// login 테스트
// ──────────────────────────────────────
describe('authService.login', () => {
  const loginData = {
    email: 'test@example.com',
    password: 'password123',
  };

  it('올바른 비밀번호로 로그인하면 토큰을 반환해야 한다', async () => {
    // Arrange: DB에서 찾은 유저 시뮬레이션 (해싱된 비밀번호 포함)
    const hashedPassword = await bcrypt.hash('password123', 10);
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword, // bcrypt.compare()가 성공하도록 실제 해싱값 사용
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await authService.login(loginData);

    // Assert
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeDefined();
    expect(result.user).not.toHaveProperty('password');
  });

  it('존재하지 않는 이메일이면 에러를 던져야 한다', async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    await expect(authService.login(loginData)).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않습니다'
    );
  });

  it('비밀번호가 틀리면 에러를 던져야 한다', async () => {
    // Arrange: 다른 비밀번호로 해싱된 유저
    const hashedPassword = await bcrypt.hash('different_password', 10);
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(authService.login(loginData)).rejects.toThrow(
      '이메일 또는 비밀번호가 올바르지 않습니다'
    );
  });
});
