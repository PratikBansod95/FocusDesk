import { buildSidebarThemePanel } from './sidebar-theme.js';

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  day: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
  notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5M4 19h16M8 17V9M12 17V7M16 17v-5"/></svg>',
};

const MAIN_NAV = [
  { route: 'dashboard', label: 'Home', icon: 'home' },
  { route: 'tasks', label: 'Tasks', icon: 'tasks' },
  { route: 'projects', label: 'Projects', icon: 'projects' },
  { route: 'my-day', label: 'My Day', icon: 'day' },
];

const MORE_NAV = [
  { route: 'calendar', label: 'Calendar', icon: 'calendar' },
  { route: 'notes', label: 'Notes', icon: 'notes' },
  { route: 'reports', label: 'Reports', icon: 'reports' },
  { route: 'settings', label: 'Settings', icon: 'settings' },
];

function navLink(item, activeRoute, onNavigate) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `sidebar__link${activeRoute === item.route ? ' sidebar__link--active' : ''}`;
  btn.innerHTML = `<span class="sidebar__icon" aria-hidden="true">${ICONS[item.icon] || ICONS.notes}</span><span class="sidebar__label">${item.label}</span>`;
  btn.addEventListener('click', () => onNavigate(item.route));
  return btn;
}

export function renderSidebar(container, { activeRoute, collapsed, onNavigate, onToggle, settings, onThemeSave, onThemeApplied }) {
  container.innerHTML = '';
  container.className = `sidebar${collapsed ? ' sidebar--collapsed' : ''}`;

  const brand = document.createElement('div');
  brand.className = 'sidebar__brand';
  brand.innerHTML = `<span class="sidebar__logo" aria-hidden="true">FD</span><span class="sidebar__name">FocusDesk</span>`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'sidebar__toggle btn btn--ghost btn--icon';
  toggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  toggle.textContent = collapsed ? '»' : '«';
  toggle.addEventListener('click', onToggle);

  const nav = document.createElement('nav');
  nav.className = 'sidebar__nav';
  nav.setAttribute('aria-label', 'Main');

  for (const item of MAIN_NAV) {
    nav.appendChild(navLink(item, activeRoute, onNavigate));
  }

  const moreLabel = document.createElement('p');
  moreLabel.className = 'sidebar__section';
  moreLabel.textContent = 'More';
  nav.appendChild(moreLabel);

  for (const item of MORE_NAV) {
    nav.appendChild(navLink(item, activeRoute, onNavigate));
  }

  const themePanel = buildSidebarThemePanel(settings, {
    onSave: onThemeSave,
    onApplied: onThemeApplied,
  });

  container.append(brand, toggle, nav, themePanel);
}
