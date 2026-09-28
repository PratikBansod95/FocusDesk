import { generateId } from '../utils/ids.js';

export function createNote(input = {}) {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId('note'),
    title: (input.title ?? '').trim(),
    content: input.content ?? '',
    projectId: input.projectId ?? null,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}
