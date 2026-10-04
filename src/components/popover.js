let activePopover = null;

export function closeOpenPopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
}

export function openPopover(anchor, contentEl, { placement = 'bottom-end' } = {}) {
  closeOpenPopover();
  const pop = document.createElement('div');
  pop.className = `focus-popover focus-popover--${placement}`;
  pop.setAttribute('role', 'dialog');
  pop.appendChild(contentEl);
  document.body.appendChild(pop);

  const rect = anchor.getBoundingClientRect();
  const margin = 6;
  pop.style.position = 'fixed';
  pop.style.zIndex = '10000';

  requestAnimationFrame(() => {
    const pr = pop.getBoundingClientRect();
    let top = rect.bottom + margin;
    let left = rect.right - pr.width;
    if (left < 8) left = 8;
    if (top + pr.height > window.innerHeight - 8) {
      top = rect.top - pr.height - margin;
    }
    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
  });

  const onDoc = (e) => {
    if (!pop.contains(e.target) && e.target !== anchor) {
      closeOpenPopover();
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    }
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      closeOpenPopover();
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      anchor.focus();
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
  }, 0);

  activePopover = pop;
  return pop;
}
