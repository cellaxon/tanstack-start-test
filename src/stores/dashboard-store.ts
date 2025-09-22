import { Store } from '@tanstack/react-store';

// Types
export interface DashboardSettings {
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  language: 'ko' | 'en';

  // Chart preferences
  chartAnimations: boolean;
  chartTransitionDuration: number;
  maxDataPoints: number;
  refreshInterval: number;

  // Dashboard layout
  sidebarCollapsed: boolean;
  currentTab: 'overview' | 'banking';
  bankingSubTab: 'traffic' | 'errors' | 'resources' | 'security' | 'business' | 'geographic';

  // Monitoring preferences
  autoReconnectWebSocket: boolean;
  showRealTimeIndicator: boolean;
  enableNotifications: boolean;
  notificationThresholds: {
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
  };

  // Filter settings
  dateRange: 'last_5min' | 'last_15min' | 'last_30min' | 'last_1h' | 'last_24h' | 'custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  selectedRegions: string[];
  selectedServices: string[];
}

export interface UserPreferences {
  userId?: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role?: 'admin' | 'viewer' | 'operator';
  permissions: string[];
  lastLogin?: Date;
}

export interface DashboardState {
  settings: DashboardSettings;
  user: UserPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  errors: string[];
}

// Initial state
const initialState: DashboardState = {
  settings: {
    theme: 'auto',
    density: 'comfortable',
    language: 'ko',
    chartAnimations: true,
    chartTransitionDuration: 300,
    maxDataPoints: 100,
    refreshInterval: 5000,
    sidebarCollapsed: false,
    currentTab: 'overview',
    bankingSubTab: 'traffic',
    autoReconnectWebSocket: true,
    showRealTimeIndicator: true,
    enableNotifications: true,
    notificationThresholds: {
      errorRate: 5,
      cpuUsage: 80,
      memoryUsage: 85,
      responseTime: 1000
    },
    dateRange: 'last_30min',
    selectedRegions: [],
    selectedServices: []
  },
  user: null,
  isLoading: false,
  isSaving: false,
  errors: []
};

// Create store
export const dashboardStore = new Store<DashboardState>(initialState);

// Actions
export const dashboardActions = {
  // Settings actions
  updateSettings: (settings: Partial<DashboardSettings>) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        ...settings
      }
    }));
  },

  setTheme: (theme: DashboardSettings['theme']) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        theme
      }
    }));
    // Apply theme to document
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleSidebar: () => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        sidebarCollapsed: !state.settings.sidebarCollapsed
      }
    }));
  },

  setCurrentTab: (tab: DashboardSettings['currentTab']) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        currentTab: tab
      }
    }));
  },

  setBankingSubTab: (tab: DashboardSettings['bankingSubTab']) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        bankingSubTab: tab
      }
    }));
  },

  setDateRange: (range: DashboardSettings['dateRange'], custom?: { start: Date; end: Date }) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        dateRange: range,
        customDateRange: custom
      }
    }));
  },

  updateNotificationThresholds: (thresholds: Partial<DashboardSettings['notificationThresholds']>) => {
    dashboardStore.setState(state => ({
      ...state,
      settings: {
        ...state.settings,
        notificationThresholds: {
          ...state.settings.notificationThresholds,
          ...thresholds
        }
      }
    }));
  },

  // User actions
  setUser: (user: UserPreferences | null) => {
    dashboardStore.setState(state => ({
      ...state,
      user
    }));
  },

  updateUser: (updates: Partial<UserPreferences>) => {
    dashboardStore.setState(state => ({
      ...state,
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },

  // State management
  setLoading: (isLoading: boolean) => {
    dashboardStore.setState(state => ({
      ...state,
      isLoading
    }));
  },

  setSaving: (isSaving: boolean) => {
    dashboardStore.setState(state => ({
      ...state,
      isSaving,
      lastSaved: isSaving ? state.lastSaved : new Date()
    }));
  },

  addError: (error: string) => {
    dashboardStore.setState(state => ({
      ...state,
      errors: [...state.errors, error]
    }));
  },

  clearErrors: () => {
    dashboardStore.setState(state => ({
      ...state,
      errors: []
    }));
  },

  // Persistence
  saveToLocalStorage: () => {
    const state = dashboardStore.state;
    localStorage.setItem('dashboardSettings', JSON.stringify(state.settings));
    if (state.user) {
      localStorage.setItem('userPreferences', JSON.stringify(state.user));
    }
    dashboardActions.setSaving(false);
  },

  loadFromLocalStorage: () => {
    try {
      const settings = localStorage.getItem('dashboardSettings');
      const user = localStorage.getItem('userPreferences');

      if (settings) {
        const parsedSettings = JSON.parse(settings);
        dashboardActions.updateSettings(parsedSettings);
      }

      if (user) {
        const parsedUser = JSON.parse(user);
        dashboardActions.setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      dashboardActions.addError('Failed to load saved settings');
    }
  },

  resetToDefaults: () => {
    dashboardStore.setState(state => ({
      ...state,
      settings: initialState.settings
    }));
    localStorage.removeItem('dashboardSettings');
  }
};

// Selectors
export const dashboardSelectors = {
  getTheme: (state: DashboardState) => state.settings.theme,

  getCurrentView: (state: DashboardState) => ({
    tab: state.settings.currentTab,
    subTab: state.settings.currentTab === 'banking' ? state.settings.bankingSubTab : null
  }),

  getChartSettings: (state: DashboardState) => ({
    animations: state.settings.chartAnimations,
    duration: state.settings.chartTransitionDuration,
    maxPoints: state.settings.maxDataPoints,
    refreshInterval: state.settings.refreshInterval
  }),

  getNotificationSettings: (state: DashboardState) => ({
    enabled: state.settings.enableNotifications,
    thresholds: state.settings.notificationThresholds
  }),

  isAdmin: (state: DashboardState) => state.user?.role === 'admin',

  canEdit: (state: DashboardState) =>
    state.user?.role === 'admin' || state.user?.role === 'operator',

  getDateRangeInMs: (state: DashboardState): { start: number; end: number } => {
    const now = Date.now();
    const { dateRange, customDateRange } = state.settings;

    if (dateRange === 'custom' && customDateRange) {
      return {
        start: customDateRange.start.getTime(),
        end: customDateRange.end.getTime()
      };
    }

    const ranges: Record<string, number> = {
      'last_5min': 5 * 60 * 1000,
      'last_15min': 15 * 60 * 1000,
      'last_30min': 30 * 60 * 1000,
      'last_1h': 60 * 60 * 1000,
      'last_24h': 24 * 60 * 60 * 1000
    };

    const duration = ranges[dateRange] || ranges['last_30min'];
    return {
      start: now - duration,
      end: now
    };
  }
};

// Initialize from localStorage on load
if (typeof window !== 'undefined') {
  dashboardActions.loadFromLocalStorage();
}