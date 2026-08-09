# Setup

## Prerequisites

- Node.js 24 or newer.
- pnpm 11.21 or newer. The repository pins `pnpm@11.21.0` in `package.json`.

## Local development

```sh
pnpm install
pnpm run dev
```

Open `http://127.0.0.1:5173`. No environment variables or backend services are required.

## Validation

```sh
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e
pnpm run deps:outdated
pnpm run deps:audit
```

`pnpm run check` runs the non-mutating format, lint, type, and unit-test gates. `pnpm run ci` also builds the production app and runs the Playwright Chromium suite.

## Production preview

```sh
pnpm run build
pnpm run preview
```

## GitHub Pages

`.github/workflows/pages.yml` validates and builds the app, uploads `dist/`, and deploys it to GitHub Pages. The build uses `BASE_PATH=/iso-grid-thing/` so Vite emits project-site URLs.

Before the first deployment, set **Settings -> Pages -> Build and deployment -> Source** to **GitHub Actions**. If the repository name or hosting path changes, update `BASE_PATH` in the workflow.

## Package-manager policy

Use pnpm for installs and scripts. Keep `pnpm-lock.yaml` committed. Do not add Bun, npm, or Yarn lockfiles. Bun is not required by the application.
