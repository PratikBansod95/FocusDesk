import { initStore, subscribe, runAction, notify, storage } from './state/store.js';
import { initRouter, subscribe as routeSubscribe, navigate, getRoute } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader, pageTitleForRoute } from './components/header.js';
import { initToast, showToast } from './components/toast.js';
import { openQuickAdd } from './components/quick-add.js';
import { openTaskModal } from './components/task-modal.js';
import { confirmDialog } from './components/modal.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProjects } from './pages/projects.js';
import { renderProjectDetail } from './pages/project-detail.js';
import { renderTasks } from './pages/tasks.js';
import { renderMyDay } from './pages/my-day.js';
import { renderCalendar } from './pages/calendar.js';
import { renderNotes } from './pages/notes.js';
import { renderReports } from './pages/reports.js';
import { renderSettings } from './pages/settings.js';
import { createTask } from './models/task.js';
import { normalizeUiStyle } from './utils/ui-style.js';

let searchQuery = '';
let shellReady = false;

function applyTheme(settings) {
  const theme = settings?.theme || 'system';
  let resolved = theme;
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = resolved;
}

function applyAppearance(settings) {
  document.documentElement.dataset.uiStyle = normalizeUiStyle(settings?.uiStyle);
  applyTheme(settings);
}

function buildShell(root) {
  root.innerHTML = `
    <div class="app-bg" aria-hidden="true">
      <span class="orb orb--violet"></span>
      <span class="orb orb--cyan"></span>
      <span class="orb orb--peach"></span>
      <span class="orb orb--pink"></span>
    </div>
    <div class="app-viewport">
      <div class="glass-chassis">
        <div class="app-shell">
          <aside id="sidebar-root" class="sidebar-host"></aside>
          <div class="app-main">
            <header id="header-root"></header>
            <main id="page-root" class="page" tabindex="-1"></main>
          </div>
        </div>
      </div>
    </div>
  `;
  initToast(root);
  shellReady = true;
}

