import { describe, expect, it } from "vitest";
import type { GridParams } from "../types";
import { parseWorkspaceJson, serializeWorkspace } from "./workspaceFile";

const defaults: GridParams = {
  viewMode: "iso",
  width: 10,
  depth: 10,
  gridGap: 0,
  projectionAngle: 50,
  gridRotation: 0,
  lineThickness: 1,
  lineStyle: "solid",
  padding: 40,
  lineColor: "#52525b",
  lineOpacity: 1,
  fillColor: "#18181b",
  fillOpacity: 1,
  fillEnabled: true,
  backgroundColor: "#000000",
  assets: [],
  backgroundGrid: { enabled: true, opacity: 0.1, extension: 5 },
};

describe("workspaceFile", () => {
  it("serializes workspace state as readable JSON", () => {
    expect(serializeWorkspace(defaults)).toContain('"width": 10');
  });

  it("parses and fills missing optional workspace fields from defaults", () => {
    const result = parseWorkspaceJson('{"width":12,"depth":6}', defaults);

    expect(result.ok).toBe(true);
    expect(result.value?.width).toBe(12);
    expect(result.value?.backgroundGrid).toEqual(defaults.backgroundGrid);
    expect(result.value?.assets).toEqual([]);
  });

  it("rejects malformed JSON", () => {
    const result = parseWorkspaceJson("{bad json", defaults);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Error reading or parsing the file.");
  });

  it("rejects JSON without grid dimensions", () => {
    const result = parseWorkspaceJson('{"assets":[]}', defaults);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid grid state file.");
  });

  it("rejects dimensions outside the supported grid range", () => {
    expect(parseWorkspaceJson('{"width":0,"depth":10}', defaults).ok).toBe(false);
    expect(parseWorkspaceJson('{"width":129,"depth":10}', defaults).ok).toBe(false);
  });

  it("rejects malformed asset records before they reach the renderer", () => {
    const result = parseWorkspaceJson(
      '{"width":10,"depth":10,"assets":[{"id":"broken","type":"image"}]}',
      defaults,
    );

    expect(result.ok).toBe(false);
  });

  it("rejects unsafe asset URLs and invalid renderer options", () => {
    const unsafeAsset = {
      id: "unsafe",
      type: "image",
      src: "javascript:alert(1)",
      width: 1,
      depth: 1,
      x: 0,
      y: 0,
      aspectRatio: 1,
      scale: 1,
    };

    expect(
      parseWorkspaceJson(JSON.stringify({ width: 10, depth: 10, assets: [unsafeAsset] }), defaults)
        .ok,
    ).toBe(false);
    expect(parseWorkspaceJson('{"width":10,"depth":10,"lineOpacity":2}', defaults).ok).toBe(false);
  });
});
