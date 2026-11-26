export interface PhotoAtmosphere {
  dominantRgb: string;
  glowRgb: string;
  luminance: number;
}

const DEFAULT_ATMOSPHERE: PhotoAtmosphere = {
  dominantRgb: '166, 18, 41',
  glowRgb: '230, 195, 126',
  luminance: 0.45,
};

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function extractPhotoAtmosphere(dataUrl: string): Promise<PhotoAtmosphere> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof document === 'undefined') {
      resolve(DEFAULT_ATMOSPHERE);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_ATMOSPHERE);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let totalWeight = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;

        let lumSum = 0;
        let lumCount = 0;

        let glowWeight = 0;
        let glowR = 0;
        let glowG = 0;
        let glowB = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 40) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const sat = max > 0 ? (max - min) / max : 0;

          lumSum += lum;
          lumCount++;

          // Prefer mid-to-rich colors from subject/backdrop rather than pure black/white extremes
          const midtoneFactor = 1 - Math.abs(lum - 0.5) * 0.7;
          const weight = (0.22 + sat * 1.9) * Math.max(0.2, midtoneFactor);
          sumR += r * weight;
          sumG += g * weight;
          sumB += b * weight;
          totalWeight += weight;

          if (lum > 0.35) {
            const gW = lum * (0.5 + sat);
            glowR += r * gW;
            glowG += g * gW;
            glowB += b * gW;
            glowWeight += gW;
          }
        }

        if (totalWeight <= 0 || lumCount <= 0) {
          resolve(DEFAULT_ATMOSPHERE);
          return;
        }

        const avgR = sumR / totalWeight;
        const avgG = sumG / totalWeight;
        const avgB = sumB / totalWeight;
        const avgLum = lumSum / lumCount;

        // Blend user photo highlights 45% with royal antique gold (230, 195, 126)
        const baseGlowR = glowWeight > 0 ? glowR / glowWeight : avgR;
        const baseGlowG = glowWeight > 0 ? glowG / glowWeight : avgG;
        const baseGlowB = glowWeight > 0 ? glowB / glowWeight : avgB;

        const mixedGlowR = clampChannel(baseGlowR * 0.52 + 230 * 0.48);
        const mixedGlowG = clampChannel(baseGlowG * 0.52 + 195 * 0.48);
        const mixedGlowB = clampChannel(baseGlowB * 0.52 + 126 * 0.48);

        resolve({
          dominantRgb: `${clampChannel(avgR)}, ${clampChannel(avgG)}, ${clampChannel(avgB)}`,
          glowRgb: `${mixedGlowR}, ${mixedGlowG}, ${mixedGlowB}`,
          luminance: Number(avgLum.toFixed(3)),
        });
      } catch {
        resolve(DEFAULT_ATMOSPHERE);
      }
    };

    img.onerror = () => resolve(DEFAULT_ATMOSPHERE);
    img.src = dataUrl;
  });
}
