const users = [
  {
    id: '1',
    username: 'demo',
    password: 'demo123',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User',
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User',
  },
];

const oauthUsers = new Map();

export function findUserByCredentials(username, password) {
  return users.find(u => u.username === username && u.password === password);
}

export function findUserById(id) {
  return users.find(u => u.id === id);
}

export function findOrCreateOAuthUser(provider, profile) {
  const key = `${provider}:${profile.id}`;

  if (oauthUsers.has(key)) {
    return oauthUsers.get(key);
  }

  const newUser = {
    id: `oauth_${Date.now()}`,
    username: profile.email?.split('@')[0] || profile.login || profile.id,
    email: profile.email || `${profile.id}@${provider}.local`,
    name: profile.name || profile.login || 'OAuth User',
    avatar: profile.avatar_url || profile.picture || `https://ui-avatars.com/api/?name=${provider}+User`,
    provider,
    providerId: profile.id,
  };

  oauthUsers.set(key, newUser);
  return newUser;
}

export function getAllUsers() {
  return [...users, ...Array.from(oauthUsers.values())];
}