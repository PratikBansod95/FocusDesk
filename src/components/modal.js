let stack = [];

export function openModal({ title, content, footer, onClose, size = 'md', dirtyCheck }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = `modal modal--${size}`;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'modal-title');

  const header = document.createElement('div');
  header.className = 'modal__header';
  const h = document.createElement('h2');
  h.id = 'modal-title';
  h.className = 'modal__title';
  h.textContent = title;
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn btn--ghost btn--icon';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';
  header.append(h, closeBtn);

  const body = document.createElement('div');
  body.className = 'modal__body';
  if (typeof content === 'string') body.innerHTML = content;
  else if (content) body.appendChild(content);

  const foot = document.createElement('div');
  foot.className = 'modal__footer';
  if (footer) {
    if (typeof footer === 'function') footer(foot, { close: tryClose });
    else foot.appendChild(footer);
  }

  dialog.append(header, body, foot);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  const previousFocus = document.activeElement;

  function tryClose() {
    if (dirtyCheck?.()) {
      if (!confirm('You have unsaved changes. Close anyway?')) return;
    }
    close();
  }

  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    stack = stack.filter((x) => x !== close);
    previousFocus?.focus?.();
    onClose?.();
  }

  function onKey(e) {
    if (e.key === 'Escape') tryClose();
  }

  closeBtn.addEventListener('click', tryClose);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) tryClose();
  });
  document.addEventListener('keydown', onKey);
  stack.push(close);

  const focusable = dialog.querySelector('input, textarea, select, button, [href]');
  (focusable || closeBtn).focus();

  return { close, body, dialog, backdrop };
}

export function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<p class="modal__message">${message}</p>`;
    openModal({
      title,
      content: wrap,
      footer: (foot, { close }) => {
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'btn btn--secondary';
        cancel.textContent = 'Cancel';
        const ok = document.createElement('button');
        ok.type = 'button';
        ok.className = danger ? 'btn btn--danger' : 'btn btn--primary';
        ok.textContent = confirmLabel;
        cancel.addEventListener('click', () => {
          close();
          resolve(false);
        });
        ok.addEventListener('click', () => {
          close();
          resolve(true);
        });
        foot.append(cancel, ok);
      },
    });
  });
}
