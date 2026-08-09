import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { GridParams, ViewState } from "./types";
import IsometricGrid from "./components/IsometricGrid";
import Header from "./components/Header";
import { ZoomControls } from "./components/ZoomControls";
import { useHistory } from "./hooks/useHistory";

// Panels
import GridSettingsPanel from "./components/panels/GridSettingsPanel";
import StylingPanel from "./components/panels/StylingPanel";
import AssetsPanel from "./components/panels/AssetsPanel";
import AssetTimeline from "./components/panels/AssetTimeline";
import { revokeAssetObjectUrls } from "./lib/assetUrls";
import { renderSvgToPngDataUrl, serializeSvgElement, triggerDownload } from "./lib/svgExport";
import { parseWorkspaceJson, serializePortableWorkspace } from "./lib/workspaceFile";

const DEFAULT_GRID_PARAMS: GridParams = {
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

const App: React.FC = () => {
  // --- State Management ---
  const {
    state: rawGridParams,
    set: setGridParams,
    setEphemeral: setGridParamsEphemeral,
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<GridParams>(DEFAULT_GRID_PARAMS);

  // Defensive Sanitation: Ensure the gridParams object always has complete shape
  // This prevents crashes if partial updates previously corrupted the state
  const gridParams = useMemo(() => {
    return {
      ...DEFAULT_GRID_PARAMS,
      ...rawGridParams,
      // Ensure nested objects/arrays are safe and defined
      assets: rawGridParams?.assets || [],
      gridGap: rawGridParams?.gridGap || 0,
      gridRotation: rawGridParams?.gridRotation || 0,
      backgroundGrid: {
        ...DEFAULT_GRID_PARAMS.backgroundGrid,
        ...rawGridParams?.backgroundGrid,
      },
    };
  }, [rawGridParams]);

  // --- Safe Update Handlers ---
  // These wrappers ensure that Partial updates from children are merged correctly
  // instead of replacing the entire state object in the history hook.

  const handleParamChange = useCallback(
    (updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => {
      setGridParams((prev) => {
        const u = typeof updates === "function" ? updates(prev) : updates;
        return { ...prev, ...u };
      });
    },
    [setGridParams],
  );

  const handleParamChangeEphemeral = useCallback(
    (updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => {
      setGridParamsEphemeral((prev) => {
        const u = typeof updates === "function" ? updates(prev) : updates;
        return { ...prev, ...u };
      });
    },
    [setGridParamsEphemeral],
  );

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [openSidebar, setOpenSidebar] = useState<"settings" | "assets" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  // Track View State for Zoom UI
  const [currentZoom, setCurrentZoom] = useState(1);
  const viewStateRef = useRef<ViewState>({ offset: { x: 0, y: 0 }, zoom: 1 });

  // --- Refs ---
  const svgGridRef = useRef<SVGSVGElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const latestAssetsRef = useRef(gridParams.assets);

  useEffect(() => {
    latestAssetsRef.current = gridParams.assets;
  }, [gridParams.assets]);

  useEffect(() => {
    return () => revokeAssetObjectUrls(latestAssetsRef.current);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const closeSidebar = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSidebar(null);
    };
    window.addEventListener("keydown", closeSidebar);
    return () => window.removeEventListener("keydown", closeSidebar);
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches("input, textarea, select") || target.isContentEditable) return;

      const isMeta = e.ctrlKey || e.metaKey;

      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // --- Handlers ---

  const handleViewChange = useCallback((view: ViewState) => {
    setCurrentZoom(view.zoom);
  }, []);

  // Handle View Mode Change Effect to trigger reposition logic
  useEffect(() => {
    // Also reset pan and zoom when transitioning between 3D and 2D so that it recalcs center
    viewStateRef.current = { offset: { x: 0, y: 0 }, zoom: 1 };
    handleViewChange({ ...viewStateRef.current });
  }, [gridParams.viewMode, handleViewChange]);

  const handleZoomIn = () => {
    if (!viewStateRef.current) return;
    viewStateRef.current.zoom = Math.min(viewStateRef.current.zoom * 1.2, 10);
    handleViewChange({ ...viewStateRef.current });
  };

  const handleZoomOut = () => {
    if (!viewStateRef.current) return;
    viewStateRef.current.zoom = Math.max(viewStateRef.current.zoom / 1.2, 0.1);
    handleViewChange({ ...viewStateRef.current });
  };

  const handleZoomReset = useCallback(() => {
    viewStateRef.current = { offset: { x: 0, y: 0 }, zoom: 1 };
    handleViewChange({ ...viewStateRef.current });
  }, [handleViewChange]);

  // --- Export/Import Logic ---
  const handleExport = useCallback(
    async (format: "png") => {
      if (format !== "png") return;

      try {
        const svgElement = svgGridRef.current;
        const container = gridContainerRef.current;
        if (!svgElement || !container) throw new Error("The canvas is not ready yet.");

        const svgString = serializeSvgElement(svgElement, {
          width: container.clientWidth,
          height: container.clientHeight,
          removeSelectors: ["#preview-group", "#selection-highlight-group"],
        });

        const pngUrl = await renderSvgToPngDataUrl({
          svgString,
          width: container.clientWidth,
          height: container.clientHeight,
          backgroundColor: gridParams.backgroundColor,
          scale: 2,
        });

        if (!pngUrl) throw new Error("The browser could not render the PNG.");
        triggerDownload(pngUrl, "iso-grid-thing.png");
        setNotice({ tone: "success", message: "PNG exported." });
      } catch (error) {
        setNotice({
          tone: "error",
          message: error instanceof Error ? error.message : "PNG export failed.",
        });
      }
    },
    [gridParams.backgroundColor],
  );

  const handleSaveJson = useCallback(async () => {
    try {
      const workspaceJson = await serializePortableWorkspace(gridParams);
      const blob = new Blob([workspaceJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, "iso-grid-thing-state.json");
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ tone: "success", message: "Workspace and media saved." });
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Workspace export failed.",
      });
    }
  }, [gridParams]);

  const handleLoadJson = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        const parsed = parseWorkspaceJson(
          typeof text === "string" ? text : "",
          DEFAULT_GRID_PARAMS,
        );
        if (parsed.ok && parsed.value) {
          revokeAssetObjectUrls(gridParams.assets);
          saveSnapshot();
          handleParamChange(parsed.value);
          setNotice({ tone: "success", message: "Workspace loaded." });
        } else {
          setNotice({ tone: "error", message: parsed.error || "Invalid grid state file." });
        }
        if (jsonInputRef.current) jsonInputRef.current.value = "";
      };
      reader.onerror = () =>
        setNotice({ tone: "error", message: "The workspace file could not be read." });
      reader.readAsText(file);
    },
    [gridParams.assets, handleParamChange, saveSnapshot],
  );

  const handleResetWorkspace = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to completely reset the workspace? All assets and settings will be lost.",
      )
    ) {
      revokeAssetObjectUrls(gridParams.assets);
      saveSnapshot();
      setGridParams(DEFAULT_GRID_PARAMS);
      setSelectedAssetId(null);
      handleZoomReset();
      setNotice({ tone: "success", message: "Workspace reset." });
    }
  }, [gridParams.assets, saveSnapshot, setGridParams, handleZoomReset]);

  return (
    <div className="flex h-dvh w-screen bg-black text-zinc-300 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200 relative flex-col">
      <Header
        onReset={handleResetWorkspace}
        onExportJson={handleSaveJson}
        onLoadJson={handleLoadJson}
        onExportPng={() => handleExport("png")}
        fileInputRef={jsonInputRef}
        openSidebar={openSidebar}
        onToggleSettings={() =>
          setOpenSidebar((current) => (current === "settings" ? null : "settings"))
        }
        onToggleAssets={() => setOpenSidebar((current) => (current === "assets" ? null : "assets"))}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {openSidebar && (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] lg:hidden"
            aria-label="Close side panel"
            onClick={() => setOpenSidebar(null)}
          />
        )}
        {/* Left Sidebar */}
        <aside
          id="settings-sidebar"
          className={`absolute inset-y-0 left-0 z-30 flex w-[min(320px,calc(100vw-3rem))] flex-shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-zinc-950 px-3 pt-3 shadow-2xl transition-transform lg:static lg:z-20 lg:w-[280px] lg:translate-x-0 lg:bg-zinc-950/80 lg:shadow-none ${openSidebar === "settings" ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button
            type="button"
            className="mb-2 self-end px-2 py-1 text-xs text-zinc-400 hover:text-white lg:hidden"
            onClick={() => setOpenSidebar(null)}
          >
            Close
          </button>
          <GridSettingsPanel
            params={gridParams}
            onParamChange={handleParamChange}
            onParamChangeEphemeral={handleParamChangeEphemeral}
            onInteractionStart={saveSnapshot}
          />
          <StylingPanel
            params={gridParams}
            onParamChange={handleParamChange}
            onParamChangeEphemeral={handleParamChangeEphemeral}
            onInteractionStart={saveSnapshot}
          />
        </aside>

        {/* Central Canvas */}
        <main className="relative z-0 min-w-0 flex-1">
          {/* Background Vignette */}
          <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>

          <div className="relative w-full h-full flex items-center justify-center">
            <div
              ref={gridContainerRef}
              id="grid-aspect-container"
              className="relative w-full h-full"
            >
              <IsometricGrid
                ref={svgGridRef}
                {...gridParams}
                zoom={currentZoom}
                onParamsChange={handleParamChangeEphemeral}
                onParamsChangeComplete={handleParamChange}
                onInteractionStart={saveSnapshot}
                selectedAssetId={selectedAssetId}
                onAssetSelect={setSelectedAssetId}
                viewStateRefExternal={viewStateRef}
                onViewChange={handleViewChange}
              />
            </div>
          </div>

          {/* Top Center Controls (Undo/Redo) */}

          {/* Zoom Controls */}
          <div className="absolute bottom-28 left-3 z-20 lg:bottom-10 lg:left-6">
            <ZoomControls
              zoom={currentZoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleZoomReset}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              cameraRotation={gridParams.gridRotation || 0}
              onRotateCamera={(angle) => handleParamChangeEphemeral({ gridRotation: angle })}
              is2D={gridParams.viewMode === "2d"}
            />
          </div>

          {/* Asset Timeline Carousel */}
          <AssetTimeline
            params={gridParams}
            onParamsChange={handleParamChange}
            selectedAssetId={selectedAssetId}
            onAssetSelect={setSelectedAssetId}
          />
        </main>

        {/* Right Sidebar */}
        <aside
          id="assets-sidebar"
          className={`absolute inset-y-0 right-0 z-30 flex w-[min(320px,calc(100vw-3rem))] flex-shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-zinc-950 px-3 pt-3 shadow-2xl transition-transform lg:static lg:z-20 lg:w-[280px] lg:translate-x-0 lg:bg-zinc-950/80 lg:shadow-none ${openSidebar === "assets" ? "translate-x-0" : "translate-x-full"}`}
        >
          <button
            type="button"
            className="mb-2 self-start px-2 py-1 text-xs text-zinc-400 hover:text-white lg:hidden"
            onClick={() => setOpenSidebar(null)}
          >
            Close
          </button>
          <AssetsPanel
            params={gridParams}
            onParamsChange={handleParamChange}
            onParamsChangeEphemeral={handleParamChangeEphemeral}
            onInteractionStart={saveSnapshot}
            selectedAssetId={selectedAssetId}
            onAssetSelect={setSelectedAssetId}
          />
        </aside>
      </div>
      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`pointer-events-none absolute bottom-3 left-1/2 z-50 -translate-x-1/2 rounded border px-3 py-2 text-xs font-semibold shadow-xl ${notice.tone === "error" ? "border-red-500/40 bg-red-950/95 text-red-200" : "border-emerald-500/40 bg-emerald-950/95 text-emerald-200"}`}
        >
          {notice.message}
        </div>
      )}
    </div>
  );
};

export default App;
