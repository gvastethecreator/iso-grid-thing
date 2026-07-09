import React from 'react';
import { Plus, Minus, RotateCcw, Undo2, Redo2 } from 'lucide-react';

interface ZoomControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    cameraRotation: number;
    onRotateCamera: (angle: number) => void;
    is2D?: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ 
    zoom, onZoomIn, onZoomOut, onReset, 
    onUndo, onRedo, canUndo, canRedo,
    cameraRotation, onRotateCamera,
    is2D 
}) => {
    
    // Tactile button class specifically for this control group
    const btnClass = `
        relative p-2.5 
        text-zinc-400 hover:text-zinc-100 
        transition-all duration-150
        active:translate-y-[1px]
        hover:bg-white/5
        flex items-center justify-center
    `;

    // Divider to look like a groove
    const divider = <div className="w-px h-6 bg-zinc-950 border-r border-white/10 mx-0.5"></div>;

    return (
        <div className="
            flex flex-col gap-2 
            bg-zinc-900/80 backdrop-blur-md 
            rounded-lg 
            border border-black/50 ring-1 ring-white/10
            shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
            p-1
        ">
            {/* Zoom, Undo, Redo, Reset Row */}
            <div className="flex items-center">
                <button onClick={onZoomOut} className={`${btnClass} rounded-l-md`} aria-label="Zoom Out">
                    <Minus size={14} className="drop-shadow-sm" />
                </button>
                
                {divider}
                
                <div className="
                    px-3 py-1 text-[10px] font-mono font-bold text-zinc-300 
                    bg-black/40 rounded mx-1
                    shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)]
                    border border-transparent
                    min-w-[48px] text-center select-none
                ">
                    {Math.round(zoom * 100)}%
                </div>
                
                {divider}

                <button onClick={onZoomIn} className={btnClass} aria-label="Zoom In">
                    <Plus size={14} className="drop-shadow-sm" />
                </button>
                
                {divider}
                
                {onUndo && (
                    <button onClick={onUndo} disabled={!canUndo} className={`${btnClass} ${!canUndo ? 'opacity-30' : ''}`} aria-label="Undo">
                        <Undo2 size={14} className="drop-shadow-sm" />
                    </button>
                )}
                {onRedo && (
                    <button onClick={onRedo} disabled={!canRedo} className={`${btnClass} ${!canRedo ? 'opacity-30' : ''}`} aria-label="Redo">
                        <Redo2 size={14} className="drop-shadow-sm" />
                    </button>
                )}

                {divider}

                <button onClick={onReset} className={`${btnClass} rounded-r-md text-indigo-400 hover:text-indigo-300`} aria-label="Reset View">
                    <RotateCcw size={14} className="drop-shadow-sm" />
                </button>
            </div>

            {/* Camera Rotation Row */}
            {!is2D && (
                <div className="flex items-center justify-between px-1.5 pb-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider select-none">Camera Rotation</span>
                    <div className="flex gap-1">
                        {[0, 90, 180, 270].map(angle => (
                            <button key={angle}
                                onClick={() => onRotateCamera(angle)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${cameraRotation === angle ? 'text-white bg-indigo-500/30 ring-1 ring-indigo-500/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                            >
                                {angle}°
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};