import { generateId } from '../utils/ids.js';
import { todayISO } from '../utils/dates.js';

export function createProject(input = {}) {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId('proj'),
    name: (input.name ?? '').trim(),
    description: (input.description ?? '').trim(),
    status: input.status ?? 'not_started',
    startDate: input.startDate ?? null,
    deadline: input.deadline ?? null,
    color: input.color ?? '#4f6ef7',
    category: (input.category ?? '').trim(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export function projectProgress(projectId, tasks) {
  const list = Object.values(tasks).filter((t) => t.projectId === projectId);
  if (!list.length) return { percent: 0, completed: 0, total: 0 };
  const completed = list.filter((t) => t.status === 'completed').length;
  return {
    percent: Math.round((completed / list.length) * 100),
    completed,
    total: list.length,
  };
}

export function isActiveProject(project) {
  return project && ['not_started', 'active', 'on_hold'].includes(project.status);
}
