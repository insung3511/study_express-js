// ====================================
// 커스텀 에러 클래스
// 기본 Error에는 message만 있음
// → 상태코드(statusCode)를 추가로 담기 위해 확장
// ====================================

class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    // 부모 클래스(Error)의 생성자 호출 → this.message 설정
    super(message);

    this.statusCode = statusCode;

    // 클래스 이름이 "AppError"로 표시되도록 설정
    // (이걸 안 하면 그냥 "Error"로 표시됨)
    this.name = 'AppError';
  }
}

export default AppError;

// ====================================
// 사용 예시:
//
// throw new Error('문제 발생');
// → { message: '문제 발생' }  ← 상태코드가 없음!
//
// throw new AppError(404, '유저를 찾을 수 없습니다');
// → { message: '유저를 찾을 수 없습니다', statusCode: 404 }
// ====================================
