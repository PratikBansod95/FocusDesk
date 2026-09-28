import { TASK_STATUSES, TASK_PRIORITIES, PROJECT_STATUSES } from '../models/constants.js';
import { escapeHtml } from './task-item.js';

export function buildTaskForm(task, projects, { isNew = false } = {}) {
  const form = document.createElement('form');
  form.className = 'form';
  form.noValidate = true;

  const projectOptions = Object.values(projects)
    .map((p) => `<option value="${p.id}" ${task.projectId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`)
    .join('');

  form.innerHTML = `
    <label class="field">
      <span class="field__label">Title *</span>
      <input class="input" name="title" required value="${escapeHtml(task.title || '')}" />
    </label>
    <label class="field">
      <span class="field__label">Description</span>
      <textarea class="input" name="description" rows="4">${escapeHtml(task.description || '')}</textarea>
    </label>
    <div class="form__row">
      <label class="field">
        <span class="field__label">Project</span>
        <select class="input" name="projectId">
          <option value="">Unassigned</option>
          ${projectOptions}
        </select>
      </label>
      <label class="field">
        <span class="field__label">Status</span>
        <select class="input" name="status">
          ${TASK_STATUSES.map((s) => `<option value="${s.value}" ${task.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="form__row">
      <label class="field">
        <span class="field__label">Priority</span>
        <select class="input" name="priority">
          ${TASK_PRIORITIES.map((p) => `<option value="${p.value}" ${task.priority === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field__label">Tags (comma-separated)</span>
        <input class="input" name="tags" value="${escapeHtml((task.tags || []).join(', '))}" />
      </label>
    </div>
    <div class="form__row">
      <label class="field">
        <span class="field__label">Start date</span>
        <input class="input" type="date" name="startDate" value="${task.startDate || ''}" />
      </label>
      <label class="field">
        <span class="field__label">Due date</span>
        <input class="input" type="date" name="dueDate" value="${task.dueDate || ''}" />
      </label>
    </div>
  `;

  return form;
}

export function readTaskForm(form) {
  const fd = new FormData(form);
  const tags = (fd.get('tags') || '')
    .toString()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const projectId = fd.get('projectId')?.toString() || null;
  return {
    title: fd.get('title')?.toString().trim(),
    description: fd.get('description')?.toString().trim(),
    projectId: projectId || null,
    status: fd.get('status'),
    priority: fd.get('priority'),
    startDate: fd.get('startDate')?.toString() || null,
    dueDate: fd.get('dueDate')?.toString() || null,
    tags,
  };
}

export function buildProjectForm(project) {
  const form = document.createElement('form');
  form.className = 'form';
  form.innerHTML = `
    <label class="field">
      <span class="field__label">Name *</span>
      <input class="input" name="name" required value="${escapeHtml(project.name || '')}" />
    </label>
    <label class="field">
      <span class="field__label">Description</span>
      <textarea class="input" name="description" rows="3">${escapeHtml(project.description || '')}</textarea>
    </label>
    <div class="form__row">
      <label class="field">
        <span class="field__label">Status</span>
        <select class="input" name="status">
          ${PROJECT_STATUSES.map((s) => `<option value="${s.value}" ${project.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span class="field__label">Category</span>
        <input class="input" name="category" value="${escapeHtml(project.category || '')}" />
      </label>
    </div>
    <div class="form__row">
      <label class="field">
        <span class="field__label">Start date</span>
        <input class="input" type="date" name="startDate" value="${project.startDate || ''}" />
      </label>
      <label class="field">
        <span class="field__label">Deadline</span>
        <input class="input" type="date" name="deadline" value="${project.deadline || ''}" />
      </label>
      <label class="field">
        <span class="field__label">Color</span>
        <input class="input" type="color" name="color" value="${project.color || '#4f6ef7'}" />
      </label>
    </div>
  `;
  return form;
}

export function readProjectForm(form) {
  const fd = new FormData(form);
  return {
    name: fd.get('name')?.toString().trim(),
    description: fd.get('description')?.toString().trim(),
    status: fd.get('status'),
    category: fd.get('category')?.toString().trim(),
    startDate: fd.get('startDate')?.toString() || null,
    deadline: fd.get('deadline')?.toString() || null,
    color: fd.get('color')?.toString(),
  };
}

export function buildNoteForm(note) {
  const form = document.createElement('form');
  form.className = 'form';
  form.innerHTML = `
    <label class="field">
      <span class="field__label">Title</span>
      <input class="input" name="title" value="${escapeHtml(note.title || '')}" />
    </label>
    <label class="field">
      <span class="field__label">Content</span>
      <textarea class="input" name="content" rows="8">${escapeHtml(note.content || '')}</textarea>
    </label>
  `;
  return form;
}

export function readNoteForm(form) {
  const fd = new FormData(form);
  return {
    title: fd.get('title')?.toString().trim(),
    content: fd.get('content')?.toString() ?? '',
  };
}
