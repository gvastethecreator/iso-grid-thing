# Project Readiness

## 2026-08-08 pnpm migration

- The active package manager is pnpm 11.20.0, with `pnpm-lock.yaml` as the reproducible lockfile.
- Package scripts, Playwright launchers, VS Code tasks, and GitHub Actions now use pnpm.
- `pnpm install --frozen-lockfile --ignore-scripts` and `pnpm run check` passed after the migration.
- The Bun references below describe the earlier readiness pass and are retained as historical evidence.

## Baseline

- Repo initialized on `main`.
- Package manager selected: Bun.
- Project type: Vite + React + TypeScript browser app.
- Existing public docs were English but had stale toolchain details.
- Initial validation with npm succeeded for build but reported vulnerable Vite 6.4.2 and a missing `/index.css` runtime reference.
- No remote repository is configured.
- No license file exists.

## Remediation Lane

Lane B: in-place modernization.

The app already builds and has a compact structure, but the package manager, local dependencies, static asset pipeline, and docs needed alignment. A rewrite is not necessary.

## Completed Slices

- Initialized Git on `main`.
- Migrated package metadata and scripts to Bun.
- Removed the npm lockfile.
- Moved GSAP and Tailwind from CDN/runtime assumptions to local dependencies.
- Added a Vite Tailwind integration and `index.css`.
- Removed unused source files and stale imports.
- Removed unused Gemini API key injection from Vite config.
- Reconciled README, setup docs, architecture docs, and product requirements with the current app.
- Added agent-skill configuration docs.
- Added a Bun GitHub Actions workflow.
- Renamed the app surface to Iso Grid Thing.
- Replaced the third-party color picker with a custom minimal picker and removed `react-color`.
- Extracted asset placement into `lib/assetLayout.ts`.
- Extracted projection and grid path generation into `lib/projection.ts` and `lib/gridPaths.ts`.
- Extracted workspace JSON and SVG/PNG export handling into `lib/workspaceFile.ts` and `lib/svgExport.ts`.
- Added object URL cleanup for imported media assets.
- Added Vitest unit tests for pure architecture seams.
- Added Playwright browser smoke coverage and wired it into CI.
- Added `docs/architecture/WORKPLAN.md` for the accepted architecture review queue.

## Validation Results

- `bun install --frozen-lockfile`: passed.
- `bun run typecheck`: passed.
- `bun run build`: passed with Vite 8.1.4.
- `bun run check`: passed.
- `bun run test`: passed.
- `bun run test:e2e`: passed; Playwright Chromium verified app boot, SVG canvas visibility, and the custom color picker.
- `bun audit`: passed with no vulnerabilities.
- `git diff --check`: passed.
- HTTP smoke on `http://localhost:5202`: passed with status 200.
- Playwright smoke on `http://localhost:5202`: passed; canvas SVG measured `880x857`, add-media and PNG controls were visible, and no console/page errors were reported. Screenshot: `.local/screenshots/smoke-1440x900.png`.
- Performance pass: production main JS changed from `460.06 kB` gzip `142.58 kB` to `316.09 kB` gzip `103.56 kB`; the previous `145.28 kB` async color-picker chunk was removed by replacing `react-color`.
- Architecture implementation build: production main JS is `316.33 kB`, gzip `103.71 kB`; CSS is `41.62 kB`, gzip `7.37 kB`.
- Custom color picker smoke: passed; line-color swatch changed the value to `#ef4444`, RGB sliders rendered, `react-color` was not loaded, and no console/page errors were reported. Screenshot: `.local/screenshots/custom-color-picker-1440x900.png`.

## Deviations

- No license was added because license selection is a project-owner decision.
- No issue tracker remote was configured because no Git remote exists.
