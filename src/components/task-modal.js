import { openModal, confirmDialog } from './modal.js';
import { buildTaskForm, readTaskForm } from './task-form.js';
import { createTask } from '../models/task.js';
import { requireNonEmpty } from '../utils/validation.js';
import { showToast } from './toast.js';

export function openTaskModal({ task, projects, isNew, onSave, onDelete }) {
  const base = task || createTask({});
  const form = buildTaskForm(base, projects, { isNew });
  let dirty = false;
  form.addEventListener('input', () => {
    dirty = true;
  });

  openModal({
    title: isNew ? 'New task' : 'Task details',
    content: form,
    size: 'lg',
    dirtyCheck: () => dirty,
    footer: (foot, { close }) => {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'btn btn--secondary';
      cancel.textContent = 'Cancel';
      cancel.addEventListener('click', close);

      const save = document.createElement('button');
      save.type = 'button';
      save.className = 'btn btn--primary';
      save.textContent = 'Save';
      save.addEventListener('click', async () => {
        const values = readTaskForm(form);
        const v = requireNonEmpty(values.title, 'Title');
        if (!v.ok) {
          showToast(v.error, 'error');
          return;
        }
        try {
          await onSave(values);
          dirty = false;
          close();
        } catch (e) {
          showToast(e.message || 'Save failed.', 'error');
        }
      });

      foot.append(cancel);
      if (!isNew && onDelete) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn btn--danger';
        del.textContent = 'Delete';
        del.addEventListener('click', async () => {
          const ok = await confirmDialog({
            title: 'Delete task',
            message: 'This task will be permanently deleted.',
            confirmLabel: 'Delete',
            danger: true,
          });
          if (ok) {
            await onDelete();
            dirty = false;
            close();
          }
        });
        foot.append(del);
      }
      foot.append(save);
    },
  });
}
