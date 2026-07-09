# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- Reserved: `.scratch/planning/` is durable agent execution state, not an issue/PRD feature directory.
- Reserved: `.scratch/wayfinder/` is for wayfinding maps and decision tickets, not ordinary implementation issues.
- The spec/PRD is `.scratch/<feature-slug>/PRD.md`
- The compact ticket breakdown is `.scratch/<feature-slug>/tickets.md`
- Implementation issues may also be `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, when per-ticket lifecycle/comments matter.
- Triage state is recorded as a `Status:` line near the top of each issue file.
- Comments and conversation history append to the bottom of the file under a `## Comments` heading.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/`, creating the directory if needed. `/to-prd` writes `PRD.md`; `/to-issues` writes `tickets.md` by default or issue files under `issues/` when the repo already works that way. Never publish issues under `.scratch/planning/`.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or issue number directly.

## Wayfinding operations

Used by `/wayfinder`. Maps live in `.scratch/wayfinder/<effort-slug>/`.

- Map: `.scratch/wayfinder/<effort-slug>/map.md`
- Child ticket: `.scratch/wayfinder/<effort-slug>/tickets/<NNN>-<slug>.md`
- Blocking: `Blocked by: <NNN>, <NNN>` near the top.
- Frontier: open tickets with no unresolved blockers and no active claim, read in numeric order.
- Claim: set `Status: claimed` before work.
- Resolve: fill `## Answer`, set `Status: resolved`, and append a one-line pointer to the map.
