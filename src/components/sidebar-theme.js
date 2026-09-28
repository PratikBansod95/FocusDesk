import { normalizeUiStyle } from '../utils/ui-style.js';

export function buildSidebarThemePanel(settings, { onSave, onApplied }) {
  const panel = document.createElement('div');
  panel.className = 'sidebar-theme';
  panel.setAttribute('aria-label', 'Theme');

  panel.innerHTML = `
    <p class="sidebar-theme__title">Theme</p>
    <label class="sidebar-theme__field">
      <span class="sidebar-theme__label">Style</span>
      <select class="input input--sm" data-setting="uiStyle">
        <option value="liquid-glass">Liquid Glass</option>
        <option value="minimal">Minimal</option>
        <option value="retro">Retro</option>
      </select>
    </label>
    <label class="sidebar-theme__field">
      <span class="sidebar-theme__label">Colors</span>
      <select class="input input--sm" data-setting="theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  `;

  const uiSelect = panel.querySelector('[data-setting="uiStyle"]');
  const colorSelect = panel.querySelector('[data-setting="theme"]');
  uiSelect.value = normalizeUiStyle(settings.uiStyle);
  colorSelect.value = settings.theme || 'light';

  async function persist(patch) {
    await onSave(patch);
    onApplied?.();
  }

  uiSelect.addEventListener('change', async () => {
    await persist({ uiStyle: normalizeUiStyle(uiSelect.value) });
  });

  colorSelect.addEventListener('change', async () => {
    await persist({ theme: colorSelect.value });
  });

  return panel;
}
