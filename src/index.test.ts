import { afterEach, describe, expect, it, vi } from 'vitest';
import { asyncStorage, type MMKVLike, memory, mmkv, webStorage } from './index';

function fakeWebStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('memory', () => {
  it('reads, writes and removes', () => {
    const s = memory({ a: '1' });
    expect(s.getItem('a')).toBe('1');
    s.setItem('b', '2');
    expect(s.getItem('b')).toBe('2');
    s.removeItem('a');
    expect(s.getItem('a')).toBeNull();
  });
});

describe('webStorage', () => {
  it('writes through to localStorage', () => {
    const ls = fakeWebStorage();
    vi.stubGlobal('localStorage', ls);
    const s = webStorage();
    s.setItem('k', 'v');
    expect(ls.map.get('k')).toBe('v');
    expect(s.getItem('k')).toBe('v');
    s.removeItem('k');
    expect(ls.map.has('k')).toBe(false);
  });

  it('uses sessionStorage when asked', () => {
    const ss = fakeWebStorage();
    vi.stubGlobal('sessionStorage', ss);
    webStorage('session').setItem('k', 'v');
    expect(ss.map.get('k')).toBe('v');
  });

  it('works without any storage (SSR)', () => {
    vi.stubGlobal('localStorage', undefined);
    const s = webStorage();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    s.removeItem('k');
    expect(s.getItem('k')).toBeNull();
  });

  it('survives a storage getter that throws (blocked cookies)', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      const s = webStorage();
      expect(() => s.setItem('k', 'v')).not.toThrow();
      expect(s.getItem('k')).toBe('v');
      expect(() => s.removeItem('k')).not.toThrow();
      expect(s.getItem('k')).toBeNull();
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });

  it('keeps the newest value in memory when the quota is full', () => {
    const ls = fakeWebStorage();
    vi.stubGlobal('localStorage', ls);
    const s = webStorage();
    s.setItem('k', 'old');
    ls.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    s.setItem('k', 'new');
    expect(s.getItem('k')).toBe('new');
    expect(ls.map.get('k')).toBe('old');
  });

  it('returns null when getItem throws', () => {
    vi.stubGlobal('localStorage', {
      ...fakeWebStorage(),
      getItem: () => {
        throw new Error('boom');
      },
    });
    expect(webStorage().getItem('k')).toBeNull();
  });

  it('does not touch storage at creation time', () => {
    const get = vi.fn();
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get });
    try {
      webStorage();
      expect(get).not.toHaveBeenCalled();
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });
});

describe('asyncStorage', () => {
  it('delegates to the instance', async () => {
    const map = new Map<string, string>();
    const s = asyncStorage({
      getItem: async (k) => map.get(k) ?? null,
      setItem: async (k, v) => {
        map.set(k, v);
      },
      removeItem: async (k) => {
        map.delete(k);
      },
    });
    await s.setItem('k', 'v');
    expect(await s.getItem('k')).toBe('v');
    await s.removeItem('k');
    expect(await s.getItem('k')).toBeNull();
  });
});

describe('mmkv', () => {
  function fakeMMKV(version: 3 | 4) {
    const map = new Map<string, string>();
    const base = {
      getString: (k: string) => map.get(k),
      set: (k: string, v: string) => {
        map.set(k, v);
      },
    };
    const instance: MMKVLike =
      version === 4
        ? { ...base, remove: (k: string) => map.delete(k) }
        : {
            ...base,
            delete: (k: string) => {
              map.delete(k);
            },
          };
    return instance;
  }

  for (const version of [3, 4] as const) {
    it(`supports react-native-mmkv v${version}`, () => {
      const s = mmkv(fakeMMKV(version));
      expect(s.getItem('k')).toBeNull();
      s.setItem('k', 'v');
      expect(s.getItem('k')).toBe('v');
      s.removeItem('k');
      expect(s.getItem('k')).toBeNull();
    });
  }
});
