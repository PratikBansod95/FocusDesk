import { projectProgress } from '../models/project.js';
import { labelForStatus, PROJECT_STATUSES, TASK_STATUSES } from '../models/constants.js';
import { escapeHtml } from '../components/task-item.js';
import { formatDate, isOverdue } from '../utils/dates.js';
import { sortTasks } from '../models/task.js';
import { taskRowHtml, bindTaskRow } from '../components/task-item.js';
import { openModal } from '../components/modal.js';
import { buildProjectForm, readProjectForm } from '../components/task-form.js';

export function renderProjectDetail(container, ctx, projectId) {
  const { data, settings, navigate, updateProjectRecord, openTask, completeTask, openNewTaskForProject } = ctx;
  const project = data.projects[projectId];

  if (!project) {
    container.innerHTML = `<p class="empty-state">Project not found. <button type="button" class="link-btn" id="back-proj">Back to projects</button></p>`;
    container.querySelector('#back-proj')?.addEventListener('click', () => navigate('projects'));
    return;
  }

  const prog = projectProgress(projectId, data.tasks);
  const tasks = sortTasks(Object.values(data.tasks).filter((t) => t.projectId === projectId));
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status));
  const counts = { todo: 0, in_progress: 0, blocked: 0, completed: 0 };
  for (const t of tasks) counts[t.status] = (counts[t.status] || 0) + 1;

  const notes = Object.values(data.notes).filter((n) => n.projectId === projectId);

  container.innerHTML = `
    <button type="button" class="btn btn--ghost back-link" id="pd-back">← Projects</button>
    <header class="detail-header">
      <div class="detail-header__accent" style="background:${project.color}"></div>
      <div>
        <h2>${escapeHtml(project.name)}</h2>
        <p class="muted">${escapeHtml(project.description || '')}</p>
        <p><span class="badge badge--status">${labelForStatus(PROJECT_STATUSES, project.status)}</span></p>
      </div>
      <div class="detail-header__actions">
        <button type="button" class="btn btn--secondary" id="pd-edit">Edit</button>
        <button type="button" class="btn btn--primary" id="pd-add-task">Add task</button>
      </div>
    </header>
    <div class="detail-meta muted">
      <span>Start: ${formatDate(project.startDate, settings)}</span>
      <span>Deadline: ${formatDate(project.deadline, settings)}</span>
      <span>Progress: ${prog.percent}%</span>
    </div>
    <div class="stat-grid stat-grid--compact">
      <div class="stat-card stat-card--static"><span class="stat-card__value">${counts.completed}</span><span class="stat-card__label">Completed</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${counts.in_progress}</span><span class="stat-card__label">In Progress</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${counts.todo + counts.blocked}</span><span class="stat-card__label">Pending</span></div>
      <div class="stat-card stat-card--static"><span class="stat-card__value">${overdue.length}</span><span class="stat-card__label">Overdue</span></div>
    </div>
    <section class="card">
      <header class="card__header"><h3>Tasks</h3></header>
      <div class="task-list" id="pd-tasks"></div>
    </section>
    <section class="card">
      <header class="card__header"><h3>Project notes</h3></header>
      <div id="pd-notes"></div>
    </section>
  `;

  container.querySelector('#pd-back').addEventListener('click', () => navigate('projects'));
  container.querySelector('#pd-add-task').addEventListener('click', () => openNewTaskForProject(projectId));
  container.querySelector('#pd-edit').addEventListener('click', () => {
    const form = buildProjectForm(project);
    openModal({
      title: 'Edit project',
      content: form,
      footer: (foot, { close }) => {
        const save = document.createElement('button');
        save.className = 'btn btn--primary';
        save.textContent = 'Save';
        save.addEventListener('click', async () => {
          await updateProjectRecord(projectId, readProjectForm(form));
          close();
        });
        foot.append(save);
      },
    });
  });

  const tl = container.querySelector('#pd-tasks');
  if (!tasks.length) {
    tl.innerHTML = '<p class="empty-state">No tasks in this project yet.</p>';
  } else {
    for (const task of tasks) {
      const row = document.createElement('div');
      row.innerHTML = taskRowHtml(task, project.name, settings);
      bindTaskRow(row.firstElementChild, { onOpen: openTask, onComplete: completeTask });
      tl.appendChild(row.firstElementChild);
    }
  }

  const nl = container.querySelector('#pd-notes');
  if (!notes.length) {
    nl.innerHTML = '<p class="muted">No notes linked to this project.</p>';
  } else {
    nl.innerHTML = notes.map((n) => `<article class="note-snippet"><h4>${escapeHtml(n.title || 'Untitled')}</h4><pre class="note-snippet__body">${escapeHtml(n.content)}</pre></article>`).join('');
  }
}
