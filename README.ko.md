# API 게이트웨이 대시보드

*[English Version](./README.md)*

React, TypeScript, TanStack Router로 구축된 API 게이트웨이 트래픽 모니터링 및 관리를 위한 현대적이고 반응형 대시보드입니다.

## 🚀 최근 업데이트

### 새로운 기능 및 개선사항

#### 🎨 UI/UX 개선
- **네트워크 경로 시각화**: React Flow를 사용한 대화형 네트워크 토폴로지 뷰
  - 실시간 트래픽 흐름 애니메이션
  - 상태 표시기가 있는 노드 상태 모니터링
  - 최적의 그래프 배치를 위한 자동 레이아웃 기능
  - 다양한 서비스 유형에 대한 맞춤형 스타일 노드

- **분산 추적**: 여러 보기 모드가 있는 고급 추적 분석
  - **간트 차트 뷰**: 분산 추적의 타임라인 시각화
  - **워터폴 뷰**: 대기 시간 표시기가 있는 순차적 실행 흐름
  - **플레임 그래프 뷰**: 계층적 성능 시각화
  - 줌 컨트롤 및 내보내기 기능
  - 호버/클릭 시 실시간 스팬 세부정보

#### 📊 데이터 관리
- **TanStack Query 통합**: 추적을 위한 최적화된 데이터 페칭
  - 5분 보존 기간의 자동 캐싱
  - 매분 백그라운드 재페칭
  - 즉시 로딩을 위한 호버 시 사전 페칭
  - 지수 백오프를 사용한 스마트 재시도 로직
  - 로딩, 에러, 성공 상태 관리

#### 🔐 인증 개선
- **향상된 인증 플로우**: 강력한 인증 처리
  - 만료 전 자동 토큰 갱신
  - localStorage를 사용한 지속적인 세션
  - 개발용 모의 인증 (admin/admin123)
  - 강제 리디렉션 없는 우아한 에러 처리

#### 📚 API 문서
- **포괄적인 문서**: 두 가지 문서 형식
  - **Swagger UI**: `/api-docs`에서 대화형 API 테스트
  - **마크다운 문서**: `/docs`에서 상세 문서
  - OpenAPI 3.0 명세
  - 요청/응답 예제
  - 인증 가이드

#### 🎲 모의 데이터 개선
- **동적 추적 생성**: 현실적인 분산 추적 시뮬레이션
  - 무작위 서비스 토폴로지 생성 (추적당 5-15 스팬)
  - 적절한 작업이 있는 10가지 서비스 유형
  - 가중 상태 분포 (85% 성공, 10% 경고, 5% 에러)
  - 서비스별 메타데이터 (데이터베이스 쿼리, 캐시 히트, 결제 정보)
  - 계층적 부모-자식 관계

### 기술적 개선

#### 성능
- 메모이제이션을 사용한 React Flow 렌더링 최적화
- 추적 타임라인에서 불필요한 재렌더링 감소
- 효율적인 D3.js 차트 업데이트

#### 코드 품질
- TypeScript 타입 안전성 개선
- 사용하지 않는 import 및 변수 제거
- 더 나은 에러 경계 구현

#### 개발자 경험
- 모든 컴포넌트에 대한 핫 모듈 교체 (HMR)
- 더 나은 에러 메시지 및 디버깅 정보
- 개발 모드 쿼리 상태 표시기

## 기능

- **실시간 모니터링**: 실시간 시스템 메트릭 (CPU, 메모리, 네트워크)
- **트래픽 분석**: 요청 볼륨, 상태 분포 및 성능 메트릭
- **대화형 차트**: 풍부한 데이터 시각화를 위한 D3.js로 구축
- **모의 서버**: 시뮬레이션된 데이터가 있는 완전한 기능의 개발 서버
- **정적 사이트 생성**: 최적의 성능을 위한 사전 렌더링된 페이지
- **반응형 디자인**: 다크 모드를 지원하는 Tailwind CSS

## 기술 스택

- **프론트엔드**: React 19, TypeScript, TanStack Router, TanStack Query
- **스타일링**: Tailwind CSS v4, shadcn/ui 컴포넌트
- **차트**: 커스텀 React 컴포넌트와 D3.js
- **시각화**: 네트워크 토폴로지를 위한 React Flow
- **빌드 도구**: Vite
- **테스팅**: Vitest, React Testing Library, @testing-library/jest-dom
- **모의 서버**: SQLite를 사용한 Express.js
- **API 문서**: Swagger UI + OpenAPI 3.0
- **코드 품질**: 린팅 및 포맷팅을 위한 Biome

## 프로젝트 구조

