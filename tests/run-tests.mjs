import assert from 'node:assert/strict';
import { isOverdue, isDueToday, todayISO, compareDateOnly } from '../src/utils/dates.js';
import { validateImportedData } from '../src/utils/validation.js';
import { projectProgress } from '../src/models/project.js';
import { taskMatchesFilter, sortTasks, createTask } from '../src/models/task.js';
import { computeDashboardStats } from '../src/utils/stats.js';
import { createEmptyData } from '../src/storage/defaults.js';
import { normalizeUiStyle } from '../src/utils/ui-style.js';

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}`);
    throw e;
  }
}

test('isOverdue ignores completed tasks', () => {
  const past = '2000-01-01';
  assert.equal(isOverdue(past, 'completed'), false);
  assert.equal(isOverdue(past, 'todo'), true);
});

test('isDueToday matches calendar date', () => {
  const t = todayISO();
  assert.equal(isDueToday(t, 'todo'), true);
  assert.equal(isDueToday('2099-12-31', 'todo'), false);
});

test('compareDateOnly sorts nulls last', () => {
  assert.equal(compareDateOnly(null, '2020-01-01'), 1);
  assert.equal(compareDateOnly('2020-01-01', '2020-02-01'), -1);
});

test('projectProgress calculates percent', () => {
  const p = 'p1';
  const tasks = {
    a: createTask({ projectId: p, status: 'completed' }),
    b: createTask({ projectId: p, status: 'todo' }),
  };
  const prog = projectProgress(p, tasks);
  assert.equal(prog.total, 2);
  assert.equal(prog.completed, 1);
  assert.equal(prog.percent, 50);
});

test('task filter overdue', () => {
  const task = createTask({ dueDate: '2000-01-01', status: 'todo' });
  assert.equal(taskMatchesFilter(task, { overdue: true }), true);
});

test('sortTasks by priority', () => {
  const low = createTask({ priority: 'low', title: 'a' });
  const urgent = createTask({ priority: 'urgent', title: 'b' });
  const sorted = sortTasks([low, urgent], 'priority');
  assert.equal(sorted[0].id, urgent.id);
});

test('validateImportedData accepts empty structure', () => {
  const data = createEmptyData();
  const r = validateImportedData(data);
  assert.equal(r.ok, true);
});

test('validateImportedData rejects invalid JSON shape', () => {
  assert.equal(validateImportedData(null).ok, false);
});

test('normalizeUiStyle', () => {
  assert.equal(normalizeUiStyle('retro'), 'retro');
  assert.equal(normalizeUiStyle('minimal'), 'minimal');
  assert.equal(normalizeUiStyle('unknown'), 'liquid-glass');
});

test('dashboard stats from data', () => {
  const data = createEmptyData();
  data.projects.p1 = { id: 'p1', name: 'X', status: 'active' };
  data.tasks.t1 = createTask({ status: 'completed', dueDate: todayISO() });
  const stats = computeDashboardStats(data);
  assert.equal(stats.completed, 1);
  assert.equal(stats.activeProjects, 1);
});

console.log('\nAll tests passed.');
