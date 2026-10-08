// localStorage-backed values shared by the dashboard features (todos, focus,
// course progress, QCM progress).
//
// Every value belongs to the signed-in account: its key is suffixed with the
// user's id (`yak_todos::<userId>`), so two accounts on the same device never
// see each other's tasks, progress or sessions. AuthContext tells this module
// who is signed in (setStorageUser); when that changes, every stored value
// re-reads. Signed out, values go to a separate «guest» slot.

let storageUser = null;
const userListeners = new Set();

export const scopedKey = (key) => `${key}::${storageUser || "guest"}`;

/** Called by AuthContext whenever the signed-in account changes. */
export function setStorageUser(userId) {
  const next = userId || null;
  if (next === storageUser) return;
  storageUser = next;
  userListeners.forEach((listener) => listener());
}

export function readRaw(key) {
  try {
    return localStorage.getItem(scopedKey(key));
  } catch {
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    localStorage.setItem(scopedKey(key), value);
  } catch {
    // Storage unavailable (private mode, quota): keep working in memory.
  }
}

export function removeRaw(key) {
  try {
    localStorage.removeItem(scopedKey(key));
  } catch {
    // storage unavailable
  }
}

// A localStorage value exposed to React. The parsed value is cached per raw
// string so useSyncExternalStore gets a stable snapshot.
export function createStoredValue(key, parse) {
  const listeners = new Set();
  let lastRaw;
  let lastValue;

  const get = () => {
    const raw = readRaw(key);
    if (raw !== lastRaw || lastValue === undefined) {
      lastRaw = raw;
      lastValue = parse(raw);
    }
    return lastValue;
  };
  const emit = () => listeners.forEach((listener) => listener());
  const set = (value) => {
    writeRaw(key, JSON.stringify(value));
    emit();
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    userListeners.add(listener); // another account signed in: read its own value
    const onStorage = (event) => {
      if (event.key === scopedKey(key) || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      userListeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };
  return { get, set, subscribe };
}

export const parseJson = (fallback, isValid) => (raw) => {
  try {
    const value = JSON.parse(raw);
    return value && isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
