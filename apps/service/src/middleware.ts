import { type NextRequest, NextResponse, userAgent } from "next/server";
import { SITE_URL } from "./constants/site";

const isDev = process.env.NODE_ENV === "development";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspList = {
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      SITE_URL,
      process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
      isDev && "'unsafe-eval'",
      isDev && "'unsafe-inline'",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", process.env.NEXT_PUBLIC_R2_URL, "data:"],
    "connect-src": ["'self'", SITE_URL, process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL],
    "font-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };

  const cspHeader = Object.entries(cspList)
    .map(([key, values]) => {
      const value = values.filter((e) => typeof e === "string").join(" ");
      return values.length === 0 ? key : `${key} ${value}`;
    })
    .join(";");

  const contentSecurityPolicyHeaderValue = `${cspHeader};`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  // デスクトップ判定
  const { device } = userAgent(request);
  const isDesktop = typeof device.type === "undefined";

  if (isDesktop) {
    requestHeaders.set("X-IS-DESKTOP", "true");
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  return response;
}
