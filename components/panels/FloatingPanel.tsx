import React, { useState, ReactNode } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface FloatingPanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isInitiallyOpen?: boolean;
  width?: string;
  className?: string;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ title, icon, children, isInitiallyOpen = true, width, className = "" }) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  // Neo-Tactile Classes
  const panelClasses = `
    bg-zinc-900/80 backdrop-blur-xl 
    rounded-sm
    shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] 
    overflow-hidden 
    border border-black/50
    ring-1 ring-white/10
    group
    flex-shrink-0
    mb-2
    ${className}
  `;
  
  const panelStyle = {
    width: width || '100%',
    opacity: 1,
    viewTransitionName: `panel-${title.replace(/\s+/g, '-')}`
  } as React.CSSProperties;

  return (
    <div
      className={panelClasses}
      style={panelStyle}
    >
      <header
        className="
            flex items-center justify-between p-2 
            bg-gradient-to-b from-white/5 to-transparent
            border-b border-black/40
        "
      >
        <div className="flex items-center gap-2 text-zinc-100 select-none pl-1">
          <div className="text-indigo-400 drop-shadow-md">{icon}</div>
          <h3 className="font-semibold text-[11px] uppercase tracking-wider text-zinc-300 drop-shadow-sm">{title}</h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-colors"
          aria-label={isOpen ? 'Collapse Panel' : 'Expand Panel'}
        >
          <ChevronsUpDown size={14} />
        </button>
      </header>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out bg-zinc-900/30 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
            <div className="p-3">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingPanel;
