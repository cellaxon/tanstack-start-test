import type { User } from '../types/index.js';

interface LocalUser extends User {
  password: string;
}

interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  login?: string;
  avatar_url?: string;
  picture?: string;
}

const users: LocalUser[] = [
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

const oauthUsers = new Map<string, User>();

export function findUserByCredentials(username: string, password: string): User | undefined {
  return users.find(u => u.username === username && u.password === password);
}

export function findUserById(id: string): User | undefined {
  const localUser = users.find(u => u.id === id);
  if (localUser) {
    const { password, ...user } = localUser;
    return user;
  }
  return Array.from(oauthUsers.values()).find(u => u.id === id);
}

export function findOrCreateOAuthUser(provider: string, profile: OAuthProfile): User {
  const key = `${provider}:${profile.id}`;

  if (oauthUsers.has(key)) {
    const user = oauthUsers.get(key);
    if (user) return user;
  }

  const newUser: User = {
    id: `oauth_${Date.now()}`,
    username: profile.email?.split('@')[0] || profile.login || profile.id,
    email: profile.email || `${profile.id}@${provider}.local`,
    name: profile.name || profile.login || 'OAuth User',
    avatar: profile.avatar_url || profile.picture || `https://ui-avatars.com/api/?name=${provider}+User`,
    provider,
  };

  oauthUsers.set(key, newUser);
  return newUser;
}

export function getAllUsers(): User[] {
  const localUsersWithoutPassword = users.map(({ password, ...user }) => user);
  return [...localUsersWithoutPassword, ...Array.from(oauthUsers.values())];
}