import { projectProgress } from '../models/project.js';
import { projectCardHtml, bindProjectCard } from '../components/project-card.js';
import { labelForStatus, PROJECT_STATUSES } from '../models/constants.js';
import { escapeHtml } from '../components/task-item.js';
import { openModal } from '../components/modal.js';
import { buildProjectForm, readProjectForm } from '../components/task-form.js';
import { createProject } from '../models/project.js';
import { requireNonEmpty } from '../utils/validation.js';
import { confirmDialog } from '../components/modal.js';
import { formatDate } from '../utils/dates.js';

export function renderProjects(container, ctx) {
  const { data, settings, navigate, createProjectRecord, updateProjectRecord, deleteProjectRecord, toast } = ctx;
  let viewMode = sessionStorage.getItem('fd_project_view') || 'grid';
  let statusFilter = 'all';
  let sortBy = 'name';
  let search = '';

  function render() {
    let list = Object.values(data.projects);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => [p.name, p.description, p.category].join(' ').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      if (sortBy === 'deadline') return (a.deadline || '9999').localeCompare(b.deadline || '9999');
      if (sortBy === 'created') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (sortBy === 'progress') {
        return projectProgress(b.id, data.tasks).percent - projectProgress(a.id, data.tasks).percent;
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    container.innerHTML = `
      <div class="page-toolbar">
        <input type="search" class="input" id="proj-search" placeholder="Search projects…" value="${escapeHtml(search)}" />
        <select class="input" id="proj-status">
          <option value="all">All statuses</option>
          ${PROJECT_STATUSES.map((s) => `<option value="${s.value}" ${statusFilter === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
        <select class="input" id="proj-sort">
          <option value="name">Sort: Name</option>
          <option value="created">Sort: Created</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="progress">Sort: Progress</option>
        </select>
        <div class="btn-group">
          <button type="button" class="btn btn--secondary ${viewMode === 'grid' ? 'is-active' : ''}" data-view="grid">Grid</button>
          <button type="button" class="btn btn--secondary ${viewMode === 'list' ? 'is-active' : ''}" data-view="list">List</button>
        </div>
        <button type="button" class="btn btn--primary" id="proj-new">New Project</button>
      </div>
      <div id="proj-body"></div>
    `;

    container.querySelector('#proj-sort').value = sortBy;
    container.querySelector('#proj-search').addEventListener('input', (e) => {
      search = e.target.value;
      render();
    });
    container.querySelector('#proj-status').addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });
    container.querySelector('#proj-sort').addEventListener('change', (e) => {
      sortBy = e.target.value;
      render();
    });
    container.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        viewMode = btn.dataset.view;
        sessionStorage.setItem('fd_project_view', viewMode);
        render();
      });
    });

    const body = container.querySelector('#proj-body');
    if (!list.length) {
      body.innerHTML = '<p class="empty-state">No projects match your filters. Create your first project to get started.</p>';
    } else if (viewMode === 'grid') {
      body.className = 'project-grid';
      for (const p of list) {
        const prog = projectProgress(p.id, data.tasks);
        const wrap = document.createElement('div');
        wrap.innerHTML = projectCardHtml(p, prog, settings);
        const card = wrap.firstElementChild;
        bindProjectCard(card, (id) => navigate('project-detail', { id }));
        body.appendChild(card);
      }
    } else {
      body.className = 'table-wrap';
      body.innerHTML = `
        <table class="table">
          <thead><tr><th>Name</th><th>Status</th><th>Progress</th><th>Deadline</th><th></th></tr></thead>
          <tbody>
            ${list
              .map((p) => {
                const prog = projectProgress(p.id, data.tasks);
                return `<tr data-id="${p.id}">
                  <td><button type="button" class="link-btn" data-open>${escapeHtml(p.name)}</button></td>
                  <td><select class="input input--sm" data-status>${PROJECT_STATUSES.map((s) => `<option value="${s.value}" ${p.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}</select></td>
                  <td>${prog.percent}% (${prog.completed}/${prog.total})</td>
                  <td>${formatDate(p.deadline, settings)}</td>
                  <td><button type="button" class="btn btn--ghost btn--sm" data-edit>Edit</button></td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>`;
      body.querySelectorAll('tr').forEach((row) => {
        const id = row.dataset.id;
        row.querySelector('[data-open]')?.addEventListener('click', () => navigate('project-detail', { id }));
        row.querySelector('[data-edit]')?.addEventListener('click', () => openEdit(id));
        row.querySelector('[data-status]')?.addEventListener('change', async (e) => {
          await updateProjectRecord(id, { status: e.target.value });
        });
      });
    }

    container.querySelector('#proj-new').addEventListener('click', () => openEdit(null));
  }

  function openEdit(id) {
    const project = id ? data.projects[id] : createProject({});
    const form = buildProjectForm(project);
    let dirty = false;
    form.addEventListener('input', () => {
      dirty = true;
    });
    openModal({
      title: id ? 'Edit project' : 'New project',
      content: form,
      dirtyCheck: () => dirty,
      footer: (foot, { close }) => {
        const cancel = document.createElement('button');
        cancel.className = 'btn btn--secondary';
        cancel.textContent = 'Cancel';
        const save = document.createElement('button');
        save.className = 'btn btn--primary';
        save.textContent = 'Save';
        cancel.addEventListener('click', close);
        save.addEventListener('click', async () => {
          const values = readProjectForm(form);
          const v = requireNonEmpty(values.name, 'Project name');
          if (!v.ok) return toast?.(v.error, 'error');
          try {
            if (id) await updateProjectRecord(id, values);
            else await createProjectRecord(values);
            dirty = false;
            close();
            render();
          } catch (e) {
            toast?.(e.message, 'error');
          }
        });
        foot.append(cancel);
        if (id) {
          const del = document.createElement('button');
          del.className = 'btn btn--danger';
          del.textContent = 'Delete';
          del.addEventListener('click', async () => {
            const deleteTasks = await confirmDialog({
              title: 'Delete associated tasks?',
              message:
                'Click Confirm to delete all tasks in this project. Click Cancel on the next dialog to delete only the project and keep tasks as unassigned.',
              confirmLabel: 'Delete tasks too',
              danger: true,
            });
            const ok = await confirmDialog({
              title: 'Delete project',
              message: deleteTasks
                ? 'Permanently delete this project and all its tasks?'
                : 'Delete this project? Its tasks will be kept as unassigned.',
              confirmLabel: 'Delete project',
              danger: true,
            });
            if (!ok) return;
            await deleteProjectRecord(id, { deleteTasks });
            close();
            render();
          });
          foot.append(del);
        }
        foot.append(save);
      },
    });
  }

  render();
}
