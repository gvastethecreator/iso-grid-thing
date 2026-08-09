import type { PlayableAsset } from "../types";

export function revokeAssetObjectUrls(assets: readonly PlayableAsset[]) {
  const urls = new Set(assets.map((asset) => asset.src).filter((src) => src.startsWith("blob:")));

  urls.forEach((url) => URL.revokeObjectURL(url));
}
