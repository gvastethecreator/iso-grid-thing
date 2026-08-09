import React, {
  useRef,
  useEffect,
  forwardRef,
  useState,
  useMemo,
  useImperativeHandle,
  memo,
  useCallback,
} from "react";
import { gsap } from "gsap";
import type { GridParams, ViewState } from "../types";
import {
  buildBackgroundGridPaths,
  buildFillPath,
  buildMainGridLinePaths,
  buildPreviewGuidePath,
  getStrokeStyle,
  polygonPath,
} from "../lib/gridPaths";
import { createGridProjection } from "../lib/projection";

interface IsometricGridProps extends Omit<GridParams, "viewState"> {
  onParamsChange: (newParams: Partial<GridParams>) => void;
  onParamsChangeComplete?: (newParams: Partial<GridParams>) => void;
  onInteractionStart?: () => void;
  onAssetSelect: (id: string | null) => void;
  selectedAssetId?: string | null;
  onViewChange?: (view: ViewState) => void;
  viewStateRefExternal?: React.MutableRefObject<ViewState>;
  zoom?: number;
  activeTool?: "paint" | "text" | null;
}

const ANIM_DURATION = 0.6;
const ANIM_EASE = "power3.inOut";

const IsometricGrid = forwardRef<SVGSVGElement, IsometricGridProps>((props, ref) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => internalSvgRef.current!);

  // Internal view state if external is not provided
  const internalViewStateRef = useRef<ViewState>({ offset: { x: 0, y: 0 }, zoom: 1 });
  const viewStateRef = props.viewStateRefExternal || internalViewStateRef;

  const panState = useRef({ isPanning: false, start: { x: 0, y: 0 } });

  const dragState = useRef<{
    type: "asset";
    id: string;
    element: SVGElement;
    finalGridPos: { x: number; y: number };
    moved: boolean;
    dragOffset?: { x: number; y: number };
  } | null>(null);

  const groupRef = useRef<SVGGElement>(null);
  const viewGroupRef = useRef<SVGGElement>(null);
  const previewGroupRef = useRef<SVGGElement>(null);
  const bgGridGroupRef = useRef<SVGGElement>(null);
  const mainGridLinesGroupRef = useRef<SVGGElement>(null);
  const fillGroupRef = useRef<SVGGElement>(null);
  const selectionHighlightGroupRef = useRef<SVGGElement>(null);

  // Smooth Camera State
  const [camera, setCamera] = useState({
    rot: props.gridRotation || 0,
    proj: props.projectionAngle || 50,
  });
  const cameraProxy = useRef({ rot: props.gridRotation || 0, proj: props.projectionAngle || 50 });

  useEffect(() => {
    if (typeof gsap === "undefined") return;
    const tween = gsap.to(cameraProxy.current, {
      rot: props.gridRotation || 0,
      proj: props.projectionAngle || 50,
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
      onUpdate: () => setCamera({ ...cameraProxy.current }),
    });
    return () => {
      tween.kill();
    };
  }, [props.gridRotation, props.projectionAngle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const projection = useMemo(
    () =>
      createGridProjection({
        width: props.width,
        depth: props.depth,
        padding: props.padding,
        viewMode: props.viewMode,
        gridGap: props.gridGap || 0,
        assets: props.assets || [],
        containerSize,
        camera,
      }),
    [
      props.width,
      props.depth,
      props.padding,
      props.viewMode,
      props.gridGap,
      props.assets,
      containerSize,
      camera,
    ],
  );
  const sortedAssets = useMemo(
    () => [...(props.assets || [])].sort((a, b) => a.x + a.y - (b.x + b.y)),
    [props.assets],
  );

  const fromScreenPoint = useCallback(
    (screenX: number, screenY: number) => {
      const svg = internalSvgRef.current;
      const groupCtm = groupRef.current?.getScreenCTM();
      if (!svg || !groupCtm) return { x: 0, y: 0 };

      const point = svg.createSVGPoint();
      point.x = screenX;
      point.y = screenY;

      const isoPoint = point.matrixTransform(groupCtm.inverse());
      return projection.fromIsoPoint(isoPoint.x, isoPoint.y);
    },
    [projection],
  );

  // Sync external zoom/pan changes
  useEffect(() => {
    if (typeof gsap === "undefined" || !viewGroupRef.current) return;
    const { offset, zoom } = viewStateRef.current;
    gsap.to(viewGroupRef.current, {
      attr: { transform: `translate(${offset.x}, ${offset.y}) scale(${zoom})` },
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
  }, [props.zoom, viewStateRef, props.viewMode]);

  // -- GSAP Animations (Grouped for readability) --
  useEffect(() => {
    if (typeof gsap === "undefined") return;
    const { translateX, translateY } = projection;
    gsap.to(groupRef.current, {
      attr: { transform: `translate(${translateX}, ${translateY})` },
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
    gsap.to(internalSvgRef.current, {
      backgroundColor: props.backgroundColor,
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
  }, [projection.translateX, projection.translateY, props.backgroundColor]);

  useEffect(() => {
    if (typeof gsap === "undefined" || !bgGridGroupRef.current?.children) return;
    const {
      backgroundGrid,
      lineColor,
      lineThickness,
      width,
      depth,
      gridGap,
      lineStyle = "solid",
    } = props;
    const strokeStyle = getStrokeStyle(lineStyle, lineThickness);

    gsap.to(bgGridGroupRef.current, {
      opacity: (props.lineOpacity ?? 1) * (backgroundGrid.enabled ? backgroundGrid.opacity : 0),
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
    gsap.set(bgGridGroupRef.current, {
      attr: {
        stroke: lineColor,
        "stroke-width": lineThickness,
        "stroke-dasharray": strokeStyle.dasharray,
        "stroke-linecap": strokeStyle.linecap,
      },
    });

    const paths = buildBackgroundGridPaths({
      width,
      depth,
      extension: backgroundGrid.extension,
      gridGap: gridGap || 0,
      projection,
    });

    if (bgGridGroupRef.current.children[0])
      gsap.set(bgGridGroupRef.current.children[0], { attr: { d: paths.primary } });
    if (bgGridGroupRef.current.children[1])
      gsap.set(bgGridGroupRef.current.children[1], { attr: { d: paths.secondary } });
  }, [
    props.backgroundGrid,
    props.lineColor,
    props.lineThickness,
    props.lineStyle,
    props.width,
    props.depth,
    props.gridGap,
    props.lineOpacity,
    projection,
  ]);

  useEffect(() => {
    if (typeof gsap === "undefined" || !fillGroupRef.current?.children) return;
    const { fillColor, width, depth, gridGap, fillEnabled, fillOpacity } = props;

    gsap.to(fillGroupRef.current, {
      opacity: (fillEnabled ?? true) ? (fillOpacity ?? 1) : 0,
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
    gsap.set(fillGroupRef.current, { attr: { fill: fillColor, stroke: fillColor } });

    const fillPathData = buildFillPath({ width, depth, gridGap: gridGap || 0, projection });

    const fillPath = fillGroupRef.current.children[0];
    if (fillPath) gsap.set(fillPath, { attr: { d: fillPathData } });
  }, [
    props.fillColor,
    props.fillEnabled,
    props.fillOpacity,
    props.width,
    props.depth,
    props.gridGap,
    projection,
  ]);

  useEffect(() => {
    if (typeof gsap === "undefined" || !mainGridLinesGroupRef.current?.children) return;
    const { lineColor, lineThickness, width, depth, gridGap, lineStyle = "solid" } = props;
    const strokeStyle = getStrokeStyle(lineStyle, lineThickness);

    gsap.to(mainGridLinesGroupRef.current, {
      opacity: props.lineOpacity ?? 1,
      duration: ANIM_DURATION,
      ease: ANIM_EASE,
    });
    gsap.set(mainGridLinesGroupRef.current, {
      attr: {
        stroke: lineColor,
        "stroke-width": lineThickness,
        "stroke-dasharray": strokeStyle.dasharray,
        "stroke-linecap": strokeStyle.linecap,
      },
    });

    const paths = buildMainGridLinePaths({ width, depth, gridGap: gridGap || 0, projection });

    if (mainGridLinesGroupRef.current.children[0])
      gsap.set(mainGridLinesGroupRef.current.children[0], { attr: { d: paths.primary } });
    if (mainGridLinesGroupRef.current.children[1])
      gsap.set(mainGridLinesGroupRef.current.children[1], { attr: { d: paths.secondary } });
  }, [
    props.lineColor,
    props.lineOpacity,
    props.lineThickness,
    props.lineStyle,
    props.width,
    props.depth,
    props.gridGap,
    projection,
  ]);

  useEffect(() => {
    const selectedAsset = (props.assets || []).find((a) => a.id === props.selectedAssetId);
    let highlightEl = selectionHighlightGroupRef.current?.children[0];

    let pathD = "";
    if (selectedAsset) {
      const gap = props.gridGap || 0;
      const sizeX = selectedAsset.width + (selectedAsset.width - 1) * gap;
      const sizeY = selectedAsset.depth + (selectedAsset.depth - 1) * gap;
      const pts = projection.getCellPoints(selectedAsset.x, selectedAsset.y, sizeX, sizeY);
      pathD = polygonPath(pts);
    }

    if (selectedAsset && highlightEl) {
      gsap.to(highlightEl, { autoAlpha: 1, duration: ANIM_DURATION, ease: ANIM_EASE });
      gsap.set(highlightEl, { attr: { d: pathD } });
    } else if (highlightEl) {
      gsap.to(highlightEl, { autoAlpha: 0, duration: 0.1 });
    }
  }, [props.assets, props.selectedAssetId, props.gridGap, projection]);

  useEffect(() => {
    if (typeof gsap === "undefined") return;
    const gap = props.gridGap || 0;
    const matrix = projection.getAssetMatrix();

    (props.assets || []).forEach((asset) => {
      const startPos = projection.toIso(asset.x * (1 + gap), asset.y * (1 + gap));

      const elWrap = internalSvgRef.current?.querySelector(`g[data-id="${asset.id}"]`);
      if (elWrap) {
        gsap.set(elWrap, { attr: { transform: `translate(${startPos.x}, ${startPos.y})` } });
      }

      const elMatrix = internalSvgRef.current?.querySelector(`g[data-matrix-id="${asset.id}"]`);
      if (elMatrix) {
        gsap.set(elMatrix, {
          attr: { transform: `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, 0, 0)` },
        });
      }
    });
  }, [props.assets, props.gridGap, projection]);

  const handleDragPointerDown = (type: "asset", id: string, e: React.PointerEvent) => {
    const element = e.currentTarget as SVGElement;
    let initialGridPos = { x: 0, y: 0 };
    if (type === "asset") {
      const a = (props.assets || []).find((ass) => ass.id === id);
      if (a) initialGridPos = { x: a.x, y: a.y };
      props.onAssetSelect(id);
    }

    // Calculate the initial pointer offset in relative grid coordinates.
    const startGridPos = fromScreenPoint(e.clientX, e.clientY);
    const dragOffset = {
      x: initialGridPos.x - startGridPos.x,
      y: initialGridPos.y - startGridPos.y,
    };

    props.onInteractionStart?.();
    dragState.current = {
      type,
      id,
      element,
      finalGridPos: initialGridPos,
      moved: false,
      dragOffset,
    };
    document.body.style.cursor = "grabbing";
  };

  const getCursor = useCallback(() => {
    return "grab";
  }, []);

  const interactionRef = useRef({ fromScreenPoint, projection, props });
  interactionRef.current = { fromScreenPoint, projection, props };

  useEffect(() => {
    let pendingEvent: PointerEvent | null = null;
    let animationFrame: number | null = null;

    const applyPointerMove = (e: PointerEvent) => {
      // 1. Handle Selection Drag
      if (dragState.current) {
        dragState.current.moved = true;
        const { element, type, id, dragOffset } = dragState.current;
        const {
          fromScreenPoint: screenToGrid,
          projection: activeProjection,
          props: activeProps,
        } = interactionRef.current;

        const newGridPos = screenToGrid(e.clientX, e.clientY);
        let gridX = Math.round(newGridPos.x + (dragOffset?.x || 0));
        let gridY = Math.round(newGridPos.y + (dragOffset?.y || 0));

        if (type === "asset") {
          const a_asset = (activeProps.assets || []).find((ass) => ass.id === id);
          if (a_asset) {
            const aw = Math.ceil(a_asset.width);
            const ad = Math.ceil(a_asset.depth);
            gridX = Math.max(0, Math.min(activeProps.width - aw, gridX));
            gridY = Math.max(0, Math.min(activeProps.depth - ad, gridY));
            dragState.current.finalGridPos = { x: gridX, y: gridY };

            const gap = activeProps.gridGap || 0;
            const startPos = activeProjection.toIso(gridX * (1 + gap), gridY * (1 + gap));
            gsap.set(element, { attr: { transform: `translate(${startPos.x}, ${startPos.y})` } });
          }
        }
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState.current) return;
      pendingEvent = event;
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        if (pendingEvent) applyPointerMove(pendingEvent);
        pendingEvent = null;
      });
    };

    const handlePointerUp = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      if (pendingEvent) applyPointerMove(pendingEvent);
      pendingEvent = null;

      // 1. Finish Selection Drag
      if (dragState.current) {
        const { type, id, finalGridPos, moved } = dragState.current;
        if (moved) {
          if (type === "asset") {
            const activeProps = interactionRef.current.props;
            const updatedAssets = (activeProps.assets || []).map((a) =>
              a.id === id ? { ...a, x: finalGridPos.x, y: finalGridPos.y } : a,
            );
            if (activeProps.onParamsChangeComplete) {
              activeProps.onParamsChangeComplete({ assets: updatedAssets });
            } else {
              activeProps.onParamsChange({ assets: updatedAssets });
            }
          }
        }
        dragState.current = null;
        document.body.style.cursor = "";
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [getCursor]);

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Panning
      if (panState.current.isPanning) {
        viewStateRef.current.offset = {
          x: e.clientX - panState.current.start.x,
          y: e.clientY - panState.current.start.y,
        };
        gsap.set(viewGroupRef.current, {
          attr: {
            transform: `translate(${viewStateRef.current.offset.x}, ${viewStateRef.current.offset.y}) scale(${viewStateRef.current.zoom})`,
          },
        });
        if (props.onViewChange) props.onViewChange({ ...viewStateRef.current });
        return;
      }

      const gridPos = fromScreenPoint(e.clientX, e.clientY);
      const gridX = Math.floor(gridPos.x);
      const gridY = Math.floor(gridPos.y);

      // Preview cursor
      if (props.activeTool === "paint" || props.activeTool === "text" || dragState.current) {
        let targetX = gridX;
        let targetY = gridY;
        let targetW = 1;
        let targetD = 1;

        if (dragState.current) {
          targetX = dragState.current.finalGridPos.x;
          targetY = dragState.current.finalGridPos.y;
          if (dragState.current.type === "asset") {
            const a = (props.assets || []).find((ass) => ass.id === dragState.current!.id);
            if (a) {
              targetW = a.width;
              targetD = a.depth;
            }
          }
        }

        const top = projection.getCellPoints(targetX, targetY, targetW, targetD);
        const d = polygonPath(top);

        const attrs = {
          d,
          fill: "none",
          stroke: "#a1a1aa",
          "stroke-dasharray": "4",
          "stroke-width": 1.5 / viewStateRef.current.zoom,
          opacity: 1,
          visibility: "visible",
        };
        const cellPreview = previewGroupRef.current?.children[0];
        if (cellPreview) gsap.set(cellPreview, { attr: attrs });

        const guidesD = buildPreviewGuidePath({
          targetX,
          targetY,
          targetWidth: targetW,
          targetDepth: targetD,
          gridWidth: props.width,
          gridDepth: props.depth,
          gridGap: props.gridGap || 0,
          projection,
        });
        const guidePreview = previewGroupRef.current?.children[1];
        if (guidePreview)
          gsap.set(guidePreview, {
            attr: {
              d: guidesD,
              stroke: "#ec4899",
              "stroke-dasharray": "4",
              "stroke-width": 1 / viewStateRef.current.zoom,
              fill: "none",
              opacity: 0.5,
              visibility: "visible",
            },
          });
      } else {
        const cellPreview = previewGroupRef.current?.children[0];
        const guidePreview = previewGroupRef.current?.children[1];
        if (cellPreview) gsap.set(cellPreview, { attr: { visibility: "hidden" } });
        if (guidePreview) gsap.set(guidePreview, { attr: { visibility: "hidden" } });
      }
    },
    [fromScreenPoint, projection, props, viewStateRef],
  );

  const handleContainerPointerLeave = useCallback(() => {
    if (panState.current.isPanning) {
      panState.current.isPanning = false;
      if (containerRef.current) containerRef.current!.style.cursor = getCursor();
    }
    const cellPreview = previewGroupRef.current?.children[0];
    if (cellPreview) gsap.set(cellPreview, { attr: { visibility: "hidden" } });
  }, [getCursor]);

  const handlePanPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest(".draggable-panel, .interactive-grid-element")) return;

      // Handle Pan
      panState.current = {
        isPanning: true,
        start: {
          x: e.clientX - viewStateRef.current.offset.x,
          y: e.clientY - viewStateRef.current.offset.y,
        },
      };
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
      if (props.onAssetSelect) props.onAssetSelect(null);
    },
    [props, viewStateRef],
  );

  const handlePanPointerUp = useCallback(() => {
    panState.current.isPanning = false;
    if (containerRef.current) containerRef.current.style.cursor = getCursor();
  }, [getCursor]);

  const onViewChange = props.onViewChange;
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = containerRef.current!.getBoundingClientRect();
      const activeView = viewStateRef.current;
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const zoomFactor = 1.1;
      const newZoom = e.deltaY < 0 ? activeView.zoom * zoomFactor : activeView.zoom / zoomFactor;
      const clampedZoom = Math.min(Math.max(newZoom, 0.1), 10); // Limit zoom
      const zoomRatio = clampedZoom / activeView.zoom;

      const newOffsetX = pointerX - (pointerX - activeView.offset.x) * zoomRatio;
      const newOffsetY = pointerY - (pointerY - activeView.offset.y) * zoomRatio;

      viewStateRef.current = { zoom: clampedZoom, offset: { x: newOffsetX, y: newOffsetY } };

      gsap.to(viewGroupRef.current, {
        duration: 0.1,
        ease: "power2.out",
        overwrite: "auto",
        attr: { transform: `translate(${newOffsetX}, ${newOffsetY}) scale(${clampedZoom})` },
      });

      onViewChange?.({ ...viewStateRef.current });
    },
    [onViewChange, viewStateRef],
  );

  useEffect(() => {
    if (containerRef.current && !panState.current.isPanning) {
      containerRef.current.style.cursor = getCursor();
    }
  }, [getCursor]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none overflow-hidden"
      onPointerDown={handlePanPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handlePanPointerUp}
      onPointerCancel={handlePanPointerUp}
      onPointerLeave={handleContainerPointerLeave}
      onWheel={handleWheel}
    >
      <svg
        ref={internalSvgRef}
        width="100%"
        height="100%"
        style={{ backgroundColor: props.backgroundColor }}
        aria-label="Interactive isometric grid canvas"
      >
        <title>Interactive isometric grid canvas</title>
        <g ref={viewGroupRef}>
          <g ref={groupRef}>
            <g
              ref={bgGridGroupRef}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            >
              <path key="bg-y-lines" />
              <path key="bg-x-lines" />
            </g>
            <g ref={fillGroupRef} strokeWidth="0.5">
              <path key="fill-cells" />
            </g>
            <g
              ref={mainGridLinesGroupRef}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            >
              <path key="main-y-lines" />
              <path key="main-x-lines" />
            </g>

            <g
              id="selection-highlight-group"
              ref={selectionHighlightGroupRef}
              style={{ pointerEvents: "none" }}
            >
              <path
                style={{ visibility: "hidden" }}
                fill="none"
                stroke="#6366f1"
                strokeWidth={3 / viewStateRef.current.zoom}
                strokeDasharray={`${6 / viewStateRef.current.zoom}`}
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* Assets Group */}
            <g id="assets-group">
              {sortedAssets.map((asset) => {
                const gap = props.gridGap || 0;
                const sizeX = asset.width + (asset.width - 1) * gap;
                const sizeY = asset.depth + (asset.depth - 1) * gap;
                const PIXEL_SCALE = 1000;
                const imgWUnscaled = sizeX * PIXEL_SCALE;
                const imgHUnscaled = sizeY * PIXEL_SCALE;
                const rx = (asset.borderRadius || 0) * (Math.min(imgWUnscaled, imgHUnscaled) / 100);

                const rot = asset.rotation || 0;
                const isRotVertical = rot === 90 || rot === 270;
                const imgW = (isRotVertical ? sizeY : sizeX) * PIXEL_SCALE;
                const imgH = (isRotVertical ? sizeX : sizeY) * PIXEL_SCALE;

                let innerTransform = "";
                if (rot !== 0) {
                  const dx = imgWUnscaled / 2 - imgW / 2;
                  const dy = imgHUnscaled / 2 - imgH / 2;
                  innerTransform = `translate(${dx}, ${dy}) rotate(${rot}, ${imgW / 2}, ${imgH / 2})`;
                }

                const strokeStyle = getStrokeStyle(props.lineStyle, props.lineThickness || 1);

                return (
                  <g
                    key={asset.id}
                    data-id={asset.id}
                    className="interactive-grid-element"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleDragPointerDown("asset", asset.id, e);
                    }}
                    style={{ cursor: "grab" }}
                  >
                    <defs>
                      <clipPath id={`clip-${asset.id}`}>
                        <rect
                          x="0"
                          y="0"
                          width={imgWUnscaled}
                          height={imgHUnscaled}
                          rx={rx}
                          ry={rx}
                        />
                      </clipPath>
                    </defs>

                    <g data-matrix-id={asset.id}>
                      {rx > 0 && (
                        <rect
                          x="0"
                          y="0"
                          width={imgWUnscaled}
                          height={imgHUnscaled}
                          fill={props.backgroundColor}
                          stroke="none"
                        />
                      )}

                      <g clipPath={`url(#clip-${asset.id})`}>
                        {(props.fillEnabled ?? true) && (
                          <rect
                            x="0"
                            y="0"
                            width={imgWUnscaled}
                            height={imgHUnscaled}
                            fill={props.fillColor}
                            style={{ opacity: props.fillOpacity ?? 1 }}
                            stroke="none"
                          />
                        )}
                        <rect
                          x="0"
                          y="0"
                          width={imgWUnscaled}
                          height={imgHUnscaled}
                          fill="none"
                          stroke={props.lineColor}
                          strokeWidth={props.lineThickness || 1}
                          strokeDasharray={strokeStyle.dasharray}
                          vectorEffect="non-scaling-stroke"
                          style={{ opacity: props.lineOpacity ?? 1 }}
                        />

                        <g transform={innerTransform}>
                          {asset.type === "image" ? (
                            <image
                              href={asset.src}
                              width={imgW}
                              height={imgH}
                              preserveAspectRatio={
                                asset.objectFit === "contain" ? "xMidYMid meet" : "xMidYMid slice"
                              }
                              style={{ pointerEvents: "none" }}
                            />
                          ) : (
                            <foreignObject
                              width={imgW}
                              height={imgH}
                              style={{ pointerEvents: "none" }}
                            >
                              <video
                                src={asset.src}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: asset.objectFit === "contain" ? "contain" : "cover",
                                  pointerEvents: "none",
                                }}
                              />
                            </foreignObject>
                          )}
                        </g>
                      </g>

                      {/* Invisible interaction layer matching cell boundaries exactly */}
                      <rect
                        x="0"
                        y="0"
                        width={imgWUnscaled}
                        height={imgHUnscaled}
                        rx={rx}
                        ry={rx}
                        fill="transparent"
                        style={{ pointerEvents: "all" }}
                      />
                    </g>
                  </g>
                );
              })}
            </g>
            <g id="preview-group" ref={previewGroupRef} style={{ pointerEvents: "none" }}>
              <path style={{ visibility: "hidden" }} />
              <path style={{ visibility: "hidden" }} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

const MemoizedIsometricGrid = memo(IsometricGrid);
MemoizedIsometricGrid.displayName = "IsometricGrid";

export default MemoizedIsometricGrid;
