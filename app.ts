import express, { Request, Response } from 'express';
import logger from './chapter7/src/lib/logger';

const app = express();
const port: number = 3000;

// JSON body 파싱 미들웨어 (POST, PUT, PATCH에서 req.body 사용하려면 필수)
app.use(express.json());

// 임시 데이터 저장소 (DB 대신 메모리에 저장)
interface User {
	id: number;
	name: string;
	email: string;
}

let users: User[] = [
	{ id: 1, name: '홍길동', email: 'hong@test.com' },
	{ id: 2, name: '김철수', email: 'kim@test.com' },
	{ id: 3, name: '이영희', email: 'lee@test.com' },
];

// ============================================
// 1. GET - 전체 목록 조회
// 테스트: 브라우저에서 http://localhost:3000/users
// ============================================
app.get('/users', (req: Request, res: Response) => {
	logger.info('전체 유저 목록 조회');
	res.json(users);
});

// ============================================
// 2. GET - 단건 조회 (Route Params)
// 테스트: http://localhost:3000/users/1
// ============================================
app.get('/users/:id', (req: Request, res: Response) => {
	logger.info(`유저 단건 조회: ${req.params.id}`);
	const id = parseInt(req.params.id as string);
	const user = users.find(u => u.id === id);

	if (!user) {
		res.status(404).json({ message: '유저를 찾을 수 없습니다' });
		logger.warn(`유저 ${id} 조회 실패 - 존재하지 않음`);
		return;
	}
	logger.info(`유저 ${id} 조회 성공`);
	res.json(user);
});

// ============================================
// 3. GET - Query String으로 검색
// 테스트: http://localhost:3000/users/search?name=홍
// ============================================
app.get('/users/search', (req: Request, res: Response) => {
	const name = req.query.name as string;

	if (!name) {
		res.status(400).json({ message: 'name 파라미터가 필요합니다' });
		logger.warn('name 파라미터가 없습니다');
		return;
	}

	const result = users.filter(u => u.name.includes(name));
	logger.info(`유저 검색: ${name}`);
	res.json(result);
});

// ============================================
// 4. POST - 유저 생성
// 테스트: curl -X POST http://localhost:3000/users \
//         -H "Content-Type: application/json" \
//         -d '{"name":"박지민","email":"park@test.com"}'
// ============================================
app.post('/users', (req: Request, res: Response) => {
	const { name, email } = req.body;

	if (!name || !email) {
		res.status(400).json({ message: 'name과 email은 필수입니다' });
		logger.warn('name 또는 email이 없습니다');
		return;
	}

	const newUser: User = {
		id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
		name,
		email,
	};
	users.push(newUser);
	logger.info(`유저 생성: ${newUser.name}`);
	res.status(201).json(newUser);
});

// ============================================
// 5. PUT - 유저 전체 수정
// 테스트: curl -X PUT http://localhost:3000/users/1 \
//         -H "Content-Type: application/json" \
//         -d '{"name":"홍길동수정","email":"hong2@test.com"}'
// ============================================
app.put('/users/:id', (req: Request, res: Response) => {
	const id = parseInt(req.params.id as string);
	const index = users.findIndex(u => u.id === id);

	if (index === -1) {
		res.status(404).json({ message: '유저를 찾을 수 없습니다' });
		logger.warn(`유저 ${id} 수정 실패 - 존재하지 않음`);
		return;
	}

	const { name, email } = req.body;
	users[index] = { id, name, email };
	logger.info(`유저 ${id} 수정 성공`);
	res.json(users[index]);
});

// ============================================
// 6. PATCH - 유저 부분 수정
// 테스트: curl -X PATCH http://localhost:3000/users/1 \
//         -H "Content-Type: application/json" \
//         -d '{"name":"홍길동패치"}'
// ============================================
app.patch('/users/:id', (req: Request, res: Response) => {
	const id = parseInt(req.params.id as string);
	const index = users.findIndex(u => u.id === id);

	if (index === -1) {
		res.status(404).json({ message: '유저를 찾을 수 없습니다' });
		logger.warn(`유저 ${id} 패치 실패 - 존재하지 않음`);
		return;
	}

	users[index] = { ...users[index], ...req.body };
	logger.info(`유저 ${id} 패치 성공`);
	res.json(users[index]);
});

// ============================================
// 7. DELETE - 유저 삭제
// 테스트: curl -X DELETE http://localhost:3000/users/1
// ============================================
app.delete('/users/:id', (req: Request, res: Response) => {
	const id = parseInt(req.params.id as string);
	const index = users.findIndex(u => u.id === id);

	if (index === -1) {
		res.status(404).json({ message: '유저를 찾을 수 없습니다' });
		logger.warn(`유저 ${id} 삭제 실패 - 존재하지 않음`);
		return;
	}

	const deleted = users.splice(index, 1);
	logger.info(`유저 ${id} 삭제 성공`);
	res.json({ message: '삭제 완료', user: deleted[0] });
});

// ============================================
// 8. app.route() - 같은 경로에 메서드 체이닝
// ============================================
app.route('/posts')
	.get((req: Request, res: Response) => {
		logger.info('게시글 목록 조회');
		res.json({ message: 'GET: 게시글 목록 조회' });
	})
	.post((req: Request, res: Response) => {
		logger.info('게시글 생성');
		res.json({ message: 'POST: 게시글 생성', data: req.body });
	});

app.route('/posts/:id')
	.get((req: Request, res: Response) => {
		logger.info(`게시글 ${req.params.id} 조회`);
		res.json({ message: `GET: 게시글 ${req.params.id} 조회` });
	})
	.put((req: Request, res: Response) => {
		logger.info(`게시글 ${req.params.id} 수정`);
		res.json({ message: `PUT: 게시글 ${req.params.id} 수정`, data: req.body });
	})
	.delete((req: Request, res: Response) => {
		logger.info(`게시글 ${req.params.id} 삭제`);
		res.json({ message: `DELETE: 게시글 ${req.params.id} 삭제` });
	});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
	console.log(`\n테스트 URL 목록:`);
	console.log(`  GET    http://localhost:${port}/users`);
	console.log(`  GET    http://localhost:${port}/users/1`);
	console.log(`  GET    http://localhost:${port}/users/search?name=홍`);
	console.log(`  POST   http://localhost:${port}/users`);
	console.log(`  PUT    http://localhost:${port}/users/1`);
	console.log(`  PATCH  http://localhost:${port}/users/1`);
	console.log(`  DELETE http://localhost:${port}/users/1`);
	console.log(`  GET    http://localhost:${port}/posts`);
	console.log(`  GET    http://localhost:${port}/posts/1`);
});
