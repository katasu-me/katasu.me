/**
 * 画像を読み込んでHTMLImageElementを返す
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * 指定された領域で画像をクロップする
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // ボックスの幅と高さを計算
  const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  // canvasサイズを設定
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // 画像を中央に移動
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // 画像を描画
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixelsの値を抽出
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // canvasサイズをクロップサイズに設定
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // クロップした画像データを貼り付け
  ctx.putImageData(data, 0, 0);

  // Blobとして返す
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

/**
 * 角度をラジアンに変換
 */
function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}
