# @helder-studio/storage

One tiny storage contract for React and React Native libraries, with adapters for `localStorage`,
AsyncStorage, MMKV and memory. Zero dependencies, SSR-safe, never throws.

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

## Adapters

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

## License

MIT
