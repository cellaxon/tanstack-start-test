import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock Server API',
      version: '1.0.0',
      description: 'API documentation for the TanStack Mock Server',
      contact: {
        name: 'API Support',
        email: 'api@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:4001/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            avatar: { type: 'string' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'demo' },
            password: { type: 'string', example: 'demo123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_in: { type: 'number' },
            token_type: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Trace: {
          type: 'object',
          properties: {
            traceId: { type: 'string' },
            serviceName: { type: 'string' },
            operationName: { type: 'string' },
            startTime: { type: 'number' },
            duration: { type: 'number' },
            status: {
              type: 'string',
              enum: ['success', 'error', 'warning']
            },
            tags: { type: 'object' },
            spanCount: { type: 'number' },
            errorCount: { type: 'number' }
          }
        },
        Todo: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            completed: { type: 'boolean' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalRequests: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                formatted: { type: 'string' },
                change: { type: 'string' },
                unit: { type: 'string' }
              }
            },
            activeClients: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                formatted: { type: 'string' },
                change: { type: 'string' },
                unit: { type: 'string' }
              }
            },
            avgResponseTime: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                formatted: { type: 'string' },
                change: { type: 'string' },
                unit: { type: 'string' }
              }
            },
            errorRate: {
              type: 'object',
              properties: {
                value: { type: 'number' },
                formatted: { type: 'string' },
                change: { type: 'string' },
                unit: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            statusCode: { type: 'number' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'Auth endpoints' },
      { name: 'Dashboard', description: 'Dashboard statistics endpoints' },
      { name: 'Traces', description: 'Distributed tracing endpoints' },
      { name: 'Todos', description: 'Todo management endpoints' },
      { name: 'Posts', description: 'Post management endpoints' },
      { name: 'Metrics', description: 'System metrics endpoints' },
      { name: 'Health', description: 'Health check endpoints' }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };