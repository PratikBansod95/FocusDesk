import { openModal } from './modal.js';
import { buildTaskForm, readTaskForm, buildProjectForm, readProjectForm, buildNoteForm, readNoteForm } from './task-form.js';
import { createTask } from '../models/task.js';
import { createProject } from '../models/project.js';
import { createNote } from '../models/note.js';
import { requireNonEmpty } from '../utils/validation.js';
import { showToast } from './toast.js';

export function openQuickAdd({ data, onCreateTask, onCreateProject, onCreateNote }) {
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  tabs.innerHTML = `
    <button type="button" class="tabs__btn tabs__btn--active" data-tab="task">Task</button>
    <button type="button" class="tabs__btn" data-tab="project">Project</button>
    <button type="button" class="tabs__btn" data-tab="note">Note</button>
  `;

  const panel = document.createElement('div');
  panel.className = 'tabs__panel';

  let active = 'task';
  let dirty = false;

  function renderPanel() {
    panel.innerHTML = '';
    dirty = false;
    if (active === 'task') {
      const form = buildTaskForm(createTask({}), data.projects, { isNew: true });
      form.querySelectorAll('input, textarea, select').forEach((el) => {
        el.addEventListener('input', () => {
          dirty = true;
        });
      });
      panel.appendChild(form);
    } else if (active === 'project') {
      panel.appendChild(buildProjectForm(createProject({})));
      panel.querySelectorAll('input, textarea, select').forEach((el) => {
        el.addEventListener('input', () => {
          dirty = true;
        });
      });
    } else {
      panel.appendChild(buildNoteForm(createNote({})));
      panel.querySelectorAll('input, textarea').forEach((el) => {
        el.addEventListener('input', () => {
          dirty = true;
        });
      });
    }
  }

  tabs.querySelectorAll('.tabs__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.tabs__btn').forEach((b) => b.classList.remove('tabs__btn--active'));
      btn.classList.add('tabs__btn--active');
      active = btn.dataset.tab;
      renderPanel();
    });
  });

  const wrap = document.createElement('div');
  wrap.append(tabs, panel);
  renderPanel();

  const modal = openModal({
    title: 'Quick Add',
    content: wrap,
    dirtyCheck: () => dirty,
    footer: (foot, { close }) => {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'btn btn--secondary';
      cancel.textContent = 'Cancel';
      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'btn btn--primary';
      save.textContent = 'Create';
      cancel.addEventListener('click', close);
      save.addEventListener('click', async () => {
        const form = panel.querySelector('form');
        if (!form) return;
        try {
          if (active === 'task') {
            const values = readTaskForm(form);
            const v = requireNonEmpty(values.title, 'Title');
            if (!v.ok) throw new Error(v.error);
            await onCreateTask(values);
          } else if (active === 'project') {
            const values = readProjectForm(form);
            const v = requireNonEmpty(values.name, 'Project name');
            if (!v.ok) throw new Error(v.error);
            await onCreateProject(values);
          } else {
            const values = readNoteForm(form);
            await onCreateNote(values);
          }
          close();
        } catch (e) {
          showToast(e.message || 'Could not create item.', 'error');
        }
      });
      foot.append(cancel, save);
    },
  });
  return modal;
}
