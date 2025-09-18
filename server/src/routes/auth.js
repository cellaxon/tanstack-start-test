import express from 'express';
import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth.js';
import { findUserByCredentials, findUserById, findOrCreateOAuthUser } from '../db/users.js';

const router = express.Router();

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

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;