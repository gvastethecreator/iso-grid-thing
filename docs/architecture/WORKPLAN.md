# Architecture Workplan

Date: 2026-07-09

## Accepted Review

Source: `docs/architecture/architecture-review-2026-07-09.md`

## Completed

- Deepened asset placement behind `lib/assetLayout.ts`.
- Added Vitest coverage for asset footprint, free-space search, and area-based layout.
- Extracted grid projection math into `lib/projection.ts`.
- Extracted grid path generation and stroke formatting into `lib/gridPaths.ts`.
- Kept `components/IsometricGrid.tsx` as the React, DOM, and GSAP adapter for the canvas.
- Extracted workspace JSON handling into `lib/workspaceFile.ts`.
- Extracted SVG serialization, PNG rasterization, and download triggering into `lib/svgExport.ts`.
- Added Vitest coverage for projection, grid paths, and workspace parsing.
- Added Playwright browser smoke coverage for initial render and the custom color picker.
- Added Playwright Chromium smoke to CI.

## Remaining Follow-ups

- Add interaction-level browser coverage for asset dragging after asset fixtures are available.
- Profile 50x50 and 128x128 grids after establishing a repeatable browser trace workflow.
- Choose a license before public release.
