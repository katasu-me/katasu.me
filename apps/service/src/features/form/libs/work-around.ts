/**
 * Android ChromeでGoogle Driveから選択した場合のワークアラウンド
 * https://stackoverflow.com/questions/62714319/attached-from-google-drivecloud-storage-in-android-file-gives-err-upload-file
 */
export const normalizeFile = async (originalFile: File): Promise<File> => {
  const blob = new Blob([await originalFile.arrayBuffer()], {
    type: originalFile.type,
  });

  return new File([blob], originalFile.name, { type: blob.type });
};
