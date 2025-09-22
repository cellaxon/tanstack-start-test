# Mock Server API Documentation

## Base URL
- Development: `http://localhost:4000/api`
- API Version: 1.0.0

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "1",
    "email": "demo@example.com",
    "name": "Demo User",
    "avatar": "https://ui-avatars.com/api/?name=Demo+User"
  }
}
```

**Available Users:**
- Username: `demo`, Password: `demo123`
- Username: `admin`, Password: `admin123`

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token_here"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

---

## Dashboard APIs

### Dashboard Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalRequests": {
    "value": 1234567,
    "formatted": "1.2M",
    "change": "+12.5",
    "unit": "requests"
  },
  "activeClients": {
    "value": 342,
    "formatted": "342",
    "change": "+5.2",
    "unit": "clients"
  },
  "avgResponseTime": {
    "value": 124,
    "formatted": "124ms",
    "change": "-8.3",
    "unit": "ms"
  },
  "errorRate": {
    "value": 0.8,
    "formatted": "0.8%",
    "change": "-2.1",
    "unit": "%"
  }
}
```

### Request Volume
```http
GET /api/dashboard/request-volume?hours=24
```

**Query Parameters:**
- `hours` (optional): Number of hours to fetch (default: 24)

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "value": 523
    }
  ],
  "total": 12567,
  "average": 524
}
```

### Methods Distribution
```http
GET /api/dashboard/methods-distribution
```

**Response:**
```json
{
  "data": [
    {
      "method": "GET",
      "count": 5234,
      "percentage": "45.2"
    }
  ],
  "total": 11580
}
```

### Status Distribution
```http
GET /api/dashboard/status-distribution
```

### Response Time Trend
```http
GET /api/dashboard/response-time?hours=24
```

### Top Endpoints
```http
GET /api/dashboard/top-endpoints
```

### Error Logs
```http
GET /api/dashboard/errors
```

### Client Usage
```http
GET /api/dashboard/client-usage
```

### Rate Limits
```http
GET /api/dashboard/rate-limits
```

### Billing Information
```http
GET /api/dashboard/billing
```

### Network Path
```http
GET /api/dashboard/network-path
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "client",
      "label": "Client App",
      "type": "client",
      "x": 100,
      "y": 200
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "client",
      "target": "cdn",
      "label": "~10ms",
      "animated": true,
      "traffic": 85.3
    }
  ],
  "metrics": {
    "totalRequests": 8523,
    "avgLatency": "32.5",
    "successRate": "99.2",
    "activeConnections": 342
  }
}
```

---

## Distributed Tracing APIs

### List Traces
```http
GET /api/traces?limit=10
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (optional): Number of traces to return (default: 20)
- `traceId` (optional): Filter by specific trace ID

**Response:**
```json
{
  "traces": [
    {
      "traceId": "trace-1234567890-0",
      "serviceName": "api-gateway",
      "operationName": "GET /api/users",
      "startTime": 1234567890000,
      "duration": 245,
      "status": "success",
      "tags": {
        "http.method": "GET",
        "http.status_code": 200,
        "span.kind": "server"
      },
      "spanCount": 8,
      "errorCount": 0
    }
  ],
  "total": 10,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Get Trace Details
```http
GET /api/traces/{traceId}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "traceId": "trace-test-1",
  "rootSpan": {
    "spanId": "span-1",
    "traceId": "trace-test-1",
    "parentSpanId": null,
    "serviceName": "api-gateway",
    "operationName": "GET /api/users",
    "startTime": 1234567890000,
    "duration": 850,
    "level": 0,
    "status": "success",
    "tags": {
      "http.method": "GET",
      "http.url": "/api/users",
      "http.status_code": 200
    },
    "events": [
      {
        "timestamp": 1234567890010,
        "name": "request_received"
      }
    ]
  },
  "spans": [...],
  "startTime": 1234567890000,
  "duration": 850,
  "serviceCount": 5,
  "spanCount": 7,
  "errorCount": 0
}
```

### Get Trace Waterfall
```http
GET /api/traces/{traceId}/waterfall
Authorization: Bearer {access_token}
```

---

## Resource APIs

### Users
```http
GET /api/users
```

### Todos

#### List Todos
```http
GET /api/todos?page=1&limit=10&completed=false
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `completed` (optional): Filter by completion status

#### Get Todo
```http
GET /api/todos/{id}
Authorization: Bearer {access_token}
```

#### Create Todo
```http
POST /api/todos
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "title": "New todo item",
  "completed": false
}
```

#### Update Todo
```http
PUT /api/todos/{id}
Authorization: Bearer {access_token}
```

#### Delete Todo
```http
DELETE /api/todos/{id}
Authorization: Bearer {access_token}
```

### Posts

Similar CRUD operations as Todos:
- `GET /api/posts`
- `GET /api/posts/{id}`
- `POST /api/posts`

---

## System Metrics

### Current Metrics
```http
GET /api/metrics/current
```

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "cpu_usage": 45.2,
  "memory_usage": 62.8,
  "disk_usage": 38.5,
  "network_in": 125.6,
  "network_out": 89.3,
  "active_connections": 42,
  "request_rate": 523.8,
  "error_rate": 0.8,
  "avg_response_time": 124.5
}
```

### Historical Metrics
```http
GET /api/metrics/history?duration=1h
```

**Query Parameters:**
- `duration`: Time range (`5m`, `15m`, `30m`, `1h`, `3h`, `6h`, `12h`, `24h`)

### Metrics Statistics
```http
GET /api/metrics/stats?duration=1h
```

---

## Notifications
```http
GET /api/notifications
Authorization: Bearer {access_token}
```

---

## Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 123456,
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- Default: 100 requests per minute per IP
- Authenticated: 1000 requests per minute per user

Headers returned:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## CORS

The server supports CORS for all origins in development mode.

---

## WebSocket Events (Future)

Connection URL: `ws://localhost:4000/ws`

Events:
- `metrics:update` - Real-time metrics updates
- `trace:new` - New trace available
- `error:occurred` - Error event

---

## Notes

1. All timestamps are in ISO 8601 format
2. All `/api/traces` endpoints require authentication
3. Mock data is randomly generated on each request
4. Tokens expire after 15 minutes (configurable)
5. Refresh tokens expire after 7 days