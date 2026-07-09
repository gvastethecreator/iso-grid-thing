# Iso Grid Thing

A browser-based tool for building isometric grids and placing image or video assets onto them.

Iso Grid Thing is a client-only React app for designers, artists, and developers who need quick isometric layout guides without opening a heavy vector editor. It runs locally in the browser, supports interactive grid controls, and exports either the rendered canvas as PNG or the project state as JSON.

## Quick Start

Install [Bun](https://bun.com/docs/pm/cli/install), then run:

```sh
bun install
bun run dev
```

Open `http://localhost:5173`.

## Features

- Adjustable isometric and frontal 2D grid modes.
- Width, depth, gap, projection angle, rotation, padding, color, opacity, and line-style controls.
- Image and video assets with timeline selection, drag placement, scaling, fit mode, rotation, and border-radius controls.
- Undo/redo for committed workspace changes.
- PNG export plus JSON save/load for project state.

## Documentation

- Setup and commands: `docs/setup.md`
- GitHub Pages deployment: `docs/setup.md#github-pages-deployment`
- Architecture: `docs/architecture.md`
- Product requirements: `docs/product-requirements.md`
- Readiness record: `docs/project-readiness.md`
- Deferred debt: `docs/technical-debt.md`

## GitHub Pages

This app can be deployed as a static GitHub Pages project site with GitHub Actions. The deploy workflow builds the Vite app into `dist/` with `BASE_PATH=/iso-grid-thing/`, then publishes that build artifact to Pages.

Before the first deployment, set the repository Pages source to **GitHub Actions** in GitHub repository settings. If the repository is renamed, update `BASE_PATH` in `.github/workflows/pages.yml` to match the new project path.

## Status

- Client-only app; no backend or server-side storage.
- Bun is the supported package manager for this repo.
- No open-source license has been selected yet.

## License

MIT
