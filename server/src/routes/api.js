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

  // Generate mock trace data
  const traces = [];
  const baseTime = Date.now() - 10000;

  for (let i = 0; i < limit; i++) {
    traces.push({
      traceId: traceId || `trace-${i + 1}`,
      serviceName: ['api-gateway', 'user-service', 'order-service', 'payment-service', 'database'][Math.floor(Math.random() * 5)],
      operationName: ['GET /api/users', 'POST /api/orders', 'Query DB', 'Cache Lookup', 'HTTP Request'][Math.floor(Math.random() * 5)],
      startTime: baseTime + i * 100,
      duration: Math.floor(Math.random() * 500) + 50,
      status: Math.random() > 0.1 ? 'success' : 'error',
      tags: {
        'http.method': ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
        'http.status_code': Math.random() > 0.1 ? 200 : 500,
        'span.kind': 'server'
      }
    });
  }

  res.json({
    traces,
    total: traces.length,
    timestamp: new Date()
  });
});

// Get specific trace details with spans
router.get('/traces/:traceId', (req, res) => {
  const { traceId } = req.params;
  const baseTime = Date.now() - 10000;

  // Generate hierarchical span data
  const spans = [
    {
      spanId: 'span-1',
      traceId,
      parentSpanId: null,
      serviceName: 'api-gateway',
      operationName: 'POST /api/orders',
      startTime: baseTime,
      duration: 850,
      level: 0,
      status: 'success',
      tags: {
        'http.method': 'POST',
        'http.url': '/api/orders',
        'http.status_code': 200,
        'user.id': 'user-123'
      },
      events: [
        { timestamp: baseTime + 10, name: 'request_received' },
        { timestamp: baseTime + 840, name: 'response_sent' }
      ]
    },
    {
      spanId: 'span-2',
      traceId,
      parentSpanId: 'span-1',
      serviceName: 'order-service',
      operationName: 'CreateOrder',
      startTime: baseTime + 50,
      duration: 750,
      level: 1,
      status: 'success',
      tags: {
        'order.id': 'order-456',
        'order.total': 99.99
      }
    },
    {
      spanId: 'span-3',
      traceId,
      parentSpanId: 'span-2',
      serviceName: 'user-service',
      operationName: 'ValidateUser',
      startTime: baseTime + 80,
      duration: 120,
      level: 2,
      status: 'success',
      tags: {
        'user.id': 'user-123',
        'user.valid': true
      }
    },
    {
      spanId: 'span-4',
      traceId,
      parentSpanId: 'span-2',
      serviceName: 'database',
      operationName: 'INSERT orders',
      startTime: baseTime + 220,
      duration: 180,
      level: 2,
      status: 'success',
      tags: {
        'db.type': 'postgresql',
        'db.statement': 'INSERT INTO orders...'
      }
    },
    {
      spanId: 'span-5',
      traceId,
      parentSpanId: 'span-2',
      serviceName: 'payment-service',
      operationName: 'ProcessPayment',
      startTime: baseTime + 420,
      duration: 350,
      level: 2,
      status: 'success',
      tags: {
        'payment.method': 'credit_card',
        'payment.amount': 99.99,
        'payment.currency': 'USD'
      }
    },
    {
      spanId: 'span-6',
      traceId,
      parentSpanId: 'span-5',
      serviceName: 'payment-gateway',
      operationName: 'ChargeCard',
      startTime: baseTime + 450,
      duration: 280,
      level: 3,
      status: 'success',
      tags: {
        'gateway': 'stripe',
        'transaction.id': 'txn-789'
      }
    },
    {
      spanId: 'span-7',
      traceId,
      parentSpanId: 'span-2',
      serviceName: 'cache',
      operationName: 'SET order:456',
      startTime: baseTime + 780,
      duration: 15,
      level: 2,
      status: 'success',
      tags: {
        'cache.type': 'redis',
        'cache.hit': false
      }
    }
  ];

  res.json({
    traceId,
    rootSpan: spans[0],
    spans,
    startTime: baseTime,
    duration: 850,
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