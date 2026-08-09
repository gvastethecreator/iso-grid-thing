# Performance

Date: 2026-08-09

## Production output

Vite 8.2.1 builds the application into:

- JavaScript: 324.46 kB, 106.10 kB gzip.
- CSS: 46.32 kB, 8.08 kB gzip.
- HTML: 0.81 kB, 0.50 kB gzip.

The prior architecture pass reduced the main JavaScript bundle from 460.06 kB to about 316 kB by replacing `react-color`. This pass keeps that reduction while adding responsive navigation, portable media persistence, and inline feedback.

## Interaction work

- Asset drag uses one stable set of global pointer listeners instead of re-registering listeners whenever React props change.
- Pointer movement is batched with `requestAnimationFrame`, and direct zero-duration movement uses `gsap.set`.
- Asset DOM queries are scoped to the editor SVG instead of the whole document.
- Asset depth sorting is memoized until the asset list changes.
- Mouse-only drag and pan handlers were replaced with pointer handlers, covering touch and pen input too.
- Camera tweens are killed when their effect is replaced or unmounted.

## Browser coverage

Playwright exercises the maximum supported 128 x 128 grid, verifies that the SVG stays visible, and fails on page errors. It also covers mobile navigation, portable JSON export, and PNG export.

## Remaining measurement

A recorded DevTools trace under sustained asset-heavy dragging remains useful before a public release. It is a measurement task, not a known functional blocker.
