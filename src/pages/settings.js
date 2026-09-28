import { PAGE_ROUTES } from '../models/constants.js';

export function renderSettings(container, ctx) {
  const { data, saveSettings, exportData, importData, resetData, loadDemo, clearDemo } = ctx;
  const s = data.settings;

  container.innerHTML = `
    <form class="card settings-form" id="settings-form">
      <h3>Profile</h3>
      <label class="field">
        <span class="field__label">Initials (avatar)</span>
        <input class="input" name="userInitials" maxlength="3" value="${s.userInitials || 'FD'}" />
      </label>
      <p class="muted field-hint">Change interface style and colors in the <strong>Theme</strong> section at the bottom of the sidebar.</p>
      <h3>Defaults</h3>
      <label class="field">
        <span class="field__label">Default landing page</span>
        <select class="input" name="defaultPage">
          ${Object.entries(PAGE_ROUTES)
            .filter(([k]) => k !== 'project-detail')
            .map(([k, v]) => `<option value="${k}">${v.title}</option>`)
            .join('')}
        </select>
      </label>
      <label class="field">
        <span class="field__label">Default task view</span>
        <select class="input" name="defaultTaskView">
          <option value="list">List</option>
          <option value="kanban">Kanban</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Week starts on</span>
        <select class="input" name="weekStartsOn">
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
        </select>
      </label>
      <label class="field">
        <span class="field__label">Date format</span>
        <select class="input" name="dateFormat">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </label>
      <button type="submit" class="btn btn--primary">Save settings</button>
    </form>
    <section class="card">
      <h3>Data</h3>
      <p class="muted">Everything stays on this device in Chrome. Export regularly for backups or to move to another browser.</p>
      <div class="btn-row">
        <button type="button" class="btn btn--secondary" id="set-export">Export JSON</button>
        <label class="btn btn--secondary file-btn">
          Import JSON
          <input type="file" id="set-import" accept="application/json" hidden />
        </label>
        <button type="button" class="btn btn--danger" id="set-reset">Reset all data</button>
      </div>
    </section>
    <section class="card">
      <h3>Demo data</h3>
      <p class="muted">Optional sample data labeled with [Demo] for exploration. Never inserted automatically.</p>
      <div class="btn-row">
        <button type="button" class="btn btn--secondary" id="set-demo-load">Load demo data</button>
        <button type="button" class="btn btn--ghost" id="set-demo-clear">Remove demo data</button>
      </div>
    </section>
  `;

  const form = container.querySelector('#settings-form');
  form.defaultPage.value = s.defaultPage;
  form.defaultTaskView.value = s.defaultTaskView;
  form.weekStartsOn.value = String(s.weekStartsOn ?? 0);
  form.dateFormat.value = s.dateFormat;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    await saveSettings({
      userInitials: (fd.get('userInitials') || 'FD').toString().trim().slice(0, 3),
      defaultPage: fd.get('defaultPage'),
      defaultTaskView: fd.get('defaultTaskView'),
      weekStartsOn: Number(fd.get('weekStartsOn')),
      dateFormat: fd.get('dateFormat'),
    });
    ctx.toast?.('Settings saved.');
  });

  container.querySelector('#set-export').addEventListener('click', () => exportData());
  container.querySelector('#set-import').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importData(text);
    e.target.value = '';
  });
  container.querySelector('#set-reset').addEventListener('click', () => resetData());
  container.querySelector('#set-demo-load').addEventListener('click', () => loadDemo());
  container.querySelector('#set-demo-clear').addEventListener('click', () => clearDemo());
}
