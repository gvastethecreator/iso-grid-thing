import { describe, expect, it } from "vitest";
import { createGridProjection } from "./projection";

const baseInput = {
  width: 10,
  depth: 8,
  padding: 40,
  gridGap: 0,
  assets: [],
  containerSize: { width: 1000, height: 800 },
  camera: { rot: 0, proj: 50 },
} as const;

describe("createGridProjection", () => {
  it("round-trips 2d coordinates through projected points", () => {
    const projection = createGridProjection({ ...baseInput, viewMode: "2d" });
    const projected = projection.toIso(3, 4);
    const restored = projection.fromIsoPoint(projected.x, projected.y);

    expect(restored.x).toBeCloseTo(3);
    expect(restored.y).toBeCloseTo(4);
  });

  it("round-trips isometric coordinates with rotation and gap", () => {
    const projection = createGridProjection({
      ...baseInput,
      viewMode: "iso",
      gridGap: 0.2,
      camera: { rot: 30, proj: 60 },
    });
    const projected = projection.toIso(3 * 1.2, 4 * 1.2);
    const restored = projection.fromIsoPoint(projected.x, projected.y);

    expect(restored.x).toBeCloseTo(3);
    expect(restored.y).toBeCloseTo(4);
  });

  it("expands bounds for assets outside the base grid", () => {
    const withoutAsset = createGridProjection({ ...baseInput, viewMode: "iso" });
    const withAsset = createGridProjection({
      ...baseInput,
      viewMode: "iso",
      assets: [
        {
          id: "a",
          type: "image",
          src: "blob:test",
          width: 4,
          depth: 2,
          x: 10,
          y: 0,
          aspectRatio: 2,
          scale: 1,
        },
      ],
    });

    expect(withAsset.scale).toBeLessThan(withoutAsset.scale);
  });

  it("returns a 2d asset matrix without skew terms", () => {
    const projection = createGridProjection({ ...baseInput, viewMode: "2d" });

    expect(projection.getAssetMatrix().b).toBe(0);
    expect(projection.getAssetMatrix().c).toBe(0);
    expect(projection.getAssetMatrix().a).toBeGreaterThan(0);
    expect(projection.getAssetMatrix().d).toBeGreaterThan(0);
  });
});
