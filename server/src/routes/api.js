import express from 'express';
import { getAllUsers } from '../db/users.js';

const router = express.Router();

let todos = [
  { id: 1, title: 'Learn TanStack Query', completed: false, userId: '1' },
  { id: 2, title: 'Build OAuth integration', completed: true, userId: '1' },
  { id: 3, title: 'Create mock server', completed: false, userId: '2' },
];

let posts = [
  {
    id: 1,
    title: 'Getting Started with TanStack Query',
    content: 'TanStack Query makes data fetching easy...',
    author: 'Demo User',
    createdAt: new Date('2024-01-01'),
    tags: ['react', 'tanstack', 'query'],
  },
  {
    id: 2,
    title: 'OAuth 2.0 Best Practices',
    content: 'Security considerations for OAuth implementation...',
    author: 'Admin User',
    createdAt: new Date('2024-01-15'),
    tags: ['oauth', 'security', 'authentication'],
  },
];

router.get('/users', (req, res) => {
  const users = getAllUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
  }));
  res.json(users);
});

router.get('/todos', (req, res) => {
  const { page = 1, limit = 10, completed } = req.query;
  let filtered = todos;

  if (completed !== undefined) {
    filtered = todos.filter(t => t.completed === (completed === 'true'));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTodos = filtered.slice(startIndex, endIndex);

  res.json({
    data: paginatedTodos,
    total: filtered.length,
    page: parseInt(page),
    totalPages: Math.ceil(filtered.length / limit),
    hasNext: endIndex < filtered.length,
    hasPrev: page > 1,
  });
});

router.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

router.post('/todos', (req, res) => {
  const { title, completed = false } = req.body;
  const newTodo = {
    id: todos.length + 1,
    title,
    completed,
    userId: req.user.userId,
    createdAt: new Date(),
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

router.put('/todos/:id', (req, res) => {
  const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    ...req.body,
    id: todos[todoIndex].id,
    userId: todos[todoIndex].userId,
  };

  res.json(todos[todoIndex]);
});

router.delete('/todos/:id', (req, res) => {
  const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);
  res.status(204).send();
});

router.get('/posts', (req, res) => {
  const { page = 1, limit = 10, tag } = req.query;
  let filtered = posts;

  if (tag) {
    filtered = posts.filter(p => p.tags.includes(tag));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPosts = filtered.slice(startIndex, endIndex);

  res.json({
    data: paginatedPosts,
    total: filtered.length,
    page: parseInt(page),
    totalPages: Math.ceil(filtered.length / limit),
    hasNext: endIndex < filtered.length,
    hasPrev: page > 1,
  });
});

router.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

router.post('/posts', (req, res) => {
  const { title, content, tags = [] } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content,
    tags,
    author: req.user.name || req.user.email,
    createdAt: new Date(),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

router.get('/dashboard/stats', (req, res) => {
  res.json({
    totalUsers: getAllUsers().length,
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.completed).length,
    totalPosts: posts.length,
    metrics: {
      apiCalls: Math.floor(Math.random() * 10000),
      responseTime: Math.floor(Math.random() * 100),
      errorRate: (Math.random() * 5).toFixed(2),
      uptime: '99.9%',
    },
  });
});

router.get('/notifications', (req, res) => {
  res.json([
    {
      id: 1,
      type: 'info',
      message: 'Welcome to the mock API server!',
      timestamp: new Date(),
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      message: 'Your access token will expire in 5 minutes',
      timestamp: new Date(Date.now() - 300000),
      read: false,
    },
    {
      id: 3,
      type: 'success',
      message: 'OAuth integration successful',
      timestamp: new Date(Date.now() - 600000),
      read: true,
    },
  ]);
});

// Trace data for timeline visualization
router.get('/traces', (req, res) => {
  const { traceId, limit = 20 } = req.query;

  // Generate mock trace data with more variation
  const traces = [];
  const now = Date.now();

  // Service pools for variety
  const services = ['api-gateway', 'user-service', 'order-service', 'payment-service', 'database', 'cache', 'auth-service', 'notification-service', 'inventory-service', 'search-service'];

  // Operation patterns
  const operationPatterns = [
    { service: 'api-gateway', ops: ['GET /api/users', 'POST /api/orders', 'PUT /api/products', 'DELETE /api/items', 'GET /api/dashboard'] },
    { service: 'user-service', ops: ['ValidateUser', 'GetUserProfile', 'UpdateUser', 'CreateUser', 'AuthenticateUser'] },
    { service: 'order-service', ops: ['CreateOrder', 'GetOrder', 'UpdateOrderStatus', 'CancelOrder', 'ProcessOrder'] },
    { service: 'payment-service', ops: ['ProcessPayment', 'RefundPayment', 'ValidateCard', 'CreateInvoice', 'CheckBalance'] },
    { service: 'database', ops: ['SELECT users', 'INSERT orders', 'UPDATE products', 'DELETE items', 'BEGIN TRANSACTION'] },
    { service: 'cache', ops: ['GET user:123', 'SET order:456', 'DELETE session:789', 'EXPIRE key:abc', 'HGET data:xyz'] },
    { service: 'auth-service', ops: ['Login', 'Logout', 'RefreshToken', 'ValidateToken', 'CreateSession'] },
    { service: 'notification-service', ops: ['SendEmail', 'SendSMS', 'PushNotification', 'QueueMessage', 'ProcessQueue'] },
    { service: 'inventory-service', ops: ['CheckStock', 'UpdateInventory', 'ReserveItems', 'ReleaseItems', 'GetAvailability'] },
    { service: 'search-service', ops: ['Search', 'Index', 'Suggest', 'Aggregate', 'Filter'] }
  ];

  for (let i = 0; i < limit; i++) {
    // Random time in the last hour
    const randomTimeOffset = Math.floor(Math.random() * 3600000);
    const startTime = now - randomTimeOffset;

    // Select random service
    const serviceName = services[Math.floor(Math.random() * services.length)];

    // Get appropriate operation for the service
    const serviceOps = operationPatterns.find(p => p.service === serviceName);
    const operationName = serviceOps
      ? serviceOps.ops[Math.floor(Math.random() * serviceOps.ops.length)]
      : 'GenericOperation';

    // Vary duration based on operation type
    let duration;
    if (serviceName === 'database') {
      duration = Math.floor(Math.random() * 800) + 100; // 100-900ms for DB ops
    } else if (serviceName === 'cache') {
      duration = Math.floor(Math.random() * 50) + 5; // 5-55ms for cache ops
    } else if (serviceName.includes('gateway')) {
      duration = Math.floor(Math.random() * 1000) + 200; // 200-1200ms for gateway
    } else {
      duration = Math.floor(Math.random() * 500) + 50; // 50-550ms for others
    }

    // Status with realistic distribution
    const statusRand = Math.random();
    const status = statusRand > 0.95 ? 'error' : statusRand > 0.85 ? 'warning' : 'success';

    // Generate varied tags based on service type
    const tags = {
      'span.kind': ['server', 'client', 'producer', 'consumer'][Math.floor(Math.random() * 4)],
      'component': serviceName
    };

    // Add service-specific tags
    if (serviceName === 'api-gateway' || operationName.includes('/api/')) {
      tags['http.method'] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][Math.floor(Math.random() * 5)];
      tags['http.status_code'] = status === 'error' ? [400, 401, 403, 404, 500, 502, 503][Math.floor(Math.random() * 7)] : 200;
      tags['http.url'] = operationName.includes('/') ? operationName : `/api/${operationName.toLowerCase()}`;
    }

    if (serviceName === 'database') {
      tags['db.type'] = ['postgresql', 'mysql', 'mongodb', 'cassandra'][Math.floor(Math.random() * 4)];
      tags['db.rows'] = Math.floor(Math.random() * 1000);
    }

    if (serviceName === 'cache') {
      tags['cache.type'] = ['redis', 'memcached', 'hazelcast'][Math.floor(Math.random() * 3)];
      tags['cache.hit'] = Math.random() > 0.3;
    }

    if (serviceName.includes('payment')) {
      tags['payment.amount'] = (Math.random() * 1000).toFixed(2);
      tags['payment.currency'] = ['USD', 'EUR', 'GBP', 'JPY'][Math.floor(Math.random() * 4)];
    }

    traces.push({
      traceId: traceId || `trace-${Date.now()}-${i}`,
      serviceName,
      operationName,
      startTime,
      duration,
      status,
      tags,
      spanCount: Math.floor(Math.random() * 15) + 3, // 3-17 spans per trace
      errorCount: status === 'error' ? Math.floor(Math.random() * 3) + 1 : 0
    });
  }

  // Sort by startTime (most recent first)
  traces.sort((a, b) => b.startTime - a.startTime);

  res.json({
    traces,
    total: traces.length,
    timestamp: new Date()
  });
});

// Get specific trace details with spans
router.get('/traces/:traceId', (req, res) => {
  const { traceId } = req.params;
  const baseTime = Date.now() - Math.floor(Math.random() * 60000); // Random time in last minute

  // Helper function to generate random service name
  const getRandomService = () => {
    const services = ['api-gateway', 'user-service', 'order-service', 'payment-service', 'database', 'cache', 'payment-gateway', 'auth-service', 'notification-service', 'inventory-service'];
    return services[Math.floor(Math.random() * services.length)];
  };

  // Helper function to generate random operation
  const getRandomOperation = (service) => {
    const operations = {
      'api-gateway': ['GET /api/users', 'POST /api/orders', 'PUT /api/products', 'DELETE /api/items', 'GET /api/dashboard'],
      'user-service': ['ValidateUser', 'GetUserProfile', 'UpdateUser', 'CreateUser', 'AuthenticateUser'],
      'order-service': ['CreateOrder', 'GetOrder', 'UpdateOrderStatus', 'CancelOrder', 'ProcessOrder'],
      'payment-service': ['ProcessPayment', 'RefundPayment', 'ValidateCard', 'CreateInvoice', 'CheckBalance'],
      'database': ['SELECT users', 'INSERT orders', 'UPDATE products', 'DELETE items', 'BEGIN TRANSACTION'],
      'cache': ['GET user:123', 'SET order:456', 'DELETE session:789', 'EXPIRE key:abc', 'HGET data:xyz'],
      'payment-gateway': ['ChargeCard', 'AuthorizePayment', 'CapturePayment', 'Webhook', 'CreateToken'],
      'auth-service': ['Login', 'Logout', 'RefreshToken', 'ValidateToken', 'CreateSession'],
      'notification-service': ['SendEmail', 'SendSMS', 'PushNotification', 'QueueMessage', 'ProcessQueue'],
      'inventory-service': ['CheckStock', 'UpdateInventory', 'ReserveItems', 'ReleaseItems', 'GetAvailability']
    };
    const serviceOps = operations[service] || ['Operation'];
    return serviceOps[Math.floor(Math.random() * serviceOps.length)];
  };

  // Helper function to generate random status with weighted probability
  const getRandomStatus = () => {
    return Math.random() > 0.15 ? 'success' : Math.random() > 0.5 ? 'error' : 'warning';
  };

  // Generate random number of spans (5-15)
  const spanCount = Math.floor(Math.random() * 11) + 5;
  const spans = [];

  // Create root span
  const rootService = 'api-gateway';
  const rootDuration = Math.floor(Math.random() * 1500) + 500; // 500-2000ms
  const rootSpan = {
    spanId: 'span-1',
    traceId,
    parentSpanId: null,
    serviceName: rootService,
    operationName: getRandomOperation(rootService),
    startTime: baseTime,
    duration: rootDuration,
    level: 0,
    status: getRandomStatus(),
    tags: {
      'http.method': ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      'http.url': `/api/${['users', 'orders', 'products', 'dashboard'][Math.floor(Math.random() * 4)]}`,
      'http.status_code': Math.random() > 0.1 ? 200 : [400, 401, 404, 500][Math.floor(Math.random() * 4)],
      'user.id': `user-${Math.floor(Math.random() * 1000)}`,
      'request.id': `req-${Math.random().toString(36).substring(7)}`
    },
    events: [
      { timestamp: baseTime + Math.floor(Math.random() * 20), name: 'request_received' },
      { timestamp: baseTime + rootDuration - Math.floor(Math.random() * 20), name: 'response_sent' }
    ]
  };
  spans.push(rootSpan);

  // Generate child spans with hierarchical structure
  let currentTime = baseTime + Math.floor(Math.random() * 50) + 20;
  let parentCandidates = ['span-1']; // Start with root as potential parent

  for (let i = 2; i <= spanCount; i++) {
    // Select random parent from candidates (creates realistic hierarchy)
    const parentId = parentCandidates[Math.floor(Math.random() * parentCandidates.length)];
    const parentSpan = spans.find(s => s.spanId === parentId);
    const level = parentSpan.level + 1;

    // Ensure child starts after parent and ends before parent ends
    const parentEndTime = parentSpan.startTime + parentSpan.duration;
    const maxDuration = parentEndTime - currentTime - 50; // Leave some gap

    if (maxDuration <= 0) {
      continue; // Skip if we can't fit this span
    }

    const service = getRandomService();
    const duration = Math.min(Math.floor(Math.random() * 500) + 50, maxDuration);

    const span = {
      spanId: `span-${i}`,
      traceId,
      parentSpanId: parentId,
      serviceName: service,
      operationName: getRandomOperation(service),
      startTime: currentTime,
      duration: duration,
      level: level,
      status: getRandomStatus(),
      tags: {}
    };

    // Add service-specific tags
    if (service === 'database') {
      span.tags = {
        'db.type': ['postgresql', 'mysql', 'mongodb', 'redis'][Math.floor(Math.random() * 4)],
        'db.statement': `${['SELECT', 'INSERT', 'UPDATE', 'DELETE'][Math.floor(Math.random() * 4)]} ...`,
        'db.rows': Math.floor(Math.random() * 1000)
      };
    } else if (service === 'cache') {
      span.tags = {
        'cache.type': ['redis', 'memcached', 'local'][Math.floor(Math.random() * 3)],
        'cache.hit': Math.random() > 0.3,
        'cache.key': `key-${Math.random().toString(36).substring(7)}`
      };
    } else if (service.includes('payment')) {
      span.tags = {
        'payment.method': ['credit_card', 'debit_card', 'paypal', 'crypto'][Math.floor(Math.random() * 4)],
        'payment.amount': (Math.random() * 1000).toFixed(2),
        'payment.currency': ['USD', 'EUR', 'GBP', 'JPY'][Math.floor(Math.random() * 4)]
      };
    } else {
      span.tags = {
        'span.kind': ['server', 'client', 'producer', 'consumer'][Math.floor(Math.random() * 4)],
        'component': service,
        'peer.service': getRandomService()
      };
    }

    // Occasionally add events
    if (Math.random() > 0.7) {
      span.events = [
        { timestamp: span.startTime + Math.floor(Math.random() * 20), name: 'processing_started' },
        { timestamp: span.startTime + span.duration - Math.floor(Math.random() * 20), name: 'processing_completed' }
      ];
    }

    spans.push(span);

    // Add this span as potential parent for deeper nesting (30% chance)
    if (level < 3 && Math.random() > 0.7) {
      parentCandidates.push(`span-${i}`);
    }

    // Move time forward
    currentTime += Math.floor(Math.random() * 100) + 20;
  }

  // Calculate actual duration based on all spans
  const actualDuration = Math.max(...spans.map(s => s.startTime + s.duration - baseTime));

  res.json({
    traceId,
    rootSpan: spans[0],
    spans,
    startTime: baseTime,
    duration: actualDuration,
    serviceCount: new Set(spans.map(s => s.serviceName)).size,
    spanCount: spans.length,
    errorCount: spans.filter(s => s.status === 'error').length
  });
});

// Get trace waterfall data for network visualization
router.get('/traces/:traceId/waterfall', (req, res) => {
  const { traceId } = req.params;
  const baseTime = Date.now() - 10000;

  const waterfallData = [
    {
      resource: 'api-gateway',
      startTime: baseTime,
      responseStart: baseTime + 20,
      endTime: baseTime + 850,
      type: 'server',
      size: 2048,
      status: 200
    },
    {
      resource: 'user-service',
      startTime: baseTime + 80,
      responseStart: baseTime + 100,
      endTime: baseTime + 200,
      type: 'http',
      size: 512,
      status: 200
    },
    {
      resource: 'database',
      startTime: baseTime + 220,
      responseStart: baseTime + 250,
      endTime: baseTime + 400,
      type: 'database',
      size: 1024,
      status: 200
    },
    {
      resource: 'payment-service',
      startTime: baseTime + 420,
      responseStart: baseTime + 450,
      endTime: baseTime + 770,
      type: 'http',
      size: 768,
      status: 200
    },
    {
      resource: 'cache',
      startTime: baseTime + 780,
      responseStart: baseTime + 785,
      endTime: baseTime + 795,
      type: 'cache',
      size: 256,
      status: 200
    }
  ];

  res.json({
    traceId,
    waterfall: waterfallData,
    totalDuration: 850,
    totalSize: waterfallData.reduce((sum, item) => sum + item.size, 0)
  });
});

export default router;