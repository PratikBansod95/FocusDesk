export function globalSearch(data, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return { projects: [], tasks: [], notes: [] };

  const projects = Object.values(data.projects || {}).filter((p) => {
    const hay = [p.name, p.description, p.category].join(' ').toLowerCase();
    return hay.includes(q);
  });

  const tasks = Object.values(data.tasks || {}).filter((t) => {
    const hay = [t.title, t.description, ...(t.tags || [])].join(' ').toLowerCase();
    return hay.includes(q);
  });

  const notes = Object.values(data.notes || {}).filter((n) => {
    const hay = [n.title, n.content].join(' ').toLowerCase();
    return hay.includes(q);
  });

  return { projects, tasks, notes };
}
