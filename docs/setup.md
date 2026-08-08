# Setup

## Prerequisites

- Node.js 24 and pnpm `11.20` or newer.

## Install

```sh
pnpm install
```

## Development

```sh
pnpm run dev
```

The Vite dev server runs on `http://localhost:5173`.

## Validation

```sh
pnpm run typecheck
pnpm run build
pnpm run check
pnpm audit
```

`pnpm run check` runs the typecheck, Vitest suite, and production build.

## Preview

```sh
pnpm run build
pnpm run preview
```

## GitHub Pages Deployment

GitHub Pages deploys through `.github/workflows/pages.yml`.

The workflow runs on pushes to `main` and on manual `workflow_dispatch`, installs dependencies with pnpm, runs `pnpm run check`, uploads the generated `dist/` Pages artifact, and deploys it to the `github-pages` environment.

The Pages build sets:

```sh
BASE_PATH=/iso-grid-thing/
```

Vite reads `BASE_PATH` from `vite.config.ts` so local development keeps `/` while the deployed project site loads assets under `https://<owner>.github.io/iso-grid-thing/`.

Before the first run, open the repository on GitHub and set **Settings -> Pages -> Build and deployment -> Source** to **GitHub Actions**. If the repository name changes or a custom domain is added, update `BASE_PATH` in `.github/workflows/pages.yml` accordingly.

The workflow intentionally skips `actions/configure-pages` because this Vite app does not need Pages-generated metadata. `actions/upload-pages-artifact` packages `dist/`, and `actions/deploy-pages` publishes that artifact once Pages is enabled for GitHub Actions.

## Environment

No environment variables are required. This app is a client-only browser tool.

## Tooling

- pnpm for package management and script execution.
- Vite for dev server, build, and preview.
- React 19 and TypeScript for the application.
- Tailwind CSS through the Vite plugin.
- GSAP as a local dependency for SVG/camera animation.
