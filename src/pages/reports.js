import { computeReports } from '../utils/stats.js';
import { projectProgress, isActiveProject } from '../models/project.js';
import { escapeHtml } from '../components/task-item.js';

export function renderReports(container, ctx) {
  const { data } = ctx;
  const r = computeReports(data);
  const activeProjects = Object.values(data.projects).filter(isActiveProject);

  container.innerHTML = `
    <p class="muted page-intro">Summary based on your local FocusDesk data.</p>
    <div class="stat-grid">
      <div class="stat-card stat-card--static"><span class="stat-card__value">${r.totalProjects}</span><span class="stat-card__label">Total Projects</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${r.activeProjects}</span><span class="stat-card__label">Active Projects</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${r.completedProjects}</span><span class="stat-card__label">Completed Projects</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${r.completionPct}%</span><span class="stat-card__label">Task Completion</span></div>
    </div>
    <div class="reports-grid">
      <section class="card">
        <h3>Task breakdown</h3>
        <ul class="bar-chart">
          ${['todo', 'in_progress', 'blocked', 'completed']
            .map((k) => {
              const count = r.statusCounts[k] || 0;
              const pct = r.totalTasks ? Math.round((count / r.totalTasks) * 100) : 0;
              return `<li><span class="bar-chart__label">${k.replace('_', ' ')}</span><div class="bar-chart__track"><div class="bar-chart__fill" style="width:${pct}%"></div></div><span class="bar-chart__value">${count}</span></li>`;
            })
            .join('')}
        </ul>
        <p class="muted">In progress: ${r.inProgress} · Blocked: ${r.blocked} · Overdue: ${r.overdue}</p>
      </section>
      <section class="card">
        <h3>Project progress</h3>
        <ul class="project-progress-list">
          ${activeProjects
            .map((p) => {
              const prog = projectProgress(p.id, data.tasks);
              return `<li><span>${escapeHtml(p.name)}</span><div class="progress-bar"><div class="progress-bar__fill" style="width:${prog.percent}%"></div></div><span>${prog.percent}%</span></li>`;
            })
            .join('') || '<li class="muted">No active projects</li>'}
        </ul>
      </section>
    </div>
  `;
}
