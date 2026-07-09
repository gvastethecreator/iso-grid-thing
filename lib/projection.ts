import type { PlayableAsset } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface GridProjectionInput {
  width: number;
  depth: number;
  padding: number;
  viewMode: 'iso' | '2d';
  gridGap: number;
  assets: readonly PlayableAsset[];
  containerSize: { width: number; height: number };
  camera: { rot: number; proj: number };
}

export interface AssetProjectionMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface GridProjection {
  tileWidth: number;
  tileHeight: number;
  translateX: number;
  translateY: number;
  scale: number;
  toIso: (x: number, y: number) => Point;
  fromIsoPoint: (x: number, y: number) => Point;
  getCellPoints: (gx: number, gy: number, width?: number, depth?: number) => Point[];
  getAssetMatrix: () => AssetProjectionMatrix;
}

const BASE_TILE_WIDTH = 100;
const PIXEL_SCALE = 1000;

export function createGridProjection(input: GridProjectionInput): GridProjection {
  const { width, depth, padding, viewMode, containerSize, camera } = input;
  const is2D = viewMode === '2d';
  const baseTileHeight = BASE_TILE_WIDTH * (is2D ? 1 : camera.proj / 100);

  const toIsoUnscaled = createToIso({
    tileWidth: BASE_TILE_WIDTH,
    tileHeight: baseTileHeight,
    width,
    depth,
    gridGap: input.gridGap,
    is2D,
    rotation: camera.rot,
  });

  const bounds = getCoordinateBounds(width, depth, input.gridGap, input.assets);
  const cornersUnscaled = [
    toIsoUnscaled(bounds.minX, bounds.minY),
    toIsoUnscaled(bounds.maxX, bounds.minY),
    toIsoUnscaled(bounds.minX, bounds.maxY),
    toIsoUnscaled(bounds.maxX, bounds.maxY),
  ];

  const minXUnscaled = Math.min(...cornersUnscaled.map((point) => point.x));
  const minYUnscaled = Math.min(...cornersUnscaled.map((point) => point.y));
  const gridWidthUnscaled = Math.max(...cornersUnscaled.map((point) => point.x)) - minXUnscaled;
  const gridHeightUnscaled = Math.max(...cornersUnscaled.map((point) => point.y)) - minYUnscaled;

  let scale = 1;
  if (gridWidthUnscaled > 0 && gridHeightUnscaled > 0 && containerSize.width > 0 && containerSize.height > 0) {
    scale = Math.min(
      (containerSize.width - padding * 2) / gridWidthUnscaled,
      (containerSize.height - padding * 2) / gridHeightUnscaled,
    );
  }

  const tileWidth = BASE_TILE_WIDTH * scale;
  const tileHeight = baseTileHeight * scale;
  const gridWidth = gridWidthUnscaled * scale;
  const gridHeight = gridHeightUnscaled * scale;
  const minX = minXUnscaled * scale;
  const minY = minYUnscaled * scale;
  const translateX = (containerSize.width - gridWidth) / 2 - minX;
  const translateY = (containerSize.height - gridHeight) / 2 - minY;

  const toIso = createToIso({
    tileWidth,
    tileHeight,
    width,
    depth,
    gridGap: input.gridGap,
    is2D,
    rotation: camera.rot,
  });

  const fromIsoPoint = (x: number, y: number): Point => {
    const currentGap = input.gridGap || 0;

    if (is2D) {
      return {
        x: x / tileWidth / (1 + currentGap),
        y: y / tileHeight / (1 + currentGap),
      };
    }

    const a = tileWidth / 2;
    const b = tileHeight / 2;
    if (a === 0 || b === 0) return { x: 0, y: 0 };

    const termX = x / (2 * a);
    const termY = y / (2 * b);
    const rx = termY + termX;
    const ry = termY - termX;

    const layoutWidth = width * (1 + currentGap) - currentGap;
    const layoutDepth = depth * (1 + currentGap) - currentGap;
    const cx = layoutWidth / 2;
    const cy = layoutDepth / 2;
    const rotationRadians = camera.rot * (Math.PI / 180);
    const dx = rx - cx;
    const dy = ry - cy;

    const origX = cx + dx * Math.cos(-rotationRadians) - dy * Math.sin(-rotationRadians);
    const origY = cy + dx * Math.sin(-rotationRadians) + dy * Math.cos(-rotationRadians);

    return {
      x: origX / (1 + currentGap),
      y: origY / (1 + currentGap),
    };
  };

  const getCellPoints = (gx: number, gy: number, cellWidth = 1, cellDepth = 1) => {
    const gap = input.gridGap || 0;
    const xStart = gx * (1 + gap);
    const yStart = gy * (1 + gap);
    const xEnd = xStart + cellWidth + (cellWidth - 1) * gap;
    const yEnd = yStart + cellDepth + (cellDepth - 1) * gap;

    return [
      toIso(xStart, yStart),
      toIso(xEnd, yStart),
      toIso(xEnd, yEnd),
      toIso(xStart, yEnd),
    ];
  };

  const getAssetMatrix = (): AssetProjectionMatrix => {
    if (is2D) {
      return {
        a: tileWidth / PIXEL_SCALE,
        b: 0,
        c: 0,
        d: tileHeight / PIXEL_SCALE,
      };
    }

    const rotationRadians = camera.rot * (Math.PI / 180);
    const dxX = Math.cos(rotationRadians);
    const dyX = Math.sin(rotationRadians);
    const dxY = -Math.sin(rotationRadians);
    const dyY = Math.cos(rotationRadians);
    const widthHalf = tileWidth / 2;
    const heightHalf = tileHeight / 2;

    return {
      a: ((dxX - dyX) * widthHalf) / PIXEL_SCALE,
      b: ((dxX + dyX) * heightHalf) / PIXEL_SCALE,
      c: ((dxY - dyY) * widthHalf) / PIXEL_SCALE,
      d: ((dxY + dyY) * heightHalf) / PIXEL_SCALE,
    };
  };

  return {
    tileWidth,
    tileHeight,
    translateX,
    translateY,
    scale,
    toIso,
    fromIsoPoint,
    getCellPoints,
    getAssetMatrix,
  };
}

