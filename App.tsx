
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { GridParams, ViewState } from './types';
import IsometricGrid from './components/IsometricGrid';
import FloatingPanel from './components/panels/FloatingPanel';
import Header from './components/Header';
import { ZoomControls } from './components/ZoomControls';
import { useHistory } from './hooks/useHistory';

// Panels
import GridSettingsPanel from './components/panels/GridSettingsPanel';
import StylingPanel from './components/panels/StylingPanel';
import AssetsPanel from './components/panels/AssetsPanel';
import AssetTimeline from './components/panels/AssetTimeline';
import { revokeAssetObjectUrls } from './lib/assetUrls';
import { renderSvgToPngDataUrl, serializeSvgElement, triggerDownload } from './lib/svgExport';
import { parseWorkspaceJson, serializeWorkspace } from './lib/workspaceFile';

const DEFAULT_GRID_PARAMS: GridParams = {
  viewMode: 'iso',
  width: 10, depth: 10, gridGap: 0, projectionAngle: 50, gridRotation: 0, lineThickness: 1, lineStyle: 'solid', padding: 40,
  lineColor: '#52525b', lineOpacity: 1, fillColor: '#18181b', fillOpacity: 1, fillEnabled: true, backgroundColor: '#000000',
  assets: [],
  backgroundGrid: { enabled: true, opacity: 0.1, extension: 5, },
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
    canRedo 
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
              ...(rawGridParams?.backgroundGrid || {}) 
          }
      };
  }, [rawGridParams]);

  // --- Safe Update Handlers ---
  // These wrappers ensure that Partial updates from children are merged correctly
  // instead of replacing the entire state object in the history hook.
  
  const handleParamChange = useCallback((updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => {
      setGridParams(prev => {
          const u = typeof updates === 'function' ? updates(prev) : updates;
          return { ...prev, ...u };
      });
  }, [setGridParams]);

  const handleParamChangeEphemeral = useCallback((updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => {
      setGridParamsEphemeral(prev => {
          const u = typeof updates === 'function' ? updates(prev) : updates;
          return { ...prev, ...u };
      });
  }, [setGridParamsEphemeral]);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
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

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const isMeta = e.ctrlKey || e.metaKey;

      if (isMeta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
           redo();
        } else {
           undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  
  const handleZoomReset = () => {
      viewStateRef.current = { offset: { x: 0, y: 0 }, zoom: 1 };
      handleViewChange({ ...viewStateRef.current });
  };

  // --- Export/Import Logic ---
  const handleExport = useCallback(async (format: 'png') => {
      if (format !== 'png') return;

      const svgElement = svgGridRef.current;
      const container = gridContainerRef.current;
      if (!svgElement || !container) return;

      const svgString = serializeSvgElement(svgElement, {
          width: container.clientWidth,
          height: container.clientHeight,
          removeSelectors: ['#preview-group', '#selection-highlight-group'],
      });

      const pngUrl = await renderSvgToPngDataUrl({
          svgString,
          width: container.clientWidth,
          height: container.clientHeight,
          backgroundColor: gridParams.backgroundColor,
          scale: 2,
      });

      if (pngUrl) triggerDownload(pngUrl, 'iso-grid-thing.png');
  }, [gridParams.backgroundColor]);

  const handleSaveJson = useCallback(() => {
    const blob = new Blob([serializeWorkspace(gridParams)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'iso-grid-thing-state.json');
    URL.revokeObjectURL(url);
  }, [gridParams]);
  
  const handleLoadJson = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result;
          const parsed = parseWorkspaceJson(typeof text === 'string' ? text : '', DEFAULT_GRID_PARAMS);
          if (parsed.ok && parsed.value) {
              revokeAssetObjectUrls(gridParams.assets);
              saveSnapshot();
              handleParamChange(parsed.value);
          } else {
              alert(parsed.error || 'Invalid grid state file.');
          }
          if (jsonInputRef.current) jsonInputRef.current.value = '';
      };
      reader.readAsText(file);
  }, [gridParams.assets, handleParamChange, saveSnapshot]);
  
  const handleResetWorkspace = useCallback(() => {
    if (window.confirm("Are you sure you want to completely reset the workspace? All assets and settings will be lost.")) {
      revokeAssetObjectUrls(gridParams.assets);
      saveSnapshot();
      setGridParams(DEFAULT_GRID_PARAMS);
      setSelectedAssetId(null);
      handleZoomReset();
    }
  }, [gridParams.assets, saveSnapshot, setGridParams, handleZoomReset]);

  return (
    <div className="flex h-screen w-screen bg-black text-zinc-300 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200 relative flex-col">
      <Header 
        onReset={handleResetWorkspace}
        onExportJson={handleSaveJson}
        onLoadJson={handleLoadJson}
        onExportPng={() => handleExport('png')}
        fileInputRef={jsonInputRef}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <aside className="w-[280px] flex-shrink-0 bg-zinc-950/80 border-r border-white/5 flex flex-col pt-3 px-3 overflow-y-auto no-scrollbar z-20">
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
        <main className="flex-1 relative z-0">
          {/* Background Vignette */}
          <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <div ref={gridContainerRef} id="grid-aspect-container" className="relative w-full h-full">
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
          <div className="absolute bottom-10 left-6 z-20">
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
                 is2D={gridParams.viewMode === '2d'}
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
        <aside className="w-[280px] flex-shrink-0 bg-zinc-950/80 border-l border-white/5 flex flex-col pt-3 px-3 overflow-y-auto no-scrollbar z-20">
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
    </div>
  );
};

export default App;
