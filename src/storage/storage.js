import { createEmptyData, createDefaultSettings } from './defaults.js';
import { createProject } from '../models/project.js';
import { createTask, applyStatusChange } from '../models/task.js';
import { createNote } from '../models/note.js';
import { generateId } from '../utils/ids.js';
import { ACTIVITY_LIMIT } from '../models/constants.js';
import { validateImportedData } from '../utils/validation.js';
import { buildDemoData, removeDemoData } from './demo-data.js';
import { todayISO } from '../utils/dates.js';

const STORAGE_KEY = 'focusdesk_data';

let memoryCache = null;
let saveQueue = Promise.resolve();

function normalizeData(raw) {
  const base = createEmptyData();
  if (!raw || typeof raw !== 'object') return base;
  return {
    schemaVersion: raw.schemaVersion ?? base.schemaVersion,
    projects: raw.projects && typeof raw.projects === 'object' ? raw.projects : {},
    tasks: raw.tasks && typeof raw.tasks === 'object' ? raw.tasks : {},
    notes:
      raw.notes && typeof raw.notes === 'object' && !Array.isArray(raw.notes)
        ? raw.notes
        : Array.isArray(raw.notes)
          ? Object.fromEntries(raw.notes.map((n) => [n.id, n]))
          : {},
    dailyPlans: raw.dailyPlans && typeof raw.dailyPlans === 'object' ? raw.dailyPlans : {},
    activity: Array.isArray(raw.activity) ? raw.activity.slice(0, ACTIVITY_LIMIT) : [],
    settings: (() => {
      const { googleSync: _removed, ...rest } = raw.settings || {};
      return { ...createDefaultSettings(), ...rest };
    })(),
    meta: { hasSeenWelcome: false, demoLoaded: false, ...(raw.meta || {}) },
  };
}

function chromeGet() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result[STORAGE_KEY]);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function chromeSet(data) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function persist(data) {
  memoryCache = data;
  saveQueue = saveQueue.then(() => chromeSet(data));
  await saveQueue;
  return data;
}

function pushActivity(data, event) {
  const entry = {
    id: generateId('act'),
    createdAt: new Date().toISOString(),
    ...event,
  };
  data.activity = [entry, ...(data.activity || [])].slice(0, ACTIVITY_LIMIT);
}

export async function loadAllData() {
  if (memoryCache) return memoryCache;
  try {
    const raw = await chromeGet();
    memoryCache = normalizeData(raw);
    if (!raw) {
      await persist(memoryCache);
    }
  } catch {
    memoryCache = createEmptyData();
  }
  return memoryCache;
}

export function getDataSync() {
  return memoryCache ?? createEmptyData();
}

export async function replaceAllData(data) {
  const normalized = normalizeData(data);
  return persist(normalized);
}

export async function updateData(mutator, options) {
  const data = await loadAllData();
  const draft = JSON.parse(JSON.stringify(data));
  await mutator(draft);
  return persist(draft, options);
}

export async function saveSettings(partial, options) {
  return updateData((data) => {
    data.settings = { ...data.settings, ...partial };
  }, options);
}

export async function createProjectRecord(input) {
  const project = createProject(input);
  await updateData((data) => {
    data.projects[project.id] = project;
    pushActivity(data, {
      type: 'project_created',
      entityId: project.id,
      entityType: 'project',
      message: `Project created: ${project.name}`,
    });
  });
  return project;
}

export async function updateProjectRecord(id, patch) {
  await updateData((data) => {
    const p = data.projects[id];
    if (!p) throw new Error('Project not found');
    data.projects[id] = {
      ...p,
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : p.name,
      updatedAt: new Date().toISOString(),
    };
    pushActivity(data, {
      type: 'project_updated',
      entityId: id,
      entityType: 'project',
      message: `Project updated: ${data.projects[id].name}`,
    });
  });
}

export async function deleteProjectRecord(id, { deleteTasks = false } = {}) {
  await updateData((data) => {
    const p = data.projects[id];
    if (!p) throw new Error('Project not found');
    delete data.projects[id];
    for (const [tid, task] of Object.entries(data.tasks)) {
      if (task.projectId === id) {
        if (deleteTasks) delete data.tasks[tid];
        else data.tasks[tid] = { ...task, projectId: null, updatedAt: new Date().toISOString() };
      }
    }
    for (const [nid, note] of Object.entries(data.notes)) {
      if (note.projectId === id) {
        data.notes[nid] = { ...note, projectId: null, updatedAt: new Date().toISOString() };
      }
    }
    pushActivity(data, {
      type: 'project_deleted',
      entityId: id,
      entityType: 'project',
      message: `Project deleted: ${p.name}`,
    });
  });
}

