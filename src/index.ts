export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/** In-memory adapter for tests, SSR and fallbacks. */
export function memory(initial?: Record<string, string>): StorageAdapter {
  const map = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * `localStorage` / `sessionStorage` adapter that never throws. Storage is looked up on every call,
 * so importing on the server is safe. When storage is missing (SSR), blocked (SecurityError) or
 * full (QuotaExceededError), values go to an in-memory map instead and stay readable this session.
 */
export function webStorage(kind: 'local' | 'session' = 'local'): StorageAdapter {
  const fallback = new Map<string, string>();
  const resolve = (): WebStorageLike | undefined => {
    try {
      return (globalThis as Record<string, unknown>)[`${kind}Storage`] as
        | WebStorageLike
        | undefined;
    } catch {
      return undefined;
    }
  };
  return {
    getItem: (key) => {
      const pending = fallback.get(key);
      if (pending !== undefined) return pending;
      try {
        return resolve()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        const storage = resolve();
        if (storage) {
          storage.setItem(key, value);
          fallback.delete(key);
          return;
        }
      } catch {
        // fall through to memory
      }
      fallback.set(key, value);
    },
    removeItem: (key) => {
      fallback.delete(key);
      try {
        resolve()?.removeItem(key);
      } catch {
        // nothing to remove from
      }
    },
  };
}

/** Structural type of `@react-native-async-storage/async-storage`'s default export. */
export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function asyncStorage(instance: AsyncStorageLike): StorageAdapter {
  return {
    getItem: (key) => instance.getItem(key),
    setItem: (key, value) => instance.setItem(key, value),
    removeItem: (key) => instance.removeItem(key),
  };
}

/** Structural type of a `react-native-mmkv` instance: v3 has `delete`, v4 has `remove`. */
export interface MMKVLike {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove?(key: string): unknown;
  delete?(key: string): void;
}

export function mmkv(instance: MMKVLike): StorageAdapter {
  return {
    getItem: (key) => instance.getString(key) ?? null,
    setItem: (key, value) => instance.set(key, value),
    removeItem: (key) => {
      if (instance.remove) instance.remove(key);
      else instance.delete?.(key);
    },
  };
}
