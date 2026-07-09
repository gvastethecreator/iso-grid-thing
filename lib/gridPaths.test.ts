import { describe, expect, it } from 'vitest';
import { buildFillPath, buildMainGridLinePaths, getStrokeStyle, polygonPath } from './gridPaths';
import { createGridProjection } from './projection';

const projection = createGridProjection({
  width: 4,
  depth: 3,
  padding: 20,
  viewMode: 'iso',
  gridGap: 0,
  assets: [],
  containerSize: { width: 500, height: 400 },
  camera: { rot: 0, proj: 50 },
});

describe('gridPaths', () => {
  it('formats stroke styles in one place', () => {
    expect(getStrokeStyle('solid', 2)).toEqual({ dasharray: 'none', linecap: 'round' });
    expect(getStrokeStyle('dashed', 2)).toEqual({ dasharray: '12 8', linecap: 'square' });
    expect(getStrokeStyle('dotted', 2)).toEqual({ dasharray: '0.1 6', linecap: 'round' });
  });

  it('builds closed polygon path data', () => {
    expect(polygonPath([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }])).toBe('M 0 0 L 1 0 L 1 1 Z');
  });

  it('builds compact main grid paths when there is no gap', () => {
    const paths = buildMainGridLinePaths({ width: 4, depth: 3, gridGap: 0, projection });

    expect(paths.primary.match(/M /g)).toHaveLength(4);
    expect(paths.secondary.match(/M /g)).toHaveLength(5);
  });

  it('builds one fill polygon per cell when there is a gap', () => {
    const gapProjection = createGridProjection({
      width: 2,
      depth: 2,
      padding: 20,
      viewMode: 'iso',
      gridGap: 0.2,
      assets: [],
      containerSize: { width: 500, height: 400 },
      camera: { rot: 0, proj: 50 },
    });
    const fillPath = buildFillPath({ width: 2, depth: 2, gridGap: 0.2, projection: gapProjection });

    expect(fillPath.match(/ Z/g)).toHaveLength(4);
  });
});
