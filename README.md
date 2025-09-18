# API Gateway Dashboard

A modern, responsive dashboard for monitoring and managing API gateway traffic, built with React, TypeScript, and TanStack Router.

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
- **Build Tool**: Vite
- **Mock Server**: Express.js with SQLite
- **Code Quality**: Biome for linting and formatting

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── routes/          # TanStack Router pages
│   └── app/             # Application-specific components
├── server/              # Mock API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── db/          # Database operations
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

### Run separately:

Frontend only:
```bash
pnpm run dev
```

Mock server only:
```bash
pnpm run dev:server
```

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

This:
1. Builds the static site
2. Serves it on http://localhost:3000
3. Runs mock server on http://localhost:4001

## Testing

Run tests:
```bash
pnpm test
```

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
| `pnpm test` | Run tests |
| `pnpm run test:ssg` | Test SSG build |
| `pnpm run format` | Format code with Biome |
| `pnpm run lint` | Lint code with Biome |
| `pnpm run check` | Run all Biome checks |
| `pnpm run server:install` | Install mock server dependencies |

## API Endpoints

The mock server provides the following endpoints:

### Public Endpoints
- `GET /health` - Health check
- `GET /api/metrics/current` - Current system metrics
- `GET /api/metrics/history` - Historical metrics data
- `GET /api/dashboard/*` - Dashboard statistics

### Protected Endpoints (require authentication)
- `GET /api/user` - User information
- `GET /api/billing` - Billing data
- `GET /api/security` - Security events
- `GET /api/settings` - User settings

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

## Features in Detail

### System Monitoring
- Real-time CPU, memory, and network usage
- Historical data with 15-minute retention
- Auto-refresh every second
- Interactive line charts with tooltips

### Dashboard Pages
- **Overview**: Key metrics and quick stats
- **Traffic**: Request volume and patterns
- **Performance**: Response times and latency
- **Errors**: Error tracking and analysis
- **Security**: Security events and threats
- **Rate Limiting**: API rate limit monitoring
- **Billing**: Usage and billing information
- **Clients**: Client application management
- **Settings**: User preferences

### Mock Server Features
- SQLite database for persistent storage
- Simulated real-time metrics
- JWT-based authentication
- CORS enabled for local development
- Proxy support for external APIs

## SSG Output Structure

After building, the static site structure:

```
dist-ssg/
├── index.html                    # Home page
├── login/
│   └── index.html               # Login page
├── dashboard/
│   ├── index.html               # Dashboard overview
│   ├── billing/
│   │   └── index.html          # Billing page
│   ├── clients/
│   │   └── index.html          # Clients page
│   ├── errors/
│   │   └── index.html          # Errors page
│   ├── performance/
│   │   └── index.html          # Performance page
│   ├── rate-limiting/
│   │   └── index.html          # Rate limiting page
│   ├── security/
│   │   └── index.html          # Security page
│   ├── settings/
│   │   └── index.html          # Settings page
│   ├── traffic/
│   │   └── index.html          # Traffic page
│   └── usage/
│       └── index.html          # Usage page
├── assets/                     # JS/CSS bundles
├── sitemap.xml                 # SEO sitemap
├── robots.txt                  # Crawler configuration
├── 404.html                    # 404 error page
└── _redirects                  # Netlify redirects
```

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
- Bundle size: ~650KB (before gzip)

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

### AWS S3 + CloudFront
Upload the `dist-ssg` folder contents to S3 and configure CloudFront for global CDN distribution.

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure the mock server is running on port 4001
2. Check that `VITE_API_URL` is set to `http://localhost:4001/api`
3. Verify CORS settings in `server/src/index.js`
4. For production, configure appropriate CORS origins

### Build Issues
1. Clear build cache: `rm -rf dist-ssg`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Check Node.js version (18+ required)
4. Ensure all environment variables are set

### Mock Server Issues
1. Check if port 4001 is available: `netstat -an | grep 4001`
2. Ensure SQLite database is initialized
3. Check server logs for errors
4. Try reinstalling server dependencies: `pnpm run server:install`

### Static Build Not Connecting to Mock Server
1. Rebuild after updating environment variables
2. Ensure mock server is running before accessing the site
3. Check browser console for CORS or network errors
4. Verify API URL in browser network tab

## Using TanStack Features

### Routing
This project uses file-based routing with TanStack Router. Routes are managed in `src/routes/`.

To add a new route:
1. Create a new file in `src/routes/`
2. Use TanStack Router's route creation utilities
3. The route will be automatically registered

### Data Fetching
The project uses TanStack Query for server state management:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['metrics'],
  queryFn: fetchMetrics,
  refetchInterval: 1000, // Real-time updates
});
```

### Adding Shadcn Components
Add new UI components using:

```bash
pnpx shadcn@latest add button
```

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