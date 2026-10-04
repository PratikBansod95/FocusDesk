import { openPopover, closeOpenPopover } from './popover.js';
import { todayISO, formatDueLabel } from '../utils/dates.js';

const CALENDAR_ICON =
  '<svg class="my-pad-date-btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

export function mountMyPadDateControl(container, { viewDate, onChange }) {
  container.innerHTML = '';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'my-pad-date-btn';
  btn.setAttribute('aria-label', 'Jump to date');
  btn.innerHTML = CALENDAR_ICON;

  btn.addEventListener('click', () => {
    const panel = document.createElement('div');
    panel.className = 'meta-picker';

    const title = document.createElement('p');
    title.className = 'meta-picker__title';
    title.textContent = 'View date';
    panel.appendChild(title);

    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'input input--sm';
    input.value = viewDate;
    input.addEventListener('change', () => {
      if (input.value) onChange(input.value);
      closeOpenPopover();
    });
    panel.appendChild(input);

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'meta-picker__item';
    todayBtn.textContent = 'Back to today';
    todayBtn.addEventListener('click', () => {
      onChange(todayISO());
      closeOpenPopover();
    });
    panel.appendChild(todayBtn);

    openPopover(btn, panel);
  });

  container.appendChild(btn);

  if (viewDate !== todayISO()) {
    const label = document.createElement('span');
    label.className = 'my-pad-date-label';
    label.textContent = formatDueLabel(viewDate, 'picker');
    container.appendChild(label);
  }
}
