import { todayISO, isDueToday, isOverdue } from '../utils/dates.js';
import { taskRowHtml, bindTaskRow } from '../components/task-item.js';
import { sortTasks } from '../models/task.js';
import { escapeHtml } from '../components/task-item.js';

export function renderMyDay(container, ctx) {
  const { data, settings, saveDailyPlan, toggleMyDayTask, openTask, completeTask } = ctx;
  const date = todayISO();
  const plan = data.dailyPlans[date] || { taskIds: [], focus: '', notes: '' };

  const dueToday = sortTasks(
    Object.values(data.tasks).filter((t) => t.status !== 'completed' && isDueToday(t.dueDate, t.status)),
    'dueDate'
  );
  const overdue = sortTasks(
    Object.values(data.tasks).filter((t) => t.status !== 'completed' && isOverdue(t.dueDate, t.status)),
    'dueDate'
  );
  const manual = (plan.taskIds || []).map((id) => data.tasks[id]).filter((t) => t && t.status !== 'completed');

  const seen = new Set();
  const combined = [];
  for (const t of [...overdue, ...dueToday, ...manual]) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      combined.push(t);
    }
  }

  const addable = sortTasks(
    Object.values(data.tasks).filter((t) => t.status !== 'completed' && !seen.has(t.id)),
    'title'
  );

  container.innerHTML = `
    <p class="muted page-intro">Planning for <strong>${date}</strong>. My Day resets by date; tasks are not auto-completed.</p>
    <div class="my-day-grid">
      <section class="card">
        <header class="card__header"><h3>Today's tasks</h3></header>
        <div id="myday-list" class="task-list"></div>
      </section>
      <section class="card">
        <header class="card__header"><h3>Daily focus</h3></header>
        <textarea class="input" id="myday-focus" rows="3" placeholder="What is your main focus today?">${escapeHtml(plan.focus || '')}</textarea>
        <header class="card__header"><h3>Daily notes</h3></header>
        <textarea class="input" id="myday-notes" rows="6" placeholder="Notes for today…">${escapeHtml(plan.notes || '')}</textarea>
        <button type="button" class="btn btn--primary" id="myday-save">Save day notes</button>
      </section>
      <section class="card card--wide">
        <header class="card__header"><h3>Add to My Day</h3></header>
        <select class="input" id="myday-pick"><option value="">Select a task…</option>${addable.map((t) => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('')}</select>
        <button type="button" class="btn btn--secondary" id="myday-add">Add selected</button>
      </section>
    </div>
  `;

  const list = container.querySelector('#myday-list');
  if (!combined.length) {
    list.innerHTML = '<p class="empty-state">Nothing scheduled for today yet. Add tasks or set due dates.</p>';
  } else {
    for (const task of combined) {
      const proj = task.projectId ? data.projects[task.projectId] : null;
      const wrap = document.createElement('div');
      wrap.innerHTML = taskRowHtml(task, proj?.name, settings);
      bindTaskRow(wrap.firstElementChild, { onOpen: openTask, onComplete: completeTask });
      list.appendChild(wrap.firstElementChild);
    }
  }

  container.querySelector('#myday-save').addEventListener('click', async () => {
    await saveDailyPlan(date, {
      taskIds: plan.taskIds,
      focus: container.querySelector('#myday-focus').value,
      notes: container.querySelector('#myday-notes').value,
    });
    ctx.toast?.('Day plan saved.');
  });

  container.querySelector('#myday-add').addEventListener('click', async () => {
    const id = container.querySelector('#myday-pick').value;
    if (!id) return;
    await toggleMyDayTask(date, id);
    ctx.refresh?.();
  });
}
