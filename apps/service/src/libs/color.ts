/**
 * HSL色空間の値
 */
export type HSL = {
  /** 色相 (0-360) */
  h: number;
  /** 彩度 (0-100) */
  s: number;
  /** 明度 (0-100) */
  l: number;
};

/**
 * RGB値をHSL色空間に変換
 * @param r 赤 (0-1)
 * @param g 緑 (0-1)
 * @param b 青 (0-1)
 * @returns HSL値
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}
