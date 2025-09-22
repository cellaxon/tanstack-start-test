import type { Request } from 'express';

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  provider?: string;
  createdAt?: Date;
}

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: string;
  createdAt?: Date;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  tags: string[];
}

export interface Trace {
  traceId: string;
  serviceName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error' | 'warning';
  spans: TraceSpan[];
  metadata: {
    httpMethod?: string;
    statusCode?: number;
    userAgent?: string;
    clientIp?: string;
    path?: string;
    userId?: string;
  };
}

export interface TraceSpan {
  spanId: string;
  parentSpanId: string | null;
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error' | 'warning';
  logs: string[];
  tags: Record<string, string>;
  service?: string;
}

export interface SystemMetrics {
  timestamp?: string;
  cpu_usage: number;
  memory_usage: number;
  memory_total: number;
  memory_free: number;
  swap_usage?: number;
  swap_total?: number;
  swap_free?: number;
  process_cpu: number;
  process_memory: number;
  network_rx: number;
  network_tx: number;
  disk_usage: number;
  disk_total: number;
}

export interface TokenPayload {
  userId: string;
  username: string;
  email?: string;
  iat?: number;
  exp?: number;
}