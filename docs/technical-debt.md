# Technical Debt

## High

- No license selected.
  - Impact: publishing and contribution terms are ambiguous.
  - Next step: choose and add a license before public release.

## Medium

- Drag and import/export workflows do not yet have browser-level coverage.
  - Impact: unit tests cover pure projection and file parsing, but full DOM interaction regressions can still slip through.
  - Next step: add Playwright coverage for asset drag, JSON load, and PNG export once stable fixtures exist.

## Low

- Large-grid interaction profiling is still manual.
  - Impact: 50x50 and 128x128 behavior can regress without a repeatable performance trace.
  - Next step: add a profiling script or trace checklist for large-grid scenarios.
