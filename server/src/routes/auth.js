import express from 'express';
import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth.js';
import { findUserByCredentials, findUserById, findOrCreateOAuthUser } from '../db/users.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = findUserByCredentials(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tokens = generateTokens(user.id, user.email);

  res.json({
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  });
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: JWT refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expires_in:
 *                   type: number
 *                 token_type:
 *                   type: string
 *       400:
 *         description: Refresh token required
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const decoded = verifyRefreshToken(refresh_token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const tokens = generateTokens(decoded.userId, decoded.email);
  res.json(tokens);
});

/**
 * @swagger
 * /auth/oauth/callback:
 *   post:
 *     summary: OAuth callback
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - code
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, github, microsoft]
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OAuth authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid provider or missing parameters
 */
router.post('/oauth/callback', async (req, res) => {
  const { provider, code } = req.body;

  if (!provider || !code) {
    return res.status(400).json({ error: 'Provider and code required' });
  }

  const mockProfiles = {
    google: {
      id: 'google_123',
      email: 'user@gmail.com',
      name: 'Google User',
      picture: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
    },
    github: {
      id: 'github_456',
      login: 'githubuser',
      email: 'user@github.com',
      name: 'GitHub User',
      avatar_url: 'https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff',
    },
    microsoft: {
      id: 'ms_789',
      email: 'user@outlook.com',
      name: 'Microsoft User',
      picture: 'https://ui-avatars.com/api/?name=Microsoft+User&background=0078d4&color=fff',
    },
  };

  const profile = mockProfiles[provider];
  if (!profile) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  const user = findOrCreateOAuthUser(provider, profile);
  const tokens = generateTokens(user.id, user.email);

  res.json({
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/me', authenticateToken, async (req, res) => {
  const user = findUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

export default router;