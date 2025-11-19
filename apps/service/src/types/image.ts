export type ImageDimensions = {
  width: number;
  height: number;
};

export type ImageVariants = {
  original: {
    data: ArrayBuffer;
  };
  thumbnail: {
    data: ArrayBuffer;
  };
  dimensions: ImageDimensions;
};