function createToIso(options: {
  tileWidth: number;
  tileHeight: number;
  width: number;
  depth: number;
  gridGap: number;
  is2D: boolean;
  rotation: number;
}) {
  return (x: number, y: number): Point => {
    if (options.is2D) {
      return {
        x: x * options.tileWidth,
        y: y * options.tileHeight,
      };
    }

    const gap = options.gridGap || 0;
    const layoutWidth = options.width * (1 + gap) - gap;
    const layoutDepth = options.depth * (1 + gap) - gap;
    const cx = layoutWidth / 2;
    const cy = layoutDepth / 2;
    const rotationRadians = options.rotation * (Math.PI / 180);
    const dx = x - cx;
    const dy = y - cy;

    const rx = cx + dx * Math.cos(rotationRadians) - dy * Math.sin(rotationRadians);
    const ry = cy + dx * Math.sin(rotationRadians) + dy * Math.cos(rotationRadians);

    return {
      x: (rx - ry) * (options.tileWidth / 2),
      y: (rx + ry) * (options.tileHeight / 2),
    };
  };
}

function getCoordinateBounds(
  width: number,
  depth: number,
  gridGap: number,
  assets: readonly PlayableAsset[],
) {
  let minCoordX = 0;
  let maxCoordX = width;
  let minCoordY = 0;
  let maxCoordY = depth;

  assets.forEach((asset) => {
    minCoordX = Math.min(minCoordX, asset.x);
    maxCoordX = Math.max(maxCoordX, asset.x + Math.max(1, asset.width));
    minCoordY = Math.min(minCoordY, asset.y);
    maxCoordY = Math.max(maxCoordY, asset.y + Math.max(1, asset.depth));
  });

  return {
    maxX: maxCoordX > 0 ? (maxCoordX - 1) * (1 + gridGap) + 1 : 0,
    maxY: maxCoordY > 0 ? (maxCoordY - 1) * (1 + gridGap) + 1 : 0,
    minX: minCoordX < 0 ? minCoordX * (1 + gridGap) : 0,
    minY: minCoordY < 0 ? minCoordY * (1 + gridGap) : 0,
  };
}
