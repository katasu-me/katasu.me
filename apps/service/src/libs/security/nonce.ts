/**
 * CSP用のnonceを生成する
 * @returns nonce
 */
export function generateNonce(): string {
  // Cloudflare Workers環境ではBufferが使えないため、btoa()を使用
  return btoa(crypto.randomUUID());
}
