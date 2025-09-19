import express from 'express';

const router = express.Router();

// Generate random data with trend
function generateTimeSeriesData(hours = 24, baseValue = 300, variance = 200) {
  const data = [];
  const now = new Date();

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = baseValue + Math.random() * variance + Math.sin(i / 4) * 50;
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value)
    });
  }

  return data;
}

// Dashboard overview stats
router.get('/stats', (req, res) => {
  const stats = {
    totalRequests: {
      value: Math.floor(Math.random() * 500000) + 1000000,
      formatted: '1.2M',
      change: (Math.random() * 20 - 5).toFixed(1),
      unit: 'requests'
    },
    activeClients: {
      value: Math.floor(Math.random() * 100) + 300,
      formatted: '342',
      change: (Math.random() * 10).toFixed(1),
      unit: 'clients'
    },
    avgResponseTime: {
      value: Math.floor(Math.random() * 50) + 100,
      formatted: '124ms',
      change: -(Math.random() * 15).toFixed(1),
      unit: 'ms'
    },
    errorRate: {
      value: Math.random() * 2,
      formatted: '0.8%',
      change: -(Math.random() * 5).toFixed(1),
      unit: '%'
    }
  };

  res.json(stats);
});

// Request volume time series
router.get('/request-volume', (req, res) => {
  const { hours = 24 } = req.query;
  const data = generateTimeSeriesData(Number(hours), 500, 300);

  res.json({
    data,
    total: data.reduce((sum, item) => sum + item.value, 0),
    average: Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)
  });
});

// API methods distribution
router.get('/methods-distribution', (req, res) => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const distribution = methods.map(method => ({
    method,
    count: Math.floor(Math.random() * 5000) + 500,
    percentage: 0
  }));

  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  distribution.forEach(item => {
    item.percentage = ((item.count / total) * 100).toFixed(1);
  });

  res.json({
    data: distribution,
    total
  });
});

// Response status distribution
router.get('/status-distribution', (req, res) => {
  const statuses = [
    { status: '2xx', label: 'Success', count: Math.floor(Math.random() * 2000) + 8000 },
    { status: '3xx', label: 'Redirect', count: Math.floor(Math.random() * 500) + 100 },
    { status: '4xx', label: 'Client Error', count: Math.floor(Math.random() * 500) + 800 },
    { status: '5xx', label: 'Server Error', count: Math.floor(Math.random() * 200) + 100 }
  ];

  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  statuses.forEach(item => {
    item.percentage = ((item.count / total) * 100).toFixed(1);
  });

  res.json({
    data: statuses,
    total
  });
});

// Response time trend
router.get('/response-time', (req, res) => {
  const { hours = 24 } = req.query;
  const data = generateTimeSeriesData(Number(hours), 150, 100);

  res.json({
    data,
    average: Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length),
    min: Math.min(...data.map(d => d.value)),
    max: Math.max(...data.map(d => d.value)),
    p95: Math.round(Math.max(...data.map(d => d.value)) * 0.95),
    p99: Math.round(Math.max(...data.map(d => d.value)) * 0.99)
  });
});

// Traffic by endpoint
router.get('/top-endpoints', (req, res) => {
  const endpoints = [
    '/api/users',
    '/api/products',
    '/api/orders',
    '/api/auth/login',
    '/api/analytics',
    '/api/dashboard',
    '/api/reports',
    '/api/settings'
  ];

  const data = endpoints.map(endpoint => ({
    endpoint,
    requests: Math.floor(Math.random() * 10000) + 1000,
    avgTime: Math.floor(Math.random() * 200) + 50,
    errors: Math.floor(Math.random() * 100)
  })).sort((a, b) => b.requests - a.requests);

  res.json({ data });
});

// Error logs
router.get('/errors', (req, res) => {
  const errorTypes = ['TypeError', 'ReferenceError', 'NetworkError', 'ValidationError', 'AuthenticationError'];
  const endpoints = ['/api/users', '/api/orders', '/api/products', '/api/auth'];

  const errors = [];
  for (let i = 0; i < 20; i++) {
    errors.push({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      message: `Error processing request at ${endpoints[Math.floor(Math.random() * endpoints.length)]}`,
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      statusCode: [400, 401, 403, 404, 500, 502, 503][Math.floor(Math.random() * 7)],
      count: Math.floor(Math.random() * 50) + 1
    });
  }

  res.json({
    data: errors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    total: errors.length
  });
});

// Client usage statistics
router.get('/client-usage', (req, res) => {
  const clients = [];
  const clientNames = ['Mobile App', 'Web App', 'Admin Panel', 'Third Party API', 'Internal Service'];

  for (let i = 0; i < 10; i++) {
    clients.push({
      id: `client-${i + 1}`,
      name: clientNames[Math.floor(Math.random() * clientNames.length)] + ` ${i + 1}`,
      apiKey: `key_${Math.random().toString(36).substring(2, 15)}`,
      requests: Math.floor(Math.random() * 100000) + 10000,
      quota: 1000000,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.2 ? 'active' : 'inactive'
    });
  }

  res.json({
    data: clients.sort((a, b) => b.requests - a.requests),
    total: clients.length
  });
});

