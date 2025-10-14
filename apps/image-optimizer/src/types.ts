/**
 * 画像の次元情報
 */
export type ImageDimensions = {
  width: number;
  height: number;
};

/**
 * 画像バリアント（オリジナル + サムネイル）
 */
export type ImageVariants = {
  original: {
    data: ArrayBuffer;
  };
  thumbnail: {
    data: ArrayBuffer;
  };
  dimensions: ImageDimensions;
};
