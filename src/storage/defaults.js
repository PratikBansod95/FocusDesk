import { SCHEMA_VERSION } from '../models/constants.js';

export function createDefaultSettings() {
  return {
    theme: 'light',
    uiStyle: 'liquid-glass',
    defaultPage: 'dashboard',
    defaultTaskView: 'list',
    weekStartsOn: 0,
    dateFormat: 'medium',
    userInitials: 'FD',
    sidebarCollapsed: false,
  };
}

export function createEmptyData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    projects: {},
    tasks: {},
    notes: {},
    dailyPlans: {},
    activity: [],
    settings: createDefaultSettings(),
    meta: { hasSeenWelcome: false, demoLoaded: false },
  };
}
