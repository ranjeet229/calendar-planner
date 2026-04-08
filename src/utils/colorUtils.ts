/** Build a soft wash background from a solid accent (for range “in between”). */
export function accentSoftBackground(accentHex: string): string {
  const hex = accentHex.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return "color-mix(in srgb, #2563eb 18%, white)";
  }
  return `color-mix(in srgb, ${hex} 20%, white)`;
}

/**
 * Sample average color from an image URL (browser only).
 * Falls back if canvas is tainted or fails.
 */
export function sampleAverageColorFromImage(
  src: string,
  fallbackHex: string,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    const done = (hex: string) => resolve(hex);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          done(fallbackHex);
          return;
        }
        const w = 48;
        const h = 48;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4 * 3) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n += 1;
        }
        if (!n) {
          done(fallbackHex);
          return;
        }
        r = Math.round(r / n);
        g = Math.round(g / n);
        b = Math.round(b / n);
        const toHex = (v: number) => v.toString(16).padStart(2, "0");
        done(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
      } catch {
        done(fallbackHex);
      }
    };
    img.onerror = () => done(fallbackHex);
    img.src = src;
  });
}
