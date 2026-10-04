import {
  initData,
  getData,
  subscribe,
  addTaskRecord,
  updateTask,
  deleteTask,
  addProject,
  updateProject,
} from './storage/data-store.js';
import { createTask } from './models/task.js';
import { renderViewTabs } from './components/view-tabs.js';
import { renderTasksView } from './views/tasks-view.js';
import { renderProjectsView } from './views/projects-view.js';
import { sumRemainingMinutesDueOn, formatMinutes } from './utils/time.js';
import { isDevBrowserMode } from './storage/storage-adapter.js';
import { todayISO } from './utils/dates.js';

const ui = {
  tab: 'tasks',
  focus: null,
  focusProjectId: null,
  focusSelection: null,
  padViewDate: null,
};

function buildShell(root) {
  root.innerHTML = `
    <div class="app-bg" aria-hidden="true"></div>
    <div class="app-viewport">
      <div class="glass-chassis glass-chassis--focus">
        <div class="focus-app">
          <header class="focus-header">
            <span class="focus-brand">FocusDesk${isDevBrowserMode() ? ' · dev' : ''}</span>
          </header>
          <div class="focus-body">
            <div id="view-tabs-host" class="focus-tab-bar"></div>
            <div id="focus-main" class="focus-main focus-panel"></div>
          </div>
        </div>
      </div>
    </div>
    <footer class="focus-footer" aria-live="polite">
      <div class="focus-footer__pill" id="workload-footer">Remaining work —</div>
    </footer>
  `;
}

function taskHandlers() {
  return {
    onCreate: async (input, opts = {}) => {
      const task = createTask(input);
      ui.focusProjectId = input.projectId ?? null;
      if (opts.focusAfterCreate === false) {
        ui.focus = null;
        ui.focusSelection = null;
      } else {
        ui.focus = task.id;
        ui.focusSelection = opts.selection ?? null;
      }
      await addTaskRecord(task);
      return task;
    },
    onUpdate: (id, patch) => updateTask(id, patch),
    onDelete: (id) => deleteTask(id),
    onToggle: (id, completed) => updateTask(id, { completed }),
    onRequestFocus: (id) => {
      if (typeof id === 'object') {
        ui.focus = id.taskId;
        ui.focusProjectId = id.projectId ?? null;
        ui.focusSelection =
          id.selectionStart != null
            ? { start: id.selectionStart, end: id.selectionEnd ?? id.selectionStart }
            : null;
      } else {
        ui.focus = id;
        ui.focusProjectId = null;
        ui.focusSelection = null;
      }
      render();
    },
    onCreateProject: async (name) => {
      await addProject(name);
      ui.tab = 'projects';
      render();
    },
    onUpdateProject: (id, patch) => updateProject(id, patch),
    onPadViewDate: (dateISO) => {
      ui.padViewDate = dateISO;
      render();
    },
  };
}

function render() {
  const data = getData();
  const tabsHost = document.getElementById('view-tabs-host');
  const main = document.getElementById('focus-main');
  const footer = document.getElementById('workload-footer');
  if (!tabsHost || !main) return;

  if (!ui.focus) {
    const activeInput = main.querySelector('.notepad-row__input:focus');
    if (activeInput) {
      const row = activeInput.closest('.notepad-row');
      const tid = row?.dataset?.taskId;
      if (row?.classList.contains('notepad-row--draft') || tid === 'draft') {
        ui.focus = 'draft';
      } else if (tid) {
        ui.focus = tid;
      }
      ui.focusSelection = {
        start: activeInput.selectionStart,
        end: activeInput.selectionEnd,
      };
    }
  }

  renderViewTabs(tabsHost, {
    active: ui.tab,
    onChange: (tab) => {
      ui.tab = tab;
      ui.focus = null;
      ui.focusProjectId = null;
      render();
    },
  });

  const handlers = taskHandlers();
  const padViewDate = ui.padViewDate || todayISO();
  const ctx = {
    data,
    focusTaskId: ui.focus,
    padViewDate,
    handlers,
  };

  if (ui.tab === 'tasks') {
    main.className = 'focus-main focus-panel focus-panel--workspace';
    renderTasksView(main, ctx);
  } else {
    main.className = 'focus-main focus-panel focus-panel--workspace';
    renderProjectsView(main, {
      ...ctx,
      focusTaskId: ui.focus,
      focusProjectId: ui.focusProjectId,
    });
  }

  const cap = data.settings?.dailyHourCap ?? 7;
  const capMinutes = cap * 60;
  const today = todayISO();
  const remaining = sumRemainingMinutesDueOn(data.tasks, today);
  const remLabel = remaining ? formatMinutes(remaining) : '0m';
  if (footer) {
    footer.textContent = `${remLabel} / ${cap} Hours`;
    const overCap = remaining > capMinutes;
    footer.classList.toggle('focus-footer__pill--over-cap', overCap);
    footer.dataset.overCap = overCap ? 'true' : 'false';
  }

  const focus = ui.focus;
  const focusSelection = ui.focusSelection;
  ui.focus = null;
  ui.focusSelection = null;
  if (focus) {
    requestAnimationFrame(() => {
      const row =
        focus === 'draft'
          ? main.querySelector('.notepad-row--draft .notepad-row__input')
          : main.querySelector(`[data-task-id="${focus}"] .notepad-row__input`);
      if (!row) return;
      row.focus();
      if (focusSelection) {
        const len = row.value.length;
        const start = Math.min(focusSelection.start, len);
        const end = Math.min(focusSelection.end, len);
        row.setSelectionRange(start, end);
      } else if (focus !== 'draft') {
        row.setSelectionRange(row.value.length, row.value.length);
      }
    });
  }
}

async function bootstrap() {
  const root = document.getElementById('app');
  try {
    await initData();
    buildShell(root);
    subscribe(() => render());
    render();
  } catch (e) {
    root.innerHTML = `<div class="app-error"><h2>Could not load FocusDesk</h2><p>${e.message}</p></div>`;
  }
}

bootstrap();
