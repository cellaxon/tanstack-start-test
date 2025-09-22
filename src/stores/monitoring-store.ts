import { Store } from '@tanstack/react-store';

// Types
export interface TrafficData {
  timestamp: Date;
  rps: number;
  tps: number;
  activeConnections: number;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    avgResponseTime: number;
  }>;
}

export interface ErrorData {
  timestamp: Date;
  errorRate: string;
  totalErrors: number;
  statusCodes: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  errorsByEndpoint: Array<{
    endpoint: string;
    type: string;
    errors: number;
  }>;
}

export interface ResourceData {
  timestamp: Date;
  cpu: {
    usage: string;
    cores: number;
  };
  memory: {
    used: string;
    total: string;
    percentage: string;
  };
  connectionPool: {
    active: number;
    idle: number;
    waiting: number;
    max: number;
  };
  network: {
    inbound: string;
    outbound: string;
  };
}

export interface SecurityData {
  timestamp: Date;
  rateLimiting: {
    passed: number;
    throttled: number;
    blocked: number;
  };
  authentication: {
    successful: number;
    failed: number;
    failureRate: string;
  };
  suspiciousActivity: {
    bruteForceAttempts: number;
    sqlInjectionAttempts: number;
    xssAttempts: number;
  };
  blockedIPs: Array<{
    ip: string;
    attempts: number;
    lastAttempt: Date;
  }>;
}

export interface SLAData {
  overall: {
    availability: string;
    targetAvailability: number;
    status: string;
  };
  monthlyStats: {
    totalRequests: number;
    successfulRequests: number;
    totalDowntime: number;
    incidentCount: number;
  };
  services: Array<{
    name: string;
    availability: string;
    avgResponseTime: number;
    targetResponseTime: number;
    compliance: boolean;
    status: string;
  }>;
}

export interface MonitoringState {
  // Connection status
  isConnected: boolean;
  connectionUrl: string;
  reconnectAttempts: number;

  // Real-time data
  trafficData: TrafficData[];
  errorData: ErrorData[];
  resourceData: ResourceData[];
  securityData: SecurityData[];
  slaData: SLAData | null;

  // Settings
  maxDataPoints: number;
  autoReconnect: boolean;
  reconnectDelay: number;
}

// Initial state
const initialState: MonitoringState = {
  isConnected: false,
  connectionUrl: 'ws://localhost:4000',
  reconnectAttempts: 0,
  trafficData: [],
  errorData: [],
  resourceData: [],
  securityData: [],
  slaData: null,
  maxDataPoints: 100,
  autoReconnect: true,
  reconnectDelay: 5000,
};

// Create store
export const monitoringStore = new Store<MonitoringState>(initialState);

// Actions
export const monitoringActions = {
  setConnectionStatus: (isConnected: boolean) => {
    monitoringStore.setState(state => ({
      ...state,
      isConnected,
      reconnectAttempts: isConnected ? 0 : state.reconnectAttempts
    }));
  },

  incrementReconnectAttempts: () => {
    monitoringStore.setState(state => ({
      ...state,
      reconnectAttempts: state.reconnectAttempts + 1
    }));
  },

  addTrafficData: (data: Omit<TrafficData, 'timestamp'>) => {
    monitoringStore.setState(state => {
      const newData = [...state.trafficData, { ...data, timestamp: new Date() }];
      return {
        ...state,
        trafficData: newData.slice(-state.maxDataPoints)
      };
    });
  },

  addErrorData: (data: Omit<ErrorData, 'timestamp'>) => {
    monitoringStore.setState(state => {
      const newData = [...state.errorData, { ...data, timestamp: new Date() }];
      return {
        ...state,
        errorData: newData.slice(-state.maxDataPoints)
      };
    });
  },

  addResourceData: (data: Omit<ResourceData, 'timestamp'>) => {
    monitoringStore.setState(state => {
      const newData = [...state.resourceData, { ...data, timestamp: new Date() }];
      return {
        ...state,
        resourceData: newData.slice(-state.maxDataPoints)
      };
    });
  },

  addSecurityData: (data: Omit<SecurityData, 'timestamp'>) => {
    monitoringStore.setState(state => {
      const newData = [...state.securityData, { ...data, timestamp: new Date() }];
      return {
        ...state,
        securityData: newData.slice(-state.maxDataPoints)
      };
    });
  },

  setSLAData: (data: SLAData) => {
    monitoringStore.setState(state => ({
      ...state,
      slaData: data
    }));
  },

  clearData: (dataType?: 'traffic' | 'error' | 'resource' | 'security' | 'all') => {
    monitoringStore.setState(state => {
      switch (dataType) {
        case 'traffic':
          return { ...state, trafficData: [] };
        case 'error':
          return { ...state, errorData: [] };
        case 'resource':
          return { ...state, resourceData: [] };
        case 'security':
          return { ...state, securityData: [] };
        case 'all':
        default:
          return {
            ...state,
            trafficData: [],
            errorData: [],
            resourceData: [],
            securityData: [],
            slaData: null
          };
      }
    });
  },

  updateSettings: (settings: Partial<Pick<MonitoringState, 'maxDataPoints' | 'autoReconnect' | 'reconnectDelay'>>) => {
    monitoringStore.setState(state => ({
      ...state,
      ...settings
    }));
  }
};

// Selectors
export const monitoringSelectors = {
  getLatestTraffic: (state: MonitoringState) =>
    state.trafficData[state.trafficData.length - 1] || null,

  getLatestError: (state: MonitoringState) =>
    state.errorData[state.errorData.length - 1] || null,

  getLatestResource: (state: MonitoringState) =>
    state.resourceData[state.resourceData.length - 1] || null,

  getLatestSecurity: (state: MonitoringState) =>
    state.securityData[state.securityData.length - 1] || null,

  getConnectionHealth: (state: MonitoringState) => ({
    isConnected: state.isConnected,
    reconnectAttempts: state.reconnectAttempts,
    isReconnecting: !state.isConnected && state.autoReconnect && state.reconnectAttempts > 0
  }),

  getDataMetrics: (state: MonitoringState) => ({
    trafficPoints: state.trafficData.length,
    errorPoints: state.errorData.length,
    resourcePoints: state.resourceData.length,
    securityPoints: state.securityData.length,
    totalPoints: state.trafficData.length + state.errorData.length +
                 state.resourceData.length + state.securityData.length
  })
};