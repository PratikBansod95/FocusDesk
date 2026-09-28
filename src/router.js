const listeners = new Set();

let current = { route: 'dashboard', params: {} };

export function parseHash() {
  const hash = (location.hash || '#dashboard').replace(/^#/, '');
  const parts = hash.split('/').filter(Boolean);
  const route = parts[0] || 'dashboard';
  const params = {};
  if (route === 'project' && parts[1]) {
    return { route: 'project-detail', params: { id: parts[1] } };
  }
  if (route === 'tasks' && parts[1]) {
    params.filter = parts[1];
  }
  if (route === 'calendar' && parts[1]) {
    params.date = parts[1];
  }
  return { route: normalizeRoute(route), params };
}

function normalizeRoute(route) {
  const map = {
    dashboard: 'dashboard',
    tasks: 'tasks',
    projects: 'projects',
    project: 'project-detail',
    'my-day': 'my-day',
    calendar: 'calendar',
    notes: 'notes',
    reports: 'reports',
    settings: 'settings',
  };
  return map[route] ?? 'dashboard';
}

export function navigate(route, params = {}) {
  let hash = route;
  if (route === 'project-detail' && params.id) hash = `project/${params.id}`;
  else if (route === 'tasks' && params.filter) hash = `tasks/${params.filter}`;
  else if (route === 'calendar' && params.date) hash = `calendar/${params.date}`;
  else hash = route;
  if (location.hash !== `#${hash}`) location.hash = hash;
  else emit();
}

export function getRoute() {
  return current;
}

function emit() {
  current = parseHash();
  for (const fn of listeners) fn(current);
}

export function initRouter() {
  window.addEventListener('hashchange', emit);
  emit();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
