import { generateId } from '../utils/ids.js';

export function createTask(input = {}) {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId('task'),
    title: input.title ?? '',
    completed: Boolean(input.completed),
    projectId: input.projectId ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    dueDate: input.dueDate ?? null,
    createdAt: input.createdAt ?? now,
    completedAt: input.completedAt ?? (input.completed ? now : null),
    order: input.order ?? Date.now(),
  };
}

export function sortTasks(tasks, { projectId = undefined } = {}) {
  let list = Object.values(tasks);
  if (projectId !== undefined) {
    list = list.filter((t) => t.projectId === projectId);
  }
  return list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export function taskMatchesSearch(task, projectName, q) {
  if (!q) return true;
  const hay = [task.title, projectName].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(q);
}

export function applyTaskFilter(task, filter) {
  if (filter === 'completed') return task.completed;
  if (filter === 'active') return !task.completed;
  if (filter === 'unassigned') return !task.projectId;
  return true;
}
