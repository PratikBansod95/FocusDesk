import { formatDate, greetingForHour, todayISO } from '../utils/dates.js';
import { globalSearch } from '../utils/search.js';
import { PAGE_ROUTES } from '../models/constants.js';

export function renderHeader(container, ctx) {
  const { data, pageTitle, searchQuery, onSearch, onClearSearch, onQuickAdd, onSearchSelect } = ctx;
  const settings = data.settings;
  const today = todayISO();

  container.innerHTML = '';
  container.className = 'header';

  const left = document.createElement('div');
  left.className = 'header__left';
  const title = document.createElement('h1');
  title.className = 'header__title';
  title.textContent = pageTitle;
  left.appendChild(title);

  const center = document.createElement('div');
  center.className = 'header__search-wrap';
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'input header__search';
  search.placeholder = 'Search projects, tasks, notes…';
  search.value = searchQuery || '';
  search.setAttribute('aria-label', 'Global search');
  const results = document.createElement('div');
  results.className = 'search-results';
  results.hidden = true;

  function renderResults() {
    const q = search.value.trim();
    onSearch(q);
    if (!q) {
      results.hidden = true;
      return;
    }
    const { projects, tasks, notes } = globalSearch(data, q);
    results.innerHTML = '';
    if (!projects.length && !tasks.length && !notes.length) {
      results.innerHTML = '<p class="search-results__empty">No results</p>';
    } else {
      const addSection = (label, items, type) => {
        if (!items.length) return;
        const h = document.createElement('p');
        h.className = 'search-results__heading';
        h.textContent = label;
        results.appendChild(h);
        for (const item of items.slice(0, 5)) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'search-results__item';
          btn.textContent = type === 'project' ? item.name : type === 'task' ? item.title : item.title || 'Untitled note';
          btn.addEventListener('click', () => {
            results.hidden = true;
            search.value = '';
            onClearSearch();
            onSearchSelect(type, item);
          });
          results.appendChild(btn);
        }
      };
      addSection('Projects', projects, 'project');
      addSection('Tasks', tasks, 'task');
      addSection('Notes', notes, 'note');
    }
    results.hidden = false;
  }

  search.addEventListener('input', renderResults);
  search.addEventListener('focus', renderResults);
  document.addEventListener('click', (e) => {
    if (!center.contains(e.target)) results.hidden = true;
  });

  center.append(search, results);

  const right = document.createElement('div');
  right.className = 'header__right';

  const quick = document.createElement('button');
  quick.type = 'button';
  quick.className = 'btn btn--primary';
  quick.textContent = '+ Add';
  quick.addEventListener('click', onQuickAdd);

  const avatar = document.createElement('div');
  avatar.className = 'header__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.title = formatDate(today, settings);
  avatar.textContent = settings.userInitials || 'FD';

  right.append(quick, avatar);
  container.append(left, center, right);
}

export function getWelcomeBits() {
  return {
    greeting: greetingForHour(),
    dateLabel: new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export function pageTitleForRoute(route) {
  if (route === 'project-detail') return PAGE_ROUTES['project-detail'].title;
  return PAGE_ROUTES[route]?.title ?? 'FocusDesk';
}
