import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    clients.add(ws);

    ws.on('message', (message: string) => {
      console.log('Received:', message.toString());
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial connection message
    ws.send(JSON.stringify({ type: 'connected', timestamp: new Date() }));
  });

  // Real-time data generators
  setInterval(() => {
    const trafficData = generateTrafficMetrics();
    broadcast(clients, { type: 'traffic', data: trafficData });
  }, 1000); // Every second

  setInterval(() => {
    const errorData = generateErrorMetrics();
    broadcast(clients, { type: 'errors', data: errorData });
  }, 2000); // Every 2 seconds

  setInterval(() => {
    const resourceData = generateResourceMetrics();
    broadcast(clients, { type: 'resources', data: resourceData });
  }, 3000); // Every 3 seconds

  setInterval(() => {
    const securityData = generateSecurityMetrics();
    broadcast(clients, { type: 'security', data: securityData });
  }, 5000); // Every 5 seconds

  setInterval(() => {
    const slaData = generateSLAMetrics();
    broadcast(clients, { type: 'sla', data: slaData });
  }, 10000); // Every 10 seconds

  console.log('WebSocket server initialized');
}

function broadcast(clients: Set<WebSocket>, data: { type: string; data?: unknown; timestamp?: Date }) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Mock data generators
function generateTrafficMetrics() {
  const endpoints = ['/api/accounts', '/api/transactions', '/api/auth/login', '/api/transfers', '/api/cards'];
  return {
    timestamp: new Date(),
    rps: Math.floor(Math.random() * 500) + 100,
    tps: Math.floor(Math.random() * 200) + 50,
    activeConnections: Math.floor(Math.random() * 1000) + 200,
    responseTime: {
      p50: Math.floor(Math.random() * 50) + 20,
      p95: Math.floor(Math.random() * 200) + 100,
      p99: Math.floor(Math.random() * 500) + 200,
    },
    topEndpoints: endpoints.map(endpoint => ({
      endpoint,
      requests: Math.floor(Math.random() * 1000) + 100,
      avgResponseTime: Math.floor(Math.random() * 100) + 20,
    }))
  };
}

function generateErrorMetrics() {
  return {
    timestamp: new Date(),
    totalErrors: Math.floor(Math.random() * 50),
    errorRate: (Math.random() * 5).toFixed(2),
    statusCodes: {
      '2xx': Math.floor(Math.random() * 8000) + 2000,
      '3xx': Math.floor(Math.random() * 100) + 10,
      '4xx': Math.floor(Math.random() * 500) + 50,
      '5xx': Math.floor(Math.random() * 100) + 5,
    },
    errorsByEndpoint: [
      { endpoint: '/api/auth/login', errors: Math.floor(Math.random() * 20), type: '401' },
      { endpoint: '/api/transfers', errors: Math.floor(Math.random() * 10), type: '403' },
      { endpoint: '/api/transactions', errors: Math.floor(Math.random() * 5), type: '500' },
    ]
  };
}

function generateResourceMetrics() {
  return {
    timestamp: new Date(),
    cpu: {
      usage: (Math.random() * 40 + 30).toFixed(1),
      cores: 8,
    },
    memory: {
      used: (Math.random() * 4 + 4).toFixed(1),
      total: 16,
      percentage: (Math.random() * 40 + 30).toFixed(1),
    },
    connectionPool: {
      active: Math.floor(Math.random() * 50) + 20,
      idle: Math.floor(Math.random() * 30) + 10,
      waiting: Math.floor(Math.random() * 10),
      max: 100,
    },
    network: {
      inbound: (Math.random() * 100 + 50).toFixed(1),
      outbound: (Math.random() * 80 + 40).toFixed(1),
    }
  };
}

function generateSecurityMetrics() {
  const blockedIPs = [
    '192.168.1.100', '10.0.0.50', '172.16.0.25',
    '203.0.113.42', '198.51.100.14'
  ];

  return {
    timestamp: new Date(),
    rateLimiting: {
      blocked: Math.floor(Math.random() * 50),
      throttled: Math.floor(Math.random() * 100),
      passed: Math.floor(Math.random() * 5000) + 1000,
    },
    authentication: {
      successful: Math.floor(Math.random() * 1000) + 500,
      failed: Math.floor(Math.random() * 50) + 10,
      failureRate: (Math.random() * 5).toFixed(2),
    },
    blockedIPs: blockedIPs.slice(0, Math.floor(Math.random() * 5) + 1).map(ip => ({
      ip,
      attempts: Math.floor(Math.random() * 100) + 10,
      lastAttempt: new Date(Date.now() - Math.random() * 3600000),
    })),
    suspiciousActivity: {
      bruteForceAttempts: Math.floor(Math.random() * 10),
      sqlInjectionAttempts: Math.floor(Math.random() * 5),
      xssAttempts: Math.floor(Math.random() * 3),
    }
  };
}