```
├── src/
│   ├── components/       # 재사용 가능한 UI 컴포넌트
│   │   ├── trace/       # 분산 추적 컴포넌트
│   │   ├── charts/      # D3.js 차트 컴포넌트
│   │   └── ui/          # shadcn/ui 컴포넌트
│   ├── hooks/           # 커스텀 React 훅
│   │   ├── useTraces.ts # 추적을 위한 TanStack Query 훅
│   │   └── useAuth.ts   # 인증 훅
│   ├── lib/             # 유틸리티 및 설정
│   │   ├── api-client.ts # 인증이 있는 API 클라이언트
│   │   └── auth.ts      # 인증 서비스
│   ├── routes/          # TanStack Router 페이지
│   └── app/             # 애플리케이션별 컴포넌트
├── server/              # 모의 API 서버
│   ├── src/
│   │   ├── routes/      # API 엔드포인트
│   │   ├── services/    # 비즈니스 로직
│   │   ├── swagger.js   # API 문서 설정
│   │   └── db/          # 데이터베이스 작업
│   ├── API_DOCUMENTATION.md # 상세 API 문서
│   └── package.json
├── scripts/             # 빌드 및 유틸리티 스크립트
└── dist-ssg/           # 정적 빌드 출력
```

## 필수 요구사항

- Node.js 18+
- pnpm (권장) 또는 npm

## 설치

1. 저장소 클론:
```bash
git clone <repository-url>
cd tanstack-start-test
```

2. 의존성 설치:
```bash
pnpm install
```

3. 모의 서버 의존성 설치:
```bash
pnpm run server:install
```

4. 환경 변수 설정:
```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
VITE_API_URL=http://localhost:4001/api
```

## 개발

### 프론트엔드와 모의 서버 함께 실행:
```bash
pnpm run dev:all
```

다음을 시작합니다:
- 프론트엔드 개발 서버: http://localhost:3000
- 모의 API 서버: http://localhost:4001
- Swagger UI: http://localhost:4001/api-docs
- 마크다운 문서: http://localhost:4001/docs

### 개별 실행:

프론트엔드만:
```bash
pnpm run dev
```

모의 서버만:
```bash
pnpm run dev:server
```

## 인증

### 사용 가능한 사용자
- **데모 사용자**: 사용자명: `demo`, 비밀번호: `demo123`
- **관리자 사용자**: 사용자명: `admin`, 비밀번호: `admin123`

## API 문서

모의 서버는 포괄적인 API 문서를 제공합니다:

### 대화형 문서 (Swagger UI)
- **URL**: http://localhost:4001/api-docs
- 브라우저에서 직접 엔드포인트 테스트
- OpenAPI 3.0 명세
- 직접 시도하기 기능

### 마크다운 문서
- **URL**: http://localhost:4001/docs
- 상세한 엔드포인트 설명
- 요청/응답 예제
- 인증 가이드

## 빌드

### 정적 사이트 생성 (SSG)

사전 렌더링된 정적 페이지 빌드:
```bash
pnpm run build
```

다음을 생성합니다:
- 각 라우트에 대한 최적화된 정적 HTML
- 코드 분할 JavaScript 번들
- 압축된 CSS
- `dist-ssg/` 디렉토리에 출력

### 모의 서버와 함께 빌드 및 서빙

정적 사이트를 빌드하고 모의 서버와 함께 실행:
```bash
pnpm run build:serve
```

## API 엔드포인트

### 공개 엔드포인트
- `GET /health` - 상태 확인
- `GET /api/metrics/current` - 현재 시스템 메트릭
- `GET /api/metrics/history` - 과거 메트릭 데이터
- `GET /api/dashboard/*` - 대시보드 통계
- `GET /api-docs` - Swagger UI 문서
- `GET /docs` - 마크다운 문서

### 보호된 엔드포인트 (인증 필요)
- `GET /api/traces` - 분산 추적 목록
- `GET /api/traces/:id` - 추적 세부정보 가져오기
- `GET /api/todos` - 할 일 관리
- `GET /api/posts` - 블로그 게시물
- `GET /api/users` - 사용자 관리

### 인증
- `POST /api/auth/login` - 사용자 로그인
- `POST /api/auth/logout` - 사용자 로그아웃
- `POST /api/auth/refresh` - 액세스 토큰 갱신

## 주요 컴포넌트

### 분산 추적 (`/dashboard/traces`)
- 실시간 추적 모니터링
- 다중 시각화 모드
- 서비스 의존성 매핑
- 에러 추적 및 분석

### 네트워크 경로 시각화 (`/dashboard/network-path`)
- 대화형 네트워크 토폴로지
- 실시간 트래픽 흐름
- 노드 상태 모니터링
- 연결 메트릭

### 시스템 메트릭
- CPU, 메모리, 디스크 사용량
- 네트워크 I/O 모니터링
- 요청 속도 추적
- 에러율 분석

