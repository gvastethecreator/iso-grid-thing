
import React from 'react';
import { Hexagon, RotateCcw, Download, Upload, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onExportJson: () => void;
  onLoadJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportPng: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const Header: React.FC<HeaderProps> = ({ onReset, onExportJson, onLoadJson, onExportPng, fileInputRef }) => {
  const btnClass = "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-white/5 rounded hover:text-zinc-100 hover:bg-zinc-800 transition-colors";

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-zinc-950/90 border-b border-white/5 z-30 select-none">
      <div className="flex items-center gap-2">
        <div className="p-1.5 border border-white/5 shadow-inner bg-gradient-to-br from-indigo-500/20 to-indigo-900/40 rounded-sm">
             <Hexagon className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">Iso Grid Thing</h1>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded">v1.0</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={onReset} className={btnClass} title="Reset Workspace">
          <RotateCcw size={14} /> Reset
        </button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Load JSON">
          <Upload size={14} /> Load
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onLoadJson} 
            accept=".json" 
            className="hidden" 
        />
        <button onClick={onExportJson} className={btnClass} title="Export JSON">
          <Download size={14} /> Save
        </button>
        <button onClick={onExportPng} className={`${btnClass} !text-indigo-400 !border-indigo-500/20 hover:!bg-indigo-500/10`} title="Export PNG">
          <ImageIcon size={14} /> PNG
        </button>
      </div>
    </header>
  );
};

export default Header;
