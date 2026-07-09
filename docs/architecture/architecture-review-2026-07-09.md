# Architecture Review - iso-grid-thing

Date: 2026-07-09

## Summary

- Friction concentrates in canvas projection, asset placement, and workspace import/export.
- Asset placement was shallow in two callers; the interface now lives in `lib/assetLayout.ts`.
- Color selection is now local UI instead of a third-party adapter.
- Canvas projection is still shallow inside `components/IsometricGrid.tsx`; projection math, path generation, DOM animation, and pointer handling share one module.
- This review matters now because performance work already touches module seams and the repo has no tests yet.

## Recommendations

### 1. Deepen the asset placement module

**Recommendation strength**: Strong

**Files**

- `lib/assetLayout.ts`
- `components/panels/AssetTimeline.tsx`
- `components/panels/AssetsPanel.tsx`

**Problem**

Asset placement was shallow and duplicated. The add-asset path and auto-layout path each owned occupancy-grid implementation details.

**Solution**

Deepen asset placement behind one interface for cell footprint, free-space search, and area-based layout.

**Benefits**

- locality: placement bugs concentrate in `lib/assetLayout.ts`
- leverage: one interface serves asset creation, scale changes, and auto-layout
- interface shrinks; callers no longer know occupancy-grid implementation details

**Before / After**

Before: each caller recreated grid occupancy and aspect-ratio footprint rules.

After: callers ask `getAssetGridSize`, `findFreeAssetSpace`, or `layoutAssetsByArea`.

**Dependencies / sequencing**

- Done before adding placement tests.
- Unblocks direct Vitest coverage for asset placement without rendering React.

**Documentation follow-ups**

- `CONTEXT.md`: added `Asset placement`.
- `docs/technical-debt.md`: points first tests at `lib/assetLayout.ts`.

### 2. Deepen the canvas projection module

**Recommendation strength**: Strong

**Files**

- `components/IsometricGrid.tsx`
- future `lib/projection.ts`
- future `lib/gridPaths.ts`

**Problem**

Canvas projection is shallow inside a large module. The interface nearly matches the implementation: callers and effects indirectly depend on projection math, path string generation, asset transforms, and pointer coordinate inversion living together.

**Solution**

Deepen projection behind a pure interface that returns coordinate transforms, cell points, asset matrices, and path data. Keep React and GSAP as adapters at the canvas seam.

**Benefits**

- locality: projection bugs concentrate in pure modules
- leverage: tests cover grid rendering math without browser DOM
- interface shrinks; animation and pointer handling stop owning math details

**Before / After**

Before: `IsometricGrid` owns projection, path generation, DOM refs, GSAP updates, pointer handlers, and asset rendering.

After: `IsometricGrid` becomes the adapter between React events/refs and pure projection modules.

**Dependencies / sequencing**

- Do after asset placement tests.
- Extract only pure math first; leave GSAP and DOM updates in place until behavior is covered.

**Documentation follow-ups**

- `CONTEXT.md`: no new term needed yet beyond `Projection`.
- Add ADR only if the seam changes rendering behavior or animation ownership.
- Add accepted work to `docs/architecture/WORKPLAN.md`.

### 3. Deepen workspace import/export

**Recommendation strength**: Medium

**Files**

- `App.tsx`
- future `lib/workspaceFile.ts`
- future `lib/svgExport.ts`

**Problem**

Workspace import/export is shallow in `App.tsx`. The app module owns JSON validation, SVG cloning, PNG rasterization, download creation, and object URL cleanup ordering.

**Solution**

Deepen workspace file handling behind one interface for JSON validation/load, JSON save, SVG serialization, PNG rasterization, and cleanup.

**Benefits**

- locality: file-format and export bugs concentrate in file modules
- leverage: import/export validation can be tested without rendering the app shell
- interface shrinks; `App.tsx` keeps state orchestration only

**Before / After**

Before: `App.tsx` mixes state orchestration and browser file implementation details.

After: `App.tsx` calls workspace file modules and handles user intent.

**Dependencies / sequencing**

- Do after projection extraction because SVG export depends on the canvas seam.
- Keep browser-only adapters small and explicit.

**Documentation follow-ups**

- Update `docs/architecture.md` once the seam exists.
- Add tests for invalid JSON and export serialization.

## Suggested Execution Order

1. Add tests for `lib/assetLayout.ts` because the seam now exists and has no DOM dependency.
2. Extract projection math from `components/IsometricGrid.tsx` into a pure module.
3. Add browser smoke to CI for canvas rendering.
4. Deepen workspace import/export after the canvas seam is clearer.

## Documentation Fan-Out

- `CONTEXT.md`: `Asset placement` and `Asset URL` are now defined.
- `docs/adr/*.md`: none yet; current decisions are reversible.
- `docs/architecture/WORKPLAN.md`: create only if the recommendations are accepted as an execution queue.
