# Mock API Server

OAuth 및 API 통합 테스트를 위한 Mock 서버입니다.

## 설치 및 실행

```bash
# 서버 의존성 설치
npm run server:install

# 서버만 실행 (포트 3001)
npm run dev:server

# 프론트엔드와 서버 동시 실행
npm run dev:all
```

## API 엔드포인트

### 인증 (Authentication)

#### 로그인
- **POST** `/api/auth/login`
- Body: `{ username: "demo", password: "demo123" }`
- 테스트 계정:
  - demo / demo123
  - admin / admin123

#### OAuth 로그인 (Mock)
- **POST** `/api/auth/oauth/callback`
- Body: `{ provider: "google", code: "any-code" }`
- 지원 provider: google, github, microsoft

#### 토큰 갱신
- **POST** `/api/auth/refresh`
- Body: `{ refresh_token: "..." }`

#### 현재 사용자 정보
- **GET** `/api/auth/me`
- Header: `Authorization: Bearer {token}`

### API 리소스 (인증 필요)

#### Users
- **GET** `/api/users` - 모든 사용자 조회

#### Todos
- **GET** `/api/todos` - Todo 목록 (페이지네이션 지원)
- **GET** `/api/todos/:id` - 특정 Todo 조회
- **POST** `/api/todos` - 새 Todo 생성
- **PUT** `/api/todos/:id` - Todo 수정
- **DELETE** `/api/todos/:id` - Todo 삭제

#### Posts
- **GET** `/api/posts` - 게시물 목록 (페이지네이션 지원)
- **GET** `/api/posts/:id` - 특정 게시물 조회
- **POST** `/api/posts` - 새 게시물 생성

#### Dashboard Stats
- **GET** `/api/dashboard/stats` - 대시보드 통계

#### Notifications
- **GET** `/api/notifications` - 알림 목록

### Proxy 엔드포인트

#### 외부 API 프록시
- **POST** `/api/proxy` - 외부 API 호출 프록시
- **GET** `/api/proxy/external/:service` - Mock 외부 서비스 데이터
  - weather, news, crypto

## 환경 변수

`.env` 파일:
```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## 토큰 정보

- Access Token: 15분 유효
- Refresh Token: 7일 유효
- Token Type: Bearer

## CORS 설정

허용된 Origin:
- http://localhost:3000
- http://localhost:5173