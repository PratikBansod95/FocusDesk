export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function formatDueLabel(iso, dateFormat = 'medium') {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  if (dateFormat === 'picker') {
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString(undefined, {
    month: dateFormat === 'short' ? 'numeric' : 'short',
    day: 'numeric',
    ...(dateFormat === 'long' ? { year: 'numeric' } : { year: 'numeric' }),
  });
}

export function isOverdue(iso, completed) {
  if (!iso || completed) return false;
  return iso < todayISO();
}

export function completedOnDate(task, dateISO) {
  if (!task?.completed || !task.completedAt) return false;
  return task.completedAt.slice(0, 10) === dateISO;
}

/** My Pad list: unassigned; today = active + completed-today; other dates = completed that day only. */
export function taskVisibleOnMyPad(task, viewDate = todayISO()) {
  if (task?.projectId) return false;
  const today = todayISO();
  if (viewDate === today) {
    if (!task.completed) return true;
    return completedOnDate(task, today);
  }
  return completedOnDate(task, viewDate);
}

/** Tasks tab → Projects outline: due today or overdue & incomplete; not future-dated. */
export function isProjectOutlineDueTask(task) {
  if (!task?.dueDate) return false;
  const today = todayISO();
  if (task.dueDate > today) return false;
  if (task.dueDate < today && task.completed) return false;
  return true;
}
