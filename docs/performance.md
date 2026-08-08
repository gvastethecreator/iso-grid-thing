# Performance Notes

Date: 2026-07-09

The active package-manager command is now `pnpm run build`. Bun references below record the original 2026-07-09 measurement.

## Tooling

- Chrome DevTools MCP was not configured in this environment, so no DevTools trace was captured.
- Browser smoke and load sampling used Playwright against the local Vite app.
- Production bundle evidence comes from `bun run build`.

## Before

- App title: `Iso Master`.
- Local dev smoke at `http://localhost:5202` rendered the canvas with no console errors.
- Baseline production build:
  - main JS: `460.06 kB`, gzip `142.58 kB`
  - CSS: `41.25 kB`, gzip `7.31 kB`

## Changes

- Replaced `react-color` with a custom minimal color picker using hex input, swatches, and RGB sliders.
- Extracted asset placement into `lib/assetLayout.ts`, removing duplicate occupancy-grid implementations from asset add and auto-layout flows.
- Extracted projection math into `lib/projection.ts` and path generation into `lib/gridPaths.ts`, keeping per-render SVG path construction behind pure helpers.
- Extracted workspace JSON and SVG/PNG export handling into focused file modules.
- Added `lib/assetUrls.ts` and wired object URL revocation for asset removal, reset, JSON load replacement, failed media metadata loads, and app unmount.

## After

- Production build:
  - main JS after custom picker: `316.09 kB`, gzip `103.56 kB`
  - main JS after architecture extraction: `316.33 kB`, gzip `103.71 kB`
  - CSS after architecture extraction: `41.62 kB`, gzip `7.37 kB`

The prior lazy-loaded color-picker pass moved `react-color` to a separate `145.28 kB` chunk. The custom picker removes that chunk and the dependency entirely.

## Browser Smoke

- URL: `http://localhost:5202`
- App title rendered as `ISO GRID THING`.
- Custom line-color picker opened successfully.
- Swatch click changed the line color input to `#ef4444`.
- RGB slider count: `3`.
- `react-color` resource loaded: `false`.
- Console/page errors: none.
- Screenshot: `.local/screenshots/custom-color-picker-1440x900.png`

## Remaining Opportunities

- Add interaction profiling for 50x50 and 128x128 grids after projection is testable.
- Add browser coverage for asset drag and workspace import/export.
