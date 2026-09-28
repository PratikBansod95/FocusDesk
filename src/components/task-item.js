import { formatDate } from '../utils/dates.js';
import { labelForStatus, TASK_STATUSES, TASK_PRIORITIES } from '../models/constants.js';
import { isOverdue } from '../utils/dates.js';

export function taskRowHtml(task, projectName, settings, { showComplete = true } = {}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const statusLabel = labelForStatus(TASK_STATUSES, task.status);
  const priorityLabel = labelForStatus(TASK_PRIORITIES, task.priority);
  const due = task.dueDate ? formatDate(task.dueDate, settings) : 'No due date';
  return `
    <div class="task-row${overdue ? ' task-row--overdue' : ''}" data-task-id="${task.id}">
      <div class="task-row__main">
        ${showComplete ? `<button type="button" class="task-row__check${task.status === 'completed' ? ' is-done' : ''}" aria-label="Mark complete" data-action="complete"></button>` : ''}
        <div class="task-row__body">
          <button type="button" class="task-row__title" data-action="open">${escapeHtml(task.title)}</button>
          <p class="task-row__meta muted">
            <span>${escapeHtml(projectName || 'Inbox')}</span>
            <span class="task-row__dot">·</span>
            <span class="${overdue ? 'text-danger' : ''}">${due}</span>
            <span class="badge badge--soft priority--${task.priority}">${priorityLabel}</span>
            <span class="badge badge--soft">${statusLabel}</span>
          </p>
        </div>
      </div>
    </div>
  `;
}

export function escapeHtml(str) {
  return (str ?? '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function bindTaskRow(el, handlers) {
  el.querySelectorAll('[data-action="open"]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onOpen?.(el.dataset.taskId));
  });
  const check = el.querySelector('[data-action="complete"]');
  if (check) {
    check.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onComplete?.(el.dataset.taskId);
    });
  }
}
