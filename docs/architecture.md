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
- `lib/workspaceFile.ts`: JSON workspace serialization and validation.
- `lib/svgExport.ts`: SVG serialization, PNG rasterization, and download triggering.
- `types.ts`: shared grid, asset, and view-state types.

## State Model

`GridParams` is the main workspace state. Discrete changes go through the history hook's committed setter. Continuous interactions, such as sliders and dragging, use ephemeral updates after saving a starting snapshot so the undo stack stays readable.

## Rendering Model

The grid renders as SVG. Pure projection functions map grid coordinates to SVG-local coordinates for both isometric and frontal 2D modes. `IsometricGrid` adapts browser pointer coordinates into that projection space through SVG CTM inversion. Media assets are projected with SVG matrix transforms and clipped into rectangular media bounds inside the projected group.

GSAP is used as a local dependency for smooth attribute updates on camera rotation, projection angle, pan/zoom, grid paths, and selection highlights.

## Testing Model

- Vitest covers pure asset layout, projection, path generation, and workspace-file behavior.
- Playwright covers browser-level smoke for app boot, SVG canvas visibility, and the custom color picker.

## Styling Model

Tailwind CSS is compiled through Vite using `@tailwindcss/vite`. Project-specific tactile controls, range input styling, and scrollbar helpers live in `index.css`.

## Constraints

- No backend.
- No persistent server storage.
- Imported media lives in browser object URLs for the current session.
- JSON export/import is the persistence path.
