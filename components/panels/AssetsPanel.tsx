import React from 'react';
import { Image, Video, LayoutGrid, Settings2, Trash2, Maximize, Minimize, Square } from 'lucide-react';
import { GridParams, PlayableAsset } from '../../types';
import SidebarPanel from './FloatingPanel';
import { ControlSlider, SegmentedControl } from '../Controls';
import { getAssetGridSize, layoutAssetsByArea } from '../../lib/assetLayout';
import { revokeAssetObjectUrls } from '../../lib/assetUrls';

interface AssetsPanelProps {
    params: GridParams;
    onParamsChange: (updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => void;
    onParamsChangeEphemeral?: (updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>)) => void;
    onInteractionStart?: () => void;
    selectedAssetId: string | null;
    onAssetSelect: (id: string | null) => void;
}

export default function AssetsPanel({ params, onParamsChange, onParamsChangeEphemeral, onInteractionStart, selectedAssetId, onAssetSelect }: AssetsPanelProps) {
    
    const removeAsset = (id: string) => {
        const removedAsset = (params.assets || []).find(a => a.id === id);
        if (removedAsset) revokeAssetObjectUrls([removedAsset]);
        onParamsChange((prev) => ({
             assets: (prev.assets || []).filter(a => a.id !== id)
        }));
        if (selectedAssetId === id) {
            onAssetSelect(null);
        }
    };

    const updateAssetProperty = <K extends keyof PlayableAsset>(id: string, key: K, value: PlayableAsset[K], ephemeral: boolean = false) => {
        const updater = (prev: GridParams) => ({
            assets: (prev.assets || []).map(a => {
                if (a.id === id) {
                    const updated = { ...a, [key]: value };
                    
                    if (key === 'scale') {
                         const size = getAssetGridSize(updated.aspectRatio, value as number, updated.rotation || 0);
                         updated.width = size.width;
                         updated.depth = size.depth;
                    } else if (key === 'rotation') {
                         const oldRot = a.rotation || 0;
                         const newRot = value as number;
                         const isOldVertical = oldRot === 90 || oldRot === 270;
                         const isNewVertical = newRot === 90 || newRot === 270;
                         if (isOldVertical !== isNewVertical) {
                             const temp = updated.width;
                             updated.width = updated.depth;
                             updated.depth = temp;
                         }
                    }
                    return updated;
                }
                return a;
            })
        });

        if (ephemeral && onParamsChangeEphemeral) {
            onParamsChangeEphemeral(updater);
        } else {
            onParamsChange(updater);
        }
    };

    const autoLayout = () => {
        onParamsChange((prev) => {
            return { assets: layoutAssetsByArea(prev.width, prev.assets || []) };
        });
    };

    const asset = (params.assets || []).find(a => a.id === selectedAssetId);

    return (
        <SidebarPanel title="Asset Properties" icon={<Settings2 size={16} />}>
            <div className="space-y-4">
                <button 
                    onClick={autoLayout}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white rounded-sm p-1.5 text-xs transition-colors"
                >
                    <LayoutGrid size={14} /> Auto-Layout All Assets
                </button>

                {!asset ? (
                    <div className="text-center text-zinc-500 text-xs py-8 border border-dashed border-zinc-800 rounded-sm">
                        No asset selected.<br/>Click an image from the timeline below to edit its properties.
                    </div>
                ) : (
                    <div className="bg-zinc-900 rounded border border-zinc-800 overflow-hidden">
                        <div className="flex justify-between items-center p-2 bg-zinc-950 border-b border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-300 text-xs overflow-hidden">
                                {asset.type === 'video' ? <Video size={12} className="text-pink-500 shrink-0" /> : <Image size={12} className="text-blue-500 shrink-0" />}
                                <span className="truncate">{asset.id}</span>
                            </div>
                            <button onClick={() => removeAsset(asset.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1" title="Delete Asset">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        
                        <div className="relative bg-black aspect-video flex items-center justify-center p-1 border-b border-zinc-800/50">
                            {asset.type === 'video' ? (
                                <video src={asset.src} className="max-w-full max-h-full object-contain pointer-events-none rounded-sm" />
                            ) : (
                                <img src={asset.src} alt="" className="max-w-full max-h-full object-contain pointer-events-none rounded-sm" />
                            )}
                        </div>
                        
                        <div className="p-3 space-y-4">
                            <ControlSlider 
                                icon={<Settings2 size={12} className="text-zinc-500"/>} 
                                label="Scale" 
                                value={asset.scale} 
                                onSlideStart={onInteractionStart}
                                onChange={(val) => updateAssetProperty(asset.id, 'scale', val, true)} 
                                min={0.5} max={10} step={0.1}
                            />
                            
                            <ControlSlider 
                                icon={<Square size={12} className="text-zinc-500"/>} 
                                label="Border Radius" 
                                value={asset.borderRadius || 0} 
                                onSlideStart={onInteractionStart}
                                onChange={(val) => updateAssetProperty(asset.id, 'borderRadius', val, true)} 
                                min={0} max={50} step={1} unit="%"
                            />
                            
                            <div className="px-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1.5 select-none">
                                    <LayoutGrid size={12} /> Fit Mode
                                </div>
                                <SegmentedControl<'cover' | 'contain'>
                                    options={[
                                        { label: 'Cover Cell', value: 'cover', icon: <Maximize size={10} /> },
                                        { label: 'Contain Object', value: 'contain', icon: <Minimize size={10} /> }
                                    ]}
                                    value={asset.objectFit || 'cover'}
                                    onChange={(val) => updateAssetProperty(asset.id, 'objectFit', val)}
                                />
                            </div>
                            
                            <div className="px-1 mt-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1.5 select-none">
                                    Isometric Rotation
                                </div>
                                <div className="grid grid-cols-4 gap-1 border border-white/5 bg-black/40 rounded p-1">
                                    {[0, 90, 180, 270].map(angle => (
                                        <button key={angle}
                                            onClick={() => updateAssetProperty(asset.id, 'rotation', angle)}
                                            className={`py-1.5 rounded text-[10px] font-bold transition-colors ${asset.rotation === angle || (!asset.rotation && angle === 0) ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                                        >
                                            {angle}°
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarPanel>
    );
}
