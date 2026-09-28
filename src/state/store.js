import * as storage from '../storage/storage.js';

const listeners = new Set();

export async function initStore() {
  await storage.loadAllData();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  const data = storage.getDataSync();
  for (const fn of listeners) fn(data);
}

export function getState() {
  return storage.getDataSync();
}

export async function runAction(action) {
  const result = await action();
  notify();
  return result;
}

export { storage };
