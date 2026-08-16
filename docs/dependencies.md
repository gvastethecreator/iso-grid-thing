# Dependency Upgrade Notes

Date: 2026-08-14

All direct dependencies were checked with `pnpm outdated` and updated with pnpm 11.21.0. The lockfile passed pnpm's supply-chain policy check during resolution.

## Changes reviewed

| Dependency                         |        Previous |         Current | Important change and project value                                                                                                                                                                                                                                                                              |
| ---------------------------------- | --------------: | --------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lucide-react`                     |         0.417.0 |          1.31.0 | Major icon-library update. Existing imports still compile and render; the responsive header also uses current `Images` and `SlidersHorizontal` icons. See the [official Lucide releases](https://github.com/lucide-icons/lucide/releases).                                                                      |
| `typescript`                       |           5.8.3 |           7.0.2 | TypeScript 7 moves the toolchain to the native implementation and brings major type-checking and editor performance gains. The project now passes strict mode and declares Vite client types explicitly. See [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). |
| `@types/node`                      |         22.20.1 |          26.2.0 | Aligns development types with the latest Node API surface. The app only uses stable URL and process APIs and remains validated on Node 24+. See the [official type definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node).                                                     |
| `vite`                             |           8.2.0 |           8.2.1 | Patch update within Vite 8. The production build and normalized GitHub Pages base path pass unchanged. See the [official Vite releases](https://github.com/vitejs/vite/releases).                                                                                                                               |
| `pnpm`                             |         11.20.0 |         11.21.0 | Updates the pinned package manager and CI installer. Frozen installs and the supply-chain verification path remain enabled. See the [official pnpm releases](https://github.com/pnpm/pnpm/releases).                                                                                                            |
| `@types/react`, `@types/react-dom` | transitive only | 19.2.18, 19.2.4 | Makes the React 19 type contract explicit after the dependency refresh removed accidental transitive access. Strict TypeScript now has a reproducible type surface. See [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped).                                                                  |
| `oxlint`                           |          1.77.0 |          1.78.0 | Keeps the warning-as-error lint gate on the current release. See the [official Oxlint CLI guide](https://oxc.rs/docs/guide/usage/linter/cli).                                                                                                                                                                   |
| `oxfmt`                            |          0.62.0 |          0.63.0 | Keeps formatting for TypeScript, React, CSS, JSON, Markdown, and workflows on the current release. See the [official Oxfmt guide](https://oxc.rs/docs/guide/usage/formatter.html).                                                                                                                              |

Runtime versions of React, React DOM, GSAP, Tailwind CSS, Playwright, the Vite React plugin, and Vitest were already current and did not require migration.

## CI action upgrades

- `actions/checkout` now uses v7.
- `actions/setup-node` now uses v6. Its current documentation recommends the v6 action with checkout v6 or newer and supports reading Node constraints from `package.json`; see the [official setup-node documentation](https://github.com/actions/setup-node).
- `pnpm/action-setup`, `actions/upload-pages-artifact`, and `actions/deploy-pages` were already on their current major versions.

## Migration outcome

- No operational Bun usage exists, so pnpm remains the sole package manager.
- `pnpm-workspace.yaml` records an explicit supply-chain age exception for `lucide-react@1.31.0`. It was newer than pnpm's automatic update cutoff, so it was requested directly and then validated through the full suite.
- The Lucide major did not require icon renames in this codebase.
- TypeScript 7 found missing explicit React type dependencies and stricter DOM target checks; both were fixed instead of weakening the compiler.
- Vite, Vitest, React, Tailwind, GSAP, and Playwright remain integrated through the existing public seams.
