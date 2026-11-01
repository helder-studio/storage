# Agent guide: @helder-studio/storage

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot) and humans working in this
repo. Library-specific notes (layout, decisions, open items) are in `CLAUDE.md`.

## Commands

| Command          | What it does                                                                |
| ---------------- | --------------------------------------------------------------------------- |
| `pnpm install`   | install (pnpm 11, Node 24)                                                  |
| `pnpm test`      | Vitest                                                                      |
| `pnpm verify`    | typecheck, lint, test, build, publint, attw, size-limit: **the done check** |
| `pnpm changeset` | record a user-visible change (see below)                                    |

A change is done when `pnpm verify` passes. Run it before every commit; CI runs the same script.

## Rules

- **Zero dependencies, no peers.** AsyncStorage and MMKV are typed structurally, never imported.
- **No DOM types**: `lib` is `ES2022` only; declare the minimal storage shape locally. The other
  helder-studio libraries depend on this contract, so changes to `StorageAdapter` are breaking.
- **SSR-safe**: no `window`, `localStorage` or other global access at import time.
- **Never throw from storage paths**; keep state in memory on failure. Store ids and timestamps,
  never error messages or user data.
- **TypeScript**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. No `any`.
- **Tests** sit next to the source as `*.test.ts(x)`. Bug fixes come with a test that fails without
  the fix.
- **Formatting and lint**: Biome (`pnpm format`). Don't hand-format.
- **Smallest working change**: no speculative abstractions, options or files.

## Changesets

Every user-visible change needs one. Non-interactive:

```sh
pnpm changeset --patch @helder-studio/storage -m "Fix: what users notice"
pnpm changeset --minor @helder-studio/storage -m "Add: the new capability"
```

Use `--minor` for features while the version is 0.x, `--patch` for fixes. Docs-only and test-only
changes need none.

## README

Keep the shared layout: centered header with badges, Why, Quick start, Features (emoji bullets),
usage and API tables, Compared with…, Support (Ko-fi), License. Document every public API change.

## Commits and releases

- Plain, imperative commit messages ("Fix XHR timeout handling"). No AI attribution or
  co-author trailers.
- Dependency updates are automatic: Dependabot opens PRs weekly, CI merges them when `pnpm verify`
  passes, and runtime-dependency updates release a patch to npm on their own. Major runtime updates
  wait for review.
- Never publish to npm, push tags or create releases by hand: merging the "Version Packages" PR
  makes CI publish with provenance.
