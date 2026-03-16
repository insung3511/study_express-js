// ====================================
// 커스텀 에러 클래스 (Chapter 3에서 만든 것 그대로 재사용)
// ====================================

class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export default AppError;
