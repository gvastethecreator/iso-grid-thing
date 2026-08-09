# Architecture

## Overview

Iso Grid Thing is a client-side React application for high-performance SVG grid rendering and media projection. The app keeps all workspace state in memory and uses browser APIs for file import/export.

## Main Surfaces

- `App.tsx`: application state, history integration, import/export intents, and page layout.
- `components/IsometricGrid.tsx`: SVG rendering adapter, GSAP updates, pan/zoom, pointer handling, and asset interactions.
- `components/panels/`: side panels for grid, styling, and asset controls.
- `components/Controls.tsx`: reusable sliders, color controls, toggles, segmented controls, and collapsible sections.
- `hooks/useHistory.ts`: undo/redo history with ephemeral updates for high-frequency interactions.
- `lib/assetLayout.ts`: pure asset footprint, free-space search, and auto-layout rules.
- `lib/projection.ts`: pure grid-to-SVG projection, inverse projection, and asset transform matrix math.
- `lib/gridPaths.ts`: pure SVG path and stroke generation for grid, fill, background, and preview guides.
- `lib/workspaceFile.ts`: portable JSON workspace serialization, media embedding, and defensive validation.
- `lib/svgExport.ts`: SVG serialization, PNG rasterization, and download triggering.
- `types.ts`: shared grid, asset, and view-state types.

## State Model

`GridParams` is the main workspace state. Discrete changes go through the history hook's committed setter. Continuous interactions, such as sliders and dragging, use ephemeral updates after saving a starting snapshot so the undo stack stays readable.

## Rendering Model

The grid renders as SVG. Pure projection functions map grid coordinates to SVG-local coordinates for both isometric and frontal 2D modes. `IsometricGrid` adapts browser pointer coordinates into that projection space through SVG CTM inversion. Media assets are projected with SVG matrix transforms and clipped into rectangular media bounds inside the projected group.

GSAP is used as a local dependency for smooth attribute updates on camera rotation, projection angle, pan/zoom, grid paths, and selection highlights. Asset pointer movement is animation-frame batched, and global pointer listeners read current interaction state through a stable ref instead of being recreated on each render.

## Persistence model

Imported media uses browser object URLs while the workspace is open. JSON export reads those local blobs and embeds them as data URLs. Import validates grid bounds and asset shape before data reaches the renderer. This keeps persistence client-only while making saved workspaces independent of the browser session.

See `docs/adr/0001-portable-workspace-media.md` for the durable decision.

## Testing Model

- Vitest covers pure asset layout, projection, path generation, and workspace-file behavior.
- Playwright covers app boot, SVG visibility, color editing, portable JSON, PNG export, invalid imports, responsive side panels, and the maximum supported grid size.

## Styling Model

Tailwind CSS is compiled through Vite using `@tailwindcss/vite`. Project-specific tactile controls, range input styling, and scrollbar helpers live in `index.css`.

## Constraints

- No backend.
- No persistent server storage.
- Imported media stays local to the browser.
- Portable JSON export/import is the persistence path.
