/**
 * CSPディレクティブを構築する
 * @param nonce nonce文字列
 * @param isDev 開発環境かどうか
 * @returns CSPヘッダー文字列
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[] | boolean> = {
    "default-src": ["'self'"],
    "script-src": [
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // 開発環境のみ (HMR用)
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...(import.meta.env.VITE_IMAGE_R2_URL ? [import.meta.env.VITE_IMAGE_R2_URL] : []),
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://tally.so",
      // 開発環境のみ (HMR用)
      ...(isDev ? ["ws:", "wss:"] : []),
    ],
    "frame-src": ["https://tally.so"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://accounts.google.com"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": !isDev,
  };

  return Object.entries(directives)
    .map(([key, value]) => {
      if (key === "upgrade-insecure-requests") {
        return value ? "upgrade-insecure-requests" : null;
      }

      return `${key} ${(value as string[]).join(" ")}`;
    })
    .filter((value) => value !== null)
    .join("; ");
}
