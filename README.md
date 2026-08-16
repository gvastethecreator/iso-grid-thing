<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/grid.svg?title=Iso+Grid+Thing&subtitle=Build+isometric+grids,+arrange+local+media,+and+export+portable+workspaces&logo=react&theme=violet&align=center&mode=dark" />
    <img alt="Iso Grid Thing" src="https://shieldcn.dev/header/grid.svg?title=Iso+Grid+Thing&subtitle=Build+isometric+grids,+arrange+local+media,+and+export+portable+workspaces&logo=react&theme=violet&align=center&mode=light" />
  </picture>
</p>

<p align="center">
  <a href="https://github.com/gvastethecreator/iso-grid-thing/actions/workflows/ci.yml"><img alt="CI status" src="https://shieldcn.dev/github/ci/gvastethecreator/iso-grid-thing.svg?workflow=CI&branch=main&variant=secondary&size=xs" /></a>
  <a href="https://github.com/gvastethecreator/iso-grid-thing/stargazers"><img alt="GitHub stars" src="https://shieldcn.dev/github/stars/gvastethecreator/iso-grid-thing.svg?variant=secondary&size=xs" /></a>
  <a href="https://github.com/gvastethecreator/iso-grid-thing/commits/main"><img alt="Last commit" src="https://shieldcn.dev/github/last-commit/gvastethecreator/iso-grid-thing.svg?variant=secondary&size=xs" /></a>
  <a href="https://gvastethecreator.github.io/iso-grid-thing/"><img alt="Live app" src="https://shieldcn.dev/badge/demo-live-7c3aed.svg?logo=githubpages&variant=branded&size=xs" /></a>
</p>

<p align="center">
  A client-only React workspace for isometric and frontal grids, local media layouts, and portable exports.
  <br />
  <a href="https://gvastethecreator.github.io/iso-grid-thing/"><strong>Open the live app</strong></a>
</p>

## Product tour

| Isometric workspace                                                                                                        | Media layout and controls                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/assets/screenshots/overview.png" alt="Iso Grid Thing isometric workspace with grid and styling controls" /> | <img src="docs/assets/screenshots/media-layout.png" alt="Iso Grid Thing with three local media assets and asset controls" /> |
| **Frontal 2D mode**                                                                                                        | **Mobile settings**                                                                                                          |
| <img src="docs/assets/screenshots/frontal-grid.png" alt="Iso Grid Thing frontal grid with arranged media" />               | <img src="docs/assets/screenshots/mobile-settings.png" alt="Iso Grid Thing settings panel on a mobile viewport" />           |

## What it does

- Builds isometric and frontal 2D grids with editable dimensions, projection, rotation, padding, colors, opacity, and line styles.
- Places local images and videos with drag, scale, fit, rotation, radius, timeline selection, and automatic layout.
- Supports pan, zoom, undo, redo, keyboard shortcuts, and responsive side panels.
- Exports PNG images and portable JSON workspaces with embedded media.
- Keeps imported media inside the browser session. The app has no backend service.

## Quick start

Install Node.js 24 or newer and pnpm 11.21 or newer.

```sh
pnpm install
pnpm run dev
```

Open `http://127.0.0.1:5173`.

## Commands

```sh
pnpm run dev           # local development
pnpm run check         # format, lint, types, and unit tests
pnpm run ci            # full check, production build, and Chromium tests
pnpm run deps:outdated # available dependency updates
pnpm run deps:audit    # dependency security audit
```

VS Code exposes the same common commands in `.vscode/tasks.json`.

## Documentation

- [Setup and deployment](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Dependency upgrade notes](docs/dependencies.md)
- [Performance](docs/performance.md)
- [Product requirements](docs/product-requirements.md)
- [Project readiness](docs/project-readiness.md)
- [Technical debt](docs/technical-debt.md)

## Status

- pnpm is the only supported package manager.
- The application does not require Bun, environment variables, or a backend.
- GitHub Pages deploys the production build from the `main` branch.
- No open-source license has been selected. All rights remain reserved.

## Support

<p align="center">
  <a href="https://github.com/sponsors/gvastethecreator"><img src="https://shieldcn.dev/badge/%E2%9D%A4-sponsor+this+project-red.svg?animate=pulse" alt="Sponsor this project" /></a>
</p>

Support continued development through [GitHub Sponsors](https://github.com/sponsors/gvastethecreator) or [Ko-fi](https://ko-fi.com/gvaste).
