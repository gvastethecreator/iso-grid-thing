# Project Context

## Domain

Iso Grid Thing is a browser-based canvas tool for creating isometric and frontal grid layouts with optional media assets.

## Vocabulary

- Grid: the logical cell layout controlled by width, depth, gap, projection, rotation, and style settings.
- Canvas: the interactive SVG viewport where the grid and assets render.
- Asset: an imported image or video placed on the grid.
- Timeline: the bottom asset strip used to add and select assets.
- Asset placement: the process that chooses a free grid position and cell footprint for an asset.
- Asset URL: a browser object URL created for an imported image or video during the current session.
- Projection: the mapping from grid coordinates into SVG screen coordinates.
- Ephemeral update: a transient state update used during continuous interactions without adding every intermediate value to undo history.
- Snapshot: a saved history state captured before a sequence of ephemeral updates.

## Current Constraints

- Client-only app.
- pnpm package manager.
- Vite dev/build pipeline.
- Tailwind CSS through the Vite plugin.
- GSAP for SVG animation.
