import { Router, Request, Response } from 'express';
import timeCheck from '../middlewares/timeCheck';
import validateAppointment from '../middlewares/validateAppointment';

const router = Router();

// 라우터 레벨: 모든 요청에 영업시간 체크
router.use(timeCheck);

// GET /appointments - 예약 목록
// timeCheck → handler
router.get('/', (req: Request, res: Response): void => {
  console.log('[Service2 - Handler] GET /appointments 도달!');
  res.json({
    message: '예약 목록 조회 성공',
    appointments: [
      { id: 1, date: '2026-03-10', description: '미팅' },
      { id: 2, date: '2026-03-11', description: '점심약속' },
    ],
  });
});

// POST /appointments/create - 예약 생성
// timeCheck → validateAppointment → handler
router.post('/create', validateAppointment, (req: Request, res: Response): void => {
  console.log('[Service2 - Handler] POST /appointments/create 도달!');
  res.status(201).json({
    message: '예약 생성 성공',
    appointment: req.body,
  });
});

export default router;
