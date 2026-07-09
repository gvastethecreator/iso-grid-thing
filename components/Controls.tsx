
import React, { ReactNode, useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

const COLOR_SWATCHES = [
    '#000000', '#18181b', '#52525b', '#ffffff',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#6366f1', '#ec4899',
];

const normalizeHex = (value: string) => {
    const raw = value.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(raw)) {
        return `#${raw.split('').map(char => `${char}${char}`).join('')}`.toLowerCase();
    }
    if (/^[0-9a-fA-F]{6}$/.test(raw)) {
        return `#${raw}`.toLowerCase();
    }
    return null;
};

const hexToRgb = (value: string) => {
    const hex = normalizeHex(value);
    if (!hex) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
};

const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (channel: number) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

interface ControlProps {
  label: string;
  icon: ReactNode;
}

interface SliderProps extends ControlProps {
  value: number;
  onChange: (value: number) => void;
  onSlideStart?: () => void;
  onSlideEnd?: () => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const ControlSlider: React.FC<SliderProps> = ({ label, icon, value, onChange, onSlideStart, onSlideEnd, min = 1, max = 50, step = 1, unit = '' }) => {
    const safeValue = isNaN(value) ? min : value;
    
    return (
        <div className="mb-3">
             <div className="flex justify-between items-center mb-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 select-none">
                    {icon} {label}
                </label>
                <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-1.5 py-0.5 rounded-sm border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                    {safeValue}{unit}
                </span>
             </div>
             <div className="relative pt-1 pb-1">
                 <input 
                     type="range"
                     min={min}
                     max={max}
                     step={step}
                     value={safeValue}
                     onChange={(e) => onChange(parseFloat(e.target.value))}
                     onMouseDown={() => onSlideStart?.()}
                     onMouseUp={() => onSlideEnd?.()}
                     onTouchStart={() => onSlideStart?.()}
                     onTouchEnd={() => onSlideEnd?.()}
                     className="w-full h-2 bg-black rounded-lg cursor-pointer border border-white/5 shadow-inner"
                     style={{
                        accentColor: '#6366f1' // Optional: mostly for older browsers, Tailwind handles custom thumbs if needed, but accentColor is a quick fix.
                     }}
                 />
             </div>
        </div>
    );
};

interface ColorProps extends ControlProps {
    value: string;
    onChange: (value: string) => void;
    onInteractionStart?: () => void;
}

export const ControlColor: React.FC<ColorProps> = ({ label, icon, value, onChange, onInteractionStart }) => {
    const [displayPicker, setDisplayPicker] = useState(false);
    const [draftValue, setDraftValue] = useState(value);
    const rgb = hexToRgb(value);

    useEffect(() => {
        setDraftValue(value);
    }, [value]);
    
    const handleOpen = () => {
        if (onInteractionStart) onInteractionStart();
        setDisplayPicker(true);
    };

    const handleClose = () => {
        setDisplayPicker(false);
    };

    const handleHexChange = (nextValue: string) => {
        setDraftValue(nextValue);
        const normalized = normalizeHex(nextValue);
        if (normalized) onChange(normalized);
    };

    const handleHexBlur = () => {
        setDraftValue(normalizeHex(draftValue) || value);
    };

    const handleRgbChange = (channel: 'r' | 'g' | 'b', channelValue: number) => {
        onChange(rgbToHex(
            channel === 'r' ? channelValue : rgb.r,
            channel === 'g' ? channelValue : rgb.g,
            channel === 'b' ? channelValue : rgb.b,
        ));
    };

    const popover: React.CSSProperties = { position: 'absolute', zIndex: 100, right: 0, top: '30px' };
    const cover: React.CSSProperties = { position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' };

    return (
        <div className="flex justify-between items-center mb-2 relative">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 select-none">
                {icon}{label}
            </label>
            <div className="flex items-center gap-2 bg-black/20 p-1 rounded-sm border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                <input 
                    type="text" 
                    value={draftValue}
                    onChange={e => handleHexChange(e.target.value)}
                    onBlur={handleHexBlur}
                    className="w-16 bg-transparent p-0.5 font-mono text-[10px] text-center text-zinc-300 outline-none uppercase"
                    aria-label={`${label} hex value`}
                />
                <button 
                    type="button" 
                    onClick={handleOpen} 
                    className="w-6 h-6 rounded-sm border border-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform" 
                    style={{ background: value }}
                    aria-label={`Change color for ${label}`}
                />
            </div>
            { displayPicker && (
                <div style={popover}>
                    <div style={cover} onClick={handleClose}/>
                    <div className="w-56 bg-zinc-900 p-3 rounded-sm border border-white/10 shadow-2xl relative z-50">
                        <div className="grid grid-cols-6 gap-1.5 mb-3">
                            {COLOR_SWATCHES.map((swatch) => (
                                <button
                                    key={swatch}
                                    type="button"
                                    onClick={() => onChange(swatch)}
                                    className={`h-6 rounded-sm border transition-transform hover:scale-110 ${normalizeHex(value) === swatch ? 'border-white' : 'border-black/40'}`}
                                    style={{ backgroundColor: swatch }}
                                    aria-label={`Set ${label} to ${swatch}`}
                                />
                            ))}
                        </div>
                        {(['r', 'g', 'b'] as const).map((channel) => (
                            <label key={channel} className="grid grid-cols-[14px_1fr_32px] items-center gap-2 text-[10px] font-mono uppercase text-zinc-500 mb-2">
                                <span>{channel}</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={255}
                                    value={rgb[channel]}
                                    onChange={(event) => handleRgbChange(channel, Number(event.target.value))}
                                    className="w-full"
                                    aria-label={`${label} ${channel} channel`}
                                />
                                <span className="text-right text-zinc-400">{rgb[channel]}</span>
                            </label>
                        ))}
                        <div className="mt-3 h-8 rounded-sm border border-black/40 shadow-inner" style={{ backgroundColor: normalizeHex(value) || '#000000' }} />
                    </div>
                </div> 
            )}
        </div>
    );
};

interface ToggleProps extends ControlProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, icon, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer mb-2 select-none p-1 rounded-sm hover:bg-white/5 transition-colors">
      <span className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          {icon}{label}
      </span>
      <div className="relative">
        <input 
            type="checkbox" 
            className="sr-only" 
            checked={checked} 
            onChange={(e) => onChange(e.target.checked)} 
        />
        {/* Track */}
        <div className={`block w-10 h-5 rounded-sm transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),inset_0_0_2px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.05)] ${checked ? 'bg-indigo-900/60' : 'bg-zinc-900'}`}></div>
        
        {/* Thumb */}
        <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] 
            bg-gradient-to-b from-zinc-200 to-zinc-400
            shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_white]
            border border-black/20
            ${checked ? 'translate-x-5 from-indigo-200 to-indigo-400' : ''}`}
        ></div>
      </div>
    </label>
);

interface SegmentedControlProps<T extends string> {
    options: { label: string; value: T; icon?: ReactNode }[];
    value: T;
    onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
    return (
        <div className="flex bg-black/40 p-0.5 rounded-sm border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
            {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-semibold transition-all rounded-sm select-none ${
                            isActive 
                                ? 'bg-zinc-700 text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]' 
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

interface SectionProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<SectionProps> = ({ title: label, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="mb-2 bg-black/20 rounded-sm border border-white/5 overflow-hidden">
            <button 
                className="w-full flex justify-between items-center text-xs font-bold text-zinc-300 hover:text-white transition-colors py-1.5 px-2 bg-white/5 hover:bg-white/10" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-2 select-none drop-shadow-sm">{icon}{label}</span>
                <ChevronUp className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} 
            >
                <div className="overflow-hidden">
                    <div className="p-2 border-t border-black/20 shadow-[inset_0_4px_6px_rgba(0,0,0,0.2)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
