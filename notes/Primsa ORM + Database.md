---
tags:
  - expressjs
  - eventim
  - intern
  - typescript
  - study
---
실제 데이터베이스에서 SQL을 활용하지 않아도 Zod 검증과 Prisma 저장 흐름을 활용한다. 직접 SQL Query를 생성하지 않아도 Prisma가 Database를 생성한다.

## Why Prisma?
> Prisma는 Typescript에서 Database를 쉽게 쓰게 해주는 ORM(Object-Relational Mapping)입니다. SQL을 직접 안써도 됩니다. 

Prisma를 활용하게 되면 Typescript에서 Databaes 연결 시, 직접적으로 명령어를 입력하지 않아도 되며, 타입 안전성이 올라가게 된다. 이는 **Typescript 타입 자동 생성 + Database 테이블 자동 생성**을 하게 된다. 
```SQL
SELECT * FROM users WHERE id = 1
```
```Typescript
const user = await prisma.user.findUnique({ where: { id: 1 } });
```
Prisma는 패키지 파일, 라이브러리로 Typescript 프로젝트 생성 시, 같이 추가 해야한다. `@prisma` 개발 간에 사용되며 Client endpoint에서 활용하기 위해서는 `@prisma/client`는 런타임을 위해서 활용된다.

Prisma를 활용하기 위해서는 Schema를 작성해줘야한다. Schema는 구조의 정의로 Prisma가 사용할 타입을 자동 생성하는 설정과 Database를 설정한다. 

`prisma/schema.prisma`
```typescript
generator client {        // ← Prisma가 TypeScript 타입을 자동 생성하는 설정
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {           // ← 어떤 DB를 쓸지 설정
  provider = "sqlite"     // SQLite 사용 (파일 하나로 돌아가는 가벼운 DB)
  url      = env("DATABASE_URL")  // .env에서 DB 주소를 읽음
}

model User {
  id        Int      @id @default(autoincrement())   // 자동 증가 PK
  email     String   @unique                         // 유니크 제약조건
  name      String                                   // 필수 필드
  createdAt DateTime @default(now())                 // 생성 시 자동 기록
  updatedAt DateTime @updatedAt                      // 수정 시 자동 갱신
}
```
- `generator`: Prisma에게 Typescript 타입을 자동 생성해달라고 요청.
- `datasource`: 어떤 Database를 사용할 것인가.
- `model`: 테이블 설계도 형식은 어떻게 될 것인가.
`User` 모델은 Database의 `User`의 테이블로 정의된다. 즉, Schema를 정의하는 것은 Database 테이블 구조와 동일하게 가야한다.

Prisma는 총 3단계에 걸쳐 움직이게 된다
1. `schema.prisma` 작성: 데이터베이스와 타입에 대한 정의
2.  `prisma migrate dev`: 실제 데이터베이스 테이블을 생성
3. `prisma generate`: TypeScript 타입 생성 `(generated/ 폴더에)`
위와 같은 순서로 진행하게 되면 `app.ts`는 아래와 같은 방식으로 Databse를 끌어오고 변수를 생성한다.

> [!info] `prisma migrate dev`가 `generate`도 자동 실행한다!
> `prisma migrate dev`를 하면 하면 `generate`도 자동으로 실행하게 된다. `generate`만 쓰는 건 스키마만 바꾸고 마이그레이션이 없다.
> > 마이그레이션 (`migration`)은 Database Schema의 변경사항을 적용하는 과정. 변경이 될때마다 새로운 마이그레이션으로 수정되는 개념.

`app.ts`
```typescript
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { id } });  // DB에서 검색
await prisma.user.create({ data: { name, email } });            // DB에 저장
```
이때 `user.findUnique` 에서 `id`가 없는 경우, `user`에는 NULL이 반환된다. 그러므로 Error Handling에서 NULL 값 체크를 하는 것도 필요하다.
```typescript
app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  // Prisma는 null을 줬으니, 우리가 직접 체크해야 함
  if (!user) {
    throw new AppError(404, `ID ${id}인 유저를 찾을 수 없습니다`);
  }
  res.json(user);
});
```

| Method                | When isn't  | When you use      |
| --------------------- | ----------- | ----------------- |
| `findUnique()`        | `null`반환    | 있을 수도, 없을 수도 있을 때 |
| `findUniqueOrThrow()` | 에러 `throw`  | 반드시 있어야 하는 경우     |
| `findMany()`          | `[]` (빈 배열) | 여러 개를 조회할 때       |
> `findUniqueOrThrow()`를 사용하게 되면 Error 문으로 반환하여 `if`문을 쓰지 않아도 되지만 Error Handling이 어려워서 `findUnique()`를 사용하고 Custom Error Handling을 한다.

## Concept of Layers
규모가 커지고 유지보수를 위해서는 레이어를 분할시켜둔다. 레이어 분할을 통해서 각 로직 간의 충돌을 에방하게 된다. 크게 **Controller**, **Service**, **Repository**로 나누어서 본다. 
- **Controller**: HTTP 통역사와 같은 역할로 요청과 응답을 처리.
- **Service**: 실제 Feature, 비즈니스 규칙만을 실행하고 Error 반환을 한다.
- **Repository**: Prisma, SQL와 같이 저장소에 접근을 처리.
	```
	Controller  →  Service  →  Repository  →  Prisma(DB)
	```

이때 각 레이어는 겹치거나 중복되는 내용은 없다. 즉, 레이어 간의 의존성이 있지만 바로 이전 파이프라인에서 건너뛰거나 겹치는 등의 오류가 발생할 수는 없다.

