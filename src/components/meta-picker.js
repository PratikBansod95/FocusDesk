import { openPopover, closeOpenPopover } from './popover.js';
import { sortProjects } from '../models/project.js';
import { todayISO, formatDueLabel } from '../utils/dates.js';
export function openProjectPicker(anchor, { data, task, onSelect }) {
  const panel = document.createElement('div');
  panel.className = 'meta-picker';

  const title = document.createElement('p');
  title.className = 'meta-picker__title';
  title.textContent = 'Project';
  panel.appendChild(title);

  const none = document.createElement('button');
  none.type = 'button';
  none.className = 'meta-picker__item';
  none.textContent = 'No project';
  none.addEventListener('click', () => {
    onSelect(null);
    closeOpenPopover();
  });
  panel.appendChild(none);

  for (const p of sortProjects(data.projects)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `meta-picker__item${task.projectId === p.id ? ' meta-picker__item--active' : ''}`;
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      onSelect(p.id);
      closeOpenPopover();
    });
    panel.appendChild(btn);
  }

  openPopover(anchor, panel);
}

export function openDuePicker(anchor, { dueDate, onSelect }) {
  const panel = document.createElement('div');
  panel.className = 'meta-picker';

  const title = document.createElement('p');
  title.className = 'meta-picker__title';
  title.textContent = 'Due date';
  panel.appendChild(title);

  const today = todayISO();
  const todayBtn = document.createElement('button');
  todayBtn.type = 'button';
  todayBtn.className = `meta-picker__item${dueDate === today ? ' meta-picker__item--active' : ''}`;
  todayBtn.textContent = formatDueLabel(today, 'picker');
  todayBtn.addEventListener('click', () => {
    onSelect(today);
    closeOpenPopover();
  });
  panel.appendChild(todayBtn);

  const customRow = document.createElement('div');
  customRow.className = 'meta-picker__custom';
  const input = document.createElement('input');
  input.type = 'date';
  input.className = 'input input--sm';
  input.value = dueDate || '';
  input.addEventListener('change', () => {
    onSelect(input.value || null);
    closeOpenPopover();
  });
  customRow.appendChild(input);
  panel.appendChild(customRow);

  openPopover(anchor, panel);
}

export function dueChipLabel(dueDate) {
  if (!dueDate) return null;
  return formatDueLabel(dueDate);
}
