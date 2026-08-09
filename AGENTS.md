# Agent Instructions

## Project

This is a pnpm + Vite + React browser app for building isometric grids and arranging media assets. Preserve the current product workflow and visual language unless the user explicitly asks for a redesign.

## Commands

- Install: `pnpm install`
- Dev server: `pnpm run dev`
- Typecheck: `pnpm run typecheck`
- Build: `pnpm run build`
- Full local check: `pnpm run check`
- Audit: `pnpm run deps:audit`

## Guardrails

- Use pnpm as the package manager. Do not add npm, Yarn, or Bun lockfiles.
- Keep the app client-only; do not add backend storage or remote services without approval.
- Treat imported images and videos as local browser-session assets.
- Keep docs synchronized with package scripts and Vite config.
- Do not commit `.local/`, `node_modules/`, `dist/`, logs, or local environment files.

## Agent skills

### Issue tracker

Issues are tracked as local markdown under `.scratch/<feature-slug>/`; `.scratch/planning/` is reserved for durable execution plans. See `docs/agents/issue-tracker.md`.

### Triage labels

The repo uses the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo using root `CONTEXT.md` and `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.