레이어 분리의 가장 큰 장점은 유지보수의 관리 측면에 있다. 레이어를 분리한 상태에서 Database를 SQLite 에서 PostgreSQL로 변경 시, 코드 상에 변경은 없다. 더불어 ORM 자체를 바꾸는 경우에는 Repostiroy만 변경 하는 등, 큰 어려움 없으며 타 코드에 영향을 적게 주게 된다.

## Database Table의 종속성 - 1:N 관계형 모델
예시로, 블로그를 작성하는 플랫폼이 있다고 가정한다. user의 정보가 담겨져 있는 `Users` 라는 테이블이 있다. user가 게시글을 여러 개 작성할 수 있어야 한다면 테이블은 2개가 되어야한다. `Users` 라는 테이블에 `post` column이 추가되면 `Users` 테이블은 indexing에 지옥에 빠지게 된다. 

두 테이블 간의 종속성, 연속성을 보여줄 수 있는 것이 `authorId`와 같은 Unique 함이다. 

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String                                   // 게시글 제목
  content   String?                                  // 본문 (선택 — ?가 nullable)
  published Boolean  @default(false)                 // 공개 여부 (기본값: 비공개)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  authorId  Int                                      // FK: User의 id를 참조
  author    User     @relation(fields: [authorId], references: [id])
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

이렇게 되면,
- `authorId`, *Int* : DB에 실제로 저장되는 외래키 (FK) 칼럼
- `authorId`, *User @relation* : Prisma가 관리하는 관계 필드
	- `@relation(fields: [authorId], references: [id])`가 관계성을 갖게 된다.
	- `authorId = 1`이라면, User 테이블에서 `id = 1`인 행을 가리키는 것
- `posts`, *Post []* : User 쪽에서 게시물들을 접근하기 위한 역방향 관계
로 된다.

> **PK (Primary Key)** 는 테이블의 고유 식별자, **FK (Foreign Key)** 는 다른 테이블의 PK를 참조
> > PK는 중복이 불가하지만 FK는 중복이 가능하다.
### 서비스 로직
위 에시를 이어가면, 사용자가 글을 작성하고 역으로 사용자가 작성한 글을 확인하는 서비스이다. 이렇게 되면 Database는 사용자의 정보 (`Users`), 사용자가 작성한 글 (`Posts`) 로 2개의 테이블이 요구된다. 서비스 Endpoint도 마찬가지로 사용자의 정보 CRUD를 위한 `/users`, 글을 작성하기 위한 `/posts`가 생성된다. 
```
│
├── app.ts                          # 라우터 등록 + 에러 핸들러
│
├── users/
│   ├── user.routes.ts              # [1] URL 매핑 + Zod 검증 미들웨어
│   ├── user.controller.ts          # [2] req/res 처리
│   ├── user.service.ts             # [3] 비즈니스 로직 (이메일 중복 체크 등)
│   └── user.repository.ts          # [4] Prisma로 DB 직접 접근
│
├── posts/
│   ├── post.routes.ts              # [1] URL 매핑 + Zod 검증 미들웨어
│   ├── post.controller.ts          # [2] req/res 처리
│   ├── post.service.ts             # [3] 비즈니스 로직 (작성자 존재 확인 등)
│   └── post.repository.ts          # [4] Prisma로 DB 직접 접근
│
├── schemas/
    ├── user.schema.ts              # Zod 스키마 (createUser, updateUser)
    └── post.schema.ts              # Zod 스키마 (createPost, updatePost)
```
Route, Controller, Service, Repository 로 4개의 구조를 나누어져 있고 HTTP 요청에 의하여 순서대로 Pipeline을 거친다. 

## Database Table의 종속성 - N:N 관계형 모델
기존에는 **사용자가 여러 글을 적는다 -> 1:N** 의 형태로 관계 였지만 
여기서 게시글에 *Tag* 를 붙이고 이 *Tag*는 *Post* 마다 다르게 붙일 수 있다면?
> **게시글은 여러 태그에 종속성을 갖을 수 있다: N:N**

```
model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique                        // 태그 이름 (중복 불가)
  posts Post[] @relation("PostTags")          // 이 태그가 붙은 게시글들
}

model Post {
  // ... 기존 필드들 ...
  tags  Tag[] @relation("PostTags")           // 이 글에 붙은 태그들
}
```
와 같이 된다. 그러면 `PostTags`는 중간 테이블로 생성되어 `Tag`와 `Post`의 연결하는 역할이 된다.

N:M, 다대다 관계형 모델을 다루기 위해서는 Prisma의 `conncetOrCreate` 함수를 이용하게 된다.
> 있으면 연결하고, 없으면 만들고 연결한다! 

위 예시로 설명을 이어가면, 게시물의 태그가 있으면 연결하고 없으면 태그를 생성해서 연결한다는 것이다. 태그 생성을 `Tag` 테이블에서 하고 `_PostTags` 중간 테이블에서 `Post` 테이블와의 연결을 관리한다.

```typescript
// 👎 connectOrCreate 함수를 이용하지 않는다면!
for (const name of tags) {
  let tag = await prisma.tag.findUnique({ where: { name } });
  if (!tag) {
    tag = await prisma.tag.create({ data: { name } });
  }
  await prisma.post.update({
    where: { id: postId },
    data: { tags: { connect: { id: tag.id } } },
  });
}

// 👍 connectOrCreate 함수를 이용한다면!
await prisma.post.create({
  data: {
    ...postData,
    tags: {
      connectOrCreate: tags.map((name) => ({
        where: { name },
        create: { name },
      })),
    },
  },
});
```

---

## 관련 문서
- [[Basic of Express.js]]
- [[Basis of Zod]]
