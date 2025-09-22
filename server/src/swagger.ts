import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
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
            expires_in: { type: 'number', example: 900 },
            token_type: { type: 'string', example: 'Bearer' }
          }
        },
        Todo: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            completed: { type: 'boolean' },
            userId: { type: 'string' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts'], // Include both .js and .ts files
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;