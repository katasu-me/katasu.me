/**
 * セキュリティヘッダーを生成する
 * @param csp CSPヘッダー文字列
 * @param isDev 開発環境かどうか
 * @returns セキュリティヘッダーのレコード
 */
export function getSecurityHeaders(csp: string, isDev: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  // 本番環境のみHSTSを有効化
  if (!isDev) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}
