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

export default router;