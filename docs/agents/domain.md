# Domain Docs

This is a single-context repo.

## Before exploring, read these

- `CONTEXT.md` at the repo root.
- `docs/adr/` for durable architectural decisions relevant to the area being changed.

If a file does not exist yet, proceed silently.

## File structure

```text
/
├── CONTEXT.md
├── docs/adr/
└── components/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term as defined in `CONTEXT.md`. If a concept is missing, note the gap rather than inventing a conflicting synonym.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly.
