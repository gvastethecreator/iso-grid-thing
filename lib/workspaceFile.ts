import type { GridParams } from "../types";

export interface WorkspaceParseResult {
  ok: boolean;
  value?: GridParams;
  error?: string;
}

export function serializeWorkspace(gridParams: GridParams) {
  return JSON.stringify(gridParams, null, 2);
}

export async function serializePortableWorkspace(gridParams: GridParams) {
  const assets = await Promise.all(
    gridParams.assets.map(async (asset) => ({
      ...asset,
      src: asset.src.startsWith("blob:") ? await objectUrlToDataUrl(asset.src) : asset.src,
    })),
  );

  return serializeWorkspace({ ...gridParams, assets });
}

export function parseWorkspaceJson(text: string, defaults: GridParams): WorkspaceParseResult {
  try {
    const parsed = JSON.parse(text);
    const value = sanitizeWorkspaceParams(parsed, defaults);
    if (!value) {
      return { ok: false, error: "Invalid grid state file." };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: "Error reading or parsing the file." };
  }
}

export function sanitizeWorkspaceParams(value: unknown, defaults: GridParams): GridParams | null {
  if (!isRecord(value)) return null;
  if (!isFiniteNumberInRange(value.width, 1, 128) || !isFiniteNumberInRange(value.depth, 1, 128)) {
    return null;
  }

  const assets = Array.isArray(value.assets) ? value.assets.map(sanitizeAsset) : [];
  if (assets.some((asset) => asset === null)) return null;
  const sanitizedAssets = assets as GridParams["assets"];
  if (new Set(sanitizedAssets.map((asset) => asset.id)).size !== sanitizedAssets.length)
    return null;

  const backgroundGrid = sanitizeBackgroundGrid(value.backgroundGrid, defaults.backgroundGrid);
  const viewMode = readEnum(value, "viewMode", ["iso", "2d"], defaults.viewMode);
  const gridGap = readNumber(value, "gridGap", defaults.gridGap, 0, 2);
  const projectionAngle = readNumber(value, "projectionAngle", defaults.projectionAngle, 10, 100);
  const gridRotation = readNumber(value, "gridRotation", defaults.gridRotation ?? 0, -360, 360);
  const lineThickness = readNumber(value, "lineThickness", defaults.lineThickness, 0, 10);
  const lineStyle = readEnum(
    value,
    "lineStyle",
    ["solid", "dashed", "dotted", "pattern"],
    defaults.lineStyle ?? "solid",
  );
  const padding = readNumber(value, "padding", defaults.padding, 0, 200);
  const lineColor = readColor(value, "lineColor", defaults.lineColor);
  const lineOpacity = readNumber(value, "lineOpacity", defaults.lineOpacity ?? 1, 0, 1);
  const fillColor = readColor(value, "fillColor", defaults.fillColor);
  const fillOpacity = readNumber(value, "fillOpacity", defaults.fillOpacity ?? 1, 0, 1);
  const fillEnabled = readBoolean(value, "fillEnabled", defaults.fillEnabled ?? true);
  const backgroundColor = readColor(value, "backgroundColor", defaults.backgroundColor);

  if (
    !backgroundGrid ||
    !viewMode ||
    gridGap === null ||
    projectionAngle === null ||
    gridRotation === null ||
    lineThickness === null ||
    !lineStyle ||
    padding === null ||
    !lineColor ||
    lineOpacity === null ||
    !fillColor ||
    fillOpacity === null ||
    fillEnabled === null ||
    !backgroundColor
  ) {
    return null;
  }

  return {
    viewMode,
    width: value.width,
    depth: value.depth,
    gridGap,
    projectionAngle,
    gridRotation,
    lineThickness,
    lineStyle,
    padding,
    lineColor,
    lineOpacity,
    fillColor,
    fillOpacity,
    fillEnabled,
    backgroundColor,
    assets: sanitizedAssets,
    backgroundGrid,
  };
}

function sanitizeAsset(value: unknown): GridParams["assets"][number] | null {
  if (!isRecord(value)) return null;
  if (value.type !== "image" && value.type !== "video") return null;
  if (typeof value.id !== "string" || value.id.length === 0 || value.id.length > 100) return null;
  if (
    typeof value.src !== "string" ||
    !/^(blob:|data:(image|video)\/|https?:\/\/)/i.test(value.src)
  ) {
    return null;
  }

  if (
    !isFiniteNumberInRange(value.width, 0.01, 128) ||
    !isFiniteNumberInRange(value.depth, 0.01, 128) ||
    !isFiniteNumberInRange(value.x, 0, 128) ||
    !isFiniteNumberInRange(value.y, 0, 128) ||
    !isFiniteNumberInRange(value.aspectRatio, 0.001, 1000) ||
    !isFiniteNumberInRange(value.scale, 0.1, 10)
  ) {
    return null;
  }

  if (
    value.objectFit !== undefined &&
    value.objectFit !== "cover" &&
    value.objectFit !== "contain"
  ) {
    return null;
  }
  if (value.rotation !== undefined && ![0, 90, 180, 270].includes(value.rotation as number)) {
    return null;
  }
  if (value.borderRadius !== undefined && !isFiniteNumberInRange(value.borderRadius, 0, 50)) {
    return null;
  }

  return value as unknown as GridParams["assets"][number];
}

function sanitizeBackgroundGrid(
  value: unknown,
  defaults: GridParams["backgroundGrid"],
): GridParams["backgroundGrid"] | null {
  if (value === undefined) return defaults;
  if (!isRecord(value)) return null;

  const enabled = readBoolean(value, "enabled", defaults.enabled);
  const opacity = readNumber(value, "opacity", defaults.opacity, 0, 1);
  const extension = readNumber(value, "extension", defaults.extension, 0, 50);
  if (enabled === null || opacity === null || extension === null) return null;
  return { enabled, opacity, extension };
}

function readNumber(
  value: Record<string, unknown>,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (value[key] === undefined) return fallback;
  return isFiniteNumberInRange(value[key], minimum, maximum) ? value[key] : null;
}

function readBoolean(value: Record<string, unknown>, key: string, fallback: boolean) {
  if (value[key] === undefined) return fallback;
  return typeof value[key] === "boolean" ? value[key] : null;
}

function readColor(value: Record<string, unknown>, key: string, fallback: string) {
  if (value[key] === undefined) return fallback;
  return typeof value[key] === "string" && /^#[\da-f]{6}$/i.test(value[key]) ? value[key] : null;
}

function readEnum<const T extends string>(
  value: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  fallback: T,
) {
  if (value[key] === undefined) return fallback;
  return typeof value[key] === "string" && allowed.includes(value[key] as T)
    ? (value[key] as T)
    : null;
}

function isFiniteNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return (
    typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum
  );
}

async function objectUrlToDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("An imported media file is no longer available.");
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("An imported media file could not be encoded."));
    reader.onerror = () => reject(new Error("An imported media file could not be read."));
    reader.readAsDataURL(blob);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
