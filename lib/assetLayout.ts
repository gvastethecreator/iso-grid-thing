import type { PlayableAsset } from "../types";

export interface GridCellSize {
  width: number;
  depth: number;
}

export interface GridCellPosition {
  x: number;
  y: number;
}

export function getAssetGridSize(aspectRatio: number, scale = 1, rotation = 0): GridCellSize {
  const effectiveAspectRatio = rotation === 90 || rotation === 270 ? 1 / aspectRatio : aspectRatio;

  const baseWidth = effectiveAspectRatio > 1 ? Math.round(effectiveAspectRatio) : 1;
  const baseDepth = effectiveAspectRatio > 1 ? 1 : Math.round(1 / effectiveAspectRatio);

  return {
    width: Math.max(1, Math.round(Math.max(1, baseWidth) * scale)),
    depth: Math.max(1, Math.round(Math.max(1, baseDepth) * scale)),
  };
}

export function findFreeAssetSpace(
  gridWidth: number,
  assets: readonly PlayableAsset[],
  width: number,
  depth: number,
): GridCellPosition {
  const occupied: boolean[][] = [];

  const markOccupied = (x: number, y: number, cellWidth: number, cellDepth: number) => {
    for (let i = x; i < x + cellWidth; i++) {
      for (let j = y; j < y + cellDepth; j++) {
        occupied[j] ??= [];
        occupied[j][i] = true;
      }
    }
  };

  const isOccupied = (x: number, y: number, cellWidth: number, cellDepth: number) => {
    for (let i = x; i < x + cellWidth; i++) {
      for (let j = y; j < y + cellDepth; j++) {
        if (occupied[j]?.[i]) return true;
      }
    }
    return false;
  };

  assets.forEach((asset) => {
    markOccupied(asset.x, asset.y, Math.ceil(asset.width), Math.ceil(asset.depth));
  });

  for (let y = 0; ; y++) {
    for (let x = 0; x <= Math.max(0, gridWidth - width); x++) {
      if (!isOccupied(x, y, width, depth)) {
        return { x, y };
      }
    }
  }
}

export function layoutAssetsByArea(gridWidth: number, assets: readonly PlayableAsset[]) {
  const placedAssets: PlayableAsset[] = [];

  return [...assets]
    .sort(
      (a, b) => Math.ceil(b.width) * Math.ceil(b.depth) - Math.ceil(a.width) * Math.ceil(a.depth),
    )
    .map((asset) => {
      const width = Math.ceil(asset.width);
      const depth = Math.ceil(asset.depth);
      const position = findFreeAssetSpace(gridWidth, placedAssets, width, depth);
      const placedAsset = { ...asset, ...position };
      placedAssets.push(placedAsset);
      return placedAsset;
    });
}