// Rate limiting stats
router.get('/rate-limits', (req, res) => {
  const limits = [];
  const tiers = ['free', 'basic', 'pro', 'enterprise'];

  for (let tier of tiers) {
    limits.push({
      tier,
      limit: tier === 'free' ? 1000 : tier === 'basic' ? 10000 : tier === 'pro' ? 100000 : 1000000,
      used: Math.floor(Math.random() * (tier === 'free' ? 900 : tier === 'basic' ? 8000 : tier === 'pro' ? 50000 : 200000)),
      clients: Math.floor(Math.random() * 100) + 10,
      violations: Math.floor(Math.random() * 50)
    });
  }

  res.json({ data: limits });
});

// Billing metrics
router.get('/billing', (req, res) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const billing = months.map(month => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 50000,
    costs: Math.floor(Math.random() * 20000) + 10000,
    profit: 0
  }));

  billing.forEach(item => {
    item.profit = item.revenue - item.costs;
  });

  res.json({
    data: billing,
    totalRevenue: billing.reduce((sum, item) => sum + item.revenue, 0),
    totalCosts: billing.reduce((sum, item) => sum + item.costs, 0),
    totalProfit: billing.reduce((sum, item) => sum + item.profit, 0)
  });
});

// Network path visualization data
router.get('/network-path', (req, res) => {
  const nodes = [
    { id: 'client', label: 'Client App', type: 'client', x: 100, y: 200 },
    { id: 'cdn', label: 'CDN', type: 'cdn', x: 300, y: 100 },
    { id: 'loadbalancer', label: 'Load Balancer', type: 'loadbalancer', x: 500, y: 200 },
    { id: 'api-gateway', label: 'API Gateway', type: 'gateway', x: 700, y: 200 },
    { id: 'auth-service', label: 'Auth Service', type: 'service', x: 900, y: 100 },
    { id: 'app-server-1', label: 'App Server 1', type: 'server', x: 900, y: 200 },
    { id: 'app-server-2', label: 'App Server 2', type: 'server', x: 900, y: 300 },
    { id: 'cache', label: 'Redis Cache', type: 'cache', x: 1100, y: 100 },
    { id: 'database', label: 'PostgreSQL', type: 'database', x: 1100, y: 250 },
    { id: 'monitoring', label: 'Monitoring', type: 'monitoring', x: 700, y: 50 },
    { id: 'queue', label: 'Message Queue', type: 'queue', x: 1100, y: 350 }
  ];

  const edges = [
    { id: 'e1', source: 'client', target: 'cdn', label: '~10ms', animated: true, traffic: Math.random() * 100 },
    { id: 'e2', source: 'cdn', target: 'loadbalancer', label: '~5ms', animated: true, traffic: Math.random() * 100 },
    { id: 'e3', source: 'client', target: 'loadbalancer', label: '~15ms', animated: false, traffic: Math.random() * 100 },
    { id: 'e4', source: 'loadbalancer', target: 'api-gateway', label: '~2ms', animated: true, traffic: Math.random() * 100 },
    { id: 'e5', source: 'api-gateway', target: 'auth-service', label: '~5ms', animated: Math.random() > 0.5, traffic: Math.random() * 100 },
    { id: 'e6', source: 'api-gateway', target: 'app-server-1', label: '~3ms', animated: true, traffic: Math.random() * 100 },
    { id: 'e7', source: 'api-gateway', target: 'app-server-2', label: '~3ms', animated: true, traffic: Math.random() * 100 },
    { id: 'e8', source: 'app-server-1', target: 'cache', label: '~1ms', animated: Math.random() > 0.3, traffic: Math.random() * 100 },
    { id: 'e9', source: 'app-server-2', target: 'cache', label: '~1ms', animated: Math.random() > 0.3, traffic: Math.random() * 100 },
    { id: 'e10', source: 'app-server-1', target: 'database', label: '~10ms', animated: Math.random() > 0.5, traffic: Math.random() * 100 },
    { id: 'e11', source: 'app-server-2', target: 'database', label: '~10ms', animated: Math.random() > 0.5, traffic: Math.random() * 100 },
    { id: 'e12', source: 'api-gateway', target: 'monitoring', label: '', animated: false, traffic: Math.random() * 30 },
    { id: 'e13', source: 'app-server-1', target: 'queue', label: '~2ms', animated: Math.random() > 0.7, traffic: Math.random() * 100 },
    { id: 'e14', source: 'app-server-2', target: 'queue', label: '~2ms', animated: Math.random() > 0.7, traffic: Math.random() * 100 }
  ];

  // Simulate some network metrics
  const metrics = {
    totalRequests: Math.floor(Math.random() * 10000) + 5000,
    avgLatency: (Math.random() * 50 + 20).toFixed(2),
    successRate: (95 + Math.random() * 4).toFixed(2),
    activeConnections: Math.floor(Math.random() * 500) + 200,
    bandwidth: {
      inbound: (Math.random() * 100 + 50).toFixed(2),
      outbound: (Math.random() * 80 + 30).toFixed(2)
    },
    nodeStatus: nodes.reduce((acc, node) => {
      acc[node.id] = {
        healthy: Math.random() > 0.1,
        load: (Math.random() * 100).toFixed(1),
        connections: Math.floor(Math.random() * 100)
      };
      return acc;
    }, {})
  };

  res.json({
    nodes,
    edges,
    metrics,
    timestamp: new Date().toISOString()
  });
});

export default router;