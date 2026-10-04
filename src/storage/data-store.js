import { createTask } from '../models/task.js';
import { createProject } from '../models/project.js';
import { storageGet, storageSet } from './storage-adapter.js';

const STORAGE_KEY = 'focusdesk_data';

const EMPTY = () => ({
  schemaVersion: 1,
  projects: {},
  tasks: {},
  settings: { dailyHourCap: 7 },
});

let cache = null;
const listeners = new Set();
let saveQueue = Promise.resolve();

function normalize(raw) {
  const base = EMPTY();
  if (!raw || typeof raw !== 'object') return base;
  return {
    schemaVersion: raw.schemaVersion ?? 1,
    projects: raw.projects && typeof raw.projects === 'object' ? raw.projects : {},
    tasks: raw.tasks && typeof raw.tasks === 'object' ? raw.tasks : {},
    settings: { ...base.settings, ...(raw.settings || {}) },
  };
}

function notify() {
  for (const fn of listeners) fn(getData());
}

function persist() {
  saveQueue = saveQueue.then(() => storageSet(STORAGE_KEY, cache));
  return saveQueue;
}

export async function initData() {
  if (cache) return cache;
  const raw = await storageGet(STORAGE_KEY);
  cache = normalize(raw);
  if (!raw) await persist();
  return cache;
}

export function getData() {
  return cache ?? EMPTY();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function mutate(mutator, { notify: shouldNotify = true } = {}) {
  const draft = structuredClone(getData());
  await mutator(draft);
  cache = draft;
  await persist();
  if (shouldNotify) notify();
  return cache;
}

export async function addTask(input = {}) {
  return addTaskRecord(createTask(input));
}

export async function addTaskRecord(task) {
  await mutate((data) => {
    data.tasks[task.id] = task;
  });
  return task;
}

export async function updateTask(id, patch, { notify = true } = {}) {
  await mutate(
    (data) => {
      const t = data.tasks[id];
      if (!t) return;
      const next = { ...t, ...patch };
      if (patch.completed === true && !t.completed) {
        next.completedAt = new Date().toISOString();
      }
      if (patch.completed === false) {
        next.completedAt = null;
      }
      if (patch.title !== undefined) next.title = patch.title;
      data.tasks[id] = next;
    },
    { notify }
  );
}

export async function deleteTask(id) {
  await mutate((data) => {
    delete data.tasks[id];
  });
}

export async function addProject(name) {
  const project = createProject({ name });
  await mutate((data) => {
    data.projects[project.id] = project;
  });
  return project;
}

export async function updateProject(id, patch) {
  await mutate((data) => {
    const p = data.projects[id];
    if (!p) return;
    data.projects[id] = {
      ...p,
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : p.name,
    };
  });
}

export async function deleteProject(id) {
  await mutate((data) => {
    delete data.projects[id];
    for (const t of Object.values(data.tasks)) {
      if (t.projectId === id) t.projectId = null;
    }
  });
}
