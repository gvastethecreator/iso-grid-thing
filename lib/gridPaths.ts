import type { GridProjection, Point } from "./projection";

export type LineStyle = "solid" | "dashed" | "dotted" | "pattern";

export interface StrokeStyle {
  dasharray: string;
  linecap: "round" | "square";
}

export function getStrokeStyle(lineStyle: LineStyle = "solid", lineThickness = 1): StrokeStyle {
  const effectiveThickness = Math.max(lineThickness, 1);

  if (lineStyle === "dashed") {
    return {
      dasharray: `${effectiveThickness * 6} ${effectiveThickness * 4}`,
      linecap: "square",
    };
  }

  if (lineStyle === "dotted") {
    return {
      dasharray: `0.1 ${effectiveThickness * 3}`,
      linecap: "round",
    };
  }

  if (lineStyle === "pattern") {
    return {
      dasharray: `${effectiveThickness * 6} ${effectiveThickness * 3} ${effectiveThickness} ${effectiveThickness * 3}`,
      linecap: "square",
    };
  }

  return {
    dasharray: "none",
    linecap: "round",
  };
}

export function polygonPath(points: readonly Point[]) {
  return `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} Z`;
}

export function buildBackgroundGridPaths(options: {
  width: number;
  depth: number;
  extension: number;
  gridGap: number;
  projection: GridProjection;
}) {
  const { width, depth, extension, gridGap, projection } = options;
  const offsetX = -extension;
  const offsetY = -extension;

  if (gridGap > 0) {
    let cellsPath = "";
    for (let x = offsetX; x < width + extension; x++) {
      for (let y = offsetY; y < depth + extension; y++) {
        if (x >= 0 && x < width && y >= 0 && y < depth) continue;
        cellsPath += `${polygonPath(projection.getCellPoints(x, y))} `;
      }
    }
    return { primary: cellsPath, secondary: "" };
  }

  let yLinesPath = "";
  for (let y = 0; y <= depth + 2 * extension; y++) {
    const p1 = projection.toIso(offsetX, y + offsetY);
    const p2 = projection.toIso(width + extension, y + offsetY);
    yLinesPath += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
  }

  let xLinesPath = "";
  for (let x = 0; x <= width + 2 * extension; x++) {
    const p1 = projection.toIso(x + offsetX, offsetY);
    const p2 = projection.toIso(x + offsetX, depth + extension);
    xLinesPath += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
  }

  return { primary: yLinesPath, secondary: xLinesPath };
}

export function buildMainGridLinePaths(options: {
  width: number;
  depth: number;
  gridGap: number;
  projection: GridProjection;
}) {
  const { width, depth, gridGap, projection } = options;

  if (gridGap > 0) {
    let cellsPath = "";
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < depth; y++) {
        cellsPath += `${polygonPath(projection.getCellPoints(x, y))} `;
      }
    }
    return { primary: cellsPath, secondary: "" };
  }

  let yLinesPath = "";
  for (let y = 0; y <= depth; y++) {
    const p1 = projection.toIso(0, y);
    const p2 = projection.toIso(width, y);
    yLinesPath += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
  }

  let xLinesPath = "";
  for (let x = 0; x <= width; x++) {
    const p1 = projection.toIso(x, 0);
    const p2 = projection.toIso(x, depth);
    xLinesPath += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
  }

  return { primary: yLinesPath, secondary: xLinesPath };
}

export function buildFillPath(options: {
  width: number;
  depth: number;
  gridGap: number;
  projection: GridProjection;
}) {
  const { width, depth, gridGap, projection } = options;

  if (width <= 0 || depth <= 0) return "";

  if (gridGap > 0) {
    let fillPath = "";
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < depth; y++) {
        fillPath += `${polygonPath(projection.getCellPoints(x, y))} `;
      }
    }
    return fillPath;
  }

  return polygonPath(projection.getCellPoints(0, 0, width, depth));
}

export function buildPreviewGuidePath(options: {
  targetX: number;
  targetY: number;
  targetWidth: number;
  targetDepth: number;
  gridWidth: number;
  gridDepth: number;
  gridGap: number;
  projection: GridProjection;
}) {
  const { targetX, targetY, targetWidth, targetDepth, gridWidth, gridDepth, gridGap, projection } =
    options;

  const midX = targetX * (1 + gridGap) + (targetWidth + (targetWidth - 1) * gridGap) / 2;
  const midY = targetY * (1 + gridGap) + (targetDepth + (targetDepth - 1) * gridGap) / 2;

  const xLineStart = projection.toIso(midX, 0);
  const xLineEnd = projection.toIso(midX, gridDepth * (1 + gridGap));
  const yLineStart = projection.toIso(0, midY);
  const yLineEnd = projection.toIso(gridWidth * (1 + gridGap), midY);

  return `M ${xLineStart.x} ${xLineStart.y} L ${xLineEnd.x} ${xLineEnd.y} M ${yLineStart.x} ${yLineStart.y} L ${yLineEnd.x} ${yLineEnd.y}`;
}