function generateSLAMetrics() {
  const services = ['Authentication', 'Account Management', 'Transaction Processing', 'Card Services', 'Transfer Services'];

  return {
    timestamp: new Date(),
    overall: {
      availability: (99 + Math.random() * 0.95).toFixed(3),
      targetAvailability: 99.95,
      status: 'healthy',
    },
    services: services.map(service => ({
      name: service,
      availability: (98 + Math.random() * 1.95).toFixed(3),
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
      targetResponseTime: 200,
      status: Math.random() > 0.1 ? 'healthy' : 'degraded',
      compliance: Math.random() > 0.2,
    })),
    monthlyStats: {
      totalRequests: Math.floor(Math.random() * 10000000) + 5000000,
      successfulRequests: Math.floor(Math.random() * 9900000) + 4950000,
      totalDowntime: Math.floor(Math.random() * 300), // minutes
      incidentCount: Math.floor(Math.random() * 5),
    }
  };
}

export function generateGeographicData() {
  const regions = [
    // Korean cities
    { region: 'Seoul', lat: 37.5665, lng: 126.9780, requests: Math.floor(Math.random() * 50000) + 10000 },
    { region: 'Busan', lat: 35.1796, lng: 129.0756, requests: Math.floor(Math.random() * 30000) + 5000 },
    { region: 'Incheon', lat: 37.4563, lng: 126.7052, requests: Math.floor(Math.random() * 20000) + 3000 },
    { region: 'Daegu', lat: 35.8714, lng: 128.6014, requests: Math.floor(Math.random() * 15000) + 2000 },
    { region: 'Daejeon', lat: 36.3504, lng: 127.3845, requests: Math.floor(Math.random() * 10000) + 1000 },
    { region: 'Gwangju', lat: 35.1595, lng: 126.8526, requests: Math.floor(Math.random() * 8000) + 1000 },
    { region: 'Ulsan', lat: 35.5384, lng: 129.3114, requests: Math.floor(Math.random() * 7000) + 500 },
    // International cities
    { region: 'Tokyo', lat: 35.6762, lng: 139.6503, requests: Math.floor(Math.random() * 25000) + 5000 },
    { region: 'Singapore', lat: 1.3521, lng: 103.8198, requests: Math.floor(Math.random() * 18000) + 3000 },
    { region: 'New York', lat: 40.7128, lng: -74.0060, requests: Math.floor(Math.random() * 15000) + 2000 },
    { region: 'London', lat: 51.5074, lng: -0.1278, requests: Math.floor(Math.random() * 12000) + 2000 },
    { region: 'Sydney', lat: -33.8688, lng: 151.2093, requests: Math.floor(Math.random() * 8000) + 1000 },
    { region: 'Frankfurt', lat: 50.1109, lng: 8.6821, requests: Math.floor(Math.random() * 10000) + 1500 },
    { region: 'Mumbai', lat: 19.0760, lng: 72.8777, requests: Math.floor(Math.random() * 9000) + 1000 },
    { region: 'São Paulo', lat: -23.5505, lng: -46.6333, requests: Math.floor(Math.random() * 7000) + 800 },
    { region: 'Dubai', lat: 25.2048, lng: 55.2708, requests: Math.floor(Math.random() * 6000) + 700 },
  ];

  return {
    timestamp: new Date(),
    regions: regions.map(r => ({
      ...r,
      latency: Math.floor(Math.random() * 50) + 10,
      errorRate: (Math.random() * 2).toFixed(2),
    }))
  };
}

export function generateClientTypeData() {
  return {
    timestamp: new Date(),
    distribution: [
      { type: 'Mobile App (iOS)', percentage: 35, requests: Math.floor(Math.random() * 35000) + 10000 },
      { type: 'Mobile App (Android)', percentage: 30, requests: Math.floor(Math.random() * 30000) + 8000 },
      { type: 'Web Browser', percentage: 25, requests: Math.floor(Math.random() * 25000) + 7000 },
      { type: 'Third-party API', percentage: 8, requests: Math.floor(Math.random() * 8000) + 2000 },
      { type: 'Internal Systems', percentage: 2, requests: Math.floor(Math.random() * 2000) + 500 },
    ],
    userAgents: {
      browsers: {
        chrome: 45,
        safari: 25,
        firefox: 15,
        edge: 10,
        other: 5,
      },
      os: {
        ios: 35,
        android: 30,
        windows: 20,
        macos: 10,
        linux: 5,
      }
    }
  };
}