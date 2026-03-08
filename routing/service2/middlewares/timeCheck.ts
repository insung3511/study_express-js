import { Request, Response, NextFunction } from 'express';

// middleware1: 영업시간 확인 (9시~18시)
const timeCheck = (req: Request, res: Response, next: NextFunction): void => {
  console.log('[Service2 - Middleware 1] timeCheck 실행');

  const hour = new Date().getHours();

  // 테스트 편의를 위해: 헤더로 시간을 override할 수 있음
  const overrideHour = req.headers['x-override-hour'] as string | undefined;
  const currentHour = overrideHour ? parseInt(overrideHour) : hour;

  if (currentHour < 9 || currentHour >= 18) {
    console.log(`[Service2 - Middleware 1] 현재 ${currentHour}시 - 영업시간 아님! 멈춤`);
    res.status(403).json({
      error: `영업시간이 아닙니다 (현재 ${currentHour}시, 영업시간: 9~18시)`,
    });
    return;
  }

  console.log(`[Service2 - Middleware 1] 현재 ${currentHour}시 - 영업시간 OK → next()`);
  next();
};

export default timeCheck;
