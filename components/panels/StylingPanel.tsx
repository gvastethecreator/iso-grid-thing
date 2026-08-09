import React from "react";
import {
  Palette,
  Baseline,
  Frame,
  PenLine,
  PaintBucket,
  Square,
  LayoutGrid,
  Contrast,
  Expand,
  GripHorizontal,
} from "lucide-react";
import FloatingPanel from "./FloatingPanel";
import { ControlSlider, ControlColor, Toggle, SegmentedControl } from "../Controls";
import type { GridParams } from "../../types";

interface StylingPanelProps {
  params: GridParams;
  onParamChange: (newParams: Partial<GridParams>) => void;
  onParamChangeEphemeral: (newParams: Partial<GridParams>) => void;
  onInteractionStart: () => void;
}

const StylingPanel: React.FC<StylingPanelProps> = ({
  params,
  onParamChange,
  onParamChangeEphemeral,
  onInteractionStart,
}) => {
  // Background Grid specific helpers
  const handleBgGridChange = (newValues: Partial<GridParams["backgroundGrid"]>) => {
    onParamChange({ backgroundGrid: { ...params.backgroundGrid, ...newValues } });
  };

  const handleBgGridChangeEphemeral = (newValues: Partial<GridParams["backgroundGrid"]>) => {
    onParamChangeEphemeral({ backgroundGrid: { ...params.backgroundGrid, ...newValues } });
  };

  return (
    <FloatingPanel title="Styling" icon={<Palette size={15} />}>
      <ControlSlider
        icon={<Baseline size={12} className="text-zinc-500" />}
        label="Line Thickness"
        value={params.lineThickness}
        onSlideStart={onInteractionStart}
        onChange={(val) => onParamChangeEphemeral({ lineThickness: val })}
        min={0}
        max={10}
        step={0.1}
        unit="px"
      />
      <ControlSlider
        icon={<Frame size={12} className="text-zinc-500" />}
        label="Padding"
        value={params.padding}
        onSlideStart={onInteractionStart}
        onChange={(val) => onParamChangeEphemeral({ padding: val })}
        min={0}
        max={200}
        unit="px"
      />
      <div className="px-1 mt-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1.5 select-none">
          <GripHorizontal size={12} /> Grid Stroke
        </div>
        <SegmentedControl<"solid" | "dashed" | "dotted" | "pattern">
          options={[
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
            { label: "Pattern", value: "pattern" },
          ]}
          value={params.lineStyle || "solid"}
          onChange={(val) => onParamChange({ lineStyle: val })}
        />
      </div>
      <div className="h-px bg-zinc-800 my-2 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>

      <ControlColor
        icon={<PenLine size={12} className="text-zinc-500" />}
        label="Line Color"
        value={params.lineColor}
        onInteractionStart={onInteractionStart}
        onChange={(val) => onParamChangeEphemeral({ lineColor: val })}
      />
      <ControlSlider
        icon={<Contrast size={12} className="text-zinc-500" />}
        label="Line Opacity"
        value={params.lineOpacity ?? 1}
        onSlideStart={onInteractionStart}
        onChange={(opacity) => onParamChangeEphemeral({ lineOpacity: opacity })}
        min={0}
        max={1}
        step={0.05}
      />

      <div className="h-px bg-zinc-800 my-2 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>

      <Toggle
        icon={<PaintBucket size={12} className="text-zinc-500" />}
        label="Fill Grid"
        checked={params.fillEnabled ?? true}
        onChange={(enabled) => {
          onParamChange({ fillEnabled: enabled });
        }}
      />

      {(params.fillEnabled ?? true) && (
        <>
          <ControlColor
            icon={<PaintBucket size={12} className="text-zinc-500" />}
            label="Fill Color"
            value={params.fillColor}
            onInteractionStart={onInteractionStart}
            onChange={(val) => onParamChangeEphemeral({ fillColor: val })}
          />
          <ControlSlider
            icon={<Contrast size={12} className="text-zinc-500" />}
            label="Fill Opacity"
            value={params.fillOpacity ?? 1}
            onSlideStart={onInteractionStart}
            onChange={(opacity) => onParamChangeEphemeral({ fillOpacity: opacity })}
            min={0}
            max={1}
            step={0.05}
          />
        </>
      )}

      <div className="h-px bg-zinc-800 my-2 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>

      <ControlColor
        icon={<Square size={12} className="text-zinc-500" />}
        label="Background"
        value={params.backgroundColor}
        onInteractionStart={onInteractionStart}
        onChange={(val) => onParamChangeEphemeral({ backgroundColor: val })}
      />

      <div className="h-px bg-zinc-800 my-2 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>

      <Toggle
        icon={<LayoutGrid size={12} className="text-zinc-500" />}
        label="Background Grid"
        checked={params.backgroundGrid.enabled}
        onChange={(enabled) => {
          handleBgGridChange({ enabled });
        }}
      />
      {params.backgroundGrid.enabled && (
        <>
          <ControlSlider
            icon={<Contrast size={12} className="text-zinc-500" />}
            label="Opacity"
            value={params.backgroundGrid.opacity}
            onSlideStart={onInteractionStart}
            onChange={(opacity) => handleBgGridChangeEphemeral({ opacity })}
            min={0}
            max={1}
            step={0.05}
          />
          <ControlSlider
            icon={<Expand size={12} className="text-zinc-500" />}
            label="Extension"
            value={params.backgroundGrid.extension}
            onSlideStart={onInteractionStart}
            onChange={(extension) => handleBgGridChangeEphemeral({ extension })}
            min={0}
            max={50}
          />
        </>
      )}
    </FloatingPanel>
  );
};

export default StylingPanel;