function pageCtx(data) {
  return {
    data,
    settings: data.settings,
    navigate,
    toast: (msg, type) => showToast(msg, type),
    refresh: () => renderPage(),
    applyTheme: () => applyAppearance(getStateData().settings),
    applyAppearance: () => applyAppearance(getStateData().settings),
    routeParams: getRoute().params,
    setCalendarDate: (date) => navigate('calendar', { date }),

    openTask: (id) => {
      const task = data.tasks[id];
      if (!task) return;
      openTaskModal({
        task,
        projects: data.projects,
        onSave: (values) => runAction(() => storage.updateTaskRecord(id, values)),
        onDelete: () => runAction(() => storage.deleteTaskRecord(id)),
      });
    },

    openNewTask: (defaults = {}) => {
      openTaskModal({
        isNew: true,
        task: createTask(defaults),
        projects: data.projects,
        onSave: (values) => runAction(() => storage.createTaskRecord(values)),
      });
    },

    openNewTaskForProject: (projectId) => pageCtx(data).openNewTask({ projectId }),
    openNewTaskWithDue: (dueDate) => pageCtx(data).openNewTask({ dueDate }),

    completeTask: (id) =>
      runAction(async () => {
        const t = data.tasks[id];
        await storage.completeTask(id, t?.status !== 'completed');
        showToast(t?.status === 'completed' ? 'Task reopened' : 'Task completed', 'success');
      }),

    createProjectRecord: (v) => runAction(() => storage.createProjectRecord(v)),
    updateProjectRecord: (id, v) => runAction(() => storage.updateProjectRecord(id, v)),
    deleteProjectRecord: (id, opts) => runAction(() => storage.deleteProjectRecord(id, opts)),
    updateTaskRecord: (id, v) => runAction(() => storage.updateTaskRecord(id, v)),
    createNoteRecord: (v) => runAction(() => storage.createNoteRecord(v)),
    updateNoteRecord: (id, v) => runAction(() => storage.updateNoteRecord(id, v)),
    deleteNoteRecord: (id) => runAction(() => storage.deleteNoteRecord(id)),
    saveDailyPlan: (date, plan) => runAction(() => storage.saveDailyPlan(date, plan)),
    toggleMyDayTask: (date, taskId) => runAction(() => storage.toggleMyDayTask(date, taskId)),

    saveSettings: (partial) => runAction(() => storage.saveSettings(partial)),

    exportData: async () => {
      try {
        const json = await storage.exportDataJson();
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `focusdesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast('Export started.', 'success');
      } catch (e) {
        showToast(e.message || 'Export failed.', 'error');
      }
    },

    importData: async (text) => {
      const ok = await confirmDialog({
        title: 'Import backup',
        message: 'This will replace all current FocusDesk data. Continue?',
        confirmLabel: 'Import',
        danger: true,
      });
      if (!ok) return;
      const result = await storage.importDataJson(text);
      if (result.ok) {
        notify();
        showToast('Import successful.', 'success');
      } else {
        showToast(result.error || 'Import failed.', 'error');
      }
    },

    resetData: async () => {
      const ok = await confirmDialog({
        title: 'Reset FocusDesk',
        message: 'This deletes all projects, tasks, notes, planner data, activity, and settings on this device. This cannot be undone.',
        confirmLabel: 'Reset everything',
        danger: true,
      });
      if (!ok) return;
      await runAction(() => storage.resetAllData());
      showToast('Data reset.', 'success');
      navigate('dashboard');
    },

    loadDemo: async () => {
      await runAction(() => storage.loadDemoData());
      showToast('Demo data loaded (labeled [Demo]).', 'success');
    },

    clearDemo: async () => {
      await runAction(() => storage.clearDemoData());
      showToast('Demo data removed.', 'success');
    },
  };
}

function getStateData() {
  return storage.getDataSync();
}

function notifyAndRender() {
  renderPage();
}

function renderPage() {
  if (!shellReady) return;
  const data = getStateData();
  const route = getRoute();
  applyAppearance(data.settings);

  const sidebarEl = document.getElementById('sidebar-root');
  const headerEl = document.getElementById('header-root');
  const pageEl = document.getElementById('page-root');

  renderSidebar(sidebarEl, {
    activeRoute: route.route,
    collapsed: data.settings.sidebarCollapsed,
    settings: data.settings,
    onNavigate: (r) => navigate(r),
    onToggle: async () => {
      await runAction(() => storage.saveSettings({ sidebarCollapsed: !data.settings.sidebarCollapsed }));
    },
    onThemeSave: (patch) => runAction(() => storage.saveSettings(patch)),
    onThemeApplied: () => {
      applyAppearance(getStateData().settings);
      showToast('Theme updated', 'success');
    },
  });

  renderHeader(headerEl, {
    data,
    pageTitle: pageTitleForRoute(route.route),
    searchQuery,
    onSearch: (q) => {
      searchQuery = q;
    },
    onClearSearch: () => {
      searchQuery = '';
    },
    onQuickAdd: () => {
      const ctx = pageCtx(data);
      openQuickAdd({
        data,
        onCreateTask: (v) => runAction(() => storage.createTaskRecord(v)),
        onCreateProject: (v) => runAction(() => storage.createProjectRecord(v)),
        onCreateNote: (v) => runAction(() => storage.createNoteRecord(v)),
      });
    },
    onSearchSelect: (type, item) => {
      if (type === 'project') navigate('project-detail', { id: item.id });
      else if (type === 'task') pageCtx(data).openTask(item.id);
      else navigate('notes');
    },
  });

  const ctx = pageCtx(data);
  pageEl.innerHTML = '';

  switch (route.route) {
    case 'dashboard':
      renderDashboard(pageEl, ctx);
      break;
    case 'tasks':
      renderTasks(pageEl, ctx);
      break;
    case 'projects':
      renderProjects(pageEl, ctx);
      break;
    case 'project-detail':
      renderProjectDetail(pageEl, ctx, route.params.id);
      break;
    case 'my-day':
      renderMyDay(pageEl, ctx);
      break;
    case 'calendar':
      renderCalendar(pageEl, ctx);
      break;
    case 'notes':
      renderNotes(pageEl, ctx);
      break;
    case 'reports':
      renderReports(pageEl, ctx);
      break;
    case 'settings':
      renderSettings(pageEl, ctx);
      break;
    default:
      renderDashboard(pageEl, ctx);
  }
}

async function bootstrap() {
  const root = document.getElementById('app');
  try {
    await initStore();
    const data = getStateData();
    buildShell(root);
    initRouter();

    if (!location.hash) {
      const landing = data.settings.defaultPage || 'dashboard';
      navigate(landing);
    }

    subscribe(() => renderPage());
    routeSubscribe(() => renderPage());
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const latest = getStateData();
      if (latest.settings.theme === 'system') applyAppearance(latest.settings);
    });
    renderPage();
  } catch (e) {
    root.innerHTML = `<div class="app-error"><h2>Could not load FocusDesk</h2><p>${e.message}</p></div>`;
  }
}

bootstrap();
