import React, { useRef } from "react";
import { Plus, Video } from "lucide-react";
import { GridParams, PlayableAsset } from "../../types";
import { findFreeAssetSpace, getAssetGridSize } from "../../lib/assetLayout";

interface AssetTimelineProps {
  params: GridParams;
  onParamsChange: (
    updates: Partial<GridParams> | ((prev: GridParams) => Partial<GridParams>),
  ) => void;
  selectedAssetId: string | null;
  onAssetSelect: (id: string | null) => void;
}

export default function AssetTimeline({
  params,
  onParamsChange,
  selectedAssetId,
  onAssetSelect,
}: AssetTimelineProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAsset = (src: string, type: "image" | "video", w: number, h: number) => {
    const aspectRatio = w / h;
    const size = getAssetGridSize(aspectRatio);

    onParamsChange((prev) => {
      const { x, y } = findFreeAssetSpace(prev.width, prev.assets || [], size.width, size.depth);

      const newAsset: PlayableAsset = {
        id: "asset_" + Math.random().toString(36).substring(2, 9),
        type,
        src,
        x,
        y,
        width: size.width,
        depth: size.depth,
        aspectRatio,
        scale: 1,
        objectFit: "cover",
      };

      return {
        assets: [...(prev.assets || []), newAsset],
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from<File>(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const url = URL.createObjectURL(file);

      if (isVideo) {
        const video = document.createElement("video");
        video.src = url;
        video.onloadedmetadata = () => {
          addAsset(url, "video", video.videoWidth, video.videoHeight);
        };
        video.onerror = () => URL.revokeObjectURL(url);
      } else {
        const img = new globalThis.Image();
        img.src = url;
        img.onload = () => {
          addAsset(url, "image", img.width, img.height);
        };
        img.onerror = () => URL.revokeObjectURL(url);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="absolute bottom-3 left-1/2 z-20 flex w-auto max-w-[calc(100%-1rem)] -translate-x-1/2 gap-3 overflow-x-auto rounded-xl border border-white/5 bg-zinc-950/90 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md lg:bottom-10 lg:max-w-2xl">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        multiple
        onChange={handleFileUpload}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        aria-label="Add media"
        className="flex-shrink-0 w-[72px] h-[72px] bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-dashed border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shadow-inner"
        title="Add Media"
      >
        <Plus size={28} />
      </button>

      <div className="w-px bg-white/5 mx-1 my-2"></div>

      {(params.assets || []).map((asset) => (
        <button
          key={asset.id}
          onClick={() => onAssetSelect(asset.id)}
          aria-label={`Select ${asset.type} asset ${asset.id}`}
          className={`flex-shrink-0 w-[72px] h-[72px] bg-black rounded-lg overflow-hidden border-2 transition-all relative group cursor-pointer ${selectedAssetId === asset.id ? "border-indigo-500 ring-4 ring-indigo-500/20 scale-105" : "border-zinc-800 hover:border-zinc-500"}`}
        >
          {asset.type === "image" ? (
            <img
              src={asset.src}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <>
              <video
                src={asset.src}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Video size={18} className="text-pink-400 drop-shadow-md" />
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
