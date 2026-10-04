export function renderViewTabs(container, { active, onChange }) {
  container.innerHTML = '';
  container.className = 'view-tabs view-tabs--primary';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Main views');

  for (const tab of [
    { id: 'tasks', label: 'Tasks' },
    { id: 'projects', label: 'Projects' },
  ]) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `view-tabs__btn${active === tab.id ? ' view-tabs__btn--active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', active === tab.id ? 'true' : 'false');
    btn.setAttribute('data-tab', tab.id);
    btn.textContent = tab.label;
    btn.addEventListener('click', () => onChange(tab.id));
    container.appendChild(btn);
  }
}