export async function createTaskRecord(input) {
  const task = createTask(input);
  await updateData((data) => {
    data.tasks[task.id] = task;
    pushActivity(data, {
      type: 'task_created',
      entityId: task.id,
      entityType: 'task',
      message: `Task created: ${task.title}`,
    });
  });
  return task;
}

export async function updateTaskRecord(id, patch) {
  await updateData((data) => {
    const t = data.tasks[id];
    if (!t) throw new Error('Task not found');
    const merged = { ...t, ...patch, updatedAt: new Date().toISOString() };
    if (patch.status && patch.status !== t.status) {
      const withStatus = applyStatusChange(merged, patch.status);
      Object.assign(merged, withStatus);
      pushActivity(data, {
        type: 'task_status_changed',
        entityId: id,
        entityType: 'task',
        message: `Task status → ${patch.status}: ${merged.title}`,
      });
    }
    data.tasks[id] = merged;
  });
}

export async function deleteTaskRecord(id) {
  await updateData((data) => {
    const t = data.tasks[id];
    if (!t) throw new Error('Task not found');
    delete data.tasks[id];
    for (const plan of Object.values(data.dailyPlans)) {
      if (plan.taskIds) plan.taskIds = plan.taskIds.filter((x) => x !== id);
    }
    pushActivity(data, {
      type: 'task_deleted',
      entityId: id,
      entityType: 'task',
      message: `Task deleted: ${t.title}`,
    });
  });
}

export async function completeTask(id, completed = true) {
  const status = completed ? 'completed' : 'todo';
  await updateData((data) => {
    const t = data.tasks[id];
    if (!t) throw new Error('Task not found');
    const next = applyStatusChange(t, status);
    data.tasks[id] = next;
    pushActivity(data, {
      type: completed ? 'task_completed' : 'task_reopened',
      entityId: id,
      entityType: 'task',
      message: completed ? `Task completed: ${t.title}` : `Task reopened: ${t.title}`,
    });
  });
}

export async function createNoteRecord(input) {
  const note = createNote(input);
  await updateData((data) => {
    data.notes[note.id] = note;
    pushActivity(data, {
      type: 'note_created',
      entityId: note.id,
      entityType: 'note',
      message: `Note created: ${note.title || 'Untitled'}`,
    });
  });
  return note;
}

export async function updateNoteRecord(id, patch) {
  await updateData((data) => {
    const n = data.notes[id];
    if (!n) throw new Error('Note not found');
    data.notes[id] = { ...n, ...patch, updatedAt: new Date().toISOString() };
  });
}

export async function deleteNoteRecord(id) {
  await updateData((data) => {
    delete data.notes[id];
  });
}

export async function getDailyPlan(date = todayISO()) {
  const data = await loadAllData();
  return data.dailyPlans[date] ?? { taskIds: [], focus: '', notes: '' };
}

export async function saveDailyPlan(date, plan) {
  await updateData((data) => {
    data.dailyPlans[date] = {
      taskIds: plan.taskIds ?? [],
      focus: plan.focus ?? '',
      notes: plan.notes ?? '',
    };
  });
}

export async function toggleMyDayTask(date, taskId) {
  await updateData((data) => {
    const plan = data.dailyPlans[date] ?? { taskIds: [], focus: '', notes: '' };
    const set = new Set(plan.taskIds);
    if (set.has(taskId)) set.delete(taskId);
    else set.add(taskId);
    data.dailyPlans[date] = { ...plan, taskIds: [...set] };
  });
}

export async function loadDemoData() {
  const demo = buildDemoData();
  await updateData((data) => {
    Object.assign(data.projects, demo.projects);
    Object.assign(data.tasks, demo.tasks);
    Object.assign(data.notes, demo.notes);
    data.activity = [...demo.activity, ...data.activity].slice(0, ACTIVITY_LIMIT);
    data.meta = { ...data.meta, ...demo.meta };
  });
}

export async function clearDemoData() {
  await updateData((data) => {
    const cleaned = removeDemoData(data);
    Object.assign(data, cleaned);
  });
}

export async function resetAllData() {
  const fresh = createEmptyData();
  return persist(fresh);
}

export async function exportDataJson() {
  const data = await loadAllData();
  return JSON.stringify(data, null, 2);
}

export async function importDataJson(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: 'Invalid JSON file.' };
  }
  const validation = validateImportedData(parsed);
  if (!validation.ok) return validation;
  await replaceAllData(validation.data);
  return { ok: true };
}
