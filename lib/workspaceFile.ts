import type { GridParams } from '../types';

export interface WorkspaceParseResult {
  ok: boolean;
  value?: GridParams;
  error?: string;
}

export function serializeWorkspace(gridParams: GridParams) {
  return JSON.stringify(gridParams, null, 2);
}

export function parseWorkspaceJson(text: string, defaults: GridParams): WorkspaceParseResult {
  try {
    const parsed = JSON.parse(text);
    const value = sanitizeWorkspaceParams(parsed, defaults);
    if (!value) {
      return { ok: false, error: 'Invalid grid state file.' };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: 'Error reading or parsing the file.' };
  }
}

export function sanitizeWorkspaceParams(value: unknown, defaults: GridParams): GridParams | null {
  if (!isRecord(value)) return null;
  if (typeof value.width !== 'number' || typeof value.depth !== 'number') return null;

  return {
    ...defaults,
    ...value,
    assets: Array.isArray(value.assets) ? value.assets : defaults.assets,
    backgroundGrid: {
      ...defaults.backgroundGrid,
      ...(isRecord(value.backgroundGrid) ? value.backgroundGrid : {}),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
