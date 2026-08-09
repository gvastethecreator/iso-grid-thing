import { describe, expect, it } from "vitest";
import type { PlayableAsset } from "../types";
import { findFreeAssetSpace, getAssetGridSize, layoutAssetsByArea } from "./assetLayout";

const asset = (overrides: Partial<PlayableAsset>): PlayableAsset => ({
  id: overrides.id || "asset",
  type: "image",
  src: "blob:test",
  width: 1,
  depth: 1,
  x: 0,
  y: 0,
  aspectRatio: 1,
  scale: 1,
  ...overrides,
});

describe("assetLayout", () => {
  it("derives grid footprint from aspect ratio, scale, and rotation", () => {
    expect(getAssetGridSize(16 / 9)).toEqual({ width: 2, depth: 1 });
    expect(getAssetGridSize(9 / 16)).toEqual({ width: 1, depth: 2 });
    expect(getAssetGridSize(16 / 9, 2, 90)).toEqual({ width: 2, depth: 4 });
  });

  it("finds the first free space after occupied cells", () => {
    const existing = [
      asset({ id: "a", x: 0, y: 0, width: 2, depth: 1 }),
      asset({ id: "b", x: 2, y: 0, width: 1, depth: 1 }),
    ];

    expect(findFreeAssetSpace(4, existing, 2, 1)).toEqual({ x: 0, y: 1 });
  });

  it("lays out larger assets first without overlap", () => {
    const placed = layoutAssetsByArea(4, [
      asset({ id: "small", width: 1, depth: 1 }),
      asset({ id: "large", width: 2, depth: 2 }),
      asset({ id: "wide", width: 2, depth: 1 }),
    ]);

    expect(placed.map((item) => item.id)).toEqual(["large", "wide", "small"]);
    expect(placed.map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
    ]);
  });
});
