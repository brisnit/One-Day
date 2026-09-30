"use client";

/**
 * Downscale a logo so it doesn't bloat every donor page load.
 * Phone photos / print-res PNGs can be several MB; logos render at ~60px tall.
 */
export async function compressLogo(file: File): Promise<string> {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  if (file.type === "image/svg+xml" && original.length < 200_000) return original;
  return downscaleDataUrl(original);
}

export async function downscaleDataUrl(original: string, max = 600): Promise<string> {
  const img = new Image();
  img.src = original;
  try {
    await img.decode();
  } catch {
    return original;
  }
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  // WebP keeps transparency and is far smaller; browsers that can't encode it
  // hand back PNG instead.
  const out = canvas.toDataURL("image/webp", 0.9);
  return out.length < original.length ? out : original;
}
