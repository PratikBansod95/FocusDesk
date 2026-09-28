export function requireNonEmpty(value, fieldName = 'Field') {
  const trimmed = (value ?? '').toString().trim();
  if (!trimmed) {
    return { ok: false, error: `${fieldName} is required.` };
  }
  return { ok: true, value: trimmed };
}

export function validateImportedData(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Invalid backup: not an object.' };
  }
  if (typeof data.schemaVersion !== 'number') {
    return { ok: false, error: 'Invalid backup: missing schema version.' };
  }
  const required = ['projects', 'tasks', 'notes', 'dailyPlans', 'activity', 'settings'];
  for (const key of required) {
    if (data[key] === undefined || data[key] === null) {
      return { ok: false, error: `Invalid backup: missing "${key}".` };
    }
  }
  if (typeof data.projects !== 'object' || typeof data.tasks !== 'object') {
    return { ok: false, error: 'Invalid backup: projects/tasks must be objects.' };
  }
  if (!Array.isArray(data.notes) && typeof data.notes !== 'object') {
    return { ok: false, error: 'Invalid backup: notes format invalid.' };
  }
  return { ok: true, data };
}
