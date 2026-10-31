# @helder-studio/storage

The `StorageAdapter` contract shared by quarantine, network-chaos and timewarp, plus four adapters.
Also the tooling template every other library repo copies (`/new-library`).

## API

```ts
interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
webStorage(kind?: 'local' | 'session') // SSR and private-mode safe, never throws
asyncStorage(AsyncStorage)              // @react-native-async-storage/async-storage instance
mmkv(instance)                          // react-native-mmkv v3 (delete) and v4 (remove)
memory(initial?)                        // tests, SSR, fallback
```

## Rules

- Zero dependencies, no peers. AsyncStorage and MMKV are typed structurally, never imported.
- No global access at import time. Resolve `localStorage` lazily inside each call.
- `webStorage` never throws: missing storage (SSR), access `SecurityError` (blocked cookies) and
  `QuotaExceededError` all fall back to an in-memory map so reads stay consistent within the session.
- `lib` is `ES2022` only (no DOM types): declare the minimal storage shape locally.

## Commands

`pnpm verify` (typecheck, lint, test, build, publint, attw, size-limit), `pnpm changeset`.
