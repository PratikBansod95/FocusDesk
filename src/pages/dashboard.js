import { getWelcomeBits } from '../components/header.js';
import { computeDashboardStats, upcomingDeadlines } from '../utils/stats.js';
import { isActiveProject, projectProgress } from '../models/project.js';
import { isDueToday, isOverdue } from '../utils/dates.js';
import { sortTasks } from '../models/task.js';
import { projectCardHtml, bindProjectCard } from '../components/project-card.js';
import { taskRowHtml, bindTaskRow, escapeHtml } from '../components/task-item.js';
import { formatDateTime } from '../utils/dates.js';

export function renderDashboard(container, ctx) {
  const { data, settings, navigate, openTask, completeTask } = ctx;
  const { greeting, dateLabel } = getWelcomeBits();
  const stats = computeDashboardStats(data);

  const focusTasks = sortTasks(
    Object.values(data.tasks).filter(
      (t) => t.status !== 'completed' && (isDueToday(t.dueDate, t.status) || isOverdue(t.dueDate, t.status))
    ),
    'dueDate'
  );

  const activeProjects = Object.values(data.projects)
    .filter(isActiveProject)
    .slice(0, 6);

  const deadlines = upcomingDeadlines(data, 8);
  const activity = (data.activity || []).slice(0, 10);

  const isEmpty =
    !Object.keys(data.projects).length && !Object.keys(data.tasks).length && !data.meta?.demoLoaded;

  container.innerHTML = `
    ${isEmpty ? `<div class="card welcome-empty"><p><strong>Welcome to FocusDesk.</strong> Create your first project or task with <strong>+ Add</strong>, or load demo data from Settings.</p></div>` : ''}
    <section class="welcome-minimal glass" aria-label="Welcome">
      <h2 class="welcome-minimal__title">${greeting}</h2>
      <p class="welcome-minimal__date muted">${dateLabel}</p>
      <p class="muted">Here's what needs your attention today.</p>
    </section>
    <section class="hero-glass" aria-label="Welcome">
      <div class="hero-glass__inner">
        <h2 class="hero-glass__title">${greeting}</h2>
        <p class="hero-glass__text">${dateLabel} — Here's what needs your attention today.</p>
      </div>
    </section>
    <section class="stat-grid" aria-label="Summary">
      <button type="button" class="stat-card" data-nav="projects">
        <span class="stat-card__value">${stats.activeProjects}</span>
        <span class="stat-card__label">Active Projects</span>
      </button>
      <button type="button" class="stat-card" data-nav="tasks-today">
        <span class="stat-card__value">${stats.dueToday}</span>
        <span class="stat-card__label">Due Today</span>
      </button>
      <button type="button" class="stat-card" data-nav="tasks-overdue">
        <span class="stat-card__value">${stats.overdue}</span>
        <span class="stat-card__label">Overdue</span>
      </button>
      <button type="button" class="stat-card" data-nav="tasks-completed">
        <span class="stat-card__value">${stats.completed}</span>
        <span class="stat-card__label">Completed Tasks</span>
      </button>
    </section>
    <div class="dashboard-grid">
      <section class="card">
        <header class="card__header"><h3>Today's Focus</h3></header>
        <div class="task-list" id="dash-focus-list"></div>
      </section>
      <section class="card">
        <header class="card__header"><h3>Upcoming Deadlines</h3></header>
        <ul class="deadline-list" id="dash-deadlines"></ul>
      </section>
      <section class="card card--wide">
        <header class="card__header"><h3>Project Overview</h3></header>
        <div class="project-grid" id="dash-projects"></div>
      </section>
      <section class="card">
        <header class="card__header"><h3>Recent Activity</h3></header>
        <ul class="activity-list" id="dash-activity"></ul>
      </section>
    </div>
  `;

  container.querySelectorAll('.stat-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nav = btn.dataset.nav;
      if (nav === 'projects') navigate('projects');
      else if (nav === 'tasks-today') navigate('tasks', { filter: 'due-today' });
      else if (nav === 'tasks-overdue') navigate('tasks', { filter: 'overdue' });
      else if (nav === 'tasks-completed') navigate('tasks', { filter: 'completed' });
    });
  });

  const focusList = container.querySelector('#dash-focus-list');
  if (!focusTasks.length) {
    focusList.innerHTML = '<p class="empty-state">No tasks due today or overdue. Nice work!</p>';
  } else {
    for (const task of focusTasks) {
      const proj = task.projectId ? data.projects[task.projectId] : null;
      const row = document.createElement('div');
      row.innerHTML = taskRowHtml(task, proj?.name, settings);
      const el = row.firstElementChild;
      bindTaskRow(el, { onOpen: openTask, onComplete: completeTask });
      focusList.appendChild(el);
    }
  }

  const dl = container.querySelector('#dash-deadlines');
  if (!deadlines.length) {
    dl.innerHTML = '<li class="empty-state">No upcoming deadlines.</li>';
  } else {
    for (const item of deadlines) {
      const li = document.createElement('li');
      li.className = `deadline-item deadline-item--${item.kind}`;
      li.innerHTML = `<span class="deadline-item__date">${escapeHtml(item.date)}</span><button type="button" class="link-btn">${escapeHtml(item.title)}</button><span class="badge">${escapeHtml(item.type)}</span>`;
      li.querySelector('button').addEventListener('click', () => {
        if (item.type === 'project') navigate('project-detail', { id: item.id });
        else openTask(item.id);
      });
      dl.appendChild(li);
    }
  }

  const pg = container.querySelector('#dash-projects');
  if (!activeProjects.length) {
    pg.innerHTML = '<p class="empty-state">No active projects. Create one from Projects or Quick Add.</p>';
  } else {
    for (const p of activeProjects) {
      const prog = projectProgress(p.id, data.tasks);
      const wrap = document.createElement('div');
      wrap.innerHTML = projectCardHtml(p, prog, settings);
      const card = wrap.firstElementChild;
      bindProjectCard(card, (id) => navigate('project-detail', { id }));
      pg.appendChild(card);
    }
  }

  const act = container.querySelector('#dash-activity');
  if (!activity.length) {
    act.innerHTML = '<li class="empty-state">No activity yet.</li>';
  } else {
    for (const a of activity) {
      const li = document.createElement('li');
      li.className = 'activity-item';
      li.innerHTML = `<span>${a.message}</span><time class="muted">${formatDateTime(a.createdAt)}</time>`;
      act.appendChild(li);
    }
  }
}
