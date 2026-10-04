import { openPopover, closeOpenPopover } from './popover.js';
import { formatMinutes, parseTimeInput, timePresets } from '../utils/time.js';

export function openTimePicker(anchor, { minutes, onSelect }) {
  const panel = document.createElement('div');
  panel.className = 'time-picker';

  const grid = document.createElement('div');
  grid.className = 'time-picker__grid';
  for (const p of timePresets()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-picker__opt';
    btn.textContent = p.label;
    btn.addEventListener('click', () => {
      onSelect(p.minutes);
      closeOpenPopover();
    });
    grid.appendChild(btn);
  }
  panel.appendChild(grid);

  const customRow = document.createElement('div');
  customRow.className = 'time-picker__custom';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input input--sm';
  input.placeholder = 'Custom (e.g. 90m, 1.5h)';
  input.setAttribute('aria-label', 'Custom time estimate');
  const apply = document.createElement('button');
  apply.type = 'button';
  apply.className = 'btn btn--ghost btn--sm';
  apply.textContent = 'Set';
  apply.addEventListener('click', () => {
    const m = parseTimeInput(input.value);
    if (m != null && m > 0) {
      onSelect(m);
      closeOpenPopover();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') apply.click();
  });
  customRow.append(input, apply);
  panel.appendChild(customRow);

  if (minutes) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'time-picker__clear';
    clear.textContent = 'Clear estimate';
    clear.addEventListener('click', () => {
      onSelect(null);
      closeOpenPopover();
    });
    panel.appendChild(clear);
  }

  openPopover(anchor, panel);
  input.focus();
}

export function timeButtonLabel(minutes) {
  if (minutes) return formatMinutes(minutes);
  return 'Time Req.';
}
