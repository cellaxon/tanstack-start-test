import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';
import {
  dashboardStore,
  dashboardActions,
  dashboardSelectors,
  DashboardSettings,
  UserPreferences
} from '@/stores/dashboard-store';

export function useDashboardStore() {
  const state = useStore(dashboardStore);

  // Memoized actions
  const updateSettings = useCallback((settings: Partial<DashboardSettings>) => {
    dashboardActions.updateSettings(settings);
  }, []);

  const setTheme = useCallback((theme: DashboardSettings['theme']) => {
    dashboardActions.setTheme(theme);
  }, []);

  const toggleSidebar = useCallback(() => {
    dashboardActions.toggleSidebar();
  }, []);

  const setCurrentTab = useCallback((tab: DashboardSettings['currentTab']) => {
    dashboardActions.setCurrentTab(tab);
  }, []);

  const setBankingSubTab = useCallback((tab: DashboardSettings['bankingSubTab']) => {
    dashboardActions.setBankingSubTab(tab);
  }, []);

  const setDateRange = useCallback(
    (range: DashboardSettings['dateRange'], custom?: { start: Date; end: Date }) => {
      dashboardActions.setDateRange(range, custom);
    },
    []
  );

  const setUser = useCallback((user: UserPreferences | null) => {
    dashboardActions.setUser(user);
  }, []);

  const saveSettings = useCallback(() => {
    dashboardActions.setSaving(true);
    dashboardActions.saveToLocalStorage();
  }, []);

  const resetSettings = useCallback(() => {
    if (confirm('정말로 모든 설정을 초기화하시겠습니까?')) {
      dashboardActions.resetToDefaults();
    }
  }, []);

  // Computed values from selectors
  const currentView = dashboardSelectors.getCurrentView(state);
  const chartSettings = dashboardSelectors.getChartSettings(state);
  const notificationSettings = dashboardSelectors.getNotificationSettings(state);
  const isAdmin = dashboardSelectors.isAdmin(state);
  const canEdit = dashboardSelectors.canEdit(state);
  const dateRangeInMs = dashboardSelectors.getDateRangeInMs(state);

  return {
    // State
    ...state,
    settings: state.settings,
    user: state.user,

    // Actions
    updateSettings,
    setTheme,
    toggleSidebar,
    setCurrentTab,
    setBankingSubTab,
    setDateRange,
    setUser,
    saveSettings,
    resetSettings,

    // Computed values
    currentView,
    chartSettings,
    notificationSettings,
    isAdmin,
    canEdit,
    dateRangeInMs,

    // Quick access to common settings
    theme: state.settings.theme,
    language: state.settings.language,
    sidebarCollapsed: state.settings.sidebarCollapsed,
    currentTab: state.settings.currentTab,
    bankingSubTab: state.settings.bankingSubTab,
  };
}