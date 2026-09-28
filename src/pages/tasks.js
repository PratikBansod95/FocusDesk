import { taskMatchesFilter, sortTasks } from '../models/task.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../models/constants.js';
import { taskRowHtml, bindTaskRow, escapeHtml } from '../components/task-item.js';
import { todayISO } from '../utils/dates.js';

export function renderTasks(container, ctx) {
  const { data, settings, routeParams, openTask, completeTask, updateTaskRecord } = ctx;
  let preset = routeParams.filter || 'all';
  let view = data.settings.defaultTaskView || 'list';
  let projectFilter = 'all';
  let statusFilter = 'all';
  let priorityFilter = 'all';
  let tagFilter = '';
  let sortBy = 'dueDate';
  let search = '';
  let showAdvanced = false;

  function buildFilter() {
    const f = { incomplete: preset !== 'completed' };
    if (preset === 'completed') f.completed = true;
    if (preset === 'overdue') f.overdue = true;
    if (preset === 'due-today') f.dueToday = true;
    if (preset === 'upcoming') f.upcoming = true;
    if (preset === 'unassigned') f.unassigned = true;
    if (projectFilter !== 'all') f.projectId = projectFilter;
    if (statusFilter !== 'all') f.status = statusFilter;
    if (priorityFilter !== 'all') f.priority = priorityFilter;
    if (tagFilter) f.tag = tagFilter;
    if (search) f.search = search;
    return f;
  }

  function getTasks() {
    const filter = buildFilter();
    if (preset === 'my-day') {
      const plan = data.dailyPlans[todayISO()]?.taskIds || [];
      return sortTasks(plan.map((id) => data.tasks[id]).filter(Boolean), sortBy);
    }
    return sortTasks(Object.values(data.tasks).filter((t) => taskMatchesFilter(t, filter)), sortBy);
  }

  function render() {
    const tasks = getTasks();
    const projects = Object.values(data.projects);

    container.innerHTML = `
      <div class="tasks-toolbar glass">
        <div class="chip-row" role="tablist">
          ${[
            ['all', 'All'],
            ['due-today', 'Today'],
            ['overdue', 'Overdue'],
            ['upcoming', 'Upcoming'],
            ['completed', 'Done'],
          ]
            .map(
              ([k, label]) =>
                `<button type="button" class="chip${preset === k ? ' chip--active' : ''}" data-preset="${k}">${label}</button>`
            )
            .join('')}
        </div>
        <div class="tasks-toolbar__row">
          <input type="search" class="input" id="task-search" placeholder="Search tasks…" value="${escapeHtml(search)}" />
          <select class="input input--compact" id="task-sort">
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
          <div class="btn-group btn-group--glass">
            <button type="button" class="btn btn--glass ${view === 'list' ? 'is-active' : ''}" data-view="list">List</button>
            <button type="button" class="btn btn--glass ${view === 'kanban' ? 'is-active' : ''}" data-view="kanban">Board</button>
          </div>
          <button type="button" class="btn btn--ghost btn--sm" id="task-filters-toggle">${showAdvanced ? 'Hide filters' : 'More filters'}</button>
          <button type="button" class="btn btn--primary" id="task-new">+ Task</button>
        </div>
        <div class="tasks-toolbar__advanced${showAdvanced ? '' : ' is-hidden'}" id="task-advanced">
          <select class="input" id="task-project"><option value="all">All projects</option>${projects.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select>
          <select class="input" id="task-status"><option value="all">All statuses</option>${TASK_STATUSES.map((s) => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
          <select class="input" id="task-priority"><option value="all">All priorities</option>${TASK_PRIORITIES.map((p) => `<option value="${p.value}">${p.label}</option>`).join('')}</select>
          <input class="input" id="task-tag" placeholder="Tag" value="${escapeHtml(tagFilter)}" />
        </div>
      </div>
      <div id="task-body"></div>
    `;

    container.querySelector('#task-project').value = projectFilter;
    container.querySelector('#task-status').value = statusFilter;
    container.querySelector('#task-priority').value = priorityFilter;
    container.querySelector('#task-sort').value = sortBy;

    container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        preset = btn.dataset.preset;
        render();
      });
    });
    container.querySelector('#task-search').addEventListener('input', (e) => {
      search = e.target.value;
      render();
    });
    container.querySelector('#task-project').addEventListener('change', (e) => {
      projectFilter = e.target.value;
      render();
    });
    container.querySelector('#task-status').addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });
    container.querySelector('#task-priority').addEventListener('change', (e) => {
      priorityFilter = e.target.value;
      render();
    });
    container.querySelector('#task-tag').addEventListener('input', (e) => {
      tagFilter = e.target.value.trim();
      render();
    });
    container.querySelector('#task-sort').addEventListener('change', (e) => {
      sortBy = e.target.value;
      render();
    });
    container.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        view = btn.dataset.view;
        render();
      });
    });
    container.querySelector('#task-new').addEventListener('click', () => ctx.openNewTask());
    container.querySelector('#task-filters-toggle').addEventListener('click', () => {
      showAdvanced = !showAdvanced;
      render();
    });

    const body = container.querySelector('#task-body');
    if (!tasks.length) {
      body.innerHTML = '<p class="empty-state">No tasks match your filters.</p>';
      return;
    }

    if (view === 'list') {
      body.className = 'task-list card';
      body.innerHTML = '';
      for (const task of tasks) {
        const proj = task.projectId ? data.projects[task.projectId] : null;
        const wrap = document.createElement('div');
        wrap.innerHTML = taskRowHtml(task, proj?.name, settings);
        bindTaskRow(wrap.firstElementChild, { onOpen: openTask, onComplete: completeTask });
        body.appendChild(wrap.firstElementChild);
      }
    } else {
      body.className = 'kanban';
      for (const col of TASK_STATUSES) {
        const column = document.createElement('div');
        column.className = 'kanban__col';
        column.dataset.status = col.value;
        column.innerHTML = `<h4 class="kanban__title">${col.label}</h4><div class="kanban__drop" data-status="${col.value}"></div>`;
        const drop = column.querySelector('.kanban__drop');
        drop.addEventListener('dragover', (e) => {
          e.preventDefault();
          drop.classList.add('kanban__drop--over');
        });
        drop.addEventListener('dragleave', () => drop.classList.remove('kanban__drop--over'));
        drop.addEventListener('drop', async (e) => {
          e.preventDefault();
          drop.classList.remove('kanban__drop--over');
          const id = e.dataTransfer.getData('text/task-id');
          if (id) await updateTaskRecord(id, { status: col.value });
        });
        const colTasks = tasks.filter((t) => t.status === col.value);
        for (const task of colTasks) {
          const card = document.createElement('article');
          card.className = 'kanban-card';
          card.draggable = true;
          card.dataset.taskId = task.id;
          const proj = task.projectId ? data.projects[task.projectId] : null;
          card.innerHTML = `<strong>${escapeHtml(task.title)}</strong><p class="muted">${escapeHtml(proj?.name || 'Unassigned')}</p>
            <label class="kanban-card__status field field--inline"><span class="sr-only">Status</span>
            <select class="input input--sm" data-status-select>
              ${TASK_STATUSES.map((s) => `<option value="${s.value}" ${task.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select></label>`;
          card.addEventListener('dragstart', (ev) => ev.dataTransfer.setData('text/task-id', task.id));
          card.addEventListener('click', (ev) => {
            if (ev.target.matches('select')) return;
            openTask(task.id);
          });
          card.querySelector('[data-status-select]').addEventListener('change', async (ev) => {
            await updateTaskRecord(task.id, { status: ev.target.value });
          });
          drop.appendChild(card);
        }
        body.appendChild(column);
      }
    }
  }

  render();
}
