import React, { useState } from "react";
import {
  Grid3x3,
  Square,
  MoveHorizontal,
  MoveVertical,
  Milestone,
  Orbit,
  Scaling,
} from "lucide-react";
import FloatingPanel from "./FloatingPanel";
import { CollapsibleSection, ControlSlider, SegmentedControl } from "../Controls";
import type { GridParams } from "../../types";

const SIZES = { XS: 5, S: 10, M: 20, L: 30, XL: 40, XXL: 50 };
const ASPECT_RATIOS = [
  { group: "Square", options: ["1:1"] },
  { group: "Landscape", options: ["21:9", "16:9", "4:3", "3:2"] },
  { group: "Portrait", options: ["9:16", "3:4", "2:3"] },
  { group: "Flexible", options: ["5:4", "4:5"] },
];

const PROJECTION_PRESETS: Record<string, number> = {
  Isometric: 50,
  Military: 100,
  Cavalier: 75,
};

interface GridSettingsPanelProps {
  params: GridParams;
  onParamChange: (newParams: Partial<GridParams>) => void;
  onParamChangeEphemeral: (newParams: Partial<GridParams>) => void;
  onInteractionStart: () => void;
}

const GridSettingsPanel: React.FC<GridSettingsPanelProps> = ({
  params,
  onParamChange,
  onParamChangeEphemeral,
  onInteractionStart,
}) => {
  const [currentRatio, setCurrentRatio] = useState<string>("1:1");
  const [currentSize, setCurrentSize] = useState<keyof typeof SIZES>("M");

  const applyDimensions = (ratio: string, sizeName: keyof typeof SIZES) => {
    const sizeVal = SIZES[sizeName];
    const [wStr, dStr] = ratio.split(":");
    const wRatio = parseInt(wStr, 10);
    const dRatio = parseInt(dStr, 10);

    const maxRatio = Math.max(wRatio, dRatio);
    const newWidth = Math.max(1, Math.round((wRatio / maxRatio) * sizeVal));
    const newDepth = Math.max(1, Math.round((dRatio / maxRatio) * sizeVal));

    onParamChange({ width: newWidth, depth: newDepth });
  };

  const handleRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRatio = e.target.value;
    setCurrentRatio(newRatio);
    applyDimensions(newRatio, currentSize);
  };

  const handleSizeChange = (sizeName: keyof typeof SIZES) => {
    setCurrentSize(sizeName);
    applyDimensions(currentRatio, sizeName);
  };

  // Helper for buttons (discrete changes use commit immediately)
  const handlePresetClick = (newParams: Partial<GridParams>) => {
    onParamChange(newParams);
  };

  const handleDimensionChange = (axis: "width" | "depth", val: number) => {
    // Clamp logic for dimension reduction
    const newDim = Math.round(val);
    const newParams = { ...params, [axis]: newDim };

    onParamChangeEphemeral({ ...newParams });
  };

  const baseButtonClass =
    "tactile-surface py-1.5 px-2 rounded-sm text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 flex justify-center items-center";
  const toolButtonActive =
    "active text-indigo-400 !border-t-black/20 !border-b-white/10 !bg-zinc-950";

  const is2D = params.viewMode === "2d";

  return (
    <FloatingPanel title="Grid Layout" icon={<Grid3x3 size={15} />}>
      <div className="mb-4">
        <SegmentedControl<"iso" | "2d">
          options={[
            { label: "Isometric 3D", value: "iso" },
            { label: "Frontal 2D", value: "2d" },
          ]}
          value={params.viewMode || "iso"}
          onChange={(val) => onParamChange({ viewMode: val })}
        />
      </div>

      <CollapsibleSection
        title="Dimensions"
        icon={<Square size={12} className="text-zinc-500" />}
        defaultOpen
      >
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Scaling size={12} className="text-zinc-500 flex-shrink-0" />
            <select
              value={currentRatio}
              onChange={handleRatioChange}
              className="bg-zinc-950/50 border border-white/5 text-zinc-300 text-[10px] uppercase font-bold py-1 px-2 rounded-sm w-full outline-none focus:ring-1 focus:ring-indigo-500/50"
            >
              {ASPECT_RATIOS.map((category) => (
                <optgroup
                  key={category.group}
                  label={category.group}
                  className="bg-zinc-900 text-zinc-500"
                >
                  {category.options.map((opt) => (
                    <option key={opt} value={opt} className="text-zinc-300">
                      {opt}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-6 gap-1 mt-1">
            {(Object.keys(SIZES) as Array<keyof typeof SIZES>).map((sizeName) => (
              <button
                key={sizeName}
                onClick={() => handleSizeChange(sizeName)}
                className={`${baseButtonClass} ${currentSize === sizeName ? toolButtonActive : ""}`}
              >
                {sizeName}
              </button>
            ))}
          </div>
        </div>
        <ControlSlider
          icon={<MoveHorizontal size={12} className="text-zinc-500" />}
          label="Width (X)"
          value={params.width}
          onSlideStart={onInteractionStart}
          onChange={(val) => handleDimensionChange("width", val)}
          max={128}
        />
        <ControlSlider
          icon={<MoveVertical size={12} className="text-zinc-500" />}
          label="Depth (Y)"
          value={params.depth}
          onSlideStart={onInteractionStart}
          onChange={(val) => handleDimensionChange("depth", val)}
          max={128}
        />
        <ControlSlider
          icon={<Grid3x3 size={12} className="text-zinc-500" />}
          label="Grid Gap"
          value={params.gridGap || 0}
          onSlideStart={onInteractionStart}
          onChange={(val) => onParamChangeEphemeral({ gridGap: val })}
          min={0}
          max={2}
          step={0.1}
        />
      </CollapsibleSection>

      {!is2D && (
        <CollapsibleSection
          title="Projection"
          icon={<Milestone size={12} className="text-zinc-500" />}
          defaultOpen
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.entries(PROJECTION_PRESETS).map(([name, value]) => (
              <button
                key={name}
                onClick={() => handlePresetClick({ projectionAngle: value })}
                className={`${baseButtonClass} ${params.projectionAngle === value ? toolButtonActive : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
          <ControlSlider
            icon={<Orbit size={12} className="text-zinc-500" />}
            label="Angle"
            value={params.projectionAngle}
            onSlideStart={onInteractionStart}
            onChange={(val) => onParamChangeEphemeral({ projectionAngle: val })}
            min={10}
            max={100}
            unit="°"
          />
        </CollapsibleSection>
      )}
    </FloatingPanel>
  );
};

export default GridSettingsPanel;
