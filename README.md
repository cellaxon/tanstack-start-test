# API Gateway Dashboard

*[한국어 버전 (Korean Version)](./README.ko.md)*

A modern, responsive dashboard for monitoring and managing API gateway traffic, built with React, TypeScript, and TanStack Router.

## 🚀 Recent Updates

### Banking API Gateway Monitoring Dashboard
- **Real-time WebSocket Integration**: Live streaming of monitoring metrics
  - Traffic monitoring (RPS/TPS, response time distribution)
  - Error tracking and availability monitoring
  - Resource metrics (CPU, memory, connection pools)
  - Security monitoring (rate limiting, authentication failures)
  - Business metrics and SLA compliance tracking
  - Geographic distribution and client analysis

- **Advanced Chart Visualizations**:
  - Line charts for time-series data
  - Bar charts for API usage rankings
  - Pie charts for status code distribution
  - Heatmaps for geographic traffic
  - Gauge charts for resource utilization
  - Progress bars for real-time metrics

### New Features & Improvements

#### 🎨 UI/UX Enhancements
- **Network Path Visualization**: Interactive network topology view using React Flow
  - Real-time traffic flow animation
  - Node status monitoring with health indicators
  - Auto-layout functionality for optimal graph arrangement
  - Custom styled nodes for different service types

- **Distributed Tracing**: Advanced trace analysis with multiple view modes
  - **Gantt Chart View**: Timeline visualization of distributed traces
  - **Waterfall View**: Sequential execution flow with wait time indicators
  - **Flame Graph View**: Hierarchical performance visualization
  - Zoom controls and export functionality
  - Real-time span details on hover/click

#### 📊 Data Management
- **TanStack Query Integration**: Optimized data fetching for traces
  - Automatic caching with 5-minute retention
  - Background refetching every minute
  - Prefetching on hover for instant loading
  - Smart retry logic with exponential backoff
  - Loading, error, and success state management

#### 🔐 Authentication Improvements
- **Enhanced Auth Flow**: Robust authentication handling
  - Automatic token refresh before expiration
  - Persistent sessions with localStorage
  - Mock authentication for development (admin/admin123)
  - Graceful error handling without forced redirects

#### 📚 API Documentation
- **Comprehensive Documentation**: Two documentation formats
  - **Swagger UI**: Interactive API testing at `/api-docs`
  - **Markdown Docs**: Detailed documentation at `/docs`
  - OpenAPI 3.0 specification
  - Request/response examples
  - Authentication guide

#### 🎲 Mock Data Enhancements
- **Dynamic Trace Generation**: Realistic distributed trace simulation
  - Random service topology generation (5-15 spans per trace)
  - 10 different service types with appropriate operations
  - Weighted status distribution (85% success, 10% warning, 5% error)
  - Service-specific metadata (database queries, cache hits, payment info)
  - Hierarchical parent-child relationships

### Technical Improvements

#### Performance
- Optimized React Flow rendering with memoization
- Reduced unnecessary re-renders in trace timeline
- Efficient D3.js chart updates

#### Code Quality
- TypeScript type safety improvements
- Removed unused imports and variables
- Better error boundary implementation

#### Developer Experience
- Hot module replacement (HMR) for all components
- Better error messages and debugging info
- Development mode query state indicators

## Features

- **Real-time Monitoring**: Live system metrics (CPU, memory, network)
- **Traffic Analytics**: Request volume, status distribution, and performance metrics
- **Interactive Charts**: Built with D3.js for rich data visualization
- **Mock Server**: Full-featured development server with simulated data
- **Static Site Generation**: Pre-rendered pages for optimal performance
- **Responsive Design**: Tailwind CSS with dark mode support

## Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router, TanStack Query
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Charts**: D3.js with custom React components
- **Visualizations**: React Flow for network topology
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library, @testing-library/jest-dom
- **Mock Server**: Express.js with SQLite
- **API Documentation**: Swagger UI + OpenAPI 3.0
- **Code Quality**: Biome for linting and formatting

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── trace/       # Distributed tracing components
│   │   ├── charts/      # D3.js chart components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   │   ├── useTraces.ts # TanStack Query hooks for traces
│   │   └── useAuth.ts   # Authentication hooks
│   ├── lib/             # Utilities and configurations
│   │   ├── api-client.ts # API client with auth
│   │   └── auth.ts      # Authentication service
│   ├── routes/          # TanStack Router pages
│   └── app/             # Application-specific components
├── server/              # Mock API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── swagger.js   # API documentation config
│   │   └── db/          # Database operations
│   ├── API_DOCUMENTATION.md # Detailed API docs
│   └── package.json
├── scripts/             # Build and utility scripts
└── dist-ssg/           # Static build output
```

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tanstack-start-test
```

2. Install dependencies:
```bash
pnpm install
```

3. Install mock server dependencies:
```bash
pnpm run server:install
```

4. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:4001/api
```

## Development

### Run frontend and mock server together:
```bash
pnpm run dev:all
```

This starts:
- Frontend dev server on http://localhost:3000
- Mock API server on http://localhost:4001
- Swagger UI on http://localhost:4001/api-docs
- Markdown docs on http://localhost:4001/docs

### Run separately:

Frontend only:
```bash
pnpm run dev
```

Mock server only:
```bash
pnpm run dev:server
```

## Authentication

### Available Users
- **Demo User**: username: `demo`, password: `demo123`
- **Admin User**: username: `admin`, password: `admin123`

## API Documentation

The mock server provides comprehensive API documentation:

### Interactive Documentation (Swagger UI)
- **URL**: http://localhost:4001/api-docs
- Test endpoints directly from the browser
- OpenAPI 3.0 specification
- Try it out functionality

### Markdown Documentation
- **URL**: http://localhost:4001/docs
- Detailed endpoint descriptions
- Request/response examples
- Authentication guide

## Building

### Static Site Generation (SSG)

Build pre-rendered static pages:
```bash
pnpm run build
```

This generates:
- Optimized static HTML for each route
- Code-split JavaScript bundles
- Minified CSS
- Output in `dist-ssg/` directory

### Build and Serve with Mock Server

Build and run the static site with mock server:
```bash
pnpm run build:serve
```

## API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/metrics/current` - Current system metrics
- `GET /api/metrics/history` - Historical metrics data
- `GET /api/dashboard/*` - Dashboard statistics
- `GET /api-docs` - Swagger UI documentation
- `GET /docs` - Markdown documentation

### Protected Endpoints (require authentication)
- `GET /api/traces` - List distributed traces
- `GET /api/traces/:id` - Get trace details
- `GET /api/todos` - Todo management
- `GET /api/posts` - Blog posts
- `GET /api/users` - User management

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

## Key Components

### Distributed Tracing (`/dashboard/traces`)
- Real-time trace monitoring
- Multiple visualization modes
- Service dependency mapping
- Error tracking and analysis

### Network Path Visualization (`/dashboard/network-path`)
- Interactive network topology
- Real-time traffic flow
- Node health monitoring
- Connection metrics

### System Metrics
- CPU, Memory, Disk usage
- Network I/O monitoring
- Request rate tracking
- Error rate analysis

## Testing

### Unit Testing with Vitest

The project uses Vitest for unit testing React components and utility functions.

#### Run Tests

Run all tests once:
```bash
pnpm test
```

Run tests in watch mode (auto-reruns on file changes):
```bash
pnpm test:watch
```

Generate coverage report:
```bash
pnpm test:coverage
```

#### Test Structure

Tests are located alongside the source files:
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx      # Button component tests
│   │   ├── card.tsx
│   │   └── card.test.tsx         # Card component tests
│   ├── Header.tsx
│   └── Header.test.tsx           # Header component tests
└── lib/
    ├── utils.ts
    └── utils.test.ts             # Utility function tests
```

#### Writing Tests

Example test for a React component:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Test Configuration

Vitest is configured in `vitest.config.ts`:
- Environment: jsdom (for DOM testing)
- Global test APIs enabled
- Coverage provider: V8
- Testing utilities: @testing-library/react, @testing-library/jest-dom

#### Coverage Reports

After running `pnpm test:coverage`, view the HTML coverage report:
```bash
# Open coverage report in browser
open coverage/index.html
```

### SSG Testing

Test SSG build:
```bash
pnpm run test:ssg
```

## Code Quality

Format code:
```bash
pnpm run format
```

Lint code:
```bash
pnpm run lint
```

Run all checks:
```bash
pnpm run check
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start frontend development server |
| `pnpm run dev:server` | Start mock API server |
| `pnpm run dev:all` | Start both frontend and mock server |
| `pnpm run build` | Build static site (SSG) |
| `pnpm run serve` | Serve built static site |
| `pnpm run build:serve` | Build and serve with mock server |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:coverage` | Run tests with coverage report |
| `pnpm run test:ssg` | Test SSG build |
| `pnpm run format` | Format code with Biome |
| `pnpm run lint` | Lint code with Biome |
| `pnpm run check` | Run all Biome checks |
| `pnpm run server:install` | Install mock server dependencies |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API server URL | `http://localhost:4001/api` |
| `PORT` | Mock server port | `4001` |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Lighthouse Score: 95+ (Performance)
- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- Bundle size: ~750KB (before gzip)

## Deployment

The `dist-ssg` folder can be deployed to any static hosting service:

### Netlify
```bash
# Build command
pnpm run build

# Publish directory
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
# Deploy using gh-pages
npx gh-pages -d dist-ssg
```

## Troubleshooting

### Authentication Issues
1. Clear localStorage: `localStorage.clear()`
2. Use demo credentials: username `demo`, password `demo123`
3. Check token expiration in browser DevTools
4. Verify mock server is running on port 4001

### CORS Issues
1. Ensure mock server is running on port 4001
2. Check `VITE_API_URL` environment variable
3. Verify CORS settings in `server/src/index.js`

### Trace Data Not Loading
1. Ensure authentication token is valid
2. Check browser console for errors
3. Verify mock server is generating data
4. Try refreshing the page

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please use the GitHub issues page.