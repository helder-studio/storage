<div align="center">

# @helder-studio/storage

**One tiny storage contract for React and React Native libraries.**

Adapters for `localStorage`, AsyncStorage, MMKV and memory. Zero dependencies, SSR-safe, never throws.

[![npm](https://img.shields.io/npm/v/@helder-studio/storage?color=cb3837&logo=npm)](https://www.npmjs.com/package/@helder-studio/storage)
[![bundle size](https://img.shields.io/bundlejs/size/@helder-studio/storage?label=min%2Bgzip)](https://bundlejs.com/?q=@helder-studio/storage)
[![CI](https://github.com/helder-studio/storage/actions/workflows/ci.yml/badge.svg)](https://github.com/helder-studio/storage/actions/workflows/ci.yml)
[![provenance](https://img.shields.io/badge/npm-provenance-2ea44f?logo=sigstore)](https://www.npmjs.com/package/@helder-studio/storage#provenance)
[![license](https://img.shields.io/npm/l/@helder-studio/storage?color=blue)](./LICENSE)

</div>

```sh
npm install @helder-studio/storage
```

## Why

Libraries that persist a little state (feature flags, dev-tool settings, crash counters) shouldn't
force a storage library on their users. They accept a `StorageAdapter`; the app passes in whatever it
already uses.

```ts
interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
```

Sync and async adapters share the interface, so consumers `await` every call.

## Features

- 🪶 **Tiny**: under 1 kB, zero dependencies, tree-shakeable ESM + CJS
- 🌐 **SSR-safe**: nothing touches `localStorage` at import time
- 🛡️ **Never throws**: private mode, blocked cookies and full quotas fall back to memory
- 📱 **React Native ready**: AsyncStorage and MMKV v3 / v4, without making either a dependency
- 🔒 **Signed releases**: published from CI with npm provenance

## Adapters

| Adapter          | Platform     | Backed by                                   |
| ---------------- | ------------ | ------------------------------------------- |
| `webStorage()`   | Web          | `localStorage` / `sessionStorage`           |
| `asyncStorage()` | React Native | `@react-native-async-storage/async-storage` |
| `mmkv()`         | React Native | `react-native-mmkv` v3 or v4                |
| `memory()`       | Anywhere     | An in-memory `Map` (tests, SSR, fallbacks)  |

### Web: `webStorage()`

```ts
import { webStorage } from '@helder-studio/storage';

const storage = webStorage(); // localStorage
const session = webStorage('session'); // sessionStorage
```

- Safe to import and create on the server: storage is looked up on each call, not at import time.
- Never throws. When storage is missing (SSR), blocked (Safari private mode, disabled cookies) or full,
  values are kept in memory for the rest of the session.

### React Native AsyncStorage: `asyncStorage()`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorage } from '@helder-studio/storage';

const storage = asyncStorage(AsyncStorage);
```

### React Native MMKV: `mmkv()`

```ts
import { createMMKV } from 'react-native-mmkv';
import { mmkv } from '@helder-studio/storage';

const storage = mmkv(createMMKV());
```

Works with react-native-mmkv v3 (`new MMKV()`, `delete`) and v4 (`createMMKV()`, `remove`).

### Memory: `memory()`

```ts
import { memory } from '@helder-studio/storage';

const storage = memory({ seeded: 'value' }); // tests, SSR, fallbacks
```

## Using it in a library

```ts
import type { StorageAdapter } from '@helder-studio/storage';

export async function loadSettings(storage: StorageAdapter) {
  const raw = await storage.getItem('my-lib:settings');
  return raw ? JSON.parse(raw) : {};
}
```

Neither AsyncStorage nor MMKV is a dependency or peer: both are typed structurally, so your users
install only what they already use.

## Support

If this saves you time, you can buy me a coffee on Ko-fi. It keeps the helder-studio libraries maintained.

<a href="https://ko-fi.com/gorian" target="_blank" rel="noopener">
  <img src="https://storage.ko-fi.com/cdn/kofi3.png?v=6" alt="Support me on Ko-fi" height="40">
</a>

## License

[MIT](./LICENSE) © helder-studio
