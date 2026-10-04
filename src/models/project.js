import { generateId } from '../utils/ids.js';

export function createProject(input = {}) {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId('proj'),
    name: (input.name ?? '').trim(),
    createdAt: input.createdAt ?? now,
    order: input.order ?? Date.now(),
  };
}

export function sortProjects(projects) {
  return Object.values(projects).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
