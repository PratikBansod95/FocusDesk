import { isOverdue, isDueToday, todayISO } from './dates.js';
import { isActiveProject } from '../models/project.js';

export function computeDashboardStats(data) {
  const projects = Object.values(data.projects || {});
  const tasks = Object.values(data.tasks || {});

  const activeProjects = projects.filter((p) => isActiveProject(p)).length;
  const dueToday = tasks.filter((t) => isDueToday(t.dueDate, t.status)).length;
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  return { activeProjects, dueToday, overdue, completed, totalTasks: tasks.length };
}

export function computeReports(data) {
  const projects = Object.values(data.projects || {});
  const tasks = Object.values(data.tasks || {});

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const blocked = tasks.filter((t) => t.status === 'blocked').length;
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const completionPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusCounts = { todo: 0, in_progress: 0, blocked: 0, completed: 0 };
  for (const t of tasks) statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    inProgress,
    blocked,
    overdue,
    completionPct,
    statusCounts,
  };
}

export function upcomingDeadlines(data, limit = 8) {
  const items = [];
  const today = todayISO();

  for (const p of Object.values(data.projects || {})) {
    if (p.deadline && p.status !== 'completed' && p.status !== 'archived') {
      items.push({
        type: 'project',
        id: p.id,
        title: p.name,
        date: p.deadline,
        kind: p.deadline < today ? 'overdue' : p.deadline === today ? 'today' : 'upcoming',
      });
    }
  }
  for (const t of Object.values(data.tasks || {})) {
    if (t.dueDate && t.status !== 'completed') {
      items.push({
        type: 'task',
        id: t.id,
        title: t.title,
        date: t.dueDate,
        kind: t.dueDate < today ? 'overdue' : t.dueDate === today ? 'today' : 'upcoming',
      });
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items.slice(0, limit);
}
