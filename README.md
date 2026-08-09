# Iso Grid Thing

A client-only React tool for building isometric or frontal grids, placing local image and video assets, and exporting the result.

## Quick start

Install Node.js 24+ and pnpm 11.21+, then run:

```sh
pnpm install
pnpm run dev
```

Open `http://127.0.0.1:5173`.

## Features

- Isometric and frontal 2D grid modes with editable dimensions, gaps, projection, rotation, padding, colors, opacity, and line styles.
- Image and video placement with drag, scale, fit, rotation, radius, timeline selection, and automatic layout.
- Pan, zoom, undo, redo, keyboard shortcuts, and responsive side panels for desktop and mobile.
- PNG export and portable JSON save/load. Imported media is embedded in the JSON file, so saved workspaces can be reopened later.
- Strict TypeScript, Vitest coverage, Playwright browser checks, Oxlint, and Oxfmt quality gates.

## Commands

```sh
pnpm run dev           # local development
pnpm run check         # format, lint, types, and unit tests
pnpm run ci            # full check, production build, and Chromium tests
pnpm run deps:outdated # available dependency updates
pnpm run deps:audit    # dependency security audit
```

VS Code exposes the same common commands in `.vscode/tasks.json` with short emoji labels.

## Documentation

- [Setup and deployment](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Dependency upgrade notes](docs/dependencies.md)
- [Performance](docs/performance.md)
- [Product requirements](docs/product-requirements.md)
- [Project readiness](docs/project-readiness.md)
- [Technical debt](docs/technical-debt.md)

## Status

- pnpm is the only supported package manager. The application does not depend on the Bun runtime.
- The app is client-only and does not send imported media to a server.
- No open-source license has been selected. All rights remain reserved until the owner chooses one.

## Deployment

The GitHub Pages workflow builds with `BASE_PATH=/iso-grid-thing/`. Set the repository Pages source to **GitHub Actions** before the first deployment. If the repository name changes, update `BASE_PATH` in `.github/workflows/pages.yml`.
