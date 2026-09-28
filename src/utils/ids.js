export function generateId(prefix = 'id') {
  const part = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return `${prefix}_${part}`;
}
