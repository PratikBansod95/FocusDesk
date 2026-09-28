export const PROJECT_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const ACTIVE_PROJECT_STATUSES = ['not_started', 'active', 'on_hold'];

export const SCHEMA_VERSION = 1;
export const ACTIVITY_LIMIT = 100;

export const PAGE_ROUTES = {
  dashboard: { path: 'dashboard', title: 'Home' },
  tasks: { path: 'tasks', title: 'Tasks' },
  projects: { path: 'projects', title: 'Projects' },
  'project-detail': { path: 'project', title: 'Project' },
  'my-day': { path: 'my-day', title: 'My Day' },
  calendar: { path: 'calendar', title: 'Calendar' },
  notes: { path: 'notes', title: 'Notes' },
  reports: { path: 'reports', title: 'Reports' },
  settings: { path: 'settings', title: 'Settings' },
};

export function labelForStatus(list, value) {
  return list.find((x) => x.value === value)?.label ?? value;
}
