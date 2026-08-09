# ADR 0001: Portable workspace media

Date: 2026-08-09

Status: accepted

## Context

Imported files use browser `blob:` URLs. Those URLs stop working when the page or browser session ends, so saving them directly in JSON produced a workspace that could not reliably reopen its media.

## Decision

Keep object URLs during editing. During JSON export, read each object URL and embed its content as a data URL. Validate imported grid dimensions and asset records before applying the workspace to React state.

## Consequences

- Saved workspaces are portable and remain client-only.
- JSON files grow with the size of imported media, especially video.
- Export can fail if the browser has already released an imported blob; the UI reports this inline.
- A future large-media format may use a ZIP container, but it must preserve this portable boundary.
