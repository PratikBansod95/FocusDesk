import { generateId } from '../utils/ids.js';
import { isOverdue, isDueToday, compareDateOnly, todayISO } from '../utils/dates.js';

export function createTask(input = {}) {
  const now = new Date().toISOString();
  const status = input.status ?? 'todo';
  return {
    id: input.id ?? generateId('task'),
    title: (input.title ?? '').trim(),
    description: (input.description ?? '').trim(),
    projectId: input.projectId ?? null,
    status,
    priority: input.priority ?? 'medium',
    startDate: input.startDate ?? null,
    dueDate: input.dueDate ?? null,
    tags: Array.isArray(input.tags) ? [...input.tags] : [],
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    completedAt: status === 'completed' ? input.completedAt ?? now : input.completedAt ?? null,
  };
}

export function taskMatchesFilter(task, filter) {
  if (!task) return false;
  const f = filter || {};
  if (f.projectId && task.projectId !== f.projectId) return false;
  if (f.status && task.status !== f.status) return false;
  if (f.priority && task.priority !== f.priority) return false;
  if (f.tag && !(task.tags || []).includes(f.tag)) return false;
  if (f.unassigned && task.projectId) return false;
  if (f.overdue && !isOverdue(task.dueDate, task.status)) return false;
  if (f.dueToday && !isDueToday(task.dueDate, task.status)) return false;
  if (f.completed && task.status !== 'completed') return false;
  if (f.incomplete && task.status === 'completed') return false;
  if (f.upcoming && (task.status === 'completed' || !task.dueDate || task.dueDate <= todayISO())) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = [task.title, task.description, ...(task.tags || [])].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function sortTasks(tasks, sortBy = 'dueDate') {
  const list = [...tasks];
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  list.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
      case 'created':
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      case 'updated':
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'dueDate':
      default: {
        const c = compareDateOnly(a.dueDate, b.dueDate);
        if (c !== 0) return c;
        return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
      }
    }
  });
  return list;
}

export function applyStatusChange(task, newStatus) {
  const now = new Date().toISOString();
  return {
    ...task,
    status: newStatus,
    updatedAt: now,
    completedAt: newStatus === 'completed' ? now : null,
  };
}
