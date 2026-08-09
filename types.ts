export interface PlayableAsset {
  id: string;
  type: "image" | "video";
  src: string;
  width: number; // in grid cells
  depth: number; // in grid cells
  x: number;
  y: number;
  aspectRatio: number;
  scale: number;
  objectFit?: "cover" | "contain";
  rotation?: number;
  borderRadius?: number;
}

/**
 * Configuration for the extended background grid.
 */
export interface BackgroundGrid {
  /** Whether the background grid is visible. */
  enabled: boolean;
  /** Opacity of the background grid (0 to 1). */
  opacity: number;
  /** How many cells the background grid extends beyond the main grid. */
  extension: number;
}

/**
 * Main interface encapsulating the entire state of the isometric grid.
 */
export interface GridParams {
  /** View mode: classic isometric or 2d frontal */
  viewMode: "iso" | "2d";
  /** Grid width in number of cells. */
  width: number;
  /** Grid depth in number of cells. */
  depth: number;
  /** Gap between grid items in cells fraction. */
  gridGap: number;
  /** Projection angle (10 to 100). Affects visual "height". 50 is classic isometric. */
  projectionAngle: number;
  /** Isometric rotation angle of the whole grid */
  gridRotation?: number;
  /** Grid line thickness in pixels. */
  lineThickness: number;
  /** Grid line style */
  lineStyle?: "solid" | "dashed" | "dotted" | "pattern";
  /** Padding in pixels between grid and container edges. */
  padding: number;
  /** Grid line color. */
  lineColor: string;
  /** Grid line opacity (0 to 1). */
  lineOpacity?: number;
  /** Default fill color for grid cells. */
  fillColor: string;
  /** Opacity of the fill color (0 to 1). */
  fillOpacity?: number;
  /** Whether the grid cells should have a fill background. */
  fillEnabled?: boolean;
  /** Background color of the SVG canvas. */
  backgroundColor: string;
  /** Array of media assets to place on grid. */
  assets: PlayableAsset[];
  /** Background grid configuration. */
  backgroundGrid: BackgroundGrid;
}

/**
 * Represents the view state of the canvas (pan and zoom).
 */
export interface ViewState {
  /** Current pan offset. */
  offset: { x: number; y: number };
  /** Current zoom level. */
  zoom: number;
}
