export interface SvgSerializationOptions {
  width: number;
  height: number;
  removeSelectors?: readonly string[];
}

export interface PngExportOptions {
  svgString: string;
  width: number;
  height: number;
  backgroundColor: string;
  scale?: number;
}

export function serializeSvgElement(svgElement: SVGSVGElement, options: SvgSerializationOptions) {
  const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;

  options.removeSelectors?.forEach((selector) => {
    clonedSvgElement.querySelector(selector)?.remove();
  });

  clonedSvgElement.setAttribute('width', options.width.toString());
  clonedSvgElement.setAttribute('height', options.height.toString());

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clonedSvgElement);
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return `<?xml version="1.0" standalone="no"?>\r\n${source}`;
}

export async function renderSvgToPngDataUrl(options: PngExportOptions) {
  const scale = options.scale ?? 2;
  const blob = new Blob([options.svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = options.width * scale;
    canvas.height = options.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function triggerDownload(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load SVG image for PNG export.'));
    image.src = src;
  });
}
