import { escapeHtml } from './task-item.js';
import { formatDate } from '../utils/dates.js';
import { labelForStatus, PROJECT_STATUSES } from '../models/constants.js';

export function projectCardHtml(project, progress, settings) {
  const statusLabel = labelForStatus(PROJECT_STATUSES, project.status);
  return `
    <article class="project-card" data-project-id="${project.id}" tabindex="0" role="button">
      <div class="project-card__accent" style="background:${project.color}"></div>
      <header class="project-card__header">
        <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
        <span class="badge badge--status">${statusLabel}</span>
      </header>
      <p class="project-card__desc muted">${escapeHtml(project.description || 'No description')}</p>
      <div class="progress-bar" aria-label="Progress ${progress.percent}%">
        <div class="progress-bar__fill" style="width:${progress.percent}%"></div>
      </div>
      <p class="project-card__meta muted">${progress.completed} / ${progress.total} tasks · ${progress.percent}%</p>
      ${project.deadline ? `<p class="project-card__deadline">Due ${formatDate(project.deadline, settings)}</p>` : ''}
    </article>
  `;
}

export function bindProjectCard(el, onOpen) {
  const open = () => onOpen(el.dataset.projectId);
  el.addEventListener('click', open);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
}
