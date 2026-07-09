# Product Requirements

## Product Name

Iso Grid Thing

## Vision

Provide a fast browser tool for generating customizable isometric grids and arranging media assets in perspective without requiring a full vector-design application.

## Target Users

- UI and UX designers creating isometric mockups.
- Content creators projecting screenshots or videos into perspective.
- Digital artists who need precise layout guides.

## Core Features

- Grid generation with width, depth, gap, projection angle, and view-mode controls.
- Visual styling for line thickness, line pattern, fill, opacity, padding, and background.
- Image and video asset import.
- Asset positioning, scaling, fit mode, rotation, and rounded clipping.
- Timeline selection for placed assets.
- Undo/redo for committed workspace actions.
- PNG export and JSON save/load.

## Constraints

- Client-only runtime.
- No server-side storage.
- SVG and DOM rendering instead of WebGL or Three.js.
- Keep interaction smooth for large grids and multiple assets.

## Success Criteria

- Grid controls update visibly and quickly.
- Asset projection stays aligned to the selected grid cells.
- Exported PNG reflects the current canvas.
- Saved JSON can restore a workspace session.
