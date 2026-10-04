const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
];

export function timePresets() {
  return PRESETS;
}

export function formatMinutes(total) {
  if (total == null || total <= 0) return '';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function parseTimeInput(raw) {
  const s = (raw ?? '').toString().trim().toLowerCase();
  if (!s) return null;
  const hm = s.match(/^(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m?)?$/);
  if (hm) {
    const hours = parseFloat(hm[1]);
    const extra = hm[2] ? parseInt(hm[2], 10) : 0;
    return Math.round(hours * 60 + extra);
  }
  const mOnly = s.match(/^(\d+)\s*m$/);
  if (mOnly) return parseInt(mOnly[1], 10);
  const num = parseInt(s, 10);
  if (!Number.isNaN(num) && /^\d+$/.test(s)) return num;
  return null;
}

export function sumRemainingMinutes(tasks) {
  return Object.values(tasks).reduce((sum, t) => {
    if (t.completed) return sum;
    return sum + (t.estimatedMinutes || 0);
  }, 0);
}

/** Daily workload footer: incomplete tasks due on a specific calendar day (ISO date). */
export function sumRemainingMinutesDueOn(tasks, dateISO) {
  if (!dateISO) return 0;
  return Object.values(tasks).reduce((sum, t) => {
    if (t.completed) return sum;
    if (t.dueDate !== dateISO) return sum;
    return sum + (t.estimatedMinutes || 0);
  }, 0);
}

export function projectProgress(tasks, projectId) {
  const list = Object.values(tasks).filter((t) => t.projectId === projectId);
  if (!list.length) return { completed: 0, total: 0, percent: 0, remainingMinutes: 0 };
  const completed = list.filter((t) => t.completed).length;
  const remainingMinutes = list
    .filter((t) => !t.completed)
    .reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
  return {
    completed,
    total: list.length,
    percent: Math.round((completed / list.length) * 100),
    remainingMinutes,
  };
}
