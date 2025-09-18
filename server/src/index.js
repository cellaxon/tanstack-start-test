import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import proxyRoutes from './routes/proxy.js';
import metricsRoutes from './routes/metrics.js';
import dashboardRoutes from './routes/dashboard.js';
import { authenticateToken } from './middleware/auth.js';
import { startMonitoring } from './services/monitoring.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({
  origin: function(origin, callback) {
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

app.use('/api/auth', authRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/metrics', metricsRoutes); // Public metrics endpoint
app.use('/api/dashboard', dashboardRoutes); // Public dashboard endpoint
app.use('/api', authenticateToken, apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Metrics API: http://localhost:${PORT}/api/metrics`);

  // Start system monitoring
  startMonitoring();
});