## 테스팅

### Vitest를 사용한 단위 테스팅

프로젝트는 React 컴포넌트와 유틸리티 함수의 단위 테스트를 위해 Vitest를 사용합니다.

#### 테스트 실행

모든 테스트를 한 번 실행:
```bash
pnpm test
```

감시 모드로 테스트 실행 (파일 변경 시 자동 재실행):
```bash
pnpm test:watch
```

커버리지 보고서 생성:
```bash
pnpm test:coverage
```

#### 테스트 구조

테스트는 소스 파일과 함께 위치합니다:
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx      # Button 컴포넌트 테스트
│   │   ├── card.tsx
│   │   └── card.test.tsx         # Card 컴포넌트 테스트
│   ├── Header.tsx
│   └── Header.test.tsx           # Header 컴포넌트 테스트
└── lib/
    ├── utils.ts
    └── utils.test.ts             # 유틸리티 함수 테스트
```

#### 테스트 작성

React 컴포넌트 테스트 예제:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>클릭하세요</Button>)
    expect(screen.getByRole('button', { name: '클릭하세요' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>클릭하세요</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### 테스트 설정

Vitest는 `vitest.config.ts`에서 설정됩니다:
- 환경: jsdom (DOM 테스팅용)
- 전역 테스트 API 활성화
- 커버리지 제공자: V8
- 테스팅 유틸리티: @testing-library/react, @testing-library/jest-dom

#### 커버리지 보고서

`pnpm test:coverage` 실행 후, HTML 커버리지 보고서 확인:
```bash
# 브라우저에서 커버리지 보고서 열기
open coverage/index.html
```

### SSG 테스팅

SSG 빌드 테스트:
```bash
pnpm run test:ssg
```

## 코드 품질

코드 포맷팅:
```bash
pnpm run format
```

코드 린팅:
```bash
pnpm run lint
```

모든 검사 실행:
```bash
pnpm run check
```

## 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm run dev` | 프론트엔드 개발 서버 시작 |
| `pnpm run dev:server` | 모의 API 서버 시작 |
| `pnpm run dev:all` | 프론트엔드와 모의 서버 모두 시작 |
| `pnpm run build` | 정적 사이트 빌드 (SSG) |
| `pnpm run serve` | 빌드된 정적 사이트 서빙 |
| `pnpm run build:serve` | 모의 서버와 함께 빌드 및 서빙 |
| `pnpm test` | Vitest로 단위 테스트 실행 |
| `pnpm run test:watch` | 감시 모드로 테스트 실행 |
| `pnpm run test:coverage` | 커버리지 보고서와 함께 테스트 실행 |
| `pnpm run test:ssg` | SSG 빌드 테스트 |
| `pnpm run format` | Biome로 코드 포맷팅 |
| `pnpm run lint` | Biome로 코드 린팅 |
| `pnpm run check` | 모든 Biome 검사 실행 |
| `pnpm run server:install` | 모의 서버 의존성 설치 |

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | API 서버 URL | `http://localhost:4001/api` |
| `PORT` | 모의 서버 포트 | `4001` |

## 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 성능

- Lighthouse 점수: 95+ (성능)
- 첫 콘텐츠 페인트: < 1.2초
- 상호작용 시간: < 2.5초
- 번들 크기: ~750KB (gzip 전)

## 배포

`dist-ssg` 폴더는 모든 정적 호스팅 서비스에 배포할 수 있습니다:

### Netlify
```bash
# 빌드 명령
pnpm run build

# 게시 디렉토리
dist-ssg
```

### Vercel
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist-ssg"
}
```

### GitHub Pages
```bash
# gh-pages를 사용한 배포
npx gh-pages -d dist-ssg
```

## 문제 해결

### 인증 문제
1. localStorage 지우기: `localStorage.clear()`
2. 데모 자격 증명 사용: 사용자명 `demo`, 비밀번호 `demo123`
3. 브라우저 DevTools에서 토큰 만료 확인
4. 모의 서버가 포트 4001에서 실행 중인지 확인

### CORS 문제
1. 모의 서버가 포트 4001에서 실행 중인지 확인
2. `VITE_API_URL` 환경 변수 확인
3. `server/src/index.js`에서 CORS 설정 확인

### 추적 데이터가 로드되지 않음
1. 인증 토큰이 유효한지 확인
2. 브라우저 콘솔에서 에러 확인
3. 모의 서버가 데이터를 생성하는지 확인
4. 페이지 새로고침 시도

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 변경사항 커밋: `git commit -m 'Add amazing feature'`
4. 브랜치에 푸시: `git push origin feature/amazing-feature`
5. Pull Request 열기

## 라이선스

MIT

## 지원

문제 및 질문은 GitHub issues 페이지를 이용해 주세요.