import assert from 'node:assert/strict';
import { parseTimeInput, formatMinutes, projectProgress, sumRemainingMinutesDueOn } from '../src/utils/time.js';
import { isProjectOutlineDueTask, taskVisibleOnMyPad, todayISO } from '../src/utils/dates.js';
import { createTask } from '../src/models/task.js';
import { applyTaskFilter } from '../src/models/task.js';
import { myPadTaskIds } from '../src/components/notepad-list.js';

function test(name, fn) {
  fn();
  console.log(`✓ ${name}`);
}

test('parseTimeInput', () => {
  assert.equal(parseTimeInput('30m'), 30);
  assert.equal(parseTimeInput('1h'), 60);
  assert.equal(parseTimeInput('1h 30m'), 90);
});

test('formatMinutes', () => {
  assert.equal(formatMinutes(90), '1h 30m');
});

test('sumRemainingMinutesDueOn', () => {
  const today = todayISO();
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const tasks = {
    a: createTask({ dueDate: today, estimatedMinutes: 30, completed: false }),
    b: createTask({ dueDate: tomorrow, estimatedMinutes: 400, completed: false }),
    c: createTask({ dueDate: today, estimatedMinutes: 15, completed: true }),
    d: createTask({ dueDate: null, estimatedMinutes: 60, completed: false }),
  };
  assert.equal(sumRemainingMinutesDueOn(tasks, today), 30);
});

test('projectProgress', () => {
  const pid = 'p1';
  const tasks = {
    a: createTask({ projectId: pid, completed: true }),
    b: createTask({ projectId: pid, completed: false, estimatedMinutes: 30 }),
  };
  const p = projectProgress(tasks, pid);
  assert.equal(p.completed, 1);
  assert.equal(p.total, 2);
  assert.equal(p.percent, 50);
});

test('applyTaskFilter unassigned', () => {
  assert.equal(applyTaskFilter(createTask({ projectId: null }), 'unassigned'), true);
  assert.equal(applyTaskFilter(createTask({ projectId: 'x' }), 'unassigned'), false);
});

test('myPadTaskIds excludes assigned project tasks', () => {
  const data = {
    tasks: {
      a: createTask({ id: 'a', projectId: null, order: 1 }),
      b: createTask({ id: 'b', projectId: 'p1', order: 2 }),
    },
  };
  assert.deepEqual(myPadTaskIds(data), ['a']);
});

test('isProjectOutlineDueTask', () => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  assert.equal(isProjectOutlineDueTask(createTask({ dueDate: today })), true);
  assert.equal(isProjectOutlineDueTask(createTask({ dueDate: tomorrow })), false);
  assert.equal(isProjectOutlineDueTask(createTask({ dueDate: null })), false);
  assert.equal(
    isProjectOutlineDueTask(createTask({ dueDate: yesterday, completed: false })),
    true
  );
  assert.equal(
    isProjectOutlineDueTask(createTask({ dueDate: yesterday, completed: true })),
    false
  );
});

test('taskVisibleOnMyPad by date', () => {
  const today = todayISO();
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const open = createTask({ projectId: null, completed: false });
  const doneToday = createTask({
    projectId: null,
    completed: true,
    completedAt: `${today}T15:00:00.000Z`,
  });
  const doneYesterday = createTask({
    projectId: null,
    completed: true,
    completedAt: `${yesterday}T15:00:00.000Z`,
  });
  assert.equal(taskVisibleOnMyPad(open, today), true);
  assert.equal(taskVisibleOnMyPad(doneToday, today), true);
  assert.equal(taskVisibleOnMyPad(doneYesterday, today), false);
  assert.equal(taskVisibleOnMyPad(doneYesterday, yesterday), true);
  assert.equal(taskVisibleOnMyPad(createTask({ projectId: 'p1', completed: false }), today), false);
});

console.log('\nAll tests passed.');
