let container;
let lastToast = { message: '', at: 0 };

export function initToast(root) {
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  root.appendChild(container);
}

export function showToast(message, type = 'info', duration = 3200) {
  if (!container) return;
  const now = Date.now();
  if (message === lastToast.message && now - lastToast.at < 2500) return;
  lastToast = { message, at: now };
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast--visible'));
  setTimeout(() => {
    el.classList.remove('toast--visible');
    setTimeout(() => el.remove(), 200);
  }, duration);
}
