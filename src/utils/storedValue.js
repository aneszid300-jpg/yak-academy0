// localStorage-backed values shared by the dashboard features (todos, focus).

export function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota): keep working in memory.
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
    const onStorage = (event) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
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
