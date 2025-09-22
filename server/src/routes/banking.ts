import { Router } from 'express';
import { generateClientTypeData, generateGeographicData } from '../websocket.js';

const router = Router();

// Geographic distribution endpoint
router.get('/geographic', (_req, res) => {
  res.json(generateGeographicData());
});

// Client type distribution endpoint
router.get('/client-distribution', (_req, res) => {
  res.json(generateClientTypeData());
});

// API usage ranking endpoint
router.get('/api-usage', (_req, res) => {
  const endpoints = [
    { endpoint: '/api/auth/login', calls: 285420, avgTime: 45, errorRate: 0.2 },
    { endpoint: '/api/accounts/balance', calls: 195830, avgTime: 32, errorRate: 0.1 },
    { endpoint: '/api/transactions', calls: 178290, avgTime: 78, errorRate: 0.3 },
    { endpoint: '/api/transfers/domestic', calls: 98745, avgTime: 125, errorRate: 0.5 },
    { endpoint: '/api/cards/list', calls: 87632, avgTime: 56, errorRate: 0.1 },
    { endpoint: '/api/loans/eligibility', calls: 45632, avgTime: 234, errorRate: 0.8 },
    { endpoint: '/api/investments/portfolio', calls: 38921, avgTime: 189, errorRate: 0.4 },
    { endpoint: '/api/notifications/send', calls: 29384, avgTime: 23, errorRate: 0.1 },
    { endpoint: '/api/statements/download', calls: 19283, avgTime: 456, errorRate: 1.2 },
    { endpoint: '/api/support/tickets', calls: 8372, avgTime: 67, errorRate: 0.2 },
  ];

  res.json({
    timestamp: new Date(),
    period: '24h',
    topEndpoints: endpoints,
    totalCalls: endpoints.reduce((sum, ep) => sum + ep.calls, 0),
  });
});

// Historical metrics endpoint
router.get('/historical', (req, res) => {
  const { metric, period = '1h' } = req.query;
  const dataPoints = generateHistoricalData(metric as string, period as string);
  res.json(dataPoints);
});

// Audit logs endpoint
router.get('/audit-logs', (_req, res) => {
  const logs = generateAuditLogs();
  res.json(logs);
});

function generateHistoricalData(metric: string, period: string) {
  const intervals = period === '1h' ? 60 : period === '24h' ? 24 : 7;
  const data = [];

  for (let i = intervals; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60000 * (period === '1h' ? 1 : 60));
    let value: { rps?: number; tps?: number; errorRate?: string; errorCount?: number; p50?: number; p95?: number; p99?: number; };

    switch(metric) {
      case 'traffic':
        value = {
          rps: Math.floor(Math.random() * 500) + 100,
          tps: Math.floor(Math.random() * 200) + 50,
        };
        break;
      case 'errors':
        value = {
          errorRate: (Math.random() * 5).toFixed(2),
          errorCount: Math.floor(Math.random() * 100),
        };
        break;
      case 'latency':
        value = {
          p50: Math.floor(Math.random() * 50) + 20,
          p95: Math.floor(Math.random() * 200) + 100,
          p99: Math.floor(Math.random() * 500) + 200,
        };
        break;
      default:
        value = Math.random() * 100;
    }

    data.push({ timestamp, value });
  }

  return { metric, period, data };
}

function generateAuditLogs() {
  const actions = [
    'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'TRANSFER_INITIATED',
    'TRANSFER_COMPLETED', 'ACCOUNT_ACCESSED', 'CARD_BLOCKED',
    'PASSWORD_CHANGED', 'PERMISSION_GRANTED', 'API_KEY_CREATED'
  ];

  const logs = [];
  for (let i = 0; i < 50; i++) {
    logs.push({
      id: `LOG-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      action: actions[Math.floor(Math.random() * actions.length)],
      userId: `USER-${Math.floor(Math.random() * 1000)}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      result: Math.random() > 0.1 ? 'SUCCESS' : 'FAILURE',
      details: {
        userAgent: 'Mozilla/5.0...',
        sessionId: `SESSION-${Math.random().toString(36).substring(7)}`,
      }
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default router;