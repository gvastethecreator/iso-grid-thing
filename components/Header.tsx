import React from "react";
import {
  Download,
  Hexagon,
  Image as ImageIcon,
  Images,
  RotateCcw,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onExportJson: () => void;
  onLoadJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportPng: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openSidebar: "settings" | "assets" | null;
  onToggleSettings: () => void;
  onToggleAssets: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onReset,
  onExportJson,
  onLoadJson,
  onExportPng,
  fileInputRef,
  openSidebar,
  onToggleSettings,
  onToggleAssets,
}) => {
  const btnClass =
    "flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-white/5 rounded hover:text-zinc-100 hover:bg-zinc-800 transition-colors sm:px-3";

  return (
    <header className="z-40 flex flex-shrink-0 select-none items-center justify-between gap-2 border-b border-white/5 bg-zinc-950/90 px-2 py-1.5 sm:px-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 border border-white/5 shadow-inner bg-gradient-to-br from-indigo-500/20 to-indigo-900/40 rounded-sm">
          <Hexagon className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">
            Iso Grid Thing
          </h1>
          <span className="hidden text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded sm:inline">
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleSettings}
          className={`${btnClass} lg:hidden ${openSidebar === "settings" ? "!text-indigo-300" : ""}`}
          title="Grid settings"
          aria-controls="settings-sidebar"
          aria-expanded={openSidebar === "settings"}
        >
          <SlidersHorizontal size={14} />
          <span className="sr-only">Settings</span>
        </button>
        <button
          onClick={onToggleAssets}
          className={`${btnClass} lg:hidden ${openSidebar === "assets" ? "!text-indigo-300" : ""}`}
          title="Assets"
          aria-controls="assets-sidebar"
          aria-expanded={openSidebar === "assets"}
        >
          <Images size={14} />
          <span className="sr-only">Assets</span>
        </button>
        <button onClick={onReset} className={btnClass} title="Reset Workspace">
          <RotateCcw size={14} /> <span className="hidden xl:inline">Reset</span>
        </button>
        <div className="hidden w-px h-4 bg-white/10 mx-1 sm:block"></div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={btnClass}
          title="Load JSON"
        >
          <Upload size={14} /> <span className="hidden xl:inline">Load</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onLoadJson}
          accept=".json"
          className="hidden"
        />
        <button onClick={onExportJson} className={btnClass} title="Export JSON">
          <Download size={14} /> <span className="hidden xl:inline">Save</span>
        </button>
        <button
          onClick={onExportPng}
          className={`${btnClass} !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-500/10`}
          title="Export PNG"
        >
          <ImageIcon size={14} /> <span className="hidden sm:inline">PNG</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
