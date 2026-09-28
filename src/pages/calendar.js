import { getCalendarDays, monthLabel, weekdayHeaders, todayISO, formatDate } from '../utils/dates.js';
import { escapeHtml } from '../components/task-item.js';

export function renderCalendar(container, ctx) {
  const { data, settings, routeParams, openTask, openNewTaskWithDue } = ctx;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let selected = routeParams.date || todayISO();
  const weekStartsOn = data.settings.weekStartsOn ?? 0;

  function tasksByDate() {
    const map = {};
    for (const t of Object.values(data.tasks)) {
      if (!t.dueDate) continue;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    }
    return map;
  }

  function render() {
    const { days } = getCalendarDays(year, month, weekStartsOn);
    const byDate = tasksByDate();
    const dayTasks = byDate[selected] || [];

    container.innerHTML = `
      <div class="calendar-toolbar">
        <button type="button" class="btn btn--secondary" id="cal-prev">←</button>
        <h2 class="calendar-title">${monthLabel(year, month)}</h2>
        <button type="button" class="btn btn--secondary" id="cal-next">→</button>
        <button type="button" class="btn btn--ghost" id="cal-today">Today</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-month card">
          <div class="calendar-weekdays">${weekdayHeaders(weekStartsOn).map((d) => `<span>${d}</span>`).join('')}</div>
          <div class="calendar-days" id="cal-days"></div>
        </div>
        <section class="card calendar-side">
          <header class="card__header"><h3>${formatDate(selected, settings)}</h3></header>
          <button type="button" class="btn btn--primary btn--block" id="cal-new-task">Create task on this date</button>
          <ul class="calendar-task-list" id="cal-task-list"></ul>
        </section>
      </div>
    `;

    const daysEl = container.querySelector('#cal-days');
    for (const day of days) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `calendar-day${day.inMonth ? '' : ' calendar-day--muted'}${day.isToday ? ' calendar-day--today' : ''}${selected === day.date ? ' calendar-day--selected' : ''}${byDate[day.date]?.length ? ' calendar-day--has-tasks' : ''}`;
      btn.textContent = day.date.slice(8);
      btn.dataset.date = day.date;
      btn.setAttribute('aria-label', `${day.date}, ${byDate[day.date]?.length || 0} tasks`);
      btn.addEventListener('click', () => {
        selected = day.date;
        ctx.setCalendarDate?.(selected);
        render();
      });
      daysEl.appendChild(btn);
    }

    const list = container.querySelector('#cal-task-list');
    if (!dayTasks.length) {
      list.innerHTML = '<li class="empty-state">No tasks due on this date.</li>';
    } else {
      for (const t of dayTasks) {
        const li = document.createElement('li');
        li.innerHTML = `<button type="button" class="link-btn">${escapeHtml(t.title)}</button>`;
        li.querySelector('button').addEventListener('click', () => openTask(t.id));
        list.appendChild(li);
      }
    }

    container.querySelector('#cal-prev').addEventListener('click', () => {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      render();
    });
    container.querySelector('#cal-next').addEventListener('click', () => {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      render();
    });
    container.querySelector('#cal-today').addEventListener('click', () => {
      const t = todayISO();
      selected = t;
      const [y, m] = t.split('-').map(Number);
      year = y;
      month = m - 1;
      render();
    });
    container.querySelector('#cal-new-task').addEventListener('click', () => openNewTaskWithDue(selected));
  }

  render();
}
