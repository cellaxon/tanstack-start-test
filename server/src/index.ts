import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import bankingRouter from './routes/banking.js';
import dashboardRouter from './routes/dashboard.js';
import metricsRouter from './routes/metrics.js';
import proxyRouter from './routes/proxy.js';
import { startMonitoring } from './services/monitoring.js';
import { swaggerSpec } from './swagger.js';
import { setupWebSocketServer } from './websocket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Allow localhost on any port
    if (origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // For production, you would want to be more restrictive
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/banking', bankingRouter);
app.use('/metrics', metricsRouter);
app.use('/proxy', proxyRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);

  // Start system monitoring
  startMonitoring();
});

export default app;