/** Chrome extension storage, or localStorage when opened in a normal browser (dev). */

export function usesExtensionStorage() {
  try {
    return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
  } catch {
    return false;
  }
}

export function isDevBrowserMode() {
  return !usesExtensionStorage();
}

export async function storageGet(key) {
  if (usesExtensionStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result[key]);
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function storageSet(key, value) {
  if (usesExtensionStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }
  localStorage.setItem(key, JSON.stringify(value));
}
